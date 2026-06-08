# Especificação Técnica

## Visão Geral Técnica
O objetivo deste documento é descrever a arquitetura técnica, as escolhas de infraestrutura, os padrões de desenvolvimento e a stack tecnológica para o sistema **FazAI**. O público-alvo deste documento inclui desenvolvedores de software, engenheiros de segurança, administradores de banco de dados e arquitetos envolvidos na implementação e evolução continuada do ecossistema. 

O sistema visa resolver o problema do desperdício de alimentos domésticos e a fricção no acompanhamento nutricional, permitindo que os usuários cadastrem restrições de saúde, digitem ingredientes em formato de texto livre (processados por IA) e recebam receitas personalizadas com cálculos de macronutrientes gerados por uma IA gratuita (API do Gemini).

---

## Arquitetura de Referência
A solução adota uma arquitetura clássica de Cliente-Servidor distribuída e desacoplada, priorizando simplicidade de manutenção e alta aderência à stack de preferência do time:

* **Estilo Arquitetural**: Arquitetura em Camadas (Layered Architecture) no Backend e Componentização Baseada em Estados no Frontend. O backend atuará como uma API RESTful monolítica robusta, facilitando o deploy e testes rápidos para o time enxuto da pós-graduação.
* **Componentes Principais**:
    * **Frontend**: Single Page Application (SPA) responsiva que se comunica de forma assíncrona com o servidor.
    * **Backend (API)**: Centraliza a lógica de negócios, autenticação, controle de inventário e orquestração de chamadas de IA.
    * **Banco de Dados**: Persistência relacional para usuários, perfis, inventários de ingredientes e histórico de receitas.
    * **Provedor de IA Externo**: Integração via SDK/HTTP com a API do Google Gemini (camada gratuita) para processamento de linguagem natural (NLP) e geração de conteúdo.
* **Serviço de Observabilidade**: Utilização de logs estruturados nativos do .NET (Serilog) direcionados para o console e arquivos locais rotativos na V1, com possibilidade de acoplamento do Application Insights ou OpenTelemetry em evoluções futuras.
* **Autenticação e Autorização**: Baseada em tokens JWT (JSON Web Tokens) assinados assimetricamente, armazenados de forma segura no cliente (HTTP-only cookies ou local storage com proteção contra XSS).
* **Protocolos de Comunicação**: HTTPS para todas as requisições síncronas entre Frontend e Backend (REST/JSON) e HTTPS/TLS seguro para chamadas de integração externas com a API de IA.
* **Infraestrutura de Deployment**: Preparado para conteinerização via Docker. O backend e o banco de dados podem rodar em ambientes controlados isoladamente. O frontend pode ser hospedado de forma estática em serviços gerenciados.

---

## Stack Tecnológica

### Frontend
* **Linguagem**: TypeScript (v5+) - Garantindo tipagem estática, redução de erros em tempo de desenvolvimento e auto-completar avançado nas interfaces.
* **Framework web**: React (v18+) - Utilizando o padrão Single Page Application (SPA) focado em alta reatividade, renderização no lado do cliente (CSR) e gerenciamento otimizado de estados com React Hooks (useState, useEffect, useContext).
* **Estilização**: Tailwind CSS - Framework utilitário mobile-first que elimina a escrita repetitiva de arquivos CSS e garante a aplicação de um design system limpo e consistente.

### Backend
* **Linguagem**: C# (v12)
* **Runtime**: .NET 8 LTS
* **Framework**: ASP.NET Core Web API
* **Persistência**: SQLite - Banco de dados relacional leve baseado em arquivo local, ideal para simplificação de infraestrutura e execução zero-configuração em ambiente acadêmico.
* **ORM**: Entity Framework Core 8 (EF Core) - Mapeamento objeto-relacional utilizando a abordagem Code-First para migrações automatizadas e consultas seguras via LINQ.

