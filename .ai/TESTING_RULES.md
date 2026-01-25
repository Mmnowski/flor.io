# Testing Rules for Flor.io Project

## Overview
Testing framework: **Vitest + React Testing Library**
Coverage target: **70-85%** (good coverage)
Mocking strategy: **Strategic mocking** (mock external deps, test real logic)
Test scope: **Components + utilities** (React components AND server utilities)

---

## 1. File Organization & Naming Conventions

### Test File Locations
- Component tests: `app/components/__tests__/{ComponentName}.test.tsx`
- Hook tests: `app/hooks/__tests__/{hookName}.test.ts`
- Server utility tests: `app/lib/__tests__/{utilityName}.server.test.ts`
- Route tests: `app/routes/__tests__/{routeName}.test.tsx`
- Type tests: `app/types/__tests__/{typeName}.test.ts`

### Test File Naming
- Single component: `PlantCard.test.tsx` (mirrors source file name)
- Multiple related tests in file: `components.test.tsx`
- Utilities: `plants.server.test.ts` (mirrors server utility)

### Test Structure
```typescript
// 1. Imports (organized: external, internal, types)
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';

// 2. Test describe block (file level, feature level)
describe('PlantCard Component', () => {
  // 3. Setup/teardown
  beforeEach(() => {
    // Setup
  });

  // 4. Individual test cases
  describe('rendering', () => {
    it('should render plant name', () => {
      // Test body
    });
  });

  // 5. Related test groups
  describe('watering status display', () => {
    it('should show red background when overdue', () => {
      // Test body
    });
  });
});
```

---

## 2. Component Testing Rules

### What to Test
✅ **DO TEST:**
- Rendering with different props
- User interactions (clicks, form input, selection)
- Conditional rendering based on props/state
- Error states and error messages
- Accessibility attributes (aria-labels, roles)
- Integration with passed-in callbacks
- Dark mode support (if applicable)

