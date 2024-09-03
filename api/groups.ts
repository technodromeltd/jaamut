import { VercelRequest, VercelResponse } from "@vercel/node";
const { kv } = require("@vercel/kv");

const GROUP_PREFIX = "group:";

interface Group {
  id: string;
  name: string;
  users: any[];
  transactions: any[];
  lastAccessed: number;
  defaultCurrency: string; // Add this line
}

// ... existing code ...

const readGroup = async (id: string): Promise<Group | null> => {
  try {
    return (await kv.get(`${GROUP_PREFIX}${id}`)) as Group | null;
  } catch (error) {
    console.error("Error reading group from Vercel KV:", error);
    return null;
  }
};

const writeGroup = async (group: Group): Promise<void> => {
  try {
    await kv.set(`${GROUP_PREFIX}${group.id}`, group);
  } catch (error) {
    console.error("Error writing group to Vercel KV:", error);
  }
};

const getAllGroupIds = async (): Promise<string[]> => {
  try {
    return (await kv.keys(`${GROUP_PREFIX}*`)) as string[];
  } catch (error) {
    console.error("Error fetching group IDs from Vercel KV:", error);
    return [];
  }
};

module.exports = async (req: VercelRequest, res: VercelResponse) => {
  console.log("API route hit:", req.method, req.url);
  const { method, query } = req;

  switch (method) {
    case "GET":
      if (query.id) {
        const group = await readGroup(query.id as string);
        if (group) {
          res.status(200).json(group);
        } else {
          res.status(404).json({ error: "Group not found" });
        }
      } else {
        res.status(400).json({ error: "Group ID is required" });
      }
      break;
    case "POST":
      const newGroup = req.body as Group;
      if (!newGroup.defaultCurrency) {
        newGroup.defaultCurrency = "EUR"; // Set a default value if not provided
      }
      await writeGroup(newGroup);
      res.status(201).json(newGroup);
      break;
    default:
      res.setHeader("Allow", ["GET", "POST"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
};
