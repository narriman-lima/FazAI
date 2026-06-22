# 🎭 Plano de Testes: Fluxo de Autenticação com Clerk

**Projeto:** FazAI  
**Módulo:** Autenticação e Login (INT-001)  
**Data de Criação:** 22 de junho de 2026  
**Status:** ✅ Pronto para Implementação

---

## 📋 Escopo de Testes

Este plano cobre testes E2E para o fluxo completo de autenticação usando Clerk, incluindo:

- ✅ Login com email/senha válidos
- ✅ Handling de credenciais inválidas
- ✅ Proteção de rotas privadas
- ✅ Redirecionamento de usuário não autenticado
- ✅ Logout e limpeza de sessão
- ✅ Validação de token JWT no backend

---

## 🎯 Cenários de Teste

### **CENÁRIO 01: Login com Credenciais Válidas**

**Objetivo:** Verificar que um usuário consegue fazer login com email e senha corretos e é redirecionado para a aplicação principal.

**Tipo:** Happy Path (Caminho Feliz)  
**Prioridade:** 🔴 CRÍTICO

#### Pré-condições

- Usuário de teste criado no Clerk Dashboard
- Aplicação está acessível em `http://localhost:5173`
- Backend está acessível em `http://localhost:3001/api/v1`

#### Passos

1. Acessar a aplicação (página inicial)
2. Verificar se o usuário é redirecionado para a tela de login do Clerk
3. Preencher campo de **Email** com email válido (`TEST_USER_EMAIL` do `.env.test`)
4. Clicar no botão **Continuar** ou **Next**
5. Aguardar a exibição do campo de senha
6. Preencher campo de **Senha** com senha correta (`TEST_USER_PASSWORD`)
7. Clicar no botão **Continuar** ou **Sign In**
8. Aguardar redirecionamento para `/`
9. Verificar se a dashboard/home está carregada

#### Resultado Esperado

- ✅ Usuário é redirecionado para a página inicial ou dashboard
- ✅ Elemento de usuário logado está visível (avatar, nome ou email)
- ✅ Token JWT é armazenado em `localStorage` (chave `__clerk_db_jwt`)
- ✅ Não existem mensagens de erro visíveis

#### Validações Adicionais

```typescript
// Verificar token em localStorage
const token = localStorage.getItem("__clerk_db_jwt");
expect(token).toBeTruthy();

// Verificar status da API
const res = await fetch("http://localhost:3001/api/v1/auth-status", {
  headers: { Authorization: `Bearer ${token}` },
});
expect(res.status).toBe(200);
```

---

### **CENÁRIO 02: Rejeição - Email Não Registrado**

**Objetivo:** Verificar que o sistema rejeita login com email que não existe no banco de dados do Clerk.

**Tipo:** Teste Negativo (Validação de Erro)  
**Prioridade:** 🟡 ALTA

#### Pré-condições

- Página de login do Clerk está visível
- Email não existe em nenhum usuário registrado no Clerk

#### Passos

1. Acessar a tela de login
2. Preencher campo de **Email** com `nonexistent@example.com`
3. Clicar em **Continuar**
4. Sistema exibe mensagem de erro

#### Resultado Esperado

- ✅ Mensagem de erro visível: "This email address is not registered"
- ✅ Usuário permanece na tela de login
- ✅ Campo de email permanece preenchido
- ✅ Nenhum token é salvo em localStorage

---

### **CENÁRIO 03: Rejeição - Senha Incorreta**

**Objetivo:** Verificar que o sistema rejeita login com senha incorreta, mesmo com email válido.

**Tipo:** Teste Negativo (Validação de Erro)  
**Prioridade:** 🟡 ALTA

#### Pré-condições

- Página de login está visível
- Email válido de usuário de teste está carregado
- Campo de senha é exibido

#### Passos

1. Acessar a tela de login
2. Preencher email com `TEST_USER_EMAIL` (válido)
3. Clicar em **Continuar**
4. Preencher campo de senha com `WrongPassword123!`
5. Clicar em **Continuar**
6. Sistema exibe mensagem de erro

#### Resultado Esperado

