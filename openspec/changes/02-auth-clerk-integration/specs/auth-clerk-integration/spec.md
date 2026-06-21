## ADDED Requirements

### Requirement: Backend Route Security Middleware
The backend application MUST implement a JWT validation middleware using `@clerk/backend` to secure all non-public API endpoints and prevent unauthorized access.

#### Scenario: Requesting private resource without Authorization header
- **GIVEN** a private endpoint `/api/v1/profile`
- **WHEN** an unauthenticated client sends a GET request without an Authorization header
- **THEN** the system MUST respond with HTTP status 401 Unauthorized and a JSON error payload

#### Scenario: Requesting private resource with invalid token
- **GIVEN** a private endpoint `/api/v1/profile`
- **WHEN** a client sends a GET request with an invalid or expired JWT token in the Authorization header
- **THEN** the system MUST respond with HTTP status 401 Unauthorized and a JSON error payload

#### Scenario: Requesting private resource with valid token
- **GIVEN** a private endpoint `/api/v1/profile`
- **WHEN** a client sends a GET request with a valid JWT token in the Authorization header
- **THEN** the system MUST parse the token, verify its signature, extract the `userId` into request context, and allow the request to proceed

---

### Requirement: Authentication Verification Endpoint
The backend application MUST expose a GET `/api/v1/auth-status` endpoint to allow verification of authentication status.

#### Scenario: Verifying auth status with valid session
- **GIVEN** a GET endpoint `/api/v1/auth-status` protected by the security middleware
- **WHEN** a client makes a GET request with a valid Authorization header
- **THEN** the system MUST respond with HTTP status 200 OK and a JSON object containing `authenticated: true` and the decoded `userId`

---

### Requirement: Frontend Sign-In and Sign-Up Interface Customization
The frontend application MUST render customized Clerk `<SignIn />` and `<SignUp />` components that align with the FazAI design system colors (Coral `#FF6B6B` and Slate-800 text), typography (Inter font), and spacing guidelines.

#### Scenario: UI component styling verification
- **GIVEN** the sign-in page at `/sign-in`
- **WHEN** the page is loaded by the user
- **THEN** the primary login action button MUST display the brand color `#FF6B6B` with a hover change, the typography MUST use the Inter font, and inputs MUST have `rounded-lg` borders

---

### Requirement: Frontend Client Route Protection
The frontend application MUST prevent unauthenticated users from accessing private routes (e.g. `/pantry`, `/profile`, `/recipes`) and redirect them to the access screen.

#### Scenario: Accessing private route without login
- **GIVEN** a user that is not signed in
- **WHEN** the user attempts to directly navigate to `/pantry`
- **THEN** the application MUST intercept the routing and redirect the user to `/sign-in`
