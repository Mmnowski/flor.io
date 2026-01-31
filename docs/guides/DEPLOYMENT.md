# Deployment Guide - Flor.io

This guide covers environment setup, database configuration, and deployment procedures for Flor.io.

## Prerequisites

- **Node.js**: 18.0.0 or higher
- **Yarn**: Package manager (installed with Node)
- **Supabase Account**: For PostgreSQL database and authentication
- **Environment Variables**: API keys and connection strings (see below)

## Local Development Setup

### 1. Environment Configuration

Create a `.env` file in the root directory with these variables:

```bash
# Supabase Connection
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Session Management
SESSION_SECRET=$(openssl rand -base64 32)  # Generate secure random key

# Optional: AI Service Keys (for production integration)
OPENAI_API_KEY=sk-...
PLANT_ID_API_KEY=your-plant-id-key

# Feature Flags (set to true to use real APIs, default is false for mocked data)
USE_REAL_PLANT_ID_API=false
USE_REAL_OPENAI_API=false
```

**Security Notes**:

- Add `.env` to `.gitignore` (already configured)
- Never commit keys to version control
- Use strong random values for `SESSION_SECRET`
- Rotate keys annually
- Store secrets in CI/CD platform (GitHub Secrets, etc.)

### 2. Install Dependencies

```bash
# Install all dependencies
yarn install

# Verify installation
yarn --version
node --version
```

### 3. Database Setup

Flor.io uses **Supabase** (managed PostgreSQL) for the database.

#### Option A: Using Supabase Dashboard (Recommended for MVP)

1. Create Supabase project at https://app.supabase.com
2. Go to SQL Editor
3. Copy and paste the entire schema from `IMPLEMENTATION_PLAN.md` (section: "SQL Schema for Supabase")
4. Run the SQL queries to create:
   - Tables (rooms, plants, watering_history, ai_feedback, usage_limits)
   - Indexes (for performance)
   - Row Level Security (RLS) policies
   - Storage buckets
   - Helper functions

#### Option B: Using Supabase CLI (Advanced)

```bash
# Install Supabase CLI
npm install -g supabase

# Login to your Supabase account
supabase login

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Apply migrations
supabase db push
```

#### Database Schema Components

The schema includes:

| Component          | Purpose                                                        |
| ------------------ | -------------------------------------------------------------- |
| `plants`           | Stores plant data (name, photo, watering frequency, care info) |
| `rooms`            | Organizes plants into rooms for filtering                      |
| `watering_history` | Tracks when plants were watered                                |
| `ai_feedback`      | Stores user feedback on AI recommendations                     |
| `usage_limits`     | Tracks monthly AI generation usage                             |

**Key Features**:

- Row Level Security (RLS) - Users can only access their own data
- Indexes on frequently queried columns
- Cascade deletes (deleting a plant removes its watering history)
- Functions for calculating next watering dates

### 4. Storage Configuration

Set up Supabase Storage for plant photos:

1. In Supabase Dashboard → Storage
2. Create bucket: `plant-photos`
3. Make bucket public
4. Set storage policies:

```sql
-- Users can upload their own photos
CREATE POLICY "Users can upload their own plant photos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'plant-photos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can view their own photos
CREATE POLICY "Users can view their own plant photos"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'plant-photos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
```

## Running Locally

### Development Server

```bash
# Start dev server with hot reloading
yarn dev

# Server runs on: http://localhost:5173
# Open in browser to test the app
```

### Type Checking

Always verify TypeScript before deploying:

```bash
# Check for TypeScript errors
yarn typecheck

# Fix errors before proceeding
```

### Running Tests

```bash
# Run all tests
yarn test

# Run tests in watch mode (during development)
yarn test:watch

# Generate coverage report
yarn test:coverage
```

## Production Build

### Build Process

```bash
# Create optimized production build
yarn build

# Build output:
# - build/client/  → Static assets (HTML, CSS, JS)
# - build/server/  → Server-side code
# - dist/stats.html → Bundle size analysis
```

### Start Production Server

```bash
# Start server locally (for testing)
yarn start

# Runs on: http://localhost:5000

# In production, run with Node:
node build/server/index.js
```

### Build Verification

Before deploying:

```bash
# 1. Build
yarn build

# 2. Check for errors
echo "Build completed successfully"

# 3. Verify bundle size
ls -lah build/client/

# 4. Run production server locally
yarn start

# 5. Test key flows in browser
# - Login/Register
# - Create plant
# - Watering tracking
# - Notifications
```

## Performance Targets

### Page Load Performance

- **First Contentful Paint (FCP)**: <1.5s
- **Largest Contentful Paint (LCP)**: <2.5s
- **Cumulative Layout Shift (CLS)**: <0.1
- **Time to Interactive (TTI)**: <3.5s

### Lighthouse Scores (Target)

- **Performance**: >80
- **Accessibility**: >90
- **Best Practices**: >85
- **SEO**: >85

### Bundle Size Limits

- **Main bundle** (gzipped): <200KB
- **CSS** (gzipped): <50KB
- **Individual routes**: <100KB each

Monitor with:

```bash
# After build
open dist/stats.html  # See bundle breakdown
```

## Database Performance

### Key Indexes

```sql
-- Already created by schema, but verify with:
SELECT * FROM pg_indexes WHERE tablename = 'plants';
```

**Indexes Ensure Fast Queries**:

- Users → Plants: `idx_plants_user_id`
- Plants → Rooms: `idx_plants_room_id`
- Watering History: `idx_watering_history_plant_id`, `idx_watering_history_watered_at`

### Query Optimization Tips

