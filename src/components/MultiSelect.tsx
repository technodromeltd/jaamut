import React, { useState, useRef, useEffect } from "react";
import { User } from "../utils/storage";
import { settings } from "../settings/settings";

interface MultiSelectProps {
  users: User[];
  selectedUserIds: string[];
  onSelectionChange: (userIds: string[]) => void;
  placeholder?: string;
  className?: string;
}

const MultiSelect: React.FC<MultiSelectProps> = ({
  users,
  selectedUserIds,
  onSelectionChange,
  placeholder = "Select participants",
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleUserToggle = (userId: string) => {
    const newSelection = selectedUserIds.includes(userId)
      ? selectedUserIds.filter((id) => id !== userId)
      : [...selectedUserIds, userId];
    onSelectionChange(newSelection);
  };

  const handleSelectAll = () => {
    onSelectionChange(users.map((user) => user.id));
  };

  const handleSelectNone = () => {
    onSelectionChange([]);
  };

  const selectedUsers = users.filter((user) =>
    selectedUserIds.includes(user.id)
  );

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Selected users display */}
      <div
        className={`p-2 ${
          isOpen ? "border-2 border-blue-500 bg-white" : ""
        } rounded w-full min-h-[40px] text-primary-bg cursor-pointer flex flex-wrap gap-1 items-center`}
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedUsers.length > 0 ? (
          selectedUsers.map((user, index) => {
            const userColor =
              settings.userColors[index % settings.userColors.length];
            return (
              <span
                key={user.id}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-secondary-button text-white"
                style={{ backgroundColor: userColor }}
              >
                {user.name}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUserToggle(user.id);
                  }}
                  className="ml-1 text-white hover:text-red-200"
                >
                  ×
                </button>
              </span>
            );
          })
        ) : (
          <span className="text-gray-500">{placeholder}</span>
        )}
        <span className="ml-auto text-white">▼</span>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border rounded shadow-lg max-h-60 overflow-y-auto">
          {/* Select all/none buttons */}
          <div className="flex gap-2 p-2 border-b">
            <button
              onClick={handleSelectAll}
              className="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Select All
            </button>
            <button
              onClick={handleSelectNone}
              className="text-xs px-2 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Select None
            </button>
          </div>

          {/* User list */}
          {users.map((user, index) => {
            const userColor =
              settings.userColors[index % settings.userColors.length];
            const isSelected = selectedUserIds.includes(user.id);

            return (
              <div
                key={user.id}
                className={`flex items-center p-2 cursor-pointer hover:bg-gray-100 ${
                  isSelected ? "bg-blue-50" : ""
                }`}
                onClick={() => handleUserToggle(user.id)}
              >
                <div
                  className="w-4 h-4 rounded-full mr-3 flex-shrink-0"
                  style={{ backgroundColor: userColor }}
                />
                <span className="flex-1 text-primary-bg">{user.name}</span>
                {isSelected && <span className="text-blue-500">✓</span>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MultiSelect;
