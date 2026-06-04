# Design System — FazAI

Este documento estabelece as diretrizes visuais, tokens de design e padrões de componentes para a interface web do **FazAI**. O objetivo é garantir consistência visual absoluta e facilitar a codificação de componentes reutilizáveis utilizando **React** e **Tailwind CSS**.

---

## 1. Diretrizes Visuais Gerais

O **FazAI** adota uma identidade visual focada em saúde, sustentabilidade e praticidade doméstica. A interface deve transmitir uma sensação de leveza, organização e agilidade, evitando excesso de elementos gráficos e focando na leitura e na digitação fluida.

* **Abordagem**: Interface Limpa e Espaçosa (*Clean & Minimalist Web App*).
* **Acessibilidade**: Contrastes em conformidade com as diretrizes WCAG AA para garantir leitura sem esforço.
* **Sem Mídia Biométrica**: Proibido incluir qualquer componente visual voltado para o uso de câmera ou upload de fotos de alimentos.

---

## 2. Design Tokens

### 2.1 Paleta de Cores
As cores foram selecionadas com base na identidade visual do ecossistema e mapeadas para classes semânticas do Tailwind CSS.

| Categoria | Função | Tom / Hex | Classe Tailwind Exemplo |
| :--- | :--- | :--- | :--- |
| **Texto Principal** | Títulos e corpo de texto legível | `#2D3748` (Grafite Escuro) | `text-slate-800` |
| **Texto Secundário** | Placeholders, legendas e rótulos | `#718096` (Cinza Médio) | `text-slate-500` |
| **Background Base** | Fundo da aplicação (tela cheia) | `#F8FAFC` (Off-White / Slate Frio) | `bg-slate-50` |
| **Background Card** | Fundo de painéis, blocos e formulários | `#FFFFFF` (Branco Puro) | `bg-white` |
| **Action Primária** | Botões principais, links de destaque | `#FF6B6B` (Coral / Salmão Vivo) | `bg-[#ff6b6b]` |
| **Action Secundária**| Botões alternativos, filtros e chips | `#FFD166` (Amarelo Suave) | `bg-[#ffd166]` |
| **Alerta Sucesso** | Mensagens de acerto e feedback positivo | `#10B981` (Verde Esmeralda) | `text-emerald-500` / `bg-emerald-50` |
| **Alerta Erro** | Mensagens de falha, limites e exclusão | `#EF4444` (Vermelho Alerta) | `text-red-500` / `bg-red-50` |

### 2.2 Tipografia
A tipografia oficial do projeto é a família de fontes **Inter**, escolhida por sua excelente legibilidade em telas digitais de todos os tamanhos.

* **Fonte Principal**: `font-family: 'Inter', sans-serif;`
* **Escala de Tamanhos (Ajustada para Web Apps)**:
    * `<h1>` / Título Principal: 24px — Negrito (`font-bold`), Cor Grafite.
    * `<h2>` / Título de Seção: 18px — Seminegrito (`font-semibold`), Cor Grafite.
    * `<h3>` / Subtítulos e Cards: 16px — Médio (`font-medium`), Cor Grafite.
    * `<p>` / Texto Base e Rótulos: 14px — Regular (`font-normal`), Cor Grafite ou Cinza Secundário.
    * `<span>` / Legendas e Detalhes: 12px — Regular (`font-normal`), Cor Cinza Secundária.

### 2.3 Espaçamentos e Bordas
Para manter o alinhamento e o ritmo vertical da aplicação web, o design system utiliza múltiplos de 4px (escala padrão do Tailwind):

* **Arredondamento de Cantos (Border Radius)**:
    * Campos de Input e Badges: `rounded-lg` (8px).
    * Cartões, Paineis e TextAreas: `rounded-xl` (12px).
* **Espaçamento Interno (Padding)**:
    * Pequenos elementos / Chips: `px-3 py-1` (12px horiz / 4px vert).
    * Botões padrão: `px-4 py-2` (16px horiz / 8px vert).
    * Containers e Cartões: `p-6` (24px geral).

