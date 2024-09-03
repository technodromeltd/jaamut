import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { saveGroup } from "../../utils/storage";
import Button from "../../components/Button";
import NavBar from "../../components/NavBar";

const CreateGroup: React.FC = () => {
  const [newGroupName, setNewGroupName] = useState("");
  const [initialUsers, setInitialUsers] = useState("");
  const navigate = useNavigate();

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
        defaultCurrency: "EUR",
      });
      navigate(`/groups/${groupId}`);
    }
  };

  return (
    <div>
      <NavBar headerText="Create a new group" />
      <div className="mx-auto px-4 flex flex-col justify-center h-screen w-full">
        <form onSubmit={handleCreateGroup} className="space-y-4 ">
          <input
            type="text"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            placeholder="Group name"
            className="p-2 border rounded w-full bg-white text-primary-bg"
            required
          />
          <input
            type="text"
            value={initialUsers}
            onChange={(e) => setInitialUsers(e.target.value)}
            placeholder="Users (comma-separated)"
            className="p-2 border rounded w-full bg-white text-primary-bg"
            required
          />
          <Button type="submit" variant="primary" fullWidth>
            Create Group
          </Button>
        </form>
      </div>
    </div>
  );
};

export default CreateGroup;
