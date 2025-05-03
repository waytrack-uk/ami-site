/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "page-bg": "#f2e8d5",
        "text-primary": "#2c1810",
      },
      fontFamily: {
        baskerville: ["Baskerville", "serif"],
      },
    },
  },
  plugins: [],
};
