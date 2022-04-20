const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
  purge: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  darkMode: "class", // or 'media' or 'class'
  theme: {
    extend: {
      fontFamily: {
        sans: ["Righteous", ...defaultTheme.fontFamily.sans],
      },
      gridTemplateColumns: {
        buy: "2fr minmax(350px, 1.2fr)",
        cards: "auto 1fr",
      },
      backgroundColor: {
        "pequod-dark": "#0b0629",
        "pequod-pink": "#c923dd",
        "pequod-purple": "#891abf",
        "pequod-white": "#f2f2f2",
        "pequod-white-300": "#f2f2f20f",
        "pequod-gray": "#231e3e",
        "pequod-gray-300": "#231e3eaf",
      },
      borderColor: {
        "pequod-white": "#f2f2f2",
        "pequod-white-300": "#f2f2f20f",
        "pequod-pink": "#c923dd",
      },
      textColor: {
        "pequod-pink": "#c923dd",
      },
      colors: {
        "pequod-dark": "#0b0629",
        "pequod-pink": "#c923dd",
        "pequod-purple": "#891abf",
        "pequod-white": "#f2f2f2",
        "pequod-white-300": "#f2f2f20f",
        "pequod-white-400": "#f2f2f22e",
        "pequod-white-500": "#f2f2f2af",
        "pequod-gray": "#231e3e",
        "pequod-green": "#2EF000",
        "pequod-red": "#F00000",
      },
      borderRadius: {
        40: "40px",
        15: "15px",
        10: "10px",
      },
      width: {
        55: "55px",
      },
      height: {
        50: "50px",
        80: "80px",
        40: "40px",
        35: "35px",
      },
      maxHeight: {
        400: "400px",
      },
      minWidth: {
        55: "55px",
      },
    },
  },
  variants: {
    extend: {
      opacity: ["disabled"],
      cursor: ["disabled"],
    },
  },
  plugins: [],
};
