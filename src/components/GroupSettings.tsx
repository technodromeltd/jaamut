import React from "react";
import { useParams } from "react-router-dom";
import { User } from "../utils/storage";
import GroupLayout from "./GroupLayout";
import Button from "./Button";
import { FaUser } from "react-icons/fa";
interface GroupSettingsProps {
  users: User[];
  onAddUser: (user: User) => void;
  groupName: string;
}

const GroupSettings: React.FC<GroupSettingsProps> = ({
  users,
  onAddUser,
  groupName,
}) => {
  const { groupId } = useParams<{ groupId: string }>();
  const [newUser, setNewUser] = React.useState("");

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (newUser.trim()) {
      const newUserObj: User = {
        id: Date.now().toString(),
        name: newUser.trim(),
      };
      onAddUser(newUserObj);
      setNewUser("");
    }
  };

  return (
    <GroupLayout groupId={groupId!} groupName={groupName}>
      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2">Users</h2>
        <form onSubmit={handleAddUser} className="flex mb-2">
          <input
            type="text"
            value={newUser}
            onChange={(e) => setNewUser(e.target.value)}
            placeholder="Enter user name"
            className="p-2 border rounded flex-grow mr-2"
          />
          <Button type="submit" variant="primary">
            Add User
          </Button>
        </form>
        <ul className="space-y-2">
          {users.map((user) => (
            <li
              key={user.id}
              className="flex items-center p-2 bg-gray-100 rounded"
            >
              {/* Replace FaUser with a simple user icon or import it if needed */}
              <FaUser className="mr-2 text-gray-600" />
              <span className="text-primary-button">{user.name}</span>
            </li>
          ))}
        </ul>
      </div>
    </GroupLayout>
  );
};

export default GroupSettings;