❌ **DON'T TEST:**
- Third-party library internals (e.g., Radix UI Dialog internals)
- Exact CSS class names (test behavior, not styles)
- Implementation details (internal state that doesn't affect output)
- External library behavior (just verify it's called correctly)

### Component Test Template
```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PlantCard } from '~/components/plant-card';
import type { PlantWithWatering } from '~/types/plant.types';

describe('PlantCard', () => {
  const mockPlant: PlantWithWatering = {
    id: '1',
    name: 'Monstera',
    // ... other required fields
  };

  it('should render plant name', () => {
    render(<PlantCard plant={mockPlant} />);
    expect(screen.getByText('Monstera')).toBeInTheDocument();
  });

  it('should handle click navigation', async () => {
    const user = userEvent.setup();
    render(<PlantCard plant={mockPlant} />);

    const link = screen.getByRole('link');
    await user.click(link);

    expect(link).toHaveAttribute('href', `/dashboard/plants/${mockPlant.id}`);
  });

  describe('watering status', () => {
    it('should display overdue status with red styling', () => {
      const overdidPlant = { ...mockPlant, is_overdue: true };
      render(<PlantCard plant={overdidPlant} />);

      const status = screen.getByText(/overdue/i);
      expect(status).toHaveClass('bg-red-100');
    });
  });
});
```

### React Router Component Testing
For components used in routes, wrap with Router context:
```typescript
import { MemoryRouter } from 'react-router';

it('should render within router context', () => {
  render(
    <MemoryRouter>
      <PlantCard plant={mockPlant} />
    </MemoryRouter>
  );
  // Test
});
```

---

## 3. Server Utility Testing Rules

### What to Test
✅ **DO TEST:**
- Function inputs and outputs (happy path)
- Error handling and error messages
- Ownership/permission verification (security)
- Data transformation and validation
- Edge cases (empty arrays, null values, etc.)
- Correct Supabase queries are called with right params
- Async behavior and promise resolution

❌ **DON'T TEST:**
- Supabase library internals (just mock and verify it's called)
- Exact SQL queries (mock at API level)
- Database schema details (mock Supabase responses)
- Network latency or timeouts (use short timeouts in tests)

### Server Utility Test Template
```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getUserPlants } from '~/lib/plants.server';
import * as supabaseServer from '~/lib/supabase.server';

// Mock the Supabase client
vi.mock('~/lib/supabase.server', () => ({
  supabaseServer: {
    from: vi.fn(),
    rpc: vi.fn(),
  },
}));

describe('getUserPlants', () => {
  const mockUserId = 'user-123';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch plants for user', async () => {
    const mockPlants = [
      { id: '1', name: 'Plant 1', user_id: mockUserId },
      { id: '2', name: 'Plant 2', user_id: mockUserId },
    ];

    // Mock Supabase response
    vi.mocked(supabaseServer.supabaseServer.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: mockPlants, error: null }),
      }),
    } as any);

    const result = await getUserPlants(mockUserId);

    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('Plant 1');
  });

  it('should filter by roomId when provided', async () => {
    // Test filtering logic
  });

  it('should return empty array on error', async () => {
    // Mock error response
    const result = await getUserPlants(mockUserId);
    expect(result).toEqual([]);
  });

  describe('security', () => {
    it('should verify user ownership before returning plants', async () => {
      // Ensure user_id is checked in query
    });
  });
});
```

---

## 4. Hook Testing Rules

### What to Test
✅ **DO TEST:**
- State changes and updates
- Effects (mounting, unmounting, dependencies)
- Return values and functions
- localStorage/sessionStorage interactions (if applicable)
- Event listeners and cleanup

### Hook Test Template
```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTheme } from '~/hooks/useTheme';

describe('useTheme Hook', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should initialize with saved theme from localStorage', () => {
    localStorage.setItem('theme', 'dark');

    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe('dark');
  });

  it('should update theme and persist to localStorage', () => {
    const { result } = renderHook(() => useTheme());

    act(() => {
      result.current.setTheme('light');
    });

    expect(result.current.theme).toBe('light');
    expect(localStorage.getItem('theme')).toBe('light');
  });
});
```

---

## 5. Mocking Strategy

### Supabase Mocking
Always mock `supabaseServer` and `supabaseClient`:
```typescript
vi.mock('~/lib/supabase.server', () => ({
  supabaseServer: {
    from: vi.fn(),
    rpc: vi.fn(),
  },
}));

// Usage in tests
vi.mocked(supabaseServer.from).mockReturnValue({
  select: vi.fn().mockReturnValue({
    eq: vi.fn().mockResolvedValue({ data: [], error: null }),
  }),
} as any);
```

### File System & Image Processing
Mock Sharp and file operations:
```typescript
vi.mock('sharp', () => ({
  default: vi.fn(() => ({
    resize: vi.fn().mockReturnThis(),
    jpeg: vi.fn().mockReturnThis(),
    rotate: vi.fn().mockReturnThis(),
    toBuffer: vi.fn().mockResolvedValue(Buffer.from('mock-image')),
  })),
}));
```

### API/External Calls
Mock fetch and external API calls:
```typescript
global.fetch = vi.fn().mockResolvedValue({
  json: vi.fn().mockResolvedValue({ success: true }),
  ok: true,
});
```

### React Router
Provide Router context or use `MemoryRouter`:
```typescript
import { MemoryRouter } from 'react-router';

render(
  <MemoryRouter initialEntries={['/dashboard']}>
    <Component />
  </MemoryRouter>
);
```

---

## 6. Test Data & Fixtures

### Factory Functions (NOT Fixtures)
Create factory functions instead of static fixtures to avoid test pollution:

```typescript
// ✅ GOOD: Factory functions
export const createMockPlant = (overrides?: Partial<Plant>): Plant => ({
  id: '1',
  user_id: 'user-123',
  name: 'Mock Plant',
  photo_url: null,
  watering_frequency_days: 7,
  room_id: null,
  created_with_ai: false,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
});

export const createMockPlantWithWatering = (
  overrides?: Partial<PlantWithWatering>
): PlantWithWatering => ({
  ...createMockPlant(),
  room_name: null,
  next_watering_date: new Date(),
  last_watered_date: null,
  days_until_watering: 3,
  is_overdue: false,
  ...overrides,
});

// Usage in tests
it('should show overdue status', () => {
  const plant = createMockPlantWithWatering({ is_overdue: true });
  render(<PlantCard plant={plant} />);
  // Test
});
```

### Where to Store Factories
- Component test factories: `app/components/__tests__/factories.ts`
- Server utility factories: `app/lib/__tests__/factories.ts`
- Shared factories: `app/__tests__/factories.ts`

---

## 7. Testing Patterns & Best Practices

### Assertions
- Use semantic assertions: `expect(screen.getByRole('button')).toBeInTheDocument()`
- NOT: `expect(wrapper.find('.button')).toHaveLength(1)`
- Test behavior, not implementation

### User Interactions
Always use `userEvent` over `fireEvent`:
```typescript
// ✅ GOOD
const user = userEvent.setup();
await user.click(button);
await user.type(input, 'text');

// ❌ AVOID
fireEvent.click(button);
```

### Async Tests
Always handle async properly:
```typescript
// ✅ GOOD
it('should load data', async () => {
  render(<Component />);
  const element = await screen.findByText('Loaded');
  expect(element).toBeInTheDocument();
});

// ✅ ALSO GOOD with waitFor
it('should update state', async () => {
  render(<Component />);
  await waitFor(() => {
    expect(screen.getByText('Updated')).toBeInTheDocument();
  });
});
```

### Cleanup & Isolation
Each test should be independent:
```typescript
beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  // Reset any shared state
});

afterEach(() => {
  vi.restoreAllMocks();
});
```

### Test Naming
Test names should describe the behavior:
```typescript
// ✅ GOOD
it('should show overdue status when days_until_watering is negative')
it('should disable submit button when name is empty')
it('should call recordWatering when user clicks water button')

// ❌ AVOID
it('works correctly')
it('test component')
it('negative test')
```

---

## 8. Coverage Guidelines

### Target Coverage by Category
- **Components**: 80-90% (test user interactions, rendering, edge cases)
- **Hooks**: 80%+ (all state changes and effects)
- **Server utilities**: 70-80% (happy path, error handling, security)
- **Routes**: 60-70% (basic integration, happy paths)
- **Types**: No testing needed (TypeScript handles validation)

### What Counts Toward Coverage
✅ Line coverage (lines executed)
✅ Branch coverage (if/else paths)
✅ Function coverage (functions called)

### What Doesn't Need 100% Coverage
- Error boundaries (rarely hit in tests)
- Unreachable catch blocks (defensive programming)
- External library integration (mock it instead)
- Dark mode CSS classes (test behavior with data-attributes)

---

## 9. What to Avoid

### ❌ Don't
- **Test internal component state**: Test inputs/outputs, not `useState` directly
- **Test CSS classes directly**: Test behavior (e.g., button color with data-attributes)
- **Test library internals**: If mocking Radix UI Dialog, don't test Dialog internals
- **Write brittle selectors**: Use `getByRole`, `getByLabelText`, not `querySelector`
- **Create shared test fixtures**: Use factories instead (mutable state causes issues)
- **Test the entire app at once**: Break into unit + integration tests
- **Mock at the component level**: Mock at the API/function level instead
- **Skip error cases**: Always test error paths

### ✅ Do
- **Test user-visible behavior**: What the user sees and does
- **Test error handling**: All error paths should be tested
- **Test accessibility**: Check aria-labels, roles, keyboard navigation
- **Test security**: Verify permission checks, user isolation
- **Keep tests focused**: One concern per test (or use describe blocks for related tests)
- **Use meaningful assertions**: `expect(screen.getByRole('heading')).toHaveTextContent('My Plants')`

---

## 10. Common Testing Scenarios

### Testing Form Submission
```typescript
it('should submit form with correct data', async () => {
  const onSubmit = vi.fn();
  const user = userEvent.setup();

  render(<PlantForm onSubmit={onSubmit} />);

  await user.type(screen.getByLabelText('Plant Name'), 'Monstera');
  await user.type(screen.getByLabelText('Watering Frequency'), '7');
  await user.click(screen.getByRole('button', { name: /create/i }));

  expect(onSubmit).toHaveBeenCalledWith(
    expect.objectContaining({ name: 'Monstera', watering_frequency_days: 7 })
  );
});
```

### Testing Conditional Rendering
```typescript
it('should show watering status with correct color', () => {
  const { rerender } = render(
    <PlantCard plant={createMockPlantWithWatering({ is_overdue: false })} />
  );
  expect(screen.queryByText(/overdue/i)).not.toBeInTheDocument();

  rerender(
    <PlantCard plant={createMockPlantWithWatering({ is_overdue: true })} />
  );
  expect(screen.getByText(/overdue/i)).toBeInTheDocument();
});
```

### Testing Error States
```typescript
it('should display error message on failure', async () => {
  vi.mocked(createPlant).mockRejectedValue(new Error('DB Error'));

  render(<CreatePlantForm />);
  await user.click(screen.getByRole('button', { name: /create/i }));

  expect(await screen.findByText(/failed to create/i)).toBeInTheDocument();
});
```

### Testing Modal/Dialog
```typescript
it('should open and close dialog', async () => {
  const user = userEvent.setup();
  render(<DeletePlantDialog open={true} />);

  expect(screen.getByRole('alertdialog')).toBeInTheDocument();

  await user.click(screen.getByRole('button', { name: /cancel/i }));
  expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
});
```

---

## 11. Configuration & Setup

### Vitest Configuration File
Location: `vitest.config.ts`
```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./app/__tests__/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'app/__tests__/',
        '**/*.d.ts',
        '**/index.ts',
      ],
    },
  },
  resolve: {
    alias: {
      '~': path.resolve(__dirname, './app'),
    },
  },
});
```

### Test Setup File
Location: `app/__tests__/setup.ts`
```typescript
import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';

// Cleanup after each test
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

// Mock window.matchMedia for dark mode tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
```

### Package.json Scripts
```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "test:watch": "vitest --watch"
  }
}
```

---

## 12. Running Tests

### CLI Commands
```bash
# Run all tests once
yarn test

# Watch mode (re-run on file changes)
yarn test:watch

# Run with UI dashboard
yarn test:ui

# Generate coverage report
yarn test:coverage

# Run specific test file
yarn test PlantCard.test.tsx

# Run tests matching pattern
yarn test --grep "watering"
```

---

## 13. AI Agent Test Generation Rules

When AI agents generate tests, they MUST:

### ✅ DO
1. **Follow the structure**: Imports → Describe → Setup → Tests
2. **Use factories**: Create mock data with `createMockPlant()` etc.
3. **Test behavior**: Focus on user interactions and outputs
4. **Mock externals**: Always mock Supabase, Sharp, fetch
5. **Organize with describe**: Group related tests with `describe` blocks
6. **Use semantic queries**: `getByRole`, `getByLabelText`, `getByText`
7. **Handle async properly**: Use `async/await`, `findBy`, `waitFor`
8. **Clean up**: Use `beforeEach`/`afterEach` for setup/teardown
9. **Test error paths**: Include error and edge case scenarios
10. **Document complex tests**: Add comments explaining tricky setups
11. **Verify mocks are called correctly**: Check arguments passed to mocks
12. **Create separate test files**: Don't cram too many tests in one file

### ❌ DON'T
1. **Write snapshot tests**: Too brittle for component changes
2. **Test implementation details**: Test behavior, not internal state
3. **Use `render` without Router context**: Wrap components that need routing
4. **Create shared fixtures**: Use factory functions instead
5. **Test CSS directly**: Test behavior indicated by CSS
6. **Skip error tests**: Include error cases
7. **Create overly complex mocks**: Keep mocks focused
8. **Use setTimeout**: Use proper async utilities
9. **Test library internals**: Mock and verify calls instead
10. **Create tests without factories**: Always use factory functions for test data
11. **Mix concerns**: Keep unit tests focused, integration tests separate
12. **Forget to clear mocks**: Always `vi.clearAllMocks()` in beforeEach

---

## 14. Test Prioritization

When generating tests for a feature, prioritize:

### Tier 1 (Must Test)
- User interactions (clicks, form input, navigation)
- Happy path (main feature flow)
- Error handling (validation errors, API failures)
- Security (permission checks, user isolation)

### Tier 2 (Should Test)
- Edge cases (empty lists, null values, boundary values)
- Conditional rendering (if/else branches)
- State changes (loading → loaded, error states)
- Accessibility (aria attributes, keyboard navigation)

### Tier 3 (Nice to Have)
- Visual regression (with visual testing tools)
- Performance (load time, render time)
- Integration scenarios (complex multi-component flows)
- Rare error scenarios (network timeout, corruption)

---

## Summary Checklist for New Tests

- [ ] Test file in correct location with `__tests__` folder
- [ ] Uses Vitest + React Testing Library
- [ ] Imports organized: external → internal → types
- [ ] Mock data created with factory functions
- [ ] Mocks set up in `beforeEach` and cleared in `afterEach`
- [ ] Tests use semantic queries (`getByRole`, not `querySelector`)
- [ ] Tests focus on behavior, not implementation
- [ ] Async operations handled with `async/await` and `findBy`/`waitFor`
- [ ] Error cases tested
- [ ] Security checks included (where applicable)
- [ ] Tests run independently (no interdependencies)
- [ ] Test names describe the behavior being tested
- [ ] Comments explain complex mocks or non-obvious test logic
- [ ] Coverage targets met (70-85% overall)