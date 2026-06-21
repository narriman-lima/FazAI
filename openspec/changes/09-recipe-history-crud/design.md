## Context

Esta mudança introduz a camada completa de persistência de receitas no FazAI. Atualmente, o usuário pode gerar receitas personalizadas via Gemini (mudança 07) e visualizá-las na tela de detalhes (mudança 08), mas nenhuma receita é salva após o ciclo de vida da sessão. Com a mudança 09, a receita exibida no `RecipeDetails.tsx` pode ser favoritada, passando a ser persistida no banco PostgreSQL do Supabase sob um modelo `SavedRecipe` isolado por `userId`.

O frontend ganhará a tela de Histórico (INT-005), onde o usuário poderá buscar, visualizar e excluir receitas salvas, reutilizando os componentes visuais de detalhes já criados na mudança 08.

## Goals / Non-Goals

**Goals:**
* Adicionar o modelo Prisma `SavedRecipe` com isolamento lógico por `userId` (Clerk) e criar a migration correspondente.
* Implementar três endpoints REST no backend:
  * `POST /api/v1/recipes/favorite` – favoritar receita.
  * `GET /api/v1/recipes/history` – listar/filtrar histórico.
  * `DELETE /api/v1/recipes/favorite/:id` – desfavoritar receita.
* Ativar o botão "Favoritar" na tela INT-004 (`RecipeDetails.tsx`), realizando chamada ao endpoint POST e exibindo feedback visual.
* Criar a tela de Histórico `/history` (INT-005) com input de busca reativa e grid de cartões.
* Garantir isolamento completo de dados por `userId` em todas as queries Prisma para prevenir IDOR.
* Manter tipagem TypeScript estrita em todo o código novo, proibindo o uso de `any`.

**Non-Goals:**
* Editar ou atualizar o conteúdo de uma receita já salva (only read/delete).
* Implementar paginação server-side (frontend realizará filtragem client-side sobre a lista retornada).
* Adicionar tags, categorias ou listas de favoritos customizadas.
* Modificar a lógica de geração Gemini (mudança 07) ou a UI de detalhes base (mudança 08).

## Decisions

### 1. Modelo de Dados: `SavedRecipe` com arrays nativos do PostgreSQL

* **Opção A:** Serializar `ingredients` e `steps` como JSON string em uma coluna `TEXT`.
* **Opção B (Escolhida):** Usar `String[]` no schema Prisma, mapeado para arrays nativos do PostgreSQL (`TEXT[]`).
* **Justificativa:** Arrays nativos do PostgreSQL são mais eficientes para leitura e permitem uso futuro de operadores de array no SQL (e.g., `ANY`, `@>`). O Prisma suporta arrays para PostgreSQL nativamente, eliminando a necessidade de serialização/deserialização manual.

```prisma
model SavedRecipe {
  id             String   @id @default(uuid())
  userId         String
  title          String
  calories       Int
  carbohydrates  String
  proteins       String
  fats           String
  ingredients    String[]
  steps          String[]
  createdAt      DateTime @default(now())

  @@index([userId])
}
```

### 2. Filtragem do Histórico: Client-Side vs. Server-Side

* **Opção A (Escolhida):** Retornar todos os registros do usuário e filtrar no frontend com `String.prototype.includes` case-insensitive.
* **Opção B:** Passar `?search=` ao backend, realizando filtro via `Prisma.SavedRecipeWhereInput` com `contains` (case-insensitive via `mode: 'insensitive'`).
* **Justificativa:** O volume de receitas salvas por usuário é naturalmente limitado (dezenas, não milhares). A filtragem client-side elimina latência de rede e permite responsividade instantânea ao digitar, melhorando a UX sem custo de complexidade no backend. A Opção B pode ser migrada futuramente se o volume crescer.

### 3. Exibição de Detalhes do Histórico: Modal vs. Rota Separada

