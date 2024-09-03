const blueTheme = {
  colors: {
    "primary-bg": "#5271ff", // Dark blue
    "primary-text": "#ffffff", // White
    "primary-button": "#4E5340", // Bright blue
    "secondary-button": "#8AE1FC", // Green
    "danger-button": "#ef4444", // Red
    "secondary-text": "#8AE1FC", // Bright blue
  },
};
const customTheme = {
  colors: {
    "primary-bg": "#628396",
    "primary-text": "#fff",
    // "primary-text": "#75919fff",
    "primary-button": "#2f5782ff",
    "primary-button-active": "#98B3B8",
    "secondary-button": "#9dbdc0ff",
    "danger-button": "#a59ea3ff",
  },
};

const defaultTheme = {
  colors: {
    "primary-bg": "#4E5340", // Dark blue
    "primary-text": "#ffffff", // White
    "primary-button": "#95A3A4", // Bright blue
    "secondary-button": "#697268", // Green
    "danger-button": "#ef4444", // Red
    "secondary-text": "#4E5340", // Bright blue
  },
};

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: customTheme.colors,
      screens: {
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1536px",
      },
    },
  },
  plugins: [],
};
