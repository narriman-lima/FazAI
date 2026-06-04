# Prompt de Prototipação para UX Designer (Google Stitch)

Este documento contém o prompt estruturado pronto para ser copiado e colado em ferramentas de prototipação assistidas por IA (como o Google Stitch, v3.0 Pro) para gerar os templates de interface do projeto **FazAI**.

---

### PROMPT PARA COPIAR E COLAR NO GOOGLE STITCH:

```text
Atue como um Designer de UX/UI Sênior especialista em soluções móveis (Mobile-First) e PWAs. 

Objetivo: Crie um conjunto de templates de protótipos altamente realistas, modernos e limpos para o aplicativo "FazAI", um ecossistema digital focado na redução do desperdício de alimentos domésticos e acompanhamento nutricional inteligente através de IA.

Diretrizes Visuais Gerais:
- Estilo: Clean, minimalista, moderno, focado em alta legibilidade.
- Cores: Fundo claro (off-white/cinza bem claro), textos principais escuros (chumbo/grafite), botões de ação primária em cores vivas de destaque (como um coral ou verde médio saudável). Alertas de erro em vermelho suave e acertos em verde.
- Abordagem: Mobile-first (foco em tela de smartphone, proporção 9:19), sem barras de navegação poluídas.
- REFEIÇÃO E FOTOS: Proibido incluir elementos de câmera, botões de "tirar foto", "escanear ingrediente" ou "smart scanner". Toda a entrada de dados do inventário deve ser textual.

Gere os templates de interface estruturados para as seguintes 5 telas essenciais do fluxo:

1. Tela de Login e Cadastro (Acesso - INT-001)
- Layout centralizado verticalmente, limpo e acolhedor.
- Inputs simples com bordas finas para E-mail e Senha (com ícone de olho).
- Botão primário destacado para "Entrar".
- Links secundários discretos para alternar para o modo "Cadastrar Conta" ou "Esqueci minha senha".

2. Tela de Perfil, Objetivos e Restrições (INT-002)
- Estrutura baseada em cartões (cards) para agrupar categorias.
- Um campo numérico opcional para "Meta Calórica Diária (kcal)".
- Um grupo estilizado de checkboxes ou chips selecionáveis para Restrições de Saúde (Ex: Sem Lactose, Sem Glúten, Baixo Açúcar) e Preferências Alimentares (Ex: Vegetariano, Vegano, Low Carb).
- Botão largo na base: "Salvar Perfil e Configurações".

3. Tela da Despensa Inteligente / Dashboard Principal (INT-003)
- Esta é a tela central do app. Deve ter duas seções visuais limpas:
  a) Uma área de texto livre (TextArea) de destaque com o placeholder: "O que você tem na geladeira/despensa hoje? (Ex: Tenho 3 ovos, espinafre e duas fatias de queijo)". Logo abaixo, um botão primário: "Processar Alimentos com IA".
  b) Uma listagem dinâmica em formato de lista corrida ou chips com os ingredientes já interpretados e salvos (Ex: "• 3 Ovos", "• 1 Maço de Espinafre"), cada um com um pequeno ícone de lixeira vermelha ao lado para exclusão rápida.
- Na base da tela, um botão flutuante ou fixo de destaque máximo: "Gerar Receitas Personalizadas" (ativo quando houver itens na lista).

4. Tela de Exibição da Receita Gerada (INT-004)
- Layout otimizado para modo leitura na cozinha, com ótimo espaçamento.
- Topo com o Título da Receita em destaque (Ex: "Omelete Fit de Espinafre do FazAI").
- Um pequeno grid horizontal ou painel com 4 blocos de métricas nutricionais em destaque: Calorias (kcal), Carboidratos (g), Proteínas (g), Gorduras (g).
- Seção de Lista de Ingredientes Utilizados e uma seção com o Passo a Passo numerado em texto corrido e legível.
- Botões de rodapé: Botão Primário "Favoritar e Marcar como Preparada" e um Botão Secundário menor "Gerar Outra Sugestão". Link discreto no topo: "← Voltar para Despensa".

5. Tela de Histórico e Receitas Salvas (INT-005)
- Uma barra de pesquisa rápida no topo para buscar receitas.
- Uma lista elegante em formato de cards verticais ou horizontais exibindo as receitas favoritadas anteriormente, contendo o nome da receita, calorias e um ícone discreto de lixeira/desfavoritar.

Apresente as variações de telas mantendo a consistência tipográfica, uso equilibrado de espaços em branco e componentes de formulário modernos.
```