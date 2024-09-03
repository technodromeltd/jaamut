import React, { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import Button from "./Button";
import { useSwipeable } from "react-swipeable";
import logoSmall from "../assets/logo_small.png";
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
  const groupLinksArray = [
    `/groups/${groupId}`,
    `/groups/${groupId}/transactions`,
    `/groups/${groupId}/score`,
    `/groups/${groupId}/settings`,
  ];
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const currentPath = useLocation().pathname;
  const [currentIndex, setCurrentIndex] = useState(
    groupLinksArray.indexOf(currentPath)
  );

  const handlers = useSwipeable({
    onSwipedLeft: () => {
      const nextIndex = (currentIndex + 1) % groupLinksArray.length;
      setCurrentIndex(nextIndex);
      navigate(groupLinksArray[nextIndex]);
    },
    onSwipedRight: () => {
      const prevIndex =
        (currentIndex - 1 + groupLinksArray.length) % groupLinksArray.length;
      setCurrentIndex(prevIndex);
      navigate(groupLinksArray[prevIndex]);
    },
  });
  return (
    <div
      className="container mx-auto px-4 py-2 h-full overflow-x-hidden"
      {...handlers}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 mb-2 border-b border-primary-text">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link to="/">
              <img
                src={logoSmall}
                alt="WanderWallet Logo"
                className="h-10 mr-2 p-1 rounded-md bg-[#7694A2]"
              />
            </Link>
            <h1>{groupName}</h1>
          </div>
          <span
            onClick={toggleMenu}
            className="sm:hidden text-2xl cursor-pointer flex items-center mt-[-0.5rem]" // Added flex and items-center for vertical alignment
          >
            {isMenuOpen ? "✕" : "☰"}
          </span>
        </div>
        <nav
          className={`${isMenuOpen ? "block" : "hidden"} sm:block mt-4 sm:mt-0`}
        >
          <Link
            to={`/groups/${groupId}`}
            className="block sm:inline-block mb-2 sm:mb-0 sm:mr-2"
            onClick={toggleMenu} // Close menu on click
          >
            <Button variant="secondary" fullWidth>
              Add
            </Button>
          </Link>
          <Link
            to={`/groups/${groupId}/transactions`}
            className="block sm:inline-block mb-2 sm:mb-0 sm:mr-2"
            onClick={toggleMenu} // Close menu on click
          >
            <Button variant="secondary" fullWidth>
              Transactions
            </Button>
          </Link>
          <Link
            to={`/groups/${groupId}/score`}
            className="block sm:inline-block mb-2 sm:mb-0 sm:mr-2"
            onClick={toggleMenu} // Close menu on click
          >
            <Button variant="secondary" fullWidth>
              Score
            </Button>
          </Link>
          <Link
            to={`/groups/${groupId}/settings`}
            className="block sm:inline-block"
            onClick={toggleMenu} // Close menu on click
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
