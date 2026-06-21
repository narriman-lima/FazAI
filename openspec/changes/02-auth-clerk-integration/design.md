## Context

In the FazAI web application, security and proper data isolation are fundamental. Because the application uses a shared-database, shared-process single-tenant model, all user data must be logically separated using the `UserId` provided by the authentication provider. We have selected **Clerk** as our authentication service to handle user credentials, sign-in, and sign-up flows.

This design document outlines:
1. How Clerk will be integrated into the frontend SPA (React + TypeScript).
2. How the backend API (Node.js + Express) will intercept and validate session tokens to retrieve the `UserId`.
3. The visual customization of Clerk's native components (`<SignIn />` and `<SignUp />`) to align with the FazAI design system.
4. Type safety definitions for request scopes in the backend to ensure zero `any` usage.

## Goals / Non-Goals

**Goals:**
*   Integrate Clerk's SDK in `apps/frontend` using `@clerk/clerk-react` and protect user routes.
*   Implement custom visual styling for `<SignIn />` and `<SignUp />` components using the `appearance` property to match the FazAI design system (Inter font, Coral `#FF6B6B` primary color, and Slate colors).
*   Add `@clerk/backend` in `apps/backend` to implement a robust, type-safe security middleware (`requireAuth`).
*   Establish a verify endpoint `/api/v1/auth-status` to let the frontend verify its session token.
*   Enforce absolute type safety by declaring types/interfaces for authenticated requests without resorting to `any`.
*   Verify that `UserId` is correctly injected in the request context for database query filtering.

**Non-Goals:**
*   Implementing custom signup forms from scratch (we will use Clerk's pre-built components and style them via `appearance`).
*   Integrating OAuth social providers in this phase (restricted to basic email/password signup).
*   Implementing user profile management pages (INT-002 is out of scope for this change).
*   Integrating image uploads or scanner functionality.

## Decisions

### 1. Clerk SDK on Frontend (`@clerk/clerk-react`)
We will use the official `@clerk/clerk-react` library. 
*   **Why**: It provides ready-to-use hooks (`useAuth`, `useUser`, `useSession`) and visual components that significantly reduce frontend development overhead.
*   **ClerkProvider**: Placed at the root of `apps/frontend` wrapped around the router. It consumes `VITE_CLERK_PUBLISHABLE_KEY` from the environment.
*   **Alternative Considered**: Custom authentication via cookie sessions.
    *   *Why rejected*: Handling session synchronization, token refreshing, and OAuth securely increases development complexity and scope.

### 2. Styling Clerk Components via the `appearance` Prop
We will customize the Clerk UI components to fit the FazAI design tokens.
*   **Theme Integration**:
    *   **Colors**: Primary buttons will use `#FF6B6B` (Coral), with hover state `#E55A5A`. Card background will be `#FFFFFF` (White), and page background `#F8FAFC` (Slate-50).
    *   **Typography**: The font family will be set to `'Inter', sans-serif` via Tailwind configuration.
    *   **Example configuration**:
        ```typescript
        const clerkAppearance = {
          variables: {
            colorPrimary: '#FF6B6B',
            colorText: '#1E293B',
            colorBackground: '#FFFFFF',
            fontFamily: "'Inter', sans-serif",
            borderRadius: '0.5rem',
          },
          elements: {
            card: 'border border-slate-100 shadow-sm rounded-xl',
            formButtonPrimary: 'bg-[#FF6B6B] hover:bg-[#E55A5A] transition-colors',
            footerActionLink: 'text-[#FF6B6B] hover:text-[#E55A5A]',
          }
        };
        ```

### 3. Backend Clerk Authentication Middleware (`@clerk/backend`)
We will implement an Express middleware `requireAuth` inside `apps/backend/src/middleware/auth.ts`.
*   **Why**: To validate that incoming requests have a valid Bearer JWT issued by Clerk.
*   **Token Verification**: The middleware will extract the JWT from the `Authorization: Bearer <TOKEN>` header, verify it using Clerk's `clerkClient.verifyToken()`, and retrieve the token subject (`sub`), which represents the unique `userId`.
*   **Type Safety**: We will extend the Express namespace to avoid using the `any` type when accessing `req.auth`:
    ```typescript
    import { Request, Response, NextFunction } from 'express';

    declare global {
      namespace Express {
        interface Request {
          auth?: {
            userId: string;
          };
        }
      }
    }
    ```
*   **Error Handling**: If the token is missing, invalid, or expired, the middleware must respond with an HTTP 401 Unauthorized status and a JSON body containing `error: "Unauthorized"`.

### 4. Verification Route
We will register a GET `/api/v1/auth-status` endpoint in the backend router that requires the `requireAuth` middleware and returns a 200 OK JSON response containing `{ authenticated: true, userId: req.auth.userId }`.
*   **Why**: Gives the frontend a simple, standard way to verify that the backend correctly recognizes its token during troubleshooting.

### 5. Multi-Tenancy Data Isolation
In subsequent PRs, when performing Prisma database operations, developers must append the Clerk `userId` to the filter criteria:
```typescript
const items = await prisma.pantryItem.findMany({
  where: { userId: req.auth.userId }
});
```
This guarantees logical isolation at the line/row level.

## Risks / Trade-offs

*   **[Risk] Clerk Token Verification Latency**
    *   *Mitigation*: Verify that token signatures are verified locally using PEM public keys loaded from Clerk configuration rather than performing a network request to Clerk servers on every API call. The Clerk SDK does local validation out of the box when configured with the correct environment variables.
*   **[Risk] Incomplete Typings resulting in `any` declarations in routing**
    *   *Mitigation*: Set `noImplicitAny: true` in `tsconfig.json` and configure ESLint checks during CI/CD to block `any` usage. Create dedicated types or use the global Express type extension.

## Migration Plan

1.  **Frontend Setup**:
    *   Install `@clerk/clerk-react`.
    *   Add `VITE_CLERK_PUBLISHABLE_KEY` environment variable in the frontend config.
2.  **Backend Setup**:
    *   Install `@clerk/backend` and `dotenv`.
    *   Add `CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` in `apps/backend/.env`.
3.  **Deploy / CI/CD**:
    *   Ensure environment variables are configured on Vercel.
