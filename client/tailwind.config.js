/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: {
          400: "#fb923c",
          500: "#f97316",
          600: "#ea580c",
          700: "#c2410c",
        },
        dark: {
          700: "#1e1e1e",
          800: "#141414",
          900: "#0a0a0a",
        },
        success: "#22c55e",
        warning: "#eab308",
        danger:  "#ef4444",
      },
      fontFamily: {
        display: ["'Bebas Neue'", "cursive"],
        heading: ["'Barlow Condensed'", "sans-serif"],
        body:    ["'DM Sans'", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 20px rgba(249,115,22,0.35)",
        card: "0 4px 24px rgba(0,0,0,0.4)",
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(135deg, #f97316 0%, #c2410c 100%)",
      },
    },
  },
  plugins: [],
}
