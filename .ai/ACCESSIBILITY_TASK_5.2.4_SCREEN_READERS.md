# Task 5.2.4: Screen Reader Testing - Implementation Guide

## What a Screen Reader Does

A screen reader is software that:
1. **Reads page content aloud** to users who are blind or low vision
2. **Announces interactive elements** ("button", "link", "form input")
3. **Reads form labels** so user knows what field is for
4. **Announces structure** (headings, lists, landmarks)
5. **Provides navigation shortcuts** (jump to next heading, button, etc.)

**Popular screen readers:**
- NVDA (Windows, free, open source) - https://www.nvaccess.org/
- JAWS (Windows, expensive, most popular professionally)
- VoiceOver (Mac/iOS, built-in)
- TalkBack (Android, built-in)

---

## How to Test with NVDA (Free)

### Install NVDA

1. Download: https://www.nvaccess.org/download/
2. Run installer
3. Launch NVDA (typically Ctrl+Alt+N or from Start menu)

### Basic Commands

| Command | What it does |
|---------|------------|
| Insert+Home | Start reading from top |
| Insert+Down | Read next line |
| Insert+Up | Read previous line |
| H | Jump to next heading |
| N | Jump to next navigation |
| B | Jump to next button |
| F | Jump to next form field |
| L | Jump to next list |
| T | Jump to next table |
| Escape | Stop reading |

### Test Procedure

1. Open Flor.io in browser
2. Start NVDA
3. Press Insert+Home to read from top
4. Listen to what's announced
5. Check if it makes sense

### What Should Be Announced

**Good example (login page):**
```
"Flor link"
"Login, heading level 1"
"Create Account, heading level 2"
"Email, text input"
"Password, password input"
"Create Account, button"
"Already have an account? Sign in, link"
```

**Bad example:**
```
"Image"                    (no alt text - what is it?)
"Create Account"           (no heading level)
"Button"                   (what button? no label)
"Link"                     (where does it go? no text)
```

---

## Current State of Flor.io

### ✅ Already Good

1. **Semantic HTML**
   - Uses `<main>`, `<nav>`, `<form>` ✅
   - Uses `<h1>`, `<h2>` headings ✅
   - Uses `<button>` elements ✅

2. **Form Structure**
   - Uses `<label htmlFor>` (connected!) ✅
   - Inputs have proper names ✅

3. **Button Labels**
   - Icon buttons have `aria-label` ✅
   - Example: `aria-label="Notifications (5)"`

### ⚠️ Need to Verify

1. **Page Structure**
   - Are there `<main>` landmarks?
   - Are there proper `<nav>` elements?
   - Is heading hierarchy correct (h1 → h2 → h3)?

2. **Images**
   - Do all images have alt text?
   - Is alt text descriptive?

3. **Links**
   - Do links have clear text?
   - Is "Click here" avoided?

4. **Forms**
   - Are labels associated with inputs?
   - Are required fields announced?

5. **Live Regions**
   - Are updates announced (toasts, notifications)?
   - Using `aria-live="polite"`?

---

## Implementation Checklist

### Step 1: Use Semantic HTML

**Good semantic elements:**

```tsx
// Page structure
<main>
  {/* Main content */}
</main>

<nav>
  {/* Navigation links */}
</nav>

<section>
  {/* Major section with heading */}
</section>

<article>
  {/* Article content */}
</article>

<form>
  {/* Form fields */}
</form>

// Headings in proper hierarchy
<h1>Page Title</h1>
<h2>Section 1</h2>
<h3>Subsection</h3>
<h2>Section 2</h2>
```

**Bad - using divs everywhere:**

```tsx
// DON'T DO THIS:
<div id="main">
  <div id="nav">...</div>
  <div id="section">
    <div id="heading">Title</div>
  </div>
</div>
```

### Step 2: Form Labels Must Be Connected

**Good - label connected to input:**

```tsx
<label htmlFor="email">Email:</label>
<input id="email" type="email" name="email" />

// Screen reader announces: "Email, text input"
```

**Bad - label not connected:**

```tsx
<label>Email:</label>
<input type="email" name="email" />

// Screen reader announces: "Text input" (what's it for?)
```

**Bad - no label:**

```tsx
<input type="email" placeholder="Email" />

// Placeholder disappears when typing, user confused
```

### Step 3: Alt Text for Images

**Good - descriptive alt text:**

```tsx
<img
  src="monstera.jpg"
  alt="Monstera deliciosa plant in white pot with 6 leaves"
/>

// Screen reader announces: "Monstera deliciosa plant in white pot with 6 leaves"
```

**Bad - no alt text:**

```tsx
<img src="monstera.jpg" />

// Screen reader announces: "Image" (not helpful)
```

**Bad - obvious alt text:**

```tsx
<img src="logo.png" alt="Logo" />

// Better: "Flor logo"
```

### Step 4: Icon Button Labels

**Good - icon with aria-label:**

```tsx
<button aria-label="Delete plant">
  <Trash className="h-5 w-5" />
</button>

// Screen reader announces: "Delete plant, button"
```

**Bad - icon no label:**

```tsx
<button>
  <Trash className="h-5 w-5" />
</button>

// Screen reader announces: "Button" (what does it do?)
```

### Step 5: Link Text

**Good - clear link text:**

```tsx
<a href="/plants/123">View plant details</a>

// Screen reader announces: "View plant details, link"
```

**Bad - generic link text:**

```tsx
<a href="/plants/123">Click here</a>

// Confusing when read in list of links
```

