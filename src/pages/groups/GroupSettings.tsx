import React from "react";
import { useParams } from "react-router-dom";
import { User } from "../../utils/storage";
import Button from "../../components/Button";
import { settings } from "../../settings/settings";
import Toast from "../../components/Toast";
import CurrencySelector from "../../components/CurrencySelector";
import { Currency } from "../../utils/currencyConversion";

interface GroupSettingsProps {
  users: User[];
  onAddUser: (user: User) => void;
  groupName: string;
  defaultCurrency: string;
  onUpdateDefaultCurrency: (currency: Currency) => void;
}

const GroupSettings: React.FC<GroupSettingsProps> = ({
  users,
  onAddUser,
  groupName,
  defaultCurrency,
  onUpdateDefaultCurrency,
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
          title: `Join ${groupName} on WanderWallet`,
          text: `Join "${groupName}" on WanderWallet to easily split the travel expenses!`,
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
    <div className="mb-4">
      <h1>Group Settings</h1>
      <p>You can add users to the group and share the group with others.</p>
      <div className="mb-4"></div>
      <h2>Group Default Currency</h2>
      <CurrencySelector
        selectedCurrency={defaultCurrency as Currency}
        onCurrencyChange={onUpdateDefaultCurrency}
        className="p-2 border rounded w-full"
      />
      <div className="mb-4"></div>
      <h2>Users</h2>
      <ul className="space-y-4">
        {users.map((user, index) => {
          const userColor =
            settings.userColors[index % settings.userColors.length];
          return (
            <li
              key={user.id}
              className="flex items-center p-2 bg-secondary-button rounded"
            >
              <div
                className="w-4 h-4 rounded-full mr-3 flex-shrink-0"
                style={{ backgroundColor: userColor }}
              ></div>
              <span className="text-primary-text">{user.name}</span>
            </li>
          );
        })}
      </ul>
      <div className="mb-4"></div>
      <h2>Add User</h2>
      <form onSubmit={handleAddUser} className="flex">
        <input
          type="text"
          value={newUser}
          onChange={(e) => setNewUser(e.target.value)}
          placeholder="Enter user name"
          className="p-2 border rounded flex-grow mr-2"
        />
        <Button type="submit" variant="primary" className="px-6">
          Add
        </Button>
      </form>
      <div className="mb-4"></div>
      <h2>Share Group</h2>
      <div className="flex flex-col gap-4">
        <p>
          Share the group with others to allow them to join.{" "}
          <b>Note that anyone with the link can join and delete the group.</b>
        </p>
        <Button onClick={handleShareGroup} variant="secondary">
          Share as link
        </Button>
        <Button onClick={handleCopyGroupCode} variant="secondary">
          Copy group code
        </Button>
      </div>
      {showToast && (
        <Toast message={toastMessage} type="info" onClose={handleCloseToast} />
      )}
    </div>
  );
};

export default GroupSettings;