- ✅ Mensagem de erro visível: "Password is incorrect"
- ✅ Usuário permanece na tela de login (campo de senha)
- ✅ Nenhum redirecionamento ocorre
- ✅ Nenhum token é salvo em localStorage

---

### **CENÁRIO 04: Redirecionamento - Usuário Não Autenticado**

**Objetivo:** Verificar que rotas privadas redirecionam usuários não autenticados para login.

**Tipo:** Teste de Segurança  
**Prioridade:** 🔴 CRÍTICO

#### Pré-condições

- Aplicação está limpa (sem sessão ativa)
- localStorage está vazio (sem token)
- Aplicação está acessível

#### Passos

1. Limpar localStorage: `localStorage.clear()`
2. Acessar rota privada diretamente: `/pantry`
3. Aguardar redirecionamento

#### Resultado Esperado

- ✅ Navegador é redirecionado para tela de login
- ✅ URL muda para a URL de login do Clerk (ou `/login`)
- ✅ Nenhum conteúdo privado é visível

---

### **CENÁRIO 05: Logout - Encerramento de Sessão**

**Objetivo:** Verificar que o usuário consegue fazer logout e sua sessão é encerrada.

**Tipo:** Teste Funcional  
**Prioridade:** 🟡 ALTA

#### Pré-condições

- Usuário está autenticado
- Está na página da aplicação (ex: dashboard)
- Botão/menu de logout está visível

#### Passos

1. Localizar o menu de usuário ou botão de logout
2. Clicar no botão **Sair** / **Logout** / ícone de usuário
3. Clicar em **Logout** no menu suspenso
4. Aguardar redirecionamento

#### Resultado Esperado

- ✅ Usuário é redirecionado para página pública (ou login)
- ✅ Token é removido de localStorage
- ✅ Ao tentar acessar `/pantry`, é redirecionado para login novamente
- ✅ Nenhuma informação do usuário anterior é visível

#### Validações Adicionais

```typescript
// Verificar que token foi removido
const token = localStorage.getItem("__clerk_db_jwt");
expect(token).toBeNull();
```

---

### **CENÁRIO 06: Proteção de API - Token Inválido**

**Objetivo:** Verificar que a API rejeita requisições com token inválido ou expirado.

**Tipo:** Teste de Integração (Backend)  
**Prioridade:** 🔴 CRÍTICO

#### Pré-condições

- Backend está rodando
- Rota `/api/v1/pantry` está protegida com middleware `requireAuth`

#### Passos

1. Fazer requisição para `/api/v1/pantry` **sem** header de autenticação
2. Verificar resposta HTTP
3. Fazer requisição com header `Authorization: Bearer invalid_token_123`
4. Verificar resposta HTTP

#### Resultado Esperado

- ✅ Requisição sem token retorna: **HTTP 401 Unauthorized**
  ```json
  { "error": "Unauthorized" }
  ```
- ✅ Requisição com token inválido retorna: **HTTP 401 Unauthorized**
  ```json
  { "error": "Unauthorized" }
  ```

#### Implementação em Teste

```typescript
test("API rejects request without auth token", async ({
  authenticatedPage,
}) => {
  const response = await authenticatedPage.evaluate(async (url) => {
    const res = await fetch(`${url}/pantry`);
    return {
      status: res.status,
      body: await res.json(),
    };
  }, "http://localhost:3001/api/v1");

  expect(response.status).toBe(401);
  expect(response.body.error).toBe("Unauthorized");
});
```

---

### **CENÁRIO 07: Validação de API - Auth Status**

**Objetivo:** Verificar que o endpoint `/api/v1/auth-status` retorna informações corretas do usuário autenticado.

**Tipo:** Teste de Integração  
**Prioridade:** 🟡 ALTA

#### Pré-condições

- Usuário está autenticado
- Token válido está em localStorage
- Endpoint `/api/v1/auth-status` está implementado

#### Passos

1. Fazer requisição GET para `/api/v1/auth-status`
2. Incluir header: `Authorization: Bearer <TOKEN_DO_LOCALSTORAGE>`
3. Verificar resposta

#### Resultado Esperado

