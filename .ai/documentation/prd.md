# Flor.io - Product Requirements Document (PRD)

## 1. EXECUTIVE SUMMARY

**Product:** Flor.io - Web application supporting plant owners in plant care  
**Problem:** Users forget to water their plants or don't know how to care for them  
**Solution:** Intelligent app with AI-powered plant recognition and automatic reminders  
**Target Audience:** 3 personas - beginners/neurodivergent users, people with concentration/memory issues, experienced collectors with large collections  
**Timeline:** 10-14 weeks (1 full-time developer, PM as designer/QA)  
**Budget:** $200/month (hosting + API costs)

---

## 2. USER PERSONAS

### Persona 1: Beginner/Neurodivergent User

- No experience in plant care
- Needs simple, concrete step-by-step instructions
- Requires high-contrast UI, clear labels, simple language

### Persona 2: Forgetful Users

- Elderly people, people with ADHD, or very busy individuals
- Main problem: forget whether/when they watered plants
- Need clear reminders and action history

### Persona 3: Experienced Collectors

- Large plant collection (20-50+)
- Need a database and organization system
- Want ability to customize AI-generated content

---

## 3. PRODUCT GOALS & SUCCESS METRICS

### Business Goals:

- Build MVP with core functionality in 10-14 weeks
- Achieve product-market fit for future monetization
- Collect data for AI optimization (fine-tuning)

### Success Metrics (KPIs):

- **AI Acceptance Rate:** 75% of AI cards are accepted by users
- **AI Usage Rate:** 75% of cards created using AI
- **7-day Retention:** >40% of users return after a week
- **30-day Retention:** >20% of users return after a month
- **Average Plants per Active User:** >5 plants
- **Negative AI Feedback:** <10% after 3 months

---

## 4. FEATURES & FUNCTIONAL REQUIREMENTS

### 4.1 Core Features (Must-Have for MVP)

#### Authentication & User Management

- Email/password + Google OAuth (Supabase Auth)
- No email verification required in MVP
- One user = one plant database (no sharing)

#### Plant Card Management

**Manual Creation:**

- Upload photo (JPG/PNG, max 10MB, auto-compress to 500KB/1920px)
- Enter plant name
- Set watering frequency (days)
- Assign to room (optional)
- Save to database

**AI-Powered Creation Flow:**

1. Upload photo
2. Loading: "Identifying plant..." (PlantNet API call)
3. Display: Name + "Is this your plant?" [Yes/No]
   - If No → fallback to manual name entry
4. Loading: "Generating care instructions..." (GPT-5 call)
5. Preview all data: name, photo, frequency, care instructions
6. [Accept] or [Edit before saving]
7. Save to database

**Generated Plant Care Information:**

- **Basics (always visible):**
  - Watering frequency (e.g., "Every 7 days")
  - Light requirements (e.g., "Full sun, 6-8h daily")
- **Extended (collapsible sections):**
  - Fertilizing (3-5 bullet points, simple language)
  - Pruning (3-5 bullet points, simple language)
- **Troubleshooting (collapsible):**
  - Most common diseases
  - Pests
  - Problem symptoms

**CRUD Operations:**

- **Read:** Dashboard with all cards + individual card details
- **Update:** Edit all fields (name, photo, frequency, room, AI advice)
- **Delete:** Remove card with confirmation modal

#### Dashboard & Navigation

**Main Dashboard:**

- List of all plant cards (tiles/grid view)
- Each card shows: photo, name, "Last watered: X days ago | Next: in Y days"
- [+ Add Plant] button → choice [Manual] or [With AI]
- [🔔 Notifications] button/icon → opens modal

**Notifications Modal:**

- List of plants to water (sorted by urgency)
- Color coding:
  - Today = orange
  - 1-2 days overdue = red
  - 3+ days = dark red + alert icon
- Each item: photo, name, "Overdue by X days" or "Due today"
- [Watered] button on each item
- Click on item → redirect to card details
- X button → closes modal (notification returns next day if not marked "Watered")

**Plant Details View:**

- Full plant photo
- Name
- Room (tag)
- Status: "Last watered: 3 days ago | Next: in 4 days"
- [Watered Today] button (prominent, touch-friendly 44px+)
- Care information sections (collapsible)
- "Watering History" section - last 10 dates with timestamp
- [Edit] [Delete] buttons

