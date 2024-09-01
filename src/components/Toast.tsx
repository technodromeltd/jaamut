import React, { useState, useEffect } from "react";

interface ToastProps {
  message: string;
  type: "info" | "error";
  duration?: number;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({
  message,
  type,
  duration = 3000,
  onClose,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!isVisible) return null;

  const baseClasses =
    "absolute bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-md shadow-md transition-opacity duration-300";
  const typeClasses =
    type === "error" ? "bg-red-500 text-white" : "bg-blue-500 text-white";

  return <div className={`${baseClasses} ${typeClasses}`}>{message}</div>;
};

export default Toast;
