# Proposal: 01-monorepo-db-setup

## Objetivo
Configurar a fundação do monorepo unificado, estruturar as pastas do frontend e backend, inicializar o Prisma ORM apontando para o PostgreSQL do Supabase, definir as variáveis de ambiente necessárias e implementar as checagens do linter e compilação iniciais via CI/CD.

---

## Escopo Funcional
*   **Workspaces**: Criação de `apps/frontend/` (React + TypeScript) e `apps/backend/` (Node.js/Express ou Fastify).
*   **Prisma ORM**: Inicialização do Prisma na pasta do backend, com a criação do schema inicial PostgreSQL.
*   **Configuração de Builds**: Configuração de scripts NPM na raiz (`npm run build`, `npm run dev`) integrando a execução do linter e checagem de tipos estáticos.
*   **CI/CD Pipeline**: Configuração básica do GitHub Actions para validar `npm install`, compilação global e `npx tsc --noEmit` contra erros de tipo.

---

## Dependências
*   Nenhuma (primeira mudança estrutural do projeto).

---

## Riscos e Mitigações
*   **Risco**: Variáveis de ambiente (`DATABASE_URL`, `DIRECT_URL`) mal configuradas no Supabase travando a inicialização local.
*   **Mitigação**: Criar um arquivo `.env.example` robusto e documentar passo a passo de conexão rápida com o Supabase local.

---

## Execução de Linter Necessária
*   **Comando**: `npx eslint apps/ --ext .ts,.tsx` e `npx tsc --noEmit` na raiz do monorepo.
*   **Regras**: Tipagem forte estrita (erro ao usar `any`).

---

## Testes Unitários Necessários
*   **Foco**: Validar utilitários de configuração de variáveis de ambiente.
*   **Ferramentas**: Vitest/Jest. Testar se as variáveis de conexão com o banco são devidamente validadas e lançam erros significativos quando ausentes.

---

## Testes de Integração Necessários
*   **Foco**: Testar a conectividade ativa com a base PostgreSQL do Supabase.
*   **Cenário**: Executar uma query de ping (`SELECT 1`) usando o `PrismaClient` para validar se a conexão e autenticação no Supabase estão íntegras.

---

## Testes E2E Necessários
*   **Foco**: N/A nesta fase estrutural inicial (sem interface web).
