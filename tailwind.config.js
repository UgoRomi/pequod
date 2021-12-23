const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  darkMode: 'media', // or 'media' or 'class'
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter var', ...defaultTheme.fontFamily.sans],
      },
      gridTemplateColumns: {
        buy: '1fr auto',
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
