/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        bounce: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-20px)" },
        },
      },
      animation: {
        "bounce-slow": "bounce 6s ease-in-out infinite",
        "bounce-slower": "bounce 10s ease-in-out infinite",
        "bounce-slowest": "bounce 14s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
