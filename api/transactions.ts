import { VercelRequest, VercelResponse } from "@vercel/node";
const { kv } = require("@vercel/kv");

const GROUP_PREFIX = "group:";

interface Transaction {
  id: number;
  amount: number;
  currency: string;
  message: string;
  details: string;
  userId: string;
  datetime: string;
  category: string;
  participants: string[];
}

interface Group {
  id: string;
  name: string;
  users: any[];
  transactions: Transaction[];
  lastAccessed: number;
  defaultCurrency: string;
}

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

module.exports = async (req: VercelRequest, res: VercelResponse) => {
  console.log("Transactions API route hit:", req.method, req.url);
  const { method, query } = req;

  switch (method) {
    case "POST":
      const { groupId, transaction } = req.body;

      if (!groupId || !transaction) {
        return res
          .status(400)
          .json({ error: "Group ID and transaction are required" });
      }

      try {
        // Read the current group
        const group = await readGroup(groupId);
        if (!group) {
          return res.status(404).json({ error: "Group not found" });
        }

        // Add the new transaction to the group
        const updatedGroup = {
          ...group,
          transactions: [...group.transactions, transaction],
          lastAccessed: Date.now(),
        };

        // Write the updated group back
        await writeGroup(updatedGroup);

        res.status(201).json(transaction);
      } catch (error) {
        console.error("Error adding transaction:", error);
        res.status(500).json({ error: "Failed to add transaction" });
      }
      break;

    case "DELETE":
      const { groupId: deleteGroupId, transactionId } = query;

      if (!deleteGroupId || !transactionId) {
        return res
          .status(400)
          .json({ error: "Group ID and transaction ID are required" });
      }

      try {
        // Read the current group
        const group = await readGroup(deleteGroupId as string);
        if (!group) {
          return res.status(404).json({ error: "Group not found" });
        }

        // Remove the transaction from the group
        const updatedGroup = {
          ...group,
          transactions: group.transactions.filter(
            (t) => t.id !== parseInt(transactionId as string)
          ),
          lastAccessed: Date.now(),
        };

        // Write the updated group back
        await writeGroup(updatedGroup);

        res.status(200).json({ message: "Transaction deleted successfully" });
      } catch (error) {
        console.error("Error deleting transaction:", error);
        res.status(500).json({ error: "Failed to delete transaction" });
      }
      break;

    default:
      res.setHeader("Allow", ["POST", "DELETE"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
};
