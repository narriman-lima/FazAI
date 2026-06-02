# 1. Declaração de Problema

## 1.1 Problema
Existe uma lacuna no mercado para o gerenciamento integrado da alimentação doméstica. Atualmente, **aplicativos de nutrição exigem um registro manual constante que reduz a adesão dos usuários ao longo do tempo**. Além disso, **as receitas disponíveis online raramente refletem os ingredientes que as pessoas já têm em casa**, o que gera atrito, inviabiliza a preparação imediata das refeições e contribui para o alto índice de desperdício de alimentos nos lares brasileiros. As soluções existentes (como Foodvisor, SuperCook e Plant Jammer) também falham em adaptar essas receitas genéricas para atender a restrições e metas nutricionais específicas (como dietas sem lactose ou sem glúten) de forma unificada.

## 1.2 Público-Alvo/Persona
Brasileiros que cozinham em casa e buscam adotar uma rotina alimentar mais saudável e sustentável, mas que esbarram na falta de criatividade, organização ou tempo. O público inclui **pessoas com necessidades dietéticas específicas (ex: intolerância à lactose, dietas de baixo açúcar) que precisam de praticidade e inteligência no preparo diário das refeições**.

## 1.3 Objetivo
Desenvolver o **FazAI**, uma solução digital multiplataforma (app mobile e plataforma web) que conecta os ingredientes disponíveis na despensa do usuário às melhores opções de receitas personalizadas. O objetivo central é **simplificar o preparo de refeições e o acompanhamento nutricional por meio de tecnologias de visão computacional** (identificando alimentos e refeições por fotos ou entrada de texto), promovendo hábitos alimentares mais saudáveis e reduzindo ativamente o desperdício de alimentos.

***

# 2. Definição de Requisitos do Produto (PRD)

## Descrição do produto

**Problema:** O alto índice de desperdício de alimentos doméstico, aliado à frustração gerada por aplicativos de nutrição que exigem registros manuais constantes e sites de receitas que não consideram o que o usuário tem na despensa nem suas restrições dietéticas.

**Solução:** O **FazAI** é um ecossistema digital completo (app mobile e web) que utiliza tecnologias de visão computacional para identificar ingredientes via foto ou entrada manual de texto. O sistema sugere receitas personalizadas focadas no aproveitamento total da despensa e automatiza o acompanhamento nutricional de macronutrientes e calorias a partir de fotos dos pratos prontos.

Para o **público que cozinha em casa e possui metas ou restrições nutricionais**, os **ganhos** incluem a redução imediata do desperdício de alimentos, economia financeira, praticidade extrema ao eliminar o atrito do registro manual e o suporte efetivo a dietas personalizadas (ex: zero lactose, baixo açúcar, sem glúten).

**Nossos Diferenciais:**
- Visão computacional integrada para reconhecimento de alimentos tanto na despensa quanto no prato pronto.
- Cruzamento inteligente de dados: une o que o usuário tem na geladeira com suas restrições nutricionais e metas.
- Solução única com suporte a PWA (Progressive Web App), oferecendo a experiência de um aplicativo móvel nativo e acessibilidade web a partir de uma única base de código.

---

## Perfis de Usuário

### Cozinheiro Prático e Consciente

- **Problemas:** Desperdiça comida com frequência por falta de planejamento e criatividade; não encontra receitas que usem os itens disponíveis na geladeira; abandona dietas pelo cansaço de preencher apps de nutrição manualmente.
- **Objetivos:** Ter uma rotina alimentar saudável e sustentável; aproveitar ao máximo os ingredientes que possui; bater metas nutricionais sem perder tempo.
- **Dados demográficos:** Adultos que cozinham no dia a dia e buscam saúde ou possuem restrições como intolerância à lactose/glúten.
- **Motivações:** Economizar dinheiro, manter a saúde, adotar um estilo de vida prático e diminuir o desperdício alimentar.
- **Frustrações:** Abrir a geladeira e não saber o que cozinhar; usar aplicativos fragmentados e não integrados que resolvem apenas parte do problema.

---

## Principais Funcionalidades

