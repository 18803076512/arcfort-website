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
          midnight: "#0B1F33",
          navy: "#102A43",
          deep: "#163A5F",
          blue: "#1E5E96",
          bright: "#2774AE",
          steel: "#64748B",
          frost: "#F6F8FA",
          mist: "#EEF2F5",
          line: "#DDE3E8",
          ink: "#101820",
          signal: "#B84B0C",
          copper: "#A94710",
        },
      },
      fontFamily: {
        sans: ["Inter", "Segoe UI", "Noto Sans SC", "Microsoft YaHei", "Arial", "sans-serif"],
        display: ["Inter", "Segoe UI", "Noto Sans SC", "Microsoft YaHei", "Arial", "sans-serif"],
      },
      maxWidth: {
        site: "82.5rem",
        reading: "48rem",
      },
      minHeight: {
        header: "4.75rem",
      },
      borderRadius: {
        control: "0.25rem",
        panel: "0.375rem",
        media: "0.5rem",
      },
      boxShadow: {
        industrial: "0 14px 36px rgba(11, 31, 51, 0.12)",
        menu: "0 24px 60px rgba(11, 31, 51, 0.16)",
      },
    },
  },
  plugins: [forms],
};

export default config;
