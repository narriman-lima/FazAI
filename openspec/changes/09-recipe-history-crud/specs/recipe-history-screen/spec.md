## ADDED Requirements

### Requirement: Recipe history screen (INT-005)
The system SHALL provide a dedicated frontend route `/history` that displays the authenticated user's saved recipes in a searchable, interactive grid. The screen SHALL allow the user to search recipes by name, open a detail modal for any recipe, and delete recipes from the list.

#### Scenario: Viewing the history screen with saved recipes
- **WHEN** an authenticated user navigates to `/history`
- **THEN** the frontend SHALL call `GET /api/v1/recipes/history` and render a grid of recipe cards
- **THEN** each card SHALL display: recipe title, calories, macronutrient summary, and a trash icon button for deletion

#### Scenario: Real-time search filtering
- **WHEN** a user types a search term into the search input at the top of the history screen
- **THEN** the displayed cards SHALL filter in real-time to show only recipes whose title contains the search term (case-insensitive)
- **THEN** if no recipes match the search term, an empty-state message SHALL be displayed (e.g., "Nenhuma receita encontrada para '…'")

#### Scenario: Clearing the search input
- **WHEN** a user clears the text from the search input
- **THEN** the full list of saved recipes SHALL be displayed again

#### Scenario: Opening recipe details from history
- **WHEN** a user clicks on a recipe card in the history grid
- **THEN** a `RecipeDetailModal` SHALL open, displaying the full recipe details (title, macronutrients, ingredients, preparation steps) using the same visual layout as INT-004
- **THEN** no additional network request SHALL be made (data is loaded from the existing state)

#### Scenario: Deleting a recipe from history
- **WHEN** a user clicks the trash icon on a recipe card
- **THEN** the frontend SHALL call `DELETE /api/v1/recipes/favorite/:id`
- **THEN** upon HTTP 204 response, the card SHALL be removed from the grid without a full page reload

#### Scenario: History screen loading state
- **WHEN** the history screen mounts and `GET /api/v1/recipes/history` is in flight
- **THEN** the screen SHALL display skeleton card placeholders with `animate-pulse` to indicate loading

#### Scenario: History screen error state
- **WHEN** `GET /api/v1/recipes/history` fails with a network or server error
- **THEN** the screen SHALL display an error alert with a retry option styled using `bg-red-50 text-red-600 border border-red-100`

#### Scenario: Empty history state
- **WHEN** the user has no saved recipes and the API returns an empty array
- **THEN** the screen SHALL display a friendly empty-state illustration and message (e.g., "Você ainda não favoritou nenhuma receita")
