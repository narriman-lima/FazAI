# 🎭 Playwright + Clerk: Guia de Boas Práticas

## Estrutura de um Teste Autenticado

### Exemplo Completo

```typescript
import { test, expect } from "./fixtures/auth";

test.describe("Feature: Manage Pantry Items", () => {
  test("should add ingredient via text input", async ({
    authenticatedPage,
  }) => {
    // ARRANGE - Preparar o estado
    await authenticatedPage.goto("/pantry");
    await authenticatedPage.waitForLoadState("networkidle");

    // ACT - Executar a ação
    const input = authenticatedPage.locator('[data-testid="ingredient-input"]');
    await input.fill("2 ovos, 1 litro de leite");

    const submitButton = authenticatedPage.locator('[data-testid="parse-btn"]');
    await submitButton.click();

    // ASSERT - Verificar o resultado
    await authenticatedPage.waitForLoadState("networkidle");

    const successMessage = authenticatedPage.locator(
      '[data-testid="success-toast"]',
    );
    await expect(successMessage).toBeVisible();

    const addedItem = authenticatedPage.locator("text=2 ovos");
    await expect(addedItem).toBeVisible();
  });
});
```

## 🏗️ Padrões de Teste

### 1. Padrão AAA (Arrange, Act, Assert)

```typescript
test("should complete user task", async ({ authenticatedPage }) => {
  // ARRANGE
  const userId = await authenticatedPage.evaluate(() =>
    localStorage.getItem("userId"),
  );

  // ACT
  await authenticatedPage.goto(`/profile/${userId}`);
  const name = await authenticatedPage.locator("h1").textContent();

  // ASSERT
  expect(name).toBeTruthy();
});
```

### 2. Padrão Page Object Model (POM)

```typescript
// pages/pantry.page.ts
export class PantryPage {
  constructor(readonly page: Page) {}

  async goto() {
    await this.page.goto("/pantry");
  }

  async addIngredient(text: string) {
    const input = this.page.locator('[data-testid="ingredient-input"]');
    await input.fill(text);

    const button = this.page.locator('[data-testid="add-btn"]');
    await button.click();
  }

  async getIngredientsList() {
    return this.page.locator('[data-testid="ingredients-list"] > *');
  }
}

// Usar em teste
test("should add ingredient", async ({ authenticatedPage }) => {
  const pantry = new PantryPage(authenticatedPage);
  await pantry.goto();
  await pantry.addIngredient("2 ovos");

  const items = await pantry.getIngredientsList();
  expect(items).toHaveCount(1);
});
```

### 3. Padrão de Fixtures Personalizadas

```typescript
// fixtures/pantry.fixture.ts
export const test = base.extend({
  pantryPage: async ({ authenticatedPage }, use) => {
    const pantry = new PantryPage(authenticatedPage);
    await pantry.goto();
    await use(pantry);
  },

  emptyPantry: async ({ authenticatedPage }, use) => {
    const pantry = new PantryPage(authenticatedPage);
    await pantry.goto();
    await pantry.clearAll(); // Limpar antes do teste
    await use(pantry);
  },
});

// Usar em teste
test("should manage empty pantry", async ({ emptyPantry }) => {
  // Já começa com pantry vazia
  await emptyPantry.addIngredient("Sal");
});
```

## 🔑 Checklist de Segurança

### Credenciais e Secrets

- ✅ Nunca commitir `.env.test` com credenciais reais
- ✅ Usar secretos em CI/CD (GitHub Secrets)
- ✅ Usuário de teste deve ser exclusivamente para testes
- ✅ Senha de teste deve ser complexa
- ✅ Rotacionar credenciais regularmente

```bash
# Muito inseguro! ❌
echo "CLERK_SECRET_KEY=sk_test_123456" >> .env.test
git add .env.test

# Seguro! ✅
echo ".env.test" >> .gitignore
cp .env.test.example .env.test
# Editar .env.test manualmente
```

### Isolamento de Dados

```typescript
// ✅ Bom: Cada teste tem seu próprio contexto
test("test 1", async ({ authenticatedPage }) => {
  // Nova sessão, novo isolamento
});

test("test 2", async ({ authenticatedPage }) => {
  // Não afeta o teste anterior
});

// ❌ Ruim: Compartilhar estado entre testes
let globalState = {};

test("test 1", async ({ page }) => {
  globalState.userId = 123; // Pode afetar outros testes
});
```

## 🎯 Seletores e Localizadores

### Estratégia de Localização

```typescript
// 1️⃣ Preferência: data-testid
const element = page.locator('[data-testid="unique-id"]');

// 2️⃣ Fallback: Atributos semânticos
const button = page.locator('button[aria-label="Add item"]');

// 3️⃣ Fallback: Texto visível
const link = page.locator('a:has-text("Logout")');

// ❌ Evitar: Classes e IDs dinâmicos
// const element = page.locator('.component_1a2b3c');
```