#### Rooms/Organization

- Optional tags for organization
- Create rooms: inline during card creation/editing or in filter
- Dashboard filtering: horizontal scroll with chip buttons
  - [All] [Living Room] [Kitchen] [Balcony] [+New Room]
  - Single-select (only one active)
  - State in URL params for bookmarking

#### Watering Tracking

- Clicking [Watered] saves: date + time
- Automatic calculation of next date: last_watered + frequency_days
- History: stored in database (plant_id, watered_at timestamp)
- Display last 10 in details view

#### AI Feedback System

- After accepting/rejecting AI-generated content:
  - Thumbs up / Thumbs down
  - Optional comment field (textarea)
  - [Submit Feedback] button
- Data stored: user_id, plant_id, feedback_type, comment, timestamp, ai_response_snapshot
- In MVP: only data collection (no immediate action)
- Post-MVP: GPT-5 fine-tuning based on negative feedback

### 4.2 Non-Functional Requirements

#### Accessibility (WCAG 2.1 AA)

- High-contrast colors (min 4.5:1 ratio)
- Touch-friendly buttons (min 44x44px)
- Clear, concrete labels ("Watered Today" instead of "Refresh")
- Large, readable fonts (min 16px body text)
- Consistent navigation patterns
- No time-based actions
- Keyboard navigation support

#### Performance

- Client-side image compression before upload
- PlantNet response time: <5s (with loading state)
- GPT-5 response time: <10s (with loading state)
- Page load: <3s (Lighthouse score >80)

#### Responsive Design (Mobile-First)

- Primary: iPhone SE (375px) → desktop 1920px
- Touch-friendly UI
- 80% of functionality works great on mobile
- Horizontal scroll for chip filters (mobile-friendly)

#### Security & Privacy

- Supabase RLS (Row Level Security) policies
- User can only see/edit their own plants
- No data sharing in MVP
- HTTPS only

#### Scalability Limits (MVP)

- 50 plants per user (soft limit with notification)
- 20 AI generations per user per month (soft limit)
- After exceeding: message + CTA to future Premium

### 4.3 USER STORIES

User stories are organized by functionality and prioritized for MVP. Format: **As a [persona], I want [action], so that [benefit].**

#### Epic 1: Authentication & User Management

**US-1.1: User Registration with Email**  
**As a** new user  
**I want to** register an account using my email and password  
**So that** I can securely store and access my plant collection

**Acceptance Criteria:**

- Given I'm on the registration page
- When I enter valid email, password (min 8 chars), and confirm password
- Then my account is created and I'm redirected to the empty dashboard
- And I receive a welcome message

**Priority:** Must-have  
**Complexity:** Small (2 points)

---

**US-1.2: User Registration with Google OAuth**  
**As a** new user  
**I want to** register using my Google account  
**So that** I can quickly sign up without creating a new password

**Acceptance Criteria:**

- Given I'm on the registration page
- When I click "Continue with Google"
- Then I'm redirected to Google OAuth consent screen
- And after approving, I'm redirected to the empty dashboard
- And my account is created with my Google email

**Priority:** Must-have  
**Complexity:** Small (2 points)

---

**US-1.3: User Login**  
**As a** returning user  
**I want to** log in to my account  
**So that** I can access my saved plant cards

**Acceptance Criteria:**

- Given I'm on the login page
- When I enter correct email and password (or use Google OAuth)
- Then I'm authenticated and redirected to my dashboard
- And I can see all my previously created plant cards
- Given I enter incorrect credentials
- Then I see an error message "Invalid email or password"

**Priority:** Must-have  
**Complexity:** Small (2 points)

---

#### Epic 2: Manual Plant Card Creation

**US-2.1: Create Plant Card Manually**  
**As a** experienced plant owner (Persona 3)  
**I want to** manually create a plant card with my own information  
**So that** I can quickly add plants I already know well without AI assistance

**Acceptance Criteria:**

- Given I'm on the dashboard
- When I click "Add Plant" → "Create Manually"
- Then I see a form with fields: plant name (required), photo upload (optional), watering frequency in days (required), room (optional)
- When I fill required fields and click "Save"
- Then the plant card is created and appears on my dashboard
- And I see a success message "Plant added successfully"

