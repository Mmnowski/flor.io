# Task 5.2.3: Keyboard Navigation - Implementation Guide

## The Goal

**Users should be able to use your entire app with keyboard only** - no mouse needed.

This includes:

- Navigating between elements with Tab key
- Activating elements with Enter or Space
- Using arrow keys in dropdowns
- Closing modals with Escape

---

## How Keyboard Users Navigate

### Keys Used

| Key        | Action                             |
| ---------- | ---------------------------------- |
| Tab        | Move to next focusable element     |
| Shift+Tab  | Move to previous focusable element |
| Enter      | Activate button / Submit form      |
| Space      | Activate button / Check checkbox   |
| Escape     | Close modal / Cancel               |
| Arrow keys | Navigate within dropdowns/menus    |

---

## Testing Keyboard Navigation

### Test 1: Tab Through Page

**Steps:**

1. Open page in browser
2. Press Tab repeatedly
3. Watch which elements get focus
4. Check if order is logical (top-to-bottom, left-to-right)

**Good order:**

```
Logo → Dashboard Link → Notifications → Theme Toggle → Login Button
                     (across, left to right first)
```

**Bad order:**

```
Notifications → Login Button → Logo → Dashboard
            (random jumping around)
```

### Test 2: Visible Focus Indicator

**Look for:**

- Blue ring/outline when focused
- Color change
- Underline for links
- Background color change

**Current code in Flor.io:**

```tsx
className = 'focus:ring-2 focus:ring-emerald-300';
```

✅ This is good! Every interactive element needs this or similar.

### Test 3: Form Submission

**Steps:**

1. Tab to submit button
2. Press Enter
3. Form should submit

**Should work:** Enter key submits form

### Test 4: Modal/Dialog

**Steps:**

1. Open modal by clicking button
2. Tab within modal only (not to background)
3. Press Escape to close
4. Focus should return to button that opened it

This is called **focus trapping**.

### Test 5: Dropdown Navigation

**Steps:**

1. Tab to dropdown
2. Press Arrow down/up
3. Options should scroll
4. Press Enter to select

---

## Current State of Flor.io

### ✅ Already Good

1. **Focus Indicators**
   - Code: `focus:ring-2 focus:ring-emerald-300 focus:outline-none`
   - Applied to: Navigation links, buttons
   - Good ✅

2. **Semantic HTML**
   - Uses `<button>` (not `<div onclick>`)
   - Uses `<nav>` for navigation
   - Uses `<form>` for forms
   - Good ✅

3. **React Router Dialogs**
   - shadcn Dialog component
   - Built-in focus trap
   - Good ✅

### ⚠️ Need to Verify

1. **Tab Order**
   - Is it logical throughout the app?
   - Need to manually test each page

2. **All Interactive Elements**
   - Are all buttons/links keyboard-accessible?
   - No divs used as buttons (hidden from keyboard users)?

3. **Dropdown Menus**
   - Can navigate with arrow keys?
   - shadcn Select/Dropdown should handle this ✅

4. **Focus Visible on All Elements**
   - Do all focusable elements show focus?
   - Check custom styled elements

---

## Implementation Checklist

### Step 1: Test Tab Order

Pages to test:

- [ ] Login page - Tab: Email → Password → Login button → "Sign up" link
- [ ] Register page - Tab: Email → Password → Confirm → Register button → "Sign in" link
- [ ] Dashboard - Tab: Dashboard link → Notifications → Theme toggle → User menu
- [ ] Plant details - Tab: Back button → Watered button → Edit → Delete
- [ ] Plant form - Tab: Photo upload → Name → Frequency → Room → Light requirements → etc. → Submit

### Step 2: Check Focus Indicators

Ensure all focusable elements have visible focus:

```tsx
// Good - has visible focus
<button className="focus:ring-2 focus:ring-emerald-300">
  Click me
</button>

// BAD - no visible focus
<button>
  Click me
</button>

// BAD - removes default focus
<button className="focus:outline-none">
  Click me
</button>

// GOOD - removes default, adds custom
<button className="focus:outline-none focus:ring-2 focus:ring-blue-500">
  Click me
</button>
```

### Step 3: Verify Semantic HTML

Check that all interactive elements use correct HTML:

```tsx
// GOOD
<button>Submit</button>
<a href="/page">Link</a>
<input type="text" />

// BAD - not keyboard accessible
<div onClick={handleClick}>Submit</div>
<span onClick={handleClick}>Link</span>
```

### Step 4: Modal Focus Trapping

Check that modals:

1. Trap focus (Tab cycles within modal only)
2. Escape closes modal
3. Focus returns to trigger button

**Current code in Flor.io:**

```tsx
// shadcn Dialog component already has focus trap built-in ✅
<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent>{/* Escape key closes by default ✅ */}</DialogContent>
</Dialog>
```

### Step 5: Dropdown Arrow Key Navigation

Test that dropdowns work with arrow keys:

**Current code:**

```tsx
<Select value={selected} onValueChange={setSelected}>
  <SelectTrigger>
    <SelectValue placeholder="Choose..." />
  </SelectTrigger>
  <SelectContent>{/* Arrow keys should navigate items */}</SelectContent>
</Select>
```

✅ shadcn Select handles this automatically

