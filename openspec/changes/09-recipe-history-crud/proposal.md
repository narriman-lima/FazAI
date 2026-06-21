# Proposal: 09-recipe-history-crud

## Objetivo
Implementar a persistência de receitas favoritadas, os endpoints de histórico e busca do backend, e a interface gráfica de Histórico e Receitas Salvas (Stitch INT-005) no frontend React. Permitir que o usuário pesquise, favorite, visualize detalhes de receitas antigas e desfavorite receitas com total isolamento de dados.

---

## Escopo Funcional
*   **Prisma Database Schema**:
    *   Criação da tabela `SavedRecipe` com colunas: `id` (UUID), `userId` (String, indexado), `title` (String), `calories` (Int), `carbohydrates` (String), `proteins` (String), `fats` (String), `ingredients` (String[]), `steps` (String[]), `createdAt` (DateTime).
*   **API Endpoints (Backend)**:
    *   `POST /api/v1/recipes/favorite`: Salva a receita fornecida no banco PostgreSQL Supabase associada ao usuário autenticado. Validação Zod.
    *   `GET /api/v1/recipes/history`: Retorna o histórico de receitas salvas do usuário atual. Suporta filtro de busca via query parameter `?search=termo`.
    *   `DELETE /api/v1/recipes/favorite/:id`: Exclui a receita do histórico (desfavorita), isolado pelo `UserId` para evitar IDOR.
*   **Interface Frontend (Stitch INT-005)**: Tela de Histórico (`082d2156065b420a8cb74e61a3623165`):
    *   Input de pesquisa rápida no topo para filtragem textual das receitas listadas.
    *   Grid de cartões contendo resumo das receitas favoritadas (nome, calorias, ícone de lixeira para desfavoritar).
    *   Ao clicar no cartão: Abre um modal ou redireciona exibindo os detalhes completos da receita salvos no banco de dados (reutilizando a lógica visual da tela INT-004).

---

## Dependências
*   `08-recipe-details-ui` (Necessário ter a interface de detalhes para reuso).

---

## Riscos e Mitigações
*   **Risco**: Remoção não autorizada de receitas salvas de terceiros passando ID aleatório no endpoint DELETE.
*   **Mitigação**: O backend executará a query de exclusão no banco do Supabase injetando o filtro de `userId` extraído do Clerk JWT: `prisma.savedRecipe.deleteMany({ where: { id: id, userId: req.auth.userId } })`.
*   **Risco**: Armazenamento de grandes volumes de texto repetitivo nas receitas salvas.
*   **Mitigação**: O banco persistirá os passos e ingredientes como arrays nativos do PostgreSQL (`String[]`), mapeados eficientemente no Prisma Schema.

---

## Execução de Linter Necessária
*   **Comando**: `npx eslint apps/` e `npx tsc --noEmit` na raiz.
*   **Regras**: Enforçar tipos estritos sem o uso de `any` em todos os retornos de coleções de histórico do backend e estados do frontend.

---

## Testes Unitários Necessários
*   **Foco**: Testar a lógica de busca/filtragem no frontend.
*   **Cenários**: Validar se a função de busca reativa filtra corretamente receitas contendo o padrão pesquisado de forma case-insensitive e ignora receitas que não contêm o padrão.
*   **Ferramentas**: Vitest.

---

## Testes de Integração Necessários
*   **Foco**: Validar os endpoints da API de histórico com banco de dados Supabase e JWT do Clerk mockado.
*   **Cenários**:
    1. Favoritar receita -> Garantir persistência dos arrays de ingredientes/passos.
    2. Filtrar histórico via `?search=omelete` -> Validar se retorna apenas registros que correspondem.
    3. Excluir receita favoritada -> Garantir deleção física.
    4. Testar IDOR no DELETE -> Garantir que um usuário não consiga excluir receita pertencente a outro.

---

## Testes E2E Necessários
*   **Foco**: Fluxo completo de favoritos e histórico (INT-005).
*   **Cenários (via Cypress/Playwright)**:
    1. Usuário gera uma receita e clica em "Favoritar e Marcar como Preparada" (alerta verde de sucesso).
    2. Navega para a tela de Histórico.
    3. Verifica se a receita favoritada aparece no grid.
    4. Clica na receita para ver se os detalhes abrem idênticos ao modo leitura (INT-004).
    5. Digita um termo não correspondente na barra de busca (ex: *"lasanha"* quando só há *"omelete"*) e confere se a lista fica limpa.
    6. Limpa a busca, clica no ícone de lixeira da receita do histórico e valida se o card é excluído.
