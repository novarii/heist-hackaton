import { describe, expect, it } from "vitest";

import { cn } from "./utils";

describe("cn", () => {
  it("merges class names and dedupes tailwind utilities", () => {
    // eslint-disable-next-line tailwindcss/no-contradicting-classname
    expect(cn("px-2", false && "py-8", "px-4", "text-sm")).toBe("px-4 text-sm");
  });
});
