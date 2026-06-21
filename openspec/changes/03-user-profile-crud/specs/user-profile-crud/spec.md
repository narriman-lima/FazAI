## ADDED Requirements

### Requirement: Retrieve User Profile Endpoint
The backend application MUST expose a GET `/api/v1/profile` endpoint to retrieve the current user's profile settings (daily calorie goal, health restrictions, and food preferences).

#### Scenario: Retrieving existing user profile
- **GIVEN** an authenticated user with a saved profile in the database
- **WHEN** the client sends a GET request to `/api/v1/profile` with a valid JWT token
- **THEN** the system MUST respond with HTTP status 200 OK and a JSON object containing the user's calorie goal, restrictions, preferences, and timestamps

#### Scenario: Retrieving non-existent user profile
- **GIVEN** an authenticated user who has not configured a profile yet
- **WHEN** the client sends a GET request to `/api/v1/profile` with a valid JWT token
- **THEN** the system MUST respond with HTTP status 200 OK and a JSON object containing default empty structures (`calorieGoal: null`, `healthRestrictions: []`, `preferences: []`)

---

### Requirement: Save User Profile Endpoint with Zod Validation
The backend application MUST expose a PUT `/api/v1/profile` endpoint to create or update the user's profile, validating the request payload using a strict Zod schema.

#### Scenario: Creating or updating a profile with valid payload
- **GIVEN** an authenticated user and a request payload containing `calorieGoal: 2200`, `healthRestrictions: ["Sem Lactose"]`, and `preferences: ["Vegano"]`
- **WHEN** the client sends a PUT request to `/api/v1/profile` with a valid JWT token
- **THEN** the system MUST validate the payload, save or update the record in the database, and respond with HTTP status 200 OK and the saved profile JSON object

#### Scenario: Submitting payload with invalid calorie goal
- **GIVEN** an authenticated user and a request payload containing an invalid calorie goal (e.g., `-100` or `15000`)
- **WHEN** the client sends a PUT request to `/api/v1/profile` with a valid JWT token
- **THEN** the system MUST reject the request, respond with HTTP status 400 Bad Request, and return a JSON payload detailing the Zod validation error

---

### Requirement: User Profile Settings Interface (INT-002)
The frontend application MUST render the User Profile and Health Settings screen (INT-002) allowing users to view and update their dietary parameters, verifying inputs using Zod.

#### Scenario: Submitting the settings form successfully
- **GIVEN** the user is on the profile settings screen and changes their calorie goal to `2000`, checks "Sem Lactose", and checks "Vegano"
- **WHEN** the user clicks the "Salvar Perfil e Configurações" button
- **THEN** the frontend MUST validate the form using Zod, disable the button to prevent duplicate submissions, send a PUT request to the backend, and display a success alert message upon completion

---

### Requirement: User Profile Data Isolation
The backend application MUST enforce strict multi-tenancy logical isolation on all profile operations to prevent Insecure Direct Object References (IDOR).

#### Scenario: Preventing cross-tenant data access
- **GIVEN** two authenticated users, User A and User B
- **WHEN** User A sends a PUT or GET request to `/api/v1/profile`
- **THEN** the system MUST resolve the user identity solely from the JWT token and perform database queries using User A's `userId`, ensuring User B's profile is never accessed or mutated

---

### Requirement: Downstream API Integration & Gemini Rate Limiting Error Handling
The frontend and backend applications MUST handle API failures and Gemini rate limits gracefully by providing clear, user-facing error feedback.

#### Scenario: Displaying error message when API fails or rate limit is reached
- **GIVEN** the user attempts to save their profile or load settings
- **WHEN** the backend API responds with an error (e.g., HTTP 429 Too Many Requests or HTTP 500 Internal Server Error)
- **THEN** the frontend application MUST display a red alert box containing a user-friendly error message, such as "Ocorreu um erro ou limite atingido ao processar sua solicitação. Por favor, tente novamente em alguns instantes."
