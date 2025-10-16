import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { fixupConfigRules } from "@eslint/compat";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({ baseDirectory: __dirname });
const compatConfigs = compat.extends("next/core-web-vitals", "next/typescript");

const config = [
  ...fixupConfigRules(compatConfigs),
  {
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      "react/jsx-props-no-spreading": "off",
    },
  },
  {
    ignores: ["node_modules/**", ".next/**", "out/**", "build/**", "next-env.d.ts"],
  },
];

export default config;
