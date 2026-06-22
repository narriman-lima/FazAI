import { test, expect } from "@playwright/test";
import type { Page } from "@playwright/test";

/**
 * Testes E2E - Smoke Tests
 *
 * Verificam a saúde básica da aplicação sem depender de autenticação
 * real do Clerk ou data-testid específicos da aplicação.
 */

test.describe("Smoke Tests", () => {
  test("Página inicial deve carregar com sucesso", async ({
    page,
  }: {
    page: Page;
  }) => {
    const response = await page.goto(
      process.env.VITE_APP_URL || "http://localhost:5173",
    );

    expect(response?.status()).toBeLessThan(400);

    const body = page.locator("body");
    await expect(body).toBeVisible();
  });

  test("Página inicial deve renderizar conteúdo", async ({
    page,
  }: {
    page: Page;
  }) => {
    await page.goto(process.env.VITE_APP_URL || "http://localhost:5173");

    // Verificar se há algum heading visível (h1, h2 ou h3)
    const heading = page.locator("h1, h2, h3").first();
    await expect(heading).toBeVisible({ timeout: 10000 });
  });

  test("Backend deve estar acessível", async ({ request }) => {
    const apiUrl = process.env.API_URL || "http://localhost:3001/api/v1";
    const response = await request.get(`${apiUrl}/health`);

    expect(response.ok()).toBeTruthy();

    const body = await response.json();
    expect(body).toHaveProperty("status");
  });
});
