# Flor.io Implementation Todo

**Last Updated:** 2025-01-25

## CRITICAL: Before Each Step
1. Check this todo list for current status
2. Update status after completing each task
3. Commit progress to git with meaningful messages
4. Update this file with any blockers or changes

---

## Phase 1: Foundation & Infrastructure ⭐ CURRENT PHASE

### 1.1 Dependencies & Environment Setup
- ✅ Install dependencies: @supabase/supabase-js, sharp, shadcn/ui utilities, etc.
- ✅ Create `.env.example` with required variables
- ✅ Set up Vite path aliases validation
- ✅ Verify TypeScript compilation passes

### 1.2 Supabase Integration
- ✅ Create `app/lib/supabase.server.ts` - Server-side client
- ✅ Create `app/lib/supabase.client.ts` - Browser-side client
- ✅ Create `app/lib/auth.server.ts` - Auth utility functions
- ✅ Create `app/lib/session.server.ts` - Session management
- ✅ Set up session storage with React Router
- ✅ Create types: `app/types/database.types.ts`

### 1.3 shadcn/ui Setup
- ✅ Initialize shadcn/ui with `npx shadcn@latest init`
- ✅ Install components: button, input, label, card, dialog, dropdown-menu, select, textarea, tabs, collapsible, avatar, badge, alert
- ✅ Update `components.json` config
- ✅ Verify Tailwind integration works

### 1.4 Authentication Routes
- ✅ Create `app/routes/auth.login.tsx`
- ✅ Create `app/routes/auth.register.tsx`
- ✅ Create `app/routes/auth.logout.tsx`
- [ ] Test login/register flow with mock Supabase

### 1.5 Protected Routes & Middleware
- ✅ Create `app/lib/require-auth.server.ts`
- [ ] Test redirection to login for unauthenticated users
- [ ] Verify session persistence

### 1.6 Root Layout & Navigation
- ✅ Update `app/root.tsx` with navigation
- ✅ Create `app/components/nav.tsx` - Navigation component
- ✅ Add semantic HTML elements (nav, main)

### 1.7 Core Utilities & Dashboard Skeleton
- ✅ Create `app/lib/utils.ts` - cn() and helper functions (created by shadcn)
- ✅ Create `app/components/loading-spinner.tsx`
- ✅ Create `app/components/empty-state.tsx`
- ✅ Create `app/components/form-error.tsx`
- ✅ Create home page landing
- ✅ Create dashboard.tsx and dashboard._index.tsx stubs
- ✅ Create plant routes stubs
- ✅ Update `app/routes.ts` with all routes

### Phase 1 Status:
- Foundations complete, ready for Phase 2 implementation
- Database setup still needed (create Supabase project and run SQL schema)
- Need to create .env file with real Supabase credentials to test

---

## Phase 2: Core Plant Management

### 2.1 Database & Image Processing
- [ ] Create `app/lib/image.server.ts` - Image compression (Sharp)
- [ ] Create `app/lib/plants.server.ts` - Plant CRUD utilities
- [ ] Test image compression (target: 500KB, 1920px max)

### 2.2 Dashboard Routes
- [ ] Create `app/routes/dashboard.tsx`
- [ ] Create `app/routes/dashboard._index.tsx`
- [ ] Update routes.ts with dashboard structure
- [ ] Create `app/components/plant-card.tsx`
- [ ] Implement plant list grid layout

### 2.3 Manual Plant Creation
- [ ] Create `app/routes/dashboard.plants.new.tsx`
- [ ] Implement form: name, photo, frequency, room
- [ ] Implement file upload handler
- [ ] Implement action to save plant to Supabase

### 2.4 Plant Details & Watering
- [ ] Create `app/routes/dashboard.plants.$plantId.tsx`
- [ ] Implement details display layout
- [ ] Implement "Watered Today" button action
- [ ] Show watering history

### 2.5 Edit & Delete
- [ ] Create `app/routes/dashboard.plants.$plantId.edit.tsx`
- [ ] Implement delete confirmation dialog
- [ ] Test CRUD operations end-to-end

### Phase 2 Complete When:
- ✅ User can create plant with photo and basic info
- ✅ User can view dashboard with plant list
- ✅ User can see plant details and watering history
- ✅ User can edit plant info
- ✅ User can delete plants

---

## Phase 3: Watering System

### 3.1 Watering Utilities & Calculations
- [ ] Create `app/lib/watering.server.ts`
- [ ] Implement next watering date calculation
- [ ] Test calculations with various frequencies

