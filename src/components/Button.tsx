import React, { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant: "primary" | "secondary";
  fullWidth?: boolean;
  isSubmit?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant,
  fullWidth = false,
  className = "",
  isSubmit = false,
  ...props
}) => {
  const baseClasses =
    "p-2 rounded-md transition-colors duration-200 ease-in-out";
  const variantClasses = {
    primary:
      "bg-primary-button hover:bg-opacity-80 text-white active:bg-primary-button active:bg-primary-button-active",
    secondary:
      "border border-solid border-white hover:bg-opacity-80 text-white active:bg-secondary-button active:bg-secondary-button-active",
  };
  const OLD_variantClasses = {
    primary: "bg-primary-button hover:bg-[#626B61] text-white",
    secondary: "bg-secondary-button hover:bg-[#7A8687] text-white ",
  };
  const widthClass = fullWidth ? "w-full" : "";

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${widthClass} ${className}`}
      type={isSubmit ? "submit" : "button"}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
