# Integration Testing Plan - Phase 3: Watering Notification System

## Overview

This document outlines integration tests for the Phase 3 watering notification system. These tests verify that multiple components work together correctly across the full feature stack.

## Testing Strategy

**Integration Tests** test multiple components/systems together:
- API endpoints with server functions
- Components with route loaders/actions
- UI interactions with data fetching
- Modal operations with state management
- Cross-component data flow

**Test Framework**: Vitest + React Testing Library with `createMemoryRouter`

**Key Tools**:
```bash
yarn test                # Run all tests
yarn test:watch        # Watch mode
yarn test:ui          # Visual UI
yarn test:coverage    # Coverage report
```

---

## Integration Test Categories

### 1. API Endpoint Integration Tests
Tests that verify API routes work with their underlying server functions.

#### Test Suite: `api.notifications.integration.test.ts`

**Purpose**: Verify notification API endpoint correctly fetches and returns plant data.

**Tests**:

```typescript
describe('Notifications API Integration', () => {
  // Setup: Create test database state with plants needing water
  // Mock: Only Supabase, not getPlantsNeedingWater itself

  it('should return all plants needing water for authenticated user', async () => {
    // Create 3 test plants with watering_frequency_days set
    // Set last watering dates so some are overdue
    // Call loader
    // Assert returned array includes all overdue plants
    // Assert days_overdue calculated correctly
  });

  it('should return empty array for user with no overdue plants', async () => {
    // Create user with plants all watered recently
    // Call loader
    // Assert empty notifications array
  });

  it('should reject unauthenticated requests', async () => {
    // Call loader with request missing auth cookie
    // Assert requireAuth throws or redirects
  });

  it('should handle database errors gracefully', async () => {
    // Mock Supabase to throw connection error
    // Call loader
    // Assert returns empty notifications instead of throwing
  });

  it('should sort plants by days_overdue descending', async () => {
    // Create plants with days_overdue: [-1, 0, 2, 5, -3]
    // Call loader
    // Assert returned array is sorted: [5, 2, 0, -1, -3]
  });

  it('should include all required fields in response', async () => {
    // Create test plant
    // Call loader
    // Assert each notification has: plant_id, plant_name, photo_url,
    //   last_watered, next_watering, days_overdue
  });

  it('should handle null photo_url correctly', async () => {
    // Create plant without photo
    // Call loader
    // Assert photo_url is null, not undefined
  });

  it('should use correct date format in response', async () => {
    // Create plant with known watering date
    // Call loader
    // Assert dates are ISO strings
  });

  it('should handle timezone-aware dates correctly', async () => {
    // Test with dates across multiple timezones
    // Verify days_overdue calculation is timezone-aware
  });
});
```

---

#### Test Suite: `api.water.integration.test.ts`

**Purpose**: Verify watering action endpoint correctly records waterings and updates database state.

**Tests**:

```typescript
describe('Water Plant API Integration', () => {
  // Setup: Create test user, plant, and watering history
  // Mock: Only Supabase, not recordWatering itself

  it('should record watering and update watering_history table', async () => {
    // Create test plant
    // Call action with POST
    // Query watering_history table
    // Assert new record exists with correct plant_id and user_id
    // Assert created_at is recent
  });

  it('should calculate next_watering_date after recording', async () => {
    // Create plant with watering_frequency_days = 7
    // Record watering on Jan 20
    // Query plants table
    // Assert next_watering_date calculated as Jan 27
  });

  it('should reject watering if user does not own plant', async () => {
    // Create plant owned by user-123
    // Call action authenticated as user-456
    // Assert returns "Plant not found" error
    // Assert watering not recorded
  });

  it('should reject non-POST requests', async () => {
    // Call action with GET, PUT, DELETE
    // Assert all return "Method not allowed"
  });

  it('should prevent double-watering in quick succession', async () => {
    // Record watering at 10:00
    // Immediately attempt to water again
    // Should succeed (no duplicate prevention)
    // But next_watering should be recalculated from new timestamp
  });

  it('should update last_watered field on plant record', async () => {
    // Record watering
    // Query plants table
    // Assert last_watered_date updated to current time
  });

  it('should handle plants with different watering frequencies', async () => {
    // Create plants: freq_1d (1 day), freq_30d (30 days), freq_365d (365 days)
    // Record watering for each
    // Verify next_watering calculated correctly for each:
    //   - now + 1 day
    //   - now + 30 days
    //   - now + 365 days
  });

  it('should return success response with correct plantId', async () => {
    // Call action
    // Assert response is JSON
    // Assert response.success === true
    // Assert response.plantId matches input
  });

  it('should create audit trail of watering events', async () => {
    // Record watering
    // Query watering_history with plant_id
    // Assert correct event recorded
    // Repeat with second watering
    // Assert both events in history
  });
});
```

