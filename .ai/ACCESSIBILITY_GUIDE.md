# Understanding Web Accessibility - A Beginner's Guide

## What is Web Accessibility?

Web accessibility means **making sure everyone can use your website**, regardless of their abilities. This includes people who:

- Have **vision impairments** (blind, low vision, color blind)
- Have **hearing impairments** (deaf, hard of hearing)
- Have **motor impairments** (can't use a mouse, tremors)
- Have **cognitive disabilities** (dyslexia, ADHD, learning disabilities)
- Are **temporarily disabled** (broken arm, in a hospital, in bright sunlight)
- Have **slow internet** or old devices

**Making your site accessible helps EVERYONE:**

- Users with magnified screens see clearer contrast
- Users on mobile see larger touch targets
- Users on slow internet benefit from semantic HTML
- Users with anxiety appreciate simpler language
- Elderly users appreciate larger fonts and high contrast

---

## Why Accessibility Standards Exist

The **WCAG 2.1 (Web Content Accessibility Guidelines)** is an international standard with three levels:

- **A** (minimum - basic accessibility)
- **AA** (intermediate - covers 80% of needs) ← **We're targeting this**
- **AAA** (advanced - comprehensive)

We're targeting **AA** because it's the legal requirement in most places and covers the widest range of users.

---

# Task 5.2.1: Color Contrast Audit

## What This Means

**Contrast** is the difference in brightness between text and its background.

**Why it matters:**

- People with low vision need high contrast to read text
- People who are color blind can't distinguish certain colors
- People in bright sunlight (outdoor use) struggle with low contrast
- Age-related vision changes make contrast harder

## Current Problem

When you have **light text on light background** or **dark text on dark background**, it's hard to read:

```
❌ BAD: Black text on dark gray background
✅ GOOD: Black text on white background
✅ GOOD: White text on dark background
```

## What We're Checking

### The 4.5:1 Rule for Normal Text (AA standard)

For regular-sized text (less than 18px), contrast ratio must be at least **4.5 to 1**.

**What does 4.5:1 mean?**

- It's a ratio comparing light and dark values
- Example: Black (#000000) on white (#FFFFFF) = 21:1 ratio (excellent!)
- Example: Dark gray (#666666) on medium gray (#999999) = 1.5:1 (bad!)

**Why 4.5:1?**

- Scientific studies show this is the minimum for people with 20/40 vision
- People with low vision (can't see clearly) can still read it
- People with color blindness can still distinguish text

### The 3:1 Rule for Large Text (AA standard)

For **large text** (18px+ or 14px+ bold), contrast ratio can be **3 to 1**.

**Why lower for large text?**

- Large text is already easier to see
- The larger size compensates for lower contrast
- We're testing button labels, headings

## What We Need to Check in Flor.io

1. **Form labels and input text**
   - Regular label text on white background
   - Input text on white background
   - Placeholder text (often too light!)

2. **Button labels**
   - White text on green button
   - Dark text on light button

3. **Status colors**
   - Green for "needs watering" status
   - Orange for "overdue" status
   - Red for "very overdue" status
   - Must be readable, not rely on color alone

4. **Links**
   - Link color must contrast with text color
   - Not just underlined in same color

5. **Error messages**
   - Red error text on white background
   - "Help text" next to fields

6. **Dark mode**
   - All contrast rules apply to dark theme too!
   - White on dark background must still be 4.5:1+

## How to Check Contrast

### Tool 1: WebAIM Contrast Checker

- Visit: https://webaim.org/resources/contrastchecker/
- Enter foreground color (text): `#000000`
- Enter background color: `#FFFFFF`
- It shows: Passes AA? Yes/No

### Tool 2: Browser DevTools

- Right-click element → Inspect
- Go to "Styles" panel
- Look for contrast info in newer browsers

### Tool 3: Browser Extension

- "axe DevTools" Chrome/Edge extension (free)
- Automatically finds contrast issues
- Shows you which elements fail

## Examples for Flor.io

### Status Colors

```
OVERDUE PLANT (currently: orange status)
- Need to check: Dark text on orange background = 4.5:1? YES/NO
- Also add: Icon (not just color) to indicate status

GREEN (healthy): #10b981
WHITE text on green: 4.5:1? YES
Dark text on green: 4.5:1? NO - use white instead

ORANGE (overdue): #f59e0b
BLACK text on orange: 4.5:1? YES
WHITE text on orange: 4.5:1? NO - use black instead

RED (very overdue): #ef4444
WHITE text on red: 4.5:1? YES
BLACK text on red: 4.5:1? NO - use white instead
```

### Form Error Messages

```
Currently: Red background with red text
Problem: May not meet 4.5:1 ratio

Solution:
- Dark text (#7f1d1d = dark red) on light red background (#fee2e2)
- OR white text (#ffffff) on red background (#dc2626)
- Verify with WebAIM checker
```

## What Changes We Might Make

1. **Adjust brand colors** if they don't meet contrast requirements
2. **Change placeholder text color** to darker for visibility
3. **Update status colors** to use appropriate text colors
4. **Ensure error messages** have dark text on light background
5. **Add icons to colored elements** (don't rely on color alone)

---

# Task 5.2.2: Touch Target Sizes

## What This Means

**Touch target** = the clickable/tappable area of a button, link, or interactive element.

**Why it matters:**

- Mobile users tap with fingers, not mouse cursors
- People with tremors miss small buttons
- Elderly users have less precise motor control
- Users wearing gloves struggle with small buttons
- Children struggle with small targets

## The 44x44px Rule

**WCAG 2.1 AA standard:** Interactive elements must be at least **44×44 pixels** in size.

**What counts as interactive?**

- Buttons
- Links
- Form inputs (height of textbox)
- Checkboxes and radio buttons
- Icon buttons
- Clickable cards

## Why 44x44?

- Research shows this is the minimum comfortable tap size for most people
- Standard finger tip is about 40-50px wide
- 44×44 gives 6mm of space (about the size of a finger pad)
- Smaller = misses, accidental clicks

## Examples from Flor.io

### ✅ What's Already Good

- "Create Plant" button (likely 44px+ height)
- Input fields (likely 44px+ height)
- Most buttons in UI

### ⚠️ What Might Need Checking

```
Small icon buttons:
- Delete icon on plant cards
- Edit icon on plants
- X button to close modals
- Heart icon for favorites (if we add)

Problem: Icon itself might be 16×16px
Fix: Add padding around icon to make total 44×44px

Current (example):
<button>
  <Trash icon 16×16px />
</button>

Better:
<button className="w-11 h-11 flex items-center justify-center">
  <Trash icon 16×16px />
</button>
```

## Special Cases

### Form Inputs

```
GOOD: <input className="h-11 px-4" />  /* 44px height */
BAD:  <input className="h-6 px-2" />   /* 24px height */
```

### Links

```
Text link: "Edit Plant"
- Click area = link text width
- If short link, add padding

Bad:  <a href="#"> Edit </a>  /* Maybe 30px tall */
Good: <a href="#" className="px-2 py-1"> Edit </a>  /* ~44px tall */

OR make parent element larger
```

### Checkboxes and Radio Buttons

```
shadcn/ui components already handle this well
BUT native HTML checkboxes are 16x16px = BAD

Solution: Ensure label is associated and clickable
<label className="flex items-center gap-2 cursor-pointer">
  <input type="checkbox" />
  <span>Accept terms</span>  {/* User can click text too */}
</label>
```

## How to Test

1. **Open DevTools** (F12 in Chrome)
2. **Inspect element** you want to test
3. **Look at computed styles** - note width and height
4. **On mobile** - try tapping with finger (not stylus)
5. **Test on actual phone** - different for touch than mouse

## Changes We'll Make

1. **Review all button sizing** - ensure 44×44 minimum
2. **Add padding to small icons** - makes hit area larger
3. **Ensure form inputs** are 44px tall
4. **Check links** - can add background or padding to increase target
5. **Test spacing between buttons** - should be 8px+ apart to avoid mis-taps

---

# Task 5.2.3: Keyboard Navigation

## What This Means

**Users should be able to use your entire site with keyboard only** - no mouse needed.

**Why it matters:**

- People with motor disabilities can't use mice
- Power users prefer keyboard (faster)
- People with tremors need steady movement (keyboard vs shaky mouse)
- Screen reader users primarily use keyboard
- Some assistive technology is keyboard-driven
- Mobile keyboards (and assistive keyboards) are less precise

## The Full Flow

1. **Tab key** - moves focus to next interactive element
2. **Shift+Tab** - moves focus to previous element
3. **Enter/Space** - activates buttons
4. **Enter** - submits forms
5. **Escape** - closes modals, cancels actions
6. **Arrow keys** - navigate within components (menus, tabs, selects)

## Visible Focus Indicator

**Focus** = which element your keyboard interaction will affect

**Why visibility matters:**

- Without seeing focus, you don't know what will happen if you press Enter
- Keyboard users MUST see where they are

### Good Focus Indicator

```
Blue outline or ring around element
Example: <button className="focus:ring-2 focus:ring-blue-400" />
```

### Bad Focus Indicator

```
No outline at all (browser default removed)
Invisible focus (light gray on gray background)
Color change only (not visible when focused)
```

## What We Need to Test for Flor.io

### 1. Tab Order Should Be Logical

**Expected order:**

```
Login Form:
1. Email input
2. Password input
3. Login button
4. Sign Up link

(Top to bottom, left to right)
```

**Problem:**

```
Sometimes tab order is weird:
1. Something at bottom of page
2. Something at top
3. Random middle element

Cause: Wrong z-index, wrong HTML order, CSS positioning messes up order
```

**How we ensure good order:**

- HTML elements in logical order
- Avoid heavy CSS positioning that changes visual order
- Use CSS flexbox/grid for layout (respects HTML order)

### 2. All Interactive Elements Must Be Keyboard-Accessible

**Must work with Tab + Enter/Space:**

- Buttons → Enter/Space = click
- Links → Enter = navigate
- Form inputs → Tab = focus, type text
- Checkboxes → Space = check/uncheck
- Dropdowns → Tab to open, Arrow keys to navigate, Enter to select
- Modals → Tab trapped inside, Escape closes

### 3. Focus Trap in Modals

When modal opens:

- Focus moves INTO the modal
- Pressing Tab cycles through modal elements only
- CANNOT tab to background elements (behind modal)
- Pressing Escape closes modal

**Example (with focus-trap library):**

```tsx
import { FocusTrap } from 'focus-trap-react';

<FocusTrap>
  <Dialog>
    <DialogContent>
      <Button>Close</Button>
      <Button>Save</Button>
    </DialogContent>
  </Dialog>
</FocusTrap>;
```

shadcn/ui Dialog already has this built-in!

### 4. Visible Focus Styles

Every focusable element needs visible outline or ring:

```css
/* Default browser outline (good enough) */
:focus-visible {
  outline: 2px solid currentColor;
}

/* OR custom ring (TailwindCSS) */
button {
  @apply focus:ring-2 focus:ring-blue-400 focus:outline-none;
}
```

**NOT acceptable:**

```css
:focus {
  outline: none;
} /* NEVER do this without replacement */
```

## How to Test Keyboard Navigation

1. **Close your touchpad/unplug mouse**
2. **Use Tab** to navigate form
3. **Use Arrow keys** in dropdowns
4. **Use Escape** to close modals
5. **Use Enter/Space** to click buttons
6. **Check:** Can you see focus indicator every time?
7. **Check:** Does Tab go to elements in logical order?
8. **Check:** Can you access all buttons/links?

## Changes We'll Make

1. **Verify tab order** - check each page flows logically
2. **Ensure focus indicators** - all elements have visible ring/outline
3. **Test dropdowns** - arrow keys work, space/enter select
4. **Test modals** - focus trapped, Escape closes
5. **Check form submission** - Enter key works, not just button click

---

# Task 5.2.4: Screen Reader Testing

## What This Means

**Screen readers** are programs that read text aloud and announce interactive elements.

**Users:**

- Blind people
- Severely visually impaired people
- Some people with dyslexia (audio helps processing)

**Popular screen readers:**

- JAWS (Windows, expensive)
- NVDA (Windows, free, open source)
- VoiceOver (Mac/iOS, built-in)
- TalkBack (Android, built-in)

## How Screen Readers Work

1. **Parse HTML** to understand document structure
2. **Read text content** aloud
3. **Announce interactive elements** ("button", "link", "form input")
4. **Read alt text** for images
5. **Announce form labels** so user knows what field is
6. **Navigate by** element type (next button, next heading, etc.)

## What Screen Reader User Hears

### Good Example:

```
(Visits plant details page)
"Plant details, heading level 1"
"Large photo of monstera plant"
"Monstera deliciosa, heading level 2"
"Status: Last watered 2 days ago, Next watering in 5 days"
"Watered today button"
"Light requirements section, expandable, collapsed"
(User presses arrow key)
"Light requirements: Bright indirect light, 6-8 hours daily"
```

### Bad Example:

```
(Same page with accessibility problems)
"Page"
"Image" (no alt text - what is it?)
"Monstera deliciosa" (no heading announced)
"Button" (what does this button do? No label!)
(User navigates and has no idea what's on the page)
```

## What We Need for Flor.io

### 1. Semantic HTML (Correct Element Types)

**Semantic** = HTML elements that describe their meaning

```html
<!-- BAD: Divs everywhere, no meaning -->
<div>Login</div>
<div>Enter your email</div>
<div>Email: <input /></div>
<div>Login</div>

<!-- GOOD: Semantic elements -->
<main>
  <h1>Login</h1>
  <form>
    <label for="email">Enter your email</label>
    <input id="email" />
    <button type="submit">Login</button>
  </form>
</main>
```

**Elements we need:**

- `<main>` - main content area (one per page)
- `<nav>` - navigation area
- `<h1>, <h2>, <h3>` - headings (proper hierarchy)
- `<form>` - wraps forms
- `<label htmlFor="id">` - labels for inputs
- `<button>` - buttons (not divs)
- `<a>` - links (not divs with onclick)
- `<section>` - major content sections
- `<article>` - article/post content

### 2. Form Labels Must Be Associated

```html
<!-- BAD: Label not connected -->
<label>Email:</label>
<input name="email" />

<!-- GOOD: Label connected with htmlFor -->
<label htmlFor="email">Email:</label>
<input id="email" name="email" />

Screen reader says: "Email, text input field"
```

### 3. Images Must Have Alt Text

```html
<!-- BAD: No alt text -->
<img src="monstera.jpg" />

<!-- GOOD: Descriptive alt text -->
<img src="monstera.jpg" alt="Monstera deliciosa plant in white pot" />

Screen reader says: "Monstera deliciosa plant in white pot"
```

**Good alt text:**

- Describes the image content
- Should be what you'd say about the image
- For icons: describe the action, not the picture
  - Icon of trash can = alt="Delete plant" (not "Trash can icon")
  - Icon of pencil = alt="Edit plant" (not "Pencil icon")

### 4. Buttons Must Have Clear Labels

```html
<!-- BAD: No text, unclear icon -->
<button>
  <svg><!-- trash icon --></svg>
</button>

<!-- GOOD: Button has text OR aria-label -->
<button>Delete Plant</button>

<!-- OR if just icon -->
<button aria-label="Delete plant">
  <svg><!-- trash icon --></svg>
</button>

Screen reader says: "Delete plant button"
```

### 5. Page Structure/Headings

Users should be able to navigate by headings:

```html
<!-- GOOD: Clear structure -->
<h1>Dashboard</h1>
<h2>My Plants</h2>
Plant card 1 Plant card 2
<h2>Rooms</h2>
Room list
```

### 6. Use ARIA When Semantic HTML Isn't Enough

**ARIA** = Accessible Rich Internet Applications (extra accessibility info)

```html
<!-- Announce live updates (notifications) -->
<div role="alert" aria-live="polite">Plant watered successfully!</div>

<!-- Announce dialog modals -->
<div role="dialog" aria-labelledby="dialog-title">
  <h2 id="dialog-title">Confirm Delete</h2>
  ...
</div>

<!-- Describe custom components -->
<div role="progressbar" aria-valuenow="75" aria-valuemin="0" aria-valuemax="100">75%</div>
```

## How to Test with Screen Reader (NVDA on Windows)

1. **Download NVDA** (free): https://www.nvaccess.org/
2. **Start NVDA** (Ctrl + Alt + N typically)
3. **Start reading page** (Insert + Home)
4. **Navigate by element** (Arrow keys, T for next heading, B for next button)
5. **Listen to what's announced** - does it make sense?
6. **Check forms** - are labels announced with inputs?
7. **Check buttons** - are all buttons announced?

## Changes We'll Make

1. **Use semantic HTML** - proper headings, forms, buttons
2. **Add form labels** - ensure `<label htmlFor>` connected to inputs
3. **Add alt text** - for all meaningful images (not decorative ones)
4. **Button labels** - all buttons have text or aria-label
5. **Page structure** - clear heading hierarchy
6. **Live regions** - notifications use `aria-live="polite"`
7. **Test with NVDA** - verify reading experience makes sense

---

# Task 5.2.5: Language & Labels Review

## What This Means

**Use clear, specific language that all users can understand.**

**Why it matters:**

- People with cognitive disabilities understand simpler language
- Non-native English speakers understand clearer language
- People with dyslexia understand concrete language better
- Everyone is faster with clear instructions
- Clear labels reduce anxiety about forms

## Principles

### 1. Be Specific, Not Vague

```
❌ BAD:  "Choose", "Select", "Do", "Click here"
✅ GOOD: "Select a room", "Choose watering frequency", "Delete plant"

❌ BAD:  "OK" button (OK what?)
✅ GOOD: "Save Changes", "Create Plant", "Cancel"
```

### 2. Use Action Words

```
❌ BAD:  "Settings" button (what will it do?)
✅ GOOD: "Edit Profile" button

❌ BAD:  "X" button (X what?)
✅ GOOD: "Close dialog" button (with aria-label)

❌ BAD:  "+", "..." (unclear)
✅ GOOD: "Add Plant", "More Options"
```

### 3. Error Messages Must Be Specific

```
❌ BAD:  "Error"
❌ BAD:  "Invalid input"
❌ BAD:  "Something went wrong"

✅ GOOD: "Email is already registered"
✅ GOOD: "Plant name must be 100 characters or less"
✅ GOOD: "Watering frequency must be between 1 and 365 days"
```

**Error messages should:**

- Say what's wrong (not just "Error")
- Suggest how to fix it
- Be written simply

### 4. Avoid Jargon

```
❌ BAD:  "Hydration schedule optimization"
✅ GOOD: "Watering frequency"

❌ BAD:  "Photosynthetic requirements"
✅ GOOD: "Light requirements"

❌ BAD:  "Biological nomenclature"
✅ GOOD: "Scientific name"
```

### 5. Use Consistent Terminology

```
✅ Use ONE term consistently:
- "Watering" not "Water", "Hydrate", "Wet"
- "Delete" not "Remove", "Trash", "Destroy"
- "Save" not "Store", "Keep", "Submit" (use "Submit" for forms)

If you say "Delete Plant" somewhere,
say "Delete Plant" everywhere (not "Remove Plant")
```

### 6. Form Field Labels and Help Text

```
❌ BAD:
<input placeholder="How often to water?" />

✅ GOOD:
<label>Watering Frequency (days)</label>
<input placeholder="e.g., 7" />
<p>How often to water in days (1-365)</p>
```

**Why:**

- Placeholder disappears when typing
- Label always visible
- Help text explains what expected
- User doesn't have to guess

### 7. Use Active Voice

```
❌ BAD:  "Plant was watered"
✅ GOOD: "You watered the plant"

❌ BAD:  "Changes have been saved"
✅ GOOD: "Your changes have been saved"
```

### 8. Keep Instructions Concrete

```
❌ BAD:  "Enter a reasonable frequency"
✅ GOOD: "Enter a frequency between 1 and 365 days"

❌ BAD:  "Upload a good photo"
✅ GOOD: "Upload a clear photo of your plant (JPG or PNG, under 10MB)"
```

## Flor.io Language Audit

### Current Good Examples

- "Plant Name" (clear)
- "Watering Frequency (days)" (specific)
- "Light Requirements" (concrete)

### Areas to Check

- Button labels - all specific and action-oriented?
- Error messages - all specific?
- Help text - all concrete and helpful?
- Form labels - all use proper `<label>` tags?
- Page headings - all descriptive?
- Link text - does link text make sense out of context?
  - ❌ "Click here" link
  - ✅ "View plant details" link

## Changes We'll Make

1. **Review all button labels** - ensure action-oriented
2. **Review all error messages** - ensure specific
3. **Audit form labels** - all use proper `<label>` tags
4. **Check help text** - all concrete and non-jargon
5. **Review link text** - makes sense out of context
6. **Ensure consistent terminology** - same term everywhere

---

# Summary: Why All This Matters

These 5 accessibility tasks make Flor.io usable for:

- ✅ Blind and low-vision users (contrast, screen readers)
- ✅ Deaf and hard-of-hearing users (captions, visual feedback)
- ✅ Motor disability users (keyboard, large touch targets)
- ✅ Cognitive disability users (clear language, structure)
- ✅ Temporary disabilities (broken arm, screen glare)
- ✅ Age-related changes (larger fonts, contrast)
- ✅ Non-native English speakers (clear, simple language)
- ✅ Mobile users (larger buttons, keyboard-friendly)
- ✅ Old device users (semantic HTML loads faster)
- ✅ Low-bandwidth users (simpler HTML)

**Plus:** Better SEO, better maintainability, fewer bugs, happier users!
