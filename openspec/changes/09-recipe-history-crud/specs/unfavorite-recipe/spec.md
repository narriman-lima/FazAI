## ADDED Requirements

### Requirement: Unfavorite (delete) saved recipe
The system SHALL allow an authenticated user to delete a previously saved recipe from their history. The deletion SHALL be strictly scoped to the authenticated user's own recipes to prevent IDOR vulnerabilities.

#### Scenario: Successfully deleting a saved recipe
- **WHEN** an authenticated user sends `DELETE /api/v1/recipes/favorite/:id` with a valid recipe `id` that belongs to them
- **THEN** the backend SHALL execute a scoped deletion using `prisma.savedRecipe.deleteMany({ where: { id, userId } })`
- **THEN** the API SHALL return HTTP 204 No Content
- **THEN** the recipe card SHALL be removed from the history grid on the frontend

#### Scenario: Attempting to delete another user's recipe (IDOR prevention)
- **WHEN** an authenticated user sends `DELETE /api/v1/recipes/favorite/:id` with a `id` belonging to a different user
- **THEN** the backend SHALL apply the scoped `deleteMany` filter, matching zero rows silently
- **THEN** the API SHALL return HTTP 204 No Content without leaking information about the existence of the record

#### Scenario: Deleting a non-existent recipe
- **WHEN** an authenticated user sends `DELETE /api/v1/recipes/favorite/:id` with an `id` that does not exist
- **THEN** the backend SHALL return HTTP 204 No Content (idempotent behavior)

#### Scenario: Deleting without authentication
- **WHEN** a request is sent to `DELETE /api/v1/recipes/favorite/:id` without a valid Clerk JWT
- **THEN** the backend SHALL return HTTP 401 Unauthorized
