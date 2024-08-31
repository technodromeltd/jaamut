import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { saveGroup, getRecentGroups } from "../utils/storage";
import Button from "./Button";

const Home: React.FC = () => {
  const [newGroupName, setNewGroupName] = useState("");
  const [initialUsers, setInitialUsers] = useState("");
  const [recentGroups, setRecentGroups] = useState<
    { id: string; name: string }[]
  >([]);
  const navigate = useNavigate();

  useEffect(() => {
    setRecentGroups(getRecentGroups());
  }, []);

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newGroupName.trim() && initialUsers.trim()) {
      const users = initialUsers.split(",").map((name) => ({
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name: name.trim(),
      }));
      const groupId = await saveGroup({
        name: newGroupName.trim(),
        users,
        transactions: [],
      });
      navigate(`/groups/${groupId}`);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-center mb-8">
        <img src="./logo.png" alt="Bill Splitter Logo" className="h-32" />
      </div>
      <form onSubmit={handleCreateGroup} className="space-y-4 mb-8">
        <input
          type="text"
          value={newGroupName}
          onChange={(e) => setNewGroupName(e.target.value)}
          placeholder="Enter new group name"
          className="p-2 border rounded w-full bg-white text-primary-bg"
          required
        />
        <input
          type="text"
          value={initialUsers}
          onChange={(e) => setInitialUsers(e.target.value)}
          placeholder="Enter initial users (comma-separated)"
          className="p-2 border rounded w-full bg-white text-primary-bg"
          required
        />
        <Button type="submit" variant="primary" fullWidth>
          Create Group
        </Button>
      </form>

      {recentGroups.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-2">Recent Groups</h2>
          <ul className="space-y-2">
            {recentGroups.map((group) => (
              <li key={group.id}>
                <Button
                  onClick={() => navigate(`/groups/${group.id}`)}
                  variant="secondary"
                  fullWidth
                >
                  {group.name}
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Home;
