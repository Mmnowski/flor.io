# Migration Guide: Phase 6 Refactoring

This guide documents changes made during the Phase 6 refactoring for developers updating their code.

## Overview

Phase 6 refactored the codebase to improve code quality, maintainability, and performance:

- Reorganized components into feature-based modules
- Extracted custom hooks for shared logic
- Created compound components and contexts
- Consolidated duplicate code
- Added comprehensive documentation

## Import Path Changes

### Old Import Paths → New Import Paths

#### Components

```typescript
// Old
import { PlantCard } from '~/components/plant-card';

// New
import { PlantCard } from '~/features/plants/components';
// Or via barrel export:
import { PlantCard } from '~/features/plants';
```

#### Custom Hooks (New)

```typescript
// These are now available
import { useNotifications } from '~/shared/hooks';
import { useWateringAction } from '~/shared/hooks';
import { usePlantForm } from '~/shared/hooks';
import { useToggle } from '~/shared/hooks';
import { useImageUpload } from '~/shared/hooks';
```

#### Logger (New)

```typescript
// Replace console statements with
import { logger } from '~/shared/lib/logger';

// Usage:
logger.info('Message', { context: 'value' });
logger.error('Error occurred', error);
logger.warn('Warning message');
logger.debug('Debug info'); // Development only
```

#### Contexts (New)

```typescript
// Theme context
// Plant filters context
import { PlantFiltersProvider, usePlantFilters } from '~/features/plants/contexts';
import { ThemeProvider, useTheme } from '~/shared/contexts';
```

#### Compound Components (New)

```typescript
// Modal
import { Modal } from '~/shared/components';

<Modal isOpen={open} onClose={handleClose}>
  <Modal.Header><Modal.Title>Title</Modal.Title></Modal.Header>
  <Modal.Body>Content</Modal.Body>
  <Modal.Footer>Actions</Modal.Footer>
</Modal>

// Card
import { CardCompound } from '~/shared/components';

<CardCompound>
  <CardCompound.Header>
    <CardCompound.Title>Title</CardCompound.Title>
  </CardCompound.Header>
  <CardCompound.Body>Content</CardCompound.Body>
</CardCompound>
```

### Feature Module Exports

Each feature now exports public APIs via barrel export:

```typescript
// plants feature
export * from '~/features/plants';
// Includes: components, contexts, hooks

// watering feature
export * from '~/features/watering';
// Includes: components, lib

// rooms feature
export * from '~/features/rooms';
// Includes: components, lib
```

## Breaking Changes

### Console Logging Removed

All `console.log`, `console.error`, and `console.warn` statements have been replaced with the structured logger:

```typescript
// After
import { logger } from '~/shared/lib/logger';

// Before
console.error('Failed to fetch plants:', error);
console.log('Plant updated successfully');

logger.error('Failed to fetch plants', error);
logger.info('Plant updated successfully');
```

### Component Prop Changes

Some components have been refactored. Check their JSDoc and usage examples.

### Import Paths for Server Functions

The old import paths for server functions still work via compatibility layer, but new code should import from specific modules:

```typescript
// Still works (compatibility layer)
import { createPlant, getUserPlants } from '~/lib/plants';

// Recommended new pattern
import { createPlant } from '~/lib/plants.crud.server';
import { getUserPlants } from '~/lib/plants.queries.server';
```

## Migration Steps

### For Existing Components

1. Update import paths from `~/components/*` to `~/features/[feature]/components`
2. Replace any `console.*` calls with `logger.*` calls
3. Consider using custom hooks to simplify state management
4. Use compound components where applicable

### For New Components

1. Create in appropriate feature module: `features/[feature]/components/`
2. Add to barrel export in `index.ts`
3. Use custom hooks from `~/shared/hooks` for common patterns
4. Use structured logging with `logger`
5. Use contexts for cross-feature state

### For Server Functions

1. Create in `features/[feature]/lib/[feature].server.ts` or `~/lib/[feature].server.ts`
2. Use type-safe helpers from `~/lib/supabase-helpers.ts`
3. Add JSDoc comments with examples
4. Include throw/error documentation

## Feature-Based Organization

### Before

```
app/
├── components/           # 18+ flat components
├── lib/                  # Monolithic server functions
└── routes/
```

### After

```
app/
├── features/
│   ├── plants/          # All plant-related code
│   ├── watering/        # Watering/notifications
│   ├── rooms/           # Room management
│   └── ai-wizard/       # AI creation flow
├── shared/              # Reusable across features
└── routes/              # Route handlers
```

## New Patterns to Adopt

### 1. Custom Hooks

Instead of lifting state up, use custom hooks:

```typescript
// Before
function ParentComponent() {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  // ... complex logic
}

// After
function ParentComponent() {
  const notifications = useNotifications(isAuthenticated);
  // Simple hook does all the work
}
```

### 2. Compound Components

