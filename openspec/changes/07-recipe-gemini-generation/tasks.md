## 1. Backend Schema & Setup

- [x] 1.1 Criar o arquivo de esquema Zod `apps/backend/src/schemas/recipe.ts` para validação de entrada/saída do endpoint `/recipes/generate`
- [x] 1.2 Gerar o cliente do Prisma rodando `npx prisma generate` dentro do diretório do backend para garantir tipagem do modelo `Recipe`

## 2. Backend Controller & AI Integration

- [x] 2.1 Criar o arquivo `apps/backend/src/controllers/recipe.controller.ts` e implementar a lógica do controlador de geração de receitas
- [x] 2.2 Integrar a busca de `PantryItem` e `UserProfile` filtrados pelo `UserId` do Clerk
- [x] 2.3 Implementar a chamada ao SDK do Gemini (`@google/genai`) utilizando `responseMimeType: 'application/json'` e a definição de `responseSchema` com base nas metas e restrições de saúde
- [x] 2.4 Implementar validação pós-geração do JSON retornado com Zod, filtrando e validando contra termos proibidos para restrições alimentares ativas
- [x] 2.5 Implementar tratamento amigável de erros (HTTP 429 para rate-limiting e HTTP 502 para falhas de parse de IA)

## 3. Backend Routes & Server Registration

- [x] 3.1 Criar o arquivo de rotas `apps/backend/src/routes/recipe.ts` mapeando o endpoint `POST /api/v1/recipes/generate` com proteção `requireAuth`
- [x] 3.2 Registrar o router de receitas no Express em `apps/backend/src/index.ts`

## 4. Testes & Validação de Qualidade

- [x] 4.1 Criar a suíte de testes unitários `apps/backend/src/controllers/recipe.controller.test.ts` usando `node:test`
- [x] 4.2 Validar se restrições selecionadas no perfil do usuário se traduzem corretamente em bloqueios no prompt do Gemini nos testes unitários
- [x] 4.3 Rodar testes de unidade da rota de geração com mocks completos do Gemini API e Prisma Client usando `npm test`
- [x] 4.4 Validar tipagem estática rodando `npx tsc --noEmit` na raiz do monorepo
- [x] 4.5 Executar checagem de linter rodando `npm run lint` ou `npx eslint apps/` para assegurar que não há tipo `any` ou outros problemas
