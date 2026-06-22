# 🎭 Agente: Testes de Autenticação Clerk

## Visão Geral

Este agente é responsável por implementar, executar e manter os testes E2E para o fluxo de autenticação com Clerk no FazAI. Segue o plano de testes definido em `test-plan-clerk-authentication.md`.

---

## 🎯 Responsabilidades

- ✅ Criar arquivos de teste baseados nos cenários do plano
- ✅ Implementar fixtures de autenticação reutilizáveis
- ✅ Executar testes localmente antes de commitar
- ✅ Gerar e revisar relatórios de cobertura
- ✅ Manter testes atualizados com mudanças na especificação
- ✅ Documentar falhas e problemas descobertos

---

## 📁 Arquivos Gerenciados

```
apps/frontend/tests/
├── fixtures/
│   └── auth.ts                           # Fixture de autenticação
├── specs/
│   ├── 01-auth-login.test.ts            # Testes: Login, Email/Senha
│   ├── 02-auth-protection.test.ts       # Testes: Proteção de rotas
│   ├── 03-api-auth.test.ts              # Testes: Validação de API
│   └── 04-auth-integration.test.ts      # Testes: Integração
├── global.setup.ts                       # Setup global
├── config.ts                             # Configurações
└── playwright.config.ts                  # Config do Playwright
.env.test                                 # Variáveis de teste
.env.test.example                         # Modelo de variáveis
playwright-testing.md                    # Documentação
playwright-best-practices.md             # Boas práticas
```

---

## 🔄 Workflow de Trabalho

### 1️⃣ Planejamento

```bash
# Revisar o plano de testes
cat test-plan-clerk-authentication.md

# Verificar status de implementação
grep "Status" test-plan-clerk-authentication.md
```

### 2️⃣ Implementação

```bash
# Criar arquivo de teste para cenário
touch apps/frontend/tests/specs/01-auth-login.test.ts

# Implementar casos de teste seguindo padrão AAA
# (Arrange, Act, Assert)
```

### 3️⃣ Validação Local

```bash
# Terminal 1: Iniciar app
cd apps/frontend
npm run dev

# Terminal 2: Rodar testes
cd apps/frontend
npm run test:e2e

# Ver relatório
npm run test:e2e:report
```

### 4️⃣ CI/CD Integration

```bash
# Configurar em GitHub Actions
.github/workflows/playwright.yml

# Testes rodam automaticamente em PRs
```

---

## 📋 Checklist por Cenário

### Cenário 01: Login com Credenciais Válidas

- [ ] Arquivo: `01-auth-login.test.ts`
- [ ] Teste implementado
- [ ] Passa localmente: `npm run test:e2e`
- [ ] Validações do token implemented
- [ ] Documentação atualizada

### Cenário 02: Email Não Registrado

- [ ] Arquivo: `01-auth-login.test.ts`
- [ ] Teste implementado
- [ ] Mensagem de erro verificada
- [ ] Passa em CI/CD

### Cenário 03: Senha Incorreta

- [ ] Arquivo: `01-auth-login.test.ts`
- [ ] Teste implementado
- [ ] Erro tratado corretamente
- [ ] Token não é criado

### Cenário 04: Proteção de Rotas

- [ ] Arquivo: `02-auth-protection.test.ts`
- [ ] Redirecionamento funciona
- [ ] localStorage é validado
- [ ] Testes independentes

### Cenário 05: Logout

- [ ] Arquivo: `01-auth-login.test.ts`
- [ ] Token é removido
- [ ] Redirecionamento funciona
- [ ] Re-acesso a rotas privadas falha

### Cenário 06: Token Inválido

- [ ] Arquivo: `03-api-auth.test.ts`
- [ ] HTTP 401 retornado
- [ ] Mensagem de erro estruturada
- [ ] Middleware valida token

### Cenário 07: Auth Status

- [ ] Arquivo: `03-api-auth.test.ts`
- [ ] Endpoint retorna dados corretos
- [ ] UserId é fornecido
- [ ] Validação de resposta

### Cenário 08: Pantry Autenticada

- [ ] Arquivo: `04-auth-integration.test.ts`
- [ ] Carregamento da página funciona
- [ ] Dados isolados por userId
- [ ] Teste ponta-a-ponta

### Cenário 09: Validação de Email

- [ ] Arquivo: `01-auth-login.test.ts`
- [ ] Formato validado
- [ ] Botão desabilitado até válido
- [ ] Mensagem de erro clara