---

### 2. Component-to-Route Integration Tests
Tests that verify components correctly interact with route loaders/actions.

#### Test Suite: `NotificationsModal.integration.test.tsx`

**Purpose**: Verify modal works with actual route data and actions.

**Tests**:

```typescript
describe('NotificationsModal with Route Integration', () => {
  // Setup: Create memory router with mocked data
  // Load: Simulate loader returning notifications

  it('should display notifications from route loader data', async () => {
    // Create router with mocked loader returning 3 plants
    // Render modal with loader data
    // Assert all 3 plants displayed
    // Assert correct names and status
  });

  it('should trigger watering action when "Watered" clicked', async () => {
    // Setup router with watering action
    // Render modal
    // Click "Watered" button
    // Assert POST sent to /api/water/{plantId}
    // Verify action executed
  });

  it('should handle action loading state', async () => {
    // Click "Watered" button
    // Assert button becomes disabled during loading
    // Wait for action to complete
    // Assert button re-enables
  });

  it('should update notifications after successful watering', async () => {
    // Initial notifications: 2 plants
    // Click "Watered" on first plant
    // Assert plant removed from modal immediately (optimistic)
    // Wait for action to complete
    // Assert notification count decremented
  });

  it('should revert optimistic update on error', async () => {
    // Setup action to throw error
    // Click "Watered" button
    // Wait for action to fail
    // Assert plant still visible in modal
    // Assert error message shown
  });

  it('should navigate to plant detail when plant name clicked', async () => {
    // Render modal
    // Click plant name link
    // Assert router navigated to /dashboard/plants/{plantId}
    // Assert modal closes
  });

  it('should support keyboard navigation', async () => {
    // Open modal
    // Press Tab to focus elements
    // Verify all buttons and links are keyboard accessible
    // Press Escape to close
  });

  it('should handle rapid multiple waterings', async () => {
    // Have 5 plants in modal
    // Quickly click "Watered" on plants 1, 2, 3
    // Assert all removed from list optimistically
    // Assert actions queued and executed
    // Assert all 3 plants removed after actions complete
  });
});
```

---

### 3. Navigation-to-Modal Integration Tests
Tests that verify navigation component correctly manages notifications.

#### Test Suite: `Navigation.notifications.integration.test.tsx`

**Purpose**: Verify nav bell icon and modal work together correctly.

**Tests**:

```typescript
describe('Navigation to Notifications Modal Integration', () => {
  // Setup: Memory router with full dashboard setup
  // Auth: Mock authenticated user

  it('should load notifications when nav mounts', async () => {
    // Render nav component on authenticated page
    // Wait for initial fetch
    // Assert /api/notifications called
    // Assert badge shows count
  });

  it('should update badge count on first load', async () => {
    // Mock API returning 3 plants needing water
    // Render nav
    // Wait for fetch
    // Assert badge shows "3"
  });

  it('should show no badge when no notifications', async () => {
    // Mock API returning empty array
    // Render nav
    // Wait for fetch
    // Assert no badge visible
  });

  it('should open modal when bell icon clicked', async () => {
    // Render nav with notifications
    // Click bell icon
    // Assert NotificationsModal rendered with open={true}
    // Assert list of plants visible
  });

  it('should refresh notifications when modal opens', async () => {
    // Mock API returning 2 plants initially
    // Render nav
    // Wait for initial load
    // Assert badge shows "2"
    // Change mock to return 3 plants
    // Click bell to open modal
    // Assert /api/notifications called again
    // Assert modal shows 3 plants (latest data)
  });

  it('should update badge after watering from modal', async () => {
    // Start with 3 plants needing water
    // Render nav with badge showing "3"
    // Click bell to open modal
    // Click "Watered" on first plant
    // Wait for action to complete
    // Assert badge updates to "2"
  });

  it('should refetch notifications after each watering', async () => {
    // Water first plant from modal
    // Wait for action
    // Assert /api/notifications called again
    // Assert notification list updated
  });

  it('should work across route navigation', async () => {
    // Render nav
    // Load notifications (3 plants)
    // Navigate to /dashboard/plants/{id}
    // Navigate back
    // Assert badge still shows count
    // Assert notifications still available
  });

  it('should persist notifications while modal is open', async () => {
    // Load notifications
    // Click bell to open modal
    // Wait 5 seconds
    // Assert modal still shows same data
    // Assert no automatic refresh while open
  });

  it('should handle network errors gracefully', async () => {
    // Mock API to return error
    // Render nav
    // Wait for fetch
    // Assert badge doesn't show (graceful fallback)
    // Assert no error displayed to user
  });

  it('should support theme toggle while modal is open', async () => {
    // Render nav and open modal
    // Click theme toggle button
    // Assert modal remains open
    // Assert dark mode applied to modal
  });
});
```

