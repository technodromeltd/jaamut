import { VercelRequest, VercelResponse } from "@vercel/node";
import { kv } from "../lib/kv";

const GROUP_PREFIX = "group:";

interface Group {
  id: string;
  name: string;
  users: any[];
  transactions: any[];
  lastAccessed: number;
  defaultCurrency: string;
}

const readGroup = async (groupId: string): Promise<Group | null> => {
  try {
    const groupData = (await kv.get(`${GROUP_PREFIX}${groupId}`)) as
      | Group
      | null;
    return groupData;
  } catch (error) {
    console.error("Error reading group:", error);
    return null;
  }
};

const writeGroup = async (group: Group): Promise<void> => {
  try {
    await kv.set(`${GROUP_PREFIX}${group.id}`, group);
  } catch (error) {
    console.error("Error writing group:", error);
    throw error;
  }
};

const getAllGroups = async (): Promise<Group[]> => {
  try {
    const keys = await kv.keys(`${GROUP_PREFIX}*`);
    const groups: Group[] = [];

    for (const key of keys) {
      const groupId = key.replace(GROUP_PREFIX, "");
      const group = await readGroup(groupId);
      if (group) {
        groups.push(group);
      }
    }

    return groups;
  } catch (error) {
    console.error("Error getting all groups:", error);
    return [];
  }
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { groupId, defaultToAllUsers = true } = req.body;

    if (groupId) {
      // Migrate specific group
      const group = await readGroup(groupId);
      if (!group) {
        return res.status(404).json({ error: "Group not found" });
      }

      const updatedTransactions = group.transactions.map((transaction: any) => {
        if (!transaction.participants) {
          return {
            ...transaction,
            participants: defaultToAllUsers
              ? group.users.map((user: any) => user.id)
              : [transaction.userId],
          };
        }
        return transaction;
      });

      const updatedGroup = {
        ...group,
        transactions: updatedTransactions,
      };

      await writeGroup(updatedGroup);

      return res.status(200).json({
        message: `Successfully migrated ${updatedTransactions.length} transactions in group ${groupId}`,
        migratedTransactions: updatedTransactions.length,
        groupId,
      });
    } else {
      // Migrate all groups
      const groups = await getAllGroups();
      console.log("Migrating", groups.length, "groups");
      let totalMigrated = 0;
      const results: any[] = [];

      for (const group of groups) {
        console.log("Migrating group", group.id);
        console.log("Group has", group.transactions.length, "transactions");
        const updatedTransactions = group.transactions.map(
          (transaction: any) => {
            if (!transaction.participants) {
              console.log("Migrating transaction", transaction.id);
              return {
                ...transaction,
                participants: defaultToAllUsers
                  ? group.users.map((user: any) => user.id)
                  : [transaction.userId],
              };
            }
            return transaction;
          }
        );

        if (updatedTransactions.length === group.transactions.length) {
          const updatedGroup = {
            ...group,
            transactions: updatedTransactions,
          };

          await writeGroup(updatedGroup);
          totalMigrated += updatedTransactions.length;

          results.push({
            groupId: group.id,
            groupName: group.name,
            migratedTransactions: updatedTransactions.length,
          });
        }
      }

      return res.status(200).json({
        message: `Successfully migrated ${totalMigrated} transactions across ${results.length} groups`,
        totalMigrated,
        groupsMigrated: results.length,
        results,
      });
    }
  } catch (error) {
    console.error("Error during migration:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
