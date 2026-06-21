## Context

The FazAI application requires the ability to personalize user nutritional guidance. To achieve this, the system needs to persist and manage each user's dietary profile, including daily calorie goals, health restrictions (such as lactose, gluten, sugar, egg, and nuts allergies), and dietary preferences (such as vegan, vegetarian, and low carb). This information will directly influence downstream features, specifically recipe generation.

Currently, authentication is handled by Clerk, but user profiles and preferences are not yet stored. We need to introduce the database model, implement secure CRUD API endpoints (secured with Clerk JWT middleware), and build the user settings screen (INT-002).

## Goals / Non-Goals

**Goals:**
*   Update the database schema in Prisma to include a `UserProfile` model mapped to a Supabase PostgreSQL table.
*   Enforce logical tenant isolation by linking the `UserProfile` to the Clerk `userId` with a unique index.
*   Implement `GET /api/v1/profile` and `PUT /api/v1/profile` endpoints in `apps/backend/` using Express or Fastify.
*   Enforce strict backend validation of incoming payloads using Zod (including calorie ranges and allowed restriction/preference strings).
*   Create the frontend settings UI (INT-002) in `apps/frontend/` using React, TypeScript, and Tailwind CSS, conforming to the FazAI design system tokens.
*   Ensure complete type safety by avoiding the `any` type across the frontend and backend.

**Non-Goals:**
*   Implementing automatic calculation of recommended calorie goals based on BMI or activity levels.
*   Handling user profile picture uploads, metadata syncs, or editing user accounts fields (handled by Clerk UI).
*   Updating downstream recipe generation or pantry interpretation logic to use these profiles (this will be done in subsequent changes).

## Decisions

### 1. Database Schema Design (Prisma)
We will define the `UserProfile` table with arrays of strings for `healthRestrictions` and `preferences` instead of individual boolean flags. This provides the flexibility to easily add new restrictions or preferences in the future without performing database migrations.

```prisma
model UserProfile {
  id                 String   @id @default(uuid())
  userId             String   @unique
  calorieGoal        Int?
  healthRestrictions String[]
  preferences        String[]
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt

  @@index([userId])
}
```

*   `id`: UUID string primary key.
*   `userId`: Unique indexed string representing the Clerk user identifier.
*   `calorieGoal`: Nullable integer (null represents no target set).
*   `healthRestrictions`: List of strings mapping to health and allergy concerns.
*   `preferences`: List of strings mapping to lifestyle and diet choices.

### 2. API Endpoint Specification & Zod Validation
The endpoints will be versioned at `/api/v1/profile`. Both endpoints are protected by the auth middleware and require a valid Bearer token.

*   `GET /api/v1/profile`
    *   **Authorization**: Bearer JWT token.
    *   **Behavior**: Extracts `userId` from request context. Queries the database. If no profile exists yet, the server returns a 200 OK status code with default empty values to simplify frontend initialization.
    *   **Response Payload**:
        ```json
        {
          "id": "d3b07384-d113-4ec2-a5e6-ec083b4c1072",
          "userId": "user_2XYZ...",
          "calorieGoal": null,
          "healthRestrictions": [],
          "preferences": [],
          "createdAt": "2026-06-21T03:21:00.000Z",
          "updatedAt": "2026-06-21T03:21:00.000Z"
        }
        ```

*   `PUT /api/v1/profile`
    *   **Authorization**: Bearer JWT token.
    *   **Behavior**: Upserts the user profile using the extracted `userId`. It ignores any `userId` or `id` passed in the body.
    *   **Request Schema (Zod)**:
        ```typescript
        import { z } from 'zod';

        export const updateProfileSchema = z.object({
          calorieGoal: z.number().int().min(500).max(10000).nullable().optional(),
          healthRestrictions: z.array(z.enum([
            'Sem Lactose',
            'Sem Glúten',
            'Baixo Açúcar',
            'Sem Ovo',
            'Alergia a Oleaginosas'
          ])),
          preferences: z.array(z.enum([
            'Vegetariano',
            'Vegano',
            'Low Carb'
          ]))
        });
        ```
    *   **Response Payload**: The updated `UserProfile` object.

### 3. Strict Logical Tenant Isolation
To prevent IDOR vulnerabilities, the backend controller:
1.  Must only retrieve the profile matching `where: { userId }` where `userId` is supplied by Clerk's token verification middleware (`req.auth.userId`).
2.  Must never allow the frontend to specify the target `userId` in the payload of either GET or PUT requests.

### 4. UI Components and Tailwind Styling (INT-002)
The frontend Settings & Profile page will be styled as a clean card-based layout centered on the screen.

*   **Structure**:
    *   Header: "Configurações do Perfil"
    *   Card 1: "Meta Alimentar" - Daily calorie goal input.
    *   Card 2: "Restrições de Saúde" - Group of styled checkboxes.
    *   Card 3: "Preferências Alimentares" - Group of styled checkboxes.
    *   Button: "Salvar Perfil e Configurações" - Shows loading spinner or disabled state during submit.
*   **Colors & Interactivity**:
    *   Page background: `bg-slate-50`
    *   Cards background: `bg-white border border-slate-100 rounded-xl p-6 shadow-sm`
    *   Text: `text-slate-800` (titles/body), `text-slate-500` (labels/placeholders)
    *   Checkboxes/Inputs: `border-slate-200 rounded-lg focus:ring-2 focus:ring-[#FF6B6B] focus:border-[#FF6B6B] accent-[#FF6B6B]`
    *   Save Button: `bg-[#FF6B6B] hover:bg-[#E55A5A] active:scale-95 text-white font-medium px-4 py-2 rounded-lg transition-all duration-200 disabled:opacity-50`
    *   Feedback message: Alerts for success (`text-emerald-500 bg-emerald-50 border border-emerald-100 p-4 rounded-lg`) and error (`text-red-500 bg-red-50 border border-red-100 p-4 rounded-lg`).

## Risks / Trade-offs

*   **[Risk] Out-of-sync Client and Server Zod Schemas**
    *   *Mitigation*: We will define the allowed values for restrictions and preferences as shared constants or duplicate them precisely between frontend and backend. Both must enforce the exact same list of values ('Sem Lactose', 'Sem Glúten', etc.).
*   **[Risk] Incomplete Profiles breaking downstream Gemini recipes generation**
    *   *Mitigation*: When profile values are absent, the downstream Gemini service will fall back to "no dietary restrictions" and default recipe parameters.