---

### 4. Full Feature Flow Integration Tests
End-to-end tests verifying the complete notification feature workflow.

#### Test Suite: `watering.notifications.e2e.integration.test.tsx`

**Purpose**: Test complete user flows for the notification system.

**Tests**:

```typescript
describe('Complete Watering Notification Feature Flow', () => {
  // Setup: Create authenticated user with multiple plants
  // Some plants overdue, some due today, some not due

  describe('Viewing Notifications', () => {
    it('should see notification badge on dashboard', async () => {
      // Login as test user
      // Navigate to dashboard
      // Assert bell icon visible with count badge
      // Assert count = number of overdue plants
    });

    it('should view all overdue plants in modal', async () => {
      // Click bell icon
      // Assert modal shows all plants needing water
      // Assert plants sorted by most overdue first
      // Assert colors correct (red/amber)
    });

    it('should see empty state when all plants watered', async () => {
      // Setup: All plants watered recently
      // Navigate to dashboard
      // Assert bell icon visible but no badge
      // Click bell
      // Assert "All caught up! 🌱" message
    });
  });

  describe('Watering Plants from Notification', () => {
    it('should water single plant from modal', async () => {
      // Open notifications modal
      // Click "Watered" on first plant
      // Assert plant disappears from list (optimistic)
      // Assert badge count decrements
      // Assert plant no longer in next notification fetch
    });

    it('should water multiple plants in sequence', async () => {
      // Open modal with 3 plants
      // Water plant 1 → plant disappears
      // Water plant 2 → plant disappears
      // Water plant 3 → empty state shown
      // Assert all 3 watering records created in database
    });

    it('should navigate to plant detail from notification', async () => {
      // Open notifications modal
      // Click plant name
      // Assert navigated to /dashboard/plants/{id}
      // Assert modal closed
      // Assert plant detail page shows watering history updated
    });

    it('should show success feedback after watering', async () => {
      // Water plant from modal
      // Wait for action to complete
      // Assert no error shown
      // Assert plant removed from list
      // Assert badge updated
    });

    it('should handle watering errors gracefully', async () => {
      // Setup action to fail
      // Water plant
      // Assert error message shown
      // Assert plant remains in list
      // Assert badge not updated
    });
  });

  describe('Notification Updates', () => {
    it('should add plant to notifications when due', async () => {
      // Setup: Plant next_watering = tomorrow
      // Initial notifications don't include plant
      // Move date forward to make plant due
      // Refresh notifications
      // Assert plant now appears in notifications
    });

    it('should remove plant from notifications when watered', async () => {
      // Plant is in notifications (overdue by 2 days)
      // Water the plant
      // Assert plant immediately disappears from modal
      // Fetch notifications again
      // Assert plant not in list
    });

    it('should update overdue count after watering', async () => {
      // Plant is overdue by 5 days
      // Display in modal showing "Overdue by 5 days"
      // Water the plant
      // Assert status changes to "Due in 7 days" or similar
      // Assert plant removed (if now in future)
    });

    it('should reflect database changes in UI', async () => {
      // Setup: 3 overdue plants
      // Modal shows all 3
      // External process waters plant 1 in database
      // Refresh notifications
      // Assert only 2 plants shown
      // Assert correct plants displayed
    });
  });

  describe('Cross-Feature Integration', () => {
    it('should work with theme switching', async () => {
      // Open notifications modal
      // Toggle dark mode
      // Assert modal styled correctly in dark mode
      // Assert colors remain readable
    });

    it('should work with other dashboard features', async () => {
      // Navigate: Home → Dashboard → Click Plant Detail → Back → Modal
      // Assert navigation works correctly
      // Assert notifications persist
    });

    it('should handle rapid bell clicks', async () => {
      // Click bell icon 5 times rapidly
      // Assert modal doesn't open multiple times
      // Assert no errors or crashes
    });

    it('should maintain notification state across modal open/close', async () => {
      // Load notifications (3 plants)
      // Open modal
      // Close modal
      // Reopen modal
      // Assert still shows same 3 plants
    });

    it('should work with user logout', async () => {
      // Have notifications loaded
      // Click logout
      // Assert bell icon disappears
      // Assert modal not rendered
      // Assert redirected to login
    });
  });

  describe('Performance Integration', () => {
    it('should handle 50+ overdue plants', async () => {
      // Setup user with 50 plants all overdue
      // Load notifications
      // Assert all 50 plants displayed in modal
      // Assert scrolling works
      // Assert performance acceptable
    });

    it('should not refetch unnecessarily', async () => {
      // Load notifications (track API calls)
      // Open modal → refetch
      // Navigate away and back → refetch
      // Manually water plant → refetch
      // Wait 10 seconds → no additional fetch
      // Assert only 3 total fetches
    });

    it('should debounce rapid watering actions', async () => {
      // Have 3 plants in modal
      // Click "Watered" on all 3 in rapid succession
      // Assert actions queued and executed sequentially
      // Assert no race conditions
    });
  });

  describe('Data Integrity', () => {
    it('should record correct watering timestamps', async () => {
      // Water plant from modal
      // Check watering_history record
      // Assert watered_at is current time (within 1 second)
    });

    it('should prevent orphaned watering records', async () => {
      // Water a plant
      // Delete the plant from database
      // Query watering_history
      // Assert record still exists (referential integrity)
    });

    it('should calculate days_overdue correctly', async () => {
      // Plant: frequency_days = 7, last_watered = 10 days ago
      // Assert days_overdue = 3
      // Plant: frequency_days = 30, last_watered = 28 days ago
      // Assert days_overdue = -2 (not yet due)
    });

    it('should handle edge case dates', async () => {
      // Test leap year dates
      // Test year boundary dates
      // Test month boundary dates
      // Assert calculations correct
    });
  });
});
```

