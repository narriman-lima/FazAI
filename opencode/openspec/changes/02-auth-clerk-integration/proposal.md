# Proposal: 02-auth-clerk-integration

## Objetivo
Implementar o fluxo de autenticação e proteção de rotas no ecossistema FazAI utilizando o SDK oficial do Clerk. No frontend, integrar os formulários de Login e Cadastro (Stitch INT-001). No backend, estruturar o middleware de segurança que intercepta e valida os tokens JWT, injetando o `UserId` nas requisições autorizadas.

---

## Escopo Funcional
*   **Instalação**: Instalar `@clerk/backend` no backend e SDK do Clerk correspondente no frontend React.
*   **Segurança Backend**: Middleware de validação JWT (`requireAuth`) que extrai o token do header `Authorization: Bearer <JWT>`, valida a assinatura e disponibiliza o `req.auth.userId`.
*   **Interface Frontend (Stitch INT-001)**: Tela de Login e Cadastro (`8c2b8530201f4ee38608e26a0681a22f`) implementada com componentes nativos do Clerk customizados visualmente via propriedade `appearance` para seguir o design system (Inter, Coral `#FF7F50`, Slate `#F8F9FA`).
*   **Rotas de Teste**: Rota `/api/v1/auth-status` para verificação rápida de estado de login.

---

## Dependências
*   `01-monorepo-db-setup` (Necessário ter o monorepo e dependências prontas).

---

## Riscos e Mitigações
*   **Risco**: Tokens JWT expirados ou assinaturas malformadas gerando logs excessivos ou travamento de rotas serverless.
*   **Mitigação**: O middleware de autenticação deve capturar erros de forma graciosa e responder com HTTP 401 de forma estruturada.
*   **Risco**: Incompatibilidade visual dos componentes Clerk com o minimalismo exigido no Stitch.
*   **Mitigação**: Customizar o layout do Clerk desabilitando componentes desnecessários e aplicando o tema de cores coral e grafite definidos no design system.

---

## Execução de Linter Necessária
*   **Comando**: `npx eslint apps/` e `npx tsc --noEmit` na raiz.
*   **Regras**: Nenhum `any` nos tipos do Express/Fastify request middleware.

---

## Testes Unitários Necessários
*   **Foco**: Função de extração do JWT a partir do cabeçalho `Authorization`.
*   **Cenários**: Validar retorno nulo para cabeçalhos vazios, formatos inválidos (ex: sem o prefixo `Bearer `) ou tokens malformados.

---

## Testes de Integração Necessários
*   **Foco**: Middleware `requireAuth` e rotas protegidas da API.
*   **Cenários**:
    1. Requisição para rota privada sem token -> Retorna 401 Unauthorized.
    2. Requisição para rota privada com token inválido -> Retorna 401 Unauthorized.
    3. Requisição com token de teste válido (mockado) -> Retorna 200 OK com dados do usuário mockado.

---

## Testes E2E Necessários
*   **Foco**: Fluxo completo na tela de Login (INT-001).
*   **Cenário**: O usuário tenta acessar a despensa sem login e é redirecionado para a tela de Login. Informa credenciais inválidas e visualiza mensagem de erro apropriada.
