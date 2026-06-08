# Definição de Requisitos do Produto (PRD) — FazAI

## Descrição do produto

**Problema:** O alto índice de desperdício de alimentos domésticos, aliado à frustração gerada por aplicativos de nutrição que exigem registros manuais complexos e sites de receitas que ignoram os ingredientes que o usuário já possui na despensa e suas restrições dietéticas.

**Solução:** O **FazAI** é uma plataforma web (React SPA integrado a um ecossistema .NET) que utiliza Inteligência Artificial para interpretar listas de ingredientes digitadas livremente pelo usuário. O sistema sugere receitas personalizadas focadas no aproveitamento da despensa e automatiza o cálculo de macronutrientes e calorias de forma fluida e assíncrona.

Para o **público que cozinha em casa e possui metas ou restrições nutricionais**, os **ganhos** incluem a redução do desperdício, economia financeira, praticidade extrema ao eliminar o atrito do registro tradicional e o suporte efetivo a dietas personalizadas (ex: zero lactose, baixo açúcar, sem glúten).

**Nossos Diferenciais:**
- **Input Inteligente em Texto Livre:** A IA interpreta o que o usuário digitou naturalmente (ex: "3 ovos e um punhado de espinafre") e estrutura o inventário sem a necessidade de tabelas complexas.
- **Geração Dinâmica de Receitas:** Diferente de bancos de dados estáticos, a IA cria a receita ideal combinando exatamente os ingredientes ativos do usuário com suas restrições de perfil.
- **Stack Desacoplada e Simples:** Arquitetura limpa dividindo as responsabilidades de interface (React) e regras de negócio (.NET 8) utilizando persistência local leve para fácil portabilidade.

---

## Perfis de Usuário

### Cozinheiro Prático e Consciente

- **Problemas:** Desperdiça comida por falta de planejamento; não encontra receitas que usem os itens da geladeira; abandona dietas pelo cansaço de preencher apps tradicionais.
- **Objetivos:** Ter uma rotina alimentar saudável e sustentável; aproveitar os ingredientes que possui; bater metas nutricionais sem perder tempo.
- **Dados demográficos:** Adultos que cozinham no dia a dia e possuem restrições alimentares ou metas de saúde.
- **Motivações:** Economizar dinheiro, manter a saúde e diminuir o desperdício alimentar.
- **Frustrações:** Abrir a geladeira e não saber o que cozinhar; usar aplicativos fragmentados que exigem inputs exaustivos.

---

## Principais Funcionalidades

### RFN-01 Entrada Inteligente e Inventário de Ingredientes
- O usuário poderá digitar livremente os ingredientes e quantidades que possui em casa. O sistema usará IA para interpretar o texto e atualizar o inventário estruturado.
- **Critérios de Aceitação:** 
  - O sistema deve extrair com sucesso os ingredientes e quantidades de um texto livre via integração com o LLM.
  - O usuário deve poder excluir manualmente os itens gerados a partir de chips ou listas caso a interpretação falhe.

### RFN-02 Geração de Receitas Personalizadas via IA
- O sistema enviará os ingredientes ativos do inventário e as restrições salvas do usuário para a IA, que gerará uma receita personalizada passo a passo.
- **Critérios de Aceitação:**
  - As receitas geradas devem priorizar estritamente o uso dos ingredientes informados.
  - As sugestões devem respeitar rigorosamente as restrições de saúde cadastradas no perfil.

### RFN-03 Cálculo Automatizado de Macronutrientes e Calorias
- O sistema exibirá os macronutrientes (carboidratos, proteínas, gorduras) e as calorias totais estimados para a receita gerada pela IA.
- **Critérios de Aceitação:**
  - A interface web deve exibir o cálculo nutricional de forma clara e legível em blocos destacados na tela da receita.
  - O usuário deve conseguir salvar/favoritar a refeição para acumular no seu histórico armazenado no banco de dados.

---

## Requisitos Não Funcionais

### RNF-01 - Desempenho e Multiplataforma (Web SPA)
A interface com o usuário utilizará o **React com TypeScript**, garantindo carregamento rápido, renderização reativa no navegador e responsividade completa para desktops e dispositivos móveis via Tailwind CSS.

### RNF-02 - Padrão Arquitetural Cliente-Servidor
A arquitetura do front-end seguirá o padrão **SPA (Single Page Application)** com renderização **CSR (Client Side Rendering)**, comunicando-se assincronamente com o servidor por meio de payloads JSON.

### RNF-03 - Confiabilidade e Tipagem Estática
Todo o ecossistema de código será construído com linguagens tipadas (**TypeScript** no frontend e **C#** no backend) para capturar erros antes da execução e garantir alta manutenibilidade do projeto de pós-graduação.

### RNF-04 - Backend Escalável e Leve
O processamento de negócios, controle de inventário e orquestração de chamadas de IA serão centralizados em uma API RESTful monolítica desenvolvida em **ASP.NET Core (.NET 8)**.

### RNF-05 - Persistência Ágil de Dados
O armazenamento local de usuários, perfis e históricos utilizará o banco de dados relacional **SQLite**, simplificando a infraestrutura ao eliminar a dependência de servidores pesados ativos durante a correção do projeto.

---

## Métricas de Sucesso

- **Engajamento:** Taxa de retenção semanal (WAU) dos usuários que utilizam a caixa de entrada de texto livre para gerenciar seus alimentos.
- **Aderência às Receitas:** Percentual de receitas geradas pela IA que são marcadas como "Favoritadas" ou "Preparadas" pelo usuário.
- **Tempo de Resposta (Time-to-Value):** Redução do tempo gasto pelo usuário para planejar uma refeição e visualizar seus dados nutricionais.

---

## Premissas e restrições

- **Premissas:** Os usuários possuem dispositivos com acesso à internet estável para se comunicar com as APIs HTTP; A equipe possui conhecimento prático no ecossistema C#/.NET e bibliotecas React.
- **Restrições:** O projeto utilizará a API do Google Gemini em sua camada gratuita, o que impõe limites estritos de requisições por minuto (Rate Limiting) que devem ser tratados de forma amigável na interface.

## Escopo

- **v1:** Estrutura base da API em .NET 8 e SPA em React, persistência inicial via SQLite (Entity Framework Core), cadastro de perfil (metas/restrições), formulário de entrada manual simples e listagem local estática de receitas.
- **v2:** Integração do backend com a API gratuita do Gemini para interpretação de texto livre (ingredientes), geração dinâmica de receitas personalizadas com macros estimados e ativação do design system em Tailwind CSS.
- **v3:** Histórico nutricional diário consolidado no banco de dados, busca textual de receitas favoritadas e sistema básico de estatísticas de redução de desperdício.