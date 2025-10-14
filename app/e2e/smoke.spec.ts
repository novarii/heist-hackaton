import { expect, test } from "@playwright/test";

test.describe("Landing page", () => {
  test("renders bootstrap hero", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { name: /ship typed agent workflows/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /explore docs/i })).toBeVisible();
  });
});
