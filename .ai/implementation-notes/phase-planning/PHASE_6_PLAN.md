# Phase 6: Testing & Optimization - Implementation Plan

**Current Status**: Infrastructure Complete, Execution Phase

**Branch**: `phase-6/testing-and-optimization`

---

## Executive Summary

Phase 6 foundation work has been **substantially completed** in previous phases:

- ✅ Vitest fully configured with jsdom and Testing Library
- ✅ 28 comprehensive test files written (438 total tests)
- ✅ Extensive mock factories for Supabase, authentication, image processing
- ✅ Global test setup with cleanup, DOM mocks, and utilities
- ⚠️ 87 failing tests (20%) need fixes
- ❌ Performance testing infrastructure not configured
- ❌ Documentation files (TESTING.md, DEPLOYMENT.md) not created

**Phase 6 Tasks**:

1. Fix failing tests and achieve 100% pass rate
2. Generate and verify test coverage reports
3. Set up performance monitoring (Lighthouse, Web Vitals)
4. Create testing and deployment documentation
5. Configure CI/CD test integration
6. Optimize bundle size and performance

---

## Current Test Status Analysis

### Test Inventory

- **Total Test Files**: 28
- **Passing Files**: 16
- **Failing Files**: 12
- **Total Tests**: 438
- **Passing Tests**: 351 (80%)
- **Failing Tests**: 87 (20%)
- **Execution Time**: 34-37 seconds

### Test File Breakdown

#### Component Tests (10 files)

- `PlantCard.test.tsx` - 60+ test cases (rendering, watering status, accessibility) ✅
- `WateringButton.test.tsx` - Form submission tests ⚠️
- `ImageUpload.test.tsx` - File upload and preview ✅
- `NotificationsModal.test.tsx` - 40 tests (dialog, watering actions) ⚠️
- `Navigation.notifications.test.tsx` - Bell icon and badge ⚠️
- Plus 5 more component test files

#### Server/Library Tests (9 files)

- `plants.server.test.ts` - Input validation ✅
- `watering.server.test.ts` - Watering calculations ✅
- `rooms.server.test.ts` - Room management ✅
- `storage.server.test.ts` - Storage operations ✅
- `image.server.test.ts` - Image processing ✅
- `plantnet.server.test.ts` - Plant identification ✅
- `openai.server.test.ts` - AI integration ✅
- `usage-limits.server.test.ts` - Usage tracking ✅
- `error-handling.test.ts` - Error utilities (65+ tests) ✅

#### Integration Tests (5 files)

- `api.water.$plantId.test.ts` - Watering endpoint ⚠️
- `api.notifications.test.ts` - Notification API ✅
- `dashboard.plants.new-ai.integration.test.ts` - AI wizard flow ⚠️
- Plus 2 more integration test variants

#### Utility Tests (2 files)

- `smoke.test.ts` - Basic Vitest verification ✅
- `factories.test.ts` - Factory function tests ✅

### Known Failing Test Issues

1. **AI Wizard Integration** (`dashboard.plants.new-ai.integration.test.ts`)
   - Issue: `requireAuth` export not properly mocked in vi.mock() setup
   - Impact: 15+ tests failing
   - Fix: Ensure server-only modules are mocked before imports

2. **NotificationsModal Tests**
   - Issue: Duplicate React key warnings
   - Impact: 12+ tests failing
   - Fix: Review plant list rendering, ensure unique keys

3. **WateringButton Tests**
   - Issue: Form element not properly selected/rendered in test
   - Impact: 8+ tests failing
   - Fix: Ensure button is within form context in test setup

4. **Navigation Notifications Tests**
   - Issue: State management and notification count updates
   - Impact: 10+ tests failing
   - Fix: Mock notification data fetching properly

5. **Route Integration Tests**
   - Issue: Mock Supabase query chains incomplete
   - Impact: 42+ tests failing
   - Fix: Ensure all query builder methods return proper mock values

---

## Detailed Phase 6 Implementation Plan

### Section 1: Fix Failing Tests (Priority 1)

#### Task 1.1: Fix AI Wizard Integration Tests

**Files**: `app/routes/__tests__/dashboard.plants.new-ai.integration.test.ts`

**Status**: ⚠️ Failing (15 tests)

**Root Cause**: Mock setup for server-only modules happens after imports

**Action Items**:

