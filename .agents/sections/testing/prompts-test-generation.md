# 🎭 Prompts para Geração Iterativa de Testes Clerk

Este arquivo contém prompts bem estrutturados para gerar código de teste de forma iterativa usando IA (GitHub Copilot, Claude, etc).

---

## 📝 Prompt 01: Gerar Teste de Login Válido

**Use Case:** Implementar o primeiro cenário do plano de testes (Happy Path)

````markdown
# Gerar Teste de Login com Credenciais Válidas

Usando o projeto FazAI, crie um teste Playwright que valide o fluxo de login com credenciais válidas.

## Contexto

- Projeto: FazAI (aplicação de receitas inteligentes)
- Framework: Playwright Test + Clerk Authentication
- Localização: apps/frontend/tests/specs/01-auth-login.test.ts
- Stack: TypeScript, React, Clerk, Playwright

## Especificação

Baseado em test-plan-clerk-authentication.md, Cenário 01:

**Objetivo:** Verificar que um usuário consegue fazer login com email e senha corretos

**Pré-condições:**

- Usuário de teste criado no Clerk Dashboard
- Aplicação está acessível em http://localhost:5173
- Backend está acessível em http://localhost:3001/api/v1

**Passos:**

1. Acessar a aplicação
2. Verificar redirecionamento para tela de login
3. Preencher email com TEST_USER_EMAIL
4. Clicar em Continuar
5. Preencher senha com TEST_USER_PASSWORD
6. Clicar em Continuar
7. Aguardar redirecionamento para /
8. Verificar dashboard carregada

**Resultado Esperado:**

- Token JWT está em localStorage
- Usuário logado está visível na UI
- Nenhuma mensagem de erro

## Requerimentos técnicos

- Use o fixture `authenticatedPage` de tests/fixtures/auth.ts
- Siga padrão AAA (Arrange, Act, Assert)
- Implemente validações de token JWT
- Use data-testid para seletores
- Adicione comentários explicativos
- Sem dados hardcoded

## Exemplo de estrutura esperada

```typescript
import { test, expect } from "../fixtures/auth";

test.describe("Authentication: Login", () => {
  test("should login with valid credentials", async ({ authenticatedPage }) => {
    // ARRANGE
    // ACT
    // ASSERT
  });
});
```
````

Implemente o teste completo com todas as validações descritas.

````

---

## 📝 Prompt 02: Gerar Teste de Erro de Credenciais

**Use Case:** Implementar testes negativos para validação de erros

```markdown
# Gerar Testes de Validação de Credenciais Inválidas

Crie dois testes Playwright para o projeto FazAI que validem:
1. Email não registrado
2. Senha incorreta

## Contexto
Projeto: FazAI | Framework: Playwright Test | Arquivo: apps/frontend/tests/specs/01-auth-login.test.ts

## Especificação (baseado em test-plan-clerk-authentication.md)

### Cenário 02: Email Não Registrado
- Usuário tenta fazer login com email que não existe
- Esperado: Mensagem de erro "This email address is not registered"
- Token NÃO deve ser criado
- Usuário permanece na tela de login

### Cenário 03: Senha Incorreta
- Usuário tenta fazer login com senha errada
- Esperado: Mensagem de erro "Password is incorrect"
- Token NÃO deve ser criado
- Usuário volta para tela de entrada de senha

## Requerimentos
- Usar fixture authenticatedPage quando necessário (ou page comum para testes negativos)
- Validar presença de mensagens de erro
- Verificar que token NÃO é criado em localStorage
- Usar seletores robustos (data-testid)
- Padrão AAA
- Independentes entre si

Implemente ambos os testes.
````

---

## 📝 Prompt 03: Gerar Teste de Proteção de Rotas

**Use Case:** Implementar testes de segurança para rotas privadas

```markdown
# Gerar Teste de Proteção de Rotas Privadas

Crie um teste Playwright que valide que rotas privadas são protegidas do acesso não autenticado.

## Contexto

Projeto: FazAI | Framework: Playwright Test | Arquivo: apps/frontend/tests/specs/02-auth-protection.test.ts

## Especificação (baseado em test-plan-clerk-authentication.md, Cenário 04)

**Objetivo:** Verificar que usuários não autenticados são redirecionados para login ao tentar acessar rotas privadas

**Passos:**

1. Limpar localStorage (simular usuário sem sessão)
2. Tentar acessar rota privada: /pantry
3. Verificar redirecionamento para tela de login
4. Verificar que URL mudou

**Resultado Esperado:**

- Usuário é redirecionado para login
- localStorage permanece vazio
- Nenhum conteúdo privado é visível

## Requerimentos técnicos

- NÃO usar authenticatedPage (queremos teste SEM autenticação)
- Usar page comum do Playwright
- Validar localStorage.clear() funciona
- Verificar URL final
- Timeout apropriado para navegação
- Documentar assumptions

