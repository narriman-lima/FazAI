# Proposal: 07-recipe-gemini-generation

## Objetivo
Implementar o motor de geração de receitas personalizadas do FazAI no backend. Desenvolver o endpoint `POST /api/v1/recipes/generate` que consolida os ingredientes ativos da despensa do usuário e suas restrições de perfil cadastradas, gera a receita adequada utilizando o Gemini 1.5 Flash e retorna os dados de receita e métricas nutricionais em JSON estruturado.

---

## Escopo Funcional
*   **Orquestração de Dados**:
    *   O backend obtém o `UserId` do Clerk.
    *   Consulta o `PrismaClient` para obter a lista de `PantryItems` do usuário.
    *   Consulta o `PrismaClient` para obter o `UserProfile` do usuário.
*   **Prompt Complexo de IA**:
    *   Construção de prompt contendo: ingredientes disponíveis, restrições alimentares (ex: zero lactose), metas calóricas.
    *   Definição de regras estritas: "Não use manteiga se a restrição Sem Lactose estiver ativa", "Priorize ingredientes da lista", etc.
*   **Integração SDK Gemini**:
    *   Envio do prompt para a API do Gemini 1.5 Flash em modo JSON (`responseMimeType: "application/json"`) especificando o schema de saída esperado:
    ```json
    {
      "title": "Omelete Fit de Espinafre",
      "calories": 250,
      "macros": {
        "carbohydrates": "5g",
        "proteins": "18g",
        "fats": "14g"
      },
      "ingredientsUsed": ["3 ovos", "espinafre", "azeite"],
      "steps": [
        "Bata os ovos em um recipiente...",
        "Refogue o espinafre na frigideira...",
        "Misture e doure dos dois lados."
      ]
    }
    ```

---

## Dependências
*   `03-user-profile-crud` (Necessário obter restrições do perfil).
*   `05-pantry-inventory-crud` (Necessário ler ingredientes da despensa).

---

## Riscos e Mitigações
*   **Risco**: O modelo alucinar ingredientes que violam restrições de alergia graves cadastradas no perfil do usuário.
*   **Mitigação**: Injetar regras redundantes de negação no prompt do sistema (ex: "Se 'Sem Ovo' estiver ativo, é proibido sugerir ovos em qualquer etapa"). Adicionalmente, validar programaticamente no backend se termos proibidos aparecem no JSON gerado.
*   **Risco**: O Gemini falhar ao calcular macros de forma realista.
*   **Mitigação**: O prompt deve instruir o LLM a estimar de forma conservadora ou aproximada com base em proporções padrão de ingredientes.

---

## Execução de Linter Necessária
*   **Comando**: `npx eslint apps/` e `npx tsc --noEmit` na raiz.
*   **Regras**: Tipagem TypeScript completa do objeto de receita retornado.

---

## Testes Unitários Necessários
*   **Foco**: Testar a formatação do prompt a ser enviado para o Gemini.
*   **Cenários**: Validar se restrições selecionadas no perfil do usuário (ex: "Sem Glúten", "Sem Lactose") se traduzem corretamente nas diretivas de bloqueio de ingredientes no prompt final.
*   **Ferramentas**: Vitest/Jest.

---

## Testes de Integração Necessários
*   **Foco**: Rota `POST /api/v1/recipes/generate` com mock da resposta do Gemini.
*   **Cenários**: Validar o fluxo completo de busca de dados no banco PostgreSQL Supabase, a composição do payload enviado ao mock do Gemini e a recepção da resposta final estruturada em JSON, respondendo com status 200 OK.

---

## Testes E2E Necessários
*   **Foco**: N/A nesta fase (será integrado no frontend na mudança `08-recipe-details-ui`).
