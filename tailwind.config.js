/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}", // Ensure this matches your file structure
  ],
  theme: {
    extend: {
      keyframes: {
        slide: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-100%)" },
        },
      },
      animation: {
        slide: "slide 10s linear infinite",
        spin: "spin 0.2s linear infinite", // Use Tailwind's default spin
        "spin-custom": "spin 0.2s linear infinite", // Custom spin animation
      },
      colors: {
        "gradient-start": "rgba(255, 148, 88, 1)",
        "gradient-end": "rgba(252, 229, 172, 1)",
      },
      backgroundImage: {
        "custom-gradient":
          "linear-gradient(294.57deg, rgba(255, 148, 88, 1) 0%, rgba(252, 229, 172, 1) 100%)",
      },
      keyframes: {
        spin: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
      },
    },
  },
  plugins: [
    require("tailwind-scrollbar"),
    function ({ addUtilities }) {
      addUtilities({
        ".scrollbar-hidden": {
          "&::-webkit-scrollbar": { display: "none !important" },
          "-ms-overflow-style": "none !important",
          "scrollbar-width": "none !important",
        },
      });
    },
  ],
};
