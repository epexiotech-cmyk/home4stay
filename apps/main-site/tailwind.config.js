/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/data/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#0E5A75",
          light: "#0983B0",
          dark: "#0A4459",
        },
        accent: {
          DEFAULT: "#F24633",
          hover: "#D83A2A",
        },
        success: {
          DEFAULT: "#159665",
          light: "#78D145",
        },
        secondary: "#29655C",
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
    },
  },
  plugins: [],
};
