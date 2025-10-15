import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const rootDir = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    include: ["tests/**/*.{test,spec}.{ts,tsx}"],
  },
  resolve: {
    alias: {
      "@": rootDir,
      components: resolve(rootDir, "components"),
      lib: resolve(rootDir, "lib"),
      stores: resolve(rootDir, "stores"),
    },
  },
});