1. Move all `vi.mock()` calls to the top of test file (before imports)
2. Ensure `requireAuth` is properly mocked:
   ```typescript
   vi.mock('~/lib/require-auth.server', () => ({
     requireAuth: vi.fn(async () => ({
       userId: 'test-user-id',
       email: 'test@example.com',
     })),
   }));
   ```
3. Mock AI service calls with proper response structure
4. Test multi-step form submission with optimistic updates
5. Verify feedback modal appears after save
6. Run tests and verify all 15 pass

**Success Criteria**:

- ✅ All 15 tests pass
- ✅ No console errors during test execution
- ✅ Mocks verify that correct APIs are called with expected args

#### Task 1.2: Fix NotificationsModal Tests

**Files**: `app/components/__tests__/NotificationsModal.test.tsx`

**Status**: ⚠️ Failing (12 tests)

**Root Cause**: Duplicate keys in plant list rendering

**Action Items**:

1. Examine test plant data fixture - verify each plant has unique ID
2. Check plant list rendering in component:
   ```typescript
   {plants.map((plant) => (
     <div key={plant.id}>  // Ensure plant.id is unique
   ```
3. In tests, use factory functions to ensure unique plant IDs:
   ```typescript
   const plants = [createMockPlant({ id: 'plant-1' }), createMockPlant({ id: 'plant-2' })];
   ```
4. Test modal opens/closes properly
5. Test watering button in notification item triggers action
6. Verify notification dismissed after watering

**Success Criteria**:

- ✅ All 12 tests pass
- ✅ No React key warnings
- ✅ No console errors

#### Task 1.3: Fix WateringButton Form Tests

**Files**: `app/components/__tests__/WateringButton.test.tsx`

**Status**: ⚠️ Failing (8 tests)

**Root Cause**: Button rendered outside form context in test

**Action Items**:

1. Ensure test renders button within `<form>` element:
   ```typescript
   render(
     <form method="post" action="/api/water/plant-1">
       <WateringButton plantId="plant-1" />
     </form>
   );
   ```
2. Test form submission with proper FormData
3. Test optimistic state update (button disabled during submission)
4. Test success/error states
5. Verify proper action attribute on form

**Success Criteria**:

- ✅ All 8 tests pass
- ✅ Form submission triggers properly
- ✅ Loading state appears during submission

#### Task 1.4: Fix Navigation Notifications Tests

**Files**: `app/components/__tests__/Navigation.notifications.test.tsx`

**Status**: ⚠️ Failing (10 tests)

**Root Cause**: Notification count state not updating from loader data

**Action Items**:

1. Verify Navigation component uses proper loader data hook
2. Mock loader data to include notification count
3. Test bell icon renders with correct badge count
4. Test clicking bell opens notification modal
5. Test notification badge updates when count changes
6. Test keyboard navigation on bell button (enter/space)

**Success Criteria**:

- ✅ All 10 tests pass
- ✅ Badge count displays correctly
- ✅ Modal opens on click

#### Task 1.5: Fix Route Integration Tests

**Files**:

- `app/routes/__tests__/api.water.$plantId.test.ts`
- `app/routes/__tests__/api.notifications.test.ts`

**Status**: ⚠️ Failing (42 tests)

**Root Cause**: Incomplete mock Supabase query chains

**Action Items**:

1. Review factory function `setupMockSupabaseForPlants()` - ensure all query methods are implemented:
   - `.select()`
   - `.eq()`
   - `.single()`
   - `.insert()`
   - `.update()`
   - `.delete()`
   - `.order()`
   - `.limit()`
2. Test watering action endpoint:
   - Verify auth check
   - Verify plant ownership via RLS
   - Verify watering history insert
   - Verify response includes updated plant state
3. Test notifications endpoint:
   - Verify returns only plants overdue watering
   - Verify sorted by days overdue (descending)
   - Verify includes last watered date
4. Test error cases:
   - Plant not found (should return 404)
   - Unauthorized access (should return 403)
   - Database errors (should return 500)

**Success Criteria**:

- ✅ All 42 tests pass
- ✅ Proper HTTP status codes
- ✅ Error handling verified

---

### Section 2: Generate Coverage Reports (Task 2)

**Files**: Run coverage with Vitest

**Action Items**:

1. Run: `yarn test:coverage`
2. Review coverage report in HTML:
   - Open `coverage/index.html` in browser
   - Check coverage by file type:
     - Statements: Target >80%
     - Branches: Target >75%
     - Functions: Target >80%
     - Lines: Target >80%