### 3.2 Notifications API & Modal
- [ ] Create `app/routes/api.notifications.tsx`
- [ ] Create `app/components/notifications-modal.tsx`
- [ ] Implement notification badge in nav
- [ ] Test with overdue plants

### Phase 3 Complete When:
- ✅ User sees notification badge for overdue plants
- ✅ Notifications modal shows overdue plants with correct status
- ✅ User can mark plants as watered from modal

---

## Phase 4: AI Integration

### 4.1 Mocked API Services
- [ ] Create `app/lib/plantnet.server.ts` - Mocked identification
- [ ] Create `app/lib/openai.server.ts` - Mocked care instructions
- [ ] Test API responses with delays

### 4.2 AI Creation Flow
- [ ] Create `app/routes/dashboard.plants.new-ai.tsx`
- [ ] Create `app/components/ai-creation-steps.tsx` - Multi-step wizard
- [ ] Create `app/components/ai-feedback-dialog.tsx`
- [ ] Implement 6-step wizard flow
- [ ] Implement feedback submission

### 4.3 Usage Limits
- [ ] Create `app/lib/usage-limits.server.ts`
- [ ] Implement plant count limit (50)
- [ ] Implement AI usage limit (20/month)
- [ ] Show error messages when limits reached

### Phase 4 Complete When:
- ✅ User can create plant with AI (mocked)
- ✅ AI wizard shows all 6 steps
- ✅ Feedback modal appears after creation
- ✅ Usage limits enforce correctly

---

## Phase 5: Organization & Polish

### 5.1 Rooms Management
- [ ] Create `app/routes/api.rooms.tsx` - Rooms CRUD
- [ ] Implement room creation in plant forms
- [ ] Implement dashboard filtering by room
- [ ] Update URL params for bookmarkable filters

### 5.2 Error Handling & Validation
- [ ] Create `app/lib/validation.ts` - Validation utilities
- [ ] Add client-side validation (required, email, password strength)
- [ ] Add server-side validation (re-validate all inputs)
- [ ] Update error boundaries

### 5.3 Loading States & Optimistic UI
- [ ] Add loading indicators to forms
- [ ] Implement skeleton loaders
- [ ] Implement optimistic UI for watering action

### 5.4 Accessibility Audit
- [ ] Test keyboard navigation (Tab, Enter, Escape)
- [ ] Verify focus indicators (min 2px)
- [ ] Check color contrast (4.5:1 minimum)
- [ ] Verify touch targets (min 44x44px)
- [ ] Add ARIA labels where needed
- [ ] Test with screen reader

### Phase 5 Complete When:
- ✅ All form validation works (client & server)
- ✅ Loading states show during API calls
- ✅ Accessible with keyboard only
- ✅ Meets WCAG 2.1 AA standards

---

## Phase 6: Testing & Optimization

### 6.1 Unit Tests
- [ ] Install Vitest and testing libraries
- [ ] Create test setup and mocks
- [ ] Write tests for: watering calculations, validation, components
- [ ] Achieve >70% code coverage

### 6.2 Performance
- [ ] Run Lighthouse audit on dashboard
- [ ] Optimize images (next-gen formats, lazy loading)
- [ ] Check bundle size
- [ ] Target >80 score on all pages

### 6.3 Documentation
- [ ] Update CLAUDE.md with implementation details
- [ ] Create DEPLOYMENT.md
- [ ] Create TESTING.md

### Phase 6 Complete When:
- ✅ All unit tests pass
- ✅ Lighthouse score >80
- ✅ Documentation is complete

---

## Database Setup (Parallel to Implementation)

### SQL Schema & Policies
- [ ] Apply database schema to Supabase
- [ ] Create all tables (plants, watering_history, rooms, ai_feedback, usage_limits)
- [ ] Apply Row Level Security policies
- [ ] Create indexes
- [ ] Create storage bucket for plant photos

### Verification
- [ ] Test RLS policies (user isolation)
- [ ] Test file upload via SDK
- [ ] Test database functions

---

## Git Workflow

After each major task:
```bash
git add .
git commit -m "feat: [phase].[task] - description"
git status
```

Mark completed items with ✅ and update timestamps.

---

## Blockers & Notes

(Update this section as issues arise)

- None yet

---

## Environment Variables Template

```
# Supabase
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Session
SESSION_SECRET=

# APIs (for future real integration)
PLANTNET_API_KEY=
OPENAI_API_KEY=
```