### Cenário 10: CORS e Headers

- [ ] Arquivo: `03-api-auth.test.ts`
- [ ] Headers de segurança presentes
- [ ] `X-Content-Type-Options` verificado
- [ ] CORS configurado

---

## 🛠️ Comandos Úteis

```bash
# Setup inicial
./setup-playwright.sh

# Rodar todos os testes
cd apps/frontend
npm run test:e2e

# Watch mode (reexecuta ao salvar)
npm run test:e2e:watch

# Debug mode (abre UI do Playwright)
npm run test:e2e:debug

# Gerar relatório
npm run test:e2e:report

# Roar teste específico
npx playwright test 01-auth-login.test.ts

# Rodar teste específico com verbose
npx playwright test --verbose 01-auth-login.test.ts

# Limpar relatórios antigos
rm -rf playwright-report test-results
```

---

## 🔍 Padrões de Teste

### Padrão AAA (Arrange, Act, Assert)

```typescript
import { test, expect } from "./fixtures/auth";

test("should login with valid credentials", async ({ authenticatedPage }) => {
  // ARRANGE: Preparar o estado
  const testEmail = process.env.TEST_USER_EMAIL;
  const testPassword = process.env.TEST_USER_PASSWORD;

  // ACT: Executar a ação
  await authenticatedPage.goto("http://localhost:5173");
  await authenticatedPage.waitForLoadState("networkidle");

  // ASSERT: Verificar o resultado
  const userMenu = authenticatedPage.locator('[data-testid="user-menu"]');
  await expect(userMenu).toBeVisible();
});
```

### Verificação de Token

```typescript
// Verificar que token foi salvo
const token = await authenticatedPage.evaluate(() => {
  return localStorage.getItem("__clerk_db_jwt");
});
expect(token).toBeTruthy();

// Verificar estrutura do token
expect(token).toMatch(/^eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/);
```

### Testes de API

```typescript
// Requisição com autenticação
const response = await authenticatedPage.evaluate(
  async (url, token) => {
    const res = await fetch(`${url}/auth-status`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return {
      status: res.status,
      body: await res.json(),
    };
  },
  process.env.API_URL,
  token,
);

expect(response.status).toBe(200);
expect(response.body.userId).toBeTruthy();
```

---

## 📊 Métricas de Teste

### Cobertura Esperada

- **Linhas de Código:** > 80%
- **Branches:** > 75%
- **Functions:** > 80%
- **Statements:** > 80%

### Performance

- **Tempo por Teste:** < 10 segundos
- **Total por Suite:** < 2 minutos
- **Setup:** < 30 segundos

---

## 🔧 Troubleshooting

### Teste não encontra elemento

```bash
# Use debug mode para inspecionar DOM
npm run test:e2e:debug

# Ou aumente timeout
await expect(element).toBeVisible({ timeout: 30000 });
```

### Timeout na autenticação

```bash
# Verificar se variedades .env.test estão corretas
cat apps/frontend/.env.test

# Verificar se Clerk Dashboard está acessível
curl https://seu-instance.clerk.accounts.com
```

### Teste flakky (instável)

```bash
# Adicionar waits explícitos
await page.waitForLoadState('networkidle');

# Ou verificar elemento
await expect(element).toBeVisible({ timeout: 5000 });
```

---

## 📚 Referências

- [test-plan-clerk-authentication.md](../../test-plan-clerk-authentication.md)
- [playwright-testing.md](../../apps/frontend/tests/docs/playwright-testing.md)
- [Clerk Design Document](../../openspec/changes/02-auth-clerk-integration/design.md)
- [Clerk Proposal](../../openspec/changes/02-auth-clerk-integration/proposal.md)

---

## 🎓 Próximas Ações

1. ✅ Plano de testes criado
2. ⏳ Implementar arquivo `01-auth-login.test.ts`
3. ⏳ Implementar `02-auth-protection.test.ts`
4. ⏳ Implementar `03-api-auth.test.ts`
5. ⏳ Implementar `04-auth-integration.test.ts`
6. ⏳ Rodar todos os testes localmente
7. ⏳ Revisar cobertura e falhas
8. ⏳ Integrar com CI/CD

---

**Criado em:** 22 de junho de 2026  
**Versão:** 1.0  
**Status:** ✅ Pronto para Início de Implementação
