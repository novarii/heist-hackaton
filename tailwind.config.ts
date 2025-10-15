import type { Config } from "tailwindcss";
import tailwindcssTextshadow from "tailwindcss-textshadow";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          orange: {
            900: "#654310",
          },
        },
        neutrals: {
          2: "#FDFDFD",
          4: "#F1F1F2",
          6: "#C6C7C8",
          13: "#1B1D21",
        },
      },
      fontFamily: {
        saprona: ["var(--font-saprona)", "sans-serif"],
        garamond: ["var(--font-garamond)", "var(--font-apple-garamond)", "serif"],
      },
      backgroundImage: {
        "red-white-gradient": "linear-gradient(to right, #ff7676, #ffffff)",
        "dust-pattern": "url('/landing/dust.png')",
      },
      backdropBlur: {
        "2.5": "2.5px",
      },
      textShadow: {
        hero: "7px 7px 5px rgba(0, 0, 0, 0.25)",
      },
    },
  },
  plugins: [tailwindcssTextshadow],
};

export default config;
