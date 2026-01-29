# Task 5.2.5: Language & Labels Review - Implementation Guide

## The Goal

**Use clear, specific, non-technical language** that all users can understand.

This helps:

- People with cognitive disabilities
- Non-native English speakers
- Elderly users
- Everyone (simpler = better)

---

## Core Principles

### 1. Be Specific, Not Vague

```
❌ VAGUE:     "Click"
✅ SPECIFIC:  "Submit Plant"

❌ VAGUE:     "OK"
✅ SPECIFIC:  "Save Changes"

❌ VAGUE:     "Settings"
✅ SPECIFIC:  "Edit Profile"

❌ VAGUE:     "More"
✅ SPECIFIC:  "View All Plants"
```

### 2. Use Action Words (Verbs)

Buttons should start with action words:

```
✅ GOOD:      Submit, Save, Delete, Create, Edit, Share, Print, Download
❌ BAD:       OK, Yes, No, Action, Do It, Thing

For unclear actions:
❌ "..."       (What does this do?)
✅ "More options"

❌ "+"         (Add what?)
✅ "Add Plant"
```

### 3. Error Messages Must Be Specific

```
❌ BAD:       "Error"
❌ BAD:       "Invalid input"
❌ BAD:       "Something went wrong"
✅ GOOD:      "Email is already registered"
✅ GOOD:      "Plant name must be 100 characters or less"
✅ GOOD:      "Watering frequency must be between 1 and 365 days"
```

**Why specific?**

- Tells user what's wrong
- Suggests how to fix it
- Reduces anxiety

### 4. Avoid Jargon

```
❌ JARGON:    "Hydration schedule optimization"
✅ SIMPLE:    "Watering frequency"

❌ JARGON:    "Photosynthetic requirements"
✅ SIMPLE:    "Light requirements"

❌ JARGON:    "Botanical nomenclature"
✅ SIMPLE:    "Plant name"

❌ JARGON:    "Phytopathology issues"
✅ SIMPLE:    "Plant problems"
```

### 5. Use Consistent Terminology

Pick ONE term and stick with it:

```
PICK ONE and use everywhere:
Watering - NOT "Water", "Hydrate", "Wet"
Delete - NOT "Remove", "Trash", "Destroy"
Save - NOT "Store", "Keep", "Submit" (use "Submit" for forms only)
Create - NOT "Add", "New" (unless it's radio "New" option)
Edit - NOT "Modify", "Change", "Update"
```

### 6. Write in Active Voice

```
❌ PASSIVE:   "Plant was watered"
✅ ACTIVE:    "You watered the plant"

❌ PASSIVE:   "Changes have been saved"
✅ ACTIVE:    "Your changes have been saved"

❌ PASSIVE:   "Plant will be deleted"
✅ ACTIVE:    "This will delete your plant"
```

### 7. Use Concrete Language

```
❌ VAGUE:     "Enter a reasonable frequency"
✅ CONCRETE:  "Enter a frequency between 1 and 365 days"

❌ VAGUE:     "Upload a good photo"
✅ CONCRETE:  "Upload a clear photo of your plant (JPG or PNG, under 10MB)"

❌ VAGUE:     "Strong password"
✅ CONCRETE:  "At least 8 characters, 1 uppercase letter, 1 number, 1 special character"
```

### 8. Form Labels Should Be Above/Left

```
❌ BAD - Label only in placeholder (disappears):
<input placeholder="Plant name" />

✅ GOOD - Label + placeholder:
<label>Plant Name</label>
<input placeholder="e.g., Monstera" />
```

### 9. Use Positive Language

```
❌ NEGATIVE:  "Don't forget to water"
✅ POSITIVE:  "Remember to water your plant"

❌ NEGATIVE:  "Won't sync if offline"
✅ POSITIVE:  "Syncs when you're back online"

❌ NEGATIVE:  "Delete plant (cannot undo)"
✅ POSITIVE:  "Delete plant" + "Are you sure?" confirmation
```

---

## Flor.io Language Audit

### Current Good Examples ✅

1. **Form Labels**
   - "Plant Name" - clear, specific ✅
   - "Watering Frequency (days)" - specific ✅
   - "Light Requirements" - concrete ✅

2. **Button Labels**
   - "Create Plant" - action-oriented ✅
   - "Save Changes" - specific ✅
   - "Delete Plant" - specific ✅

