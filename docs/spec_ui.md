# Especificação de UI

## Interfaces gráficas
As interfaces do **FazAI** foram concebidas seguindo a abordagem *mobile-first*, adaptando-se perfeitamente tanto a dispositivos móveis através do formato PWA quanto a navegadores desktop tradicionais de forma limpa, priorizando legibilidade, contraste acessível e digitação fluida.

---

### INT-001 - Tela de Login e Cadastro (Acesso)
* **Tipo de Contêiner**: Página cheia com centralização vertical e layout limpo.
* **Campos**:
    * Input de Texto: `E-mail` (Validação de formato e campo obrigatório).
    * Input de Texto (Password): `Senha` (Máscara de caracteres ativada com ícone de olho para revelar).
    * Input de Texto: `Nome Completo` (Exibido apenas no modo de alternância para "Cadastrar Conta").
* **Botões**:
    * Botão Primário: `Entrar` (Dispara a autenticação) ou `Criar Conta` (Conforme a aba ativa).
* **Links**:
    * Link Secundário: `Esqueci minha senha`.
    * Link de Alternância: `Não tem uma conta? Cadastre-se` ou `Já tem uma conta? Faça Login`.
* **Considerações**: Exibir mensagens claras de erro (ex: *"E-mail ou senha inválidos"*) centralizadas acima do formulário em caso de falha de autenticação.

---

### INT-002 - Tela de Perfil, Objetivos e Restrições
* **Tipo de Contêiner**: Página de formulário subdividida em blocos visuais bem definidos por cartões (*cards*).
* **Campos**:
    * Input Numérico: `Meta Calórica Diária (kcal)` (Opcional, com placeholder indicando médias padrão).
    * Grupo de Checkboxes (Restrições de Saúde): `Sem Lactose`, `Sem Glúten`, `Baixo Açúcar (Diabéticos)`, `Sem Ovo`, `Alergia a Oleaginosas`.
    * Grupo de Checkboxes (Preferências): `Vegetariano`, `Vegano`, `Low Carb`.
* **Botões**:
    * Botão Primário: `Salvar Perfil e Configurações`.
* **Links**:
    * Link de Navegação (Menu inferior ou superior): `Voltar para Despensa`.
* **Considerações**: Esta tela é exibida obrigatoriamente logo após o primeiro acesso do usuário ou quando acessada via menu de Perfil.

---

### INT-003 - Tela da Despensa Inteligente (Dashboard Principal)
* **Tipo de Contêiner**: Interface principal dividida em duas seções verticais: Entrada Livre de Dados e Visualização da Despensa Atual.
* **Campos**:
    * Área de Texto Livre (`TextArea`): *"O que você tem na geladeira/despensa hoje?"* (Exemplo de placeholder: *"Tenho 3 ovos, um maço de espinafre, metade de uma cebola e duas colheres de manteiga"*).
* **Botões**:
    * Botão Primário (Abaixo da Área de Texto): `Processar Alimentos com IA` (Dispara a chamada para análise e estruturação do texto).
    * Botão de Ação do Card: `Gerar Receitas Personalizadas` (Fica em destaque na base da tela, ativo apenas se houver pelo menos 1 ingrediente listado).
    * Ícones de Ação por Item da Lista: `Excluir` (Ícone de lixeira vermelha ao lado de cada ingrediente estruturado para remoção pontual).
* **Links / Listagens**:
    * Listagem Dinâmica: Grade ou lista contendo os itens atuais interpretados (ex: `• 3 Ovos`, `• 1 Maço de Espinafre`).
* **Considerações**: Ao clicar em `Processar Alimentos`, um indicador visual de carregamento animado (*spinner*) deve substituir temporariamente a área de texto enquanto o backend consome o Gemini para extrair e organizar a listagem de ingredientes.

---

### INT-004 - Tela de Exibição da Receita Gerada
* **Tipo de Contêiner**: Layout focado em modo leitura estruturado com seções de destaque e rolagem natural.
* **Campos de Exibição (Não Editáveis)**:
    * Título Principal: Nome criativo da receita (ex: *"Omelete Fit de Espinafre do FazAI"*).
    * Painel de Métricas Nutricionais (Grid com 4 pequenas caixas destacadas): `Calorias (kcal)`, `Carboidratos (g)`, `Proteínas (g)`, `Gorduras (g)`.
    * Lista de Ingredientes Utilizados.
    * Lista numerada contendo o passo a passo de preparo.
