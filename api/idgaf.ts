import { VercelRequest, VercelResponse } from "@vercel/node";
import { OpenAI } from "openai";
import formidable from "formidable";
import fs from "fs/promises";
import sharp from "sharp";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const DEBUG = process.env.DEBUG === "true";
const RECEIPT_MODEL = process.env.OPENAI_RECEIPT_MODEL || "gpt-5-mini";
const MAX_RECEIPT_IMAGE_WIDTH = 1200;
const RECEIPT_IMAGE_QUALITY = 70;
export enum Category {
  FOOD = "Food",
  TRANSPORTATION = "Transportation",
  ENTERTAINMENT = "Entertainment",
  SHOPPING = "Shopping",
  ACCOMMODATION = "Accommodation",
  OTHER = "Other",
}
if (DEBUG) {
  console.log("Debug mode is on");
}

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  let uploadedFilePath: string | null = null;

  try {
    const startedAt = Date.now();
    const form = formidable({
      multiples: false,
      maxFiles: 1,
      allowEmptyFiles: false,
    });
    const [, files] = await form.parse(req);

    const uploadedPhoto = files.photo;
    const file = Array.isArray(uploadedPhoto) ? uploadedPhoto[0] : uploadedPhoto;
    if (!file) {
      return res.status(400).json({ error: "No image provided" });
    }

    uploadedFilePath = file.filepath;
    const imageBuffer = await fs.readFile(file.filepath);

    const resizedImageBuffer = await sharp(imageBuffer)
      .rotate()
      .resize({
        width: MAX_RECEIPT_IMAGE_WIDTH,
        fit: "inside",
        withoutEnlargement: true,
      })
      .jpeg({
        quality: RECEIPT_IMAGE_QUALITY,
        mozjpeg: true,
      })
      .toBuffer();

    const base64Image = resizedImageBuffer.toString("base64");

    const response = await openai.chat.completions.create({
      model: RECEIPT_MODEL,
      messages: [
        {
          role: "system",
          content: `You are an AI assistant that analyzes receipt images and extracts relevant information. Respond with json object in the following format:
{
message: str - short descriptive title for the transaction based on receipt like Dinner/Lunch/Breakfast/Drinks at X etc. The name of the place should be in the message if it is visible on the receipt and not too long,
details: str - more detailed description of the transaction like what was bought and where,
amount: float - total sum with 2 decimal places,
currency: str - "EUR" | "USD" | "WON,
category: str - optional, one of the following: ${Object.values(Category).join(
            ", "
          )},   
datetime: Date of purchase,
participants: [] - empty array, will be populated by frontend
}`,
        },
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`,
              },
            },
          ],
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0,
    });

    const aiResponse = response.choices[0].message.content;
    const parsedResponse = aiResponse ? JSON.parse(aiResponse) : null;
    if (!parsedResponse) {
      console.error("Error parsing AI response: Response is null or undefined");
      return res.status(500).json({ error: "Failed to parse AI response" });
    }

    if (DEBUG) {
      console.log("Receipt processed", {
        originalBytes: imageBuffer.length,
        resizedBytes: resizedImageBuffer.length,
        durationMs: Date.now() - startedAt,
        model: RECEIPT_MODEL,
      });
    }

    return res.status(200).json(parsedResponse);
  } catch (error) {
    console.error("Error processing image:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  } finally {
    if (uploadedFilePath) {
      await fs.unlink(uploadedFilePath).catch(console.error);
    }
  }
}
