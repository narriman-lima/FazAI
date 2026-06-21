## ADDED Requirements

### Requirement: Recipe history retrieval
The system SHALL provide an authenticated REST endpoint that returns all recipes saved by the current user, with optional client-driven text filtering. The endpoint SHALL enforce `userId` isolation to prevent cross-user data access (IDOR).

#### Scenario: Retrieving history with no saved recipes
- **WHEN** an authenticated user calls `GET /api/v1/recipes/history` and has no saved recipes
- **THEN** the API SHALL return HTTP 200 with an empty array `[]`

#### Scenario: Retrieving full history
- **WHEN** an authenticated user calls `GET /api/v1/recipes/history`
- **THEN** the API SHALL return HTTP 200 with a JSON array of all `SavedRecipe` objects belonging to that user, ordered by `createdAt` descending
- **THEN** each item in the array SHALL include: `id`, `title`, `calories`, `carbohydrates`, `proteins`, `fats`, `ingredients`, `steps`, `createdAt`

#### Scenario: History is isolated per user
- **WHEN** user A calls `GET /api/v1/recipes/history`
- **THEN** the response SHALL contain ONLY recipes with `userId` matching user A's Clerk `userId`
- **THEN** no recipe belonging to user B SHALL appear in the response

#### Scenario: Retrieving history without authentication
- **WHEN** a request is sent to `GET /api/v1/recipes/history` without a valid Clerk JWT
- **THEN** the backend SHALL return HTTP 401 Unauthorized
