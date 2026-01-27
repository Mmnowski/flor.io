# Task 5.2.1: Color Contrast Audit - Implementation Guide

## What We're Checking

We need to verify that **all text has a contrast ratio of at least 4.5:1** against its background (or 3:1 for large text 18px+/14px+ bold).

The contrast ratio compares light and dark values:

- **21:1** = Black on white (excellent)
- **7:1** = Good
- **4.5:1** = Minimum for AA (readable for most people with vision issues)
- **3:1** = Acceptable for large text only

---

## Current Color Scheme Analysis

### Light Mode (:root)

```
Primary: #10b981 (emerald green, medium brightness)
Primary text: #ffffff (white)
Primary text dark: #000000 (black)

Destructive: #ef4444 (red, medium-high brightness)
Foreground: #000000 (black text)

Background: #ffffff (white)
Foreground: #000000 (black)
```

### Dark Mode (.dark)

```
Background: #0f172a (very dark navy)
Foreground: #f1f5f9 (light gray/white)

Primary: #10b981 (emerald, same as light)
Primary text: #0f172a (dark, for contrast)

Destructive: #ff6b6b (bright red for dark mode)

Muted foreground: #cbd5e1 (medium light gray)
```

---

## Color Combinations to Check

### 1. **Primary Button: White text on Emerald (#10b981)**

**Light Mode:**

```
Text: #ffffff (white)
Background: #10b981 (emerald)
Contrast Ratio: GOOD ✅
```

**Dark Mode:**

```
Text: #0f172a (dark navy)
Background: #10b981 (same emerald)
Contrast Ratio: GOOD ✅
```

### 2. **Secondary Text: Black on White**

**Light Mode:**

```
Text: #000000 (black)
Background: #ffffff (white)
Contrast Ratio: 21:1 EXCELLENT ✅
```

### 3. **Muted Text: Gray on White**

**Light Mode:**

```
Text: #556b2f (gray)
Background: #ffffff (white)
Needs checking - if too light, fails
```

**Dark Mode:**

```
Text: #cbd5e1 (light gray)
Background: #0f172a (very dark)
Contrast Ratio: GOOD ✅
```

### 4. **Destructive/Error: Red Text**

**Current:** `--destructive: #ef4444` (light/medium red)

**Light Mode:**

```
Text: #ef4444 on #ffffff
Needs checking - RED IS PROBLEMATIC
```

**Dark Mode:**

```
Text: #ff6b6b on #0f172a (very dark)
Better, but needs verification
```

### 5. **Links: Emerald on White**

**Light Mode:**

```
Text: #10b981 (emerald link)
Background: #ffffff (white)
Contrast Ratio: Acceptable ✅
```

### 6. **Form Inputs: Black text on light gray**

**Light Mode:**

```
Text: #000000 (black)
Background: #f3f4f6 (light gray)
Contrast Ratio: GOOD ✅
```

### 7. **Placeholder Text: Gray text on light gray**

**Light Mode:**

```
Text: #999999 (medium gray) - LIKELY TOO LIGHT
Background: #ffffff (white) or #f3f4f6 (light gray)
Contrast Ratio: Likely FAILS ❌
```

---

## Color Contrast Audit Checklist

### Text That Needs Verification

- [ ] **Muted text (help text below inputs)** - Check contrast
- [ ] **Placeholder text in inputs** - Likely too light, needs to be darker
- [ ] **Error messages** - Red on light background needs checking
- [ ] **Links** - Emerald on white needs checking
- [ ] **Button text** - All combinations (dark/light mode)
- [ ] **Form labels** - Black on white (should be fine)
- [ ] **Success messages** - Green on light needs checking
- [ ] **Status badges** - Colors on various backgrounds

### Specific Areas to Test

#### 1. Auth Pages (Login/Register)

- [ ] Email input text (black on light gray input)
- [ ] Password input text (black on light gray input)
- [ ] Form labels (small text vs input text)
- [ ] Error messages (red text)
- [ ] Links "Sign in" / "Sign up" (emerald on white)
- [ ] Buttons (white text on emerald)

#### 2. Dashboard

- [ ] Plant card text (dark text on white cards)
- [ ] Plant name (heading level)
- [ ] Status text (days since watered)
- [ ] Room filter chips (text on colored background)
- [ ] Plant grid empty state text

#### 3. Plant Details Page

- [ ] Plant name (heading)
- [ ] "Last watered" text (status information)
- [ ] Button text ("Watered Today" button)
- [ ] Collapsible section text (Light Requirements, etc.)
- [ ] Watering history dates (might be muted/gray)

