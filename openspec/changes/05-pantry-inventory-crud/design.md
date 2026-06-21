# Design: 05-pantry-inventory-crud

## Context

The FazAI application requires a persistent mechanism to store each user's structured ingredient list (the pantry). Currently, ingredients are inputted via free text and processed in-memory or dynamically. In order to allow users to build and maintain their pantry over time, we need a persistent storage system using Supabase (PostgreSQL) and Prisma ORM, alongside secure, tenant-isolated API endpoints built as Vercel serverless functions in the Node.js backend.

## Goals / Non-Goals

**Goals:**
* Define the Prisma schema model `PantryItem` with appropriate types and indexes for user-scoped data.
* Design CRUD endpoints (`GET /api/v1/pantry`, `POST /api/v1/pantry/items`, and `DELETE /api/v1/pantry/items/:id`) in the backend.
* Ensure strict tenant logical isolation based on the Clerk `UserId` extracted from JWT tokens, preventing IDOR (Insecure Direct Object References).
* Guarantee full type safety across both frontend and backend (no `any` types).
* Provide validation schemas using Zod for API payloads and frontend inputs.

**Non-Goals:**
* Implement the UI interface for the dashboard/pantry dashboard (this will be done in the next change, `06-pantry-dashboard-ui`).
* Implement the Gemini text processing controller itself (this is managed under `04-pantry-gemini-parser`).
* Manage photo/image recognition of ingredients (strictly out of scope per project guidelines).

## Decisions

### 1. Database Model (Prisma Schema)

We will introduce a new model `PantryItem` in `schema.prisma`. To enable efficient querying and enforce strict tenant isolation, we index the `userId` field.

```prisma
model PantryItem {
  id        String   @id @default(uuid()) @db.Uuid
  userId    String   @map("user_id")
  name      String
  quantity  String?
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@index([userId])
  @@map("pantry_items")
}
```

* **Rationale**: Using a UUID for the primary key (`id`) prevents auto-increment guessing attacks. The `userId` is stored as a string to match the format of Clerk user identifiers (e.g., `user_2...`). Database-level mapping to snake_case (`user_id`, `pantry_items`) follows Postgres best practices, while keeping camelCase in TypeScript.

### 2. Backend API Endpoint Details & Zod Validation

We will use Express/Fastify serverless routes on Vercel. Payload validation will be done with Zod.

* **GET /api/v1/pantry**
  * **Description**: Returns all pantry items for the authenticated user.
  * **Query Isolation**: Injects `req.auth.userId` into the Prisma find query.

* **POST /api/v1/pantry/items**
  * **Description**: Adds one or more ingredients. Supports bulk additions to easily persist lists parsed from free-text.
  * **Validation Schema**:
    ```typescript
    import { z } from 'zod';

    export const createPantryItemsSchema = z.object({
      items: z.array(
        z.object({
          name: z.string().trim().min(1, "Name is required"),
          quantity: z.string().trim().optional(),
        })
      ).min(1, "At least one item is required"),
    });
    ```
  * **Prisma Operation**: Uses `createMany` if supported or transactional inserts to bulk-insert items under the active `userId`.

* **DELETE /api/v1/pantry/items/:id**
  * **Description**: Deletes a specific item.
  * **Parameters**: `id` (validated as UUID).
  * **Prisma Operation**: Enforces isolation by filtering on both `id` and `userId` using `deleteMany`:
    ```typescript
    const result = await prisma.pantryItem.deleteMany({
      where: {
        id,
        userId: req.auth.userId,
      },
    });
    ```
    If `result.count === 0`, return a `404 Not Found` or `403 Forbidden` response instead of exposing if the ID exists but belongs to someone else.

### 3. Strict Logical Tenant Isolation

To prevent IDOR, no CRUD operations will accept `userId` as an input parameter from the request body or query string. The backend controller must always resolve `userId` from the verified JWT payload (`req.auth.userId`) injected by the Clerk middleware.

### 4. Code & Type Safety

* No use of the `any` type. Everything will be strongly typed using TypeScript interfaces/types matching the database models and API responses.
* API response envelopes will follow a consistent structure:
  * Success: `{ success: true, data: ... }`
  * Error: `{ success: false, error: { message: string, details?: unknown } }`

## Risks / Trade-offs

* **[Risk] IDOR/Data Leakage** → **Mitigation**: Every database query on `PantryItem` must explicitly filter on `userId`. Automated tests will specifically attempt cross-user deletions and reads to verify rejection.
* **[Risk] Gemini AI Integration Latency / Free Tier limits in other flows** → **Mitigation**: This change focuses on DB CRUD, which is extremely fast. However, we ensure that bulk saving is optimized via transaction blocks or `createMany` to avoid database roundtrip overhead.
* **[Risk] Duplicate Items** → **Mitigation**: If a user adds an ingredient that already exists, we currently allow duplicates (e.g. separate entries for "Egg" or "3 eggs"). A future improvement could merge quantities, but for now we keep it simple as per "Simplicity First" rules.