* **Botões**:
    * Botão Primário: `Favoritar e Marcar como Preparada` (Persiste a receita no banco SQL Server).
    * Botão Secundário: `Gerar Outra Sugestão` (Limpa a visualização e refaz a requisição de IA buscando uma variação).
* **Links**:
    * Link de Navegação superior: `← Voltar para Despensa`.
* **Considerações**: Caso a IA falhe ou atinja o limite de requisições, exibir um Alerta de Erro na cor vermelha com a mensagem: *"Ocorreu um erro ou limite atingido ao gerar sua receita. Por favor, tente novamente em alguns instantes."*

---

### INT-005 - Tela de Histórico e Receitas Salvas
* **Tipo de Contêiner**: Lista em formato de cartões colapsáveis ou navegáveis.
* **Campos**:
    * Input de Texto: Barra de pesquisa rápida por nome de receita favoritada.
* **Botões**:
    * Ícone de exclusão/desfavoritar em cada card listado.
* **Links**:
    * Clique no Card da receita: Abre os detalhes completos na tela idêntica à `INT-004`.
* **Considerações**: Exibe um sumário simples do total de receitas preparadas com sucesso pelo usuário ajudando a tangibilizar a redução de desperdício.

---

## Fluxo de Navegação
O fluxo de navegação do usuário pelas telas do **FazAI** ocorre de forma linear e simplificada para minimizar a carga cognitiva:

1.  **Fluxo de Autenticação**: O usuário abre a aplicação → Se não autenticado, visualiza `INT-001 (Login)` → Após autenticação com sucesso, o sistema verifica se o perfil já foi configurado. Se for o primeiro acesso, redireciona para `INT-002 (Perfil)`, senão, envia direto para a `INT-003 (Despensa)`.
2.  **Fluxo de Inventário e Pantry**: Na `INT-003 (Despensa)`, o usuário digita livremente o que possui em casa no campo de texto e clica em *Processar Alimentos com IA* → O sistema atualiza a listagem na mesma página instantaneamente via reatividade do React → O usuário revisa visualmente os itens e pode excluir qualquer item indesejado clicando no ícone da lixeira.
3.  **Fluxo de Geração de Receita**: Estando satisfeito com a lista de ingredientes na `INT-003`, o usuário clica no botão principal *Gerar Receitas Personalizadas* → A aplicação entra em estado de carregamento e navega para a tela `INT-004 (Exibição da Receita)`, exibindo em tempo real os passos, os macros calculados e as instruções formatadas pela inteligência artificial de acordo com as restrições salvas no perfil do usuário (`INT-002`).
4.  **Fluxo de Histórico**: O usuário clica em *Favoritar e Marcar como Preparada* na `INT-004` → Os dados são salvos no SQL Server e o usuário pode acessar a lista completa a qualquer momento navegando para a tela `INT-005 (Histórico)` através da barra de navegação principal.

---

## Diretrizes para IA
As ferramentas de IA Generativa encarregadas de traduzir esta especificação de UI em código executável de componentes React funcionais devem seguir estritamente as regras de design abaixo:

1.  **Strict Semantic Components**: Utilizar elementos puramente semânticos do HTML5 (`<main>`, `<section>`, `<article>`, `<header>`, `<footer>`, `<nav>`) para estruturar as interfaces.
2.  **Tailwind Responsiveness Only**: Todas as classes de dimensionamento devem usar os prefixos responsivos do Tailwind CSS (`sm:`, `md:`, `lg:`) baseando-se no modelo *mobile-first* (estilos padrão aplicam-se a telas pequenas, classes prefixadas expandem para desktops).
3.  **Banned Flex/Grid on Body**: Nunca aplicar `display: flex` ou `display: grid` diretamente na tag global `body` para layout principal da página, organizando contêineres filhos internos (`div`) de proporções controladas em seu lugar.
4.  **Visual Elements Consistency**: Manter os contrastes definidos na identidade visual do projeto: textos principais escuros sobre fundos claros, botões primários com cores fortes de destaque e feedbacks visuais em caixas de alertas coloridas (vermelho para erros, verde para acertos).