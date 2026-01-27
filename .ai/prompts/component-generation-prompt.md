# Flor.io Component Generation Prompt & Design System

## 1. DESIGN THEME & VISUAL IDENTITY

### Color Palette (Floral Theme)

**Primary Colors:**

- **Primary Green:** `#10b981` (Emerald) - Main CTA buttons, active states, accent elements
- **Light Green:** `#d1fae5` - Backgrounds, subtle accents, hover states
- **Sage Green:** `#78a982` - Secondary elements, borders, muted text
- **Dark Green:** `#065f46` - Text, strong accents, dark mode primary

**Supporting Colors:**

- **Soil Brown:** `#92400e` - Plant pots, optional secondary buttons
- **Petal Pink:** `#fce7f3` - Soft backgrounds, gentle alerts
- **Leaf Gray:** `#f3f4f6` - Neutral backgrounds, light surfaces
- **Warning Red:** `#ef4444` - Urgent notifications (3+ days overdue), errors
- **Warning Orange:** `#f97316` - Caution state (due today), in-progress states

**Text Colors:**

- **Dark Text:** `#1f2937` (Gray-800) - Primary body text
- **Muted Text:** `#6b7280` (Gray-500) - Secondary text, labels
- **Light Text:** `#f9fafb` (Gray-50) - Text on dark backgrounds

### Design Principles

- **Softness:** All borders should be rounded (`rounded-lg` or `rounded-xl` minimum)
- **Nature-inspired:** Use organic, flowing shapes where possible
- **Approachable:** Avoid harsh edges or aggressive design
- **Accessibility-first:** All colors must meet WCAG 2.1 AA contrast ratios (min 4.5:1)
- **Touch-friendly:** All interactive elements minimum 44x44px
- **Consistent spacing:** Follow 8px grid system (8, 16, 24, 32, 40, 48px)

---

## 2. COMPONENT STRUCTURE & NAMING

### Naming Convention

- **Files:** `PascalCase.tsx` for components (e.g., `PlantCard.tsx`)
- **Directories:** `kebab-case` for feature folders (e.g., `plant-card/`, `notification-modal/`)
- **Constants/Types:** `UPPER_SNAKE_CASE` for constants, `PascalCase` for types
- **Props interfaces:** `${ComponentName}Props` (e.g., `PlantCardProps`)

### File Organization

```
src/
├── components/
│   ├── common/           # Reusable UI components (buttons, cards, inputs)
│   ├── features/         # Feature-specific components (plant-management, auth)
│   ├── layout/           # Layout components (header, sidebar, navigation)
│   └── ui/              # Base UI primitives (from shadcn/ui)
├── hooks/               # Custom React hooks
├── types/               # TypeScript type definitions
├── utils/               # Utility functions
├── styles/              # Global CSS, theme configuration
└── routes/              # React Router v7 route definitions (loaders, actions)
```

---

## 3. COMPONENT DESIGN STANDARDS

### All Components Must Include:

#### 1. **TypeScript Props Interface**

```typescript
interface ComponentNameProps {
  // Props with JSDoc comments
  /** Brief description of prop */
  propName: type;
}
```

#### 2. **Tailwind CSS Styling**

- Use Tailwind utility classes exclusively (no custom CSS files)
- Follow mobile-first approach: default to mobile, add breakpoints for larger screens
- Use `dark:` prefix for dark mode support
- Consistent spacing: use `gap-`, `p-`, `m-` classes in multiples of 4 (4, 8, 12, 16, 20, 24, 32, 48)

#### 3. **Accessibility Features**

- All buttons must have `aria-label` when text is not visible
- All inputs must have associated `<label>` elements with `htmlFor` attribute
- All images must have descriptive `alt` text
- Use semantic HTML: `<button>`, `<a>`, `<nav>`, `<main>`, `<section>` tags
- Focus states: visible focus outline using `focus:ring-2 focus:ring-primary-green`
- Keyboard navigation must work without mouse