---

## 3. Padrões de Componentes (Guia de Estilo Tailwind)

### 3.1 Botões (`<button>`)

#### Botão Primário (Ações de Impacto: Entrar, Processar, Gerar Receita)
```html
<button class="bg-[#FF6B6B] hover:bg-[#E55A5A] text-white font-medium px-4 py-2 rounded-lg shadow-sm transition-colors duration-200 disabled:opacity-50">
  Texto do Botão
</button>
```

#### Botão Secundário (Ações Alternativas: Gerar Outra, Adicionar Manual)
```html
<button class="bg-[#FFD166] hover:bg-[#E6BC5C] text-slate-800 font-medium px-4 py-2 rounded-lg shadow-sm transition-colors duration-200">
  Texto do Botão
</button>
```

### 3.2 Campos de Entrada (Forms & Inputs)

#### Área de Texto Livre (TextArea para Inventário da Despensa)
Este é o componente mais importante do FazAI, substituindo o antigo botão de câmera. Deve ser largo e convidativo.

```html
<textarea 
  class="w-full min-h-[120px] p-4 bg-white border border-slate-200 rounded-xl shadow-sm focus:ring-2 focus:ring-[#FF6B6B] focus:border-[#FF6B6B] resize-none outline-none text-slate-800 placeholder-slate-400 transition-all"
  placeholder="O que você tem na geladeira/despensa hoje? (Ex: Tenho 3 ovos, espinafre e duas fatias de queijo)...">
</textarea>
```

#### Inputs de Texto Padrão (Login e Cadastro)
```html
<input 
  type="text" 
  class="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#FF6B6B] focus:border-[#FF6B6B] text-slate-800 transition-all" 
/>
```

### 3.3 Cartões e Painéis (Cards)
Card de Receita / Histórico
```html
<div class="bg-white border border-slate-100 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
  </div>
```

#### Bloco de Métrica Nutricional (Exibição de Calorias e Macros)
Devem ser dispostos em uma linha ou grid horizontal com quatro colunas de tamanho igual na tela de receitas.

```html
<div class="bg-slate-50 border border-slate-100 rounded-xl p-4 text-center">
  <span class="block text-xs font-medium text-slate-500 uppercase tracking-wider">Proteínas</span>
  <span class="text-xl font-bold text-slate-800">24g</span>
</div>
```

## 4. Estrutura e Grid de Layout para Desktop Web
A aplicação deixa de seguir o contêiner fixo centralizado do celular para expandir-se elegantemente em resoluções maiores:

- Main Container: Uso do limite de largura máxima centralizado (max-w-7xl mx-auto px-4 sm:px-6 lg:px-8) para envelopar a aplicação em telas widescreen.

- Dashboard Split (Tela da Despensa): Dividido em duas colunas utilizando Grid do Tailwind CSS (grid grid-cols-1 lg:grid-cols-3 gap-8):

- Coluna da Esquerda (Largura 2/3): Contém o painel principal com o TextArea para input inteligente de texto livre dos ingredientes.

- Coluna da Direita (Largura 1/3): Exibe a lista estruturada de ingredientes com os botões de ação e remoção individual (lixeira).

## 5. Diretrizes para IA
Ao gerar ou refatorar o código CSS/Tailwind da interface do FazAI usando ferramentas assistidas por inteligência artificial, ordene que a IA siga estritamente estas três regras:

- No Custom Stylesheets: Toda a estilização deve ser feita utilizando estritamente as classes nativas de utilitários do Tailwind CSS inline ou mapeadas na configuração do framework. Não gerar arquivos .css paralelos.

- State Feedback Styles: Certificar-se de incluir classes para estados interativos de inputs e botões (focus:, hover:, active:, disabled:).

- Strict Layout Semantics: Utilizar contêineres e margens estruturais para manter o espaçamento uniforme. Evitar o uso de valores arbitrários (como mt-[17px]), preferindo a escala padrão do framework (como mt-4).