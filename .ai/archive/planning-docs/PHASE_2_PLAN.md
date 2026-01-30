# Phase 2: Core Plant Management Implementation Plan

## Overview

This plan implements manual plant creation, dashboard with plant grid, plant details, editing, and deletion features for the Flor.io plant care application. The implementation builds on the solid Phase 1 foundation (authentication, Supabase, shadcn/ui).

## Implementation Strategy

**Order:** Build server utilities first (foundation), then components (UI), then routes (integration).

**Total Implementation:** 18 steps organized into 5 major sections (2.0-2.5 from Phase 2 plan).

---

## Implementation Sequence

### Phase 2.0: Server Utilities (Steps 1-6)

These utilities are the foundation. All routes depend on them.

#### Step 1: Storage Utility (`/app/lib/storage.server.ts`)

**Purpose:** Upload/delete plant photos to Supabase Storage.

**Functions:**

- `uploadPlantPhoto(userId, buffer, mimeType)` → Returns public URL
- `deletePlantPhoto(photoUrl)` → Deletes file from storage
- `getPlantPhotoUrl(path)` → Gets public URL

**Key Details:**

- Bucket: `plant-photos`
- Path: `{userId}/{uuid}.jpg`
- Generate UUID for unique filenames
- Return null on error (graceful failure)

#### Step 2: Image Processing (`/app/lib/image.server.ts`)

**Purpose:** Server-side image compression using Sharp.

**Functions:**

- `processPlantImage(buffer)` → Returns processed Buffer
- `extractImageFromFormData(formData, fieldName)` → Extracts File from FormData

**Processing Pipeline:**

1. Accept buffer from FormData
2. Resize to max 1920px width (maintain aspect ratio)
3. Convert to JPEG, quality 85%
4. Strip EXIF data
5. Ensure output < 500KB

**Constraints:**

- Max input: 10MB
- Max output: 500KB
- Accepted formats: JPG, PNG, WEBP
- Output format: JPEG only

#### Step 3: Rooms Utility (`/app/lib/rooms.server.ts`)

**Purpose:** Fetch user's rooms for dropdowns and filters.

**Functions:**

- `getUserRooms(userId)` → Returns Room[]
- `getRoomById(roomId, userId)` → Returns Room | null

**Implementation:**

- Filter by user_id
- Order by name ascending
- RLS handles security

#### Step 4: Plants Utility (`/app/lib/plants.server.ts`)

**Purpose:** Core CRUD for plants.

**Functions:**

- `getUserPlants(userId, roomId?)` → Returns PlantWithWatering[]
- `getPlantById(plantId, userId)` → Returns PlantWithDetails | null
- `createPlant(userId, data)` → Returns Plant
- `updatePlant(plantId, userId, data)` → Returns Plant
- `deletePlant(plantId, userId)` → Returns void

**Key Implementation:**

**getUserPlants:**

- Join with rooms table for room names
- Use `get_next_watering_date(plant_id)` function
- Calculate days_until_watering (negative = overdue)
- Filter by roomId if provided
- Order by next watering (soonest first)

**getPlantById:**

- Verify ownership (user_id check)
- Get room name if room_id exists
- Calculate watering status
- Fetch last 10 watering history entries
- Return null if not found

**createPlant:**

- Validate required fields (name, watering_frequency_days)
- Insert with user_id and created_with_ai = false
- Return inserted plant

**updatePlant:**

- Verify ownership before update
- Update only provided fields
- Update updated_at timestamp
- Return updated plant

**deletePlant:**

- Verify ownership
- Delete plant (cascades to watering_history)
- Delete photo from storage if exists

#### Step 5: Watering Utility (`/app/lib/watering.server.ts`)

**Purpose:** Manage watering history and calculations.

**Functions:**

- `recordWatering(plantId, userId, wateredAt?)` → Returns void
- `getWateringHistory(plantId, userId, limit?)` → Returns WateringHistory[]
- `getNextWateringDate(plantId)` → Returns Date | null
- `getPlantsNeedingWater(userId)` → Returns PlantNeedingWater[]

**Implementation:**

**recordWatering:**

