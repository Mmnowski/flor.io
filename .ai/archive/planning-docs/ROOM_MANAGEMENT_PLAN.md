# Room Management Improvements Plan

**Date**: 2026-01-31
**Branch**: `feat/room-management`
**Status**: Implementation in progress

## Problem

1. **Create flow broken**: The `RoomFilter` component (containing "New Room" button) is only shown when `rooms.length > 0`, so users with no rooms cannot create their first room from the dashboard.

2. **No delete UI**: The API supports deleting rooms (`POST /api/rooms` with `_method=DELETE`), but there's no UI for it.

## Solution

### 1. Fix Room Creation Flow

Modify `app/routes/dashboard._index.tsx` to always show room management UI:

```tsx
// Current (broken)
{rooms.length > 0 && (
  <RoomFilter ... />
)}

// New approach: Always show, handle empty state in RoomFilter
<RoomFilter ... />
```

Update `app/features/rooms/components/room-filter.tsx` to show a helpful message when no rooms exist alongside the "New Room" button.

### 2. Add Delete Room Functionality

Create a new `DeleteRoomDialog` component in `app/features/rooms/components/delete-room-dialog.tsx`:

- Confirmation dialog with room name
- Shows warning with plant count if room has plants (plants will be unassigned, not deleted)
- Uses `useFetcher` to call `POST /api/rooms` with `_method=DELETE`
- Similar pattern to existing `CreateRoomDialog`

Modify `RoomFilter` to add a delete button on each room chip:

- Small X icon that appears on hover (or always visible)
- Clicking opens the `DeleteRoomDialog`
- Pass room info (id, name, plantCount) to the dialog

### 3. Update API to Allow Deletion with Plants

Modify `app/routes/api.rooms.tsx` to remove the restriction that prevents deleting rooms with plants:

```tsx
// Current (prevents deletion)
if (plantCount > 0) {
  throw new Response(...);
}

// New: Remove this check - database ON DELETE SET NULL handles it
// Plants will have room_id set to null automatically
```

The database schema already has `ON DELETE SET NULL` on the `room_id` foreign key, so plants will simply be unassigned when their room is deleted.

## Files to Modify

1. **`app/routes/dashboard._index.tsx`** - Remove `rooms.length > 0` condition, pass plantCounts to RoomFilter
2. **`app/features/rooms/components/room-filter.tsx`** - Add delete button to room chips, handle empty state
3. **`app/features/rooms/components/delete-room-dialog.tsx`** (new) - Confirmation dialog with plant warning
4. **`app/routes/api.rooms.tsx`** - Remove plant count restriction from DELETE case
5. **`app/features/rooms/components/index.ts`** - Export new component

## Implementation Tasks

- [ ] Create DeleteRoomDialog component with confirmation UI and plant warning
- [ ] Add delete button to room chips and handle empty state
- [ ] Always show RoomFilter section (remove rooms.length check)
- [ ] Remove plant count restriction from room deletion API
- [ ] Export DeleteRoomDialog from index.ts
- [ ] Update documentation

## Technical Notes

### Database Behavior

The `plants` table has:

```sql
room_id uuid REFERENCES rooms(id) ON DELETE SET NULL
```

This means when a room is deleted, all plants referencing that room will automatically have their `room_id` set to `NULL` (unassigned). No application code needed for cascade behavior.

### Component Pattern

Following existing patterns:

- `CreateRoomDialog` uses `useFetcher` with method tunneling (`_method` form field)
- Dialog components from shadcn/ui
- Similar error handling and loading states
