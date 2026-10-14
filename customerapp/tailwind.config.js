/** @type {import('tailwindcss').Config} */
module.exports = {
  // Scans all files inside the src/ folder
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {},
  },
  plugins: [],
};