**Priority:** Must-have  
**Complexity:** Medium (3 points)

---

**US-2.2: Upload and Compress Plant Photo**  
**As a** user creating a plant card  
**I want to** upload a photo of my plant  
**So that** I can visually identify it on my dashboard

**Acceptance Criteria:**

- Given I'm in the plant creation form
- When I click "Upload Photo" and select a JPG or PNG file (up to 10MB)
- Then the image is automatically compressed to max 1920px width and 500KB
- And I see a preview of the compressed image
- And the file is uploaded to Supabase Storage
- Given I try to upload a file >10MB or unsupported format
- Then I see an error "File too large" or "Unsupported format (use JPG/PNG)"

**Priority:** Must-have  
**Complexity:** Medium (3 points)

---

#### Epic 3: AI-Powered Plant Card Creation

**US-3.1: Identify Plant from Photo (PlantNet)**  
**As a** beginner plant owner (Persona 1)  
**I want to** upload a photo and have the plant automatically identified  
**So that** I don't need to know the plant's name to start caring for it

**Acceptance Criteria:**

- Given I'm on the dashboard
- When I click "Add Plant" → "Use AI"
- And I upload a plant photo
- Then I see a loading state "Identifying plant..." (5-10 seconds)
- And PlantNet API returns the plant name (e.g., "Monstera Deliciosa")
- And I see the result with the question "Is this your plant?" with [Yes] [No] buttons
- When I click [Yes], I proceed to care instructions generation
- When I click [No], I see a text input "Enter plant name manually"

**Priority:** Must-have  
**Complexity:** Large (5 points)

---

**US-3.2: Handle Failed Plant Identification**  
**As a** user whose plant photo wasn't recognized  
**I want to** manually enter the plant name as a fallback  
**So that** I can still use AI to generate care instructions

**Acceptance Criteria:**

- Given PlantNet API fails to identify the plant OR I clicked [No] on identification result
- When I see the prompt "Plant not recognized. Enter plant name:"
- And I type the plant name (e.g., "Snake Plant") and click "Continue"
- Then the system proceeds to generate care instructions using GPT-5 with the provided name
- Given I leave the name field empty
- Then the "Continue" button is disabled

**Priority:** Must-have  
**Complexity:** Small (2 points)

---

**US-3.3: Generate Care Instructions with AI (GPT-5)**  
**As a** beginner plant owner (Persona 1)  
**I want to** receive AI-generated care instructions  
**So that** I know exactly how to care for my plant

**Acceptance Criteria:**

- Given the plant has been identified (or name provided manually)
- When the system calls GPT-5 API with the plant name
- Then I see a loading state "Generating care instructions..." (5-15 seconds)
- And the response includes:
  - Watering frequency (e.g., "Every 7 days")
  - Light requirements (e.g., "Bright indirect light, 6-8 hours")
  - Fertilizing tips (3-5 bullet points, collapsible)
  - Pruning tips (3-5 bullet points, collapsible)
  - Troubleshooting (common diseases/pests, 3-5 bullet points, collapsible)
- And all instructions use simple, concrete language
- And I see a preview screen with all generated information

**Priority:** Must-have  
**Complexity:** Large (5 points)

---

**US-3.4: Preview and Accept/Edit AI-Generated Card**  
**As a** user who just received AI-generated plant information  
**I want to** review and optionally edit the information before saving  
**So that** I can ensure the information is accurate and customize it to my needs

**Acceptance Criteria:**

- Given I've received AI-generated care instructions
- When I see the preview screen
- Then I can see: photo, plant name, watering frequency, room field (editable dropdown), and all care instruction sections (collapsible)
- When I click [Accept], the card is saved as-is
- When I click [Edit], all fields become editable (inline editing)
- And I can modify any field before saving
- When I click [Save] after editing, the card is saved with my changes

**Priority:** Must-have  
**Complexity:** Medium (3 points)

---

**US-3.5: Provide Feedback on AI Accuracy**  
**As a** user who just created a plant card with AI  
**I want to** rate the quality of AI-generated information  
**So that** the system can improve over time

**Acceptance Criteria:**

