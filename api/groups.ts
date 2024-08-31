import { VercelRequest, VercelResponse } from "@vercel/node";
const { kv } = require("@vercel/kv");

const KV_KEY = "groups-data";

interface Group {
  id: string;
  name: string;
  users: any[];
  transactions: any[];
  lastAccessed: number;
}

interface Database {
  groups: Group[];
}

const readDB = async (): Promise<Database> => {
  try {
    const data = (await kv.get(KV_KEY)) as Database | null;
    return data || { groups: [] };
  } catch (error) {
    console.error("Error reading from Vercel KV:", error);
    return { groups: [] };
  }
};

const writeDB = async (data: Database): Promise<void> => {
  try {
    await kv.set(KV_KEY, data);
  } catch (error) {
    console.error("Error writing to Vercel KV:", error);
  }
};

module.exports = async (req: VercelRequest, res: VercelResponse) => {
  console.log("API route hit:", req.method, req.url);
  const { method } = req;

  switch (method) {
    case "GET":
      const db = await readDB();
      res.status(200).json(db.groups);
      break;
    case "POST":
      const newGroup = req.body as Group;
      const dbToWrite = await readDB();
      const existingGroupIndex = dbToWrite.groups.findIndex(
        (g) => g.id === newGroup.id
      );
      if (existingGroupIndex !== -1) {
        // Update existing group
        dbToWrite.groups[existingGroupIndex] = newGroup;
      } else {
        // Add new group
        dbToWrite.groups.push(newGroup);
      }
      await writeDB(dbToWrite);
      res.status(201).json(newGroup);
      break;
    default:
      res.setHeader("Allow", ["GET", "POST"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
};