#### 4. Modals/Dialogs

- [ ] Notifications modal text
- [ ] Confirmation dialog text
- [ ] Modal buttons

#### 5. Dark Mode (All of the above + additional checks)

- [ ] Light text on dark background
- [ ] Form inputs in dark mode
- [ ] All color combinations

---

## Testing Process

### Using WebAIM Contrast Checker

1. Go to: https://webaim.org/resources/contrastchecker/
2. For each combination:
   - Foreground color: Copy the hex code
   - Background color: Copy the hex code
   - Check if it shows: "AA Pass" (minimum 4.5:1)

### Using Browser DevTools

1. Right-click any element → Inspect
2. Go to Computed styles
3. Look for text color and background color
4. Manual calculation or use axe extension

### Using axe DevTools Extension

1. Install: https://www.deque.com/axe/devtools/
2. Open DevTools → axe DevTools tab
3. Click "Scan THIS PAGE"
4. Look for "Contrast" issues
5. Shows exact contrast ratio and what's failing

### Manual Testing on Mobile

1. View page on mobile in bright sunlight
2. Check if text is still readable
3. Look for colors that disappear

---

## Issues Found & Recommendations

### ⚠️ Likely Issues

1. **Placeholder Text Too Light**
   - Current: Light gray placeholder
   - Issue: Disappears against light gray input background
   - Fix: Make placeholder darker (darker gray)

2. **Error Messages Color**
   - Current: #ef4444 (red)
   - Check: Does it meet 4.5:1 on white background?
   - Fix if needed: Use darker red (#c7222a or #dc2626)

3. **Muted/Help Text**
   - Current: Might be too light
   - Issue: Help text below inputs hard to read
   - Fix: Darker gray for contrast

4. **Success/Status Colors**
   - For watering status, we use colors (green/orange/red)
   - Issue: Color alone isn't accessible
   - Fix: Add icons or text labels

### ✅ Already Good

- Black text on white background ✅
- White text on emerald buttons ✅
- White text on dark backgrounds ✅

---

## Implementation Plan

### Step 1: Document Current Colors

Create a complete reference of all color combinations used in Flor.io

### Step 2: Test Each Combination

Use WebAIM Contrast Checker for each unique combination

### Step 3: Mark Pass/Fail

Record which combinations pass WCAG AA (4.5:1)

### Step 4: Fix Issues

For failing combinations:

- Darken text (harder to read but more accessible)
- Lighten background (affects design)
- Use different color entirely

### Step 5: Test Dark Mode

Run same tests in dark mode

### Step 6: Verify Implementation

- Check fixed colors render correctly
- Test on real mobile device
- Rerun axe DevTools audit

---

## Color Recommendations

If we need to fix colors, here are accessible alternatives:

### For Error/Destructive Red

```
Current: #ef4444 (light red)
Better option: #dc2626 (darker red)
OR #c7222a (even darker)
Ensures contrast on white and light backgrounds
```

### For Muted/Help Text

```
Current: #999999 (medium gray) - possibly too light
Better: #666666 (darker gray)
OR #4b5563 (darker) for better contrast
```

### For Success/Green Status

```
Current: #10b981 (medium emerald)
Light mode text: #047857 (darker emerald) for contrast
OR #065f46 (very dark) for maximum contrast
```

### For Warning/Orange Status

```
Current: #f97316 (orange)
Light mode text: #92400e (dark brown)
Dark mode: Keep #f59e0b (bright orange)
```

---

## Files to Update

1. **`app/app.css`** - Update color variables if needed
2. **`app/components/form-error.tsx`** - Update error color if needed
3. **`app/components/plant-card.tsx`** - Check status colors
4. **Other components** - Check any custom colored text

---

## Testing Checklist

- [ ] Run WebAIM on all major color combinations
- [ ] Run axe DevTools on dashboard page
- [ ] Run axe DevTools on plant details page
- [ ] Run axe DevTools on auth pages
- [ ] Test light mode on mobile in sunlight
- [ ] Test dark mode
- [ ] Verify no colors fail 4.5:1 ratio (or 3:1 for large text)
- [ ] Retest after making any color changes

---

## Success Criteria

✅ All text has contrast ratio ≥ 4.5:1 (or ≥ 3:1 for large text)
✅ axe DevTools shows no contrast failures
✅ Text readable in bright sunlight
✅ Color-coded status (green/orange/red) also has icons or text
✅ Both light and dark modes pass
