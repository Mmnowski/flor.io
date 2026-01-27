# Phase 3: Watering System Implementation Plan

## Overview

Phase 3 focuses on adding a notifications system to alert users about plants that need watering. The core watering tracking functionality was already implemented in Phase 2, so this phase primarily adds the user-facing notification badge and modal interface.

## Current State Analysis

### Already Implemented in Phase 2:

- ✅ Complete watering tracking system (`app/lib/watering.server.ts`)
- ✅ `recordWatering()` function to log watering events
- ✅ `getWateringHistory()` to retrieve past waterings
- ✅ `getPlantsNeedingWater(userId)` - **Key function that returns all plants needing water**
- ✅ `getNextWateringDate(plantId)` calculation via database function
- ✅ Database tables: `watering_history`, `plants` with frequency
- ✅ Watering button on plant detail pages
- ✅ Watering history display (last 10 events)
- ✅ Color-coded status indicators (red/amber/gray)

### What Phase 3 Adds:

- 🆕 Notification badge in navigation bar
- 🆕 Notifications modal showing all plants needing water
- 🆕 Quick "Watered" action directly from notification modal
- 🆕 API route for fetching notification data

## Implementation Tasks

### Task 1: Create Notifications API Route

**File to create:** `app/routes/api.notifications.tsx`

**Purpose:** Provide an API endpoint that returns plants needing water for the current user.

**Implementation:**

- Export a loader function that:
  1. Requires authentication (`requireUserId` from session.server.ts)
  2. Calls `getPlantsNeedingWater(userId)` from watering.server.ts
  3. Returns JSON with plant data including:
     - plant_id, plant_name, photo_url
     - last_watered, next_watering dates
     - days_overdue (for sorting and display)
  4. Sorts by most overdue first (already done by DB function)

**Response format:**

```typescript
{
  notifications: PlantNeedingWater[] // from watering.server.ts types
}
```

### Task 2: Create Notifications Modal Component

**File to create:** `app/components/notifications-modal.tsx`

**Purpose:** Display a modal with all plants needing water, allowing quick watering actions.

**Component Structure:**

- Use shadcn Dialog component (follow pattern from DeletePlantDialog)
- Props: `open: boolean`, `onOpenChange: (open: boolean) => void`, `notifications: PlantNeedingWater[]`, `onWatered: (plantId: string) => void`
- Layout:
  - Dialog header with title "Plants Needing Water" and close button
  - Scrollable content area with list of plants
  - Empty state if no plants need water: "All caught up! 🌱"

**Each notification item displays:**

- Plant photo thumbnail (48x48px, rounded)
- Plant name (bold)
- Status text:
  - "Overdue by X days" (red text) if days_overdue > 0
  - "Due today" (amber text) if days_overdue = 0
- "Watered" button (emerald, loads during action)
- Click on plant name/photo → navigate to plant detail page

**Styling:**

- Use emerald theme colors
- Dark mode support
- Color coding: red-600/red-400 (overdue), amber-600/amber-400 (today)
- Hover states on plant items
- Max height with scroll (max-h-[60vh])

**Behavior:**

- Click "Watered" button → call `onWatered(plantId)` callback
- Remove plant from list optimistically (or disable while loading)
- Click outside or X → close modal
- Keyboard: Escape closes modal

### Task 3: Add Notification Badge to Navigation

**File to modify:** `app/components/nav.tsx`

**Changes:**

1. Import Bell icon from lucide-react
2. Import Badge component from ~/components/ui/badge
3. Add notification button between Dashboard link and Theme toggle (around line 48)

**Implementation:**

```tsx
<Button
  variant="ghost"
  size="icon"
  onClick={() => setNotificationsOpen(true)}
  className="relative"
  aria-label={`Notifications (${notificationCount})`}
>
  <Bell className="h-5 w-5" />
  {notificationCount > 0 && (
    <Badge
      variant="destructive"
      className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
    >
      {notificationCount}
    </Badge>
  )}
</Button>
```

**State management:**

- Add `notificationsOpen` state for modal
- Add `notificationCount` state (number)
- Fetch notifications on component mount/route change
- Update count when modal actions occur

### Task 4: Integrate Modal with Navigation

**File to modify:** `app/components/nav.tsx`

**Integration steps:**

