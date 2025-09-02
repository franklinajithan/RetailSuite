import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: [
    "./apps/**/*.{ts,tsx,js,jsx}",
    "./packages/**/*.{ts,tsx,js,jsx}",
    "./components/**/*.{ts,tsx,js,jsx}",
    "./pages/**/*.{ts,tsx,js,jsx}",
    "./src/**/*.{ts,tsx,js,jsx}",
  ],
  theme: { extend: {} },
  plugins: [],
} satisfies Config;
