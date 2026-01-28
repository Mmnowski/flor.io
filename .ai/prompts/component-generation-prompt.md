# Component Generation Prompt

## Objective

Generate production-ready React components following Flor.io's design system, code standards, and accessibility requirements. The component should be fully typed with TypeScript, styled with Tailwind CSS, and meet WCAG 2.1 AA accessibility standards.

## Process

1. **Analyze requirements** - Understand the component's purpose and user interactions
2. **Define props interface** - Create TypeScript interface with JSDoc documentation
3. **Implement component** - Build with Tailwind CSS following design system
4. **Verify accessibility** - Check color contrast, keyboard navigation, ARIA labels
5. **Apply design system** - Use color palette, spacing, and typography standards
6. **Validate against checklist** - Ensure all quality gates are met

## Design System Reference

### Color Palette

| Purpose          | Color       | Hex                   | Usage                       |
| ---------------- | ----------- | --------------------- | --------------------------- |
| Primary CTA      | Emerald     | `#10b981`             | Main buttons, active states |
| Light Background | Light Green | `#d1fae5`             | Backgrounds, hover states   |
| Secondary        | Sage Green  | `#78a982`             | Borders, muted elements     |
| Dark Primary     | Dark Green  | `#065f46`             | Text, strong accents        |
| Warning          | Red         | `#ef4444`             | Overdue (3+ days)           |
| Alert            | Orange      | `#f97316`             | Due today, in-progress      |
| Neutral          | Gray        | `#f3f4f6` - `#1f2937` | Surfaces, text              |

### Typography & Spacing

- **Body text minimum:** 16px (`text-base`)
- **Line height:** `leading-relaxed` (1.625)
- **Spacing grid:** 8px increments (8, 16, 24, 32, 40, 48px)
- **Border radius minimum:** `rounded-lg` (16px)
- **Touch targets minimum:** 44x44px

## Implementation Standards

### TypeScript Requirements

```typescript
interface ComponentNameProps {
  /** Description of prop purpose */
  propName: type;
  /** Optional prop with default */
  optionalProp?: type;
}

/**
 * ComponentName - Brief description of purpose
 * Detailed explanation if needed
 */
export function ComponentName({ propName }: ComponentNameProps) {
  // Implementation
}
```

**Rules:**

- Define props interface with JSDoc for each property
- Explicit return type on all functions
- No `any` types (use `unknown` if necessary)
- Prefer union types over booleans when meaningful: `'yes' | 'no'` instead of boolean
- Use optional chaining (`?.`) and nullish coalescing (`??`)

### Styling Requirements

**Tailwind CSS only** (no custom CSS files):

- Mobile-first approach: base mobile styles, then add responsive prefixes (`sm:`, `md:`, `lg:`)
- Use spacing in multiples of 4: `p-4`, `gap-6`, `mb-8`
- Interactive elements require focus states: `focus:ring-2 focus:ring-green-300`
- Hover states where applicable: `hover:bg-green-600`
- Smooth transitions: `transition-colors`, `transition-opacity`
- **Dark mode support**: Use `dark:` prefix for dark theme variants (e.g., `bg-white dark:bg-slate-900`)
- Dark mode uses CSS variables: `--background`, `--foreground`, etc.
- All color-dependent styles must have dark: counterparts

### Accessibility Checklist (WCAG 2.1 AA)

| Category                | Requirement                 | Implementation                        |
| ----------------------- | --------------------------- | ------------------------------------- |
| **Contrast**            | 4.5:1 minimum text contrast | Use high-contrast color combinations  |
| **Touch targets**       | 44x44px minimum             | All buttons, clickable elements       |
| **Semantic HTML**       | Proper elements             | `<button>`, `<a>`, `<nav>`, `<label>` |
| **Focus states**        | Visible outline             | `focus:ring-2 focus:ring-green-300`   |
| **ARIA labels**         | For icon-only elements      | `aria-label="Action description"`     |
| **Form labels**         | Associated with inputs      | `<label htmlFor="id">` pattern        |
| **Alt text**            | For all images              | Descriptive, not "image" or "photo"   |
| **Keyboard navigation** | Full keyboard support       | Tab order logical, Escape to close    |

### Component Categories & Patterns

#### Buttons

```typescript
// Primary CTA
<button className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:ring-2 focus:ring-green-300 transition-colors">
  Action
</button>

// Secondary
<button className="px-6 py-3 border-2 border-green-500 text-green-600 rounded-lg hover:bg-green-50 focus:ring-2 focus:ring-green-300">
  Secondary
</button>

// Disabled
<button disabled className="px-6 py-3 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed">
  Disabled
</button>
```

#### Cards

```typescript
<div className="bg-white rounded-xl shadow-sm hover:shadow-lg border border-green-200 p-6 transition-shadow">
  {/* Card content */}
</div>
```

#### Form Inputs