3. **Help Text**
   - "How often to water in days (1-365)" - concrete ✅
   - "Maximum 100 characters" - specific ✅

### Areas to Review

#### 1. Auth Pages (Login/Register)

**Current:**

```
"Email"                           ✅ Good
"Password"                        ✅ Good
"Confirm Password"                ✅ Good
"Create Account"                  ✅ Good
"Already have an account? Sign in" ✅ Good
```

**Check:**

- [ ] All labels clear and specific
- [ ] Error messages are specific
- [ ] No jargon used

#### 2. Dashboard

**Current:**

```
"My Plants"                       ✅ Good (clear heading)
"+ Add Plant"                     ⚠️ Could be "Add New Plant"
"Last watered: X days ago"        ✅ Good (specific)
"Next: in Y days"                 ✅ Good (specific)
```

**Check:**

- [ ] Plant card text is clear
- [ ] Room filter labels are clear
- [ ] Empty state message is helpful

#### 3. Plant Details

**Current:**

```
"Plant Name"                      ✅ Good
"Watering Status: Due today"      ✅ Good
"Watered Today"                   ✅ Good (action word)
"Light Requirements"              ✅ Good
"Fertilizing Tips"                ✅ Good
```

**Check:**

- [ ] All section headings are clear
- [ ] Status messages are specific
- [ ] Edit/Delete buttons are clear

#### 4. Plant Form

**Current:**

```
"Plant Photo"                     ✅ Good
"Plant Name *"                    ✅ Good (asterisk for required)
"Watering Frequency (days) *"     ✅ Good (specific)
"Room (Optional)"                 ✅ Good (shows it's optional)
"Light Requirements"              ✅ Good
```

**Check:**

- [ ] All labels use required/optional indicator
- [ ] Help text is concrete
- [ ] Error messages are specific

#### 5. Error Messages

**Current:**

```
"Plant name is required"          ✅ Specific
"Watering frequency must be..."   ✅ Specific
"Photo must be JPG or PNG"        ✅ Specific
```

**Check:**

- [ ] All error messages tell user what's wrong
- [ ] All error messages suggest how to fix it
- [ ] No generic "Error" messages

---

## Language Review Checklist

### Button Labels

- [ ] All buttons have action words (verb)
- [ ] No "OK", "Yes", "No", "..." buttons
- [ ] Clear what happens when clicked
- [ ] Specific ("Delete Plant" not "Delete")

### Form Labels

- [ ] All labels use actual text (not just placeholder)
- [ ] Labels describe what field is for
- [ ] Required fields marked with \* or "(Required)"
- [ ] Optional fields marked with "(Optional)"

### Help Text / Hints

- [ ] All help text is concrete
- [ ] Help text shows valid format (e.g., "1-365 days")
- [ ] Help text includes constraints (e.g., "Max 100 chars")

### Error Messages

- [ ] All errors are specific (not "Error")
- [ ] Errors say what's wrong
- [ ] Errors suggest how to fix
- [ ] Errors use simple language

### Headings & Labels

- [ ] Headings describe content
- [ ] No vague headings ("Info", "Data", "Settings")
- [ ] Consistent capitalization

### Confirmation Dialogs

- [ ] Clear what will happen
- [ ] Specific action ("Delete Plant" not "Delete")
- [ ] Buttons are specific ("Delete Plant", "Cancel")

### Status Messages & Notifications

- [ ] Success message is clear ("Plant created successfully")
- [ ] Error message is specific
- [ ] Messages use simple language

### Help / Documentation

- [ ] Instructions are concrete
- [ ] No jargon
- [ ] Examples provided where helpful

---

## Common Issues & Fixes

### Issue 1: Generic Button Labels

```
❌ BAD:
<button>OK</button>
<button>Cancel</button>
<button>Submit</button>

✅ GOOD:
<button>Save Plant</button>
<button>Cancel Creating Plant</button>
<button>Create Plant</button>
```

### Issue 2: Vague Error Messages

```
❌ BAD:
return { error: "Validation failed" };
return { error: "Invalid input" };
return { error: "Error" };

✅ GOOD:
return { error: "Plant name must be 100 characters or less" };
return { error: "Watering frequency must be between 1 and 365 days" };
return { error: "Email address is already registered" };
```

### Issue 3: Help Text Not Concrete

