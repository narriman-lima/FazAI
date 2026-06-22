# 🎭 Playwright Testing com Clerk Integration

Guia completo para configurar e executar testes E2E (end-to-end) com Playwright integrado ao Clerk para autenticação.

## 📋 Pré-requisitos

1. **Clerk Account** - Criar conta em [clerk.com](https://clerk.com)
2. **Test User** - Criar um usuário de teste no Clerk Dashboard
3. **Environment Variables** - Configurar as chaves de API

## 🚀 Configuração Inicial

### 1. Configurar Variáveis de Ambiente

Criar arquivo `.env.test` na raiz do projeto frontend:

```bash
# Copy do .env.test de exemplo
cp .env.test.example .env.test
```

Editar `.env.test` com suas credenciais:

```env
# Clerk
VITE_CLERK_PUBLISHABLE_KEY=pk_test_sua_chave_publica
CLERK_SECRET_KEY=sk_test_sua_chave_secreta

# Test User (criar em Clerk Dashboard)
TEST_USER_EMAIL=seu-usuario-teste@example.com
TEST_USER_PASSWORD=SuaSenhaSegura123!

# URLs
VITE_APP_URL=http://localhost:5173
API_URL=http://localhost:3001/api/v1
```

### 2. Obter Chaves do Clerk

1. Ir para [Clerk Dashboard](https://dashboard.clerk.com)
2. Selecionar seu projeto
3. Ir em **API Keys** (Home > Configure > API Keys)
4. Copiar:
   - **Publishable Key** → `VITE_CLERK_PUBLISHABLE_KEY`
   - **Secret Key** → `CLERK_SECRET_KEY`

### 3. Criar Usuário de Teste

1. No Clerk Dashboard, ir em **Users**
2. Clicar em **+ Create** ou usar um usuário existente
3. Anotar o email e definir uma senha temporal
4. Adicionar valores em `.env.test`:
   - `TEST_USER_EMAIL` - Email do usuário
   - `TEST_USER_PASSWORD` - Senha (pode mudar após o primeiro login)

### 4. Instalar Dependências

```bash
cd apps/frontend
npm install
```

## 🏃 Executando Testes

### Testes Rápidos (Headless)

```bash
npm run test:e2e
```

### Testes com Visualização (Debug)

```bash
npm run test:e2e:debug
```

### Testes em Watch Mode

```bash
npm run test:e2e:watch
```

### Ver Relatório HTML

```bash
npm run test:e2e:report
```

## 📁 Estrutura de Testes

```
apps/frontend/tests/
├── fixtures/
│   └── auth.ts              # Fixture para autenticação com Clerk
├── global.setup.ts          # Setup global (validar env vars, etc)
├── config.ts                # Configurações compartilhadas
├── e2e.test.ts              # Testes E2E (pantry, recipes, etc)
└── a11y.test.ts             # Testes de acessibilidade
```

## 🔐 Como Funciona a Autenticação

### Fixture de Autenticação (`tests/fixtures/auth.ts`)

O fixture `authenticatedPage` automaticamente:

1. Navega para a aplicação
2. Detecta se já está autenticado
3. Se não, faz login com as credenciais em `.env.test`
4. Aguarda redirecionamento de volta
5. Retorna a página autenticada

### Uso em Testes

```typescript
import { test, expect, authenticatedPage } from "./fixtures/auth";

test("Meu teste autenticado", async ({ authenticatedPage }) => {
  // authenticatedPage já está logada!
  await authenticatedPage.goto("/pantry");

  const heading = authenticatedPage.locator("h1");
  await expect(heading).toContainText("Pantry");
});
```

## 🛠️ Exemplos de Testes

### Teste de Página Autenticada

```typescript
test("Usuário autenticado deve acessar pantry", async ({
  authenticatedPage,
}) => {
  await authenticatedPage.goto("/pantry");

  const list = authenticatedPage.locator('[data-testid="ingredients-list"]');
  await expect(list).toBeVisible();
});
```

### Teste de Formulário

```typescript
test("Adicionar ingrediente", async ({ authenticatedPage }) => {
  await authenticatedPage.goto("/pantry");

  const input = authenticatedPage.locator('[data-testid="ingredient-input"]');
  await input.fill("2 ovos");

  const button = authenticatedPage.locator('[data-testid="add-btn"]');
  await button.click();

  // Verificar se foi adicionado
  await expect(authenticatedPage.locator("text=2 ovos")).toBeVisible();
});
```

### Teste de API

```typescript
test("API deve retornar ingredientes autenticados", async ({
  authenticatedPage,
}) => {
  const response = await authenticatedPage.evaluate(async (url) => {
    const res = await fetch(`${url}/pantry`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("__clerk_db_jwt")}`,
      },
    });
    return res.json();
  }, "http://localhost:3001/api/v1");

  expect(Array.isArray(response)).toBe(true);
});
```

## 🎯 Boas Práticas

### Seletores

```typescript
// ✅ Usar data-testid
const element = page.locator('[data-testid="my-element"]');

