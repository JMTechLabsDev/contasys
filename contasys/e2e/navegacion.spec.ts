import { test, expect } from "@playwright/test";

test.describe("Navegación general", () => {
  const paginas: { path: string; selector?: string }[] = [
    { path: "/" },
    { path: "/login" },
    { path: "/registro" },
    { path: "/precios" },
    { path: "/terminos" },
    { path: "/privacidad" },
    { path: "/recuperar" },
    { path: "/offline", selector: "h1" },
  ];

  for (const pagina of paginas) {
    test(`${pagina.path} carga sin errores`, async ({ page }) => {
      const response = await page.goto(pagina.path);
      if (response?.status() !== 404) {
        const sel = pagina.selector || "main, form, [data-slot='card']";
        await expect(page.locator(sel).first()).toBeVisible({ timeout: 10000 });
      }
    });
  }
});
