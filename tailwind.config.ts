import type { Config } from "tailwindcss";
import forms from "@tailwindcss/forms";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        arc: {
          midnight: "#071524",
          navy: "#0b2341",
          blue: "#0f4c81",
          steel: "#5c7086",
          frost: "#e7eef6",
          signal: "#f6b445",
          copper: "#c87b36",
        },
      },
      fontFamily: {
        sans: [
          "Arial",
          "Helvetica",
          "system-ui",
          "sans-serif",
        ],
        display: [
          "Arial",
          "Helvetica",
          "system-ui",
          "sans-serif",
        ],
      },
      boxShadow: {
        industrial: "0 18px 45px rgba(7, 21, 36, 0.18)",
      },
    },
  },
  plugins: [forms],
};

export default config;
