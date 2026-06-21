## Context

The FazAI project is a new web application designed to reduce food waste and provide personalized nutritional guidance. To support rapid development by an agile team, the system is designed as a decoupled client-server application hosted on Vercel. 
Currently, the repository is a clean slate with empty `apps/frontend` and `apps/backend` directories. This design document establishes the baseline monorepo workspace structure, configures the Prisma ORM schema pointing to Supabase PostgreSQL, sets up TypeScript compilation/linting gates, and defines environment configurations to prepare the codebase for subsequent features.

## Goals / Non-Goals

**Goals:**
*   Establish an NPM monorepo structure with two workspaces: `apps/frontend` (React + TypeScript + Tailwind) and `apps/backend` (Express/Fastify + TypeScript + Prisma).
*   Configure Prisma ORM in `apps/backend` targeting a Supabase PostgreSQL instance.
*   Define the initial database models (`UserProfile`, `PantryItem`, `Recipe`) ensuring logical tenant isolation through the Clerk `userId` column.
*   Enforce absolute type safety across the monorepo by forbidding the use of the `any` type.
*   Create a local configuration template (`.env.example`) specifying necessary credentials for PostgreSQL, Clerk, and Google Gemini API.
*   Establish a CI/CD GitHub Actions pipeline to run dependency installation, type checking (`npx tsc --noEmit`), and builds on every commit or pull request.

**Non-Goals:**
*   Implementing functional React UI screens or server endpoints (except minimal boilerplate needed for builds).
*   Implementing active Clerk authentication logic or Gemini prompt execution.
*   Provisioning cloud infrastructure or staging/production environments on Supabase or Vercel.

## Decisions

### 1. Monorepo Structure & NPM Workspaces
We will utilize NPM Workspaces to manage dependencies across the monorepo.
*   **Root `package.json`**: Controls global scripts (`dev`, `build`, `lint`, `typecheck`) and coordinates sub-app tasks.
*   **`apps/frontend`**: A Client-Side Rendered (CSR) React app bootstrapped with Vite to ensure fast local development.
*   **`apps/backend`**: A Node.js API application structure designed to run seamlessly as serverless functions on Vercel.

### 2. Database Schema and Multi-Tenancy (Prisma ORM)
To achieve logical tenant isolation in a single-tenant database architecture, every transational table will have a Clerk-compatible `userId` column. We will not use auto-incrementing integer IDs for user-scoped models to prevent IDOR vulnerabilities.
The initial `schema.prisma` will define:
*   **`UserProfile`**:
    *   `id`: `String @id` (corresponds directly to the Clerk `UserId`).
    *   `email`: `String` (unique).
    *   `caloriesGoal`: `Int?`
    *   `restrictions`: `String[]` (store dietary constraints).
    *   `createdAt` and `updatedAt` timestamps.
*   **`PantryItem`**:
    *   `id`: `String @id @default(uuid())`
    *   `userId`: `String` (Clerk User ID, indexed for performance and security isolation).
    *   `name`: `String`
    *   `quantity`: `Float`
    *   `unit`: `String`
    *   `expiresAt`: `DateTime?`
    *   `createdAt` and `updatedAt` timestamps.
*   **`Recipe`**:
    *   `id`: `String @id @default(uuid())`
    *   `userId`: `String` (Clerk User ID, indexed).
    *   `title`: `String`
    *   `description`: `String`
    *   `ingredients`: `Json` (structured list of ingredients and quantities).
    *   `instructions`: `Json` (step-by-step preparation steps).
    *   `macros`: `Json` (estimated calories, protein, carbs, fats).
    *   `createdAt`: `DateTime @default(now())`

### 3. Strict Type Safety & Linter Rules
*   **TypeScript Configuration**: Both frontend and backend will have `tsconfig.json` configurations extending a shared base, enforcing `strict: true`, `noImplicitAny: true`, and `noFallthroughCasesInSwitch: true`.
*   **Rule Enforcement**: The `any` type is strictly forbidden. We will add an ESLint rule `@typescript-eslint/no-explicit-any: "error"` to block check-ins violating this constraint.
*   **Quality Check command**: A root script `npm run typecheck` will execute `npx tsc --noEmit` on all workspace packages.

### 4. Environment Variables Configuration
To support Supabase PostgreSQL transaction pooling and direct schema migrations, we will adopt Supabase's two-connection-string pattern:
*   `DATABASE_URL`: Connection string pointing to the transaction pooler port (session mode) for application queries.
*   `DIRECT_URL`: Connection string pointing directly to the PostgreSQL instance for Prisma migrations.
These, along with placeholders for Clerk (`CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`) and Google Gemini (`GEMINI_API_KEY`), will be defined in a root `.env.example` file.

### 5. Gemini API Client Design
For future phases, the Gemini API integration in `apps/backend` will configure the Google Gen AI client with `responseMimeType: "application/json"`. This forces the model to return structured, parseable JSON payloads for recipes and ingredient parses, preventing parsing failures from markdown formatting.

### 6. Tailwind CSS & UI Design Token System
In `apps/frontend`, Tailwind CSS will be configured with custom theme extensions representing the FazAI design system:
*   Primary Font: `Inter, sans-serif`
*   Primary Action Color (Coral): `#ff6b6b`
*   Secondary Action Color (Yellow): `#ffd166`
*   Background: `#f8fafc` (slate-50 equivalent)
*   Text: `#1e293b` (slate-800 equivalent)
*   Alerts: Success (`emerald-500`), Error (`red-500`)

## Risks / Trade-offs

*   **[Risk] Supabase Connection Pool Exhaustion under Serverless Scale**
    *   *Mitigation*: The backend application MUST connect via `DATABASE_URL` configured for transaction pooling (port 5432/connection limit settings), while migrations run via `DIRECT_URL` (port 5432 or direct instance access).
*   **[Risk] Human Error Bypassing Tenant Validation (IDOR)**
    *   *Mitigation*: The Express/Fastify application will enforce a centralized middleware that parses the Clerk session token, extracts the `userId`, and assigns it to request context. Database operations must dynamically append `.findMany({ where: { userId } })` or check the model `userId` before mutations.
