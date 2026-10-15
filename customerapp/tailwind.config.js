/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#E6F4EE",
          100: "#CCE9DC",
          200: "#99D3B9",
          300: "#66BE97",
          400: "#33A874",
          500: "#008E5E",
          600: "#007A55",
          700: "#00684A", // Exact primary color from UI screens
          800: "#005038",
          900: "#003827",
          950: "#002318",
        },
        rama: {
          green: "#00684A",
          darkGreen: "#005038",
          mint: "#E6F4EE",
          softMint: "#F0F9F5",
          charcoal: "#111827",
          amber: "#F59E0B",
          gold: "#D97706",
          lightGray: "#F8FAF9",
        },
      },
    },
  },
  plugins: [],
};
