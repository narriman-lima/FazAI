## Context

Esta mudança foca na implementação da interface gráfica de Exibição de Receita Gerada (Stitch INT-004) no frontend React. Atualmente, o backend possui o endpoint `POST /api/v1/recipes/generate` pronto e seguro (mudança 07), e a despensa do usuário (mudança 06) possui o botão "Gerar Receitas Personalizadas" apontando para a rota `/recipes`. 

Este documento detalha como a interface do usuário consumirá o endpoint do backend, tratará os estados de carregamento (utilizando skeletons animados) e erros (como o rate limit do Gemini), e exibirá a receita de forma limpa, responsiva e alinhada ao design system do FazAI.

## Goals / Non-Goals

**Goals:**
* Criar a rota de frontend `/recipes` e o respectivo componente de página `RecipeDetails.tsx`.
* Implementar o cliente de API `apps/frontend/src/api/recipe.ts` para realizar a integração de chamada HTTP com o backend.
* Renderizar a interface de receitas inspirada na tela de Receita Sugerida do Stitch (`581a2b95685c442ca61a226beb156c90`), incluindo:
  * Link de navegação "← Voltar para Despensa".
  * Grid horizontal com 4 blocos de macronutrientes e calorias.
  * Listagem de ingredientes utilizados.
  * Modo de leitura com o passo a passo numerado de preparo.
  * Botões de ação para favoritar (apenas layout nesta etapa) e gerar outra sugestão.
* Garantir estados visuais fluidos: skeletons animados em pulso durante o carregamento assíncrono e alertas vermelhos em caso de erro da API.
* Respeitar rigorosamente a tipagem TypeScript em todas as novas implementações (proibido o uso de `any`).

**Non-Goals:**
* Persistir receitas no histórico ou favoritas no banco de dados (esta persistência gráfica e lógica será integrada na mudança `09-recipe-history-crud`).
* Modificar a lógica de geração ou filtros de segurança alimentar no backend (implementado na mudança `07-recipe-gemini-generation`).

## Decisions

### 1. Criação do arquivo de cliente API dedicado `src/api/recipe.ts`
* **Opção A:** Inserir a chamada HTTP dentro do próprio componente de página.
* **Opção B (Escolhida):** Criar um arquivo separado `apps/frontend/src/api/recipe.ts` contendo a função exportada `generateRecipe` e a definição da interface `Recipe`.
* **Justificativa:** Mantém a separação de responsabilidades (separation of concerns), facilita a manutenção de contratos e permite a reutilização futura do cliente de API em outros componentes (como a tela de histórico).

### 2. Implementação de Skeletons animados (`animate-pulse`) para Loading State
* **Opção A:** Exibir apenas um spinner simples de carregamento centralizado.
* **Opção B (Escolhida):** Construir uma estrutura de skeletons que simulem a diagramação real da receita (título, grade de macronutrientes, lista de ingredientes e etapas) usando blocos cinza com a classe `animate-pulse` do Tailwind.
* **Justificativa:** Melhora significativamente a experiência do usuário (UX), fornecendo uma pista visual clara sobre o tipo de conteúdo que está sendo carregado durante o tempo de resposta da API do Gemini (que pode levar alguns segundos).

### 3. Gerenciamento do Estado de "Gerar Outra Sugestão"
* **Decisão:** Quando o botão "Gerar Outra Sugestão" for clicado, o componente deve limpar a receita atual do estado local, reativar o estado de loading (exibindo novamente os skeletons) e executar uma nova chamada assíncrona ao backend.
* **Justificativa:** Garante reatividade instantânea no clique, dando feedback ao usuário de que a ação foi registrada e que uma nova consulta está sendo realizada.

## Risks / Trade-offs

* **[Tempo de Espera Elevado (Latência da API do Gemini)]** → A geração de receitas personalizadas via IA pode demorar entre 3 a 7 segundos.
  * *Mitigação:* A utilização dos Skeletons estruturados animados mitiga a sensação de lentidão e travamento do sistema.
* **[Erros de Rate Limiting da API do Gemini (HTTP 429)]** → O usuário pode receber erros de cota do Gemini ao tentar gerar receitas consecutivas ou em momentos de alto tráfego.
  * *Mitigação:* A interface capturará o erro retornado pelo cliente de API e renderizará um alerta visual destacado (cor vermelha, estilo `bg-red-50 text-red-600 border border-red-100`) com uma mensagem explicativa orientando o usuário a tentar novamente após alguns instantes.
