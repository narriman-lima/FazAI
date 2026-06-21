## 1. Database Model Setup & Migrations (apps/backend/)

- [x] 1.1 Add `UserProfile` model to `apps/backend/prisma/schema.prisma` with `id`, `userId` (unique & indexed), `calorieGoal` (Int?), `healthRestrictions` (String[]), and `preferences` (String[])
- [x] 1.2 Run Prisma migration command to apply schema changes: `npx prisma migrate dev --name add_user_profile`
- [x] 1.3 Regenerate Prisma Client to update types: `npx prisma generate`

## 2. Backend API Endpoint Implementation (apps/backend/)

- [x] 2.1 Create Zod schema validation for profile updates (under `apps/backend/src/schemas/profile.ts`) enforcing `calorieGoal` boundaries (500-10000) and allowed arrays
- [x] 2.2 Implement profile controller handlers for `GET /api/v1/profile` and `PUT /api/v1/profile` (under `apps/backend/src/controllers/profile.controller.ts`), querying by Clerk `userId` from auth context
- [x] 2.3 Register endpoints on backend router (under `apps/backend/src/routes/profile.ts` or main app router) protecting them with authentication middleware
- [x] 2.4 Add unit/integration tests to verify endpoint behaviors (successful retrieval, upsert update, invalid calorie goal validation rejection, default empty values on new profile, and tenant isolation check)
- [x] 2.5 Run type checking under backend directory: `npx tsc --noEmit`
- [x] 2.6 Run backend tests to verify all tests pass

## 3. Frontend Settings Screen & Form Implementation (apps/frontend/)

- [x] 3.1 Create Zod schema for profile form validation in `apps/frontend/src/schemas/profile.ts` matching backend validation rules
- [x] 3.2 Implement API fetch calls for `GET` and `PUT` profile (under `apps/frontend/src/api/profile.ts`) passing the Clerk JWT token in request headers
- [x] 3.3 Build `ProfileSettings` page component (`apps/frontend/src/pages/ProfileSettings.tsx`) structured in semantic cards using Tailwind, styling checkboxes and input elements to conform with design tokens
- [x] 3.4 Hook the settings form to the state and handle save button loading states, success alerts, and error feedback box for server errors or rate-limiting responses
- [x] 3.5 Configure routing in `apps/frontend/src/App.tsx` (or routers) to mount `/profile` route behind Clerk protection, and auto-navigate new users there on first sign-in
- [x] 3.6 Run type checking under frontend directory: `npx tsc --noEmit`

## 4. Monorepo Validation & E2E Verification

- [x] 4.1 Run full type checks from the root directory: `npm run typecheck` or `npx tsc --noEmit`
- [x] 4.2 Start development server: `npm run dev`
- [x] 4.3 Manually navigate to Profile page, change calorie goal, select constraints (e.g. Sem Lactose, Vegano), click Save, verify visual feedback and database persistence
- [x] 4.4 Simulate server error (e.g. mock 429 rate limit or database outage) and verify that the red error alert displays correctly on screen
