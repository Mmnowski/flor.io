# Flor.io Architecture

Comprehensive guide to the Flor.io codebase structure, design patterns, and data flow.

## Quick Navigation

- [Directory Structure](#directory-structure)
- [Feature Architecture](#feature-architecture)
- [Data Flow](#data-flow)
- [Design Patterns](#design-patterns)
- [Type Safety](#type-safety)
- [Key Modules](#key-modules)

## Directory Structure

```
app/
├── features/                    # Feature modules with colocated logic
│   ├── plants/                 # Plant management feature
│   │   ├── components/         # Plant UI components
│   │   ├── contexts/           # PlantFiltersContext, etc.
│   │   ├── lib/                # Plant data layer (CRUD, queries)
│   │   ├── hooks/              # Plant-specific hooks
│   │   └── index.ts            # Barrel exports
│   ├── watering/               # Watering/notifications feature
│   │   ├── components/         # Watering UI components
│   │   ├── lib/                # Watering logic
│   │   ├── hooks/              # Watering hooks
│   │   └── index.ts
│   ├── rooms/                  # Room management feature
│   │   ├── components/         # Room UI components
│   │   ├── lib/                # Room data layer
│   │   └── index.ts
│   └── ai-wizard/              # AI plant creation feature
│       ├── components/         # Wizard steps and main page
│       ├── lib/                # AI service integrations
│       ├── hooks/              # Wizard state hooks
│       └── index.ts
│
├── shared/                      # Shared utilities and components
│   ├── components/             # Reusable UI components
│   │   ├── ui/                 # shadcn/ui components
│   │   ├── Modal.tsx           # Compound modal component
│   │   ├── Card.compound.tsx   # Compound card component
│   │   └── index.ts            # Barrel export
│   ├── contexts/               # App-wide contexts
│   │   ├── ThemeContext.tsx    # Dark/light mode
│   │   └── index.ts
│   ├── hooks/                  # Reusable custom hooks
│   │   ├── useToggle.ts
│   │   ├── useNotifications.ts
│   │   ├── useWateringAction.ts
│   │   ├── useImageUpload.ts
│   │   ├── usePlantForm.ts
│   │   └── index.ts
│   └── lib/                    # Shared utilities
│       ├── logger.ts           # Structured logging
│       ├── validation.ts       # Zod schemas
│       ├── constants.ts        # App constants
│       ├── error-handling.ts   # Error utilities
│       ├── supabase-helpers.ts # Type-safe DB helpers
│       ├── utils.ts            # Utility functions
│       └── index.ts
│
├── lib/                        # Legacy server-side utilities
│   ├── plants.server.ts        # Compatibility layer (re-exports)
│   ├── plants.crud.server.ts   # Plant CRUD operations
│   ├── plants.queries.server.ts # Plant queries and calculations
│   ├── plants.ai.server.ts     # AI plant creation
│   ├── watering.server.ts      # Watering operations
│   ├── rooms.server.ts         # Room operations
│   ├── storage.server.ts       # Supabase Storage
│   ├── image.server.ts         # Image processing
│   ├── usage-limits.server.ts  # Usage tracking
│   ├── plantnet.server.ts      # Plant identification (mocked)
│   ├── openai.server.ts        # Care instructions (mocked)
│   ├── auth.server.ts          # Authentication
│   ├── session.server.ts       # Session management
│   └── supabase.server.ts      # Supabase client
│
├── layout/                     # Layout components
│   └── components/
│       ├── Navigation.tsx      # Main navigation
│       ├── AuthLinks.tsx       # Auth navigation links
│       ├── NotificationBell.tsx
│       ├── ThemeToggle.tsx
│       └── UserMenu.tsx
│
├── routes/                     # Route handlers and pages
│   ├── home.tsx
│   ├── dashboard.tsx           # Dashboard layout
│   ├── dashboard._index.tsx    # Dashboard home
│   ├── dashboard.plants._index.tsx
│   ├── dashboard.plants.$plantId.tsx
│   ├── dashboard.plants.$plantId.edit.tsx
│   ├── dashboard.plants.new.tsx
│   ├── dashboard.plants.new-ai.tsx
│   ├── api/                    # API endpoints
│   │   ├── water.$plantId.tsx
│   │   ├── rooms.tsx
│   │   └── notifications.tsx
│   ├── auth/
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   └── logout.tsx
│   └── __tests__/              # Route tests
│
├── types/                      # Shared type definitions
│   ├── plant.types.ts
│   ├── api.types.ts
│   └── database.types.ts       # Generated from Supabase
│
├── root.tsx                    # Root layout
├── routes.ts                   # Route configuration
└── app.css                     # Global styles

.ai/                           # Documentation
├── IMPLEMENTATION_PLAN.md      # Full refactoring plan
├── TESTING.md                  # Testing guide
└── DEPLOYMENT.md               # Deployment guide
```

## Feature Architecture

Each feature module follows a consistent pattern:

### Feature Module Structure

```
features/[feature-name]/
├── components/
│   ├── index.ts               # Barrel export
│   ├── [component].tsx
│   ├── [component].test.tsx
│   └── __tests__/
├── contexts/
│   ├── index.ts
│   └── [Context].tsx
├── lib/
│   ├── [feature].server.ts
│   ├── [feature].calculations.ts
│   └── __tests__/
├── hooks/
│   └── use[Feature].ts
└── index.ts                   # Public API
```

### Colocated Tests

Tests live next to their source code:

```
components/
├── PlantCard.tsx
├── PlantCard.test.tsx         # Unit test
└── __tests__/
    └── PlantCard.integration.test.tsx  # Integration test
```

## Data Flow

### Loading Data (Queries)

```
Route Loader
    ↓
Server Function (e.g., getUserPlants)
    ↓
Supabase Helper (fetchMany, fetchOne)
    ↓
Type-safe Query with Database.types.ts
    ↓
Enrich with calculated fields (daysUntilWatering, etc.)
    ↓
Return to component via loaderData
```

### Example: Getting a Plant

```typescript
// routes/dashboard.plants.$plantId.tsx
export const loader = async ({ params, request }) => {
  const userId = await requireAuth(request);
  const plant = await getPlantById(params.plantId, userId);
  // Includes: room_name, watering dates, history, etc.
  return { plant };
};

// Component uses loaderData directly
export default function PlantPage({ loaderData }: Route.ComponentProps) {
  return <PlantDetails plant={loaderData.plant} />;
}
```

### Modifying Data (Actions)

```
Form Submit
    ↓
Route Action (parse formData, validate)
    ↓
Server Function (CRUD operation, e.g., updatePlant)
    ↓
Supabase Helper (updateOne, insertOne, deleteOne)
    ↓
Return success/error response
    ↓
Component receives via fetcher.data
```

### Example: Watering a Plant

```typescript
// Route: /api/water/$plantId
export const action = async ({ request, params }) => {
  const userId = await requireAuth(request);
  await recordWatering(params.plantId, userId);
  return { success: true };
};

// Component
const { waterPlant, isWatering } = useWateringAction(() => {
  refetchNotifications();
});

<button onClick={() => waterPlant(plantId)}>
  {isWatering ? 'Watering...' : 'Water Plant'}
</button>
```

## Design Patterns

### 1. Custom Hooks for Shared Logic

Stateful logic extracted into reusable hooks:

```typescript
// app/shared/hooks/useNotifications.ts
const notifications = useNotifications(isAuthenticated);
// Returns: { notifications, isOpen, setIsOpen, refetch, isLoading }
```

Custom hooks encapsulate stateful behavior that can be shared across multiple components. This pattern separates state management from component rendering logic.

### 2. Compound Components

Component composition pattern using subcomponents:

```typescript
// Usage
<Modal isOpen={open} onClose={handleClose}>
  <Modal.Header>
    <Modal.Title>Delete Item</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    <p>Are you sure?</p>
  </Modal.Body>
  <Modal.Footer>
    <Button onClick={handleConfirm}>Delete</Button>
  </Modal.Footer>
</Modal>
```

Compound components are components that are made up of multiple subcomponents. This pattern enables flexible composition of UI elements while maintaining a clear, declarative API.

### 3. Context for Cross-Cutting Concerns

React Context is used for app-wide and feature-level state management:

```typescript
// Theme context
const { theme, setTheme, isDark } = useTheme();

// Plant filters context
const { selectedRoomId, setSelectedRoomId } = usePlantFilters();
```

Context provides state access to components without prop drilling. Providers can be scoped to feature boundaries or the entire application.

### 4. Server Functions for Data Access

Server functions provide type-safe data operations on the server side:

```typescript
// Plant CRUD
export async function createPlant(userId, data): Promise<Plant>;
export async function updatePlant(plantId, userId, data): Promise<Plant>;
export async function deletePlant(plantId, userId): Promise<void>;

// Plant Queries
export async function getUserPlants(userId): Promise<PlantWithWatering[]>;
export async function getPlantById(plantId, userId): Promise<PlantWithDetails>;
```

These functions execute on the server and return type-safe results. They encapsulate database access and business logic, providing a single interface for data operations across the application.

### 5. Helper Functions for Complex Logic

Complex operations are decomposed into focused helper functions:

```typescript
// plants.queries.server.ts
async function enrichSinglePlant(plant): PlantWithWatering;
async function calculateDaysUntilWatering(date): number;
async function fetchRoomName(roomId): string | null;
async function verifyPlantOwnership(plantId, userId): boolean;
```

Helper functions are designed with a single responsibility. They can be composed to implement more complex operations and are independently testable.

## Type Safety

### Database Types (Generated)

```typescript
// types/database.types.ts (generated from Supabase)
import type { Database } from '~/types/database.types';

type Plant = Database['public']['Tables']['plants']['Row'];
type PlantInsert = Database['public']['Tables']['plants']['Insert'];
```

### API Types (Shared)

```typescript
// types/api.types.ts
export interface PlantNeedingWater {
  plant_id: string;
  plant_name: string;
  days_overdue: number;
  // ...
}
```

### Type-Safe Helpers

```typescript
// lib/supabase-helpers.ts
export async function fetchOne<T extends TableName>(
  client: SupabaseClient<Database>,
  table: T,
  conditions: Record<string, unknown>
): Promise<Row<T> | null>;
```

### Validation Schemas (Zod)

```typescript
// lib/validation.ts
export const plantFormSchema = z.object({
  name: z.string().min(1).max(100),
  watering_frequency_days: z.number().min(1).max(365),
});
```

## Key Modules

### Authentication

- **`lib/auth.server.ts`** - Auth utilities
- **`lib/require-auth.server.ts`** - Middleware to require auth
- **`lib/session.server.ts`** - Session management
- **`routes/auth/*`** - Auth pages

### Data Access Layer

**Server Functions (Type-Safe):**

- **`lib/plants.crud.server.ts`** - Create/Read/Update/Delete
- **`lib/plants.queries.server.ts`** - Complex queries with enrichment
- **`lib/watering.server.ts`** - Watering operations
- **`lib/rooms.server.ts`** - Room operations

**Helpers:**

- **`lib/supabase-helpers.ts`** - Generic CRUD helpers
- **`lib/storage.server.ts`** - File storage
- **`lib/image.server.ts`** - Image processing

### UI Components

**Reusable:**

- **`shared/components/Modal.tsx`** - Compound modal
- **`shared/components/CardCompound.tsx`** - Compound card
- **`shared/components/ImageUpload.tsx`** - File uploader
- **`shared/components/LoadingSpinner.tsx`** - Loading states

**Feature-Specific:**

- **`features/plants/components/PlantCard.tsx`** - Plant display
- **`features/plants/components/PlantForm.tsx`** - Plant form
- **`features/watering/components/NotificationsModal.tsx`** - Notifications

### Custom Hooks

All in `shared/hooks/`:

- **`useToggle`** - Boolean state
- **`useNotifications`** - Watering notifications
- **`useWateringAction`** - Water plant submission
- **`useImageUpload`** - Image upload with preview
- **`usePlantForm`** - Form state with validation

### Contexts

All in `shared/contexts/`:

- **`ThemeContext`** - Dark/light mode
- **`PlantFiltersContext`** - Plant filtering/sorting (in `features/plants/contexts/`)

## API Endpoints

### RESTful Routes

```
GET  /dashboard/plants           - List plants
GET  /dashboard/plants/$id       - View plant details
POST /dashboard/plants/new       - Create manual plant (form)
POST /dashboard/plants/new-ai    - AI plant wizard (multi-step)
GET  /dashboard/plants/$id/edit  - Edit plant page
POST /api/water/$plantId         - Record watering
GET  /api/notifications          - Get watering notifications
POST /api/rooms                  - Create room
PATCH /api/rooms                 - Update room
DELETE /api/rooms                - Delete room
```

### Data Format

All responses follow consistent patterns:

```typescript
// Success
{ success: true, data: T }

// Error
{ error: string }

// List
{ data: T[], count: number }
```

## Performance Considerations

### Code Splitting

- AI Wizard lazy loaded (only on /new-ai route)
- Feature modules only imported when needed

### Memoization

- Components memoized with `memo()` for lists
- Callbacks memoized with `useCallback()`
- Context values memoized with `useMemo()`

### Image Optimization

- Images processed with Sharp (compression, resizing, format)
- EXIF data stripped
- Max 500KB after processing

### Database

- Indexes on frequently queried columns (user_id, plant_id)
- Row-level security (RLS) for data privacy
- Efficient queries with proper field selection

## Testing

- **Unit Tests**: Individual functions/components in `__tests__/`
- **Integration Tests**: Feature workflows
- **E2E**: Critical user paths

See `.ai/TESTING.md` for comprehensive testing guide.

## Deployment

See `.ai/DEPLOYMENT.md` for:

- Environment setup
- Database migrations
- Production checklist
- Performance monitoring

## Development Workflow

1. **Create feature branch** from `main`
2. **Implement in feature module** with colocated logic
3. **Test thoroughly** with unit and integration tests
4. **Format and lint** with `yarn quality`
5. **Submit PR** with comprehensive description
6. **Merge to main** after review

## Common Tasks

### Adding a New Feature

1. Create feature directory in `features/`
2. Add components, lib, hooks, contexts as needed
3. Create barrel export in `index.ts`
4. Add route handlers in `routes/`
5. Add types to `types/`

### Adding a Server Function

1. Create in appropriate `lib/[feature].server.ts`
2. Use type-safe helpers from `lib/supabase-helpers.ts`
3. Add JSDoc comments
4. Call from route action or loader

### Adding a Reusable Component

1. Create in `shared/components/`
2. Add to barrel export
3. Document with JSDoc and usage examples
4. Add tests

### Adding a Custom Hook

1. Create in `shared/hooks/` or `features/[feature]/hooks/`
2. Add to barrel export
3. Document with JSDoc and usage examples
4. Make sure dependencies are in dependency array

## Standards

- **Naming**: camelCase for functions/variables, PascalCase for components
- **Types**: Prefer types over interfaces for consistency
- **Errors**: Use structured logging with context
- **Testing**: Aim for >80% coverage
- **Documentation**: JSDoc for all public APIs
- **Formatting**: Prettier (100 char line length)
- **Linting**: ESLint with TypeScript support

## Resources

- [React Router v7 Docs](https://reactrouter.com/)
- [Supabase Docs](https://supabase.io/docs)
- [TailwindCSS v4](https://tailwindcss.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [Zod Validation](https://zod.dev)
