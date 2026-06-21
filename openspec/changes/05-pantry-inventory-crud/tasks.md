## 1. Database Schema Setup

- [x] 1.1 Add the `PantryItem` model to `apps/backend/prisma/schema.prisma` with `userId` index and correct column mapping
- [x] 1.2 Run database migration command `npx prisma migrate dev --name add_pantry_items` to update the local database schema
- [x] 1.3 Generate the Prisma Client using `npx prisma generate` to ensure type definitions are updated

## 2. Backend Implementation (apps/backend/)

- [x] 2.1 Create Zod validation schema for creating pantry items in bulk or individually
- [x] 2.2 Implement authentication checking inside pantry routes, extracting `userId` from the Clerk token
- [x] 2.3 Implement the `GET /api/v1/pantry` route to retrieve user-specific ingredients
- [x] 2.4 Implement the `POST /api/v1/pantry/items` route to validate and bulk-insert user ingredients
- [x] 2.5 Implement the `DELETE /api/v1/pantry/items/:id` route ensuring logical isolation where only the owner can delete the item

## 3. Testing and Validation

- [x] 3.1 Implement unit tests to validate Zod schemas for valid and invalid payloads
- [x] 3.2 Implement integration tests to verify database CRUD operations and ensure proper tenant isolation (IDOR protection)
- [x] 3.3 Execute backend test suite using `npm test` to verify everything works as expected
- [x] 3.4 Run TypeScript validation in the backend and frontend using `npx tsc --noEmit`
