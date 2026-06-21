# Especificação Técnica — FazAI (Versão Node.js / Vercel / Supabase)

## Visão Geral Técnica
O objetivo deste documento é descrever a arquitetura técnica, as escolhas de infraestrutura, os padrões de desenvolvimento e a stack tecnológica para o sistema **FazAI**. O público-alvo deste documento inclui desenvolvedores de software, engenheiros de segurança, administradores de banco de dados e arquitetos envolvidos na implementação e evolução continuada do ecossistema. 

O sistema visa resolver o problema do desperdício de alimentos domésticos e a fricção no acompanhamento nutricional, permitindo que os usuários cadastrem restrições de saúde, digitem ingredientes em formato de texto livre (processados por IA) e recebam receitas personalizadas com cálculos de macronutrientes gerados por uma IA gratuita (API do Gemini).

---

## Arquitetura de Referência
A solução adota uma arquitetura classificação de Cliente-Servidor distribuída e desacoplada, priorizando simplicidade de manutenção e alta aderência à stack de preferência do time:

* **Estilo Arquitetural**: Frontend baseado em SPA e backend estruturado como uma API baseada em Serverless Functions hospedadas na Vercel. O backend atuará de forma desacoplada, facilitando o deploy e testes rápidos para o time enxuto da pós-graduação.
* **Componentes Principais**:
    * **Frontend**: Single Page Application (SPA) responsiva que se comunica de forma assíncrona com o servidor.
    * **Backend (API)**: Centraliza a lógica de negócios, controle de inventário e orquestração de chamadas de IA.
    * **Banco de Dados**: Persistência relacional para usuários, perfis, inventários de ingredientes e histórico de receitas.
    * **Provedor de IA Externo**: Integração via SDK/HTTP com a API do Google Gemini (camada gratuita) para processamento de linguagem natural (NLP) e geração de conteúdo.
* **Serviço de Observabilidade**: Utilização de logs estruturados utilizando bibliotecas leves para Node.js (como Pino ou os logs nativos do painel da Vercel) direcionados para o console na V1.
* **Autenticação e Autorização**: Autenticação nativa gerenciada pelo Clerk, utilizando tokens de sessão JWT validados de forma segura pelo SDK oficial do Clerk no backend.
* **Protocolos de Comunicação**: HTTPS para todas as requisições síncronas entre Frontend e Backend (REST/JSON) e HTTPS/TLS seguro para chamadas de integração externas com a API de IA.
* **Infraestrutura de Deployment**: Deploy automatizado e unificado na Vercel para frontend e backend (Serverless), eliminando a necessidade de infraestrutura gerenciada ou contêineres Docker em produção.

---

## Stack Tecnológica

### Frontend
* **Linguagem**: TypeScript (v5+) - Garantindo tipagem estática, redução de erros em tempo de desenvolvimento e auto-completar avançado nas interfaces.
* **Framework web**: React (v18+) - Utilizando o padrão Single Page Application (SPA) focado em alta reatividade, renderização no lado do cliente (CSR) e gerenciamento otimizado de estados com React Hooks (useState, useEffect, useContext).
* **Estilização**: Tailwind CSS - Framework utilitário mobile-first que elimina a escrita repetitiva de arquivos CSS e garante a aplicação de um design system limpo e consistente.

### Backend
* **Linguagem**: TypeScript (v5+)
* **Runtime / Ambiente**: Node.js integrado às Serverless Functions da Vercel
* **Framework**: Express.js ou Fastify (estruturas leves ideais para execução Serverless)
* **Persistência**: PostgreSQL hospedado de forma gerenciada na nuvem pelo **Supabase**
* **ORM**: **Prisma ORM** - Mapeamento objeto-relacional utilizando a abordagem Code-First para migrações automatizadas e consultas fortemente tipadas

### Stack de Desenvolvimento
* **IDE**: Visual Studio Code.
* **Gerenciamento de pacotes**: `npm`, `yarn` ou `pnpm` para gerenciar as dependências do Monorepo unificado.
* **Ambiente de desenvolvimento local**: Execução local integrada via CLI da Vercel (`vercel dev`), conectando-se localmente à string de conexão de desenvolvimento do Supabase PostgreSQL.
* **Pipeline CI/CD**: GitHub Actions configurado com workflows para build automático, checagem de tipos (TypeScript via `tsc --noEmit`) em todo o monorepo e execução de testes de unidade a cada Pull Request.

### Integrações
* **Persistência**: SDK oficial do Prisma Client (`@prisma/client`).
* **Segurança (autenticação e autorização)**: SDK oficial do Clerk para Node.js (`@clerk/backend`).
* **Observabilidade**: Integração direta com provedores de IA gratuitos utilizando o SDK oficial do Google Gen AI para JavaScript/TypeScript (`@google/genai` para consumo do endpoint oficial do Gemini 1.5 Flash).

---

## Segurança

### Autenticação e Gestão de Sessão
A autenticação e criptografia de credenciais são totalmente delegadas ao Clerk de forma externa, que gerencia as sessões com total segurança e emite os tokens validados nos middlewares da API.

### Controle de Acesso e Autorização
A autorização de endpoints será baseada em perfis e declarações do usuário (*Claim-Based Authorization*). Cada usuário só poderá ler, atualizar ou excluir registros associados ao seu próprio `UserId` (fornecido pelo Clerk), validado diretamente pelo payload extraído do token correspondente, mitigando falhas do tipo IDOR (*Insecure Direct Object References*).

