# Plants Feature

The Plants feature handles the core plant management functionality of Flor.io.

## Overview

Users can:

- Create and manage a collection of plants
- Upload plant photos
- Track plant details (name, watering frequency, location, AI-generated care instructions)
- View plant details and watering status
- Edit plant information
- Delete plants from their collection
- Create plants with AI assistance via the AI Wizard

## Architecture

### Directory Structure

```
app/features/plants/
├── components/
│   ├── PlantCard.tsx           # Display plant in list
│   ├── PlantDetails.tsx        # Plant detail view
│   ├── PlantForm.tsx           # Create/edit form
│   ├── PlantList.tsx           # List of plants
│   └── index.ts                # Barrel export
├── contexts/
│   ├── PlantFiltersContext.tsx # Filtering/sorting state
│   └── index.ts
├── hooks/
│   └── usePlantQuery.ts        # Data fetching hook
├── lib/
│   ├── plants.crud.server.ts   # Create/Read/Update/Delete
│   ├── plants.queries.server.ts # Complex queries
│   └── plants.ai.server.ts     # AI plant creation
└── index.ts                    # Public API
```

### Server Functions

Located in `app/lib/plants.*.server.ts`:

#### CRUD Operations (`plants.crud.server.ts`)

```typescript
// Create a new plant
export async function createPlant(userId: string, data: PlantInput): Promise<Plant>;

// Get a single plant
export async function getPlantById(plantId: string, userId: string): Promise<PlantWithDetails>;

// Update a plant
export async function updatePlant(
  plantId: string,
  userId: string,
  data: PlantInput
): Promise<Plant>;

// Delete a plant
export async function deletePlant(plantId: string, userId: string): Promise<void>;
```

#### Queries (`plants.queries.server.ts`)

```typescript
// Get all plants for a user
export async function getUserPlants(userId: string): Promise<PlantWithWatering[]>;

// Get plants needing water (used in notifications)
export async function getPlantsNeedingWater(userId: string): Promise<PlantNeedingWater[]>;

// Calculate days until watering
export async function calculateDaysUntilWatering(
  lastWatered: Date,
  frequency: number
): Promise<number>;
```

### Components

#### PlantCard

Displays a plant in the list view with:

- Plant image
- Plant name
- Current watering status (overdue, due soon, watered)
- Room location
- Quick action buttons

Props:

```typescript
interface PlantCardProps {
  plant: PlantWithWatering;
  onWater?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}
```

#### PlantForm

Reusable form for creating/editing plants:

- Plant name field
- Species field
- Watering frequency selector
- Room selector
- Image upload with preview
- Form validation with Zod

Uses the `usePlantForm` hook for state management.

#### PlantDetails

Full plant detail view showing:

- Large plant image
- Complete plant information
- Watering history
- Care instructions
- Edit/delete actions

#### PlantList

Lists all user plants with:

- Grid layout on desktop, list on mobile
- Filtering by room (via PlantFiltersContext)
- Sorting options (name, watering status, date added)
- Empty state when no plants

### Contexts

#### PlantFiltersContext

Global state for plant filtering and sorting:

```typescript
interface PlantFiltersContextType {
  selectedRoomId: string | null;
  setSelectedRoomId: (roomId: string | null) => void;
  sortBy: 'name' | 'watering-status' | 'date-added';
  setSortBy: (sort: 'name' | 'watering-status' | 'date-added') => void;
}

const { selectedRoomId, setSelectedRoomId } = usePlantFilters();
```

### Hooks

#### usePlantQuery

Fetches and manages plant data:

```typescript
const { plants, isLoading, error, refetch } = usePlantQuery();
```

## Routes

### Plant Pages

All routes are nested under `/dashboard/plants/`:

```
GET  /dashboard/plants              # Plant list
GET  /dashboard/plants/:id          # Plant details
GET  /dashboard/plants/:id/edit     # Edit form
POST /dashboard/plants/new          # Create (form submission)
POST /dashboard/plants/:id          # Update (form submission)
DELETE /dashboard/plants/:id        # Delete
```

### Data Flow

#### Creating a Plant

1. User navigates to `/dashboard/plants/new`
2. Form component renders with PlantForm
3. User fills form and uploads image
4. Form submits to route action
5. Route action validates input with Zod schema
6. Calls `createPlant()` server function
7. Server uploads image with compression
8. Creates plant record in database
9. Redirects to plant detail page

#### Editing a Plant

Similar flow to creating, but:

1. Route loader fetches current plant data
2. Form pre-populates with existing values
3. Calls `updatePlant()` instead of `createPlant()`

#### Deleting a Plant

1. User clicks delete button (shows confirmation)
2. Route action calls `deletePlant()`
3. Server deletes plant record
4. Deletes associated images from storage
5. Redirects to plant list

## Data Model

### Plant Table

```typescript
interface Plant {
  id: string; // UUID
  user_id: string; // Foreign key to auth.users
  name: string; // Plant display name
  photo_url?: string; // URL to plant photo
  watering_frequency_days: number; // Days between watering (1-365)
  room_id?: string; // Foreign key to rooms
  light_requirements?: string; // Light care instructions (AI-generated)
  fertilizing_tips?: string; // Fertilizer care instructions (AI-generated)
  pruning_tips?: string; // Pruning care instructions (AI-generated)
  troubleshooting?: string; // Common issues & solutions (AI-generated)
  created_with_ai: boolean; // True if created via AI Wizard
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
}

// Enriched with watering status
interface PlantWithWatering extends Plant {
  room_name?: string; // Joined from rooms table
  last_watered?: string; // Most recent watering date
  days_until_watering: number; // Calculated: when to water next
  watering_status: 'overdue' | 'due-soon' | 'watered';
}
```

