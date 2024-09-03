import { VercelRequest, VercelResponse } from "@vercel/node";
import { OpenAI } from "openai";
import formidable from "formidable";
import fs from "fs/promises";
import sharp from "sharp"; // Import sharp for image processing

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const DEBUG = process.env.DEBUG === "true";
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

  try {
    const form = formidable();
    const [_, files] = await form.parse(req);

    const file = files.photo?.[0];
    if (!file) {
      return res.status(400).json({ error: "No image provided" });
    }

    const imageBuffer = await fs.readFile(file.filepath);

    // Resize the image before processing
    const resizedImageBuffer = await sharp(imageBuffer)
      .resize(800) // Resize to a width of 800 pixels, maintaining aspect ratio
      .toBuffer();

    const base64Image = resizedImageBuffer.toString("base64");

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are an AI assistant that analyzes receipt images and extracts relevant information. Respond with json object in the following format:
{
message: str - short descriptive title for the transaction based on receipt like Dinner at X etc,
details: str - description of the transaction like what was bought and where,
amount: float - total sum with 2 decimal places,
currency: str - "EUR" | "USD" | "WON,
category: str - optional, one of the following: ${Object.values(Category).join(
            ", "
          )},   
datetime: Date of purchase 
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
      max_tokens: 300,
      response_format: { type: "json_object" },
    });

    const aiResponse = response.choices[0].message.content;
    const parsedResponse = aiResponse ? JSON.parse(aiResponse) : null;
    if (!parsedResponse) {
      console.error("Error parsing AI response: Response is null or undefined");
      return res.status(500).json({ error: "Failed to parse AI response" });
    }

    return res.status(200).json(parsedResponse);
  } catch (error) {
    console.error("Error processing image:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  } finally {
    // Clean up temporary files
    const form = formidable();
    const [_, files] = await form.parse(req);
    if (files) {
      for (const fileArray of Object.values(files)) {
        if (fileArray) {
          for (const file of fileArray) {
            await fs.unlink(file.filepath).catch(console.error);
          }
        }
      }
    }
  }
}
