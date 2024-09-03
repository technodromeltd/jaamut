import React from "react";
import { Link } from "react-router-dom";
import logoSmall from "../assets/logo_small.png";

interface NavBarProps {
  headerText?: string;
}

const NavBar: React.FC<NavBarProps> = ({ headerText = "WANDERWALLET" }) => {
  return (
    <nav className="flex items-center justify-between p-4 bg-primary-bg">
      <Link to="/">
        <img src={logoSmall} alt="Logo" className="h-8" />
      </Link>
      <h1 className="text-white text-xl">{headerText}</h1>
    </nav>
  );
};

export default NavBar;