- Given I just saved an AI-generated plant card
- When the card is saved, I see a feedback modal
- Then I can choose Thumbs Up or Thumbs Down
- And I can optionally add a text comment (textarea, max 500 chars)
- When I click [Submit Feedback], my feedback is saved to the database with: user_id, plant_id, feedback_type, comment, timestamp
- And I'm redirected to the dashboard with success message
- Given I click [Skip], I'm redirected to dashboard without saving feedback

**Priority:** Must-have  
**Complexity:** Small (2 points)

---

#### Epic 4: Viewing & Managing Plant Cards

**US-4.1: View All Plants on Dashboard**  
**As a** user with multiple plants (Persona 3)  
**I want to** see all my plants in a grid/card layout on the dashboard  
**So that** I can quickly get an overview of my collection

**Acceptance Criteria:**

- Given I'm logged in and have plant cards saved
- When I navigate to the dashboard
- Then I see all my plant cards displayed as tiles/cards in a responsive grid
- And each card shows: photo, plant name, "Last watered: X days ago | Next: in Y days"
- And cards are sorted by next watering date (earliest first)
- Given I have no plants
- Then I see an empty state with "Add your first plant" CTA

**Priority:** Must-have  
**Complexity:** Medium (3 points)

---

**US-4.2: View Plant Details**  
**As a** user  
**I want to** click on a plant card to see full details  
**So that** I can review care instructions and watering history

**Acceptance Criteria:**

- Given I'm on the dashboard
- When I click on a plant card
- Then I'm redirected to the plant details page
- And I can see: large photo, plant name, room tag, watering status ("Last watered: 3 days ago | Next: in 4 days"), [Water Today] button (prominent, 44px+ height)
- And collapsible sections for care instructions: Basics (always open), Fertilizing, Pruning, Troubleshooting
- And a "Watering History" section showing last 10 watering events with date and time
- And [Edit] and [Delete] buttons at the bottom

**Priority:** Must-have  
**Complexity:** Medium (3 points)

---

**US-4.3: Edit Plant Card**  
**As a** user  
**I want to** edit any information on my plant card  
**So that** I can update details as I learn more or conditions change

**Acceptance Criteria:**

- Given I'm viewing plant details
- When I click [Edit]
- Then all fields become editable: name, photo (re-upload), watering frequency, room, all care instruction sections
- When I modify any field and click [Save Changes]
- Then the card is updated in the database
- And I see a success message "Plant updated successfully"
- And I'm redirected back to the details view with updated information
- When I click [Cancel], no changes are saved and I return to details view

**Priority:** Must-have  
**Complexity:** Medium (3 points)

---

**US-4.4: Delete Plant Card**  
**As a** user  
**I want to** delete a plant card I no longer need  
**So that** my dashboard only shows plants I currently own

**Acceptance Criteria:**

- Given I'm viewing plant details
- When I click [Delete]
- Then I see a confirmation modal "Are you sure you want to delete [Plant Name]? This action cannot be undone."
- When I click [Confirm Delete], the plant and all its watering history are deleted from the database
- And I'm redirected to the dashboard with a message "Plant deleted successfully"
- When I click [Cancel], the modal closes and nothing is deleted

**Priority:** Must-have  
**Complexity:** Small (2 points)

---

#### Epic 5: Watering Tracking & Notifications

**US-5.1: Mark Plant as Watered**  
**As a** forgetful user (Persona 2)  
**I want to** mark when I water a plant  
**So that** the system can track my watering schedule and remind me for the next one

**Acceptance Criteria:**

- Given I'm on the plant details page OR in the notifications modal
- When I click [Watered Today]
- Then the system records: plant_id, watered_at (current timestamp)
- And the plant's "Last watered" updates to "today"
- And "Next watering" is calculated as: today + watering_frequency_days
- And the plant is removed from the notifications list
- And I see a success feedback (e.g., checkmark animation or toast message)

**Priority:** Must-have  
**Complexity:** Small (2 points)

---

**US-5.2: View Watering History**  
**As a** user with memory issues (Persona 2)  
**I want to** see a history of when I watered each plant  
**So that** I can confirm whether I already watered it and see patterns

**Acceptance Criteria:**