**Bad - no text:**

```tsx
<a href="/plants/123">
  <ChevronRight />
</a>

// Screen reader announces: "Link" (where?)
// Add: aria-label="View plant 123"
```

### Step 6: Live Region Updates

For notifications/toasts that appear dynamically:

**Good - announces change:**

```tsx
<div aria-live="polite" aria-atomic="true">
  {notification && <p>{notification.message}</p>}
</div>

// When notification appears, screen reader announces it
```

**Bad - no announcement:**

```tsx
<div>
  {notification && <p>{notification.message}</p>}
</div>

// User doesn't know message appeared
```

### Step 7: Heading Hierarchy

**Good - proper hierarchy:**

```tsx
<h1>Dashboard</h1>        {/* Page title */}
  <h2>My Plants</h2>      {/* Main section */}
    <h3>Monstera</h3>     {/* Plant name */}
  <h2>Rooms</h2>          {/* Another main section */}
    <h3>Living Room</h3>
```

**Bad - skipping levels:**

```tsx
<h1>Dashboard</h1>
  <h3>My Plants</h3>      {/* Jumped from h1 to h3! */}
    <h2>Monstera</h2>     {/* Then back to h2 */}
```

### Step 8: Form Validation

**Good - announces validation:**

```tsx
<input
  id="email"
  type="email"
  aria-invalid={hasError}
  aria-describedby={hasError ? "email-error" : undefined}
/>
{hasError && (
  <div id="email-error" role="alert">
    Invalid email format
  </div>
)}

// Screen reader announces: "Invalid email format" when error appears
```

---

## Current Flor.io Audit

### Files to Check

1. **`app/root.tsx`** - Root layout
   - [ ] Has `<main>` for main content?
   - [ ] Has `<nav>` for navigation?

2. **`app/components/nav.tsx`** - Navigation
   - [ ] Is it wrapped in `<nav>` tag?
   - [ ] Do buttons have aria-label?
   - [ ] Are links clear?

3. **Plant Form** - `app/components/plant-form.tsx`
   - [ ] All inputs have `<label htmlFor>`?
   - [ ] Are labels connected correctly?
   - [ ] Error messages announced?

4. **Plant Card** - `app/components/plant-card.tsx`
   - [ ] Has alt text on plant photo?
   - [ ] Is structure semantic?

5. **Plant Details Page** - `app/routes/dashboard.plants.$plantId.tsx`
   - [ ] Has `<h1>` for plant name?
   - [ ] Section headings properly structured?
   - [ ] Collapsible sections properly announced?

---

## ARIA Attributes

Use ARIA (Accessible Rich Internet Applications) when semantic HTML isn't enough:

### aria-label
```tsx
// When element has no visible text
<button aria-label="Delete plant">
  <Trash />
</button>
```

### aria-describedby
```tsx
// Link element to explanation
<input
  aria-describedby="password-hint"
  type="password"
/>
<p id="password-hint">Must be at least 8 characters</p>
```

### aria-invalid & aria-required
```tsx
<input
  required
  aria-required="true"
  aria-invalid={hasError}
/>
```

### aria-live
```tsx
// Announce dynamic content
<div aria-live="polite" aria-atomic="true">
  {statusMessage}
</div>
```

### role="alert"
```tsx
// Important announcements
<div role="alert">
  Error: Email is already registered
</div>
```

### role="dialog"
```tsx
// For custom modals
<div role="dialog" aria-labelledby="dialog-title">
  <h2 id="dialog-title">Confirm Delete</h2>
</div>
```

---

## Testing Checklist

- [ ] **Download and install NVDA** (free, Windows)
- [ ] **Test login page** - What's announced? Does it make sense?
- [ ] **Test dashboard** - Can you navigate by headings (H key)?
- [ ] **Test plant details** - Can you understand structure?
- [ ] **Test form fields** - Are labels announced with inputs?
- [ ] **Test error messages** - Are they announced when they appear?
- [ ] **Test buttons** - Do they have clear labels?
- [ ] **Test links** - Do they have clear text?
- [ ] **Test modals** - Are they announced as dialogs?
- [ ] **Test navigation** - Can you navigate with keyboard shortcuts?

---

## Files to Update

### Root Layout (`app/root.tsx`)
- [ ] Wrap main content in `<main>` tag
- [ ] Ensure `<nav>` wraps navigation

### Navigation (`app/components/nav.tsx`)
- [ ] Verify all aria-labels present
- [ ] Check link text is clear

### Forms (All form components)
- [ ] Verify all inputs have `<label htmlFor>`
- [ ] Ensure labels are connected (htmlFor matches input id)
- [ ] Add aria-describedby for help text

### Cards/Components
- [ ] Add alt text to all images
- [ ] Ensure icon buttons have aria-label
- [ ] Use semantic HTML

### Pages
- [ ] Use proper heading hierarchy
- [ ] Use semantic section/article tags
- [ ] Add aria-live for notifications

---

## Success Criteria

✅ All form inputs have associated labels
✅ All images have descriptive alt text
✅ All buttons/icons have clear labels
✅ Page structure uses semantic HTML (main, nav, section, article)
✅ Heading hierarchy is correct (h1 → h2 → h3, no skipping)
✅ Links have clear, descriptive text (not "Click here")
✅ Form validation errors are announced
✅ Dynamic notifications use aria-live
✅ NVDA can navigate page and understand content
✅ Page structure makes sense when read top-to-bottom

