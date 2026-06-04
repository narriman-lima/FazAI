# 1. Declaração de Problema

## 1.1 Problema
Existe uma lacuna no mercado para o gerenciamento integrado da alimentação doméstica. Atualmente, **aplicativos de nutrição exigem um registro manual constante que reduz a adesão dos usuários ao longo do tempo**. Além disso, **as receitas disponíveis online raramente refletem os ingredientes que as pessoas já têm em casa**, o que gera atrito, inviabiliza a preparação imediata das refeições e contribui para o alto índice de desperdício de alimentos nos lares brasileiros. As soluções existentes (como Foodvisor, SuperCook e Plant Jammer) também falham em adaptar essas receitas genéricas para atender a restrições e metas nutricionais específicas (como dietas sem lactose ou sem glúten) de forma unificada.

## 1.2 Público-Alvo/Persona
Brasileiros que cozinham em casa e buscam adotar uma rotina alimentar mais saudável e sustentável, mas que esbarram na falta de criatividade, organização ou tempo. O público inclui **pessoas com necessidades dietéticas específicas (ex: intolerância à lactose, dietas de baixo açúcar) que precisam de praticidade e inteligência no preparo diário das refeições**.

## 1.3 Objetivo
Desenvolver o **FazAI**, uma solução digital multiplataforma (app mobile e plataforma web) que conecta os ingredientes disponíveis na despensa do usuário às melhores opções de receitas personalizadas]. O objetivo central é **simplificar o preparo de refeições e o acompanhamento nutricional por meio de Processamento de Linguagem Natural e Inteligência Artificial Generativa**, permitindo a entrada flexível de texto livre para inventário e cálculo de macronutrientes, promovendo hábitos alimentares mais saudáveis e reduzindo o desperdício.

***

# 2. Definição de Requisitos do Produto (PRD)

## Descrição do produto

**Problema:** O alto índice de desperdício de alimentos doméstico, aliado à frustração gerada por aplicativos de nutrição que exigem registros manuais complexos e sites de receitas que ignoram o que o usuário tem na despensa e suas restrições dietéticas.

**Solução:** O **FazAI** é um ecossistema digital completo (app mobile e web) que utiliza Inteligência Artificial para interpretar listas de ingredientes digitadas livremente pelo usuário. O sistema sugere receitas personalizadas focadas no aproveitamento da despensa e automatiza o cálculo de macronutrientes e calorias de forma fluida.

Para o **público que cozinha em casa e possui metas ou restrições nutricionais**, os **ganhos** incluem a redução do desperdício, economia financeira, praticidade extrema ao eliminar o atrito do registro tradicional e o suporte efetivo a dietas personalizadas (ex: zero lactose, baixo açúcar, sem glúten).

**Nossos Diferenciais:**
- **Input Inteligente em Texto Livre:** A IA interpreta o que o usuário digitou naturalmente (ex: "3 ovos e um punhado de espinafre") e estrutura o inventário sem tabelas complexas.
- **Geração Dinâmica de Receitas:** Diferente de bancos de dados estáticos, a IA cria a receita ideal combinando exatamente os ingredientes do usuário com suas restrições.
- **Solução Única com PWA (Progressive Web App):** Experiência de aplicativo móvel nativo e acessibilidade web a partir de uma única base de código.

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
- O usuário poderá digitar livremente os ingredientes e quantidades que possui em casa. O sistema usará IA para interpretar o texto e atualizar o inventário.
- **Critérios de Aceitação:** 
  - O sistema deve extrair com sucesso os ingredientes e quantidades de um texto livre.
  - O usuário deve poder editar ou excluir manualmente os itens gerados caso a interpretação falhe.

### RFN-02 Geração de Receitas Personalizadas via IA
- O sistema enviará os ingredientes do inventário e as restrições do usuário para a IA, que gerará uma receita personalizada passo a passo.
- **Critérios de Aceitação:**
  - As receitas geradas devem priorizar o uso dos ingredientes informados.
  - As sugestões devem respeitar rigorosamente as restrições de saúde cadastradas.

### RFN-03 Cálculo Automatizado de Macronutrientes e Calorias
- O sistema exibirá os macronutrientes (carboidratos, proteínas, gorduras) e as calorias totais estimados para a receita gerada ou para os ingredientes informados.
- **Critérios de Aceitação:**
  - O app deve exibir o cálculo nutricional de forma clara na tela da receita.
  - O usuário deve conseguir salvar a refeição para acumular no seu histórico diário.

---

## Requisitos Não Funcionais

### RNF-01 - Desempenho e Multiplataforma (PWA)
A solução utilizará o **Next.js com suporte a PWA**, combinando a acessibilidade da web com os recursos de um app móvel nativo, mantendo apenas um repositório.

### RNF-02 - Padrão Arquitetural SPA e Renderização
A arquitetura do front-end seguirá o padrão **SPA (Single Page Application)** com renderização **CSR (Client Side Rendering)** inicial para garantir interações fluidas.

### RNF-03 - Confiabilidade e Tipagem
Todo o código será construído em **TypeScript** para capturar erros antes da execução e melhorar a manutenibilidade.

### RNF-04 - Arquitetura Monolítica
A aplicação seguirá o estilo de **Monolito**, concentrando roteamento, lógica e UI em um único projeto para acelerar o desenvolvimento do time.

### RNF-05 - Padronização Visual e Estilização
A interface será estilizada com **Tailwind CSS** seguindo a abordagem *mobile-first* para garantir consistência visual e excelente performance de build.

---

## Métricas de Sucesso

- **Engajamento:** Taxa de retenção semanal (WAU) dos usuários que utilizam a entrada de texto livre para registrar seus alimentos.
- **Aderência às Receitas:** Percentual de receitas geradas pela IA que são marcadas como "Preparadas" ou "Favoritadas" pelo usuário.
- **Economia Estimada:** Volume estimado de ingredientes reaproveitados através do app, exibido no painel do usuário.

---

## Premissas e restrições

- **Premissas:** Os usuários possuem dispositivos com acesso à internet para se comunicar com os serviços de IA; A equipe possui conhecimento em Next.js, TypeScript e Tailwind CSS.
- **Restrições:** O projeto utilizará serviços de IA em camadas gratuitas (ex: API do Gemini), o que pode impor limites de requisições por minuto (Rate Limiting).

## Escopo

- **v1:** Estrutura base Monolítica (Next.js/TypeScript), cadastro de perfil (metas/restrições), formulário de entrada manual simples de ingredientes, cálculo básico de macros e listagem estática de receitas locais.
- **v2:** Integração com a API de IA para interpretação de texto livre (ingredientes), geração dinâmica de receitas personalizadas baseadas na despensa e ativação do suporte a PWA.
- **v3:** Histórico nutricional diário consolidado, gráficos de consumo de macros/calorias e sistema de gamificação para redução de desperdício.