* **Opção A:** Navegar para `/recipes/history/:id`, buscando a receita do backend por ID e exibindo via `RecipeDetails.tsx`.
* **Opção B (Escolhida):** Ao clicar no card do histórico, abrir um modal `RecipeDetailModal.tsx` com os dados já carregados em memória (sem nova chamada de rede).
* **Justificativa:** Os dados da receita já estão disponíveis no estado local após o `GET /api/v1/recipes/history`. Usar um modal evita um roundtrip de rede desnecessário, mantém o contexto da tela de Histórico, e reutiliza a estrutura visual de detalhes (macronutrientes, ingredientes, passos) sem duplicar lógica de roteamento.

### 4. Prevenção de IDOR no DELETE

* **Decisão:** O endpoint `DELETE /api/v1/recipes/favorite/:id` utilizará `prisma.savedRecipe.deleteMany` (não `delete`) com filtro composto `{ id, userId }`.
* **Justificativa:** `deleteMany` retorna contagem zero sem lançar exceção quando nenhum registro corresponde — elimina IDOR silenciosamente sem vazar informação sobre existência do registro para IDs pertencentes a outros usuários. `delete` com `where: { id }` lançaria exceção se o registro não fosse encontrado, expondo um comportamento diferente para IDs alheios.

### 5. Ativação do Botão "Favoritar" em `RecipeDetails.tsx`

* **Decisão:** O botão "Favoritar" existente (mudança 08, apenas layout) será conectado ao cliente de API. Após POST bem-sucedido, o estado local `isSaved: boolean` será marcado como `true`, alterando o ícone para preenchido (✓) e desabilitando novos cliques, com uma toast notification de confirmação.
* **Justificativa:** Previne favoritar a mesma receita múltiplas vezes na mesma sessão sem necessidade de consulta ao banco.

## Risks / Trade-offs

* **[Duplicação de registros ao favoritar]** → Sem constraint de unicidade no banco, um usuário pode favoritar a mesma receita (por conteúdo) múltiplas vezes.
  * *Mitigação:* O estado `isSaved` local desabilita o botão após o primeiro clique. Para proteção de borda (múltiplas abas), aceita-se a duplicata como trade-off aceitável nesta fase, sem complexidade adicional de deduplicação.

* **[Ausência de paginação server-side]** → Se um usuário salvar centenas de receitas, o GET retornará todos os registros.
  * *Mitigação:* Aceitável no MVP. O `@@index([userId])` garante performance de leitura mesmo com volumes moderados. Paginação pode ser adicionada na mudança 10+.

* **[Arrays no PostgreSQL não suportados por todos os adaptadores Prisma]** → Arrays nativos são exclusivos do PostgreSQL; impossível migrar para SQLite sem mudanças no schema.
  * *Mitigação:* O projeto está fixado no PostgreSQL via Supabase; não há plano de troca de banco.

* **[Migration em produção]** → A criação da nova tabela `SavedRecipe` não afeta tabelas existentes.
  * *Mitigação:* Migration aditiva, sem risco de downtime ou perda de dados. Rollback: `npx prisma migrate resolve --rolled-back <migration_name>` + drop da tabela.

## Migration Plan

1. Atualizar `schema.prisma` com o modelo `SavedRecipe`.
2. Executar `npx prisma migrate dev --name add-saved-recipe` localmente para gerar e aplicar a migration.
3. Executar `npx prisma generate` para regenerar o Prisma Client.
4. Implementar os três endpoints no backend e o cliente de API no frontend.
5. Implementar a tela de Histórico e ativar o botão de favoritar.
6. Executar `npx tsc --noEmit` e `npx eslint apps/` para validação de tipos e lint.
7. Em produção: `npx prisma migrate deploy` via CI/CD (GitHub Actions).

## Open Questions

* Deve-se implementar um limite máximo de receitas salvas por usuário (e.g., 50) nesta mudança, ou deixar para uma fase futura de moderação de quota?
* A remoção do card do grid ao desfavoritar deve ser imediata (optimistic update) ou aguardar a confirmação do backend?
