/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
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
  plugins: [],
};
