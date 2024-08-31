import axios from "axios";

const API_URL = "http://localhost:3001";
const RECENT_GROUPS_KEY = "recentGroups";

export interface User {
  id: string;
  name: string;
}

export interface Transaction {
  id: number;
  amount: number;
  currency: string;
  message: string;
  userId: string;
  datetime: string;
}

export interface GroupData {
  id: string;
  name: string;
  users: User[];
  transactions: Transaction[];
  lastAccessed: number;
}

// Helper function to generate a unique group ID
const generateGroupId = (name: string): string => {
  const camelCasedName = name
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) =>
      index === 0 ? word.toLowerCase() : word.toUpperCase()
    )
    .replace(/\s+/g, "");
  const timestamp = Date.now();
  return `${camelCasedName}_${timestamp}`;
};

export const saveGroup = async (
  groupData: Omit<GroupData, "id" | "lastAccessed">
): Promise<string> => {
  const groupId = generateGroupId(groupData.name);
  try {
    await axios.post(`${API_URL}/groups`, {
      ...groupData,
      id: groupId,
      lastAccessed: Date.now(),
    });
    addRecentGroup(groupId, groupData.name);
    return groupId;
  } catch (error) {
    console.error("Error saving group:", error);
    throw error;
  }
};

export const updateGroup = async (
  groupId: string,
  groupData: Omit<GroupData, "id">
): Promise<void> => {
  try {
    await axios.put(`${API_URL}/groups/${groupId}`, {
      ...groupData,
      id: groupId,
      lastAccessed: Date.now(),
    });
    addRecentGroup(groupId, groupData.name);
  } catch (error) {
    console.error("Error updating group:", error);
    throw error;
  }
};

export const getGroup = async (groupId: string): Promise<GroupData | null> => {
  try {
    const response = await axios.get(`${API_URL}/groups/${groupId}`);
    if (response.data) {
      addRecentGroup(groupId, response.data.users[0]?.name || "Unnamed Group");
    }
    return response.data || null;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return null;
    }
    console.error("Error getting group:", error);
    throw error;
  }
};

export const addRecentGroup = (groupId: string, groupName: string) => {
  const recentGroups = getRecentGroups();
  const updatedGroups = [
    { id: groupId, name: groupName },
    ...recentGroups.filter((group) => group.id !== groupId),
  ].slice(0, 5); // Keep only the 5 most recent groups
  localStorage.setItem(RECENT_GROUPS_KEY, JSON.stringify(updatedGroups));
};

export const getRecentGroups = (): { id: string; name: string }[] => {
  const groups = localStorage.getItem(RECENT_GROUPS_KEY);
  return groups ? JSON.parse(groups) : [];
};

export const deleteTransaction = async (
  groupId: string,
  transactionId: number
): Promise<void> => {
  try {
    const group = await getGroup(groupId);
    if (group) {
      const updatedTransactions = group.transactions.filter(
        (t) => t.id !== transactionId
      );
      await updateGroup(groupId, {
        ...group,
        transactions: updatedTransactions,
      });
    }
  } catch (error) {
    console.error("Error deleting transaction:", error);
    throw error;
  }
};

// Remove saveLastGroup and getLastGroup functions as they're no longer needed
