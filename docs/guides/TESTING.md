# Testing Guide - Flor.io

## Overview

Flor.io uses **Vitest** for unit and integration testing with **@testing-library/react** for component testing. The test suite covers:

- **Unit tests**: Pure functions, server utilities, validation logic
- **Component tests**: React components with user interactions
- **Integration tests**: API routes and multi-step workflows
- **Coverage target**: >80% overall, >85% for critical utilities

## Quick Start

### Running Tests

```bash
# Run all tests once
yarn test

# Run tests in watch mode (rerun on file changes)
yarn test:watch

# Open Vitest UI dashboard (visual interface)
yarn test:ui

# Generate coverage report
yarn test:coverage
```

### Test Files Location

All test files follow this structure:

```
app/
├── components/
│   └── __tests__/
│       ├── ComponentName.test.tsx
│       └── ComponentName.integration.test.tsx
├── lib/
│   └── __tests__/
│       ├── module.server.test.ts
│       └── module.test.ts
└── routes/
    └── __tests__/
        └── route-name.test.ts
```

## Test Categories

### 1. Component Tests

**Location**: `app/components/__tests__/*.test.tsx`

**Pattern**: Test user-facing behavior, not implementation

**Example**:

```typescript
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PlantCard } from "../plant-card";

describe("PlantCard", () => {
  it("should navigate to plant details when clicked", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <PlantCard plant={mockPlant} />
      </MemoryRouter>
    );

    const link = screen.getByRole("link");
    await user.click(link);
    expect(link).toHaveAttribute("href", "/dashboard/plants/plant-1");
  });
});
```

### 2. Server Function Tests

**Location**: `app/lib/__tests__/*.server.test.ts`

**Pattern**: Test with mocked Supabase, file systems, etc.

**Example**:

```typescript
import { createAIPlant } from '../plants.server';
import { supabaseServer } from '../supabase.server';

vi.mock('../supabase.server', () => ({
  supabaseServer: {
    from: vi.fn(),
  },
}));

describe('createAIPlant', () => {
  it('should create plant with AI flag', async () => {
    vi.mocked(supabaseServer).from = vi.fn(() => ({
      insert: vi.fn().mockResolvedValue({
        data: { id: 'plant-1' },
        error: null,
      }),
    }));

    const result = await createAIPlant('user-123', { name: 'Monstera' });
    expect(result.id).toBe('plant-1');
  });
});
```

### 3. Route/Integration Tests

**Location**: `app/routes/__tests__/*.test.ts`

**Pattern**: Test loader and action functions

**Example**:

```typescript
import { loader } from '../dashboard.plants.$plantId';

describe('plant details loader', () => {
  it('should fetch plant by ID', async () => {
    const data = await loader({
      request: new Request('http://localhost/dashboard/plants/plant-1'),
      params: { plantId: 'plant-1' },
    } as any);

    expect(data.plant.id).toBe('plant-1');
  });
});
```

## Writing Tests

### Best Practices

1. **Test user behavior, not implementation**

   ```typescript
   // ✅ Good: Test what user sees
   expect(screen.getByRole('button', { name: /watered/i })).toBeInTheDocument();

   // ❌ Bad: Test internal state
   expect(component.state.isLoading).toBe(false);
   ```

2. **Use meaningful test descriptions**

   ```typescript
   // ✅ Good
   it('should disable watering button while loading', () => {});

   // ❌ Bad
   it('should work', () => {});
   ```

3. **Use factory functions for test data**

   ```typescript
   import { createMockPlant } from '~/test/factories';

   const plant = createMockPlant({ name: 'Monstera' });
   ```

4. **Test error cases**

   ```typescript
   it('should show error when plant creation fails', async () => {
     vi.mocked(supabaseServer).from = vi.fn(() => ({
       insert: vi.fn().mockResolvedValue({
         data: null,
         error: { message: 'Database error' },
       }),
     }));

     expect(await createPlant(data)).toThrow('Database error');
   });
   ```

5. **Clean up after tests**
   ```typescript
   beforeEach(() => {
     vi.clearAllMocks(); // Reset mocks
     // Component cleanup is automatic with Testing Library
   });
   ```

### Using Factory Functions

Factory functions in `app/__tests__/factories.ts` create consistent test data:

```typescript
import { createMockPlant, createMockRoom, createMockWateringHistory } from '~/test/factories';

const plant = createMockPlant({
  id: 'plant-1',
  name: 'Snake Plant',
  watering_frequency_days: 7,
});

const room = createMockRoom({ name: 'Living Room' });

const watering = createMockWateringHistory({
  plant_id: 'plant-1',
  watered_at: new Date('2025-01-15'),
});
```

### Mocking Supabase

Standard mock setup for server tests:

```typescript
vi.mock('~/lib/supabase.server', () => ({
  supabaseServer: {
    from: vi.fn(),
    rpc: vi.fn(),
  },
}));

// In test:
vi.mocked(supabaseServer).from = vi.fn(() => ({
  select: vi.fn(() => ({
    eq: vi.fn(() => ({
      single: vi.fn().mockResolvedValue({
        data: { id: '1', name: 'Plant' },
        error: null,
      }),
    })),
  })),
}));
```

### Mocking Components

For component dependencies:

```typescript
vi.mock("~/components/expensive-component", () => ({
  ExpensiveComponent: () => <div>Mock Component</div>,
}));
```

## Coverage Targets

### Overall Coverage

- **Statements**: >80%
- **Branches**: >75%
- **Functions**: >80%
- **Lines**: >80%

### By File Type

