## Context

The FazAI application aims to reduce household food waste by allowing users to manage their food pantry and receive personalized recipe recommendations. A key user experience requirement is the ability for users to quickly input their ingredients as free text (e.g., typing a shopping list or typing ingredients directly). The application must interpret this text and return a structured list of ingredients (names and quantities).

To achieve this, we need to create a dedicated backend endpoint `POST /api/v1/pantry/parse-text` that uses the Google Gen AI SDK (`@google/genai`) to send the user-supplied text to Gemini 1.5 Flash, which will parse and structure the ingredients into a clean JSON response.

## Goals / Non-Goals

**Goals:**
* Configure the Google Gen AI SDK (`@google/genai`) in the backend using the environment variable `GEMINI_API_KEY`.
* Create a secure endpoint `POST /api/v1/pantry/parse-text` that accepts `{ text: string }` and returns a structured JSON list of ingredients.
* Implement strict validation of the incoming HTTP request payload and the structured response from Gemini using Zod.
* Use Gemini's JSON Mode (`responseMimeType: "application/json"`) to ensure parseable responses, and implement robust sanitization to handle cases where code block formatting (e.g., ```json) is returned.
* Enforce authentication via Clerk JWT validation and logical tenant isolation.
* Implement structured logging and robust error handling for API rate limits (HTTP 429) or transient Gemini API errors.
* Achieve 100% type safety with TypeScript, strictly avoiding the `any` type in all files.

**Non-Goals:**
* Persisting the parsed ingredients to the database (this will be implemented in `05-pantry-inventory-crud`).
* Creating the user interface for inputting free-text ingredients (this will be implemented in `06-pantry-dashboard-ui`).
* Extracting ingredients from uploaded images or voice notes.

## Decisions

### 1. Gemini API Integration & Configuration
We will use the official `@google/genai` SDK to interact with the Gemini 1.5 Flash model. The SDK client will be initialized as a singleton:

```typescript
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
```

To guarantee that the Gemini model returns a parseable JSON structure matching the application needs, we will configure the model call with:
- **System Instruction**: Explicit guidelines directing the model to extract *only* ingredients and their quantities from the text, ignoring other words, and mapping them to a list of `{ name: string, quantity: string }`.
- **Response MIME Type**: Set `responseMimeType: "application/json"` to enforce structured JSON output.
- **Response Schema**: Define the expected JSON schema using the Gemini SDK schema options.

Example call configuration:
```typescript
const response = await ai.models.generateContent({
  model: 'gemini-1.5-flash',
  contents: userText,
  config: {
    systemInstruction: 'Você é um assistente especialista em culinária e organização de despensas. Extraia a lista de ingredientes e quantidades do texto fornecido pelo usuário. Ignore comentários, cabeçalhos ou termos não relacionados a ingredientes. Se o ingrediente não possuir quantidade explícita, use "a gosto" ou estime uma quantidade razoável.',
    responseMimeType: 'application/json',
    responseSchema: {
      type: 'OBJECT',
      properties: {
        ingredients: {
          type: 'ARRAY',
          items: {
            type: 'OBJECT',
            properties: {
              name: { type: 'STRING' },
              quantity: { type: 'STRING' }
            },
            required: ['name', 'quantity']
          }
        }
      },
      required: ['ingredients']
    }
  }
});
```

### 2. Request and Response Validation (Zod & Type Safety)
To enforce type safety and strict schema validation, we will define Zod schemas for both the input payload and the Gemini response validation.

**Request Payload Schema:**
```typescript
import { z } from 'zod';

export const parseTextRequestSchema = z.object({
  text: z.string().min(1, 'O texto de ingredientes não pode estar vazio.').max(5000, 'O texto é muito longo (máximo 5000 caracteres).')
});
```

**Gemini Response/Output Schema:**
```typescript
export const parsedIngredientSchema = z.object({
  name: z.string().min(1).toLowerCase(),
  quantity: z.string().min(1)
});

export const geminiParsedResponseSchema = z.object({
  ingredients: z.array(parsedIngredientSchema)
});

export type ParsedIngredient = z.infer<typeof parsedIngredientSchema>;
export type GeminiParsedResponse = z.infer<typeof geminiParsedResponseSchema>;
```

### 3. API Endpoint, Authentication & Isolation
*   **Path**: `POST /api/v1/pantry/parse-text`
*   **Authentication**: Protected by the Clerk authentication middleware. The middleware validates the JWT token, extracts the Clerk `userId` from the claims, and attaches it to the request context.
*   **Data Isolation**: Although the endpoint is stateless and does not mutate the database, checking the authenticated `userId` is mandatory to prevent unauthorized access to the LLM service.
*   **Database Design**: This change is purely stateless and does not introduce database modifications. Consequently, there are no changes to the Prisma models.

### 4. Error Handling and Resiliency
To handle potential failures gracefully, we will implement the following strategies:
- **Rate Limiting (HTTP 429)**: Check the response or error code from the Gemini SDK. If rate-limited, log a warning and return a structured JSON response with HTTP status code 429 and a friendly message ("Limite de requisições excedido. Por favor, tente novamente em instantes.").
- **Robust Parsing**: If Gemini returns code blocks containing JSON, we will strip the code block delimiters (e.g., ` ```json` and ` ``` `) before calling `JSON.parse`.
- **Validation Failure**: If the parsed JSON does not match `geminiParsedResponseSchema`, the system will attempt to fallback gracefully or throw a structured 422 Unprocessable Entity error.

### 5. UI Elements
As this is a backend-only change focusing on the AI parsing service, there are no Tailwind UI components introduced in this change. The user-facing dashboard interfaces will be defined in future changes (e.g., `06-pantry-dashboard-ui`).

## Risks / Trade-offs

*   **[Risk] Rate Limiting on Free Tier Gemini API**
    *   *Mitigation*: The free tier of Gemini 1.5 Flash has a limit of 15 RPM (requests per minute). The backend will catch the API error, log it as structured JSON, and return a clean HTTP 429 to the frontend to trigger a user-friendly throttle UI.
*   **[Risk] LLM Hallucinations or Extraneous Text**
    *   *Mitigation*: Setting the strict `responseSchema` and mapping to `responseMimeType: "application/json"` minimizes invalid structures. The Zod schema `geminiParsedResponseSchema` validates and sanitizes the final format.