#### 4. **Error Handling & Loading States**

- Handle loading states with visual feedback (spinners, skeleton screens)
- Display error messages in a user-friendly way (avoid technical jargon)
- Use optional chaining and null coalescing to prevent runtime errors
- All async operations should have try/catch blocks with appropriate error UI

### Component Categories & Standards

#### **Buttons**

- Primary CTA: Green background, white text, rounded-lg, 44px+ height
- Secondary: Green outline/border, transparent background
- Danger (delete): Red/orange, white text
- Disabled: Gray background, muted cursor
- Loading state: Spinner inside button, text grayed out
- Example: `<button className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:ring-2 focus:ring-green-300 transition-colors">`

#### **Cards & Containers**

- Background: White or light-green (`bg-white` or `bg-green-50`)
- Border: Subtle green border (`border border-green-200`) or shadow
- Rounded corners: `rounded-xl` (24px) minimum for plant cards
- Shadow: `shadow-sm` or `shadow` for depth
- Padding: `p-4` (mobile) or `p-6` (desktop) minimum
- Example: Plant cards should feel like "living" elements with soft shadows

#### **Inputs & Forms**

- Background: `bg-white` or `bg-green-50`
- Border: `border border-green-200` on default, `border-green-500` on focus
- Rounded: `rounded-lg`
- Padding: `px-4 py-3` minimum (44px height including label spacing)
- Focus: `focus:ring-2 focus:ring-green-300 focus:border-green-500`
- Placeholder: Use muted gray (`text-gray-400`)
- Example: "Water today" input should feel natural and inviting

#### **Icons**

- Use 24-32px for primary actions, 16px for secondary
- Color: Inherit from text or use green theme
- Ensure proper contrast and visibility
- Icons should have aria-labels when not accompanied by text

#### **Text & Typography**

- Body text: `text-base` (16px) minimum for readability
- Headings: Use semantic tags (`<h1>`, `<h2>`, etc.) with appropriate sizes
- Line height: `leading-relaxed` (1.625) for body text
- Font family: System fonts (Tailwind default) for fast loading
- Color: Use `text-gray-900` for primary text, `text-gray-600` for secondary

#### **Modals & Overlays**

- Background: Dark overlay with `bg-black bg-opacity-50`
- Card: White or light-green background, `rounded-xl` corners
- Padding: `p-6` or `p-8`
- Close button: Top-right, 44x44px, easy to tap
- Animations: Smooth fade-in/out, no jarring transitions

---

## 4. CODE STYLE & BEST PRACTICES

### TypeScript Rules

- **Strict Mode:** Always use `"strict": true` in tsconfig
- **No `any` type:** Use proper typing, `unknown` only when necessary
- **Props typing:** Always define props interface, use function signature with explicit return type
- **Return types:** Explicitly type function returns (especially for hooks)
- **Optional properties:** Use `property?: type` pattern
- **Union types:** Prefer `'yes' | 'no'` over `boolean` when meaningful

### React Patterns

- **Functional components only:** No class components
- **Custom hooks:** Extract reusable logic into `useCustomHook` pattern
- **Hook dependencies:** Always provide complete dependency arrays, use ESLint rules
- **Event handlers:** Use `const handleAction = () => {}` naming
- **Conditional rendering:** Use ternary or logical operators, avoid complex nested logic
- **Key prop:** Always provide stable, unique keys for lists (never use index as key)

### React Router v7 & Remix Patterns

- **Route components:** Components at `src/routes/` should export default component and loader/action if needed
- **Loaders:** Use Remix/React Router loaders for data fetching (server-side when possible)
- **Actions:** Use actions for form submissions and mutations
- **useLoaderData hook:** Get data from loaders in components
- **Form component:** Use Remix `<Form>` component for forms instead of HTML forms
- **Navigation:** Use `<Link>` from react-router-dom for internal navigation
- **useNavigate hook:** For programmatic navigation after actions complete
- **useParams hook:** Extract route parameters for dynamic routes

