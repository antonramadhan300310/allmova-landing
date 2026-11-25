import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        charcoal: "#0D1112",
        surface: "#141A1C",
        lime: {
          DEFAULT: "#B9F51E",
          soft: "#D2FF66",
          deep: "#8FC10B",
        },
      },
      fontFamily: {
        sans: [
          "Plus Jakarta Sans",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "sans-serif",
        ],
      },
      borderColor: {
        hairline: "rgba(255, 255, 255, 0.08)",
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(185, 245, 30, 0.35), 0 24px 70px -20px rgba(185, 245, 30, 0.35)",
        phone: "0 50px 120px -40px rgba(0, 0, 0, 0.9), 0 0 0 1px rgba(255,255,255,0.08)",
      },
      backgroundImage: {
        "grid-faint":
          "linear-gradient(to right, rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.045) 1px, transparent 1px)",
      },
      keyframes: {
        "pulse-dot": {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.35", transform: "scale(0.85)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "toast-in": {
          from: { opacity: "0", transform: "translateY(10px) scale(0.98)" },
          to: { opacity: "1", transform: "translateY(0) scale(1)" },
        },
      },
      animation: {
        "pulse-dot": "pulse-dot 2.2s ease-in-out infinite",
        float: "float 7s ease-in-out infinite",
        "toast-in": "toast-in 0.24s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
