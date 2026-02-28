/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    "hover:bg-transparent",
    "hover:text-porsche-gold",
    "hover:border-porsche-gold",
    "hover:bg-porsche-gold/10",
    "hover:border-porsche-gold",
  ],
  theme: {
    colors: {
       "porsche-red":   "#D5001C",
        "porsche-gold":  "#C8A96E",
        "dark-base":     "#0A0A0A",
        "dark-surface":  "#111111",
        "dark-card":     "#1A1A1A",
    },
    extend: {
      fontFamily: {
        orbitron: ["Orbitron", "sans-serif"],
        rajdhani: ["Rajdhani", "sans-serif"],
      },
    }
  },
  plugins: [],
}