Example pattern:

```typescript
// routes/plants.$id.tsx
export const loader: LoaderFunction = async ({ params }) => {
  const plant = await fetchPlant(params.id);
  return json({ plant });
};

export default function PlantDetailsRoute() {
  const { plant } = useLoaderData<typeof loader>();
  return <PlantDetails plant={plant} />;
}
```

### Tailwind & Styling

- **Utility-first:** Use Tailwind classes, avoid custom CSS files
- **Responsive design:** Mobile-first approach
  - Base classes: mobile
  - `sm:` breakpoint: 640px
  - `md:` breakpoint: 768px
  - `lg:` breakpoint: 1024px
- **Custom colors:** Use CSS variables in Tailwind config, not inline hex values
- **Dark mode:** Support dark mode with `dark:` prefix where applicable
- **Hover/Focus states:** Always include for interactive elements
- **Transitions:** Use `transition-colors`, `transition-opacity` for smooth effects

### Component Composition

- **Single Responsibility:** Each component has one primary job
- **Props as configuration:** Use props to customize behavior, avoid hard-coded values
- **Children prop:** Use `React.ReactNode` for flexible composition
- **Compound components:** Create related components together (e.g., `Card`, `CardHeader`, `CardBody`)
- **Default props:** Provide sensible defaults using default parameter values

### Performance

- **Memoization:** Use `React.memo()` for components that receive same props frequently
- **useCallback:** Memoize callbacks passed as props to memoized children
- **useMemo:** Only use for expensive calculations, not premature optimization
- **Image optimization:** Lazy load images with `loading="lazy"`, use appropriate alt text
- **Code splitting:** Use React Router v7's built-in code splitting for routes

### Error Handling & Validation

- **Input validation:** Validate on both client and server side
- **Try/catch blocks:** All async operations should be wrapped
- **User feedback:** Always show errors to users in plain language
- **Graceful degradation:** Non-critical failures shouldn't break the app
- **Type safety:** Use TypeScript to catch errors at compile time
- **Error boundaries:** Consider implementing for critical sections

### Documentation

- **JSDoc comments:** Document public methods and complex logic
  ```typescript
  /**
   * Calculates the next watering date
   * @param lastWatered - ISO date string of last watering
   * @param frequencyDays - Number of days between waterings
   * @returns ISO date string of next watering date
   */
  function getNextWateringDate(lastWatered: string, frequencyDays: number): string {}
  ```
- **Component comments:** Explain non-obvious design decisions
- **Inline comments:** Use sparingly, only for "why" not "what"

---

## 5. FLORAL THEME SPECIFICS

### Visual Elements

- **Plant imagery:** Use high-quality, well-lit plant photos
- **Leaf shapes:** Incorporate organic, leaf-like shapes in decorative elements
- **Nature colors:** Stick to green, brown, and earth tones
- **Growth metaphors:** Use icons/animations that suggest growth and health

### Micro-interactions

- **Button animations:** Subtle scale or color shift on hover/press
- **Loading states:** Animated plant growth or leaf flutter
- **Success feedback:** Subtle plant "bloom" animation or checkmark with green highlight
- **Watering feedback:** Water droplet or leaf shine animation

### Imagery Guidelines

- **Plant photos:** Bright, well-composed, shows plant clearly
- **Backgrounds:** Soft, light green or neutral, never harsh
- **Icons:** Rounded, friendly, botanical when possible

---

## 6. ACCESSIBILITY REQUIREMENTS (WCAG 2.1 AA)

### Color Contrast

- Minimum 4.5:1 for normal text
- Minimum 3:1 for large text (18pt+ or 14pt bold+)
- Don't use color alone to convey information (combine with icons, text, or patterns)

### Interactive Elements

