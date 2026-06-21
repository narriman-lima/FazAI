## ADDED Requirements

### Requirement: Render pantry interface
The system SHALL display the Intelligent Pantry screen (Stitch INT-003) to authenticated users with a responsive split layout conforming to design tokens (Inter font, neutral Slate scale, and active feedback states).

#### Scenario: Load pantry items on mount
- **GIVEN** the user is authenticated and on the "/pantry" route
- **WHEN** the page loads
- **THEN** the system SHALL call GET /api/v1/pantry and render the returned items as interactive chips on the right column card (displaying ingredient name, quantity, and a red delete icon button).

#### Scenario: Prevent unauthenticated access
- **GIVEN** the user is not authenticated
- **WHEN** the user attempts to load the "/pantry" route
- **THEN** the system SHALL redirect the user to the "/sign-in" route.

### Requirement: Process free-text pantry input
The system SHALL support free-text input of ingredients, validate length client-side, and invoke backend parser APIs to structure and persist items.

#### Scenario: Successfully process free-text input
- **GIVEN** the user is authenticated on the "/pantry" dashboard
- **WHEN** the user enters free text (length <= 5000 characters) in the main TextArea and clicks "Processar Alimentos com IA"
- **THEN** the system SHALL show an animated loading spinner, temporarily disable the TextArea and submission buttons, post to POST /api/v1/pantry/parse-text with payload `{ text: string }`, post the structured results to POST /api/v1/pantry/items with payload `{ items: Array<{ name: string, quantity: string }> }`, and update the state to render the new ingredient chips.

#### Scenario: Rate limit error feedback
- **GIVEN** the user has hit rate limits on the Gemini AI service
- **WHEN** the user clicks "Processar Alimentos com IA" and the API returns a 429 status code
- **THEN** the system SHALL display a red alert banner containing the text: "Limite de requisições do serviço de inteligência artificial excedido. Por favor, tente novamente em alguns instantes."

#### Scenario: Parse error feedback
- **GIVEN** the user has input unintelligible text or the Gemini parser failed to extract structured ingredients
- **WHEN** the user clicks "Processar Alimentos com IA" and the API returns a 502 status code
- **THEN** the system SHALL display a red alert banner containing the text: "Não foi possível interpretar a lista de ingredientes no momento. Verifique o texto digitado ou tente novamente mais tarde."

### Requirement: Delete individual pantry item
The system SHALL allow users to delete specific ingredients from their active pantry.

#### Scenario: Click delete icon on chip
- **GIVEN** the user has at least one ingredient chip displayed in the pantry column
- **WHEN** the user clicks the red trash icon button next to an ingredient chip
- **THEN** the system SHALL invoke DELETE /api/v1/pantry/items/{id} and remove the corresponding chip from the interface state.

### Requirement: Recipe generation trigger
The system SHALL control the accessibility of the recipe generation action based on the state of the pantry.

#### Scenario: Active ingredients present
- **GIVEN** the user's pantry contains at least 1 ingredient chip
- **WHEN** viewing the pantry dashboard
- **THEN** the "Gerar Receitas Personalizadas" CTA button SHALL be enabled, clickable, and visually active.

#### Scenario: Empty pantry
- **GIVEN** the user's pantry contains no ingredient chips
- **WHEN** viewing the pantry dashboard
- **THEN** the "Gerar Receitas Personalizadas" CTA button SHALL be disabled (`disabled` attribute) and render with reduced opacity.