Instead of prop drilling, use compound components:

```typescript
// Before
<Dialog
  title="Delete"
  content="Are you sure?"
  onConfirm={handleConfirm}
  onCancel={handleCancel}
/>

// After
<Modal isOpen={open} onClose={handleClose}>
  <Modal.Header><Modal.Title>Delete</Modal.Title></Modal.Header>
  <Modal.Body>Are you sure?</Modal.Body>
  <Modal.Footer>
    <Button onClick={handleConfirm}>Delete</Button>
  </Modal.Footer>
</Modal>
```

### 3. Contexts for State

For state that crosses feature boundaries, use contexts:

```typescript
// Plant filters
<PlantFiltersProvider>
  <PlantDashboard />
</PlantFiltersProvider>

function PlantDashboard() {
  const { selectedRoomId, setSelectedRoomId } = usePlantFilters();
}
```

### 4. Structured Logging

Replace all console calls:

```typescript
// Before
console.error('Error fetching plant:', error);

// After
logger.error('Error fetching plant', error, { plantId });
```

## Configuration Updates

### ESLint

The project now uses ESLint with TypeScript support:

```bash
yarn lint          # Check for issues
yarn lint:fix      # Auto-fix issues
```

### Prettier

Code formatting is enforced:

```bash
yarn format        # Format all files
yarn format:check  # Check formatting
```

### Pre-commit Hooks

Pre-commit hooks automatically format and lint changes:

```bash
# Runs on git commit
yarn lint-staged
```

## Testing Updates

### Test File Location

Tests are now colocated with source code:

```
// Before
app/lib/__tests__/plants.server.test.ts
app/components/__tests__/PlantCard.test.tsx

// After
app/lib/plants.crud.server.ts
app/lib/__tests__/plants.crud.server.test.ts

app/features/plants/components/PlantCard.tsx
app/features/plants/components/PlantCard.test.tsx
app/features/plants/components/__tests__/PlantCard.integration.test.tsx
```

### Running Tests

```bash
yarn test           # Run tests once
yarn test:watch     # Watch mode
yarn test:ui        # Test UI dashboard
yarn test:coverage  # Coverage report
```

## Type Safety

### Generated Database Types

Database types are generated from Supabase:

```bash
yarn typecheck  # Regenerate and check types
```

### New Helper Functions

Type-safe database helpers are available:

```typescript
import { deleteOne, fetchMany, fetchOne, insertOne, updateOne } from '~/lib/supabase-helpers';

// Usage
const plant = await fetchOne(supabaseServer, 'plants', { id: plantId });
const plants = await fetchMany(supabaseServer, 'plants', { user_id: userId });
```

## Performance Improvements

### Code Splitting

Large components like AI Wizard are now lazy loaded:

```typescript
import { lazy, Suspense } from 'react';

const AIWizard = lazy(() => import('~/features/ai-wizard'));

export default function Page() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <AIWizard />
    </Suspense>
  );
}
```

### Memoization

Use memoization for expensive operations:

```typescript
import { useCallback, useMemo } from 'react';

const memoizedValue = useMemo(() => expensiveCalculation(), [dep]);
const stableCallback = useCallback(() => doSomething(), [dep]);
```

## Common Migration Patterns

### Converting Old Server Functions

```typescript
// Before
export async function getUserPlants(userId) {
  const { data } = await supabase.from('plants').select('*').eq('user_id', userId);
  return data || [];
}

// After
export async function getUserPlants(userId): Promise<PlantWithWatering[]> {
  const plants = await fetchMany(supabaseServer, 'plants', { user_id: userId });
  return Promise.all(plants.map(enrichSinglePlant));
}
```

### Converting Components to Use Hooks

```typescript
// Before
function PlantDashboard() {
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Complex fetching logic
  }, []);

  return <div>{/* render */}</div>;
}

// After
function PlantDashboard() {
  const plants = usePlantQuery(); // Custom hook

  return <div>{/* render */}</div>;
}
```

## FAQ

**Q: Can I still use old import paths?**
A: Yes, the compatibility layer re-exports for backward compatibility. However, new code should use the new paths.

**Q: Do I need to update all my components?**
A: Not immediately. The old structure still works. Update as you work on components to avoid migration overload.

**Q: How do I create a new feature?**
A: See ARCHITECTURE.md → Adding a New Feature section.

**Q: What if my code uses console logging?**
A: Replace with `logger` from `~/shared/lib/logger`. ESLint will warn about console usage.

**Q: How do I contribute new code?**
A: Follow the patterns in ARCHITECTURE.md and see STYLE_GUIDE.md for formatting rules.

## Resources

- **ARCHITECTURE.md** - Detailed technical documentation
- **STYLE_GUIDE.md** - Code style and formatting rules
- **.ai/TESTING.md** - Testing patterns and guidelines
- **.ai/DEPLOYMENT.md** - Deployment and production setup
