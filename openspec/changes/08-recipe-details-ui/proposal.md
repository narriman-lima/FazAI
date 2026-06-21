# Proposal: 08-recipe-details-ui

## Objetivo
Implementar a interface gráfica de Exibição de Receita Gerada (Stitch INT-004) no frontend React. Exibir o passo a passo de preparo, a listagem dos ingredientes empregados e o grid contendo as métricas de macronutrientes e calorias de forma legível.

---

## Escopo Funcional
*   **Interface Gráfica (Stitch INT-004)**: Tela de Receita Sugerida (`581a2b95685c442ca61a226beb156c90`):
    *   **Navegação**: Link superior "← Voltar para Despensa".
    *   **Painel Nutricional**: Grade horizontal com 4 blocos dedicados para: Calorias (kcal), Carboidratos (g), Proteínas (g) e Gorduras (g) utilizando cartões off-white estruturados.
    *   **Lista de Ingredientes**: Seção exibindo a listagem dos itens utilizados.
    *   **Modo Leitura**: Lista numerada legível com o passo a passo de preparo da receita.
    *   **Ações**:
        *   Botão Primário: "Favoritar e Marcar como Preparada" (apenas layout nesta fase, lógica no passo seguinte).
        *   Botão Secundário: "Gerar Outra Sugestão" (limpa a tela e refaz a chamada para a API).
*   **Tratamento de Estados**:
    *   Exibir skeletons animando enquanto a requisição assíncrona aguarda resposta.
    *   Exibir alerta vermelho de erro caso a requisição HTTP falhe (ex: erro de rate limit do Gemini).

---

## Dependências
*   `06-pantry-dashboard-ui` (Necessário ter a navegação e dashboard da despensa integrados).
*   `07-recipe-gemini-generation` (Necessário ter a API de geração de receitas funcional).

---

## Riscos e Mitigações
*   **Risco**: Delay considerável no carregamento (latência do LLM) gerando a sensação de travamento do sistema.
*   **Mitigação**: Implementar Skeletons estruturais (blocos cinzas piscando com animação pulse do Tailwind) reproduzindo o esqueleto da receita (título, macros, lista e etapas).
*   **Risco**: Recebimento de valores nulos em macros na resposta do JSON.
*   **Mitigação**: O componente React deve prever fallback seguro (ex: exibir `0g` ou `-` caso a métrica não retorne).

---

## Execução de Linter Necessária
*   **Comando**: `npx eslint apps/` e `npx tsc --noEmit` na raiz.
*   **Regras**: Validação de tipos para as propriedades (Props) recebidas pelo componente de exibição de receita.

---

## Testes Unitários Necessários
*   **Foco**: Validar a renderização correta do painel nutricional com dados mockados.
*   **Cenários**: Validar se o componente exibe os textos corretos de calorias e macros e se insere as unidades ("g", "kcal") correspondentes de forma correta.
*   **Ferramentas**: Vitest e React Testing Library.

---

## Testes de Integração Necessários
*   **Foco**: Testar os fluxos de interface disparados pelos botões.
*   **Cenários**:
    1. Clicar em "Gerar Outra Sugestão" -> Testar se limpa a receita atual, ativa o spinner de loading e refaz a requisição HTTP.
    2. Clicar em "← Voltar para Despensa" -> Testar se aciona a rota correta do Router.

---

## Testes E2E Necessários
*   **Foco**: Exibição e comportamento da tela de receitas (INT-004).
*   **Cenários (via Cypress/Playwright)**:
    1. A partir do dashboard, clicar em "Gerar Receitas Personalizadas".
    2. Garantir o aparecimento temporário dos skeletons ou indicador de loading.
    3. Verificar se a tela renderiza o título da receita sugerida, se as 4 caixas nutricionais contêm valores populados, e se a listagem de passos exibe ao menos 1 passo.
    4. Clicar em "Gerar Outra Sugestão" e verificar se o processo reinicia corretamente.