1. **Limit results**:

   ```typescript
   .limit(10)  // For notifications list
   ```

2. **Use `.single()`** for unique lookups:

   ```typescript
   .single()  // Returns one row, not array
   ```

3. **Filter early**:
   ```typescript
   .eq('user_id', userId)
   .eq('month_year', '2025-01')
   ```

## Deployment Platforms

### Option 1: Vercel (Recommended)

Vercel handles React Router + Node.js servers seamlessly.

1. **Connect GitHub**:
   - Push code to GitHub
   - Go to https://vercel.com
   - Import repository
   - Select "React Router" preset

2. **Configure Environment**:
   - In project settings → Environment Variables
   - Add all variables from `.env`

3. **Deploy**:

   ```bash
   # Push to main branch triggers automatic deployment
   git push origin main
   ```

4. **Verify Deployment**:
   - Check deployment logs in Vercel dashboard
   - Test app on https://your-app.vercel.app
   - Monitor performance with Vercel Analytics

### Option 2: Fly.io

```bash
# Install Fly CLI
brew install flyctl

# Login
flyctl auth login

# Create app
flyctl launch

# Configure Dockerfile (if needed)
# Add environment variables to fly.toml

# Deploy
flyctl deploy

# Check logs
flyctl logs
```

### Option 3: Docker Deployment

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .
RUN yarn build

EXPOSE 5000

CMD ["yarn", "start"]
```

```bash
# Build image
docker build -t flor-io .

# Run container
docker run -p 5000:5000 \
  -e SUPABASE_URL=... \
  -e SUPABASE_ANON_KEY=... \
  -e SESSION_SECRET=... \
  flor-io
```

## Database Backups

### Supabase Automatic Backups

Supabase automatically backs up databases daily. To restore:

1. Go to Supabase Dashboard → Backups
2. Select backup date
3. Click "Restore"
4. Changes take 5-10 minutes

### Manual Export

```bash
# Export database
pg_dump postgresql://user:password@host:port/database > backup.sql

# Restore from backup
psql postgresql://user:password@host:port/database < backup.sql
```

## Monitoring & Logging

### Application Logs

**Vercel**:

- Real-time logs in dashboard
- Filter by status code, path, duration

**Fly.io**:

```bash
flyctl logs  # Stream live logs
```

### Error Tracking (Optional)

Add error tracking for production issues:

```typescript
// app/lib/error-tracking.ts
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});

export const captureException = Sentry.captureException;
```

Use in error boundary:

```typescript
catch (error) {
  captureException(error);
  throw error;
}
```

### Monitoring Health

```bash
# Check basic health
curl https://your-app.com/

# Should return HTTP 200
```

## Database Maintenance

### Monthly Tasks

1. **Update Statistics**:

   ```sql
   ANALYZE;  -- Updates query planner statistics
   ```

2. **Vacuum Tables**:

   ```sql
   VACUUM ANALYZE;  -- Reclaims space, updates stats
   ```

3. **Review Slow Queries**:
   ```sql
   SELECT query, calls, total_time
   FROM pg_stat_statements
   ORDER BY total_time DESC
   LIMIT 10;
   ```

### Scaling Considerations

As users grow:

1. **Database**: Upgrade Supabase plan for higher compute
2. **Storage**: Monitor `plant-photos` bucket size
3. **API Rate Limits**: Consider caching for notifications
4. **Session Storage**: Consider Redis for distributed sessions

## Rollback Procedure

If deployment has critical issues:

**Vercel**:

1. Go to Deployments
2. Select previous working version
3. Click "Redeploy"
4. New deployment starts automatically

**Fly.io**:

```bash
flyctl releases  # List deployments
flyctl releases rollback  # Rollback to previous
```

**Database**:

```bash
# Restore from backup (see Backups section)
flyctl postgres attach --backup-id <backup-id>
```

## Pre-Deployment Checklist

Before each deployment:

- [ ] All tests passing: `yarn test`
- [ ] No TypeScript errors: `yarn typecheck`
- [ ] Build succeeds: `yarn build`
- [ ] Environment variables set
- [ ] Database migrations applied
- [ ] Bundle size under limits: `dist/stats.html`
- [ ] Lighthouse scores >80 on main pages
- [ ] Smoke test on staging (if available)
- [ ] Security check for secrets in code
- [ ] Performance monitoring configured

## Troubleshooting

### "Connection timeout to Supabase"

**Cause**: Network issue or invalid credentials

**Fix**:

```bash
# Verify environment variables
echo $SUPABASE_URL
echo $SUPABASE_ANON_KEY

# Test connection
curl -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
  $SUPABASE_URL/rest/v1/plants?limit=1
```

### "Failed to upload image to storage"

**Cause**: Storage permissions or file too large

**Fix**:

1. Check storage policies are set correctly
2. Verify file is <10MB (app limits to 500KB after compression)
3. Check bucket name matches code

### "Build fails with TypeScript errors"

**Fix**:

```bash
# Check errors
yarn typecheck

# Fix type errors in code
# Commit and retry
```

### "Database schema not applied"

**Fix**:

```bash
# Check Supabase dashboard for tables
# Manually run SQL in SQL Editor
# Verify RLS policies are created
```

## Getting Help

- **Deployment Issues**: Check platform docs (Vercel, Fly.io)
- **Database Issues**: Supabase docs at https://supabase.com/docs
- **Code Issues**: See code comments and IMPLEMENTATION_PLAN.md
- **Testing**: Check TESTING.md for test coverage

---

**Last Updated**: January 27, 2026
**Current Version**: Phase 5 (MVP)
**Status**: Ready for Production