// ✅ Usar texto visível para itens únicos
const button = page.locator('button:has-text("Adicionar")');

// ❌ Evitar IDs gerados dinamicamente
// ❌ Evitar className (muito frágil)
```

### Esperas

```typescript
// ✅ Esperar pelo estado desejado
await expect(element).toBeVisible();
await page.waitForLoadState("networkidle");

// ❌ Evitar delays fixos
// await page.waitForTimeout(1000); // Ruim!
```

### Limpeza

```typescript
// Setup antes de cada teste
test.beforeEach(async ({ page }) => {
  // Abrir a página
  await page.goto("/pantry");
});

// Limpeza após cada teste (se necessário)
test.afterEach(async ({ page }) => {
  // Limpar dados de teste
});
```

## 🐛 Troubleshooting

### Erro: "Cannot find element"

```
// Aumentar timeout
await expect(element).toBeVisible({ timeout: 30000 });

// Ou usar waitFor
await page.waitForSelector('[data-testid="element"]');
```

### Erro: "Timed out waiting for authentication"

```
// Verificar .env.test
echo $TEST_USER_EMAIL
echo $VITE_CLERK_PUBLISHABLE_KEY

// Verificar se usuário existe no Clerk Dashboard
// Verificar se senha está correta
```

### Erro: "Base URL not defined"

```
// Configurar em playwright.config.ts
export default defineConfig({
  use: {
    baseURL: process.env.VITE_APP_URL || 'http://localhost:5173',
  },
});
```

### App não abre

```bash
# Certificar-se de que a app está rodando
npm run dev

# Em outro terminal, rodar testes
npm run test:e2e
```

## 📊 Relatório de Testes

Após executar testes:

```bash
npm run test:e2e:report
```

Abre um relatório HTML com:

- ✅ Testes que passaram
- ❌ Testes que falharam
- 📸 Screenshots
- 🎥 Vídeos (durante falhas)
- 🔍 Traces (replay do teste)

## 🔄 CI/CD Integration

Para GitHub Actions, adicionar:

```yaml
name: Playwright Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: "18"

      - name: Install dependencies
        run: npm install

      - name: Load environment variables
        run: |
          echo "VITE_CLERK_PUBLISHABLE_KEY=${{ secrets.CLERK_PUBLISHABLE_KEY }}" >> .env.test
          echo "CLERK_SECRET_KEY=${{ secrets.CLERK_SECRET_KEY }}" >> .env.test
          echo "TEST_USER_EMAIL=${{ secrets.TEST_USER_EMAIL }}" >> .env.test
          echo "TEST_USER_PASSWORD=${{ secrets.TEST_USER_PASSWORD }}" >> .env.test

      - name: Run Playwright tests
        run: npm run test:e2e
        working-directory: apps/frontend

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: apps/frontend/playwright-report/
```

## 📚 Recursos Adicionais

- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Clerk Documentation](https://clerk.com/docs)
- [Playwright Debugging](https://playwright.dev/docs/debug)
- [Playwright VS Code Extension](https://marketplace.visualstudio.com/items?itemName=ms-playwright.playwright)

## 🎓 Próximos Passos

1. ✅ Configurar `.env.test` com credenciais reais
2. ✅ Rodar testes: `npm run test:e2e`
3. ✅ Adicionar mais testes conforme necessário
4. ✅ Integrar com GitHub Actions
5. ✅ Monitorar cobertura de testes

---

**Dúvidas?** Consulte o arquivo [AGENTS.md](../../.agents/AGENTS.md) para mais diretrizes.
