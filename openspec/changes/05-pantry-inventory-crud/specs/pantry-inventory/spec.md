## ADDED Requirements

### Requirement: Retrieve pantry items
The system SHALL retrieve all pantry items associated with the authenticated user.

#### Scenario: Retrieve user's own items
- **WHEN** the user calls GET /api/v1/pantry with a valid Clerk JWT
- **THEN** the system SHALL return a 200 OK status with a JSON list of the user's pantry items, containing id, name, quantity, createdAt, and updatedAt

#### Scenario: Retrieve items without authentication
- **WHEN** a user calls GET /api/v1/pantry without a valid Clerk JWT
- **THEN** the system SHALL return a 401 Unauthorized status

### Requirement: Create pantry items
The system SHALL persist new pantry items in bulk or individually, and associate them with the authenticated user.

#### Scenario: Bulk create valid items
- **WHEN** the user calls POST /api/v1/pantry/items with a valid Clerk JWT and a list of valid items (names and optional quantities)
- **THEN** the system SHALL validate the payload with Zod, save the items in the database with the user's ID, and return a 201 Created status with the list of created items

#### Scenario: Create items with invalid payload
- **WHEN** the user calls POST /api/v1/pantry/items with an invalid payload (e.g. empty item name)
- **THEN** the system SHALL return a 400 Bad Request status with validation errors

### Requirement: Delete pantry item
The system SHALL allow a user to delete their own pantry item by ID, and block deletion of other users' items.

#### Scenario: Delete own item
- **WHEN** the user calls DELETE /api/v1/pantry/items/{id} with a valid Clerk JWT for an item they own
- **THEN** the system SHALL delete the item and return a 200 OK status

#### Scenario: Attempt to delete another user's item
- **WHEN** the user A calls DELETE /api/v1/pantry/items/{id} for an item owned by user B
- **THEN** the system SHALL return a 404 Not Found or 403 Forbidden status, and the item SHALL remain in the database