### Segurança de Dados e Validação
Todas as entradas do usuário passarão por camadas estritas de validação bi-direcional:
1.  **Frontend**: Validação reativa de formatos, campos obrigatórios e tamanhos usando bibliotecas como Zod ou Formik.
2.  **Backend**: Validação rígida através de esquemas baseados na biblioteca **Zod** antes do processamento de qualquer lógica de negócios, evitando ataques de injeção ou corrupção de memória.

#### Criptografia e Proteção de Dados
* **Dados em Trânsito**: Uso obrigatório do protocolo TLS 1.3/HTTPS em todas as conexões, aplicando políticas de HSTS (*HTTP Strict Transport Security*).
* **Dados em Repouso**: Configuração de criptografia nativa de conexões de banco de dados e proteção de chaves e strings de conexão sensíveis utilizando variáveis de ambiente injetadas de forma segura no painel da Vercel e replicadas localmente no arquivo `.env`.

### Segurança no Desenvolvimento e Operação (DevSecOps)
Inclusão de ferramentas de análise estática de código no pipeline do GitHub Actions para detecção precoce de vulnerabilidades (ex: dependências vulneráveis via `npm audit`).

---

## APIs
A API seguirá o padrão arquitetural REST com payloads estritamente em formato JSON.

* **Versionamento**: Feito via URL (ex: `/api/v1/[controller]`).
* **Padrão de Nomenclatura**: URLs in letras minúsculas e termos no plural para recursos (ex: `/api/v1/users`, `/api/v1/ingredients`). Propriedades do JSON usarão o padrão *camelCase*.
* **Autenticação**: Cabeçalho HTTP `Authorization: Bearer <TOKEN_JWT_CLERK>` exigido em todos os endpoints protegidos.

### Resumo dos Principais Endpoints

#### Endpoints Gerenciados pelo Clerk (Front-end Nativo):
*(Os fluxos públicos de cadastro e login de usuários são resolvidos nativamente nos componentes de interface do Clerk, eliminando rotas manuais de auth no backend Node.js)*

#### Endpoints Protegidos (Requer Token do Clerk no Backend):
* `GET /api/v1/profile` - Recupera as metas alimentares e restrições de saúde do usuário logado.
* `PUT /api/v1/profile` - Atualiza restrições (ex: sem lactose, sem glúten) e objetivos de calorias.
* `GET /api/v1/pantry` - Lista os ingredientes estruturados atualmente salvos no inventário do usuário.
* `POST /api/v1/pantry/parse-text` - Recebe um texto livre (ex: *"tenho 3 ovos, sal e duas fatias de queijo"*), faz a chamada interna para a API gratuita do Gemini, interpreta os itens e retorna uma lista JSON estruturada para confirmação do usuário.
* `POST /api/v1/pantry/items` - Persiste a lista final ou um item individual no banco de dados do inventário.
* `DELETE /api/v1/pantry/items/{id}` - Remove um ingrediente específico da despensa.
* `POST /api/v1/recipes/generate` - Coleta os ingredientes ativos da despensa e as restrições do perfil, formata o prompt de sistema especializado, consome a API do Gemini e retorna uma receita inédita passo a passo contendo os cálculos nutricionais estimados (macros e calorias).
* `POST /api/v1/recipes/favorite` - Salva a receita gerada no histórico/favoritos do banco de dados PostgreSQL do Supabase.
* `GET /api/v1/recipes/history` - Lista o histórico de receitas preparadas ou favoritadas pelo usuário.

---

## Tenancy
* **Estratégia**: O sistema operará no modelo **Single-Tenancy Arquitetural com Isolamento Lógico por Linha** (*Shared Database, Shared Process*). Como se trata de um aplicativo B2C voltado para o consumidor final, todos os usuários compartilham a mesma infraestrutura de servidores e tabelas de banco de dados.
* **Isolamento**: O isolamento estrito dos dados dos usuários é garantido através da inclusão obrigatória da coluna chave estrangeira `UserId` (do tipo `String` ou `UUID` fornecido pelo Clerk) em todas as tabelas transacionais (`PantryItems`, `UserProfiles`, `SavedRecipes`).
* **Migrações**: Gerenciadas via CLI do Prisma ORM através dos comandos `npx prisma migrate dev` em ambiente de desenvolvimento e `npx prisma migrate deploy` nos ambientes de homologação/produção, estruturando o banco PostgreSQL de forma automatizada.

---

## Diretrizes para Desenvolvimento Assistido por IA
Ao utilizar ferramentas de IA Generativa (como Copilot, ChatGPT ou o próprio Gemini) para codificar o sistema **FazAI**, o desenvolvedor deve instruir a IA a seguir rigorosamente as seguintes diretrizes:

1.  **Strict Typing**: Exigir sempre tipagem estática forte em TypeScript em todo o monorepo, recusando terminantemente o uso do tipo genérico `any` no React ou no Node.js.
2.  **No Photo Logic**: Ignorar qualquer implementação de processamento de imagens, upload de arquivos de fotos ou visão computacional. O foco absoluto do código gerado deve ser a manipulação de strings de texto livre enviados via formulários.
3.  **JSON Mode Prompting**: Ao escrever a lógica de integração com a API do Gemini no backend Node.js, instruir a IA a usar parametrizações de resposta do tipo JSON estruturado (configurando o `responseMimeType: "application/json"` na API do Gemini se disponível, ou formatando o prompt com delimitadores estritos) para garantir que as respostas retornem como objetos parseáveis e não como blocos de Markdown texto puro.
4.  **Prisma Client Performance**: Garantir que as cookies geradas utilizem filtragens eficientes baseadas no indexador do `UserId` extraído do Clerk para evitar vazamento de dados entre perfis.