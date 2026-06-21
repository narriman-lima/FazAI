## Context

O motor de geração de receitas personalizadas do FazAI é o núcleo da inteligência culinária do aplicativo. Atualmente, o usuário já pode gerenciar sua despensa (mudanças 04, 05 e 06) e seu perfil/restrições de saúde (mudança 03). Esta especificação de design detalha como o backend irá orquestrar essas duas fontes de dados (ingredientes disponíveis e restrições alimentares) para construir um prompt robusto e seguro para o Gemini 1.5 Flash, processar a resposta estruturada em JSON e retornar a receita pronta para o consumo da interface, garantindo tipagem forte, segurança e tratamento de falhas.

## Goals / Non-Goals

**Goals:**
* Desenvolver a rota `POST /api/v1/recipes/generate` que orquestra os dados do banco PostgreSQL (Supabase) e gera receitas personalizadas.
* Garantir isolamento lógico absoluto filtrando as consultas de `PantryItem` e `UserProfile` pelo `UserId` autenticado através do Clerk.
* Utilizar o SDK oficial do Google Gen AI (`@google/genai`) enviando prompts especializados com diretivas estritas de negação de alérgenos e controle de formato de saída via `responseMimeType: "application/json"` e `responseSchema`.
* Validar a estrutura da resposta da IA usando a biblioteca Zod e tipar fortemente os contratos da API em TypeScript (proibido o uso de `any`).
* Implementar tratamento robusto para erros de limite de requisição (HTTP 429 - Rate Limiting) da API do Gemini.

**Non-Goals:**
* Persistir a receita gerada no banco de dados do histórico/favoritos nesta fase (essa lógica pertence à mudança `09-recipe-history-crud`).
* Implementar a interface gráfica do usuário de receita (pertence à mudança `08-recipe-details-ui`).
* Implementar qualquer forma de processamento de fotos ou leitura de imagem de alimentos (entrada de dados 100% textual).

## Decisions

### 1. Chamada sem payload de ingredientes no Request Body
* **Opção A:** O frontend envia a lista de ingredientes no corpo da requisição `POST /api/v1/recipes/generate`.
* **Opção B (Escolhida):** O backend lê diretamente a lista de ingredientes ativos da tabela `PantryItem` no banco de dados para o `UserId` autenticado.
* **Justificativa:** A Opção B previne adulteração de requisição (manipulação de ingredientes por fora do inventário oficial), reduz a carga do payload de rede e assegura que apenas ingredientes reais do inventário atual do usuário no banco sejam considerados na geração, respeitando a integridade dos dados e o isolamento lógico.

### 2. Uso do Gemini 1.5 Flash com schema estruturado nativo
* **Opção A:** Enviar prompt textual livre e realizar regex ou parse flexível na string de retorno.
* **Opção B (Escolhida):** Usar o SDK `@google/genai` configurando `responseMimeType: 'application/json'` e definindo o `responseSchema` com as propriedades exatas da receita.
* **Justificativa:** Garante que o Gemini responda estritamente no formato JSON definido, eliminando falhas comuns de parsing decorrentes de textos explicativos adjacentes e assegurando consistência na tipagem.

### 3. Validação Dupla de Restrições Alimentares (Segurança Alimentar)
* **Decisão:** Injetar instruções redundantes e severas de bloqueio de ingredientes no `systemInstruction` do prompt com base no `UserProfile` carregado, e realizar validação programática de segurança no backend após a geração.
* **Justificativa:** Garantir o máximo de confiabilidade em restrições de alérgenos (ex: Sem Glúten, Sem Lactose, Sem Ovo), mitigando os riscos de alucinação do LLM. Se um ingrediente proibido passar pelo filtro do LLM, o backend interceptará na validação do Zod ou via varredura de termos proibidos e retornará um erro controlado.

## Risks / Trade-offs

* **[Rate Limit do Gemini 1.5 Flash (Free Tier)]** → O limite de requisições por minuto da chave de API gratuita pode ser atingido rapidamente.
  * *Mitigação:* O backend capturará as falhas do tipo `429`, `ResourceExhausted` ou equivalentes e retornará o status `429 Too Many Requests` com uma mensagem amigável instruindo o usuário a aguardar.
* **[Alucinações Culinárias/Ingredientes não fornecidos]** → O modelo pode sugerir ingredientes que o usuário não tem na despensa.
  * *Mitigação:* O prompt orientará o Gemini a priorizar estritamente os ingredientes informados da despensa. Ingredientes secundários comuns de cozinha (ex: água, sal, pimenta) podem ser sugeridos opcionalmente, mas devem ser claramente sinalizados ou mantidos em quantidade mínima.
* **[Cálculo Impreciso de Macros]** → O Gemini calcula macronutrientes por estimativa textual.
  * *Mitigação:* O prompt exigirá que os cálculos de macronutrientes sejam conservadores baseando-se estritamente na soma estimada das porções. O backend retornará esses valores e o frontend os exibirá com um aviso explicativo.