- ✅ HTTP 200 OK
- ✅ Resposta contém:
  ```json
  {
    "authenticated": true,
    "userId": "user_1a2b3c4d5e6f7g8h"
  }
  ```

#### Implementação em Teste

```typescript
test("Auth status endpoint returns user info", async ({
  authenticatedPage,
}) => {
  const response = await authenticatedPage.evaluate(async (url) => {
    const token = localStorage.getItem("__clerk_db_jwt");
    const res = await fetch(`${url}/auth-status`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.json();
  }, "http://localhost:3001/api/v1");

  expect(response.authenticated).toBe(true);
  expect(response.userId).toBeTruthy();
});
```

---

### **CENÁRIO 08: Integração - Pantry com Autenticação**

**Objetivo:** Verificar que a página de pantry carrega corretamente para usuário autenticado e dados são isolados por userId.

**Tipo:** Teste de Integração (Ponta a Ponta)  
**Prioridade:** 🟡 ALTA

#### Pré-condições

- Usuário está autenticado
- Está na tela da aplicação principal
- Rota `/pantry` está implementada

#### Passos

1. Navegar para `/pantry`
2. Verificar se página carrega sem erros
3. Verificar se a lista de ingredientes é exibida (vazia ou com itens)
4. Fazer logout
5. Tentar acessar `/pantry` novamente

#### Resultado Esperado

- ✅ Usuário autenticado consegue acessar `/pantry`
- ✅ Página carrega sem erros 500
- ✅ Dados mostrados pertencem apenas ao usuário autenticado
- ✅ Após logout, `/pantry` redireciona para login

---

### **CENÁRIO 09: Validação - Formato de Email**

**Objetivo:** Verificar que o formulário de login valida o formato do email.

**Tipo:** Teste de Validação (Formulário)  
**Prioridade:** 🟢 MÉDIA

#### Pré-condições

- Tela de login está visível
- Campo de email está vazio

#### Passos

1. Preencher campo com `invalid-email`
2. Clicar em **Continuar**
3. Verificar validação

#### Resultado Esperado

- ✅ Mensagem de erro: "Please enter a valid email"
- ✅ Botão de continuar permanece desabilitado até email válido
- ✅ Nenhuma requisição é enviada

---

### **CENÁRIO 10: Segurança - CORS e Headers**

**Objetivo:** Verificar que a API respeita políticas de CORS e segurança de headers.

**Tipo:** Teste de Segurança  
**Prioridade:** 🟡 ALTA

#### Pré-condições

- Backend está rodando
- Token válido está disponível

#### Passos

1. Fazer requisição com Origin incorreta
2. Verificar headers de resposta CORS
3. Fazer requisição normal e verificar headers de segurança

#### Resultado Esperado

- ✅ Headers `X-Content-Type-Options: nosniff` presentes
- ✅ Headers `X-Frame-Options: DENY` ou `SAMEORIGIN` presentes
- ✅ CORS está configurado para aceitar apenas origins permitidas

#### Implementação em Teste

```typescript
test("API returns security headers", async ({ authenticatedPage }) => {
  const response = await authenticatedPage.request.get(
    "http://localhost:3001/api/v1/auth-status",
    {
      headers: {
        Authorization: `Bearer ${await getToken()}`,
      },
    },
  );

  expect(response.headers()["x-content-type-options"]).toBe("nosniff");
  expect(response.status()).toBe(200);
});
```

---

## 📊 Matriz de Cobertura de Testes

