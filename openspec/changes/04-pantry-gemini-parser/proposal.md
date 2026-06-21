# Proposal: 04-pantry-gemini-parser

## Objetivo
Implementar a inteligência do sistema para interpretar listas de ingredientes digitadas livremente pelos usuários. Criar o endpoint `POST /api/v1/pantry/parse-text` no backend, integrando o SDK oficial do Google Gen AI (`@google/genai`) para invocar o Gemini 1.5 Flash e receber um JSON estruturado com os ingredientes interpretados.

---

## Escopo Funcional
*   **Integração SDK**: Configuração do cliente `@google/genai` utilizando a variável de ambiente segura `GEMINI_API_KEY`.
*   **Prompt Engineering**: Definir system instructions detalhadas orientando o modelo a extrair estritamente nomes de ingredientes e suas respectivas quantidades, excluindo termos irrelevantes.
*   **JSON Mode**: Configuração da chamada da API com `responseMimeType: "application/json"` (se disponível) ou delimitadores rígidos para garantir respostas no formato:
    ```json
    {
      "ingredients": [
        { "name": "ovo", "quantity": "3 unidades" },
        { "name": "espinafre", "quantity": "1 maço" }
      ]
    }
    ```
*   **API Endpoint (Backend)**:
    *   `POST /api/v1/pantry/parse-text` protegido por Clerk JWT. Aceita `{ text: string }` e retorna a lista JSON estruturada.
*   **Tratamento de Rate Limits**: Mecanismo de tratamento para o erro HTTP 429 (Rate Limit do Gemini) com mensagens de erro claras.

---

## Dependências
*   `01-monorepo-db-setup`
*   `02-auth-clerk-integration`

---

## Riscos e Mitigações
*   **Risco**: O Gemini responder com Markdown com blocos de código (ex: ` ```json ... ``` `) em vez de JSON puro, quebrando o parser.
*   **Mitigação**: O parser de resposta do backend deve limpar caracteres de markdown de bloco de código antes de tentar o `JSON.parse` e validar a resposta via Zod.
*   **Risco**: Limites de Rate Limit da camada gratuita do Gemini interrompendo o serviço repentinamente.
*   **Mitigação**: Implementar retry lógico e alertas claros no JSON de erro retornado ao frontend.

---

## Execução de Linter Necessária
*   **Comando**: `npx eslint apps/` e `npx tsc --noEmit` na raiz.
*   **Regras**: Tipos estritos para o retorno do mock do SDK do Gemini nos testes.

---

## Testes Unitários Necessários
*   **Foco**: Testar a lógica de tratamento e parsing da resposta crua do Gemini.
*   **Cenários**:
    1. Resposta em formato JSON padrão.
    2. Resposta contendo bloco de código Markdown.
    3. Resposta com JSON malformado ou campos faltando -> Deve lançar um erro estruturado.
*   **Ferramenta**: Vitest/Jest com Mocks da API do Gemini.

---

## Testes de Integração Necessários
*   **Foco**: Integrar a rota HTTP `/api/v1/pantry/parse-text` com o serviço do Gemini mockado.
*   **Cenários**: Enviar payload de texto e checar se o status é 200 e se retorna a estrutura de ingredientes exata esperada. Testar retorno de erro 429 simulando rate limiting do Gemini.

---

## Testes E2E Necessários
*   **Foco**: N/A (A interface gráfica da despensa inteligente será integrada na mudança `06-pantry-dashboard-ui`).
