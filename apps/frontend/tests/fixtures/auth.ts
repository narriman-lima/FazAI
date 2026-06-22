import { test as base, expect, Page } from "@playwright/test";

export type AuthContext = {
  authenticatedPage: Page;
};

/**
 * Fixture para autenticação com Clerk
 * Fornece uma página já autenticada para testes
 */
export const test = base.extend<AuthContext>({
  authenticatedPage: async ({ page }, use) => {
    // Navegar para a aplicação
    await page.goto(process.env.VITE_APP_URL || "http://localhost:5173");

    // Aguardar carregamento da página
    await page.waitForLoadState("networkidle");

    // Verificar se o usuário já está autenticado
    const isAuthenticated = await page.evaluate(() => {
      return localStorage.getItem("__clerk_db_jwt") !== null;
    });

    if (!isAuthenticated) {
      // Clicar no botão de login/signup
      const signInButton = page.locator('[data-testid="clerk-sign-in-button"]');

      if (await signInButton.isVisible({ timeout: 5000 }).catch(() => false)) {
        await signInButton.click();

        // Aguardar redirecionamento para Clerk
        await page.waitForURL(/clerk\.accounts\.com|clerk\.com/, {
          timeout: 10000,
        });

        // Preencher email
        const emailInput = page.locator('input[type="email"]');
        await emailInput.fill(
          process.env.TEST_USER_EMAIL || "test@example.com",
        );

        // Clicar em continuar
        await page.locator('button:has-text("Continuar")').click();

        // Aguardar campo de senha ou verificação
        await page.waitForSelector(
          'input[type="password"], [data-testid="password-input"]',
          { timeout: 5000 },
        );

        // Preencher senha
        const passwordInput = page.locator('input[type="password"]');
        await passwordInput.fill(
          process.env.TEST_USER_PASSWORD || "TestPassword123!",
        );

        // Submit form
        await page
          .locator('button:has-text("Continuar"), button[type="submit"]')
          .click();

        // Aguardar redirecionamento de volta para a app
        await page.waitForURL(
          new RegExp(process.env.VITE_APP_URL || "http://localhost:5173"),
          { timeout: 10000 },
        );
      }
    }

    // Usar a página autenticada
    await use(page);
  },
});

export { expect };