| Type             | Target |
| ---------------- | ------ |
| Server utilities | >85%   |
| React components | >80%   |
| Route handlers   | >75%   |
| Type definitions | N/A    |
| Error boundaries | >70%   |

### Viewing Coverage Report

```bash
yarn test:coverage
open coverage/index.html
```

This opens an HTML report showing:

- Overall coverage percentage
- Line-by-line coverage in each file
- Uncovered branches and conditions

## Common Test Patterns

### Testing Form Submission

```typescript
it("should submit form with plant data", async () => {
  const user = userEvent.setup();
  render(<CreatePlantForm />);

  const nameInput = screen.getByLabelText("Plant name");
  await user.type(nameInput, "Monstera");

  const submitButton = screen.getByRole("button", { name: /create/i });
  await user.click(submitButton);

  expect(mockSubmit).toHaveBeenCalledWith(
    expect.objectContaining({ name: "Monstera" })
  );
});
```

### Testing Navigation

```typescript
it("should navigate to plant details on link click", async () => {
  const user = userEvent.setup();
  render(
    <MemoryRouter>
      <PlantCard plant={mockPlant} />
    </MemoryRouter>
  );

  const link = screen.getByRole("link");
  await user.click(link);

  // React Router updates URL internally
  expect(link).toHaveAttribute("href", "/dashboard/plants/plant-1");
});
```

### Testing Loading States

```typescript
it("should show loading spinner during submission", async () => {
  const user = userEvent.setup();
  render(<CreatePlantForm />);

  const submitButton = screen.getByRole("button", { name: /create/i });
  await user.click(submitButton);

  // Should show loading immediately
  expect(screen.getByRole("progressbar")).toBeInTheDocument();

  // Wait for submission to complete
  await waitFor(() => {
    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
  });
});
```

### Testing Error Messages

```typescript
it("should display validation error for empty name", async () => {
  const user = userEvent.setup();
  render(<CreatePlantForm />);

  const submitButton = screen.getByRole("button", { name: /create/i });
  await user.click(submitButton);

  expect(screen.getByText("Plant name is required")).toBeInTheDocument();
});
```

## Async Testing

Always wait for async operations:

```typescript
import { waitFor } from "@testing-library/react";

it("should load notifications when opened", async () => {
  render(<NotificationsModal open={true} />);

  // Wait for data to load
  await waitFor(() => {
    expect(screen.getByText("Monstera")).toBeInTheDocument();
  });
});
```

## Debugging Tests

### See What's Rendered

```typescript
import { screen, debug } from "@testing-library/react";

render(<Component />);
debug(); // Prints DOM to console
screen.logTestingPlaygroundURL(); // Generates query selectors
```

### Use Test UI Dashboard

```bash
yarn test:ui
```

This opens a visual dashboard where you can:

- See tests organized by file
- Click to re-run individual tests
- See real-time coverage
- Filter by test status (passing/failing)

### Check TypeScript Errors

```bash
yarn typecheck
```

## CI/CD Integration

Tests run automatically on:

- Every push to any branch
- Every pull request
- Before deployment to production

**GitHub Actions workflow**: `.github/workflows/test.yml`

Run locally to verify before pushing:

```bash
yarn test    # Run all tests
yarn build   # Check TypeScript compilation
```

## Test Performance

Current test execution time: ~35-40 seconds for 544 tests

### Optimization Tips

1. **Run specific test file** instead of all:

   ```bash
   yarn test app/components/__tests__/PlantCard.test.tsx
   ```

2. **Run tests matching pattern**:

   ```bash
   yarn test --grep "watering"
   ```

3. **Run in watch mode** for development:
   ```bash
   yarn test:watch
   ```

## Troubleshooting

### "Cannot find module" Errors

**Problem**: Tests can't import components/utilities

**Solution**: Check that module paths use `~` alias

```typescript
// ✅ Correct
import { Component } from "~/components/component";

// ❌ Wrong
import { Component } from "../../../components/component";
```

### Mock Not Working

**Problem**: Mock isn't being used in tests

**Checklist**:

- [ ] `vi.mock()` is at top of test file (before imports)
- [ ] Module name matches exactly
- [ ] Return value includes all exports
- [ ] `vi.clearAllMocks()` in `beforeEach`

### Duplicate Key Warnings

**Problem**: React warning "Encountered two children with the same key"

**Solution**: Ensure list items have unique keys

```typescript
// ✅ Good
{plants.map((plant) => (
  <div key={plant.id}>{plant.name}</div>
))}

// ❌ Bad - Duplicate keys
{plants.map((plant, index) => (
  <div key={index}>{plant.name}</div>
))}
```

### Timeout Errors

**Problem**: "Timeout of 5000ms exceeded"

**Solution**: Increase timeout or fix async issues

```typescript
it("should load data", async () => {
  render(<Component />);

  // Increase timeout if needed
  await waitFor(() => {
    expect(screen.getByText("Loaded")).toBeInTheDocument();
  }, { timeout: 3000 });
}, 10000); // Increase test timeout
```

## Resources

- **Vitest Docs**: https://vitest.dev/
- **Testing Library Docs**: https://testing-library.com/docs/react-testing-library/intro/
- **Testing Playground**: https://testing-playground.com/

## Questions?

Refer to specific test files for examples:

- Component tests: `app/components/__tests__/PlantCard.test.tsx`
- Server tests: `app/lib/__tests__/plants.server.test.ts`
- Route tests: `app/routes/__tests__/dashboard.plants.new-ai.integration.test.ts`

---

**Last Updated**: January 30, 2026
**Current Test Status**: 544/544 tests passing (100%)