```
❌ BAD:
<label>Watering Frequency</label>
<input />
<p>Enter how often to water</p>

✅ GOOD:
<label>Watering Frequency (days)</label>
<input min="1" max="365" />
<p>How often to water in days (1-365)</p>
```

### Issue 4: Placeholder-Only Labels

```
❌ BAD:
<input placeholder="Plant name" />
<input placeholder="1-365" />

✅ GOOD:
<label>Plant Name</label>
<input placeholder="e.g., Monstera" />

<label>Watering Frequency (days)</label>
<input placeholder="e.g., 7" min="1" max="365" />
```

### Issue 5: Links with No Context

```
❌ BAD:
<a href="/plant/123">
  Click here to view
</a>

✅ GOOD:
<a href="/plant/123">
  View Monstera plant details
</a>
```

### Issue 6: Negative Language

```
❌ BAD:
"Don't forget to water your plant"
"This action cannot be undone"
"Failed to save"

✅ GOOD:
"Remember to water your plant"
"Are you sure? You can't undo this."
"Plant saved successfully" or "Couldn't save plant"
```

---

## Files to Review

### 1. Auth Pages

- [ ] `app/routes/auth.login.tsx` - Check labels and error messages
- [ ] `app/routes/auth.register.tsx` - Check labels and error messages
- [ ] Form error messages - Verify they're specific

### 2. Plant Management

- [ ] `app/components/plant-form.tsx` - Labels, help text, error messages
- [ ] `app/components/plant-card.tsx` - Plant status text
- [ ] `app/routes/dashboard.plants.$plantId.tsx` - Headings, section labels

### 3. Dashboard

- [ ] `app/routes/dashboard._index.tsx` - Page heading, empty state text
- [ ] `app/components/room-filter.tsx` - Filter labels
- [ ] Empty state message - Is it helpful?

### 4. Modals & Dialogs

- [ ] All modal titles - Are they specific?
- [ ] All modal buttons - Action-oriented?
- [ ] All confirmation messages - Clear what happens?

### 5. Notifications

- [ ] Success messages - Specific?
- [ ] Error messages - Suggest fix?
- [ ] Toast notifications - Clear?

---

## Terminology Standardization

### Decision: What Term Should We Use?

For Flor.io, decide on one term for each action:

```
WATERING:
□ Watering (chosen)
□ Hydration
□ Watering schedule
□ Water frequency

DELETING:
□ Delete (chosen)
□ Remove
□ Trash
□ Destroy

CREATING:
□ Create (chosen)
□ Add
□ New
□ Make

UPDATING:
□ Edit (chosen)
□ Modify
□ Update
□ Change
```

Once decided, use CONSISTENTLY everywhere:

- All buttons
- All labels
- All help text
- All error messages

---

## Testing Checklist

- [ ] **Read all button labels aloud** - Do they sound like actions?
- [ ] **Read all error messages** - Are they helpful and specific?
- [ ] **Check help text** - Is it concrete with examples?
- [ ] **Review form labels** - All using actual text, not placeholders?
- [ ] **Check terminology** - Same term used everywhere?
- [ ] **Review headings** - Are they descriptive?
- [ ] **Check links** - Clear what they do?
- [ ] **Test with non-native speaker** - Can they understand?
- [ ] **Use Hemingway App** - Check reading level (aim for simple)
- [ ] **Test with axe DevTools** - No labeling issues?

---

## Reading Level

Use simple words and short sentences:

```
❌ COMPLEX (Flesch Reading Ease: 30)
"The hydration schedule optimization interface facilitates
systematic botanical specimen maintenance through algorithmically
determined temporal intervals."

✅ SIMPLE (Flesch Reading Ease: 80)
"Water your plants on this schedule. We help you remember."
```

### Tool: Hemingway App

- Go to: https://www.hemingwayapp.com/
- Paste text
- Red = hard to read, use simpler words
- Yellow = hard to read, use shorter sentences

---

## Success Criteria

✅ All button labels are action-oriented (verb + noun)
✅ All error messages are specific and helpful
✅ All form labels use actual text (not just placeholder)
✅ All help text is concrete with examples
✅ No jargon or technical terms
✅ Consistent terminology throughout app
✅ Positive language (avoid "don't", "won't", "can't")
✅ Simple, clear language (Flesch Reading Ease > 70)
✅ Links have descriptive text (not "Click here")
✅ Headings are descriptive (not "Settings", "Info")