1. Import NotificationsModal component
2. Add state: `const [notificationsOpen, setNotificationsOpen] = useState(false)`
3. Add state: `const [notifications, setNotifications] = useState<PlantNeedingWater[]>([])`
4. Fetch notifications on mount using `useFetcher` or `useLoaderData` from parent route
5. Render modal: `<NotificationsModal open={notificationsOpen} onOpenChange={setNotificationsOpen} notifications={notifications} onWatered={handleWatered} />`

**handleWatered function:**

- Call API to record watering (POST to plant's watering action)
- Optimistically remove plant from notifications list
- Update notification count
- Show success toast notification
- On error, revert optimistic update and show error

### Task 5: Update Dashboard Layout to Provide Notification Data

**File to modify:** `app/routes/dashboard.tsx`

**Changes:**

- Update loader to fetch notification count: `const plantsNeedingWater = await getPlantsNeedingWater(userId)`
- Return count in loader data: `notificationCount: plantsNeedingWater.length`
- Pass to Nav component via context or outlet context
- Nav component reads from `useOutletContext()` or similar pattern

**Alternative approach:** Nav fetches its own data via useFetcher

- More decoupled
- Nav manages its own data fetching
- Fetcher calls `/api/notifications` on mount
- Revalidate on route changes

### Task 6: Add Watering Action Handler for Modal

**File to modify:** `app/routes/dashboard.plants.$plantId.tsx` (or create new action route)

**Option A:** Use existing plant detail action with intent

- Add `intent: "water"` to existing action handler
- Call `recordWatering(plantId, userId)`
- Return JSON response for modal

**Option B:** Create dedicated watering API route

- `app/routes/api.water.$plantId.tsx`
- Action only, no loader
- Call `recordWatering(plantId, userId)`
- Return success/error JSON

**Recommended:** Option B for cleaner separation and reusability

### Task 7: Add Type Definitions

**File to modify:** `app/types/plant.types.ts` (or watering.types.ts)

**Types needed:**

```typescript
export interface PlantNeedingWater {
  plant_id: string;
  plant_name: string;
  photo_url: string | null;
  last_watered: string; // ISO timestamp
  next_watering: string; // ISO timestamp
  days_overdue: number;
}
```

**Note:** This type may already be defined in watering.server.ts - verify and reuse if so.

## Critical Files Summary

### Files to Create:

1. `app/routes/api.notifications.tsx` - Notifications API endpoint
2. `app/components/notifications-modal.tsx` - Modal component
3. `app/routes/api.water.$plantId.tsx` - Watering action endpoint (optional)

### Files to Modify:

1. `app/components/nav.tsx` - Add notification badge and modal integration
2. `app/routes/dashboard.tsx` - Provide notification context (optional)
3. `app/types/plant.types.ts` - Add types if needed

### Files to Reference:

1. `app/lib/watering.server.ts` - Use existing `getPlantsNeedingWater()` function
2. `app/components/delete-plant-dialog.tsx` - Pattern for modal implementation
3. `app/components/ui/dialog.tsx` - shadcn Dialog component
4. `app/components/ui/badge.tsx` - shadcn Badge component

## Implementation Approach

### Step 1: Backend API

1. Create `api.notifications.tsx` route
2. Implement loader to fetch plants needing water
3. Test endpoint returns correct data

### Step 2: Notifications Modal

1. Create `notifications-modal.tsx` component
2. Implement UI with plant list and empty state
3. Add watering action handler
4. Style with emerald theme and dark mode

### Step 3: Navigation Integration

1. Modify `nav.tsx` to add bell icon button
2. Add notification badge with count
3. Integrate modal with open/close state
4. Fetch notification data (useFetcher approach)

### Step 4: Watering Action

1. Create `api.water.$plantId.tsx` action route
2. Handle POST to record watering
3. Return JSON response
4. Integrate with modal's onWatered callback

### Step 5: Testing & Polish

1. Test notification flow end-to-end
2. Test watering from modal
3. Verify optimistic UI updates
4. Check dark mode styling
5. Test with 0, 1, and many notifications
6. Verify badge count updates correctly
7. Test navigation to plant details from modal

## Design Considerations

### Data Fetching Strategy

**Chosen approach:** useFetcher in Nav component

- **Pros:** Decoupled, Nav manages its own data, doesn't require dashboard layout changes
- **Cons:** Extra fetch on mount
- **Why:** Cleaner architecture, Nav is self-contained, works across all routes

**Alternative:** Pass via outlet context from dashboard layout

- **Pros:** Single fetch, shared data
- **Cons:** Couples Nav to dashboard, doesn't work on other routes
- **Why not:** Nav needs notifications on all authenticated pages, not just dashboard

### Modal vs Popover

**Chosen:** Dialog modal (full overlay)

- **Why:** Better for mobile, more prominent, follows existing pattern
- **Alternative:** Dropdown popover like user menu
- **Trade-off:** Modal is more intrusive but ensures users see important info

### Optimistic UI Updates

**Approach:** Remove plant from notification list immediately when "Watered" is clicked

- Show loading state on button
- On error, show toast and re-add plant to list
- On success, keep plant removed and update count

### Badge Positioning

**Approach:** Absolute positioning on Bell button

- Use relative parent, absolute child
- Top-right corner with negative offset (-top-1, -right-1)
- Small size (h-5 w-5) with centered text
- Destructive variant (red) for visibility

## Verification & Testing

### Manual Testing Checklist:

1. **Notification Badge:**
   - [ ] Badge shows count when plants need water
   - [ ] Badge hidden when count is 0
   - [ ] Click bell opens modal
   - [ ] Badge updates after watering plant

2. **Notifications Modal:**
   - [ ] Modal opens/closes correctly
   - [ ] Shows all plants needing water
   - [ ] Displays "All caught up" when empty
   - [ ] Plants sorted by most overdue first
   - [ ] Color coding correct (red for overdue, amber for today)
   - [ ] Click plant navigates to detail page
   - [ ] Modal closes after navigation

3. **Watering Action:**
   - [ ] Click "Watered" button records watering
   - [ ] Plant removed from notification list immediately
   - [ ] Notification count decrements
   - [ ] Success feedback shown (toast)
   - [ ] Error handling if action fails
   - [ ] Watering appears in plant's history

4. **Dark Mode:**
   - [ ] Modal styled correctly in dark mode
   - [ ] Badge visible in dark mode
   - [ ] Text colors readable in both modes

5. **Responsive:**
   - [ ] Modal works on mobile (< 768px)
   - [ ] Badge visible on small screens
   - [ ] Touch targets adequate (44px)

6. **Accessibility:**
   - [ ] Bell button has aria-label with count
   - [ ] Modal focus trapped when open
   - [ ] Escape key closes modal
   - [ ] Keyboard navigation works
   - [ ] Screen reader announces notification count

### Edge Cases to Test:

- 0 notifications (empty state)
- 1 notification (badge shows "1")
- Many notifications (10+, scrolling)
- Watering last remaining plant (modal shows empty state)
- Network error during watering action
- Rapid clicks on "Watered" button (prevent double-submit)

### Database Verification:

- [ ] Watering recorded in `watering_history` table
- [ ] `next_watering_date` recalculated after watering
- [ ] Plant removed from `get_plants_needing_water()` results after watering

## Success Criteria

Phase 3 is complete when:

1. ✅ Notification badge shows count of plants needing water
2. ✅ Bell icon in nav opens notifications modal
3. ✅ Modal displays all plants needing water with status
4. ✅ Users can water plants directly from modal
5. ✅ Notification count updates in real-time after actions
6. ✅ Empty state shown when no notifications
7. ✅ Click plant in modal navigates to detail page
8. ✅ Dark mode fully supported
9. ✅ All manual tests pass
10. ✅ No console errors or warnings

## Timeline Estimate

- Task 1 (API route): 30 minutes
- Task 2 (Modal component): 1.5 hours
- Task 3 (Nav badge): 45 minutes
- Task 4 (Nav integration): 1 hour
- Task 5 (Dashboard context): 30 minutes
- Task 6 (Watering action): 45 minutes
- Task 7 (Types): 15 minutes
- Testing & polish: 1 hour

**Total: ~6 hours**

## Notes

- The database function `get_plants_needing_water()` already exists and is tested, so no DB changes needed
- Focus on UI/UX polish - this is a user-facing feature
- Consider adding toast notifications for success/error feedback
- May want to add a "View All" link in modal to go to a filtered dashboard view showing only plants needing water
- Future enhancement: Push notifications or email reminders (out of scope for phase 3)
