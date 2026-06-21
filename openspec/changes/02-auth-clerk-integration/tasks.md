## 1. Backend Setup & Dependencies

- [x] 1.1 Install dependencies `@clerk/backend` and `dotenv` in `apps/backend/`
- [x] 1.2 Define Clerk environment variables `CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` in `apps/backend/.env` (using `.env.example` as a template)

## 2. Backend Implementation (apps/backend/)

- [x] 2.1 Implement the `requireAuth` middleware to validate JWT session tokens and populate `req.auth` context without using `any`
- [x] 2.2 Register a protected `/api/v1/auth-status` route that returns the authenticated `userId`
- [x] 2.3 Add unit tests to verify the authentication header parsing and validation behaviors (covering valid, invalid, and missing tokens)
- [x] 2.4 Verify database configuration alignment and check types by running `npx tsc --noEmit` in `apps/backend/`
- [x] 2.5 Run the backend test command to ensure all tests pass

## 3. Frontend Setup & UI Implementation (apps/frontend/)

- [x] 3.1 Install dependency `@clerk/clerk-react` in `apps/frontend/`
- [x] 3.2 Add Clerk environment variable `VITE_CLERK_PUBLISHABLE_KEY` in `apps/frontend/.env`
- [x] 3.3 Set up `ClerkProvider` in the root of the React application (`apps/frontend/src/main.tsx`)
- [x] 3.4 Create routes for `/sign-in` and `/sign-up` using Clerk's UI components styled via the `appearance` property to match the FazAI design system (Inter font, Coral color, and Slate layout)
- [x] 3.5 Implement client-side route guards that redirect unauthenticated users to `/sign-in` when accessing protected routes
- [x] 3.6 Run type checking with `npx tsc --noEmit` in `apps/frontend/` to verify zero type errors

## 4. Monorepo Validation & E2E Integration

- [x] 4.1 Run compilation and type checks across the entire monorepo from the root directory using `npm run build` or `npx tsc --noEmit`
- [x] 4.2 Start the local development server using `npm run dev` and manually verify redirection, user login, and token propagation to the backend `/api/v1/auth-status` endpoint
