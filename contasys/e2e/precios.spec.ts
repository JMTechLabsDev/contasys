import { test, expect } from "@playwright/test";

test.describe("Pricing page", () => {
  test("muestra contenido de precios", async ({ page }) => {
    await page.goto("/precios");
    await expect(page.locator("main").first()).toBeVisible();
  });

  test("carga correctamente", async ({ page }) => {
    const response = await page.goto("/precios");
    expect(response?.status()).toBeLessThan(400);
  });
});