Implemente o teste completo.
```

---

## 📝 Prompt 04: Gerar Testes de API com Autenticação

**Use Case:** Testar validação de JWT no backend

```markdown
# Gerar Testes de API: Validação de Token

Crie testes Playwright que validem a segurança da API backend.

## Contexto

Projeto: FazAI | Framework: Playwright Test | Arquivo: apps/frontend/tests/specs/03-api-auth.test.ts

## Especificação (baseado em test-plan-clerk-authentication.md)

### Cenário 06: Token Inválido

- Requisição SEM token Authorization
- Esperado: HTTP 401 Unauthorized com mensagem de erro
- Requisição COM token inválido
- Esperado: HTTP 401 Unauthorized

### Cenário 07: Auth Status

- Usuário autenticado acessa /api/v1/auth-status
- Esperado: HTTP 200 com { authenticated: true, userId: "..." }
- Validar que userId não é vazio

## Requerimentos

- Usar authenticatedPage para testes autenticados
- Usar fetch API via page.evaluate
- Extrair token de localStorage
- Validar respostas HTTP (status, body)
- Testar casos: sem header, header inválido, header válido
- Documentar URL da API em env var

Implemente ambos os testes com validações completas.
```

---

## 📝 Prompt 05: Gerar Teste de Logout

**Use Case:** Validar que logout funciona corretamente

```markdown
# Gerar Teste de Logout

Para o projeto FazAI, implemente um teste que valide o fluxo completo de logout.

## Contexto

Projeto: FazAI | Arquivo: apps/frontend/tests/specs/01-auth-login.test.ts

## Especificação (test-plan-clerk-authentication.md, Cenário 05)

**Objetivo:** Verificar que usuário consegue fazer logout e sessão é encerrada

**Passos:**

1. Usuário está autenticado (usar fixture authenticatedPage)
2. Localizar e clicar no menu de usuário (data-testid="user-menu")
3. Clicar em Logout (data-testid="logout-button")
4. Aguardar redirecionamento
5. Verificar que token foi removido do localStorage
6. Tentar acessar /pantry e verificar redirecionamento para login

**Validações:**

- Token removido de localStorage
- Redirecionamento funciona
- Re-acesso a rotas privadas falha
- UI não mostra dados de usuário anterior

## Requerimentos

- Usar authenticatedPage já logada
- Verificar localStorage.clear() equivalente
- Testar re-acesso a rota privada
- Independente de testes anteriores
- Documentação clara

Implemente o teste completo.
```

---

## 🛠️ Como Usar Estes Prompts

### Com GitHub Copilot no VS Code

1. Abrir arquivo de teste: `apps/frontend/tests/specs/01-auth-login.test.ts`
2. Copiar o prompt relevante para a chat do Copilot
3. Clicar em "Generate" ou submeter
4. Revisar código gerado
5. Fazer ajustes se necessário

### Com Claude ou ChatGPT

1. Copiar o prompt completo
2. Submeter em chat.openai.com ou claude.ai
3. Detalhar contexto se pedido
4. Copiar código para projeto
5. Testar localmente com `npm run test:e2e`

### Adaptando Prompts

Para um novo cenário não listado:

1. Referir-se ao test-plan-clerk-authentication.md
2. Incluir number do cenário (ex: "Cenário 09")
3. Detalhar passos passo-a-passo
4. Indicar resultado esperado
5. Mencionar constraints técnicas

---

## 📋 Checklist de Código Gerado

Após gerar código de teste, verificar:

- [ ] Imports estão corretos (fixtures, expect, etc)
- [ ] Usa data-testid para seletores (não classes)
- [ ] Padrão AAA está claro (Arrange, Act, Assert)
- [ ] Timeouts são explícitos quando necessário
- [ ] Não há `any` types no TypeScript
- [ ] Variáveis vêm de process.env
- [ ] Nenhuma senha/token hardcoded
- [ ] Comentários explicam lógica complexa
- [ ] Teste é independente (não depende de outro)
- [ ] Test data é limpo após teste

---

## 🔄 Fluxo de Trabalho Iterativo

```
1. Gerar Teste
   ↓
2. Revisar Código
   ↓
3. Testar Localmente (npm run test:e2e)
   ↓
4. Fazer Ajustes
   ↓
5. Validar em CI/CD
   ↓
6. Documentar Learnings
```

---

## 🚀 Próximas Gerações

Após implementar todos os prompts acima, considere gerar:

- **Teste de Integração:** Fluxo completo (login → pantry → logout)
- **Teste de Performance:** Tempo de login, latência de API
- **Teste de Acessibilidade:** Leitores de tela, navegação por teclado
- **Teste de Segurança:** CORS, headers, XSS prevention

---

**Última Atualização:** 22 de junho de 2026  
**Versão:** 1.0  
**Status:** ✅ Pronto para Uso
