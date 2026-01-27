# Next Steps - Phase 2 Implementation Guide

## 1. Create Supabase Project (5-10 minutes)

1. Go to https://supabase.com
2. Sign up or login
3. Click "Create a new project"
4. Fill in:
   - Project name: "flor-io"
   - Database password: (generate secure one)
   - Region: (closest to you)
5. Wait for project to be created (~2 minutes)

## 2. Get Your Credentials

1. Go to Project Settings → API
2. Copy:
   - **Project URL** → `SUPABASE_URL`
   - **anon public** → `SUPABASE_ANON_KEY`
   - **service_role secret** → `SUPABASE_SERVICE_ROLE_KEY` (keep private!)
3. Generate a random string (32+ chars) for `SESSION_SECRET`

## 3. Create .env File

```bash
# In your flor-io directory
cp .env.example .env
```

Edit `.env` with your Supabase credentials:

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
SESSION_SECRET=your-random-32-char-string-here
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## 4. Create Database Schema

1. In Supabase dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy entire SQL schema from `.ai/IMPLEMENTATION_PLAN.md` (search for "SQL Schema")
4. Paste into the editor
5. Click "Run"
6. Wait for execution to complete

The SQL will create:

- `plants` table
- `watering_history` table
- `rooms` table
- `ai_feedback` table
- `usage_limits` table
- Indexes and Row Level Security policies
- Database functions for calculations

## 5. Create Storage Bucket

1. In Supabase dashboard, go to **Storage**
2. Click "Create a new bucket"
3. Name: `plant-photos`
4. Make it Public (check "Public bucket")
5. Click Create

## 6. Test Your Setup

```bash
# Terminal

# 1. Start the dev server
yarn dev

# 2. Open http://localhost:5173 in your browser
# 3. Click "Get Started Free"
# 4. Register with test account:
#    - Email: test@example.com
#    - Password: TestPassword123

# 5. You should be redirected to /dashboard
# 6. Click the menu icon and verify "Logout" appears
# 7. Click Logout
# 8. You should be back on home page
```

If this works, your authentication is set up correctly!

## 7. Begin Phase 2 Implementation

After testing, you're ready for Phase 2:

1. Implement manual plant creation form
   - File: `app/routes/dashboard.plants.new.tsx`
   - Features: Photo upload, name, watering frequency, room selection

2. Create image compression utility
   - File: `app/lib/image.server.ts`
   - Uses Sharp library to compress images

3. Implement plant CRUD utilities
   - File: `app/lib/plants.server.ts`
   - Database operations for creating, reading, updating plants

4. Build dashboard plant list
   - File: `app/routes/dashboard._index.tsx`
   - Show all plants with cards
   - Empty state if no plants
   - "Add Plant" button

5. Implement plant details page
   - File: `app/routes/dashboard.plants.$plantId.tsx`
   - Show plant info
   - "Watered Today" button
   - Watering history

6. Add edit/delete functionality
   - File: `app/routes/dashboard.plants.$plantId.edit.tsx`
   - Update plant info
   - Delete with confirmation

## Quick Reference

### Important Files to Update

- Check `.ai/IMPLEMENTATION_TODO.md` for detailed checklist
- Follow `.ai/IMPLEMENTATION_PLAN.md` for feature details
- Read `.ai/PROCESS.md` for development workflow

### Running Commands

```bash
yarn dev          # Start dev server
yarn typecheck    # Check TypeScript
yarn build        # Build for production
yarn start        # Run production build
```

### Database Queries (in Phase 2)

All database access goes through Supabase client:

```typescript
const { data, error } = await supabaseServer.from('plants').select('*').eq('user_id', userId);
```

### File Upload (in Phase 2)

Using Sharp for compression + Supabase Storage:

```typescript
const buffer = await file.arrayBuffer();
const compressed = await compressImage(Buffer.from(buffer));
await supabaseServer.storage.from('plant-photos').upload(`${userId}/${plantId}.jpg`, compressed);
```

## Troubleshooting

### "Cannot connect to Supabase"

- Check your .env file has correct credentials
- Make sure SUPABASE_URL doesn't have trailing slash

### "Row Level Security violation"

- Make sure you're logged in (have a valid userId in session)
- Check RLS policies were created by SQL schema

### "Type errors in routes"

- Run `yarn typecheck` to regenerate types
- Types are auto-generated from Supabase schema

### Images not uploading

- Check storage bucket exists and is public
- Check bucket policies allow authenticated uploads
- Check image is < 10MB and is valid image file

## Next Command to Run

After setting up .env and database:

```bash
git add .env  # (only if you want to track it locally, usually gitignored)
yarn dev
```

Then navigate to http://localhost:5173 and test!

---

**Estimated Time for Phase 2:** 10-15 hours of implementation
**Key Focus:** Getting plant CRUD working with database integration

Good luck! 🚀