- Given I'm viewing plant details
- When I scroll to the "Watering History" section
- Then I see the last 10 watering events listed
- And each entry shows: date and time (e.g., "Oct 10, 2025 at 3:45 PM")
- And entries are sorted newest first
- Given the plant has never been watered
- Then I see "No watering history yet"

**Priority:** Must-have  
**Complexity:** Small (2 points)

---

**US-5.3: View Notifications Modal**  
**As a** busy user (Persona 2)  
**I want to** see a list of plants that need watering today  
**So that** I can efficiently water only the plants that need it

**Acceptance Criteria:**

- Given I'm on the dashboard
- When I click the notification bell icon/button
- Then a modal opens showing all plants where next_watering_date <= today
- And plants are sorted by urgency: most overdue first
- And each plant item shows: photo thumbnail, name, watering status
- And color coding applies:
  - Orange: due today (0 days overdue)
  - Red: 1-2 days overdue
  - Dark red + alert icon: 3+ days overdue
- And each item has a [Watered] button
- When I click [X] to close modal without marking plants, the modal closes
- And unwatered plants remain in the list for tomorrow

**Priority:** Must-have  
**Complexity:** Medium (3 points)

---

**US-5.4: Handle Overdue Notifications**  
**As a** user who travels and misses watering days  
**I want to** see how overdue my plants are  
**So that** I can prioritize which plants need urgent attention

**Acceptance Criteria:**

- Given a plant's next_watering_date is in the past
- When I view the notifications modal
- Then the plant shows "Overdue by X days" instead of "Due today"
- And the color coding reflects urgency (red for 1-2 days, dark red for 3+)
- And overdue plants appear at the top of the list
- When I click [Watered], the overdue notification is cleared
- And next watering date is calculated from today (not from the original due date)

**Priority:** Must-have  
**Complexity:** Small (2 points)

---

**US-5.5: Dismiss Notification (Temporarily)**  
**As a** user who sees a notification but can't water now  
**I want to** dismiss the notification without marking as watered  
**So that** I can clean up my notifications modal but be reminded tomorrow

**Acceptance Criteria:**

- Given I'm in the notifications modal
- When I click [X] to close the modal OR click outside the modal
- Then the modal closes
- And plants that weren't marked [Watered] remain in the database with their original due date
- When I open the notifications modal tomorrow
- Then those plants reappear in the list (now 1 day more overdue)

**Priority:** Must-have  
**Complexity:** Small (1 point)

---

#### Epic 6: Rooms & Organization

**US-6.1: Create Room/Tag**  
**As a** user with plants in multiple locations (Persona 3)  
**I want to** create room categories  
**So that** I can organize my plants by their physical location

**Acceptance Criteria:**

- Given I'm on the dashboard
- When I click [+New Room] in the horizontal chip filter scroll
- Then an inline input field appears
- When I type a room name (e.g., "Balcony") and press Enter or click [Create]
- Then the room is created and appears as a new chip in the filter bar
- And I can now assign plants to this room

**Priority:** Should-have  
**Complexity:** Small (2 points)

---

**US-6.2: Assign Plant to Room**  
**As a** user  
**I want to** assign my plant to a specific room  
**So that** I can filter and view plants by location

**Acceptance Criteria:**

- Given I'm creating or editing a plant card
- When I see the "Room" field (dropdown)
- Then I can select from existing rooms or choose "None"
- When I select a room and save the plant
- Then the plant is tagged with that room
- And the room name appears on the plant card on the dashboard

**Priority:** Should-have  
**Complexity:** Small (2 points)

---

**US-6.3: Filter Plants by Room**  
**As a** user with many plants (Persona 3)  
**I want to** filter my dashboard to show only plants in a specific room  
**So that** I can focus on watering plants in one location at a time

**Acceptance Criteria:**

- Given I'm on the dashboard with plants assigned to different rooms
- When I see the horizontal chip filter: [All] [Living Room] [Kitchen] [Balcony]
- And I click on [Kitchen]
- Then the dashboard shows only plants tagged with "Kitchen"
- And the URL updates to `/dashboard?room=kitchen`
- And the [Kitchen] chip is highlighted/selected
- When I click [All], all plants are shown again
- And only one room filter can be active at a time

**Priority:** Should-have  
**Complexity:** Small (2 points)

