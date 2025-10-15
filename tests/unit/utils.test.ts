import { describe, expect, it } from "vitest";
import { cn } from "lib/utils";

describe("cn", () => {
  it("merges class names and removes duplicates", () => {
    const result = cn("p-4", "text-sm", "p-4");
    
    // Check no duplicates
    const classes = result.split(" ");
    const uniqueClasses = [...new Set(classes)];
    expect(classes).toEqual(uniqueClasses);
    
    // Check both classes are present
    expect(result).toContain("p-4");
    expect(result).toContain("text-sm");
    
    // Check we only have 2 classes total
    expect(classes).toHaveLength(2);
  });

  it("handles conflicting Tailwind classes", () => {
    // tailwind-merge should keep the last one
    const result = cn("p-4", "p-8");
    expect(result).toBe("p-8");
    expect(result).not.toContain("p-4");
  });
});