- Verify plant ownership
- Insert into watering_history with timestamp
- Use current time if none provided

**getNextWateringDate:**

- Call `get_next_watering_date(plant_id)` DB function
- Return as Date object

**getPlantsNeedingWater:**

- Call `get_plants_needing_water(user_id)` DB function
- Returns plants where next_watering <= NOW()

#### Step 6: Type Definitions (`/app/types/plant.types.ts`)

**Purpose:** Extended types with computed fields.

**Types:**

```typescript
export type Plant = Database['public']['Tables']['plants']['Row'];
export type PlantInsert = Database['public']['Tables']['plants']['Insert'];
export type PlantUpdate = Database['public']['Tables']['plants']['Update'];
export type Room = Database['public']['Tables']['rooms']['Row'];
export type WateringHistory = Database['public']['Tables']['watering_history']['Row'];

export type PlantWithWatering = Plant & {
  room_name: string | null;
  next_watering_date: Date | null;
  last_watered_date: Date | null;
  days_until_watering: number | null;
  is_overdue: boolean;
};

export type PlantWithDetails = PlantWithWatering & {
  watering_history: WateringHistory[];
};

export type PlantFormData = {
  name: string;
  photo?: File | null;
  watering_frequency_days: number;
  room_id?: string | null;
  light_requirements?: string | null;
  fertilizing_tips?: string | null;
  pruning_tips?: string | null;
  troubleshooting?: string | null;
};

export type PlantInsertData = Omit<PlantInsert, 'id' | 'created_at' | 'updated_at'>;
export type PlantUpdateData = Partial<PlantInsertData>;
```

---

### Phase 2.1: Dashboard Route (Steps 7-9)

#### Step 7: Room Filter Component (`/app/components/room-filter.tsx`)

**Type:** Client Component

**Props:**

```typescript
{
  rooms: Room[];
  activeRoomId: string | null;
  onFilterChange: (roomId: string | null) => void;
}
```

**Features:**

- Horizontal scrolling container
- "All Plants" chip (always first)
- Room chips with plant count badges
- Active room highlighted (emerald bg)
- Click to filter dashboard

#### Step 8: Plant Card Component (`/app/components/plant-card.tsx`)

**Type:** Client Component

**Props:**

```typescript
{
  plant: PlantWithWatering;
}
```

**Structure:**

- Card with clickable link to detail view
- Photo or leaf icon placeholder
- Plant name (h3)
- Room badge if exists
- Watering status with color coding:
  - Red: Overdue (< 0 days)
  - Amber: Due today (0 days)
  - Gray: Not due (> 0 days)

**Styling:**

- Aspect ratio 3:4 for photo
- Object-fit: cover
- Hover: scale 1.02, shadow-lg
- Dark mode support

#### Step 9: Dashboard Route (`/app/routes/dashboard._index.tsx`)

**Loader:**

1. Get userId from requireAuth()
2. Get roomId from URL searchParams
3. Fetch plants via getUserPlants(userId, roomId)
4. Fetch rooms via getUserRooms(userId)
5. Return { plants, rooms, activeRoomId }

**Component:**

- Header with plant count and "Add Plant" button
- RoomFilter if rooms exist
- EmptyState if no plants
- Grid of PlantCards (responsive: md:2cols, lg:3cols)
- Cards link to `/dashboard/plants/$plantId`

**URL Pattern:**

- `/dashboard` - All plants
- `/dashboard?room={roomId}` - Filtered by room

---

### Phase 2.2: Manual Plant Creation (Steps 10-12)

#### Step 10: Image Upload Component (`/app/components/image-upload.tsx`)

**Type:** Client Component

**Props:**

```typescript
{
  currentPhotoUrl?: string | null;
  onFileChange?: (file: File | null) => void;
}
```

**Features:**

- Hidden file input (triggered by button)
- Image preview using FileReader
- Show current photo if exists
- "Remove photo" button
- Client-side file type and size validation

**Validation:**

- Accept: image/\*
- Max size warning: 10MB
- Show preview before upload

#### Step 11: Plant Form Component (`/app/components/plant-form.tsx`)

**Type:** Client Component

**Props:**

