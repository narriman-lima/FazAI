# Proposal: 05-pantry-inventory-crud

## Objetivo
Implementar a persistência do inventário estruturado de ingredientes de cada usuário. Criar a modelagem no Prisma ORM para os itens da despensa, desenvolver os endpoints CRUD no backend com controle rígido de isolamento por `UserId` e expor as rotas para o frontend.

---

## Escopo Funcional
*   **Prisma Database Schema**:
    *   Criação da tabela `PantryItem` com as colunas: `id` (UUID), `userId` (String, indexado), `name` (String), `quantity` (String, opcional), `createdAt` (DateTime), `updatedAt` (DateTime).
*   **API Endpoints (Backend)**:
    *   `GET /api/v1/pantry`: Retorna a lista de todos os ingredientes salvos no inventário do usuário atual.
    *   `POST /api/v1/pantry/items`: Cria ingredientes individuais ou múltiplos (lote) na despensa. Entrada validada via Zod.
    *   `DELETE /api/v1/pantry/items/:id`: Remove um ingrediente específico do banco de dados.
*   **Isolamento Lógico**:
    *   Tanto na listagem (`findMany`) quanto na deleção (`deleteMany` / `delete`), injetar obrigatoriamente a verificação de `userId` correspondente ao token decodificado do Clerk para barrar acessos ou exclusões cruzadas não autorizadas (IDOR).

---

## Dependências
*   `01-monorepo-db-setup`
*   `02-auth-clerk-integration`

---

## Riscos e Mitigações
*   **Risco**: Deleção de itens de terceiros enviando IDs arbitrários no endpoint DELETE (falha grave de IDOR).
*   **Mitigação**: O backend deve usar `prisma.pantryItem.deleteMany({ where: { id: id, userId: req.auth.userId } })` em vez de apenas deletar pelo `id`. Se nenhum registro for alterado, responder com status HTTP 404/403.
*   **Risco**: Duplicação excessiva de nomes de ingredientes no inventário (ex: "ovo" adicionado repetidas vezes em registros separados).
*   **Mitigação**: Permitir agregação simples ou limpeza rápida por lote de ingredientes na lógica do endpoint POST.

---

## Execução de Linter Necessária
*   **Comando**: `npx eslint apps/` e `npx tsc --noEmit` na raiz.
*   **Regras**: Garantir a ausência de `any` em todas as manipulações de entidades do banco.

---

## Testes Unitários Necessários
*   **Foco**: Validar os esquemas Zod de sanitização e validação para inserções unitárias e em lote de ingredientes.
*   **Cenários**: Validar rejeição de ingredientes com nome vazio, quantidade vazia ou formato de lote malformado.

---

## Testes de Integração Necessários
*   **Foco**: Testar operações do Prisma Client integradas com o Supabase.
*   **Cenários**:
    1. Inserir lote de ingredientes -> Confirmar se foram persistidos e associados ao `userId` correto.
    2. Listar ingredientes -> Confirmar se o `userId` A vê apenas seus próprios itens e o `userId` B vê apenas os dele.
    3. Excluir ingrediente de outro usuário -> O teste deve confirmar que a operação falha (retorna erro ou 0 registros modificados) e o item permanece intacto.

---

## Testes E2E Necessários
*   **Foco**: N/A nesta fase (será integrado no frontend na mudança `06-pantry-dashboard-ui`).
