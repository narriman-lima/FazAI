# ✅ Playwright + Clerk Testing Setup Checklist

## 📋 Pré-Configuração

Use esta lista de verificação para garantir que todos os passos foram executados corretamente.

### 1. Configuração do Clerk

- [ ] Conta criada em [clerk.com](https://clerk.com)
- [ ] Projeto criado no Clerk Dashboard
- [ ] API Keys copiadas:
  - [ ] `VITE_CLERK_PUBLISHABLE_KEY` (chave pública)
  - [ ] `CLERK_SECRET_KEY` (chave secreta)
- [ ] Usuário de teste criado em Clerk
  - [ ] Email: ********\_\_********
  - [ ] Senha: ********\_\_******** (não compartilhar!)

### 2. Arquivo de Configuração

- [ ] Arquivo `.env.test` criado na pasta `apps/frontend/`
- [ ] `.env.test` preenchido corretamente:
  ```env
  VITE_CLERK_PUBLISHABLE_KEY=pk_test_***
  CLERK_SECRET_KEY=sk_test_***
  TEST_USER_EMAIL=seu@email.com
  TEST_USER_PASSWORD=senhaSegura123!
  VITE_APP_URL=http://localhost:5173
  API_URL=http://localhost:3001/api/v1
  ```
- [ ] `.env.test` está no `.gitignore` ✅ (já configurado)

### 3. Instalação e Dependências

- [ ] `npm install` executado na raiz do monorepo
- [ ] Dependências do frontend atualizadas:
  ```bash
  cd apps/frontend
  npm install dotenv @playwright/test
  ```
- [ ] Dependências do backend atualizadas (se necessário)

### 4. Scripts de Teste

No `apps/frontend/package.json`:

- [ ] `test:e2e` - Executar testes
- [ ] `test:e2e:watch` - Watch mode
- [ ] `test:e2e:debug` - Modo debug com UI
- [ ] `test:e2e:report` - Ver relatório HTML

### 5. Estrutura de Testes

- [ ] Pasta `apps/frontend/tests/` criada
- [ ] Arquivo `tests/global.setup.ts` ✅ (validar ambiente)
- [ ] Pasta `tests/fixtures/` com autenticação ✅
- [ ] Exemplos de testes criados ✅
  - [ ] `e2e.test.ts` (testes funcionais)
  - [ ] `a11y.test.ts` (testes de acessibilidade)

### 6. Configuração do Playwright

- [ ] `playwright.config.ts` atualizado com:
  - [ ] Carregamento do `.env.test`
  - [ ] Global setup configurado
  - [ ] Base URL definida
  - [ ] Web server configurado
  - [ ] Reporters habilitados (HTML, JSON, list)

### 7. Documentação

- [ ] Lido o `playwright-testing.md`
- [ ] Entendido como usar o fixture `authenticatedPage`
- [ ] Exemplos de testes revisados

## 🚀 Teste Rápido

```bash
# Na pasta raiz do projeto
cd apps/frontend

# Executar um teste de exemplo
npm run test:e2e

# Se funcionar, você verá:
# ✓ Autenticação com Clerk
# ✓ Usuário autenticado deve ver seu email no perfil
# ✓ Testes de pantry, receitas, etc.

# Ver relatório
npm run test:e2e:report
```

## 🔍 Verificações Importantes

### Verificar Clerk Keys

```bash
# Na pasta apps/frontend
grep "VITE_CLERK_PUBLISHABLE_KEY" .env.test
# Deve retornar algo como: pk_test_***

grep "CLERK_SECRET_KEY" .env.test
# Deve retornar algo como: sk_test_***
```

### Verificar Usuário de Teste

```bash
# Ir para https://dashboard.clerk.com
# Users → Encontrar seu usuário de teste
# Verificar se email and senha estão corretos em .env.test
```

### Verificar URLs

```bash
# Em .env.test
grep "VITE_APP_URL" .env.test     # http://localhost:5173
grep "API_URL" .env.test          # http://localhost:3001/api/v1
grep "CLERK_FRONTEND_API" .env.test  # https://seu-instance.clerk.accounts.com
```

## 🐛 Troubleshooting

### Erro: "Cannot read property 'split' of undefined"

- Verificar se `.env.test` existe
- Verificar se variáveis estão preenchidas
- Executar: `npm run test:e2e:debug`

### Erro: "Timeout waiting for authentication"

- Verificar credenciais do usuário em Clerk Dashboard
- Verificar senha em `.env.test`
- Tentar fazer login manualmente no site

### Erro: "Page not launching"

- Certificar que a app está rodando: `npm run dev`
- Verificar URL em `VITE_APP_URL`
- Verificar porta (padrão 5173)

### Erro: "Test timeout"

- Aumentar timeout em `playwright.config.ts`
- Usar `--debug` para ver o que está acontecendo
- Verificar se Clerk está respondendo lentamente

## 📞 Suporte

1. Consulte [playwright-testing.md](apps/frontend/playwright-testing.md)
2. Consulte [Playwright Docs](https://playwright.dev)
3. Consulte [Clerk Docs](https://clerk.com/docs)
4. Consulte [AGENTS.md](.agents/AGENTS.md)

---

**Status**: ✅ Setup concluído quando todos os itens estiverem marcados!
