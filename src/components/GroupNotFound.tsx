import React from "react";
import { Link } from "react-router-dom";
import Button from "./Button";
import { HiOutlineEmojiSad } from "react-icons/hi";

const GroupNotFound: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-primary-bg text-primary-text p-4 text-center">
      <HiOutlineEmojiSad className="text-6xl mb-4" />
      <h1 className="text-3xl font-bold mb-4">Oops! Group Not Found</h1>
      <p className="text-xl mb-8">
        The group you're looking for doesn't exist or has been deleted.
      </p>
      <Link to="/">
        <Button variant="primary">Go to Home Page</Button>
      </Link>
    </div>
  );
};

export default GroupNotFound;