| Cenário                    | Tipo       | Prioridade | Status          | Arquivo de Teste        |
| -------------------------- | ---------- | ---------- | --------------- | ----------------------- |
| 01 - Login Válido          | Happy Path | 🔴 Crítico | ⏳ Não iniciado | auth.test.ts            |
| 02 - Email Inválido        | Negativo   | 🟡 Alta    | ⏳ Não iniciado | auth.test.ts            |
| 03 - Senha Incorreta       | Negativo   | 🟡 Alta    | ⏳ Não iniciado | auth.test.ts            |
| 04 - Redirecionar Sem Auth | Segurança  | 🔴 Crítico | ⏳ Não iniciado | auth-protection.test.ts |
| 05 - Logout                | Funcional  | 🟡 Alta    | ⏳ Não iniciado | auth.test.ts            |
| 06 - Token Inválido        | Integração | 🔴 Crítico | ⏳ Não iniciado | api-auth.test.ts        |
| 07 - Auth Status           | Integração | 🟡 Alta    | ⏳ Não iniciado | api-auth.test.ts        |
| 08 - Pantry Autenticada    | Integração | 🟡 Alta    | ⏳ Não iniciado | pantry-auth.test.ts     |
| 09 - Validação Email       | Validação  | 🟢 Média   | ⏳ Não iniciado | auth-validation.test.ts |
| 10 - CORS e Headers        | Segurança  | 🟡 Alta    | ⏳ Não iniciado | api-security.test.ts    |

---

## 🛠️ Configuração de Testes

### Estrutura de Diretórios Recomendada

```
apps/frontend/tests/
├── fixtures/
│   └── auth.ts                    # Fixture para autenticação
├── specs/
│   ├── 01-auth-login.test.ts      # Testes de login
│   ├── 02-auth-protection.test.ts # Testes de proteção de rotas
│   ├── 03-api-auth.test.ts        # Testes de validação API
│   └── 04-auth-integration.test.ts # Testes de integração
├── global.setup.ts                # Setup global
└── config.ts                       # Configurações
```

### Dependências Necessárias

```json
{
  "devDependencies": {
    "@playwright/test": "^1.61.0",
    "dotenv": "^16.4.5"
  }
}
```

### Variáveis de Ambiente (`.env.test`)

```env
# Clerk
VITE_CLERK_PUBLISHABLE_KEY=pk_test_***
CLERK_SECRET_KEY=sk_test_***
CLERK_FRONTEND_API=https://seu-instance.clerk.accounts.com

# Test User
TEST_USER_EMAIL=seu-teste@example.com
TEST_USER_PASSWORD=SenhaSegura123!

# URLs
VITE_APP_URL=http://localhost:5173
API_URL=http://localhost:3001/api/v1
```

---

## ✅ Checklist de Execução

### Antes de Iniciar Testes

- [ ] `.env.test` está configurado com credenciais válidas
- [ ] Clerk Dashboard está acessível
- [ ] Usuário de teste existe no Clerk
- [ ] Aplicação (frontend) está rodando em `http://localhost:5173`
- [ ] Backend está rodando em `http://localhost:3001`
- [ ] Middleware `requireAuth` está implementado no backend
- [ ] Endpoint `/api/v1/auth-status` está implementado

### Durante Testes

- [ ] Todos os 10 cenários foram executados
- [ ] Nenhum elemento sensível (senhas, tokens) está visible nos logs
- [ ] Testes rodam independentemente (podem ser executados em qualquer ordem)
- [ ] Limpeza de estado entre testes funcionando corretamente

### Após Testes

- [ ] Relatório HTML foi gerado: `npm run test:e2e:report`
- [ ] Todos os testes passaram ou falhas foram documentadas
- [ ] Screenshots e vídeos de falhas estão em `test-results/`
- [ ] Documentação foi atualizada se necessário

---

## 📝 Documentação de Referência

- [Playwright Testing Guide](../../apps/frontend/tests/docs/playwright-testing.md)
- [Playwright Best Practices](../../apps/frontend/tests/docs/playwright-best-practices.md)
- [Clerk Integration Design](openspec/changes/02-auth-clerk-integration/design.md)
- [Clerk Integration Proposal](openspec/changes/02-auth-clerk-integration/proposal.md)

---

## 🚀 Próximos Passos

1. ✅ Revisar este plano de testes com o time
2. ⏳ Implementar os arquivos de teste em `apps/frontend/tests/specs/`
3. ⏳ Executar testes localmente
4. ⏳ Validar cobertura de cenários
5. ⏳ Integrar testes ao CI/CD (GitHub Actions)
6. ⏳ Documentar resultados e aprendizados

---

**Plano de Testes Criado:** 22 de junho de 2026  
**Versão:** 1.0  
**Status:** ✅ Pronto para Implementação
