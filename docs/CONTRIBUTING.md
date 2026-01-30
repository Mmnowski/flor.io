# Contributing to Flor.io

This guide explains how to work with the Flor.io codebase, understand the project structure, and contribute effectively.

## Quick Start

1. **Read these first:**
   - [ARCHITECTURE.md](./ARCHITECTURE.md) - Technical structure and design patterns
   - [guides/SETUP.md](./guides/SETUP.md) - Development environment setup

2. **Follow the standards:**
   - [guides/STYLE_GUIDE.md](./guides/STYLE_GUIDE.md) - Code formatting and conventions
   - [guides/TESTING.md](./guides/TESTING.md) - Testing patterns and requirements

3. **Work with the codebase:**
   - Use `yarn dev` to start development server
   - Run `yarn typecheck` after making changes
   - Run `yarn test` to verify tests pass
   - Run `yarn quality` before committing

## Project Overview

Flor.io is a plant care management application built with:

- **Frontend**: React Router v7 with TypeScript
- **Backend**: Server-side rendering (SSR) with React Router
- **Database**: Supabase (PostgreSQL)
- **Styling**: TailwindCSS v4
- **Testing**: Vitest + React Testing Library

## Key Concepts

### Feature-Based Organization

Code is organized by features, not layers:

```
app/
├── features/
│   ├── plants/        # Plant management
│   ├── watering/      # Watering & notifications
│   ├── rooms/         # Room management
│   └── ai-wizard/     # AI plant creation
├── shared/            # Reusable components & hooks
└── routes/            # Route handlers
```

Each feature is self-contained with components, hooks, and business logic.

### Type Safety

- TypeScript strict mode is enforced
- All database types are generated from Supabase schema
- Use Zod for runtime validation
- Never use `any` - use `unknown` or specific types

### Server Functions

Server-side logic lives in `lib/` with `.server.ts` suffix:

```typescript
export async function getUserPlants(userId: string): Promise<Plant[]>;
export async function createPlant(userId: string, data: PlantInput): Promise<Plant>;
```

These run on the server and are called from route loaders/actions or client components.

## Development Workflow

### Creating a New Component

1. Create file in appropriate feature: `app/features/[feature]/components/ComponentName.tsx`
2. Add TypeScript props interface with JSDoc
3. Export as default function
4. Add to barrel export in `index.ts`
5. Write tests in adjacent `ComponentName.test.tsx`

See [guides/STYLE_GUIDE.md](./guides/STYLE_GUIDE.md) for component standards.

### Adding a Server Function

1. Create in `app/lib/[feature].server.ts` with `.server.ts` suffix
2. Add JSDoc with description, parameters, return type, and throws
3. Use type-safe helpers from `lib/supabase-helpers.ts`
4. Call from route loaders/actions
5. Write tests in `app/lib/__tests__/[feature].server.test.ts`

### Writing Tests

- Unit tests for utilities and pure functions
- Component tests for UI logic with React Testing Library
- Integration tests for API routes and workflows
- Target >80% code coverage on critical paths

Run tests with:

```bash
yarn test              # Run once
yarn test:watch       # Watch mode
yarn test:ui          # Visual dashboard
yarn test:coverage    # Coverage report
```

See [guides/TESTING.md](./guides/TESTING.md) for detailed testing guide.

## Common Tasks

### Starting Development

```bash
yarn install          # Install dependencies
yarn dev             # Start dev server (http://localhost:5173)
```

### Type Checking & Linting

```bash
yarn typecheck       # Check TypeScript
yarn format          # Format with Prettier
yarn lint            # Run ESLint
yarn quality         # Run all checks
```

### Building for Production

```bash
yarn build           # Create optimized build
yarn start           # Serve production build locally
```

## Code Standards

### Naming Conventions

- **Components**: PascalCase (PlantCard.tsx)
- **Functions/variables**: camelCase
- **Constants**: UPPER_SNAKE_CASE
- **Types**: PascalCase
- **Files**: Use component name or descriptive camelCase

### Imports Organization

```typescript
// 1. React and third-party
// 2. Absolute imports from ~
import { Button } from '~/shared/components';
import { useNotifications } from '~/shared/hooks';

import { useState } from 'react';
import { useFetcher } from 'react-router';

// 3. Relative imports
import { PlantCard } from './PlantCard';
// 4. Type imports
import type { PlantProps } from './types';
```

### Error Handling

Use structured error logging:

```typescript
import { logger } from '~/shared/lib/logger';

try {
  await createPlant(userId, data);
  logger.info('Plant created', { userId, plantName: data.name });
} catch (error) {
  logger.error('Failed to create plant', error, { userId });
  throw error;
}
```

## Git Workflow

### Commit Messages

Follow the format in [CLAUDE.md](../CLAUDE.md):

```
[TYPE]([CONTEXT]): [description]
```

Examples:

- `feat(plants): add watering history view`
- `fix(auth): handle expired sessions`
- `refactor(watering): consolidate calculation logic`

### Branch Naming

- Feature: `feat/[description]` or `feature/[description]`
- Fix: `fix/[description]`
- Documentation: `docs/[description]`
- Refactor: `refactor/[description]`

### Pull Request Process

1. Create branch from `main`
2. Make changes following code standards
3. Write tests for new functionality
4. Run `yarn quality` to verify all checks pass
5. Push branch and open pull request
6. Wait for review and address feedback
7. Merge when approved

## Getting Help

- **Architecture questions**: See [ARCHITECTURE.md](./ARCHITECTURE.md)
- **Style/formatting**: See [guides/STYLE_GUIDE.md](./guides/STYLE_GUIDE.md)
- **Testing help**: See [guides/TESTING.md](./guides/TESTING.md)
- **Feature overview**: See [features/](./features/) directory
- **Database schema**: See [reference/DATABASE_SCHEMA.md](./reference/DATABASE_SCHEMA.md)
- **API endpoints**: See [reference/API.md](./reference/API.md)

## Project Resources

- [Architecture Overview](./ARCHITECTURE.md)
- [Setup Guide](./guides/SETUP.md)
- [Style Guide](./guides/STYLE_GUIDE.md)
- [Testing Guide](./guides/TESTING.md)
- [Deployment Guide](./guides/DEPLOYMENT.md)
- [Migration Guide](./reference/MIGRATION_GUIDE.md)
- [Feature Documentation](./features/)

## Questions?

If you have questions or suggestions, open an issue in the repository.
