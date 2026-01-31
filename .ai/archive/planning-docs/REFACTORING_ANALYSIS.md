# Refactoring Analysis Report

Analysis of 5 React components for refactoring opportunities based on React best practices, code maintainability, and readability.

---

## 1. `app/features/plants/components/sort-selector.tsx` (45 lines)

### Findings

#### ✅ Inline Functions That Should Use `useCallback`

- **Lines 19 & 31**: Inline arrow functions in `onClick` handlers
  ```tsx
  onClick={() => onSortChange('watering')}
  onClick={() => onSortChange('name')}
  ```
  **Impact**: Low - component is simple and re-renders are unlikely to cause performance issues, but following best practices would improve consistency.

#### ❌ Missing JSDoc Comments

- **Component**: `SortSelector` lacks JSDoc documentation
  - Should document props, purpose, and usage

#### ✅ Component Size

- **Status**: ✅ Good (45 lines)
- No splitting needed

#### ⚠️ Code Duplication

- **Lines 20-25 & 32-37**: Button styling is duplicated
  - Both buttons share identical className logic with only the `activeSort` comparison differing
  - **Recommendation**: Extract to a helper function or component
  ```tsx
  const getButtonClassName = (isActive: boolean) =>
    cn(
      'px-3 py-1.5 rounded-full whitespace-nowrap flex-shrink-0 transition-colors text-sm font-medium flex items-center gap-1.5',
      isActive
        ? 'bg-emerald-600 text-white'
        : 'bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600'
    );
  ```

#### ✅ Helper Functions

- None that need to be moved to utils

### Summary

- **Priority**: Medium
- **Main Issues**: Missing JSDoc, code duplication in button styling
- **Quick Wins**: Add JSDoc, extract button className logic

---

## 2. `app/shared/components/skeleton-loader.tsx` (247 lines)

### Findings

#### ✅ Inline Functions

- **Status**: ✅ Good
- Array mapping functions (line 49, 98, 123, 211) are appropriate inline usage

#### ⚠️ Missing JSDoc Comments

- **Component**: `Skeleton` (line 15) has a comment but not formal JSDoc
  - Other components have proper JSDoc, but `Skeleton` should match the pattern

#### ✅ Component Size

- **Status**: ✅ Good
- File contains multiple small components (each <50 lines)
- Well-organized collection of skeleton components

#### ✅ Code Duplication

- **Status**: ✅ Acceptable
- Similar patterns across components are intentional and appropriate for skeleton loaders
- Each component serves a distinct purpose

#### ✅ Helper Functions

- None that need to be moved to utils

### Summary

- **Priority**: Low
- **Main Issues**: Minor - `Skeleton` component should have formal JSDoc to match other components
- **Quick Wins**: Add JSDoc to `Skeleton` component

---

## 3. `app/layout/components/UserMenu.tsx` (49 lines)

### Findings

#### ✅ Inline Functions

- **Status**: ✅ Good
- No inline functions that need `useCallback`

#### ❌ Missing JSDoc Comments

- **Component**: `UserMenu` lacks JSDoc documentation
  - Should document props (`userEmail`), purpose, and behavior

#### ✅ Component Size

- **Status**: ✅ Good (49 lines)
- No splitting needed

#### ✅ Code Duplication

- **Status**: ✅ Good
- No duplication found

#### ✅ Helper Functions

- None that need to be moved to utils

### Summary

- **Priority**: Low
- **Main Issues**: Missing JSDoc documentation
- **Quick Wins**: Add JSDoc comment

---

## 4. `app/features/plants/components/plant-info-section.tsx` (80 lines)

### Findings

#### ✅ Inline Functions

- **Status**: ✅ Good
- Array mapping (line 64) is appropriate inline usage

#### ⚠️ Missing JSDoc Comments

- **Component**: `PlantInfoSection` lacks JSDoc documentation
  - Has file-level comment for `parseContent` helper, but component itself needs JSDoc
  - Should document props, behavior, and the collapsible functionality

#### ✅ Component Size

- **Status**: ✅ Good (80 lines)
- No splitting needed

#### ✅ Code Duplication

- **Status**: ✅ Good
- No duplication found

#### ⚠️ Helper Functions That Could Be Moved to Utils

- **Function**: `parseContent` (lines 23-41)
  - Currently only used in this component
  - **Recommendation**: If this parsing logic might be reused elsewhere (e.g., in other plant info displays), consider moving to `app/lib/utils/utils.ts` or a new `app/lib/utils/content-parsing.ts`
  - **Current Status**: Keep as-is unless reuse is needed

### Summary

- **Priority**: Low-Medium
- **Main Issues**: Missing JSDoc on component, potential utility extraction for `parseContent`
- **Quick Wins**: Add JSDoc to `PlantInfoSection` component