```typescript
{
  plant?: PlantWithDetails; // For edit mode
  rooms: Room[];
  error?: string | null;
  mode: 'create' | 'edit';
}
```

**Fields:**

1. Photo Upload (ImageUpload component) - optional
2. Name (text input, required, max 100 chars)
3. Watering Frequency (number input, required, min 1, max 365)
4. Room (select dropdown, optional)
5. Light Requirements (textarea, optional)
6. Fertilizing Tips (textarea, optional)
7. Pruning Tips (textarea, optional)
8. Troubleshooting (textarea, optional)

**Validation:**

- Client: HTML5 required, min, max
- Server: Validate in action

#### Step 12: Create Plant Route (`/app/routes/dashboard.plants.new.tsx`)

**Loader:**

1. Get userId from requireAuth()
2. Fetch rooms via getUserRooms(userId)
3. Return { rooms }

**Action:**

1. Verify authentication
2. Parse FormData
3. Validate required fields (name, watering_frequency)
4. If photo exists:
   a. Extract from FormData
   b. Process with Sharp (processPlantImage)
   c. Upload to storage (uploadPlantPhoto)
   d. Get photo URL
5. Create plant via createPlant()
6. Redirect to `/dashboard/plants/$plantId`

**Error Handling:**

- Missing fields → return { error: 'message' }
- Invalid image → return { error: 'Invalid image' }
- Image too large → return { error: 'Image exceeds 10MB' }
- Database error → return { error: 'Failed to create plant' }

**Component:**

- PlantForm in create mode
- Form submits to current route
- Show error if actionData.error exists
- Cancel button returns to dashboard

---

### Phase 2.3: Plant Details View (Steps 13-15)

#### Step 13: Watering Button Component (`/app/components/watering-button.tsx`)

**Type:** Client Component

**Props:**

```typescript
{
  plantId: string;
  nextWateringDate: Date | null;
  lastWateredDate: Date | null;
}
```

**Features:**

- Form with POST to same route
- Hidden input: `_action=water`
- Button shows "Watered Today" with checkmark
- Optimistic UI on submit
- Shows last watered date below button
- Minimum 44px height (accessibility)

#### Step 14: Plant Info Section Component (`/app/components/plant-info-section.tsx`)

**Type:** Client Component (uses Collapsible)

**Props:**

```typescript
{
  title: string;
  content: string | null;
  icon: React.ComponentType;
  defaultOpen?: boolean;
}
```

**Structure:**

- Collapsible from shadcn/ui
- CollapsibleTrigger with icon, title, chevron
- CollapsibleContent with text or "No information provided"
- defaultOpen for first section (Light Requirements)

#### Step 15: Plant Detail Route (`/app/routes/dashboard.plants.$plantId.tsx`)

**Loader:**

1. Get userId from requireAuth()
2. Get plantId from params
3. Fetch plant via getPlantById(plantId, userId)
4. If not found, throw 404 Response
5. Fetch watering history (last 10)
6. Return { plant, wateringHistory }

**Actions (Multiplexed):**

**Water Action (\_action=water):**

1. Verify ownership
2. Call recordWatering(plantId, userId)
3. Revalidate loader
4. Return null (triggers revalidation)

**Delete Action (\_action=delete):**

1. Verify ownership
2. Delete photo if exists (deletePlantPhoto)
3. Delete plant (deletePlant)
4. Redirect to /dashboard

**Component:**

- Large photo display or placeholder
- Plant name (h1)
- Room badge
- Watering status with color coding
- WateringButton (prominent)
- Collapsible sections (4 sections):
  - Light Requirements (defaultOpen)
  - Fertilizing Tips
  - Pruning Tips
  - Troubleshooting
- Watering History (last 10, formatted dates)
- Edit button (link to edit route)
- Delete button (opens DeletePlantDialog)

---

### Phase 2.4: Edit Plant (Step 16)

#### Step 16: Edit Plant Route (`/app/routes/dashboard.plants.$plantId.edit.tsx`)

**Loader:**

1. Get userId from requireAuth()
2. Get plantId from params
3. Fetch plant via getPlantById(plantId, userId)
4. If not found, throw 404 Response
5. Fetch rooms via getUserRooms(userId)
6. Return { plant, rooms }

