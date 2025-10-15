import type { Config } from "tailwindcss";
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
      backdropBlur: {
        "2.5": "2.5px",
      },
    },
  },
};

export default config;
