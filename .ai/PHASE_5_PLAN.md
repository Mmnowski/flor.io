# Phase 5: Organization & Polish - Detailed Implementation Plan

**Objective:** Add room organization, comprehensive error handling, accessibility improvements, and enhanced UX with optimistic updates and loading states.

**Duration:** 2 weeks (estimated)

**Status:** Starting

---

## Overview

Phase 5 focuses on:
1. **Room Management** - Allow users to organize plants by rooms
2. **Accessibility Audit** - Ensure WCAG 2.1 AA compliance
3. **Error Handling & Validation** - Robust form validation and error display
4. **Loading States & Optimistic UI** - Smooth user experience with instant feedback

---

## Detailed Tasks

### 5.1 Rooms Management

#### Task 5.1.1: Create Room API Endpoint
- **File:** `app/routes/api.rooms.tsx`
- **Actions:**
  - POST: Create new room (returns new room object)
  - GET: Fetch all rooms for user
  - PUT/PATCH: Rename room
  - DELETE: Delete room (what happens to plants?)
- **Response format:** Standard JSON with error handling
- **Validation:**
  - Room name required, unique per user, max 50 chars
  - Handle duplicate name error gracefully

#### Task 5.1.2: Update Dashboard for Room Filtering
- **File:** `app/routes/dashboard._index.tsx`
- **Changes:**
  - Loader: Fetch all rooms for user
  - Add horizontal chip filter above plant grid
  - Chips: "All" (default) + one chip per room
  - URL param: `?room={roomId}` for bookmarkable filters
  - Loader filters plants by room param if provided
  - Single-select: Only one room active at a time
  - Preserve active room during page navigation

#### Task 5.1.3: Inline Room Creation
- **File:** `app/components/room-filter-chips.tsx` (new)
- **Feature:**
  - "+" button at end of chip list
  - Click opens inline input field
  - User types room name and presses Enter or clicks Create
  - Calls room creation API
  - Add new chip to list and select it
  - Discard input on Escape
  - Loading state while creating

#### Task 5.1.4: Room Assignment in Forms
- **Files:**
  - `app/routes/dashboard.plants.new.tsx`
  - `app/routes/dashboard.plants.$plantId.edit.tsx`
- **Changes:**
  - Room dropdown in forms
  - Option to create new room inline (modal or inline)
  - Save room selection with plant
  - Validation: Show all user's rooms, allow creation if no room exists

#### Task 5.1.5: Delete Room Handling
- **Scenario:** User deletes a room with plants assigned
- **Options:**
  - Database cascade SET NULL (plants lose room reference)
  - OR prompt user to reassign plants first
- **Decision:** Implement SET NULL for simplicity, show plants in "Unassigned" category

---

### 5.2 Accessibility Audit

#### Task 5.2.1: Color Contrast Audit
- **Tools:** WebAIM Contrast Checker, axe DevTools
- **Check:** All text meets 4.5:1 ratio for normal text, 3:1 for large text
- **Action Items:**
  - Audit current TailwindCSS color palette
  - Adjust theme colors in `app.css` if needed
  - Test foreground + background combinations:
    - Primary button text on primary bg
    - Status colors (green/orange/red) with text
    - Link colors
    - Disabled state colors
  - Update Tailwind theme to ensure compliant colors
- **Result:** Document approved color palette

#### Task 5.2.2: Touch Target Sizes
- **Standard:** All interactive elements 44x44px minimum
- **Audit:**
  - Buttons - ensure 44px height + padding
  - Links - add padding/background for 44px target
  - Form inputs - 44px height
  - Checkboxes - 44px touch target (use ::after/::before for larger hit area)
  - Small icons - wrap in larger clickable area
- **Fix:** Update shadcn components if needed, add custom CSS for smaller elements
- **Test:** Mobile view (375px) to verify spacing

#### Task 5.2.3: Keyboard Navigation
- **Test:** Use keyboard only, no mouse
- **Flows to test:**
  - Tab through dashboard - order logical (top-to-bottom, left-to-right)
  - Tab through login form
  - Tab through plant creation wizard
  - Tab through modals - trap focus inside
  - Shift+Tab - reverse navigation works
  - Enter/Space - activate buttons/links
  - Escape - close modals
- **Implementation:**
  - Use shadcn components (built-in keyboard support)
  - Manage focus in modals with `focus-trap` library if needed
  - Visible focus indicators (default or custom)
  - Modal dismiss on Escape (Dialog component handles this)

