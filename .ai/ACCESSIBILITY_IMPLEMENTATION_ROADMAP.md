# Accessibility Audit Implementation Roadmap

## Overview

All five accessibility tasks (5.2.1 - 5.2.5) have detailed implementation guides:

1. **Task 5.2.1: Color Contrast Audit** - Check all colors meet 4.5:1 ratio
2. **Task 5.2.2: Touch Target Sizes** - All buttons are 44×44px minimum
3. **Task 5.2.3: Keyboard Navigation** - Entire app works with keyboard
4. **Task 5.2.4: Screen Readers** - Page structure is semantic and labeled
5. **Task 5.2.5: Language & Labels** - Clear, specific, non-technical language

---

## Quick Summary of What We're Checking

### Task 5.2.1: Color Contrast ✔️
**What:** Text colors have enough contrast against backgrounds
**Standard:** 4.5:1 ratio (or 3:1 for large text)
**Why:** People with low vision need readable text
**Files:** `.ai/ACCESSIBILITY_TASK_5.2.1_CONTRAST_AUDIT.md`

### Task 5.2.2: Touch Targets ✔️
**What:** All buttons and links are 44×44 pixels minimum
**Standard:** 44×44px clickable area
**Why:** Mobile users and people with tremors need bigger targets
**Files:** `.ai/ACCESSIBILITY_TASK_5.2.2_TOUCH_TARGETS.md`

### Task 5.2.3: Keyboard Navigation ✔️
**What:** App works with keyboard only (no mouse)
**Standard:** Tab, Enter, Escape, Arrow keys all work
**Why:** Blind users and power users rely on keyboard
**Files:** `.ai/ACCESSIBILITY_TASK_5.2.3_KEYBOARD_NAVIGATION.md`

### Task 5.2.4: Screen Readers ✔️
**What:** Content makes sense when read aloud
**Standard:** Semantic HTML, labels, alt text, aria attributes
**Why:** Blind users use screen readers to access content
**Files:** `.ai/ACCESSIBILITY_TASK_5.2.4_SCREEN_READERS.md`

### Task 5.2.5: Language & Labels ✔️
**What:** Clear, specific, non-technical language
**Standard:** No jargon, action-oriented buttons, specific error messages
**Why:** Everyone understands simple language better
**Files:** `.ai/ACCESSIBILITY_TASK_5.2.5_LANGUAGE_LABELS.md`

---

## Implementation Strategy

### Phase 1: Assessment (No Code Changes)

**Do this first to understand what needs fixing:**

1. **Review color scheme**
   - Document all color combinations
   - Test with WebAIM contrast checker
   - Identify failing combinations

2. **Check button sizes**
   - Measure all buttons in nav
   - Check icon button sizes
   - Document what's too small

3. **Test keyboard navigation**
   - Tab through each page
   - Note any issues
   - Check focus indicators

4. **Test screen readers (NVDA)**
   - Install NVDA (free)
   - Listen to page structure
   - Note what's unclear

5. **Review language**
   - Read all button labels aloud
   - Check error messages
   - Look for jargon

**Output:** List of all issues found

### Phase 2: Prioritize & Plan

**Decide order of fixes:**

