import { test, expect } from "@playwright/test";

test.describe("Registro page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/registro");
  });

  test("muestra formulario de registro", async ({ page }) => {
    await expect(page.locator("form")).toBeVisible();
    await expect(page.getByLabel(/nombre/i)).toBeVisible();
    await expect(page.getByLabel(/correo electrónico|email/i)).toBeVisible();
    await expect(page.locator("form")).toBeVisible();
  });

  test("navega a login", async ({ page }) => {
    await page.getByRole("link", { name: /iniciar sesión/i }).click();
    await expect(page).toHaveURL(/\/login/);
  });
});