3. Identify files with low coverage:
   - Review uncovered code paths
   - Add tests for critical paths
   - Consider removing dead code
4. Document coverage baseline in TESTING.md

**Success Criteria**:

- ✅ Overall coverage >80%
- ✅ All core utilities >85% coverage
- ✅ All components >80% coverage
- ✅ Coverage reports generated in HTML/JSON formats

---

### Section 3: Set Up Performance Testing (Task 3)

#### Task 3.1: Lighthouse Configuration

**Files**: Create `.lighthouserc.json`

**Action Items**:

1. Install Lighthouse CI: `yarn add -D @lhci/cli@latest`
2. Create `.lighthouserc.json`:
   ```json
   {
     "ci": {
       "collect": {
         "url": ["http://localhost:5173/"],
         "numberOfRuns": 1
       },
       "upload": {
         "target": "temporary-public-storage"
       },
       "assert": {
         "preset": "lighthouse:recommended",
         "assertions": {
           "categories:performance": ["error", { "minScore": 0.8 }],
           "categories:accessibility": ["error", { "minScore": 0.9 }],
           "categories:best-practices": ["error", { "minScore": 0.85 }],
           "categories:seo": ["error", { "minScore": 0.85 }]
         }
       }
     }
   }
   ```
3. Add npm script: `"lighthouse": "lhci autorun"`
4. Test locally: start dev server and run lighthouse
5. Document performance targets in TESTING.md

**Success Criteria**:

- ✅ Lighthouse can run against localhost
- ✅ Performance score >80
- ✅ Accessibility score >90

#### Task 3.2: Web Vitals Monitoring

**Files**: `app/lib/web-vitals.ts`, `app/root.tsx`

**Action Items**:

1. Install Web Vitals: `yarn add web-vitals`
2. Create `app/lib/web-vitals.ts`:

   ```typescript
   import { onCLS, onFCP, onFID, onLCP, onTTFB } from 'web-vitals';

   export function captureWebVitals() {
     onCLS(console.log);
     onFID(console.log);
     onFCP(console.log);
     onLCP(console.log);
     onTTFB(console.log);
   }
   ```

3. Call in root.tsx useEffect for client-side only
4. Log to console in development, send to analytics in production
5. Create performance baseline documentation

**Success Criteria**:

- ✅ Web Vitals are captured
- ✅ Metrics logged in console during dev
- ✅ No impact on app performance

#### Task 3.3: Bundle Size Analysis

**Files**: `vite.config.ts`

**Action Items**:

1. Install rollup-plugin-visualizer: `yarn add -D rollup-plugin-visualizer`
2. Add to vite.config.ts:

   ```typescript
   import { visualizer } from 'rollup-plugin-visualizer';

   export default defineConfig({
     plugins: [
       // ... other plugins
       visualizer({
         filename: 'dist/stats.html',
         open: true,
       }),
     ],
   });
   ```

3. Build: `yarn build`
4. Review bundle breakdown in `dist/stats.html`
5. Identify large dependencies
6. Document in TESTING.md

**Success Criteria**:

- ✅ Bundle analysis runs on build
- ✅ Main bundle <200KB (gzipped)
- ✅ Can identify code optimization opportunities

---

### Section 4: Documentation (Task 4)

#### Task 4.1: Create TESTING.md

**File**: `.ai/TESTING.md` (or root `TESTING.md`)

**Content to Include**:

1. **Testing Philosophy**
   - Unit tests for utilities and pure functions
   - Component tests for UI logic
   - Integration tests for API routes
   - E2E tests for critical user flows (future)

2. **Running Tests**

   ```bash
   yarn test              # Run tests once
   yarn test:watch       # Run in watch mode
   yarn test:ui          # Open Vitest UI dashboard
   yarn test:coverage    # Generate coverage report
   ```

3. **Test Structure**
   - Component tests: `components/__tests__/ComponentName.test.tsx`
   - Server function tests: `lib/__tests__/module.server.test.ts`
   - Route tests: `routes/__tests__/route-name.test.ts`
   - Factories: `__tests__/factories.ts`

4. **Writing Tests**
   - Use factory functions for test data
   - Mock external dependencies (Supabase, APIs)
   - Test user-facing behavior, not implementation
   - Aim for high coverage on critical paths

