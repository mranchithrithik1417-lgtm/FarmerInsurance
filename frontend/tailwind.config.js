/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          900: "#0B3D2E",
          800: "#14532D",
          700: "#1B6B3D",
          600: "#2E7D52",
          500: "#3D9965",
          100: "#EFF6F0",
          50: "#F6F8F4"
        },
        navy: {
          900: "#0D1826",
          800: "#14243A",
          700: "#1E3554",
          600: "#2B4C76"
        },
        gold: {
          500: "#D6A84F",
          600: "#B88A35",
          100: "#FEF9EE"
        }
      }
    },
  },
  plugins: [],
}
