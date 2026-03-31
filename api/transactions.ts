import { VercelRequest, VercelResponse } from "@vercel/node";
import {
  describeKvConnectivityError,
  isKvConfigError,
  isKvConnectivityFailure,
  KV_SETUP_HINT,
  kv,
} from "../lib/kv";

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
  return (await kv.get(`${GROUP_PREFIX}${id}`)) as Group | null;
};

const writeGroup = async (group: Group): Promise<void> => {
  await kv.set(`${GROUP_PREFIX}${group.id}`, group);
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
        const group = await readGroup(groupId);
        if (!group) {
          return res.status(404).json({ error: "Group not found" });
        }

        const updatedGroup = {
          ...group,
          transactions: [...group.transactions, transaction],
          lastAccessed: Date.now(),
        };

        await writeGroup(updatedGroup);

        res.status(201).json(transaction);
      } catch (error) {
        console.error("Error adding transaction:", error);
        const raw =
          error instanceof Error ? error.message : "";
        const configErr = isKvConfigError(raw);
        res.status(configErr ? 503 : 500).json({
          error: configErr
            ? KV_SETUP_HINT
            : isKvConnectivityFailure(error)
              ? describeKvConnectivityError(error)
              : "Failed to add transaction",
        });
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
        const group = await readGroup(deleteGroupId as string);
        if (!group) {
          return res.status(404).json({ error: "Group not found" });
        }

        const updatedGroup = {
          ...group,
          transactions: group.transactions.filter(
            (t) => t.id !== parseInt(transactionId as string)
          ),
          lastAccessed: Date.now(),
        };

        await writeGroup(updatedGroup);

        res.status(200).json({ message: "Transaction deleted successfully" });
      } catch (error) {
        console.error("Error deleting transaction:", error);
        const raw =
          error instanceof Error ? error.message : "";
        const configErr = isKvConfigError(raw);
        res.status(configErr ? 503 : 500).json({
          error: configErr ? KV_SETUP_HINT : "Failed to delete transaction",
        });
      }
      break;

    default:
      res.setHeader("Allow", ["POST", "DELETE"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
};
