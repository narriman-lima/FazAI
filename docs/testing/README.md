# Documentação de Testes - FazAI

Este diretório contém toda a documentação relacionada aos testes automatizados do projeto FazAI.

## 📊 Status Atual

```
✓ 24 testes passando (chromium + firefox)
⏭️  2 skipados (condicionais)
✘ 0 falhando
```

## 📝 Documentos

### Planos de Teste

- **[test-plan-clerk-authentication.md](./test-plan-clerk-authentication.md)** — Plano detalhado com 10 cenários para autenticação com Clerk
- **[test-plan-summary.md](./test-plan-summary.md)** — Resumo executivo

### Status e Roadmap

- **[delivery-test-plan.md](./delivery-test-plan.md)** — Status de entrega e métricas
- **[next-actions-test-plan.md](./next-actions-test-plan.md)** — Próximas ações e timeline
- **[navigation-test-plan.md](./navigation-test-plan.md)** — Guia de navegação

## 🔗 Recursos Relacionados

### Documentação Playwright (Frontend)

- [playwright-testing.md](../../apps/frontend/tests/docs/playwright-testing.md) — Guia completo de setup
- [playwright-best-practices.md](../../apps/frontend/tests/docs/playwright-best-practices.md) — Padrões recomendados
- [playwright-setup-checklist.md](../../apps/frontend/tests/docs/playwright-setup-checklist.md) — Checklist de instalação

### Agentes e Automação

- [.agents/sections/clerk-authentication-testing.md](../../.agents/sections/clerk-authentication-testing.md) — Orquestração de agentes
- [.agents/sections/testing/prompts-test-generation.md](../../.agents/sections/testing/prompts-test-generation.md) — Prompts para geração de testes

### Prompts Playwright (Opencode)

- [.opencode/prompts/playwright-test-generator.md](../../.opencode/prompts/playwright-test-generator.md)
- [.opencode/prompts/playwright-test-planner.md](../../.opencode/prompts/playwright-test-planner.md)
- [.opencode/prompts/playwright-test-healer.md](../../.opencode/prompts/playwright-test-healer.md)

## 🚀 Quick Start

```bash
# Configurar ambiente
cd apps/frontend
npm install
cp .env.test.example .env.test
# Edite .env.test com suas credenciais

# Rodar testes
npm run test:e2e

# Ver relatório HTML
npx playwright show-report
```

## 📁 Estrutura Completa de Arquivos

```
FazAI/
├── docs/testing/                              # 📋 Documentação de Testes
│   ├── README.md (você está aqui)
│   ├── test-plan-clerk-authentication.md
│   ├── test-plan-summary.md
│   ├── delivery-test-plan.md
│   ├── next-actions-test-plan.md
│   └── navigation-test-plan.md
│
├── .agents/sections/
│   ├── clerk-authentication-testing.md        # 🤖 Orquestração de Agentes
│   └── testing/
│       └── prompts-test-generation.md         # 💬 Templates de Prompts
│
├── .opencode/prompts/                         # 🎭 Prompts Playwright
│   ├── playwright-test-generator.md
│   ├── playwright-test-planner.md
│   └── playwright-test-healer.md
│
└── apps/frontend/
    ├── playwright.config.ts                   # ⚙️ Config Playwright
    ├── .env.test.example                      # 🔑 Template de credenciais
    └── tests/
        ├── docs/                              # 📖 Docs Playwright
        │   ├── playwright-testing.md
        │   ├── playwright-best-practices.md
        │   ├── playwright-setup-checklist.md
        │   └── setup-playwright.sh
        ├── fixtures/
        │   └── auth.ts                        # 🔐 Fixture de autenticação
        ├── specs/
        │   └── clerk-auth.test.ts             # ✅ Testes de Clerk
        ├── a11y.test.ts                       # ♿ Testes de acessibilidade
        ├── e2e.test.ts                        # 🌐 Smoke tests E2E
        ├── config.ts                          # ⚙️ Config compartilhada
        └── global.setup.ts                    # 🚀 Setup global
```

## 🎯 Padrão de Organização

| Local                | Propósito                            |
| -------------------- | ------------------------------------ |
| `docs/testing/`      | Documentação de testes para a equipe |
| `.agents/sections/`  | Orquestração de agentes de IA        |
| `.opencode/prompts/` | Prompts específicos do Opencode      |
| `apps/*/tests/docs/` | Documentação específica de cada app  |
| `apps/*/tests/`      | Implementação dos testes             |

---

**Última atualização:** 22 de junho de 2026
