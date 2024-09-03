import React from "react";
import splash from "../assets/splash_bg.png";
import logo from "../assets/logo.png"; // Import the logo
import "./SplashScreen.css"; // Import the CSS file

const SplashScreen: React.FC = () => {
  return (
    <div className="w-full h-full relative overflow-hidden flex  flex-col items-center justify-center">
      <div
        className="w-full h-full bg-cover object-cover bg-center zoom-out " // Add the zoom-out class
        style={{ backgroundImage: `url(${splash})` }}
        role="img"
        aria-label="Splash"
      />
      <img
        src={logo}
        alt="Logo"
        className=" absolute left-1/2 transform -translate-x-1/2 w-2/3 animate-slide-up"
      />
    </div>
  );
};

export default SplashScreen;
