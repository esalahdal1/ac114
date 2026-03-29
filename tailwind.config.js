/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        glass: "rgba(255, 255, 255, 0.03)",
        "glass-border": "rgba(255, 255, 255, 0.1)",
        "accent-purple": "#a855f7",
        "accent-blue": "#3b82f6",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "main-gradient": "linear-gradient(to bottom right, #0a0a0a, #1a1a2e, #16213e, #0f3460)",
      },
      backdropBlur: {
        xs: "2px",
      },
      animation: {
        "glow-pulse": "glow-pulse 3s infinite ease-in-out",
      },
      keyframes: {
        "glow-pulse": {
          "0%, 100%": { opacity: "0.3", transform: "scale(1)" },
          "50%": { opacity: "0.6", transform: "scale(1.1)" },
        },
      },
    },
  },
  plugins: [],
};