---

**US-6.4: Bookmark Filtered View**  
**As a** power user (Persona 3)  
**I want to** bookmark a specific room filter view  
**So that** I can quickly navigate to it later

**Acceptance Criteria:**

- Given I've filtered plants by a specific room (e.g., Kitchen)
- When I look at the browser URL
- Then I see `/dashboard?room=kitchen`
- When I bookmark this URL and return to it later
- Then the dashboard loads with the Kitchen filter already applied
- And only Kitchen plants are visible

**Priority:** Could-have  
**Complexity:** Small (1 point)

---

#### Epic 7: Limits & Scalability

**US-7.1: Enforce Plant Limit**  
**As a** system admin  
**I want to** limit free users to 50 plants  
**So that** we can control database growth and prepare for future premium tiers

**Acceptance Criteria:**

- Given I'm a user with 50 plants already created
- When I try to click [Add Plant]
- Then I see a message: "You've reached the limit of 50 plants on the free plan. Consider upgrading to Premium in the future."
- And the [Add Plant] button is disabled or the modal doesn't allow creation
- Given I have fewer than 50 plants
- Then I can create plants normally

**Priority:** Should-have  
**Complexity:** Small (2 points)

---

**US-7.2: Enforce AI Generation Limit**  
**As a** system admin  
**I want to** limit free users to 20 AI generations per month  
**So that** we can control API costs (PlantNet + GPT-5)

**Acceptance Criteria:**

- Given I'm a user who has used AI generation 20 times this calendar month
- When I try to click [Use AI] to create a plant
- Then I see a message: "You've used your 20 AI generations this month. Try again on [first day of next month] or create plants manually."
- And the [Use AI] option is disabled
- And [Create Manually] option remains available
- Given it's a new calendar month
- Then my AI generation counter resets to 0

**Priority:** Should-have  
**Complexity:** Medium (3 points)

---

#### Epic 8: Accessibility & UX

**US-8.1: High Contrast UI for Neurodivergent Users**  
**As a** neurodivergent user (Persona 1)  
**I want to** see clear visual distinctions between UI elements  
**So that** I can easily navigate and understand the interface

**Acceptance Criteria:**

- Given I'm using the application
- Then all text has a minimum contrast ratio of 4.5:1 against backgrounds (WCAG 2.1 AA)
- And interactive elements (buttons, links) have minimum 44x44px touch targets
- And color is not the only indicator of status (e.g., overdue plants have both red color AND an icon)
- And fonts are minimum 16px for body text

**Priority:** Must-have  
**Complexity:** Medium (3 points - requires audit and fixes)

---

**US-8.2: Clear, Concrete Language**  
**As a** neurodivergent user (Persona 1)  
**I want to** see simple, direct instructions and labels  
**So that** I can understand exactly what actions to take

**Acceptance Criteria:**

- Given I'm using any feature in the app
- Then all button labels are action-oriented and specific:
  - ✅ "Watered Today" instead of "Refresh" or "Update"
  - ✅ "Add Plant" instead of "New" or "+"
  - ✅ "Delete Forever" instead of "Remove"
- And care instructions use concrete language:
  - ✅ "Water every 7 days" instead of "Water regularly"
  - ✅ "Place in bright indirect sunlight for 6-8 hours" instead of "Needs lots of light"

**Priority:** Must-have  
**Complexity:** Small (2 points - content review)

---

**US-8.3: Keyboard Navigation**  
**As a** user who prefers keyboard navigation  
**I want to** navigate the entire application using only keyboard  
**So that** I can use the app without a mouse

**Acceptance Criteria:**

- Given I'm using the application with only keyboard
- When I press Tab, focus moves to the next interactive element
- And focused elements have visible focus indicators (outline/highlight)
- When I press Enter or Space on a focused button, it activates
- And I can use Escape to close modals
- And I can navigate through all forms using Tab and Shift+Tab

**Priority:** Should-have  
**Complexity:** Medium (3 points)

---

### Priority Summary for MVP:

**Must-Have (Core MVP):**

- All authentication stories (US-1.1 to 1.3)
- Manual plant creation (US-2.1, 2.2)
- AI plant creation and identification (US-3.1 to 3.5)
- View, edit, delete plants (US-4.1 to 4.4)
- Watering tracking and notifications (US-5.1 to 5.5)
- High contrast UI and clear language (US-8.1, 8.2)

