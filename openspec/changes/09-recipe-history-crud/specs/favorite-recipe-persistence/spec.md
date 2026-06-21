## ADDED Requirements

### Requirement: Favorite recipe persistence
The system SHALL allow an authenticated user to save (favorite) a generated recipe to the PostgreSQL database via a dedicated REST API endpoint. Each saved recipe SHALL be uniquely associated with the authenticated user's Clerk `userId` to ensure tenant isolation.

#### Scenario: Successfully favoriting a recipe
- **WHEN** an authenticated user clicks the "Favoritar" button on the Recipe Details screen (INT-004) after a recipe has been generated
- **THEN** the frontend SHALL call `POST /api/v1/recipes/favorite` with the full recipe payload (title, calories, carbohydrates, proteins, fats, ingredients[], steps[])
- **THEN** the backend SHALL validate the payload using a Zod schema and persist a new `SavedRecipe` row in the database with the `userId` extracted from the Clerk JWT
- **THEN** the API SHALL return HTTP 201 with the saved recipe object including its generated `id` and `createdAt`
- **THEN** the "Favoritar" button SHALL display a filled checkmark icon, be disabled, and a success toast SHALL appear

#### Scenario: Favoriting with invalid payload
- **WHEN** a client sends `POST /api/v1/recipes/favorite` with a missing required field (e.g., no `title`)
- **THEN** the backend SHALL return HTTP 400 with a Zod validation error message in JSON format

#### Scenario: Favoriting without authentication
- **WHEN** a request is sent to `POST /api/v1/recipes/favorite` without a valid Clerk JWT
- **THEN** the backend SHALL return HTTP 401 Unauthorized
