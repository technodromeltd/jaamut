/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "primary-bg": "#4E5340", // Dark blue
        "primary-text": "#ffffff", // White
        "primary-button": "#95A3A4", // Bright blue
        "secondary-button": "#697268", // Green
        "danger-button": "#ef4444", // Red
        "secondary-text": "#4E5340", // Bright blue
      },
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
