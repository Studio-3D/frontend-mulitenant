/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#f5f5f5",
        foreground: "#333333",
        primary: "#007bff",
        secondary: "#6c757d",
        accent: "#E5E5E5",
        muted: "#f8f9fa",
        destructive: "#dc3545",
        border: "#dee2e6",
        input: "#ced4da",
        ring: "#80bdff",
        hover: "#e0e0e0",
        active: "#fff",
        text: "#ffffff",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