```typescript
<label htmlFor="input-id" className="block text-sm font-medium text-gray-900 mb-2">
  Label Text
</label>
<input
  id="input-id"
  type="text"
  placeholder="Hint text"
  className="w-full px-4 py-3 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-300 focus:border-green-500 transition-colors"
/>
```

#### Modals

```typescript
<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
  <div className="bg-white rounded-xl shadow-lg p-8 max-w-md">
    {/* Modal content */}
  </div>
</div>
```

## Common Decision Tree

```
Is this a new component?
├─ YES: Define clear props interface and JSDoc
│  └─ Will it be reused?
│     ├─ YES → Store in components/common/
│     └─ NO → Store in feature-specific folder
└─ NO: Is it an update to existing component?
   └─ Maintain backward compatibility with props
```

## Quality Validation Checklist

Before considering component complete:

- [ ] **TypeScript**: Props interface with JSDoc, explicit return types, no `any` types
- [ ] **Styling**: Tailwind only, mobile-first, consistent spacing (8px grid)
- [ ] **Dark mode**: All color-dependent styles have `dark:` variants, uses CSS variables
- [ ] **Responsiveness**: Works on mobile, tablet, desktop (sm:, md:, lg: breakpoints)
- [ ] **Accessibility**: 44px buttons, focus states, ARIA labels, semantic HTML
- [ ] **Color**: Uses design palette, 4.5:1 contrast minimum (both light and dark modes)
- [ ] **Borders**: `rounded-lg` minimum (16px)
- [ ] **Loading/Error**: Visual feedback for async operations, user-friendly errors
- [ ] **Focus states**: `focus:ring-2 focus:ring-green-300` on interactive elements
- [ ] **Keyboard navigation**: All interactive elements reachable via Tab, Escape closes modals
- [ ] **Performance**: No unnecessary re-renders, memoization if needed (`React.memo`, `useCallback`)
- [ ] **Images**: `loading="lazy"`, descriptive `alt` text
- [ ] **No hardcoded values**: Use props for customization
- [ ] **Composition**: Single responsibility, compound components for related elements
- [ ] **Documentation**: JSDoc comments on public APIs and complex logic
- [ ] **Testing**: Mentally verify different states (loading, error, empty, filled) in both light and dark modes

## File Naming Convention

| Type             | Format             | Example             |
| ---------------- | ------------------ | ------------------- |
| Component file   | `PascalCase.tsx`   | `PlantCard.tsx`     |
| Feature folder   | `kebab-case/`      | `plant-card/`       |
| Constants        | `UPPER_SNAKE_CASE` | `MAX_FILE_SIZE`     |
| Types/Interfaces | `PascalCase`       | `PlantCardProps`    |
| Hooks            | `useCamelCase`     | `useWateringStatus` |

## Example: Complete Component

```typescript
interface PlantCardProps {
  /** Unique plant identifier */
  id: string;
  /** Display name of plant */
  name: string;
  /** Plant photo URL */
  imageUrl: string;
  /** Days until next watering */
  daysUntilWatering: number;
  /** Callback when card clicked */
  onSelect?: (id: string) => void;
}

/**
 * PlantCard - Displays plant in dashboard grid
 * Shows photo, name, and watering status with
 * visual indicators for overdue/upcoming watering
 */
export function PlantCard({
  id,
  name,
  imageUrl,
  daysUntilWatering,
  onSelect,
}: PlantCardProps) {
  const statusColor =
    daysUntilWatering < 0
      ? 'bg-red-100 text-red-900'
      : daysUntilWatering === 0
        ? 'bg-orange-100 text-orange-900'
        : 'bg-green-100 text-green-900';

  const statusText =
    daysUntilWatering < 0
      ? `${Math.abs(daysUntilWatering)} days overdue`
      : daysUntilWatering === 0
        ? 'Water today'
        : `In ${daysUntilWatering} days`;

  return (
    <button
      onClick={() => onSelect?.(id)}
      className="flex flex-col gap-3 bg-white rounded-xl shadow-sm hover:shadow-lg p-4 text-left transition-shadow focus:ring-2 focus:ring-green-300 focus:outline-none"
      aria-label={`View ${name}, watering due ${statusText}`}
    >
      <img
        src={imageUrl}
        alt={name}
        className="w-full h-32 object-cover rounded-lg"
        loading="lazy"
      />
      <h3 className="text-base font-semibold text-gray-900">{name}</h3>
      <div className={`px-3 py-2 rounded-lg text-sm font-medium ${statusColor}`}>
        {statusText}
      </div>
    </button>
  );
}
```

## Resources

- **Tailwind CSS**: https://tailwindcss.com/docs
- **WCAG 2.1 AA Quick Ref**: https://www.w3.org/WAI/WCAG21/quickref/
- **React Patterns**: https://react.dev
- **TypeScript Handbook**: https://www.typescriptlang.org/docs