**High Priority (Blocking):**
- Color contrast failures (text unreadable)
- Missing form labels (users confused)
- No keyboard navigation (keyboard users locked out)
- Broken screen reader structure (blind users can't use app)

**Medium Priority (Important):**
- Small buttons (hard to tap on mobile)
- Missing alt text (images not described)
- Generic error messages (users confused)
- Unclear button labels (users confused)

**Low Priority (Nice to Have):**
- Button spacing improvements
- Advanced ARIA attributes
- Detailed help text improvements

### Phase 3: Implement Fixes

**Order:**
1. **Semantic HTML** - Use correct tags (1-2 hours)
2. **Form Labels** - Connect labels to inputs (1-2 hours)
3. **Color Fixes** - Update colors if needed (1-2 hours)
4. **Button Sizes** - Update icon button sizes (1 hour)
5. **Language Review** - Update text and labels (2-3 hours)
6. **Alt Text** - Add missing alt text (1 hour)
7. **Focus Indicators** - Verify all visible (1 hour)
8. **ARIA Attributes** - Add where needed (1-2 hours)

### Phase 4: Testing & Verification

**Comprehensive testing:**
1. **Run WebAIM** on all color combinations
2. **Test keyboard** on all pages
3. **Test with NVDA** screen reader
4. **Run axe DevTools** audit
5. **Test on mobile** with real phone
6. **Check with browser** accessibility inspector

---

## Current State of Flor.io

### ✅ Already Good

1. **Semantic HTML** - Uses proper tags (nav, form, button, etc.) ✅
2. **Focus Indicators** - Has `focus:ring-2` classes ✅
3. **Form Labels** - Uses `<label htmlFor>` ✅
4. **Button Labels** - Icon buttons have `aria-label` ✅
5. **Dark Mode** - Has contrast-friendly colors ✅
6. **Focus Trap** - Modal dialogs use shadcn (trapped) ✅
7. **Color Scheme** - Emerald green + white (good contrast) ✅

### ⚠️ Need to Verify/Fix

1. **Color Contrast** - All combinations tested? ⚠️
2. **Button Sizes** - Icon buttons might be 40×40 (too small) ⚠️
3. **Alt Text** - Plant photos have alt text? ⚠️
4. **Screen Reader** - Full test needed ⚠️
5. **Language** - Error messages specific? ⚠️
6. **Keyboard** - Tab order logical? ⚠️

---

## Step-by-Step Implementation Plan

### Step 1: Set Up Testing Tools

**Free tools needed:**
```
1. WebAIM Contrast Checker - https://webaim.org/resources/contrastchecker/
2. NVDA (Screen Reader) - https://www.nvaccess.org/download/
3. axe DevTools (Browser Extension) - Chrome/Edge/Firefox
4. Browser DevTools - Right-click → Inspect
5. Real mobile phone - For touch target testing
```

**Time:** 30 minutes to install and learn

### Step 2: Document Current State

**Create checklist from each task guide:**

```
Task 5.2.1 - Color Contrast
□ Test primary button (white on emerald) - Status: _____
□ Test error text (red on white) - Status: _____
□ Test muted text (gray on white) - Status: _____
□ Test dark mode (all combinations) - Status: _____
□ Document all failures

Task 5.2.2 - Touch Targets
□ Measure nav buttons (currently 40×40?) - Status: _____
□ Measure form buttons - Status: _____
□ Check spacing between buttons - Status: _____
□ Document all undersized elements

Task 5.2.3 - Keyboard Navigation
□ Tab through login page - Status: _____
□ Tab through dashboard - Status: _____
□ Test Escape in modals - Status: _____
□ Test form submission with Enter - Status: _____

Task 5.2.4 - Screen Readers
□ Install NVDA - Status: _____
□ Test login page - Status: _____
□ Test dashboard - Status: _____
□ Check image alt text - Status: _____
□ Check form labels - Status: _____

Task 5.2.5 - Language & Labels
□ Review button labels - Status: _____
□ Review error messages - Status: _____
□ Review form labels - Status: _____
□ Review help text - Status: _____
```

**Time:** 2-3 hours for thorough audit

### Step 3: Fix Issues (Prioritized)

**Priority 1 - Critical (Do First):**
- [ ] Update icon button sizes (40×40 → 44×44)
- [ ] Verify color contrast on all main elements
- [ ] Ensure all form labels have `htmlFor`
- [ ] Add missing aria-labels

**Priority 2 - Important:**
- [ ] Add alt text to images
- [ ] Update vague button labels
- [ ] Improve error message specificity
- [ ] Fix tab order if needed

**Priority 3 - Nice to Have:**
- [ ] Improve help text
- [ ] Add advanced ARIA
- [ ] Refine dark mode colors
- [ ] Add loading state announcements

**Time:** 4-6 hours for all fixes

### Step 4: Test All Fixes

**Verification steps:**

```
□ Run axe DevTools on each page - 0 issues?
□ Test keyboard on each page - All elements accessible?
□ Test NVDA on login and dashboard - Makes sense?
□ Test colors with WebAIM - All pass 4.5:1?
□ Test buttons on mobile - Easy to tap?
□ Check contrast in dark mode - Readable?
□ Verify focus indicators visible - On all elements?
```

**Time:** 2-3 hours for comprehensive testing

---

## Files & Documentation

### Implementation Guides (Read These!)

1. `.ai/ACCESSIBILITY_TASK_5.2.1_CONTRAST_AUDIT.md`
   - How to test colors
   - What might fail
   - How to fix

2. `.ai/ACCESSIBILITY_TASK_5.2.2_TOUCH_TARGETS.md`
   - How to measure buttons
   - Tailwind size reference
   - Code examples

3. `.ai/ACCESSIBILITY_TASK_5.2.3_KEYBOARD_NAVIGATION.md`
   - How to test keyboard
   - Common issues
   - Focus trap examples

4. `.ai/ACCESSIBILITY_TASK_5.2.4_SCREEN_READERS.md`
   - How to use NVDA
   - Semantic HTML requirements
   - ARIA attribute guide

5. `.ai/ACCESSIBILITY_TASK_5.2.5_LANGUAGE_LABELS.md`
   - Language principles
   - Common fixes
   - Label examples

### Reference Guides

- `.ai/ACCESSIBILITY_GUIDE.md` - Original comprehensive guide (beginner-friendly)
- `.ai/ACCESSIBILITY_IMPLEMENTATION_ROADMAP.md` - This file

### Related Files

- `.ai/PHASE_5_PLAN.md` - Overall Phase 5 plan
- `.ai/PHASE_5_PROGRESS.md` - Progress tracking

---

## Code to Likely Update

### Priority Order

**1. Navigation Component** (`app/components/nav.tsx`)
```
- Change h-10 w-10 to h-11 w-11 (44×44 buttons)
- Verify aria-labels present
- Check focus indicators
```

**2. Plant Form** (`app/components/plant-form.tsx`)
```
- Verify all labels have htmlFor
- Check error messages are specific
- Verify focus indicators
```

**3. Root Layout** (`app/root.tsx`)
```
- Wrap main content in <main>
- Ensure proper semantic structure
```

**4. Color Variables** (`app/app.css`)
```
- May need to adjust if contrast fails
- Update both light and dark themes
```

**5. Individual Components**
```
- app/components/plant-card.tsx - Add alt text
- app/routes/dashboard._index.tsx - Heading structure
- All forms - Label verification
```

---

## Success Criteria

When all tasks complete, you'll have:

### ✅ Color Contrast
- All text is readable (4.5:1 minimum)
- Both light and dark modes pass
- No color-only indicators (icons/text added)

### ✅ Touch Targets
- All buttons 44×44 pixels
- Buttons spaced 8px+ apart
- Easy to tap on mobile

### ✅ Keyboard Navigation
- Tab through all pages
- Logical, consistent order
- All buttons/links accessible
- Forms submit with Enter

### ✅ Screen Readers
- Semantic HTML structure
- All images have alt text
- All form labels connected
- Icon buttons have aria-label
- Modals announced as dialogs

### ✅ Language & Labels
- All buttons action-oriented
- Error messages are specific
- No jargon used
- Consistent terminology
- Help text is concrete

---

## Timeline Estimate

**Assuming 1-2 hours per day:**

- **Day 1:** Set up tools, audit all tasks (2-3 hours)
- **Day 2:** Fix critical issues - buttons and labels (2-3 hours)
- **Day 3:** Fix important issues - alt text, error messages (2-3 hours)
- **Day 4:** Test everything, retest, document (2-3 hours)

**Total:** 8-12 hours spread over 4 days

Or if doing in one session: 8-12 hours

---

## Getting Started

### First Action

1. **Pick one task** from 5.2.1-5.2.5
2. **Read the detailed guide** (`.ai/ACCESSIBILITY_TASK_5.2.X.md`)
3. **Do the manual testing** - no code changes yet
4. **Document issues found**
5. **Then fix in code**
6. **Then test again**

**Recommended order:**
1. 5.2.5 (Language) - easiest, quick wins
2. 5.2.2 (Touch Targets) - straightforward
3. 5.2.1 (Colors) - needs external tools
4. 5.2.3 (Keyboard) - requires testing
5. 5.2.4 (Screen Readers) - most complex

---

## Questions?

Each task guide has:
- ✅ What we're checking
- ✅ Why it matters
- ✅ How to test
- ✅ What to look for
- ✅ How to fix
- ✅ Code examples
- ✅ Checklists

**Read the specific task guide for your question!**