### Stack de Desenvolvimento
* **IDE**: Visual Studio 2022 ou Visual Studio Code.
* **Gerenciamento de pacotes**: NuGet (para o ecossistema .NET) e npm ou yarn (para o ecossistema React).
* **Ambiente de desenvolvimento local**: Execução nativa local via CLI do .NET (`dotnet run`), utilizando o arquivo de banco de dados SQLite autogerado na raiz do projeto, dispensando containers de banco de dados para o desenvolvimento básico.
* **Infraestrutura como Código (IaC)**: Scripts básicos de Dockerfile e Docker Compose para provisionamento ágil do ambiente de homologação.
* **Pipeline CI/CD**: GitHub Actions configurado com workflows para build automático, checagem de tipos (TypeScript), compilação do .NET e execução de testes de unidade a cada Pull Request.

### Integrações
* **Persistência**: Provedor oficial do SQLite para o Entity Framework Core (`Microsoft.EntityFrameworkCore.Sqlite`).
* **Deployment**: Imagens base Docker oficiais (`mcr.microsoft.com/dotnet/aspnet` e `node:alpine`).
* **Segurança (autenticação e autorização)**: Pacote `Microsoft.AspNetCore.Authentication.JwtBearer` para validação nativa de tokens no backend.
* **Observabilidade**: Integração direta com provedores de IA gratuitos utilizando o SDK oficial do Google Gemini para C# (`Mscc.GenerativeAI` ou chamadas HTTP estruturadas usando `HttpClient` nativo para consumo do endpoint oficial do Gemini 1.5 Flash).

---

## Segurança

### Autenticação e Gestão de Sessão
O mecanismo de autenticação utilizará JWT com tempo de expiração curto (ex: 1 hora) e geração opcional de Refresh Tokens. As senhas dos usuários serão criptografadas antes do armazenamento utilizando o algoritmo de hashing robusto **BCrypt** ou **PBKDF2** com salt aleatório individual.

### Controle de Acesso e Autorização
A autorização de endpoints será baseada em perfis e declarações do usuário (*Claim-Based Authorization*). Cada usuário só poderá ler, atualizar ou excluir registros associados ao seu próprio `UserId`, validado diretamente pelo payload extraído do token JWT correspondente, mitigando falhas do tipo IDOR (*Insecure Direct Object References*).

### Segurança de Dados e Validação
Todas as entradas do usuário passarão por camadas estritas de validação bi-direcional:
1.  **Frontend**: Validação reativa de formatos, campos obrigatórios e tamanhos usando bibliotecas como Zod ou Formik.
2.  **Backend**: Validação rígida através do *Data Annotations* ou *FluentValidation* no .NET antes do processamento de qualquer lógica de negócios, evitando ataques de injeção ou corrupção de memória.

#### Criptografia e Proteção de Dados
* **Dados em Trânsito**: Uso obrigatório do protocolo TLS 1.3/HTTPS em todas as conexões, aplicando políticas de HSTS (*HTTP Strict Transport Security*).
* **Dados em Repouso**: Configuração de criptografia nativa de conexões de banco de dados e proteção de chaves e strings de conexão sensíveis utilizando variáveis de ambiente ou o *User Secrets* do .NET durante o ciclo de desenvolvimento local.

### Segurança da Infraestrutura e Configuração
Os containers Docker rodarão com usuários de privilégios reduzidos (*non-root*). As portas externas expostas serão estritamente limitadas ao tráfego HTTP/HTTPS retransmitido por um proxy reverso.

### Segurança no Desenvolvimento e Operação (DevSecOps)
Inclusão de ferramentas de análise estática de código no pipeline do GitHub Actions para detecção precoce de vulnerabilidades (ex: dependências vulneráveis via `npm audit` e `dotnet list package --vulnerable`).

---

## APIs
A API seguirá o padrão arquitetural REST com payloads estritamente em formato JSON.

* **Versionamento**: Feito via URL (ex: `/api/v1/[controller]`).
* **Padrão de Nomenclatura**: URLs em letras minúsculas e termos no plural para recursos (ex: `/api/v1/users`, `/api/v1/ingredients`). Propriedades do JSON usarão o padrão *camelCase*.
* **Autenticação**: Cabeçalho HTTP `Authorization: Bearer <TOKEN_JWT>` exigido em todos os endpoints protegidos.