---

## 5. `app/features/ai-wizard/components/ai-wizard-steps/CarePreviewStep.tsx` (339 lines)

### Findings

#### ❌ Inline Functions That Should Use `useCallback`

- **Multiple handlers** that should be memoized:
  1. **Line 41**: `handleWateringFrequencyChange` - used in `onChange`
  2. **Line 53**: `handleLightRequirementsChange` - used in `onChange`
  3. **Line 64**: `handleWateringAmountChange` - used in `onValueChange`
  4. **Line 75**: `handleTipsChange` - used in multiple `onChange` handlers
  5. **Line 91**: `handleContinue` - used in `onClick`
  6. **Line 137**: Inline arrow function in `onValueChange` for room selection
  7. **Line 108**: Inline arrow function for edit toggle

  **Impact**: Medium-High - These handlers are recreated on every render, which could cause unnecessary re-renders of child components.

#### ⚠️ Missing JSDoc Comments

- **Component**: `CarePreviewStep` has file-level comment but no formal JSDoc
  - Should document props (`onContinue`, `rooms`), purpose, and behavior

#### ❌ Component Size

- **Status**: ❌ Too Large (339 lines)
- **Recommendation**: Split into smaller components:
  1. **`PlantInfoCard`** - Plant information section (lines 122-157)
  2. **`WateringCard`** - Watering section (lines 159-221)
  3. **`LightRequirementsCard`** - Light requirements section (lines 223-243)
  4. **`TipsSection`** - Reusable component for Fertilizing/Pruning/Troubleshooting (lines 245-312)
  5. **`CarePreviewHeader`** - Header with edit toggle (lines 98-113)

#### ❌ Code Duplication

- **Major duplication**: Tips sections (Fertilizing, Pruning, Troubleshooting) share nearly identical structure
  - **Lines 245-266**: Fertilizing Tips
  - **Lines 268-289**: Pruning Tips
  - **Lines 291-312**: Troubleshooting
  - **Recommendation**: Extract to reusable `TipsSection` component:
    ```tsx
    <TipsSection
      title="Fertilizing Tips"
      tips={state.careInstructions.fertilizingTips}
      isEditing={isEditing}
      onTipChange={(index, value) => handleTipsChange('fertilizingTips', index, value)}
      bulletColor="bg-blue-600"
    />
    ```

- **Watering amount display logic** (lines 211-215): Repeated conditional logic
  - **Recommendation**: Extract to utility function:
    ```tsx
    function formatWateringAmount(amount: 'low' | 'mid' | 'heavy'): string {
      switch (amount) {
        case 'low':
          return 'Light watering';
        case 'mid':
          return 'Moderate watering';
        case 'heavy':
          return 'Heavy watering';
      }
    }
    ```

#### ⚠️ Helper Functions That Could Be Moved to Utils

- **Function**: Watering amount formatting (lines 211-215)
  - **Recommendation**: Move to `app/lib/utils/utils.ts` as `formatWateringAmount()`
  - This logic appears in multiple places (see grep results) and should be centralized

### Summary

- **Priority**: High
- **Main Issues**:
  1. Component too large (339 lines) - needs splitting
  2. Significant code duplication in tips sections
  3. Missing `useCallback` for event handlers
  4. Missing JSDoc
  5. Watering amount formatting should be a utility function
- **Recommended Refactoring**:
  1. Extract tips sections into reusable `TipsSection` component
  2. Split large component into smaller card components
  3. Add `useCallback` to all event handlers
  4. Extract `formatWateringAmount` to utils
  5. Add comprehensive JSDoc

---

## Overall Summary

### Priority Ranking

1. **High Priority**: `CarePreviewStep.tsx` - Multiple issues requiring significant refactoring
2. **Medium Priority**: `sort-selector.tsx` - Code duplication and missing docs
3. **Low Priority**: `plant-info-section.tsx`, `UserMenu.tsx`, `skeleton-loader.tsx` - Minor documentation improvements

### Common Patterns

- **Missing JSDoc**: 4 out of 5 components lack proper JSDoc documentation
- **Code Duplication**: Found in `sort-selector.tsx` (button styling) and `CarePreviewStep.tsx` (tips sections)
- **Performance**: `CarePreviewStep.tsx` has multiple handlers that should use `useCallback`

### Recommended Actions

1. **Immediate**: Add JSDoc to all components
2. **Short-term**: Refactor `CarePreviewStep.tsx` to split into smaller components
3. **Short-term**: Extract duplicated code (tips sections, button styling, watering amount formatting)
4. **Medium-term**: Add `useCallback` to event handlers in `CarePreviewStep.tsx`