**Action:**

1. Verify authentication
2. Parse FormData
3. Validate fields
4. If new photo exists:
   a. Process with Sharp
   b. Upload to storage
   c. Delete old photo if exists
   d. Update photo_url
5. Update plant via updatePlant()
6. Redirect to `/dashboard/plants/$plantId`

**Component:**

- PlantForm in edit mode with plant data
- Pre-filled with current values
- Shows current photo
- Cancel button returns to detail view
- Save button submits form

---

### Phase 2.5: Delete Plant (Steps 17-18)

#### Step 17: Delete Dialog Component (`/app/components/delete-plant-dialog.tsx`)

**Type:** Client Component (uses Dialog)

**Props:**

```typescript
{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plantName: string;
  plantId: string;
}
```

**Structure:**

- Dialog from shadcn/ui
- Warning message with plant name
- "Are you sure you want to delete {plantName}?"
- Cancel button (secondary)
- Delete button (destructive, red)
- Form with POST and `_action=delete`

#### Step 18: Add Delete Action to Detail Route

**File:** `/app/routes/dashboard.plants.$plantId.tsx`

**Changes:**

- Import DeletePlantDialog
- Add state for dialog open/close
- Add Delete button that opens dialog
- Delete action already implemented in Step 15

---

## Critical Files to Modify/Create

### New Files (18 total)

1. `/app/lib/storage.server.ts`
2. `/app/lib/image.server.ts`
3. `/app/lib/rooms.server.ts`
4. `/app/lib/plants.server.ts`
5. `/app/lib/watering.server.ts`
6. `/app/types/plant.types.ts`
7. `/app/components/room-filter.tsx`
8. `/app/components/plant-card.tsx`
9. `/app/components/image-upload.tsx`
10. `/app/components/plant-form.tsx`
11. `/app/components/watering-button.tsx`
12. `/app/components/plant-info-section.tsx`
13. `/app/components/delete-plant-dialog.tsx`

### Modified Files (4 total)

14. `/app/routes/dashboard._index.tsx` (currently stub)
15. `/app/routes/dashboard.plants.new.tsx` (currently stub)
16. `/app/routes/dashboard.plants.$plantId.tsx` (currently stub)
17. `/app/routes/dashboard.plants.$plantId.edit.tsx` (currently stub)

---

## Critical Considerations

### 1. Image Compression (Sharp)

- Must be server-side (Sharp is Node.js only)
- Max width: 1920px
- Quality: 85%
- Output: < 500KB
- Format: JPEG only

### 2. Supabase Storage

- Bucket: `plant-photos`
- Path: `{userId}/{uuid}.jpg`
- Public bucket (files accessible via URL)
- RLS policies ensure user can only access own photos

### 3. Watering Status

- Use database function `get_next_watering_date(plant_id)`
- Don't calculate in JavaScript
- Calculate days_until_watering client-side for display

### 4. Security (RLS)

- Database RLS policies filter by user_id
- Still include user_id in queries for clarity
- No manual authorization needed in most cases

### 5. Form Validation

- Client-side: HTML5 attributes (required, min, max)
- Server-side: Re-validate all inputs in actions
- Return actionData with errors for display

---

## Validation & Error Handling

### Required Field Validation

```typescript
if (!name || typeof name !== 'string' || name.trim().length === 0) {
  return { error: 'Plant name is required' };
}

const frequency = Number(wateringFrequency);
if (frequency < 1 || frequency > 365) {
  return { error: 'Watering frequency must be between 1 and 365 days' };
}
```

### File Upload Validation

```typescript
// Client-side
if (file.size > 10 * 1024 * 1024) {
  alert('Image must be smaller than 10MB');
  return;
}

// Server-side
if (file && file.size > MAX_FILE_SIZE) {
  return { error: 'Image must be smaller than 10MB' };
}
```

### Error Handling Pattern

```typescript
try {
  await createPlant(userId, plantData);
} catch (error) {
  console.error('Failed to create plant:', error);
  return { error: 'Failed to create plant. Please try again.' };
}
```