**Should-Have (Important for MVP):**

- Rooms/organization (US-6.1 to 6.3)
- Usage limits (US-7.1, 7.2)
- Keyboard navigation (US-8.3)

**Could-Have (Nice to have, can be post-MVP):**

- Bookmarking filtered views (US-6.4)

---

## 5. TECHNICAL STACK & ARCHITECTURE

### Frontend

- **Framework:** React Router v7 (SSR - Server-Side Rendering)
  - React Router v7 is the merged version of React Router + Remix
  - Supports Server Components and Route-based code splitting
  - Uses Remix-style loaders and actions for data fetching and mutations
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui (pre-built accessible components)
- **Image Compression:** browser-image-compression library
- **State Management:** React Context or Zustand (minimal)

### Backend

- **BaaS:** Supabase
  - PostgreSQL database
  - Auth (email/password + Google OAuth)
  - Storage (for plant photos)
  - Row Level Security policies

### External APIs

- **PlantNet API:** Free tier (5000 requests/month, then $9/m)
- **OpenAI GPT-5 API:** Pay-as-you-go (~$0.01-0.03 per generation)

### Hosting & Deployment

- **Hosting:** Vercel (supports React Router v7 SSR)
- **CI/CD:** Vercel Git integration (auto-deploy from main branch)
- **Env Management:** Vercel environment variables

### Cost Breakdown (Monthly)

- Vercel: ~$0-20 (Hobby tier may suffice for MVP)
- Supabase: ~$25 (Pro tier for production)
- PlantNet: $0-9 (depending on usage)
- GPT-5: ~$50-150 (at 1000 users, 5 plants avg)
- **Total:** ~$75-200/month (within budget)

---

## 6. USER FLOWS

### Flow 1: Onboarding (First-Time User)

1. Landing page → [Get Started Free]
2. Sign up (email/password or Google)
3. Dashboard (empty state)
4. Large CTA: "Add your first plant" + visual
5. Choice: [Create Manually] or [Use AI (recommended)]

### Flow 2: Creating Plant Card (AI)

1. [Use AI] → Upload photo
2. Loading (5-10s): "Identifying plant..."
3. Result: "This is Monstera Deliciosa" + photo preview
4. [Yes, that's my plant] or [No, enter name]
5. If Yes: Loading (5-15s): "Generating care instructions..."
6. Preview screen:
   - Photo
   - Name
   - Watering frequency (editable)
   - Room (dropdown, optional)
   - Collapsible care instructions (basics, extended, troubleshooting)
7. [Accept] or [Edit]
8. Feedback modal: Thumbs up/down + optional comment
9. Redirect to Dashboard with success message
10. Card visible on Dashboard

### Flow 3: Daily Watering Routine

1. User opens app
2. Dashboard → Click [🔔 Notifications]
3. Modal: list of 3 plants (2 today, 1 overdue)
4. Click [Watered] on first one
5. Item disappears from list, saved to database
6. Click on second plant (instead of [Watered])
7. Redirect to card details
8. Review information + watering history
9. Click [Watered] in details
10. Success message, back to Dashboard
11. Card updates status: "Last watered: today | Next: in 7 days"

### Flow 4: Organizing with Rooms

1. Dashboard → Horizontal chip scroll
2. [All] [+New Room]
3. Click [+New Room] → inline input "Room name"
4. Enter "Balcony" → chip appears
5. Click [Balcony] → Dashboard filters only plants from this room
6. URL updates: `/dashboard?room=balcony`
7. User can bookmark this view

---

## 7. OUT OF SCOPE (Not in MVP)

- Native apps (iOS/Android)
- Real push notifications (email/SMS/browser push)
- Sharing cards with other users
- Paid subscriptions / Premium features (infrastructure only)
- Offline mode / PWA capabilities
- Advanced media handling (multiple photos, galleries)
- Intelligent watering adjustment (seasonal, weather-based)
- Community features (forums, social feed)
- Plant health diagnosis with AI
- Advanced analytics (charts, reports)
- Data export/import
- IoT integrations (smart sensors)