---

### 5. Error Scenario Integration Tests
Tests for error conditions and edge cases.

#### Test Suite: `watering.notifications.errors.integration.test.ts`

**Purpose**: Verify system handles errors gracefully.

**Tests**:

```typescript
describe('Notification System Error Scenarios', () => {
  it('should handle API timeout gracefully', async () => {
    // Mock API to take 30s
    // Render nav
    // Assert doesn't hang
    // Assert eventually shows error state or empty
  });

  it('should recover from temporary network failure', async () => {
    // First fetch: fails
    // User opens modal
    // Second fetch: succeeds
    // Assert modal shows correct data
  });

  it('should handle missing plant data gracefully', async () => {
    // Setup: Database inconsistency (watering_history orphan)
    // Fetch notifications
    // Assert no crash
    // Assert graceful degradation
  });

  it('should handle concurrent watering attempts', async () => {
    // User clicks "Watered" twice very quickly
    // Both requests sent
    // Assert both recorded
    // Assert no UI corruption
  });

  it('should handle invalid plant IDs in params', async () => {
    // Call action with invalid UUID
    // Assert returns error
    // Assert safe error message
  });

  it('should handle user deletion during modal open', async () => {
    // Modal is open
    // User is deleted from database
    // Water a plant
    // Assert handles gracefully (likely auth error)
  });

  it('should handle plant deletion while modal open', async () => {
    // Modal shows plant
    // Plant deleted from database
    // Click "Watered"
    // Assert handles "Plant not found" error
    // Assert plant removed from modal
  });

  it('should handle database constraint violations', async () => {
    // Setup: Add invalid data
    // Trigger constraint violation during watering
    // Assert error handled
    // Assert clear message to user
  });
});
```

---

## Test Implementation Examples

### Example 1: Complete Feature Flow Test

