## 1. API Integration

- [x] 1.1 Create the pantry API module `apps/frontend/src/api/pantry.ts` with typed methods for GET, POST parse-text, POST items, and DELETE items

## 2. UI Pages & Components

- [x] 2.1 Create the pantry dashboard page `apps/frontend/src/pages/PantryDashboard.tsx` with mobile-first split two-column responsive layout conforming to design tokens
- [x] 2.2 Add the TextArea free-text input (including character limit validation), "Processar Alimentos com IA" button, and animated loading spinner to `PantryDashboard.tsx`
- [x] 2.3 Implement the reactive list of ingredients as interactive chips displaying quantity, item name, and a red delete icon button to `PantryDashboard.tsx`
- [x] 2.4 Mount the new `PantryDashboard` component inside the `/pantry` route of `apps/frontend/src/App.tsx` instead of the placeholder UI

## 3. Verification & Quality

- [x] 3.1 Verify there are no TS compiler errors across the monorepo by running `npm run typecheck` at the root level
- [x] 3.2 Verify that backend tests and build pass successfully using `npm test` in the `apps/backend` directory
