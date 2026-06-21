## ADDED Requirements

### Requirement: Recipe Generation Endpoint
O sistema SHALL disponibilizar o endpoint `POST /api/v1/recipes/generate` para gerar receitas personalizadas via inteligência artificial (Gemini 1.5 Flash).

#### Scenario: Successful recipe generation
- **WHEN** um usuário autenticado com ingredientes na despensa e perfil cadastrado solicita a geração de receita
- **THEN** o sistema SHALL ler os ingredientes e restrições no banco de dados para o UserId correspondente
- **AND** o sistema SHALL construir o prompt do Gemini injetando esses dados de forma estruturada
- **AND** o sistema SHALL enviar a requisição de geração para o Gemini utilizando o SDK oficial e validando o retorno estruturado
- **AND** o sistema SHALL responder com status 200 OK e o JSON contendo os campos `title`, `description`, `calories`, `macros` (`carbohydrates`, `proteins`, `fats`), `ingredientsUsed` e `steps`

#### Scenario: Unauthorized request
- **WHEN** uma requisição é enviada para o endpoint sem o token JWT válido do Clerk
- **THEN** o sistema SHALL retornar status 401 Unauthorized

#### Scenario: Empty pantry list
- **WHEN** um usuário autenticado solicita a geração de receita mas não possui nenhum ingrediente cadastrado em sua despensa
- **THEN** o sistema SHALL retornar status 400 Bad Request com uma mensagem solicitando que insira alimentos na despensa antes de gerar

#### Scenario: Gemini API rate limit reached
- **WHEN** a chamada ao Gemini falha com erro de cota ou limite de requisições excedido (Rate Limiting/429)
- **THEN** o sistema SHALL capturar o erro e retornar status 429 Too Many Requests com uma mensagem amigável ao usuário

#### Scenario: Gemini API returns invalid format
- **WHEN** o Gemini retorna dados fora do formato JSON esperado ou com erro de parse
- **THEN** o sistema SHALL registrar o erro em log estruturado e retornar status 502 Bad Gateway com mensagem de falha na interpretação

### Requirement: Respect Health Restrictions
O sistema SHALL respeitar estritamente todas as restrições de saúde cadastradas no perfil do usuário no prompt e na pós-validação da receita gerada.

#### Scenario: Active health restrictions
- **WHEN** o perfil do usuário possui restrições como "Sem Lactose", "Sem Glúten", "Sem Ovo" ativas
- **THEN** o sistema SHALL injetar regras de negação rígidas (system instructions) específicas para cada restrição no prompt do Gemini
- **AND** o sistema SHALL realizar varredura por palavras-chave proibidas na receita retornada e rejeitar a receita se violar as restrições salvas, retornando status 502 Bad Gateway