5. **Coverage Baseline**
   - Target: >80% overall
   - Utilities: >85%
   - Components: >80%
   - Routes: >75%

6. **Mocking Guide**
   - Supabase: Use `setupMockSupabaseForPlants()`
   - File uploads: Use `createMockImageFile()`
   - Auth: Use `createMockAuthSession()`
   - AI services: Mocked with 2-3s delays for demo

7. **CI Integration**
   - Tests run on every PR
   - Coverage reports generated
   - Minimum coverage enforcement

#### Task 4.2: Create DEPLOYMENT.md

**File**: `.ai/DEPLOYMENT.md`

**Content to Include**:

1. **Prerequisites**
   - Node.js 18+
   - Yarn package manager
   - Supabase account and project
   - Environment variables configured

2. **Environment Setup**
   - Create `.env` from `.env.example`
   - Supabase connection strings
   - API keys (OpenAI, PlantNet)
   - Session secret for cookie encryption

3. **Database Setup**
   - Run Supabase migrations from IMPLEMENTATION_PLAN.md
   - Create tables and indexes
   - Set up Row Level Security policies
   - Create storage bucket for plant photos

4. **Local Development**

   ```bash
   yarn install
   yarn dev          # Runs on localhost:5173
   yarn typecheck    # Type safety
   yarn test         # Run tests
   ```

5. **Production Build**

   ```bash
   yarn build        # Creates build/client and build/server
   yarn start        # Serves production build
   ```

6. **Performance Benchmarks**
   - Lighthouse scores (target: >80 on all metrics)
   - Core Web Vitals targets
   - Bundle size limits
   - Database query performance

7. **Monitoring & Logging**
   - Error tracking (future: Sentry)
   - Performance monitoring (future: New Relic)
   - User analytics (future: Mixpanel)

8. **Backup & Recovery**
   - Supabase automated backups
   - Storage backup procedures
   - Disaster recovery plan

#### Task 4.3: Update CLAUDE.md

**File**: `CLAUDE.md`

**Changes**:

1. Update testing section (currently says "No test commands"):

   ```markdown
   ### Testing

   - **Run tests**: `yarn test`
   - **Watch mode**: `yarn test:watch`
   - **Coverage**: `yarn test:coverage`
   - **UI dashboard**: `yarn test:ui`

   Tests located in `app/**/__tests__/` directories. See `TESTING.md` for detailed guide.
   ```

2. Add performance section:

   ```markdown
   ### Performance

   - **Lighthouse**: See TESTING.md for setup
   - **Bundle analysis**: `yarn build` creates stats.html
   - **Performance targets**: >80 Lighthouse score, <200KB main bundle (gzipped)
   ```

3. Update file structure with test directories

---

### Section 5: CI/CD Integration (Task 5)

#### Task 5.1: GitHub Actions Configuration

**File**: `.github/workflows/test.yml` (create if not exists)

**Content**:

```yaml
name: Tests & Coverage

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18.x, 20.x]

    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'yarn'

      - run: yarn install --frozen-lockfile
      - run: yarn typecheck
      - run: yarn test
      - run: yarn test:coverage

      - uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
```

#### Task 5.2: Pre-commit Hooks (Optional)

**Files**: Update `.husky/pre-commit` (if using Husky)

**Action Items**:

1. Run type checking before commit
2. Run tests for changed files
3. Ensure coverage meets minimum
4. Block commits if tests fail

---

### Section 6: Performance Optimization (Task 6)

#### Task 6.1: Image Optimization

**Current**: Using Sharp for server-side compression

**Action Items**:

1. Verify all images are <500KB (already implemented)
2. Add WebP format support in Sharp:
   ```typescript
   // app/lib/image.server.ts
   export async function compressImageToWebP(buffer: Buffer) {
     return sharp(buffer)
       .resize(1920, null, { withoutEnlargement: true })
       .webp({ quality: 85 })
       .toBuffer();
   }
   ```
3. Update upload to save both JPEG and WebP
4. Use `<picture>` tags for browser support

#### Task 6.2: Code Splitting

**Status**: ✅ Automatic via React Router

**Action Items**:

1. Verify route-based code splitting is working: `yarn build`
2. Check build output for separate chunks per route
3. Document in DEPLOYMENT.md

#### Task 6.3: Database Query Optimization

**Current**: Indexes already defined in schema

**Action Items**:

1. Run `ANALYZE` on all tables in production:
   ```sql
   ANALYZE;
   ```
2. Review slow query logs
3. Add missing indexes if needed
4. Optimize N+1 queries in loaders

#### Task 6.4: Caching Strategy

**Files**: `app/root.tsx` (update response headers)

**Action Items**:

1. Set Cache-Control headers for static assets:
   ```typescript
   response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
   ```
2. Short TTL for dynamic content:
   ```typescript
   response.headers.set('Cache-Control', 'public, max-age=60');
   ```
3. Disable caching for auth endpoints:
   ```typescript
   response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
   ```

---

## Implementation Sequence

### Week 1: Test Fixes & Coverage

1. **Day 1-2**: Fix AI wizard integration tests (Task 1.1)
2. **Day 2-3**: Fix NotificationsModal and WateringButton tests (Tasks 1.2-1.3)
3. **Day 3-4**: Fix Navigation and route integration tests (Tasks 1.4-1.5)
4. **Day 4-5**: Generate coverage reports and identify gaps (Task 2)
5. **Day 5**: Document test status and coverage baselines

### Week 2: Performance & Documentation

1. **Day 1-2**: Set up Lighthouse and Web Vitals (Task 3.1-3.2)
2. **Day 2-3**: Bundle analysis and optimization (Task 3.3)
3. **Day 3-4**: Create TESTING.md and DEPLOYMENT.md (Task 4)
4. **Day 4-5**: Update CLAUDE.md and setup CI/CD (Tasks 5)
5. **Day 5**: Performance optimization pass (Task 6)

### Week 3: Polish & Final Testing

1. **Day 1-2**: Complete all remaining tasks
2. **Day 2-3**: Run E2E verification against acceptance criteria
3. **Day 3-5**: Bug fixes and final optimization

---

## Success Criteria - Phase 6 Complete

### Testing

- ✅ All 438 tests passing (0 failures)
- ✅ Overall code coverage >80%
- ✅ Core utilities >85% coverage
- ✅ Components >80% coverage
- ✅ Test execution <45 seconds

### Performance

- ✅ Lighthouse Performance: >80
- ✅ Lighthouse Accessibility: >90
- ✅ Lighthouse Best Practices: >85
- ✅ Lighthouse SEO: >85
- ✅ Main bundle: <200KB (gzipped)
- ✅ Core Web Vitals: All green

### Documentation

- ✅ TESTING.md created and comprehensive
- ✅ DEPLOYMENT.md created with complete instructions
- ✅ CLAUDE.md updated with test commands
- ✅ Coverage baselines documented
- ✅ Performance targets documented

### CI/CD

- ✅ GitHub Actions test workflow configured
- ✅ Tests run on every PR
- ✅ Coverage reports uploaded to Codecov (optional)
- ✅ Build passes on CI environment

### Code Quality

- ✅ No console errors or warnings
- ✅ No TypeScript errors
- ✅ No accessibility violations (WCAG 2.1 AA)
- ✅ All critical paths tested

---

## Known Constraints & Assumptions

1. **Test Execution Time**: Currently 34-37 seconds. Optimize if >60s becomes issue.
2. **Coverage vs. Pragmatism**: Some routes (error pages, edge cases) may have lower coverage - that's acceptable.
3. **E2E Testing**: Not included in Phase 6 scope. Can be added in Phase 7.
4. **CI/CD**: GitHub Actions assumed. Adjust for other platforms (GitLab, Vercel, etc.).
5. **Performance Baselines**: Based on modern laptop specs. Adjust for target audience.

---

## Rollback Plan

If issues arise:

1. **Failed Tests**: Reset to previous commit, debug in isolation
2. **Performance Regression**: Revert vite/dependency changes, profile with DevTools
3. **Coverage Drop**: Identify and test missing paths before merging
4. **CI Failures**: Run locally first, ensure all tests pass before pushing

---

## Questions & Decisions

1. **E2E Testing**: Should we add Playwright tests for critical flows? (Defer to Phase 7)
2. **Visual Regression**: Should we monitor UI changes? (Defer to Phase 7)
3. **Load Testing**: Should we test with 1000+ plants? (Defer to post-MVP)
4. **Internationalization**: Should we add i18n tests? (Defer to post-MVP)

---

**Created**: January 27, 2026
**Status**: Ready for Implementation
**Owner**: Claude Code
