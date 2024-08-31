import React, { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant: "primary" | "secondary";
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant,
  fullWidth = false,
  className = "",
  ...props
}) => {
  const baseClasses =
    "text-white p-2 rounded transition-colors duration-200 ease-in-out";
  const variantClasses = {
    primary: "bg-primary-button hover:bg-[#626B61]",
    secondary: "bg-secondary-button hover:bg-[#7A8687]",
  };
  const widthClass = fullWidth ? "w-full" : "";

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${widthClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
