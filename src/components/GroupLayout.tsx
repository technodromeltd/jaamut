import React, { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import Button from "./Button";
import { HiArrowLeft } from "react-icons/hi"; // Import the icon

interface GroupLayoutProps {
  groupId: string;
  groupName: string;
  children: React.ReactNode;
}

const GroupLayout: React.FC<GroupLayoutProps> = ({
  groupId,
  groupName,
  children,
}) => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const currentPath = useLocation().pathname;
  const groupPath = `/groups/${groupId}`;
  const isSubPath =
    currentPath.startsWith(groupPath) && currentPath !== groupPath;

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-primary-text">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Button
              variant="primary"
              onClick={() => navigate(isSubPath ? `/groups/${groupId}` : "/")}
              className="mr-2"
            >
              <HiArrowLeft aria-hidden="true" />
              <span className="sr-only">Back</span>
            </Button>
            <h1 className="text-2xl font-bold">{groupName}</h1>
          </div>
          <Button variant="primary" onClick={toggleMenu} className="sm:hidden">
            {isMenuOpen ? "✕" : "☰"}
          </Button>
        </div>
        <nav
          className={`${isMenuOpen ? "block" : "hidden"} sm:block mt-4 sm:mt-0`}
        >
          <Link
            to={`/groups/${groupId}`}
            className="block sm:inline-block mb-2 sm:mb-0 sm:mr-2"
          >
            <Button variant="secondary" fullWidth>
              Transactions
            </Button>
          </Link>
          <Link
            to={`/groups/${groupId}/settle`}
            className="block sm:inline-block mb-2 sm:mb-0 sm:mr-2"
          >
            <Button variant="secondary" fullWidth>
              Score
            </Button>
          </Link>
          <Link
            to={`/groups/${groupId}/settings`}
            className="block sm:inline-block"
          >
            <Button variant="secondary" fullWidth>
              Settings
            </Button>
          </Link>
        </nav>
      </div>
      {children}
    </div>
  );
};

export default GroupLayout;
