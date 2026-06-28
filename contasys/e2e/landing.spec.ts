import { test, expect } from "@playwright/test";

test.describe("Landing page", () => {
  test("muestra título principal", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toBeVisible();
  });

  test("navegación a precios funciona", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /precios/i }).first().click();
    await expect(page).toHaveURL(/\/precios/);
  });

  test("navegación a login desde landing", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /iniciar sesión|ingresar/i }).first().click();
    await expect(page).toHaveURL(/\/login/);
  });

  test("navegación a registro desde landing", async ({ page }) => {
    await page.goto("/");
    await page.locator('a[href*="registro"]').first().click();
    await expect(page).toHaveURL(/\/registro/);
  });
});
