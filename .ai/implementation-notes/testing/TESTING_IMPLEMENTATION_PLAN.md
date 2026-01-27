# Testing Implementation Plan

## Overview

Complete test setup for Flor.io Phase 2 components and utilities
Framework: Vitest + React Testing Library
Target: 70-85% code coverage

---

## Phase 1: Infrastructure Setup

### Step 1.1: Install Dependencies

```bash
yarn add -D vitest @vitest/ui @vitest/coverage-v8
yarn add -D @testing-library/react @testing-library/user-event @testing-library/jest-dom
yarn add -D jsdom @vitejs/plugin-react
```

**Files to create/modify:**

- `vitest.config.ts` (new)
- `app/__tests__/setup.ts` (new)
- `package.json` (add test scripts)
- `tsconfig.json` (add vitest types)

### Step 1.2: Create Vitest Configuration

**File:** `vitest.config.ts`

- Configure jsdom environment
- Set up path aliases (`~/*`)
- Configure coverage settings
- Add React plugin

### Step 1.3: Create Test Setup File

**File:** `app/__tests__/setup.ts`

- Import @testing-library/jest-dom
- Setup afterEach cleanup
- Mock window.matchMedia for dark mode
- Mock other globals if needed

### Step 1.4: Update Configuration Files

**tsconfig.json:**

- Add vitest to types array
- Add `__tests__` to include paths if needed

**package.json:**

- Add scripts: `test`, `test:watch`, `test:ui`, `test:coverage`

---

## Phase 2: Test Factories

### Step 2.1: Create Core Factories

**File:** `app/__tests__/factories.ts`

Factory functions for:

- `createMockPlant()` - Base plant
- `createMockPlantWithWatering()` - Plant with computed watering fields
- `createMockPlantWithDetails()` - Plant with watering history
- `createMockRoom()` - Room object
- `createMockWateringHistory()` - Watering history entry
- `createMockUser()` - User for auth tests

### Step 2.2: Create Component-Specific Factories

**File:** `app/components/__tests__/factories.ts`

Factory functions for component props:

- `createPlantCardProps()`
- `createPlantFormProps()`
- `createRoomFilterProps()`
- etc.

### Step 2.3: Create Server Utility Factories

**File:** `app/lib/__tests__/factories.ts`

Mock builders for:

- Supabase responses
- Sharp image processing responses
- Storage upload responses
- Error scenarios

---

## Phase 3: Component Tests

### Step 3.1: Core UI Components

Test shadcn/ui wrapper components:

- `Button.test.tsx` - Basic button behavior
- `Input.test.tsx` - Input validation and interactions
- `Select.test.tsx` - Select dropdown functionality
- `Dialog.test.tsx` - Modal open/close
- `Collapsible.test.tsx` - Expand/collapse behavior

### Step 3.2: Custom Components (Phase 2 Features)

**High Priority:**

- `PlantCard.test.tsx` - Display, link navigation, watering status
- `PlantForm.test.tsx` - Form validation, submission, field updates
- `ImageUpload.test.tsx` - File selection, preview, removal
- `WateringButton.test.tsx` - Water recording, state updates
- `DeletePlantDialog.test.tsx` - Confirmation dialog flow

**Medium Priority:**

- `RoomFilter.test.tsx` - Room selection, filtering
- `PlantInfoSection.test.tsx` - Collapsible section behavior
- `EmptyState.test.tsx` - Empty state rendering

**Lower Priority:**

- `Navigation.test.tsx` - Nav rendering with auth state
- `LoadingSpinner.test.tsx` - Loading display
- `FormError.test.tsx` - Error message display

### Step 3.3: Hook Tests

**File:** `app/hooks/__tests__/useTheme.test.ts`

- Theme initialization from localStorage
- Theme switching
- localStorage persistence
- System preference detection

---

## Phase 4: Server Utility Tests

### Step 4.1: Storage Utilities

**File:** `app/lib/__tests__/storage.server.test.ts`

- `uploadPlantPhoto()` - Upload success, error handling
- `deletePlantPhoto()` - Delete success, failure
- `getPlantPhotoUrl()` - URL generation

### Step 4.2: Image Processing

**File:** `app/lib/__tests__/image.server.test.ts`

- `processPlantImage()` - Compression, sizing, format
- File size validation
- EXIF data stripping
- Error handling

### Step 4.3: Rooms Utility

**File:** `app/lib/__tests__/rooms.server.test.ts`

- `getUserRooms()` - Fetch and sort
- `getRoomById()` - Single room, ownership check
- `countPlantsInRoom()` - Count logic

### Step 4.4: Plants CRUD

**File:** `app/lib/__tests__/plants.server.test.ts`

