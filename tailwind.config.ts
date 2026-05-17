import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: "var(--background)",
          secondary: "var(--background-secondary)",
        },
        foreground: {
          DEFAULT: "var(--foreground)",
          secondary: "var(--foreground-secondary)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          hover: "var(--accent-hover)",
        },
        destructive: "var(--destructive)",
        success: "var(--success)",
      },
      boxShadow: {
        premium: "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        serif: ["var(--font-serif)", "serif"],
      },
      spacing: {
        "grid-8": "8px",
        "grid-16": "16px",
        "grid-24": "24px",
        "grid-32": "32px",
        "grid-48": "48px",
        "grid-64": "64px",
        "grid-80": "80px",
        "grid-120": "120px",
      },
      maxWidth: {
        "1440": "1440px",
      }
    },
  },
  plugins: [],
};
export default config;
