/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/data/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "var(--primary, #0E5A75)",
          light: "#0983B0",
          dark: "#0A4459",
        },
        theme: {
          primary: "var(--primary)",
          secondary: "var(--secondary)",
          accent: "var(--accent)",
          bg: "var(--theme-bg, #ffffff)",
        },
        accent: {
          DEFAULT: "var(--accent, #F24633)",
          hover: "#D83A2A",
        },
        success: {
          DEFAULT: "#159665",
          light: "#78D145",
        },
        secondary: "var(--secondary, #29655C)",
        warning: "#FCBC43",
        background: "#FDF6F1",
        surface: {
          DEFAULT: "#FFFFFF",
          alt: "#F7EFEA",
        },
        border: "#E5E5E5",
      },
      backgroundImage: {
        "primary-gradient": "linear-gradient(to right, #0E5A75, #0983B0)",
        "accent-gradient": "linear-gradient(to right, #F24633, #FCBC43)",
        "success-gradient": "linear-gradient(to right, #159665, #78D145)",
      },
      transitionDuration: {
        operational: "150ms",
        premium: "250ms",
        cinematic: "500ms",
      },
      transitionTimingFunction: {
        operational: "ease-out",
        premium: "cubic-bezier(0.2, 0.8, 0.2, 1)",
        cinematic: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        successBurst: {
          "0%": { transform: "scale(0.8)", opacity: "0" },
          "50%": { opacity: "0.2" },
          "100%": { transform: "scale(2.5)", opacity: "0" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
      animation: {
        shimmer: "shimmer 2.5s infinite linear",
        successBurst: "successBurst 1.5s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        fadeIn: "fadeIn 0.5s ease-out forwards",
      },
    },
  },
  plugins: [],
};
