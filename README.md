 # FazAI 🍳🥗

> **FazAI** é uma plataforma inteligente desenvolvida para eliminar a fricção no planejamento alimentar e combater o desperdício de alimentos domésticos. 
> 
> Projeto acadêmico para a disciplina de **Práticas de Implementação e Evolução de Software** do curso de Pós-Graduação da **PUC Minas**.

---

## 📖 Sobre o Projeto

### O Problema
Pessoas que cozinham em casa e possuem restrições alimentares ou objetivos nutricionais específicos enfrentam alta complexidade ao tentar conciliar uma alimentação saudável com o gerenciamento eficiente da sua despensa. As soluções atuais sofrem com:
1. **Falta de Contexto de Inventário**: Receitas genéricas na internet ignoram o que o usuário já possui em casa ou suas restrições de saúde específicas, resultando em desperdício de alimentos e gastos desnecessários.
2. **Alta Carga Cognitiva**: Aplicativos tradicionais de nutrição exigem registros exaustivos e manuais (pesquisa exaustiva de itens em listas, pesagem precisa de gramaturas, etc.), o que leva ao rápido abandono da rotina.

### A Solução
O **FazAI** propõe uma experiência fluida através do uso de Inteligência Artificial:
* **Entrada Inteligente**: O usuário digita de forma livre os ingredientes disponíveis na geladeira/despensa (ex: *"tenho 3 ovos, um punhado de espinafre e metade de uma cebola"*). A IA interpreta, extrai e estrutura o inventário automaticamente.
* **Geração Dinâmica de Receitas**: O sistema combina os ingredientes ativos da despensa com as restrições alimentares e metas salvas no perfil do usuário para gerar receitas personalizadas e exclusivas.
* **Informação Nutricional Automatizada**: Cada receita gerada já inclui o cálculo estimado de macronutrientes (carboidratos, proteínas, gorduras) e calorias totais.

---

## 🛠️ Stack Tecnológica

O FazAI utiliza uma arquitetura Cliente-Servidor desacoplada e moderna estruturada em um Monorepo unificado.

### Frontend
* **Linguagem:** TypeScript (v5+)
* **Framework:** React (v18+) — Single Page Application (SPA) com Client-Side Rendering (CSR).
* **Estilização:** Tailwind CSS — Framework utilitário mobile-first para um layout moderno, limpo e responsivo.

### Backend & Hospedagem
* **Linguagem:** TypeScript (v5+)
* **Runtime / Ambiente:** Node.js integrado às **Serverless Functions da Vercel** (deploy automático e unificado).
* **Framework:** Express.js ou Fastify (estruturas leves para execução Serverless).
* **Observabilidade:** Logs estruturados utilizando Pino ou nativos do painel da Vercel.

### Persistência de Dados (Banco de Dados)
* **Banco de Dados:** **PostgreSQL** hospedado na nuvem e gerenciado via **Supabase**.
* **ORM:** **Prisma ORM** — Mapeamento objeto-relacional fortemente tipado utilizando a abordagem Code-First para migrações automatizadas via CLI (`@prisma/client`).

### Integrações, Segurança e IA
* **Autenticação e Sessão:** **Clerk** (integração nativa no frontend e verificação JWT segura via SDK no backend).
* **Motor de IA:** API do Google Gemini (modelo **Gemini 1.5 Flash**) via SDK oficial (`@google/genai`) com respostas estruturadas via JSON Mode.

---

## 🚀 Principais Funcionalidades

### 1. Entrada Inteligente e Inventário (RFN-01)
* Entrada textual livre onde o usuário lista o que tem disponível.
* Processamento e estruturação automática dos ingredientes por meio de IA (Gemini).
* Edição simplificada (exclusão pontual em cards/chips se a IA falhar).

### 2. Geração de Receitas Personalizadas (RFN-02)
* Geração baseada estritamente nos ingredientes que estão ativos na despensa.
* Respeito absoluto às restrições cadastradas no perfil do usuário (ex: sem lactose, sem glúten, vegano, vegetariano, etc.).

### 3. Cálculo de Macronutrientes e Calorias (RFN-03)
* Apresentação clara de Calorias (kcal), Proteínas, Carboidratos e Gorduras na tela da receita.
* Possibilidade de favoritar e marcar a refeição como preparada, salvando o histórico.

---

## 🗺️ Fluxo de Telas (Design System & UI)

A interface segue uma abordagem *mobile-first*, adaptada perfeitamente a desktop de modo limpo e espaçoso. As principais telas e seus fluxos incluem:

1. **INT-001 - Tela de Acesso (Login / Cadastro):** Autenticação e cadastro de usuários gerenciados de forma nativa e segura pelos componentes visuais do **Clerk**.
2. **INT-002 - Tela de Perfil e Restrições:** Onde o usuário configura sua meta calórica diária e seleciona suas restrições de saúde (Sem Lactose, Sem Glúten, Sem Ovo, etc.) e preferências (Vegetariano, Vegano, Low Carb).
3. **INT-003 - Tela da Despensa Inteligente (Dashboard):**
   * *Coluna Esquerda (2/3):* Campo de entrada de texto livre (`TextArea`) para processar ingredientes.
   * *Coluna Direita (1/3):* Lista reativa de ingredientes estruturados com controle de remoção individual (ícone de lixeira vermelha).
