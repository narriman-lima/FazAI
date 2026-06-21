# AGENTS.md — Diretrizes Operacionais (FazAI)

Diretrizes operacionais e políticas técnicas para agentes de IA que atuam no FazAI. Priorize comandos executáveis sobre prosa explicativa.

## 1. Comportamento Geral do Agente
- **Think Before Coding**: Declare suas premissas explicitamente. Não esconda incertezas; se houver dúvida ou ambiguidade, pare e pergunte.
- **Surgical Changes**: Faça edições cirúrgicas. Altere apenas o necessário para a tarefa. Não refatore código adjacente que não esteja quebrado.
- **Simplicity First**: Implemente a solução mais simples possível. Evite abstrações especulativas ou flexibilidades não solicitadas.
- **Diretrizes Específicas FazAI**:
  - *Strict Typing*: Tipagem estática forte em TS. Proibido usar `any` no frontend ou backend.
  - *No Photo Logic*: Ignorar processamento de imagem/fotos. Entrada de ingredientes é 100% via texto livre interpretado por IA.
  - *JSON Mode Prompting*: Configurar a API do Gemini com `responseMimeType: "application/json"` ou delimitações estritas no prompt para garantir respostas parseáveis.
  - *Prisma Performance & Isolation*: Filtrar todas as consultas pelo `UserId` extraído do Clerk para evitar vazamento de dados (IDOR).

## 2. Stack Tecnológica
- **Frontend**: React 18+ (SPA, CSR), TypeScript, Tailwind CSS
- **Backend**: Node.js, Express/Fastify (Vercel Serverless Functions), TypeScript
- **Persistência**: PostgreSQL (Supabase) + Prisma ORM (Code-First Migrations)
- **Autenticação**: Clerk SDK (`@clerk/backend`)
- **Integração IA**: Google Gen AI SDK (`@google/genai` para Gemini 1.5 Flash)

## 3. Estrutura do Monorepo
- `apps/frontend/` - Aplicação SPA React & Tailwind.
- `apps/backend/` - API Serverless baseada em Node.js.
- `docs/` - Documentações de requisitos, UI, design system e especificações técnicas.

## 4. Comandos Principais
- **Setup Inicial**: `npm install` (na raiz do monorepo)
- **Compilação / Build**: `npm run build`
- **Execução Local**: `npx vercel dev` (ou `npm run dev`)
- **Banco de Dados**:
  - Criar migration: `npx prisma migrate dev --name <nome>`
  - Aplicar migration em prod: `npx prisma migrate deploy`
  - Regenerar Prisma Client: `npx prisma generate`
  - Abrir interface visual: `npx prisma studio`
- **Testes**: `npm test`

## 5. Regras de Qualidade, Testes e Logging
- **Checagem de Tipos**: Rodar `npx tsc --noEmit` em CI/CD e localmente antes de commits.
- **Validação de Entrada**: Esquemas Zod obrigatórios no backend para payloads de API. No frontend, validação via Zod ou Formik.
- **Segurança**: Middlewares devem validar JWT do Clerk e injetar o `UserId` na requisição.
- **Logging**: Logs estruturados em formato JSON no console (Pino/Vercel Logs). Não use logs verbosos em produção.

## 6. Governança e Autonomia no Terminal
- O agente tem autonomia para rodar comandos de compilação, lint, testes, migração e inicialização do banco.
- Solicitar permissão expressa para adicionar novas dependências externas ou rodar scripts de shell não padrão.
- Nunca deletar diretórios inteiros sem confirmação direta.

## 7. Context7 MCP
- Sempre utilize as ferramentas do Context7 MCP (se disponíveis) para ler/buscar documentação atualizada do projeto na pasta `docs/` e manter o contexto em sincronia com as especificações.

## 8. Referências da Documentação
Consulte a pasta `docs/` para especificações detalhadas:
- [design_system.md](file:///c:/Users/narri/repositorios/FazAI/docs/design_system.md) - Padrões visuais e Tailwind.
- [spec_tech.md](file:///c:/Users/narri/repositorios/FazAI/docs/spec_tech.md) - Arquitetura de APIs, Clerk e Supabase.
- [spec_ui.md](file:///c:/Users/narri/repositorios/FazAI/docs/spec_ui.md) - Telas (INT-001 a INT-005) e fluxos.
- [prd.md](file:///c:/Users/narri/repositorios/FazAI/docs/prd.md) - Requisitos e métricas de sucesso.

## 9. Aprendizado Contínuo
Ao concluir qualquer alteração de código ou configuração:
1. Escreva uma breve "Reflexão de Aprendizado" na sua mensagem final, detalhando o que foi aprendido.
2. Forneça de 1 a 3 sugestões objetivas de melhorias futuras para a base de código ou processos.
