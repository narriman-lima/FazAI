## 1. Setup and Configuration

- [x] 1.1 Add Google Gen AI SDK `@google/genai` to dependencies in `apps/backend/package.json`
- [x] 1.2 Ensure `GEMINI_API_KEY` is added to the backend environment variables configuration and validation

## 2. Backend Implementation (apps/backend/)

- [x] 2.1 Define Zod validation schemas for the request payload (`parseTextRequestSchema`) and structured ingredients output (`geminiParsedResponseSchema`)
- [x] 2.2 Define TypeScript types matching the validation schemas, strictly avoiding `any`
- [x] 2.3 Create the `/api/v1/pantry/parse-text` route in the backend router, applying the existing Clerk JWT verification middleware
- [x] 2.4 Initialize the `GoogleGenAI` client as a singleton using the `GEMINI_API_KEY` environment variable
- [x] 2.5 Implement the route controller logic to construct system instructions and invoke the Gemini 1.5 Flash model with `responseMimeType: "application/json"` and `responseSchema`
- [x] 2.6 Implement sanitization logic to clean markdown block code boundaries (e.g. ` ```json ` and ` ``` `) from Gemini's response
- [x] 2.7 Implement Zod parsing of the cleaned JSON structure
- [x] 2.8 Add structured JSON error logging and response formatting for rate limiting (HTTP 429) and generic integration errors (HTTP 502)

## 3. Testing and Verification

- [x] 3.1 Write unit tests with mocks for the Gemini SDK, verifying successful JSON extraction and markdown cleaning
- [x] 3.2 Write unit tests verifying error mapping for rate-limited (HTTP 429) and malformed payload (HTTP 400 / HTTP 502) scenarios
- [x] 3.3 Run lint check using `npx eslint apps/` to ensure code compliance
- [x] 3.4 Verify type safety by running `npx tsc --noEmit` from the root directory
- [x] 3.5 Run backend unit and integration tests using `npm run test` or the configured test runner command