#### Task 5.2.4: Screen Reader Testing
- **Tools:** NVDA (free, Windows) or macOS VoiceOver
- **Test:**
  - Login page - form labels associated correctly
  - Dashboard - plant cards announced with role and content
  - Plant details - hierarchy of information clear
  - Modals - announced as dialog with title
  - Buttons - labels clear (avoid "Click here")
- **Implementation:**
  - Add `aria-label` where needed
  - Use semantic HTML: `<nav>`, `<main>`, `<section>`
  - Ensure `<label htmlFor>` connected to inputs
  - Use `aria-live="polite"` for toast notifications
  - Describe icons with `aria-label` or title

#### Task 5.2.5: Language & Labels Review
- **Audit all text:**
  - Button labels - action-oriented ("Save Plant", not "OK")
  - Error messages - specific ("Email already registered" not "Error")
  - Instructions - concrete, no jargon
  - Form placeholders - not substitutes for labels
- **Examples:**
  - ❌ "Choose" → ✅ "Select a room"
  - ❌ "Invalid" → ✅ "Photo must be JPG or PNG"
  - ❌ "Oops!" → ✅ "Failed to save plant. Try again."

---

### 5.3 Error Handling & Validation

#### Task 5.3.1: Create Form Error Component
- **File:** `app/components/form-error.tsx`
- **Props:**
  - `message: string` - Error message
  - `type?: "error" | "warning" | "info"` - Style variant
- **UI:**
  - Icon + message
  - Red background for errors
  - Yellow for warnings
  - Visible above form or next to field
- **Usage:** Display action data errors in forms

#### Task 5.3.2: Validation Utilities
- **File:** `app/lib/validation.ts`
- **Functions:**
  ```typescript
  validateEmail(email: string): { valid: boolean; error?: string }
  validatePassword(password: string): { valid: boolean; error?: string }
  validatePlantName(name: string): { valid: boolean; error?: string }
  validateWateringFrequency(days: number): { valid: boolean; error?: string }
  validateRoomName(name: string): { valid: boolean; error?: string }
  ```
- **Rules:**
  - Email: RFC 5322 compliant
  - Password: Min 8 chars, 1 uppercase, 1 number, 1 special char
  - Plant name: 1-100 chars
  - Watering: 1-365 days
  - Room name: 1-50 chars, unique per user (checked server-side)

#### Task 5.3.3: Client-Side Validation
- **Implementation:**
  - Use `form onChange` listener
  - Show inline errors below fields (state-driven)
  - Disable submit button if form invalid
  - Red border on invalid inputs
- **Example:**
  ```tsx
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    const validation = validateField(name, value);
    setErrors(prev => ({...prev, [name]: validation.error || ''}));
  };
  ```

#### Task 5.3.4: Server-Side Validation
- **In route actions:**
  - Re-validate all inputs (never trust client)
  - Return `actionData` with errors
  - Example:
    ```typescript
    export async function action({ request }: Route.ActionArgs) {
      const formData = await request.formData();
      const name = String(formData.get('name'));

      const nameValidation = validatePlantName(name);
      if (!nameValidation.valid) {
        return { errors: { name: nameValidation.error } };
      }
      // proceed...
    }
    ```
  - Display errors in form using `actionData?.errors`

#### Task 5.3.5: Error Boundaries
- **Update:** `app/root.tsx` error boundary
  - Show friendly error message
  - In dev: show stack trace
  - In production: generic message + contact support
- **Create:** Route-level error boundaries for specific cases
  - Example: Plant details page error if plant not found

#### Task 5.3.6: User-Friendly Error Messages
- **File:** `app/lib/error-messages.ts` (new)
- **Constants:**
  ```typescript
  export const ERROR_MESSAGES = {
    INVALID_FILE_TYPE: 'Photo must be JPG or PNG',
    FILE_TOO_LARGE: 'Photo must be less than 10MB',
    PLANT_NAME_REQUIRED: 'Plant name is required',
    FREQUENCY_OUT_OF_RANGE: 'Watering frequency must be 1-365 days',
    ROOM_EXISTS: 'Room name already exists',
    EMAIL_REGISTERED: 'Email is already registered',
    INVALID_CREDENTIALS: 'Email or password is incorrect',
  };
  ```
- **Usage:** Reference in validation and error handling

---

### 5.4 Loading States & Optimistic UI

#### Task 5.4.1: Loading Indicators
- **Implementation:** Use `useNavigation()` hook from React Router
- **Loading spinner component:**
  - File: `app/components/loading-spinner.tsx`
  - Animated spinner with optional label
  - Accessible: `aria-busy="true"` and `aria-label="Loading..."`

