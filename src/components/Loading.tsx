import React from "react";
import { FaSpinner } from "react-icons/fa";

const Loading: React.FC = () => {
  return (
    <div className="flex items-center justify-center h-screen w-screen fixed top-0 left-0">
      <FaSpinner className="animate-spin text-6xl text-primary-button" />
    </div>
  );
};

export default Loading;
