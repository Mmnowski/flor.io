# Rooms Feature

The Rooms feature allows users to organize plants by location (rooms, shelves, etc.) for better management and filtering.

## Overview

Users can:

- Create rooms/locations
- Assign plants to rooms
- Filter plants by room
- Edit room names
- Delete empty rooms

## Architecture

### Directory Structure

```
app/features/rooms/
├── components/
│   ├── RoomSelector.tsx    # Dropdown/select for room
│   ├── RoomList.tsx        # List of rooms
│   └── index.ts
└── lib/
    └── rooms.server.ts     # Room operations
```

### Server Functions

Located in `app/lib/rooms.server.ts`:

```typescript
// Get all rooms for a user
export async function getUserRooms(userId: string): Promise<Room[]>;

// Create a new room
export async function createRoom(userId: string, name: string): Promise<Room>;

// Update room name
export async function updateRoom(roomId: string, userId: string, name: string): Promise<Room>;

// Delete a room (must be empty)
export async function deleteRoom(roomId: string, userId: string): Promise<void>;
```

### Components

#### RoomSelector

Dropdown/select component for choosing a room when creating/editing plants:

**Props:**

```typescript
interface RoomSelectorProps {
  selectedRoomId?: string | null;
  onSelect: (roomId: string | null) => void;
  rooms: Room[];
  isLoading?: boolean;
}
```

#### RoomList

Displays all rooms with counts of plants:

**Props:**

```typescript
interface RoomListProps {
  rooms: Room[];
  plantCounts: Record<string, number>;
  onEdit: (room: Room) => void;
  onDelete: (roomId: string) => void;
}
```

## Routes

### Room Management Endpoints

All room operations use a single `/api/rooms` endpoint with form-based `_method` tunneling:

```
GET  /api/rooms                 # List user's rooms
POST /api/rooms (_method=POST)  # Create new room
POST /api/rooms (_method=PATCH) # Update room
POST /api/rooms (_method=DELETE)# Delete room
```

## Data Model

### Rooms Table

```typescript
interface Room {
  id: string; // UUID
  user_id: string; // Foreign key to users
  name: string; // Room/location name
  created_at: string; // ISO timestamp
}
```

### Room Plant Relationship

Rooms are linked to plants via the `room_id` field in the plants table:

```typescript
interface Plant {
  room_id?: string; // Foreign key to rooms
  // ... other fields
}
```

## Features

### Room Filtering

Plants can be filtered by room:

1. Click room in navbar or sidebar
2. Plant list updates to show only plants in that room
3. Filter is stored in PlantFiltersContext
4. Clear filter to see all plants

### Room Management

**Creating a Room:**

1. Click "Create Room" in settings
2. Enter room name
3. Room created and available for assignment

**Editing a Room:**

1. Click edit button next to room
2. Update name
3. Changes reflect immediately

**Deleting a Room:**

1. Click delete button (only if empty)
2. Confirm deletion
3. Room removed

### Room Sorting

Rooms are sorted by custom `order` field for consistent display.

## API Routes

### POST /api/rooms (Create)

Create a new room.

**Request:**

```
POST /api/rooms
Content-Type: multipart/form-data

form data:
- _method: "POST"
- name: "Living Room" (required, 1-100 chars)
```

**Response:**

```json
{
  "room": {
    "id": "uuid",
    "user_id": "uuid",
    "name": "Living Room",
    "created_at": "2024-01-30T12:00:00Z"
  }
}
```

### POST /api/rooms (Update)

Update an existing room.

**Request:**

```
POST /api/rooms
Content-Type: multipart/form-data

form data:
- _method: "PATCH"
- roomId: "uuid" (required)
- name: "Master Bedroom" (required, 1-100 chars)
```

**Response:**

```json
{
  "room": {
    /* updated room */
  }
}
```

### POST /api/rooms (Delete)

Delete a room (must be empty).

**Request:**

```
POST /api/rooms
Content-Type: multipart/form-data

form data:
- _method: "DELETE"
- roomId: "uuid" (required)
```

**Response:**

```json
{
  "success": true
}
```

**Errors:**

- 400 - Room is not empty (still has plants)

## Type Safety

Room types are generated from Supabase schema:

```typescript
export type Room = Database['public']['Tables']['rooms']['Row'];
export type RoomInsert = Database['public']['Tables']['rooms']['Insert'];
export type RoomUpdate = Database['public']['Tables']['rooms']['Update'];
```

Validation defined in `app/lib/rooms/crud.server.ts`:

```typescript
export const roomNameSchema = z.string().min(1).max(100);
```

## Performance

- **Query Optimization**: Index on user_id
- **Eager Loading**: Rooms fetched with plant counts
- **Caching**: Room list cached in state
- **Pagination**: Not needed (typically < 20 rooms)

## Testing

Component tests:

- RoomSelector rendering and selection
- RoomList display

Server function tests:

- createRoom with ownership
- updateRoom validation
- deleteRoom with empty check
- getUserRooms retrieval

See [../guides/TESTING.md](../guides/TESTING.md) for testing patterns.

## Accessibility

All room components follow WCAG 2.1 AA:

- Dropdowns have proper labels
- Color is not the only indicator
- Keyboard navigation works
- Screen reader accessible

## Integration Points

Rooms feature integrates with:

- **Plants**: Plants have room_id foreign key
- **Plant Filters**: PlantFiltersContext uses selectedRoomId
- **Navigation**: Room filter shown in sidebar

## Constraints

- **Max rooms**: Typically < 50 per user
- **Room name length**: 100 characters max
- **Delete constraint**: Can only delete empty rooms
- **Colors**: Optional (for future UI enhancements)

## Future Enhancements

- [ ] Room images/backgrounds
- [ ] Room-specific care instructions
- [ ] Bulk room operations
- [ ] Room sharing with other users
- [ ] Room conditions (light, humidity, temp)
- [ ] Room layout/visualization
- [ ] Lighting schedules per room
