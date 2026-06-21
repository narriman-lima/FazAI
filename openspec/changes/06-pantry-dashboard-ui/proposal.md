# Proposal: 06-pantry-dashboard-ui

## Objetivo
Implementar a interface gráfica principal da Despensa Inteligente (Stitch INT-003) no frontend React. Conectar o dashboard de duas colunas, integrando o campo de texto livre interpretado por IA e a listagem dinâmica de ingredientes com opções de exclusão pontual no banco de dados Supabase.

---

## Escopo Funcional
*   **Interface Gráfica (Stitch INT-003)**: Tela da Despensa Inteligente (`f53df7ea9ba7418193a0f362b8567ee2`) estruturada em grid responsivo móvel/desktop:
    *   **Coluna Esquerda (2/3 no desktop)**: TextArea largo para input de texto livre de ingredientes, botão primário "Processar Alimentos com IA" e indicador animado de carregamento (*spinner*).
    *   **Coluna Direita (1/3 no desktop)**: Cartão lateral exibindo a listagem dinâmica dos ingredientes persistidos, representados por chips contendo nome, quantidade e um ícone de lixeira vermelha para remoção pontual.
    *   **Barra de Ação Principal**: Botão em destaque "Gerar Receitas Personalizadas" (ativo apenas se a lista contiver ao menos 1 ingrediente).
*   **Comunicação com API**:
    *   Ao iniciar a tela: Dispara chamada HTTP para `GET /api/v1/pantry` para preencher o inventário atual do usuário.
    *   Ao processar o texto livre: Envia para `POST /api/v1/pantry/parse-text`, recebe a resposta estruturada e envia para `POST /api/v1/pantry/items` para persistência, reatualizando o estado do componente.
    *   Ao excluir: Dispara chamada HTTP `DELETE /api/v1/pantry/items/:id` e remove o item correspondente do array de estados do React.

---

## Dependências
*   `03-user-profile-crud` (Necessário ter o perfil do usuário configurável).
*   `04-pantry-gemini-parser` (Necessário ter o endpoint de análise textual por LLM pronto).
*   `05-pantry-inventory-crud` (Necessário ter o banco e endpoints de despensa prontos).

---

## Risks and Mitigations
*   **Risco**: Bloqueio de interface ou cliques duplos durante a análise assíncrona do texto livre.
*   **Mitigação**: Bloquear inputs e desabilitar botões (`disabled`) enquanto o estado `isLoading` estiver ativo, fornecendo feedback visual de processamento ao usuário.
*   **Risco**: Layout quebrado no mobile com o modelo de duas colunas.
*   **Mitigação**: Seguir a lógica mobile-first do Tailwind: aplicar layout de coluna única padrão (`flex-col` ou `grid-cols-1`) e expandir para grid com colunas assimétricas a partir do breakpoint de largura do desktop (`lg:grid-cols-3`).

---

## Execução de Linter Necessária
*   **Comando**: `npx eslint apps/` e `npx tsc --noEmit` na raiz.
*   **Regras**: Tipagem estrita em TypeScript para os estados do formulário e handlers de evento.

---

## Testes Unitários Necessários
*   **Foco**: Testar o comportamento do botão "Gerar Receitas" dependendo do estado da despensa.
*   **Cenários**: Validar se o botão primário recebe o atributo `disabled` e opacidade reduzida caso o array de ingredientes esteja vazio.
*   **Ferramenta**: Vitest e React Testing Library.

---

## Testes de Integração Necessários
*   **Foco**: Sincronização de estados do React com mocks das chamadas HTTP.
*   **Cenários**: Simular requisição de processamento de texto e verificar se o estado React é atualizado adicionando os novos chips à lista reativa. Simular exclusão de chip verificando se ele desaparece da grade renderizada.

---

## Testes E2E Necessários
*   **Foco**: Fluxo completo no dashboard da despensa inteligente (INT-003).
*   **Cenários (via Cypress/Playwright)**:
    1. Acessar o painel da despensa.
    2. Digitar o texto *"tenho 3 ovos e uma fatia de queijo"* no campo.
    3. Clicar em "Processar Alimentos com IA" e aguardar o spinner.
    4. Confirmar a aparição dos chips *"3 Ovos"* e *"1 Fatia de Queijo"*.
    5. Clicar na lixeira de *"1 Fatia de Queijo"* e garantir que o chip some e a despensa permaneça apenas com o chip *"3 Ovos"*.
    6. Confirmar que o botão "Gerar Receitas Personalizadas" fica ativo.
