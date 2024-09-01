import React from "react";
import { useParams } from "react-router-dom";
import { User } from "../utils/storage";
import GroupLayout from "./GroupLayout";
import Button from "./Button";
import { settings } from "../settings/settings";
import { FaShare } from "react-icons/fa";
import Toast from "./Toast";

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
  const [showToast, setShowToast] = React.useState(false);
  const [toastMessage, setToastMessage] = React.useState("");

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

  const handleShareGroup = React.useCallback(() => {
    const groupLink = `${window.location.origin}/group/${groupId}`;

    if (navigator.share) {
      navigator
        .share({
          title: `Join ${groupName} on Jaamut App`,
          text: `Join our group "${groupName}" on Jaamut to easily split the travel expenses!`,
          url: groupLink,
        })
        .catch(console.error);
    } else {
      navigator.clipboard
        .writeText(groupLink)
        .then(() => {
          setShowToast(true);
          setToastMessage("Group link copied to clipboard!");
        })
        .catch(console.error);
    }
  }, [groupId, groupName]);

  const handleCopyGroupCode = React.useCallback(() => {
    navigator.clipboard
      .writeText(groupId!)
      .then(() => {
        setShowToast(true);
        setToastMessage("Group code copied to clipboard!");
      })
      .catch(console.error);
  }, [groupId]);

  const handleCloseToast = React.useCallback(() => {
    setShowToast(false);
  }, []);

  return (
    <GroupLayout groupId={groupId!} groupName={groupName}>
      <div className="mb-4">
        <h1 className="text-2xl font-bold my-2">Group Settings</h1>
        <h2 className="text-xl font-semibold my-2">Users</h2>

        <ul className="space-y-4">
          {users.map((user, index) => {
            const userColor =
              settings.userColors[index % settings.userColors.length];
            return (
              <li
                key={user.id}
                className="flex items-center p-2 bg-gray-100 rounded"
              >
                <div
                  className="w-4 h-4 rounded-full mr-3 flex-shrink-0"
                  style={{ backgroundColor: userColor }}
                ></div>
                <span className="text-primary-button">{user.name}</span>
              </li>
            );
          })}
        </ul>
        <h2 className="text-xl font-semibold my-2">Add User</h2>
        <form onSubmit={handleAddUser} className="flex mt-4">
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

        <h2 className="text-xl font-semibold my-2">Share Group</h2>
        <div className="my-4 flex flex-col gap-4">
          <Button onClick={handleShareGroup} variant="secondary">
            Share link to the group
          </Button>
          <Button onClick={handleCopyGroupCode} variant="secondary">
            Copy group code
          </Button>
        </div>
      </div>
      {showToast && (
        <Toast message={toastMessage} type="info" onClose={handleCloseToast} />
      )}
    </GroupLayout>
  );
};

export default GroupSettings;