### Ajudar Desenvolvedores

Adicionar `data-testid` em componentes críticos:

```typescript
// App.tsx
export function PantryForm() {
  return (
    <form data-testid="ingredient-form">
      <input
        data-testid="ingredient-input"
        placeholder="Digite ingredientes..."
      />
      <button data-testid="submit-btn">Adicionar</button>
      <ul data-testid="ingredients-list">
        {ingredients.map((ing) => (
          <li key={ing.id} data-testid={`ingredient-${ing.id}`}>
            {ing.name}
          </li>
        ))}
      </ul>
    </form>
  );
}
```

## ⏱️ Estratégias de Espera

### Aguardas Inteligentes

```typescript
// ❌ Ruim: Wait fixo
await page.waitForTimeout(2000);

// ✅ Bom: Aguardar elemento
await expect(element).toBeVisible({ timeout: 5000 });

// ✅ Bom: Aguardar rede
await page.waitForLoadState("networkidle", { timeout: 10000 });

// ✅ Bom: Aguardar função
await page.waitForFunction(() => {
  return document.querySelectorAll("[data-loaded]").length > 0;
});

// ✅ Bom: Aguardar URL
await page.waitForURL(/\/recipes\/\d+/, { timeout: 5000 });
```

### Configuração Global de Timeouts

```typescript
// playwright.config.ts
export default defineConfig({
  timeout: 30 * 1000, // 30s por teste
  expect: { timeout: 10 * 1000 }, // 10s por assertion
  use: {
    navigationTimeout: 30 * 1000,
    actionTimeout: 10 * 1000,
  },
});
```

## 📊 Tratamento de Erros Comuns

### Elemento não encontrado

```typescript
// ❌ Erro genérico
const element = page.locator(".component");
await element.click(); // Falha: element não existe

// ✅ Com graceful handling
const element = page.locator('[data-testid="component"]');
if (await element.isVisible({ timeout: 2000 }).catch(() => false)) {
  await element.click();
} else {
  // Elemento não encontrado, fazer algo else
  console.warn("Elemento não visível");
}
```

### API call fails

```typescript
// ✅ Verificar resposta da API
const response = await authenticatedPage.evaluate(async (url) => {
  try {
    const res = await fetch(`${url}/pantry`);
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    return res.json();
  } catch (error) {
    return { error: error.message };
  }
}, "http://localhost:3001/api/v1");

expect(response.error).toBeUndefined();
```

## 🔄 Testes com Dependências

### Teste Sequential (Quando Necessário)

```typescript
// ✅ Preferência: Testes independentes
test("should add ingredient", async ({ authenticatedPage }) => {
  // Não depende de outros testes
});

test("should generate recipe", async ({ authenticatedPage }) => {
  // Não depende de outros testes
});

// Quando é necessário ordem:
test.describe.serial("Recipe Generation Flow", () => {
  test("step 1: user has ingredients", async ({ authenticatedPage }) => {
    // Step 1
  });

  test("step 2: generate recipe", async ({ authenticatedPage }) => {
    // Executa após step 1
  });

  test("step 3: save recipe", async ({ authenticatedPage }) => {
    // Executa após step 2
  });
});
```

## 📈 Boas Práticas Finais

### Checklist para Cada Teste

- [ ] Nome descritivo em português/inglês claro
- [ ] Usa fixture `authenticatedPage` para testes autenticados
- [ ] Segue padrão AAA (Arrange, Act, Assert)
- [ ] Seletores robustos (data-testid preferível)
- [ ] Sem timeouts fixos
- [ ] Sem testes interdependentes
- [ ] Sem dados hardcoded (usar .env quando possível)
- [ ] Isolado e idempotente (pode rodar múltiplas vezes)
- [ ] Documentado com comentários se necessário
- [ ] Rápido (< 10s idealmente)

### Performance

```typescript
// ❌ Lento: Múltiplas navegações
test("slow test", async ({ authenticatedPage }) => {
  await authenticatedPage.goto("/page1");
  // ... teste ...
  await authenticatedPage.goto("/page2");
  // ... teste ...
});

// ✅ Rápido: Reaproveitar contexto
test("fast test", async ({ authenticatedPage }) => {
  await authenticatedPage.goto("/page1");
  // ... teste 1 ...

  // Ou usar fixtures pré-configuradas
  await authenticatedPage.goto("/page2");
  // ... teste 2 ...
});
```

## 🚀 Próximos Passos

1. Escrever testes para cada feature
2. Configurar hooks `beforeEach` e `afterEach` para limpeza
3. Adicionar testes de erro (casos negativos)
4. Adicionar testes de acessibilidade
5. Integrar com CI/CD
6. Monitorar cobertura de testes

---

**Leia também**: [playwright-testing.md](playwright-testing.md)