#### Task 5.4.2: Skeleton Loaders
- **Use cases:**
  - Plant list loading
  - Plant details loading
  - Notifications modal loading
- **Implementation:**
  - Create skeleton variants of components
  - Show while loader is pending
  - Smooth transition to real content

#### Task 5.4.3: Optimistic UI Updates
- **Key flows:**

  1. **"Watered Today" button:**
     - Show immediate success feedback
     - Remove from notification list instantly
     - Revert if API fails
     - Implementation: Use `fetcher` from React Router

  2. **"Mark as Watered" in notifications modal:**
     - Optimistically remove from list
     - Show toast on success/failure

  3. **Filter by room:**
     - Change URL param immediately
     - Filter displayed plants instantly
     - No need to wait for server

- **Error recovery:**
  - If action fails, show error toast
  - Revert optimistic changes
  - Offer retry button

#### Task 5.4.4: Navigation Loading Bar
- **Tool:** `nprogress` or similar
- **Trigger:** When navigation starts
- **Progress bar:** Top of page, subtle animation
- **Usage:** Show during route transitions

#### Task 5.4.5: AI Operation Loading States
- **AI plant creation:**
  - Step 2 (Identify): "Identifying plant..." spinner
  - Step 4 (Care instructions): "Generating care instructions..." spinner
  - Show loading duration (2s and 3s from mock delays)
  - Disable back/next buttons during loading

---

## Implementation Order

1. **Tasks 5.3.1 - 5.3.3** (Error handling foundation)
   - Form error component
   - Validation utilities
   - Client-side validation in existing forms

2. **Tasks 5.1.1 - 5.1.2** (Rooms management)
   - API endpoint
   - Dashboard filtering

3. **Tasks 5.2.1 - 5.2.5** (Accessibility)
   - Color contrast audit
   - Touch targets
   - Keyboard navigation
   - Screen reader
   - Language review

4. **Tasks 5.3.4 - 5.3.6** (Complete error handling)
   - Server-side validation
   - Error boundaries
   - Error message library

5. **Tasks 5.4.1 - 5.4.5** (Loading states & optimistic UI)
   - Loading indicators
   - Skeleton loaders
   - Optimistic updates
   - Navigation bar
   - AI loading states

6. **Tasks 5.1.3 - 5.1.5** (Finish rooms)
   - Inline room creation
   - Room assignment in forms
   - Delete room handling

---

## Files to Create/Modify

### New Files
- `app/routes/api.rooms.tsx` - Room CRUD API
- `app/components/room-filter-chips.tsx` - Room filter UI
- `app/components/form-error.tsx` - Error display component
- `app/lib/validation.ts` - Validation utilities
- `app/lib/error-messages.ts` - Error message constants
- `app/components/loading-spinner.tsx` - Loading indicator (if not exists)
- `app/lib/nprogress.client.ts` - Navigation progress bar (optional)

### Modified Files
- `app/routes/dashboard._index.tsx` - Add room filtering
- `app/routes/dashboard.plants.new.tsx` - Add room selector
- `app/routes/dashboard.plants.$plantId.edit.tsx` - Add room selector
- `app/root.tsx` - Enhance error boundary
- `app/app.css` - Accessibility color adjustments
- All form routes - Add server-side validation
- `app/components/nav.tsx` - Conditional room filter visibility

---

## Testing Strategy

### Unit Tests
- Validation utilities (`app/lib/validation.test.ts`)
- Error message library
- Room filtering logic

### Manual Testing
- Test all keyboard navigation flows
- Test screen reader with one plant
- Test error states (duplicate room, invalid input)
- Test optimistic UI (network throttling in DevTools)
- Test on mobile (375px width)

### Accessibility Audit Checklist
- [ ] Color contrast checked (WebAIM)
- [ ] Touch targets tested (44px minimum)
- [ ] Keyboard navigation complete
- [ ] Screen reader tested
- [ ] Form labels associated
- [ ] Error messages clear
- [ ] High contrast mode tested

---

## Acceptance Criteria

- All forms have client and server validation
- All user interactions show appropriate loading states
- Room filtering works with bookmarkable URLs
- App meets WCAG 2.1 AA standards
- Error messages are user-friendly and specific
- Optimistic UI provides instant feedback
- No console errors or warnings

---

## Notes & Considerations

- Phase 5 is primarily about UX polish and accessibility - not new major features
- Many tasks involve refactoring/improving existing code
- Accessibility should be ongoing (not just Phase 5)
- Consider using React Router's `<fetcher>` for optimistic updates
- Keep error messages out of database - use message library for consistency
- Test accessibility on real devices/browsers, not just emulation

