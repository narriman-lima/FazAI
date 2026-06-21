## ADDED Requirements

### Requirement: Render Suggestion Screen
O frontend SHALL disponibilizar a rota `/recipes` para exibir a receita sugerida e suas informações nutricionais estruturadas de forma legível.

#### Scenario: Successfully loading and rendering recipe details
- **WHEN** um usuário autenticado acessa a rota `/recipes` e a API do backend retorna a receita gerada com sucesso
- **THEN** o frontend SHALL exibir o título da receita e sua descrição detalhada
- **AND** o frontend SHALL exibir um painel nutricional em grid horizontal com 4 caixas (Calorias, Carboidratos, Proteínas e Gorduras) contendo os valores e unidades adequadas
- **AND** o frontend SHALL exibir a lista dos ingredientes utilizados
- **AND** o frontend SHALL exibir a lista numerada ordenada com o passo a passo de preparo da receita

#### Scenario: Loading state with Skeletons
- **WHEN** a requisição assíncrona de geração de receita estiver pendente (carregando)
- **THEN** o frontend SHALL exibir skeletons estruturais com a animação de pulso (`animate-pulse`) imitando o layout da receita (título, blocos nutricionais, listagem e passos)
- **AND** o frontend SHALL desabilitar o botão de gerar outra sugestão

#### Scenario: Error state
- **WHEN** a requisição de geração de receita falhar com qualquer erro do servidor ou rate limit
- **THEN** o frontend SHALL ocultar os skeletons e exibir um alerta vermelho destacado com a mensagem de erro apropriada na tela
- **AND** o frontend SHALL manter habilitado o botão de tentar gerar outra sugestão

### Requirement: Back Navigation
O frontend SHALL disponibilizar um atalho para retornar ao dashboard da despensa.

#### Scenario: Back button clicked
- **WHEN** o usuário clica no link "← Voltar para Despensa" no topo da página
- **THEN** o frontend SHALL navegar de volta para a rota `/pantry` e restaurar o estado da despensa do usuário

### Requirement: Regenerate Suggestion
O frontend SHALL permitir solicitar uma nova sugestão de receita.

#### Scenario: Clicking regenerate button
- **WHEN** o usuário clica no botão "Gerar Outra Sugestão"
- **THEN** o frontend SHALL limpar a receita atual do estado local
- **AND** o frontend SHALL reativar os skeletons animados de carregamento
- **AND** o frontend SHALL disparar uma nova requisição POST para a API do backend para obter uma nova sugestão de receita

### Requirement: Favorite Action Layout
O frontend SHALL disponibilizar um botão para simular a marcação de receita preparada e favoritada.

#### Scenario: Clicking favorite button
- **WHEN** o usuário clica no botão "Favoritar e Marcar como Preparada"
- **THEN** o frontend SHALL exibir uma notificação visual temporária ou alteração de estado em tela informando que a ação de salvar foi realizada com sucesso (sem persistir no banco de dados nesta etapa)