- `getUserPlants()` - Fetch, filter, watering data
- `getPlantById()` - Single plant, details
- `createPlant()` - Validation, insertion
- `updatePlant()` - Update fields, ownership
- `deletePlant()` - Delete and cleanup
- `getWateringHistory()` - Fetch history

### Step 4.5: Watering Utility

**File:** `app/lib/__tests__/watering.server.test.ts`

- `recordWatering()` - Insert watering event
- `getWateringHistory()` - Fetch history
- `getNextWateringDate()` - Calculate next date
- `getPlantsNeedingWater()` - Find overdue plants

---

## Test Coverage Targets

### Phase 2 Components

- PlantCard: 90% (critical user interaction)
- PlantForm: 85% (complex form logic)
- ImageUpload: 85% (file handling)
- WateringButton: 90% (critical feature)
- DeletePlantDialog: 85% (destructive action)
- RoomFilter: 80% (selection logic)
- PlantInfoSection: 75% (simple display)

### Server Utilities

- plants.server.ts: 75% (lots of Supabase queries)
- watering.server.ts: 80% (calculation logic)
- storage.server.ts: 70% (mostly external calls)
- image.server.ts: 80% (Sharp processing)
- rooms.server.ts: 70% (straightforward queries)

### Overall Target

**75-85% coverage** across Phase 2 code

---

## Implementation Order

1. **Day 1: Infrastructure**
   - Install dependencies
   - Create vitest.config.ts
   - Create test setup file
   - Update package.json and tsconfig.json
   - Verify setup with simple test

2. **Day 2: Factories**
   - Create factories.ts in **tests**/
   - Create component prop factories
   - Create server utility mock builders

3. **Day 3-4: Component Tests**
   - Core UI components
   - High priority components (PlantCard, PlantForm, ImageUpload, etc.)
   - Medium priority components

4. **Day 5-6: Utility Tests**
   - Storage tests
   - Image processing tests
   - Rooms tests
   - Plants CRUD tests
   - Watering tests

---

## Key Testing Patterns to Use

### Component Testing

```typescript
// Setup
const mockPlant = createMockPlantWithWatering();

// Render with Router if needed
render(
  <MemoryRouter>
    <PlantCard plant={mockPlant} />
  </MemoryRouter>
);

// Assert behavior
expect(screen.getByRole('link')).toHaveAttribute('href', `/dashboard/plants/${mockPlant.id}`);
```

### Server Utility Testing

```typescript
// Mock Supabase
vi.mocked(supabaseServer.from).mockReturnValue({
  select: vi.fn().mockReturnValue({
    eq: vi.fn().mockResolvedValue({ data: mockPlants, error: null }),
  }),
} as any);

// Call function
const result = await getUserPlants(userId);

// Verify result
expect(result).toHaveLength(2);
```

### Error Handling

```typescript
// Mock error response
vi.mocked(supabaseServer.from).mockReturnValue({
  select: vi.fn().mockReturnValue({
    eq: vi.fn().mockResolvedValue({ data: null, error: new Error('DB Error') }),
  }),
} as any);

// Call and verify error handling
const result = await getUserPlants(userId);
expect(result).toEqual([]);
```

---

## Success Criteria

- [x] Vitest configured and working
- [x] React Testing Library set up
- [x] Test setup file created
- [x] Package.json updated with test scripts
- [x] Can run `yarn test` successfully
- [ ] All factories created
- [ ] All component tests written
- [ ] All utility tests written
- [ ] Coverage report shows 75-85% overall
- [ ] All tests pass
- [ ] CI/CD integration ready

---

## Files to Create/Modify

### Create (New)

- `vitest.config.ts`
- `app/__tests__/setup.ts`
- `app/__tests__/factories.ts`
- `app/components/__tests__/factories.ts`
- `app/lib/__tests__/factories.ts`
- `app/components/__tests__/*.test.tsx` (multiple)
- `app/lib/__tests__/*.server.test.ts` (multiple)
- `app/hooks/__tests__/*.test.ts` (if hooks exist)

### Modify

- `package.json` (add dependencies and scripts)
- `tsconfig.json` (add vitest types)

---

## Estimated Effort

| Phase   | Task                 | Effort      |
| ------- | -------------------- | ----------- |
| 1       | Infrastructure setup | 1 hour      |
| 2       | Factory functions    | 1.5 hours   |
| 3.1     | Core UI components   | 2 hours     |
| 3.2     | Phase 2 components   | 4-5 hours   |
| 3.3     | Hooks                | 0.5 hours   |
| 4.1-4.5 | Server utilities     | 3-4 hours   |
| Total   | All phases           | 12-14 hours |

---

## Notes

- AI agents should follow TESTING_RULES.md when generating tests
- Tests should be generated incrementally, not all at once
- Run coverage reports after each phase to track progress
- Prioritize high-risk components (forms, data mutations, auth)
- Keep mocks focused and maintainable
- Review tests for brittleness and update as component implementation changes
