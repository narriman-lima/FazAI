## ADDED Requirements

### Requirement: POST /api/v1/pantry/parse-text Endpoint
The backend application MUST expose a POST `/api/v1/pantry/parse-text` endpoint that accepts free-text ingredient inputs from authenticated users, validates the request payload using Zod, and returns a structured list of ingredients.

#### Scenario: Successfully parsing ingredients list
- **GIVEN** an authenticated user requesting to parse a free-text ingredient list
- **WHEN** the client sends a POST request to `/api/v1/pantry/parse-text` with a valid JWT token and a payload `{ "text": "3 ovos\n1 maço de espinafre\nsal a gosto" }`
- **THEN** the backend MUST parse the text, validate the payload, call the Gemini API, and return HTTP status 200 OK with the structured JSON array of ingredients: `{ "ingredients": [{ "name": "ovo", "quantity": "3 unidades" }, { "name": "espinafre", "quantity": "1 maço" }, { "name": "sal", "quantity": "a gosto" }] }`

#### Scenario: Submitting an empty or missing text payload
- **GIVEN** an authenticated user
- **WHEN** the client sends a POST request to `/api/v1/pantry/parse-text` with a valid JWT token and a payload containing an empty text string or missing `text` key
- **THEN** the backend MUST reject the request, respond with HTTP status 400 Bad Request, and return a JSON payload detailing the Zod validation error

---

### Requirement: Google Gemini Integration and JSON Validation
The backend application MUST use the official `@google/genai` SDK to interact with the Gemini 1.5 Flash model, configure the request to use `responseMimeType: "application/json"`, clean any markdown formatting returned by the LLM, and validate the output using Zod.

#### Scenario: Gemini returns structured JSON successfully
- **GIVEN** a request with valid input text
- **WHEN** the backend invokes the Gemini API and receives a JSON string matching the specified schema
- **THEN** the backend MUST parse the JSON, validate it against the expected Zod schema, and return the structured ingredients to the client

#### Scenario: Gemini returns markdown code blocks
- **GIVEN** a request with valid input text
- **WHEN** the Gemini API returns a string wrapped in code blocks, such as ```json { "ingredients": [...] } ```
- **THEN** the backend MUST strip the markdown code block markers, parse the underlying JSON string, validate it using Zod, and return the structured response

---

### Requirement: Rate Limit and API Error Handling
The backend application MUST gracefully catch and handle Gemini API rate limits (HTTP 429) and unexpected API errors, mapping them to structured, user-friendly JSON error payloads.

#### Scenario: Gemini API rate limit is reached
- **GIVEN** a request to parse a free-text ingredients list
- **WHEN** the Gemini API returns an HTTP 429 error (ResourceExhausted / Rate Limit exceeded)
- **THEN** the backend MUST log the warning and respond to the client with HTTP status 429 Too Many Requests and a structured JSON body: `{ "error": "Limite de requisições do serviço de inteligência artificial excedido. Por favor, tente novamente em alguns instantes." }`

#### Scenario: Gemini API returns a generic error or malformed JSON
- **GIVEN** a request to parse a free-text ingredients list
- **WHEN** the Gemini API encounters a transient failure or returns a JSON string that does not match the Zod validation schema
- **THEN** the backend MUST log the error and respond to the client with HTTP status 502 Bad Gateway and a structured JSON body: `{ "error": "Não foi possível interpretar a lista de ingredientes no momento. Verifique o texto digitado ou tente novamente mais tarde." }`
