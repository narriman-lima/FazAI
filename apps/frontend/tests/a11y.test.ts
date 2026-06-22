import { test, expect } from "@playwright/test";

/**
 * Testes de acessibilidade básica
 */
test.describe("Acessibilidade", () => {
  test("Página inicial deve carregar sem erros de console", async ({
    browser,
  }) => {
    const page = await browser.newPage();
    const errors: string[] = [];

    page.on("console", (msg) => {
      if (msg.type() === "error") {
        errors.push(msg.text());
      }
    });

    await page.goto(process.env.VITE_APP_URL || "http://localhost:5173");
    await page.waitForLoadState("networkidle");

    // Erros de aplicação (não incluir erros de extensões do browser)
    const appErrors = errors.filter((err) => !err.includes("chrome-extension"));

    expect(appErrors.length).toBe(0);

    await page.close();
  });

  test("Página deve ter título definido", async ({ browser }) => {
    const page = await browser.newPage();
    await page.goto(process.env.VITE_APP_URL || "http://localhost:5173");

    const title = await page.title();
    // O título deve existir e não estar vazio (mais flexível para diferentes configurações)
    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThan(0);

    await page.close();
  });
});

/**
 * Testes de responsividade
 */
test.describe("Responsividade", () => {
  test("Interface deve ser responsiva no mobile", async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 375, height: 667 }, // iPhone 8
    });

    const page = await context.newPage();
    await page.goto(process.env.VITE_APP_URL || "http://localhost:5173");
    await page.waitForLoadState("networkidle");

    // Verificar se a página não tem scroll horizontal
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);

    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 1); // +1 para rounding errors

    await context.close();
  });

  test("Interface deve ser responsiva em desktop", async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 }, // Desktop
    });

    const page = await context.newPage();
    await page.goto(process.env.VITE_APP_URL || "http://localhost:5173");
    await page.waitForLoadState("networkidle");

    // Verificar se a página carregou corretamente
    const heading = page.locator("h1, h2");
    await expect(heading.first()).toBeVisible();

    await context.close();
  });
});