### Resumo dos Principais Endpoints

#### Endpoints Públicos:
* `POST /api/v1/auth/register` - Cadastro de novos usuários.
* `POST /api/v1/auth/login` - Autenticação e emissão do token JWT.

#### Endpoints Protegidos (Requer Token):
* `GET /api/v1/profile` - Recupera as metas alimentares e restrições de saúde do usuário logado.
* `PUT /api/v1/profile` - Atualiza restrições (ex: sem lactose, sem glúten) e objetivos de calorias.
* `GET /api/v1/pantry` - Lista os ingredientes estruturados atualmente salvos no inventário do usuário.
* `POST /api/v1/pantry/parse-text` - Recebe um texto livre (ex: *"tenho 3 ovos, sal e duas fatias de queijo"*), faz a chamada interna para a API gratuita do Gemini, interpreta os itens e retorna uma lista JSON estruturada para confirmação do usuário.
* `POST /api/v1/pantry/items` - Persiste a lista final ou um item individual no banco de dados do inventário.
* `DELETE /api/v1/pantry/items/{id}` - Remove um ingrediente específico da despensa.
* `POST /api/v1/recipes/generate` - Coleta os ingredientes ativos da despensa e as restrições do perfil, formata o prompt de sistema especializado, consome a API do Gemini e retorna uma receita inédita passo a passo contendo os cálculos nutricionais estimados (macros e calorias).
* `POST /api/v1/recipes/favorite` - Salva a receita gerada no histórico/favoritos do banco SQL Server.
* `GET /api/v1/recipes/history` - Lista o histórico de receitas preparadas ou favoritadas pelo usuário.

---

## Tenancy
* **Estratégia**: O sistema operará no modelo **Single-Tenancy Arquitetural com Isolamento Lógico por Linha** (*Shared Database, Shared Process*). Como se trata de um aplicativo B2C voltado para o consumidor final, todos os usuários compartilham a mesma infraestrutura de servidores e tabelas de banco de dados.
* **Isolamento**: O isolamento estrito dos dados dos usuários é garantido através da inclusão obrigatória da coluna chave estrangeira `UserId` (do tipo `UniqueIdentifier` ou `INT`) em todas as tabelas transacionais (`PantryItems`, `UserProfiles`, `SavedRecipes`).
* **Migrações**: Gerenciadas via EF Core Migrations aplicadas localmente por linha de comando (`dotnet ef database update`) ou programaticamente na inicialização da aplicação web, gerando e estruturando o arquivo local do SQLite de forma automatizada.

---

## Diretrizes para Desenvolvimento Assistido por IA
Ao utilizar ferramentas de IA Generativa (como Copilot, ChatGPT ou o próprio Gemini) para codificar o sistema **FazAI**, o desenvolvedor deve instruir a IA a seguir rigorosamente as seguintes diretrizes:

1.  **Strict Typing**: Exigir sempre tipagem estática forte em C# e TypeScript, recusando o uso do tipo genérico `any` no React ou objetos fracamente tipados no .NET.
2.  **No Photo Logic**: Ignorar qualquer implementação de processamento de imagens, upload de arquivos de fotos ou visão computacional. O foco absoluto do código gerado deve ser a manipulação de strings de texto livre enviados via formulários.
3.  **JSON Mode Prompting**: Ao escrever a lógica de integração com a API do Gemini no backend .NET, instruir a IA a usar parametrizações de resposta do tipo JSON estruturado (configurando o `responseMimeType: "application/json"` na API do Gemini se disponível, ou formatando o prompt com delimitadores estritos) para garantir que as respostas retornem como objetos parseáveis e não como blocos de Markdown texto puro.
4.  **EF Core Performance**: Garantir que as consultas geradas utilizem carregamento explícito ou filtragens eficientes baseadas no indexador do `UserId` para evitar vazamento de dados entre perfis.