4. **INT-004 - Tela de Exibição da Receita:** Exibe o título, painel destacado com 4 métricas nutricionais, lista de ingredientes finais e o modo de preparo passo a passo. Contém as ações de "Favoritar/Preparar" e "Gerar Outra Sugestão".
5. **INT-005 - Tela de Histórico:** Lista pesquisável em cards das receitas favoritas e preparadas, exibindo o sumário de desperdício evitado.

---

## 🔌 API Endpoints Principais

A API segue o padrão REST e responde em JSON (camelCase). O versionamento é feito via URL (`/api/v1/`).

### Autenticação & Usuários
* Os fluxos públicos de cadastro, login e redefinição de senha são resolvidos nativamente nos componentes visuais do **Clerk** no frontend, eliminando a necessidade de rotas de auth manuais no backend.

### Endpoints Protegidos (Requer Token do Clerk no cabeçalho `Authorization: Bearer <TOKEN_JWT_CLERK>`)
* `GET /api/v1/profile` - Recupera as metas alimentares e restrições de saúde do usuário logado.
* `PUT /api/v1/profile` - Atualiza restrições (ex: sem lactose, sem glúten) e objetivos de calorias do perfil.
* `GET /api/v1/pantry` - Lista os ingredientes estruturados salvos no inventário do usuário.
* `POST /api/v1/pantry/parse-text` - Recebe texto livre, envia à IA Gemini para interpretação e retorna JSON estruturado.
* `POST /api/v1/pantry/items` - Persiste a lista final ou um item individual no banco de dados do inventário.
* `DELETE /api/v1/pantry/items/{id}` - Remove um ingrediente específico da despensa.
* `POST /api/v1/recipes/generate` - Coleta ingredientes ativos e restrições, envia para a IA e retorna uma receita com macros estimados.
* `POST /api/v1/recipes/favorite` - Salva a receita gerada no histórico/favoritos do banco PostgreSQL (Supabase).
* `GET /api/v1/recipes/history` - Retorna o histórico de receitas preparadas ou favoritadas pelo usuário.

---

## ⚙️ Configuração e Execução

### Pré-requisitos
* [Node.js](https://nodejs.org/) (versão 18 ou superior)
* [Vercel CLI](https://vercel.com/cli) (instalada globalmente: `npm i -g vercel`)
* Um editor como [VS Code](https://code.visualstudio.com/)

### 1. Configurando Variáveis de Ambiente
Crie um arquivo `.env` na raiz do projeto contendo as seguintes credenciais:
```env
# Banco de Dados (Supabase PostgreSQL)
DATABASE_URL="postgresql://user:password@db-supabase-address:5432/dbname?schema=public"

# Autenticação (Clerk Keys)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# API do Google Gemini
GEMINI_API_KEY=sua_chave_api_do_google_gemini_aqui
```

### 2. Preparação do Ambiente e Dependências
Na raiz do monorepo, instale todas as dependências do frontend e backend:
```bash
# Instalar dependências do Monorepo
npm install
```

### 3. Executando as Migrações do Banco de Dados
Use o Prisma CLI para criar e aplicar a estrutura das tabelas no PostgreSQL do Supabase:
```bash
# Executa as migrações em ambiente de desenvolvimento
npx prisma migrate dev
```

### 4. Executando Localmente (Vercel CLI)
Como frontend e backend rodam integrados via Vercel, utilize a CLI da Vercel para simular o ambiente Serverless localmente:
```bash
# Iniciar o servidor local de desenvolvimento unificado
vercel dev
```
O comando iniciará a aplicação (frontend React e rotas de Serverless API do backend) simulada em `http://localhost:3000`.

---

## 🛡️ Segurança e Tenancy
* **Isolamento de Dados:** O sistema utiliza o padrão *Shared Database, Shared Process* (Single-Tenancy Arquitetural com isolamento lógico por linha). Cada linha das tabelas (`PantryItems`, `UserProfiles`, `SavedRecipes`) é vinculada a um `UserId` exclusivo (do tipo `String` ou `UUID` fornecido pelo Clerk).
* **Validação de Entrada:** Validação em duas camadas — reativa no frontend (via Zod/Formik) e estrita no backend (com esquemas baseados em **Zod** antes do processamento de regras de negócios).
* **Segurança de APIs:** Todos os endpoints protegidos verificam o token JWT do Clerk.

---

## 👥 Contribuição e Licença

Este projeto é desenvolvido para fins acadêmicos na **PUC Minas**. 

* **Autores:** Alunos da Pós-Graduação em Engenharia de Software da PUC Minas.
* **Licença:** Este repositório está sob a licença MIT.