- **Minimum size:** 44x44px for buttons and touch targets
- **Focus indicator:** Visible outline, minimum 3px, high contrast
- **Keyboard navigation:** Tab order must be logical, Escape to close modals
- **Skip links:** For navigating past repetitive content (if applicable)

### Content & Language

- **Clear labels:** Use action-oriented, specific language
- **Plain language:** Avoid jargon, explain technical terms
- **Consistent terminology:** Use the same words for the same actions
- **Help text:** Provide context for complex fields

### Alternative Content

- **Images:** Always include descriptive alt text
- **Icons without text:** Use aria-label
- **Forms:** Associate labels with inputs using htmlFor
- **Data tables:** Use proper semantic structure

---

## 7. COMPONENT CHECKLIST

Before submitting any component, ensure it meets:

- [ ] TypeScript props interface defined with JSDoc
- [ ] Tailwind CSS only (no custom CSS files)
- [ ] Mobile-first responsive design
- [ ] Accessible: 44px+ buttons, proper ARIA labels, semantic HTML
- [ ] Focus states: `focus:ring-2 focus:ring-green-300`
- [ ] Loading state: Visual feedback for async operations
- [ ] Error handling: Try/catch for async, user-friendly messages
- [ ] Color contrast: WCAG 2.1 AA compliant (4.5:1 minimum)
- [ ] Green/floral theme: Consistent colors from palette
- [ ] Rounded corners: `rounded-lg` minimum (16px)
- [ ] Proper spacing: 8px grid system
- [ ] No `any` types in TypeScript
- [ ] Keyboard navigation: All interactive elements keyboard-accessible
- [ ] Dark mode: Supports dark theme (if applicable)
- [ ] Testing: Components tested with different screen sizes
- [ ] Performance: No unnecessary re-renders, memoization where appropriate
- [ ] Documentation: JSDoc comments on public APIs

---

## 8. EXAMPLE: PlantCard COMPONENT

```typescript
import { Link } from 'react-router-dom';

interface PlantCardProps {
  /** Plant ID from database */
  id: string;
  /** Plant name (e.g., "Monstera Deliciosa") */
  name: string;
  /** Image URL of the plant */
  imageUrl: string;
  /** Days since last watering */
  daysSinceWatered: number;
  /** Days until next watering */
  daysUntilWatering: number;
}

/**
 * PlantCard - Displays a single plant in the dashboard
 * Shows plant photo, name, and watering status
 */
export function PlantCard({
  id,
  name,
  imageUrl,
  daysSinceWatered,
  daysUntilWatering,
}: PlantCardProps) {
  return (
    <Link
      to={`/plants/${id}`}
      className="flex flex-col gap-3 bg-white rounded-xl shadow hover:shadow-lg transition-shadow focus:ring-2 focus:ring-green-300 focus:outline-none p-4"
      aria-label={`View ${name} details`}
    >
      {/* Image Container */}
      <div className="relative w-full h-48 rounded-lg overflow-hidden">
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>

      {/* Plant Name */}
      <h3 className="text-base font-semibold text-gray-900">{name}</h3>

      {/* Watering Status */}
      <div className="flex flex-col gap-2 text-sm">
        <p className="text-gray-600">
          Last watered: <span className="font-medium text-gray-900">{daysSinceWatered} days ago</span>
        </p>
        <p className="text-gray-600">
          Next: <span className="font-medium text-green-600">in {daysUntilWatering} days</span>
        </p>
      </div>
    </Link>
  );
}
```

---

## 9. ADDITIONAL RESOURCES

- **Tailwind CSS Docs:** https://tailwindcss.com/docs
- **shadcn/ui Components:** https://ui.shadcn.com
- **Web Accessibility Guidelines:** https://www.w3.org/WAI/WCAG21/quickref/
- **React Router v7 Documentation:** https://reactrouter.com/start
- **Remix Documentation:** https://remix.run/docs
- **React Best Practices:** https://react.dev