## Image Handling

Plant images are processed on the server:

1. **Upload**: User selects image file
2. **Validation**: Check file size, format, EXIF data
3. **Processing**:
   - Resize to max 1920px width
   - Convert to JPEG (or WebP)
   - Compress to max 500KB
   - Strip EXIF metadata for privacy
4. **Storage**: Upload to Supabase Storage
5. **Database**: Store URL in plant record

See `app/lib/image.server.ts` for implementation.

## Watering Status Calculation

The `calculateDaysUntilWatering()` function determines when a plant needs water:

```
Days Until Watering = last_watered + watering_frequency_days - today

Status:
- < 0 days: "overdue" (red)
- 0-2 days: "due-soon" (yellow)
- > 2 days: "watered" (green)
```

## Type Safety

Plant types are defined in `app/types/database.types.ts` (generated from Supabase):

```typescript
export type Plant = Database['public']['Tables']['plants']['Row'];
export type PlantInsert = Database['public']['Tables']['plants']['Insert'];
export type PlantUpdate = Database['public']['Tables']['plants']['Update'];
```

Validation schemas for manual plant creation are defined in:

- `app/lib/plants/crud.server.ts` - Plant input validation
- `app/lib/ai/plantnet.server.ts` - PlantNet identification validation
- `app/lib/ai/openai.server.ts` - OpenAI care instructions validation

## AI Integration

The Plants feature integrates with two AI services for intelligent plant creation:

### PlantNet API

**Purpose:** Identify plant species from photos

**Location:** `app/lib/ai/plantnet.server.ts`

**Feature Flag:** `USE_REAL_PLANTNET_API`

**Implementation:**

- **Default (Mocked):** Uses a database of 19 common houseplants
- **Real API:** Connects to PlantNet API for real plant identification
- **Environment Variable:** `PLANTNET_API_KEY`

**Functions:**

- `identifyPlant(imageBuffer)` - Identify plant from image buffer
- `identifyPlantMocked(imageBuffer)` - Use mock database
- `identifyPlantInstant(imageBuffer)` - Real API with instant results

**Response:**

```typescript
{
  confidence: number;        // 0-1 confidence score
  probabilities: [{
    name: string;            // Scientific name
    probability: number;     // Match probability
  }];
}
```

### OpenAI API

**Purpose:** Generate care instructions for identified plants

**Location:** `app/lib/ai/openai.server.ts`

**Feature Flag:** `USE_REAL_OPENAI_API`

**Implementation:**

- **Default (Mocked):** Uses 11 predefined plant care profiles
- **Real API:** GPT-4o-mini model for dynamic instruction generation
- **Environment Variable:** `OPENAI_API_KEY`

**Functions:**

- `generateCareInstructions(plantName)` - Get care instructions
- `generateCareInstructionsMocked(plantName)` - Use mock profiles

**Response:**

```typescript
{
  light_requirements: string;    // Light care instructions
  watering_frequency: number;    // Days between watering
  fertilizing_tips: string;      // Fertilizer schedule & tips
  pruning_tips: string;          // Pruning guidance
  troubleshooting: string;       // Common problems & solutions
  humidity?: string;             // Optional humidity info
  temperature?: string;          // Optional temperature info
}
```

### Usage Limits

- **Free Tier:** 20 AI generations per month
- **Limit Source:** Hardcoded in `app/lib/usage-limits/usage-limits.server.ts`
- **Database:** Tracked in `usage_limits` table with `month_year` field
- **Enforcement:** Checked before allowing AI Wizard access

### AI Feedback

Users can provide feedback on AI-generated care instructions:

**Feedback Types:**

- `thumbs_up` - Helpful instructions
- `thumbs_down` - Inaccurate or unhelpful instructions

**Storage:** `ai_feedback` table with:

- Plant and user association
- Feedback type (up/down)
- Optional comment from user
- Snapshot of AI response for analysis

**Functions:**

- `recordAIFeedback(userId, plantId, feedbackType, comment, snapshot)` - Store feedback

---

## Performance Considerations

- **Code Splitting**: PlantForm is lazy-loaded on create/edit routes
- **Pagination**: List view uses pagination for large collections (future)
- **Image Optimization**: All images compressed and resized server-side
- **Caching**: Plant queries cached in React Query (future)

## Testing

Component tests located in `components/__tests__/`:

- PlantCard rendering and interactions
- PlantForm validation and submission
- PlantList filtering and sorting
- PlantDetails display

Server function tests in `lib/__tests__/`:

- CRUD operations with Supabase mocking
- Input validation
- Image processing
- Ownership verification (RLS)

See [../guides/TESTING.md](../guides/TESTING.md) for testing patterns.

## Accessibility

All plant components follow WCAG 2.1 AA standards:

- Images have alt text
- Form labels associated with inputs
- Color contrast meets 4.5:1 ratio
- Touch targets minimum 44px
- Keyboard navigation supported
- Screen reader friendly

See [../guides/STYLE_GUIDE.md](../guides/STYLE_GUIDE.md) for accessibility details.

## Integration Points

The Plants feature integrates with:

- **Watering Feature**: Watering records and notifications
- **Rooms Feature**: Plant grouping and filtering
- **AI Wizard Feature**: AI-powered plant creation
- **Shared Hooks**: Form handling, notifications, etc.

## Future Enhancements

- [ ] Plant care timeline
- [ ] Batch operations (delete multiple plants)
- [ ] Plant sharing with other users
- [ ] Custom care instructions override
- [ ] Photo gallery per plant
- [ ] Growth tracking / timeline
- [ ] Premium tier unlimited AI generations
- [ ] Real-time notifications via WebSocket
