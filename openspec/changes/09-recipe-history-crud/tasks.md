## 1. Database: Prisma Schema & Migration

- [x] 1.1 Adicionar o modelo `SavedRecipe` ao `apps/backend/prisma/schema.prisma` com campos: `id` (UUID), `userId` (String, indexado), `title`, `calories` (Int), `carbohydrates`, `proteins`, `fats` (String), `ingredients` (String[]), `steps` (String[]), `createdAt` (DateTime @default(now()))
- [x] 1.2 Executar `npx prisma migrate dev --name add-saved-recipe` na raiz do monorepo para gerar e aplicar a migration local
- [x] 1.3 Executar `npx prisma generate` para regenerar o Prisma Client com o novo modelo

## 2. Backend: API Endpoints (apps/backend/)

- [x] 2.1 Criar o arquivo `apps/backend/src/routes/recipes/favorite.ts` e definir o schema Zod `favoriteRecipeSchema` para validação do payload do `POST /api/v1/recipes/favorite`
- [x] 2.2 Implementar o handler `POST /api/v1/recipes/favorite`: extrair `userId` do Clerk JWT, validar via Zod, executar `prisma.savedRecipe.create` e retornar HTTP 201 com o objeto criado
- [x] 2.3 Implementar o handler `GET /api/v1/recipes/history`: extrair `userId` do Clerk JWT, executar `prisma.savedRecipe.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } })` e retornar HTTP 200 com o array
- [x] 2.4 Implementar o handler `DELETE /api/v1/recipes/favorite/:id`: extrair `userId` do Clerk JWT e executar `prisma.savedRecipe.deleteMany({ where: { id, userId } })` retornando HTTP 204 (sem body)
- [x] 2.5 Registrar as três rotas no router principal do backend (`apps/backend/src/index.ts` ou equivalente), com o middleware de autenticação Clerk aplicado
- [x] 2.6 Adicionar logs estruturados JSON (via Pino) nos três handlers, logando `userId` e `id` da receita sem dados sensíveis

## 3. Frontend: API Client (apps/frontend/)

- [x] 3.1 Criar o arquivo `apps/frontend/src/api/savedRecipe.ts` com as funções exportadas: `favoriteRecipe(recipe: Recipe): Promise<SavedRecipe>`, `getRecipeHistory(): Promise<SavedRecipe[]>` e `unfavoriteRecipe(id: string): Promise<void>`
- [x] 3.2 Definir e exportar o tipo TypeScript `SavedRecipe` com todos os campos retornados pela API (`id`, `title`, `calories`, `carbohydrates`, `proteins`, `fats`, `ingredients: string[]`, `steps: string[]`, `createdAt`)

## 4. Frontend: Ativar Botão Favoritar em RecipeDetails (INT-004)

- [x] 4.1 Adicionar o estado local `isSaved: boolean` e `isSaving: boolean` ao componente `apps/frontend/src/pages/RecipeDetails.tsx`
- [x] 4.2 Conectar o botão "Favoritar" ao handler `handleFavorite`: chamar `favoriteRecipe(recipe)`, setar `isSaved = true` em sucesso e exibir toast de confirmação (cor emerald, ícone ✓)
- [x] 4.3 Desabilitar o botão "Favoritar" quando `isSaved === true` ou `isSaving === true`, alterando o ícone para preenchido e o label para "Favoritada"
- [x] 4.4 Exibir alerta de erro vermelho (`bg-red-50 text-red-600`) se a chamada ao `favoriteRecipe` falhar

## 5. Frontend: Tela de Histórico (INT-005)

- [x] 5.1 Criar a rota `/history` no React Router (`apps/frontend/src/App.tsx`) apontando para o componente `HistoryPage`
- [x] 5.2 Criar o componente `apps/frontend/src/pages/HistoryPage.tsx`: ao montar, chamar `getRecipeHistory()` e armazenar o resultado no estado local
- [x] 5.3 Implementar o input de busca no topo da `HistoryPage` que filtra o array de receitas em memória por `title.toLowerCase().includes(searchTerm.toLowerCase())`
- [x] 5.4 Criar o componente `apps/frontend/src/components/RecipeHistoryCard.tsx`: exibe `title`, `calories`, resumo de macronutrientes e ícone de lixeira (botão de delete) com os tokens do design system (Inter font, slate-800, coral #ff6b6b no hover da lixeira)
- [x] 5.5 Criar o componente `apps/frontend/src/components/RecipeDetailModal.tsx`: modal overlay que reutiliza o layout de macronutrientes, ingredientes e passos da tela INT-004, abrindo com os dados do `SavedRecipe` já em memória (sem nova chamada de rede)
- [x] 5.6 Implementar o handler de delete na `HistoryPage`: ao clicar na lixeira, chamar `unfavoriteRecipe(id)` e remover o item do estado local na resposta 204
- [x] 5.7 Implementar o estado de loading com skeleton cards `animate-pulse` enquanto `getRecipeHistory()` está em voo
- [x] 5.8 Implementar o estado de erro com alerta vermelho e botão "Tentar novamente" se `getRecipeHistory()` falhar
- [x] 5.9 Implementar o estado de lista vazia com mensagem amigável e ícone ilustrativo quando o array de receitas está vazio (sem filtro ativo)
- [x] 5.10 Adicionar link de navegação para `/history` no menu/header principal da aplicação

## 6. Qualidade & Validação

- [x] 6.1 Executar `npx tsc --noEmit` na raiz do monorepo e corrigir todos os erros de tipo
- [x] 6.2 Executar `npx eslint apps/` e corrigir todos os avisos e erros de lint
- [x] 6.3 Escrever testes unitários com Vitest para a função de filtragem client-side: validar filtragem case-insensitive, busca sem resultados e limpeza da busca
- [x] 6.4 Testar manualmente o fluxo completo: gerar receita → favoritar → navegar para histórico → buscar → abrir modal de detalhes → deletar receita
- [x] 6.5 Verificar prevenção de IDOR: tentar `DELETE /api/v1/recipes/favorite/<id-de-outro-usuario>` e confirmar HTTP 204 sem deleção efetiva
