const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  darkMode: 'class', // or 'media' or 'class'
  theme: {
    extend: {
      fontFamily: {
        sans: ['Righteous', ...defaultTheme.fontFamily.sans],
      },
      gridTemplateColumns: {
        buy: '1fr minmax(350px, auto)',
        cards: 'auto 1fr',
      },
      backgroundColor: {
        'pequod-dark': '#0b0629',
        'pequod-pink': '#c923dd',
        'pequod-purple': '#891abf',
        'pequod-white': '#f2f2f2',
        'pequod-white-300': '#f2f2f20f',
        'pequod-gray': '#231e3e',
      },
      borderColor: {
        'pequod-white': '#f2f2f2',
        'pequod-pink': '#c923dd',
      },
      textColor: {
        'pequod-pink': '#c923dd',
      },
      colors: {
        'pequod-dark': '#0b0629',
        'pequod-pink': '#c923dd',
        'pequod-purple': '#891abf',
        'pequod-white': '#f2f2f2',
        'pequod-white-300': '#f2f2f20f',
        'pequod-white-500': '#f2f2f2af',
        'pequod-gray': '#231e3e',
      },
    },
  },
  variants: {
    extend: {
      opacity: ['disabled'],
      cursor: ['disabled'],
    },
  },
  plugins: [],
};