```typescript
describe('User Waters Plant from Notification', () => {
  it('should update UI and database end-to-end', async () => {
    // SETUP
    const testUser = await createTestUser();
    const plant = await createTestPlant(testUser.id, {
      last_watered: daysBefore(5),
      frequency_days: 3
    });

    // RENDER
    const router = createMemoryRouter([...routes], {
      initialEntries: ['/dashboard'],
      initialIndex: 0,
    });
    render(<RouterProvider router={router} />);
    await waitForLoadingToFinish();

    // VERIFY INITIAL STATE
    const bellButton = screen.getByRole('button', { name: /notifications/i });
    expect(bellButton).toBeInTheDocument();
    expect(within(bellButton).getByText('1')).toBeInTheDocument();

    // INTERACT: Open modal
    await userEvent.click(bellButton);
    await waitFor(() => {
      expect(screen.getByText(plant.name)).toBeInTheDocument();
    });

    // INTERACT: Water plant
    const wateredButton = screen.getByRole('button', { name: /watered/i });
    await userEvent.click(wateredButton);

    // VERIFY OPTIMISTIC UPDATE
    expect(screen.queryByText(plant.name)).not.toBeInTheDocument();
    expect(within(bellButton).queryByText('1')).not.toBeInTheDocument();

    // VERIFY DATABASE
    await waitFor(() => {
      const watering = queryWateringHistory(plant.id);
      expect(watering).toBeDefined();
    });
  });
});
```

### Example 2: Error Scenario Test

```typescript
describe('Handling Watering Errors', () => {
  it('should revert optimistic update on failure', async () => {
    // Mock action to fail
    mockAction('water', () => ({ error: 'Database error' }));

    const { getByRole, getByText, queryByText } = render(
      <NotificationsModal
        open={true}
        notifications={[mockPlant]}
        onWatered={handleWatered}
      />
    );

    // Water plant
    await userEvent.click(getByRole('button', { name: /watered/i }));

    // Plant removed optimistically
    expect(queryByText(mockPlant.name)).not.toBeInTheDocument();

    // Wait for action to fail and revert
    await waitFor(() => {
      expect(getByText(mockPlant.name)).toBeInTheDocument();
    });

    // Error message shown
    expect(getByText(/error/i)).toBeInTheDocument();
  });
});
```

---

## Running Integration Tests

```bash
# Run all integration tests
yarn test -- integration.test

# Run specific suite
yarn test -- watering.notifications.e2e.integration.test

# Run with coverage
yarn test:coverage -- integration.test

# Watch mode
yarn test:watch -- integration.test

# Visual UI
yarn test:ui -- integration.test
```

---

## Test Data Fixtures

**Location**: `app/__tests__/fixtures/notifications.fixtures.ts`

```typescript
export function createNotificationTestScenarios() {
  return {
    noPlantsDue: [],
    onePlantOverdue: [createMockPlant({ days_overdue: 2 })],
    mixedOverdueAndDue: [
      createMockPlant({ days_overdue: 5 }),
      createMockPlant({ days_overdue: 0 }),
      createMockPlant({ days_overdue: -3 }),
    ],
    manyPlants: Array(50).fill(null).map(() => createMockPlant()),
  };
}

export async function setupNotificationScenario(scenario: string) {
  const user = await createTestUser();
  const plants = scenarios[scenario];

  for (const plant of plants) {
    await createTestPlant(user.id, plant);
  }

  return { user, plants };
}
```

---

## Coverage Goals

**Integration Test Coverage Targets**:
- API endpoint integration: 90%+
- Component-route integration: 85%+
- Full feature flows: 80%+
- Error scenarios: 75%+

**Overall Integration Coverage**: 85%+

---

## CI/CD Integration

**GitHub Actions Workflow** (`.github/workflows/test.yml`):
```yaml
- name: Run Integration Tests
  run: yarn test -- integration.test

- name: Upload Coverage
  uses: codecov/codecov-action@v3
  with:
    files: ./coverage/coverage-final.json
    flags: integration
```

---

## Maintenance

**When to Update Integration Tests**:
1. Adding new features to watering system
2. Changing API response format
3. Modifying notification modal layout
4. Updating route structure
5. Adding new error scenarios

**Test Review Checklist**:
- [ ] Tests cover happy path
- [ ] Tests cover error cases
- [ ] Tests cover edge cases
- [ ] Tests are independent
- [ ] No hardcoded timeouts (use waitFor)
- [ ] Proper cleanup after each test
- [ ] Clear test descriptions
- [ ] Assertion messages are specific

---

## Summary

This integration testing plan provides comprehensive coverage of the watering notification system across:

1. **API Integration** - Endpoint → Server Functions → Database
2. **Component Integration** - Components → Routes → Data
3. **Feature Flows** - User workflows end-to-end
4. **Error Scenarios** - Graceful degradation
5. **Performance** - Load testing with many records

Total estimated: **50+ integration tests** providing high confidence in system reliability.