### RFN-01 Escaneamento e Inventário de Ingredientes
- O usuário poderá utilizar a câmera para tirar fotos dos ingredientes, e a tecnologia de visão computacional identificará os itens. O usuário também poderá fazer a entrada manual via texto.
- **Critérios de Aceitação:** 
  - O sistema deve criar e manter um inventário atualizado associado ao perfil do usuário.
  - O usuário deve poder editar ou excluir itens caso a identificação falhe.

### RFN-02 Match Inteligente de Receitas Personalizadas
- O sistema cruzará os ingredientes detectados com as restrições alimentares (ex: sem glúten, sem lactose) e preferências do usuário para sugerir pratos.
- **Critérios de Aceitação:**
  - As receitas devem priorizar o uso dos ingredientes que o usuário já possui.
  - As sugestões devem obrigatoriamente respeitar as restrições de saúde cadastradas.

### RFN-03 Acompanhamento Nutricional por Imagem
- O usuário poderá registrar suas refeições diárias (via foto ou texto) para que o sistema contabilize as calorias, macronutrientes e adequação às metas.
- **Critérios de Aceitação:**
  - O app deve exibir o cálculo nutricional estimado da refeição com base na imagem processada.
  - O usuário deve ter acesso a um histórico de consumo e gamificação.

---

## Requisitos Não Funcionais

### RNF-01 - Desempenho e Multiplataforma (PWA)
A solução utilizará o **Next.js com suporte a PWA**, combinando a acessibilidade da web com os recursos e experiência de um aplicativo móvel nativo, evitando a necessidade de múltiplos repositórios.

### RNF-02 - Padrão Arquitetural SPA e Renderização
A arquitetura do front-end seguirá o padrão **SPA (Single Page Application)**. Inicialmente, adotaremos a renderização **CSR (Client Side Rendering)** para garantir interações dinâmicas e fluidas. O Next.js permitirá uma transição facilitada para **SSR (Server Side Rendering)** no futuro, se necessário, graças à sua otimização híbrida.

### RNF-03 - Confiabilidade e Tipagem
Todo o código será construído em **TypeScript**. A tipagem estática permitirá que o compilador identifique erros antes da execução, melhorando a manutenibilidade do código e blindando a aplicação contra erros comuns do JavaScript.

### RNF-04 - Arquitetura Monolítica
A aplicação seguirá o estilo arquitetural de **Monolito**, concentrando roteamento, lógica e UI em um único projeto. Isso acelera o fluxo de desenvolvimento para times pequenos, reduz a complexidade de deploy na operação e diminui custos de infraestrutura.

### RNF-05 - Padronização Visual e Estilização
A interface será estilizada com **Tailwind CSS** em uma abordagem *mobile-first*. O uso de suas classes utilitárias garantirá um design system consistente, implementação rápida de responsividade e ótima performance no build com o Next.js.

---

## Métricas de Sucesso

- **Engajamento:** Redução da taxa de abandono do acompanhamento nutricional, medindo a retenção de usuários após a substituição do registro manual pelo fotográfico.
- **Uso da IA:** Frequência de uso do reconhecimento por visão computacional versus entrada manual de texto.
- **Sustentabilidade:** Estimativa de refeições preparadas a partir de ingredientes que seriam descartados, alimentando o sistema de gamificação.

---

## Premissas e restrições

- **Premissas:** Os usuários possuem dispositivos móveis ou computadores com acesso à câmera e internet; A equipe desenvolvedora possui conhecimento para atuar com Next.js, TypeScript e Tailwind CSS.
- **Restrições:** Para viabilizar a entrega com velocidade e estabilidade em estágios iniciais, o projeto utilizará uma arquitetura de Monolito, sem microsserviços.

## Escopo

- **v1:** Criação da base Monolítica em Next.js/TypeScript/Tailwind, cadastro de usuários, entrada manual de ingredientes e renderização de receitas via CSR.
- **v2:** Implementação do suporte a PWA para experiência mobile nativa e integração da visão computacional para escaneamento da despensa e geração automática de receitas personalizadas.
- **v3:** Lançamento do acompanhamento nutricional por foto de pratos prontos, métricas de calorias/macronutrientes, histórico gamificado e eventual migração de rotas específicas para SSR visando otimização.
