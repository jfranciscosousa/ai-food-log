# AI Food Log

A full-stack food tracking application with AI-powered meal parsing and suggestion generation.

## Package Manager

pnpm

## Build & Type Checking

```bash
pnpm build              # Production build
pnpm ts-check           # TypeScript validation
pnpm test               # Run all tests (Vitest + Playwright E2E)
```

## Architecture

- **Framework**: React Router (full-stack with SSR)
- **API Layer**: tRPC for end-to-end type-safe APIs
- **Database**: PostgreSQL with Prisma ORM
- **AI Integration**: Vercel AI SDK with OpenAI gpt-5-mini
- **Styling**: TailwindCSS 4 with Radix UI primitives. shadcn library

## AI Capabilities

The application uses AI for two core features:

1. **Food Processing** (`processFoodWithAI`): Parses meal descriptions (text or images) into structured nutritional data with Zod-validated schemas
2. **Meal Suggestions** (`generateMealSuggestion`): Generates realistic meal recommendations based on remaining daily macros

Both use direct LLM completion calls via Vercel AI Gateway. No multi-step agent patterns or tool calling currently implemented.

## Key Patterns

- **Service Layer**: Business logic encapsulated in `FoodService`, `UsersService`
- **Result Pattern**: `{ data, errors }` for error handling
- **Validation**: Zod schemas for all inputs and AI responses
- **Authentication**: Cookie-based sessions with Argon2 hashing
- **State Management**: React Query for server state, React Context for client state

## Environment Setup

Required environment variables in `.env`:
- `DATABASE_URL`: PostgreSQL connection string
- `SECRET_KEY_BASE`: Cookie encryption secret
- `AI_GATEWAY_API_KEY`: Vercel AI Gateway authentication

See `.env.example` for complete list.

## Testing

- Unit tests use Vitest
- E2E tests use Playwright with separate test database
- Run `pnpm db:push` to sync schema during development

## Guidelines
- When implementing code as an AGENT, please only check types automatically. Do not run a build or tests unless told to.
- Avoid reinventing the wheel, use existing components and utilities
