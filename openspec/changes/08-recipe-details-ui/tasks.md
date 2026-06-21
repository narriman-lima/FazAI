## 1. Frontend API Client Setup

- [x] 1.1 Criar o arquivo `apps/frontend/src/api/recipe.ts` contendo a interface `Recipe` e a função assíncrona `generateRecipe` para chamar o endpoint `POST /api/v1/recipes/generate` do backend.

## 2. Interface de Exibição de Receita

- [x] 2.1 Criar o componente de página `RecipeDetails.tsx` em `apps/frontend/src/pages/RecipeDetails.tsx` seguindo o design do Stitch INT-004.
- [x] 2.2 Implementar no componente o controle de estados para controle de carregamento, sucesso da requisição e exibição de falha na integração com a IA (ex: rate limit ou erro de servidor).
- [x] 2.3 Implementar blocos de skeletons animados utilizando Tailwind `animate-pulse` para simular a receita (título, painel de macronutrientes, lista de ingredientes e etapas) enquanto a requisição assíncrona aguarda resposta.
- [x] 2.4 Renderizar o painel de macronutrientes em um grid horizontal contendo Calorias (kcal), Carboidratos (g), Proteínas (g) e Gorduras (g) utilizando cartões off-white estruturados.
- [x] 2.5 Exibir a lista de ingredientes utilizados e a lista numerada ordenada contendo os passos de preparo.
- [x] 2.6 Conectar o botão "Gerar Outra Sugestão" para que ao ser clicado limpe o estado da receita atual, reative os skeletons animados de loading e dispare uma nova requisição para a API.
- [x] 2.7 Adicionar ação simulada ao botão "Favoritar e Marcar como Preparada" (apenas alteração estética ou mensagem temporária, sem persistência no banco de dados nesta etapa).

## 3. Roteamento e Navegação do App

- [x] 3.1 Adicionar a rota `/recipes` no arquivo `apps/frontend/src/App.tsx` importando e renderizando o componente `RecipeDetails`.
- [x] 3.2 Garantir que o link superior "← Voltar para Despensa" acione a navegação correta de retorno para a rota `/pantry`.

## 4. Validação e Qualidade de Código

- [x] 4.1 Executar checagem estática de tipos rodando `npx tsc --noEmit` para garantir conformidade com a tipagem TypeScript estrita e ausência do tipo `any`.
- [x] 4.2 Validar a compilação do frontend rodando `npm run build` ou similar para garantir ausência de erros de linter ou importações.
- [x] 4.3 Rodar comandos de testes existentes no frontend usando `npm test` para garantir integridade.
