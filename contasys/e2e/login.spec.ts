import { test, expect } from "@playwright/test";

test.describe("Login page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
  });

  test("muestra el formulario de login", async ({ page }) => {
    await expect(page.locator("form")).toBeVisible();
    await expect(page.getByLabel("Correo electrónico")).toBeVisible();
    await expect(page.getByLabel("Contraseña")).toBeVisible();
    await expect(page.getByRole("button", { name: /iniciar sesión/i })).toBeVisible();
  });

  test("tiene enlace a registro", async ({ page }) => {
    await expect(page.getByRole("link", { name: /registrarse/i })).toBeVisible();
  });

  test("tiene enlace a recuperar contraseña", async ({ page }) => {
    await expect(page.getByRole("link", { name: /olvidaste/i })).toBeVisible();
  });

  test("navega a registro", async ({ page }) => {
    await page.getByRole("link", { name: /registrarse/i }).click();
    await expect(page).toHaveURL(/\/registro/);
  });

  test("navega a recuperar contraseña", async ({ page }) => {
    await page.getByRole("link", { name: /olvidaste/i }).click();
    await expect(page).toHaveURL(/\/recuperar/);
  });

  test("submit con credenciales inválidas no crashea", async ({ page }) => {
    await page.getByLabel("Correo electrónico").fill("invalido@test.com");
    await page.getByLabel("Contraseña").fill("wrongpassword");
    await page.getByRole("button", { name: /iniciar sesión/i }).click();
    await expect(page.getByLabel("Correo electrónico")).toBeVisible({ timeout: 10000 });
  });
});