---

## Common Issues & Fixes

### Issue 1: No Visible Focus Indicator

**Problem:**

```tsx
<button>Click me</button> // No visible focus
```

**Fix:**

```tsx
<button className="focus:ring-2 focus:ring-emerald-300 focus:outline-none">Click me</button>
```

### Issue 2: Focus Outline Removed Without Replacement

**Problem:**

```tsx
<button className="focus:outline-none">Click me</button>
```

**Fix:**

```tsx
<button className="focus:outline-none focus:ring-2 focus:ring-emerald-300">Click me</button>
```

### Issue 3: Div Used as Button

**Problem:**

```tsx
<div onClick={handleSubmit} className="cursor-pointer">
  Submit Form
</div>
// Not keyboard accessible!
```

**Fix:**

```tsx
<button onClick={handleSubmit}>Submit Form</button>
```

### Issue 4: Link Used as Button

**Problem:**

```tsx
<a href="#" onClick={handleAction}>
  Delete Plant
</a>
// Confusing - is it a link or button?
```

**Fix:**

```tsx
<button onClick={handleAction}>Delete Plant</button>
```

### Issue 5: Form Doesn't Submit with Enter

**Problem:**

```tsx
<form>
  <input type="text" />
  <div onClick={handleSubmit}>Submit</div> {/* Not a button */}
</form>
```

**Fix:**

```tsx
<form onSubmit={handleSubmit}>
  <input type="text" />
  <button type="submit">Submit</button> {/* Real button */}
</form>
```

### Issue 6: Modal Doesn't Trap Focus

**Problem:**

```tsx
{
  /* Tab goes outside modal to page behind it */
}
<div className="modal">
  <button>Action</button>
</div>;
```

**Fix:**

```tsx
{
  /* shadcn Dialog already does this */
}
<Dialog>
  <DialogContent>
    <button>Action</button>
  </DialogContent>
</Dialog>;
```

---

## Focus Management

### Auto-Focus in Modals

When modal opens, focus should go to first focusable element:

```tsx
<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent>
    <input autoFocus type="text" placeholder="Search..." />
    <button>Submit</button>
  </DialogContent>
</Dialog>
```

### Focus Return After Close

When modal closes, focus should return to trigger button:

```tsx
const [open, setOpen] = useState(false);
const triggerRef = useRef<HTMLButtonElement>(null);

const handleClose = () => {
  setOpen(false);
  triggerRef.current?.focus(); // Return focus to button
};

return (
  <>
    <button ref={triggerRef} onClick={() => setOpen(true)}>
      Open Modal
    </button>
    <Dialog open={open} onOpenChange={setOpen}>
      {/* ... */}
    </Dialog>
  </>
);
```

---

## Testing Checklist

- [ ] **Tab through login page** - Order logical? Focus visible?
- [ ] **Tab through register page** - Order logical? Focus visible?
- [ ] **Tab through dashboard** - Order logical? Focus visible?
- [ ] **Tab through plant details** - Order logical? Focus visible?
- [ ] **Tab through plant form** - All fields accessible?
- [ ] **Open modal with keyboard** - Tab works?
- [ ] **Tab within modal** - Trapped? Doesn't escape?
- [ ] **Close modal with Escape** - Works?
- [ ] **Use arrow keys in dropdown** - Selects items?
- [ ] **Submit form with Enter** - Works without clicking button?
- [ ] **All buttons have focus indicator** - Visible ring/outline?
- [ ] **No divs used as buttons** - Only real `<button>` elements?

---

## Files to Check/Update

### Navigation (`app/components/nav.tsx`)

- [ ] All buttons have `focus:ring-2 focus:ring-emerald-300`
- [ ] Tab order is left-to-right
- [ ] Logo → Dashboard → Notifications → Theme → User menu

### Plant Form (`app/components/plant-form.tsx`)

- [ ] All inputs have visible focus
- [ ] Tab order: Photo → Name → Frequency → Room → Care sections → Buttons
- [ ] Submit button has visible focus
- [ ] Form submits with Enter key

### Modals (`app/components/notifications-modal.tsx`, etc.)

- [ ] Focus traps within modal
- [ ] Escape closes modal
- [ ] First element auto-focused

### Buttons & Links (All components)

- [ ] Every button has focus style
- [ ] Every link has focus style
- [ ] No divs used as clickable elements

---

## Browser Testing

### Test with Keyboard Only

1. **Disable mouse/trackpad** (or just don't use it)
2. **Use Tab** to navigate
3. **Use Enter/Space** to activate
4. **Use Escape** to close dialogs
5. **Verify:** Can you do everything with keyboard?

### Test in Different Browsers

- [ ] Chrome/Edge
- [ ] Firefox
- [ ] Safari
- [ ] Mobile Safari (iOS)

Different browsers handle keyboard differently!

---

## Success Criteria

✅ Every focusable element has visible focus indicator
✅ Tab order is logical (top-to-bottom, left-to-right)
✅ All buttons/links keyboard-accessible
✅ Forms submit with Enter key
✅ Modals trap focus and close with Escape
✅ Dropdowns navigate with arrow keys
✅ Can use entire app with keyboard only
✅ No mouse/trackpad needed for basic tasks
