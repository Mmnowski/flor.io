# Watering Feature

The Watering feature tracks plant watering history and provides notifications for overdue plants.

## Overview

Users can:

- Record when they water a plant
- View watering history for each plant
- See notifications for plants that need water
- Dismiss notifications
- Get watering reminders

## Architecture

### Directory Structure

```
app/features/watering/
├── components/
│   ├── NotificationsModal.tsx   # Modal showing plants needing water
│   ├── WateringButton.tsx       # Quick water action
│   └── index.ts
├── hooks/
│   └── useWateringAction.ts     # Water plant submission
└── lib/
    └── watering.server.ts       # Watering operations
```

### Server Functions

Located in `app/lib/watering.server.ts`:

```typescript
// Record a watering event
export async function recordWatering(plantId: string, userId: string): Promise<WateringHistory>;

// Get plants needing water
export async function getPlantsNeedingWater(userId: string): Promise<PlantNeedingWater[]>;

// Get watering history for a plant
export async function getWateringHistory(
  plantId: string,
  userId: string,
  limit?: number
): Promise<WateringHistory[]>;
```

### Components

#### NotificationsModal

Modal dialog showing plants that need watering:

**Props:**

```typescript
interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  plants: PlantNeedingWater[];
  onWater?: (plantId: string) => void;
}
```

**Features:**

- Displays plants sorted by days overdue
- Shows days overdue for each plant
- Quick water button for each plant
- Empty state when no plants need water
- Accessible dialog with proper focus management

#### WateringButton

Action button to record watering:

**Props:**

```typescript
interface WateringButtonProps {
  plantId: string;
  isLoading?: boolean;
  onSuccess?: () => void;
}
```

**Features:**

- Form submission for POST request
- Loading state during submission
- Success/error feedback
- Optimistic UI updates

### Hooks

#### useWateringAction

Custom hook for water submission logic:

```typescript
const { waterPlant, isWatering, error } = useWateringAction(() => {
  // Called on success
  refetchNotifications();
});

await waterPlant(plantId);
```

## Routes

### Watering Endpoints

```
GET  /api/notifications              # Get plants needing water
POST /api/water/:plantId              # Record watering (JSON)
POST /dashboard/plants/:plantId       # Record watering with _action=water (form)
```

### Data Flow

#### Recording a Watering

1. User clicks "Water" button on plant card or in notifications
2. Form submits to `/api/water/:plantId`
3. Route action:
   - Authenticates user
   - Verifies plant ownership
   - Creates watering_history record
   - Updates plant's last_watered date
   - Returns success response
4. Component updates optimistically
5. Notifications modal refreshes

## Data Model

### Watering History Table

```typescript
interface WateringHistory {
  id: string; // UUID
  plant_id: string; // Foreign key to plants
  watered_at: string; // ISO timestamp of watering
  created_at: string; // ISO timestamp of record creation
}

interface PlantNeedingWater {
  plant_id: string;
  plant_name: string;
  room_name?: string;
  image_url?: string;
  last_watered?: string;
  days_overdue: number; // Negative = needs water now
  watering_frequency_days: number;
}
```

## Watering Status Calculation

Plants are categorized into three states:

```
Overdue: days_overdue > 0
  "This plant needed water X days ago"

Due Soon: -3 <= days_overdue < 0
  "Water in X days"

Watered: days_overdue < -3
  "Last watered on DATE"
```

## Notifications

### Badge Count

Shows count of plants needing water in navbar:

- Updates every time notifications endpoint is called
- Displayed as badge on bell icon
- Cleared when modal is opened

### Notification Display

Notifications modal displays:

1. **Overdue plants** (red, sorted by most overdue first)
2. **Due soon plants** (yellow, within 3 days)
3. Empty state if no plants need water

## API Routes

### POST /api/water/:plantId

Record that a plant was watered.

**Parameters:**

- `plantId` - Plant UUID in URL path

**Authentication:** Required (user must own plant)

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "plant_id": "uuid",
    "watered_at": "2024-01-30T12:00:00Z"
  }
}
```

**Errors:**

- 401 - Not authenticated
- 403 - Plant not owned by user
- 404 - Plant not found
- 500 - Server error

### GET /api/notifications

Get current user's plants that need watering.

**Parameters:** None (authenticated user's plants)

**Response:**

```json
{
  "notifications": [
    {
      "plant_id": "uuid",
      "plant_name": "String",
      "photo_url": "https://...",
      "room_name": "Living Room",
      "last_watered": "2024-01-20T10:30:00Z",
      "next_watering": "2024-01-27T10:30:00Z",
      "days_overdue": 5,
      "watering_frequency_days": 7
    }
  ],
  "count": 3
}
```

**Errors:**

- 401 - Not authenticated

### Alternative: POST /dashboard/plants/:plantId with \_action=water

Record watering from the plant detail page:

```
POST /dashboard/plants/:plantId
Content-Type: multipart/form-data

form data:
- _action: "water"
```

**Response:**

```json
{
  "success": true,
  "plantId": "uuid"
}
```

**Errors:**

- 401 - Not authenticated
- 403 - Plant not owned by user
- 404 - Plant not found

## Watering History

Each plant maintains a complete watering history:

- **View**: Click "Watering History" in plant details
- **Display**: Timeline of past waterings
- **Delete**: Users can remove incorrect entries (future)
- **Export**: Download watering log (future)

## Type Safety

Watering types in `app/types/api.types.ts`:

```typescript
export interface PlantNeedingWater {
  plant_id: string;
  plant_name: string;
  days_overdue: number;
  // ...
}

export interface WateringRecord {
  id: string;
  plant_id: string;
  watered_at: string;
  created_at: string;
}
```

## Performance

- **Query Optimization**: Indexes on user_id, plant_id, created_at
- **Polling**: Notifications checked on page focus (future)
- **Caching**: Notification count cached in React state
- **Real-time**: WebSocket support planned (future)

## Testing

Component tests:

- WateringButton form submission
- NotificationsModal display and interactions
- Empty state rendering

Server function tests:

- recordWatering with ownership verification
- getPlantsNeedingWater sorting
- Watering history queries

See [../guides/TESTING.md](../guides/TESTING.md) for testing patterns.

## Accessibility

All watering components follow WCAG 2.1 AA:

- Modal has proper focus management
- Buttons have accessible labels
- Loading states announced
- Keyboard navigation supported

## Integration Points

Watering feature integrates with:

- **Plants**: Watering history stored in plants table
- **Notifications**: Notification bell and modal
- **Layout**: Navigation displays notification badge
- **Rooms**: Notifications show plant location

## Future Enhancements

- [ ] Scheduled watering reminders (email/push)
- [ ] Watering history analytics
- [ ] Custom watering frequency per season
- [ ] Multiple watering events per day
- [ ] Social watering tracker (group plants)
- [ ] Watering routine templates
- [ ] Integration with smart watering devices