---

## Testing Strategy

### Manual Testing Checklist

- [ ] Create plant without photo
- [ ] Create plant with photo (< 1MB)
- [ ] Create plant with large photo (> 5MB) - expect error
- [ ] Edit plant and change photo
- [ ] Edit plant and remove photo
- [ ] Delete plant with confirmation
- [ ] Record watering event
- [ ] View plant with no watering history
- [ ] View plant with multiple watering entries
- [ ] Filter plants by room
- [ ] View dashboard with no plants (EmptyState)
- [ ] View dashboard with 20+ plants

### Integration Tests

- [ ] Full CRUD flow: Create → View → Edit → Delete
- [ ] Photo flow: Upload → View in card → View in detail → Edit
- [ ] Watering flow: Record → See status → See in history
- [ ] Room filter flow: Filter → Create in room → See in filter

### Edge Cases

- [ ] Plant with deleted room (show null gracefully)
- [ ] Very long plant name (truncate in card, full in detail)
- [ ] Concurrent watering from multiple devices
- [ ] Failed image upload (continue without photo)
- [ ] Invalid watering frequency (show error)

### Accessibility

- [ ] All forms keyboard navigable
- [ ] All images have alt text
- [ ] Error messages announced to screen readers
- [ ] Focus management after navigation
- [ ] Touch targets minimum 44x44px

---

## Verification Plan

### Step-by-Step Verification

**After Utilities (Steps 1-6):**

1. Test image upload to storage bucket
2. Test image compression (verify output < 500KB)
3. Test plant CRUD operations in DB
4. Test watering history operations
5. Verify types compile without errors

**After Dashboard (Step 9):**

1. Visit `/dashboard`
2. See empty state if no plants
3. Create plant manually in DB
4. Refresh and see plant card
5. Click card and navigate to detail (404 expected)

**After Create (Step 12):**

1. Click "Add Plant" button
2. Fill form and submit
3. Verify redirect to detail view
4. Check photo uploaded to storage
5. Check plant created in DB

**After Detail (Step 15):**

1. View plant detail page
2. Click "Watered Today"
3. Verify watering recorded in history
4. Verify status updated

**After Edit (Step 16):**

1. Click "Edit" button
2. Change plant name
3. Upload new photo
4. Save and verify changes
5. Check old photo deleted from storage

**After Delete (Steps 17-18):**

1. Click "Delete" button
2. Confirm in dialog
3. Verify redirect to dashboard
4. Check plant deleted from DB
5. Check photo deleted from storage

---

## Dependencies

### NPM Packages to Install

```bash
yarn add sharp
yarn add uuid
yarn add -D @types/uuid
```

### Existing Dependencies (Already Installed)

- @supabase/supabase-js
- React Router v7
- TailwindCSS v4
- shadcn/ui components

---

## Performance Optimizations

1. **Lazy Loading Images:** Add `loading="lazy"` to img tags
2. **Parallel Fetching:** Use `Promise.all()` for independent queries
3. **Optimistic UI:** Show instant feedback for watering button
4. **Database Indexes:** Already defined in schema (plants.user_id, plants.room_id)
5. **Query Limits:** Fetch only last 10 watering events
6. **Image Compression:** Sharp ensures small file sizes

---

## Success Criteria

Phase 2 is complete when:

- [ ] Users can create plants manually with optional photo
- [ ] Dashboard shows grid of plants with watering status
- [ ] Users can filter plants by room
- [ ] Plant detail view shows full information and watering history
- [ ] Users can record watering events
- [ ] Users can edit plant details
- [ ] Users can delete plants with confirmation
- [ ] All photos are compressed to < 500KB
- [ ] All forms have validation and error handling
- [ ] All components are keyboard accessible
- [ ] Dark mode works throughout

---

## Next Steps After Phase 2

Phase 3 will add:

- Watering notifications modal
- Notification badge in navigation
- Plants needing water API endpoint
- Email/push notifications (stretch goal)

Phase 4 will add:

- AI plant identification (PlantNet mock)
- AI care instructions (GPT-5 mock)
- AI feedback system
- Usage limits tracking
