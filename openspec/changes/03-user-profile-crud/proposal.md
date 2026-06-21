# Proposal: 03-user-profile-crud

## Objetivo
Implementar a persistência e gerenciamento do perfil do usuário contendo suas metas alimentares (calorias diárias) e restrições de saúde. Criar a modelagem no Prisma ORM, implementar os endpoints de leitura/escrita com isolamento rígido por `UserId` e criar a tela de perfil e configurações de saúde (Stitch INT-002).

---

## Escopo Funcional
*   **Prisma Database Schema**:
    *   Criação da tabela `UserProfile` com colunas: `id` (UUID), `userId` (String, Unique, Indexado), `calorieGoal` (Int, opcional), `healthRestrictions` (String[] ou Booleanos para Lactose, Glúten, Açúcar, Ovo e Oleaginosas) e `preferences` (String[] para Vegano, Vegetariano, Low Carb).
*   **API Endpoints (Backend)**:
    *   `GET /api/v1/profile`: Retorna as configurações do usuário atual (se não existirem, retorna valores vazios padrão).
    *   `PUT /api/v1/profile`: Cria ou atualiza as configurações do usuário atual. Validação estrita via esquema Zod.
*   **Segurança**: Filtro obrigatório de consultas e atualizações usando o `UserId` obtido diretamente do token JWT decodificado no middleware de autenticação (mitigação de IDOR).
*   **Interface Frontend (Stitch INT-002)**: Tela de Perfil e Restrições (`dfc2ee0ffee140f19f9aa0bb095cf1bd`) utilizando formulário estruturado com checkboxes estilizados e inputs com validação React/Zod.

---

## Dependências
*   `01-monorepo-db-setup`
*   `02-auth-clerk-integration`

---

## Riscos e Mitigações
*   **Risco**: Vazamento de dados (IDOR) se o frontend puder enviar o `userId` de destino em requisições de atualização de perfil.
*   **Mitigação**: O backend deve ignorar qualquer `userId` enviado no payload da requisição e extrair essa informação estritamente do middleware de validação do token JWT do Clerk.
*   **Risco**: Dados inválidos persistidos (ex: calorias diárias negativas).
*   **Mitigação**: O Zod no backend validará se a meta de calorias está em uma faixa realista (ex: entre 500 e 10000 kcal).

---

## Execução de Linter Necessária
*   **Comando**: `npx eslint apps/` e `npx tsc --noEmit` na raiz.
*   **Regras**: Tipos de resposta HTTP fortemente tipados no Express/Fastify.

---

## Testes Unitários Necessários
*   **Foco**: Validar os esquemas Zod de validação de dados de perfil no backend e frontend.
*   **Cenários**: Garantir rejeição de valores negativos em calorias, tipos incorretos em arrays de restrições ou strings vazias no payload.

---

## Testes de Integração Necessários
*   **Foco**: Testar os endpoints `GET` e `PUT` da API em conexão direta ao banco Supabase.
*   **Cenários**:
    1. Criar novo perfil via PUT -> Validar se os dados são salvos corretamente.
    2. Atualizar perfil existente via PUT -> Validar se substitui sem duplicar registros.
    3. Tentar ler perfil sem estar autenticado -> Retorna 401.
    4. Garantir isolamento: Criar perfil com `UserA` e tentar acessar com `UserB` simulado -> Retorna perfil vazio do `UserB`.

---

## Testes E2E Necessários
*   **Foco**: Tela de Configurações de Perfil (INT-002).
*   **Cenário**: Usuário autenticado acessa a tela de perfil, altera a meta calórica para 2500, seleciona as checkboxes "Sem Lactose" e "Vegano", clica em "Salvar" e vê alerta de sucesso verde. Em seguida, recarrega a página e vê que as seleções foram persistidas no formulário.
