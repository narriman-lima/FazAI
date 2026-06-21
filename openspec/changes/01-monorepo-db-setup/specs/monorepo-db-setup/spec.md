## ADDED Requirements

### Requirement: Monorepo workspace structure
The workspace MUST be structured as a unifed NPM monorepo containing `apps/frontend/` (React, TypeScript, Tailwind) and `apps/backend/` (Node.js/Express/Fastify, TypeScript, Prisma).

#### Scenario: Workspace build check
- **WHEN** the developer runs the global build script in the root directory
- **THEN** it executes building procedures for both the frontend and backend applications successfully

### Requirement: Prisma database connection
The backend application MUST utilize Prisma ORM to connect to and interact with the Supabase PostgreSQL database.

#### Scenario: Database connectivity verification
- **WHEN** the backend system starts up and initializes the Prisma client
- **THEN** it executes a simple query test successfully to verify the connection is active

### Requirement: Environment variables configuration
The application database connection parameters MUST be configured via `DATABASE_URL` and `DIRECT_URL` environment variables, and a template file `.env.example` must be provided.

#### Scenario: Environment configuration validation
- **WHEN** the application loads the database settings from the environment variables
- **THEN** it uses `DATABASE_URL` for transaction pooling and `DIRECT_URL` for direct migrations

### Requirement: CI/CD Quality and Type Gates
The GitHub Actions workflow MUST run compilation checks, linting, and TypeScript type checking (`npx tsc --noEmit`) on all commits and pull requests.

#### Scenario: Pre-merge validation checks
- **WHEN** a commit is pushed or a pull request is opened
- **THEN** the CI/CD pipeline runs package installation, type checking, and compilation checks to prevent errors
