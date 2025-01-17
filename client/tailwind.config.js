/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontStyle: ["placeholder"],
      fontWeight: ["placeholder"],
      animation: {
        "fade-in": "fadeIn 1s ease-in forwards 2.5s",
        "fade-in-scale": "fadeInScale 0.3s ease-out forwards",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: 0 },
          "100%": { opacity: 1 },
        },
        fadeInScale: {
          "0%": { opacity: 0, transform: "scale(0.95)" },
          "100%": { opacity: 1, transform: "scale(1)" },
        },
      },
      backdropBlur: {
        xs: "2px",
        sm: "4px",
        md: "8px",
        lg: "12px",
      },
      colors: {
        glass: "rgba(255, 255, 255, 0.1)",
        glassLight: "rgba(255, 255, 255, 0.4)",
        glassDark: "rgba(0, 0, 0, 0.4)",
      },
      borderRadius: {
        xl: "12px",
      },
      boxShadow: {
        glass: "0 4px 12px rgba(0, 0, 0, 0.2)",
      },
      spacing: {
        18: "4.5rem",
      },
    },
  },
  plugins: [
    function ({ addComponents }) {
      addComponents({
        ".magic-card": {
          "@apply rounded-md border-none bg-transparent p-8 shadow-lg backdrop-blur-md duration-1000 ease-in-out":
            {},
          "&:hover": {
            "@apply rounded-3xl shadow-2xl shadow-indigo-400/30": {},
          },
        },
        ".card-title": {
          "@apply mb-4 text-2xl font-bold text-indigo-400": {},
        },
        ".app-input": {
          "@apply shadow-glass w-full rounded-xl border-none bg-zinc-700/40 p-2":
            {},
        },
        ".app-title": {
          "@apply mb-0 ml-2 mt-4 block text-left font-semibold text-lg text-indigo-400":
            {},
        },
      });
    },
  ],
};
