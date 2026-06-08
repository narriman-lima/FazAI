# Prompt de Prototipação para UX Designer (Google Stitch)

Este documento contém o prompt estruturado pronto para ser copiado e colado em ferramentas de prototipação assistidas por IA (como o Google Stitch, v3.0 Pro) para gerar os templates de interface do projeto **FazAI**.

---

### PROMPT PARA COPIAR E COLAR NO GOOGLE STITCH:

```text
Atue como um Designer de UX/UI Sênior especialista em Aplicações Web (Desktop). 

Objetivo: Crie um conjunto de templates de protótipos em formato de aplicação web para desktop (proporção 16:9, visualização de navegador) para a plataforma "FazAI", um sistema focado na redução do desperdício de alimentos domésticos e acompanhamento nutricional inteligente através de IA.

Diretrizes Visuais Gerais:
- Estilo: Clean, minimalista, moderno, focado em alta legibilidade.
- Cores: Fundo claro (off-white/cinza bem claro), textos principais escuros (chumbo/grafite), botões de ação primária em cores vivas de destaque (como um coral ou verde médio saudável). Alertas de erro em vermelho suave e acertos em verde.
- Abordagem: Layout para Desktop (proporção 16:9, visualização de navegador), utilizando uma estrutura limpa com barra lateral (Sidebar) ou menu superior fixo de navegação, e contêiner centralizado widescreen (max-w-7xl).
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
- Esta é a tela central do sistema. Deve utilizar um layout de Dashboard dividido em colunas assimétricas (Grid Desktop do Tailwind):
  a) Coluna da Esquerda / Painel Central (Largura 2/3): Uma área de texto livre (TextArea) proeminente e larga com o placeholder: "O que você tem na geladeira/despensa hoje? (Ex: Tenho 3 ovos, espinafre e duas fatias de queijo)". Logo abaixo dela, o botão primário: "Processar Alimentos com IA".
  b) Coluna da Direita (Largura 1/3): Um painel lateral que exibe a listagem estruturada de ingredientes interpretados em formato de cartões ou chips (Ex: "3 Ovos", "1 Maço de Espinafre"), cada um com um ícone visível de lixeira vermelha ao lado para exclusão pontual.
- Em destaque na base do painel ou da página, o botão de ação principal do sistema: "Gerar Receitas Personalizadas".

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