import React from "react";

interface ListItemProps {
  leftContent: React.ReactNode;
  rightContent?: React.ReactNode;
  onClick?: () => void;
}

const ListItem: React.FC<ListItemProps> = ({
  leftContent,
  rightContent,
  onClick,
}) => {
  return (
    <div
      className="flex justify-between items-center p-2 bg-secondary-button rounded cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-center">{leftContent}</div>
      <div className="flex items-center">{rightContent}</div>
    </div>
  );
};

export default ListItem;
