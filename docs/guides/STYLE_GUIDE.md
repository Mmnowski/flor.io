# Flor.io Style Guide

This document defines the coding standards and conventions for the Flor.io codebase. All team members should follow these guidelines to maintain consistency and code quality.

## Table of Contents

- [Formatting](#formatting)
- [TypeScript](#typescript)
- [React/JSX](#reactjsx)
- [File Organization](#file-organization)
- [Naming Conventions](#naming-conventions)
- [Import Organization](#import-organization)
- [Comments and Documentation](#comments-and-documentation)
- [Error Handling](#error-handling)

## Formatting

All code is automatically formatted using **Prettier**. Run formatting before committing:

```bash
yarn format       # Format all files
yarn format:check # Check without modifying
```

### Prettier Settings

- **Line length:** 100 characters
- **Indentation:** 2 spaces
- **Quotes:** Single quotes (`'`)
- **Semicolons:** Always included
- **Trailing commas:** ES5 compatible
- **Arrow parens:** Always included

**Example:**

```typescript
// Good
const handleClick = (event: React.MouseEvent<HTMLButtonElement>): void => {
  console.log('Button clicked');
};

// Bad (would be fixed by prettier)
const handleClick=(event:React.MouseEvent<HTMLButtonElement>)=>{console.log("Button clicked")}
```

## TypeScript

### Type Safety

- Use **strict mode** (enforced in `tsconfig.json`)
- Avoid `any` types - use `unknown` or specific types instead
- Add explicit return types to all exported functions

**Example:**

```typescript
// Good
export function calculateTotal(items: Item[]): number {
  return items.reduce((sum, item) => sum + item.price, 0);
}

// Bad - missing return type
export function calculateTotal(items: Item[]) {
  return items.reduce((sum, item) => sum + item.price, 0);
}

// Also Bad - using 'any'
export function processData(data: any): void {
  // ...
}
```

### Unused Variables

Prefix unused parameters with underscore (`_`):

```typescript
// Good
export function handleEvent(_: React.SyntheticEvent): void {
  // Event handler that doesn't use the event
}

// Also good - clear intent
export function handleEvent(_event: React.SyntheticEvent, userId: string): void {
  console.log(`User ${userId} triggered event`);
}
```

### No Console Statements

- Use the logger utility instead of `console.log`/`console.error`
- Exception: `console.warn` and `console.error` are allowed for true warnings/errors in production

```typescript
// Good
import { logger } from '~/shared/lib/logger';

// Bad
console.log('User logged in');
console.error('Failed to fetch');

logger.info('User logged in', { userId });
logger.error('Failed to fetch', error, { endpoint: '/api/users' });
```

## React/JSX

### Component Structure

- One component per file (unless they're very small utility components)
- Use function components with hooks exclusively
- Name component files PascalCase: `PlantCard.tsx`
- Export component as default

**Example:**

```typescript
// Good: PlantCard.tsx
export default function PlantCard({ plant }: PlantCardProps) {
  return (
    <Card>
      <h3>{plant.name}</h3>
      {/* ... */}
    </Card>
  );
}

// Bad: Multiple components in one file
export function PlantCard() { /* ... */ }
export function PlantList() { /* ... */ }
```

### Props and State

- Always type props explicitly
- Use `React.ReactNode` for children
- Avoid prop drilling - use context or custom hooks instead

```typescript
// Good
interface PlantCardProps {
  plant: PlantWithWatering;
  onWater?: () => void;
  children?: React.ReactNode;
}

export default function PlantCard({ plant, onWater, children }: PlantCardProps) {
  // ...
}

// Bad - missing types
export default function PlantCard({ plant, onWater }) {
  // ...
}
```

### Hooks Usage

- Follow React Hooks Rules (enforced by ESLint)
- Extract logic into custom hooks when reusable
- List all dependencies in dependency arrays

```typescript
// Good
export function usePlantData(plantId: string) {
  const [plant, setPlant] = useState<Plant | null>(null);

  useEffect(() => {
    fetchPlant(plantId).then(setPlant);
  }, [plantId]); // plantId is a dependency

  return plant;
}

// Bad - missing dependency
useEffect(() => {
  fetchPlant(plantId).then(setPlant);
}, []); // Missing plantId!
```

### Inline Functions

Avoid defining functions inline - use `useCallback`:

```typescript
// Good
const handleClick = useCallback(() => {
  setOpen(true);
}, []);

return <Button onClick={handleClick}>Open</Button>;

// Bad - new function on every render
return <Button onClick={() => setOpen(true)}>Open</Button>;
```

## File Organization

### Directory Structure

```
app/
  components/          # Shared UI components
  features/            # Feature-based modules
    plants/
      components/
      lib/
      hooks/
      types/
      index.ts
  lib/                 # Shared utilities
  routes/              # Route components
  types/               # Shared types
  hooks/               # Shared hooks
  shared/              # Shared components & utilities
```

### File Naming

- **Components:** PascalCase (`PlantCard.tsx`, `NotificationsModal.tsx`)
- **Hooks:** camelCase with `use` prefix (`usePlantData.ts`, `useWateringActions.ts`)
- **Utilities:** camelCase (`utils.ts`, `validation.ts`)
- **Tests:** Same name as source file + `.test.ts` or `.test.tsx`
- **Server files:** `.server.ts` suffix (`plants.server.ts`)

### Maximum File Size

- Components: ~150 lines
- Server utilities: ~200 lines
- Hooks: ~100 lines

Files exceeding these limits should be split into smaller modules.

## Naming Conventions

### Variables and Functions

- Use descriptive, intention-revealing names
- Avoid abbreviations except for well-known ones (`id`, `url`, `api`)
- Boolean variables should start with `is`, `has`, `should`, `can`

```typescript
// Good
const isLoading = fetcher.state === 'loading';
const hasError = error !== null;
const canWaterPlant = daysUntilWatering < 0;

// Bad
const loading = fetcher.state === 'loading';
const err = error !== null;
const water = daysUntilWatering < 0;
```

### Constants

- ALL_CAPS for global constants
- camelCase for local constants
- Group related constants together

```typescript
// Good
export const MAX_PLANT_NAME_LENGTH = 100;
export const FREE_AI_GENERATIONS_PER_MONTH = 5;

function calculateWateringDays(frequency: number) {
  const daysPerWeek = 7;
  return Math.floor(frequency / daysPerWeek);
}

// Bad
export const maxPlantNameLength = 100;
const DAYS_PER_WEEK = 7;
```

### Type Names

- Use PascalCase for types and interfaces
- Suffix with `Type`, `Props`, `State`, `Context` when needed for clarity

```typescript
// Good
interface PlantCardProps {
  plant: Plant;
}

type WateringStatus = 'overdue' | 'due-soon' | 'watered';

// Bad
interface plantCardProps {}
type WateringStatusType = 'overdue' | 'due-soon' | 'watered';
```

## Import Organization

Imports must be organized in the following order, separated by blank lines:

1. React and third-party libraries
2. Absolute imports from `~`
3. Relative imports (`./`, `../`)
4. Type imports

```typescript
// Good
import { useEffect, useState } from 'react';
import { useFetcher } from 'react-router';
import { Button } from '~/shared/components/ui/button';
import { usePlantData } from '~/hooks';

import { PlantCard } from './PlantCard';
import type { PlantProps } from './types';

// Bad - unorganized imports
import type { PlantProps } from './types';
import { PlantCard } from './PlantCard';
import { useFetcher } from 'react-router';
import { Button } from '~/shared/components/ui/button';
```

## Comments and Documentation

### JSDoc for Public APIs

All exported functions should have JSDoc comments:

````typescript
/**
 * Calculates the next watering date for a plant
 *
 * @param lastWatered - The date the plant was last watered
 * @param frequency - Watering frequency in days
 * @returns The next recommended watering date
 * @throws {Error} If frequency is <= 0
 *
 * @example
 * ```typescript
 * const nextDate = calculateNextWateringDate(new Date(), 3);
 * ```
 */
export function calculateNextWateringDate(lastWatered: Date, frequency: number): Date {
  // ...
}
````

### Inline Comments

Use sparingly - code should be self-documenting. Comments should explain _why_, not _what_:

```typescript
// Good - explains business logic
// Users get 5 free AI generations per month (per terms of service)
const freeGenerationsPerMonth = 5;

// Bad - just repeats the code
// Set freeGenerationsPerMonth to 5
const freeGenerationsPerMonth = 5;
```

### TODO Comments

Use sparingly, include context:

```typescript
// TODO: Replace with real API call in Phase 2
// See ticket: https://jira.example.com/FLOR-123
const mockPlants = [];
```

## Error Handling

### Error Classes

Create specific error classes for different error types:

```typescript
class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

// Usage
try {
  validatePlantName(name);
} catch (error) {
  if (error instanceof ValidationError) {
    // Handle validation error
  }
}
```

### Error Boundaries

Always add error boundaries to routes and feature modules:

```typescript
export function ErrorBoundary() {
  return (
    <div className="error-container">
      <h2>Something went wrong</h2>
      <p>Please try refreshing the page.</p>
    </div>
  );
}
```

## Running Linters

### Format Code

```bash
yarn format      # Format all files with Prettier
```

### Lint Code

```bash
yarn lint        # Check for linting issues
yarn lint:fix    # Auto-fix fixable issues
```

### Run All Quality Checks

```bash
yarn quality     # format:check && lint && typecheck && test
```

### Pre-commit Hooks

Code is automatically checked before each commit via Husky hooks. If lint checks fail, the commit is blocked.

## Enforced Rules

The following ESLint rules are strictly enforced:

- `react-hooks/rules-of-hooks` (ERROR) - Violating React Hooks rules
- `no-var` (ERROR) - Use `const` or `let` instead of `var`
- `@typescript-eslint/no-explicit-any` (WARN) - Prefer specific types over `any`
- `no-console` (WARN) - Use logger instead of console
- `complexity` (WARN) - Functions shouldn't be too complex
- `max-lines-per-function` (WARN) - Functions shouldn't be too long

## Questions or Suggestions?

If you have questions about this style guide or would like to propose changes, please open an issue or discussion in the project repository.
