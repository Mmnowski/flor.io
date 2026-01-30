# Deployment Plan: Flor.io to Vercel with GitHub Actions CI/CD

## Objective

Deploy the Flor.io plant care application to Vercel with automated CI/CD via GitHub Actions. The setup prioritizes simplicity for low-traffic usage while maintaining production quality.

## Architecture Overview

**Stack:**

- Frontend/Backend: React Router v7 (SSR)
- Database: Supabase (PostgreSQL)
- Hosting: Vercel (Node.js runtime)
- CI/CD: GitHub Actions
- Storage: Supabase Storage (plant photos)

**Deployment Flow:**

```
Local Development → GitHub Push → GitHub Actions CI → Vercel Deploy
```

## Pre-Deployment Requirements

### 1. GitHub Repository Setup

**Location:** `/Users/mmnowski/Projects/AI/10x/flor-io`

**Actions needed:**

1. Initialize git repository (if not already done)
2. Create `.gitignore` (verify `.env` is included) ✅ DONE
3. Create GitHub repository
4. Push initial commit

**Commands:**

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <github-url>
git push -u origin main
```

### 2. Supabase Configuration

**Status:** ✅ Already set up

**Verify these exist:**

- Database tables: `plants`, `rooms`, `watering_history`, `ai_feedback`, `usage_limits`
- Storage bucket: `plant-photos` (public, with RLS policies)
- RLS policies enabled on all tables

**Environment variables to collect:**

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## Implementation Status

### Phase 0: Documentation ✅ COMPLETE

- Saved deployment plan to: `.ai/implementation-notes/deployment/DEPLOYMENT_IMPLEMENTATION_PLAN.md`

### Phase 1: Repository Configuration 🔄 IN PROGRESS

- ✅ `.gitignore` updated with `.vercel`, `*.log`, `.env.local`, `.env.production`
- ⏳ GitHub repository creation (requires user action)
- ⏳ GitHub secrets setup (requires user action)

### Phase 2: Vercel Configuration ⏳ PENDING USER ACTION

- Create Vercel project
- Configure environment variables
- Set NODE_ENV and other production vars

### Phase 3: GitHub Actions CI/CD ✅ COMPLETE

- ✅ Created `.github/workflows/deploy.yml` - Main CI/CD pipeline
  - Runs tests and typecheck on all PRs
  - Deploys to production on main branch push
  - Creates preview deployments for PRs
- ✅ Created `.github/workflows/test.yml` - Branch testing workflow
  - Quick feedback on feature branches (no deployment)

### Phase 4: Vercel Configuration ✅ COMPLETE

- ✅ Created `vercel.json` with proper React Router configuration

### Phase 5: Post-Deployment Configuration ⏳ PENDING USER ACTION

- Custom domain setup (optional)
- Enable Vercel Analytics (optional)
- Error monitoring setup (optional)

## Critical Files Created

### Workflows

- `.github/workflows/deploy.yml` - Production deployment + preview deployments
- `.github/workflows/test.yml` - Branch testing only (no deploy)

### Configuration

- `vercel.json` - Vercel build and deployment settings

### Documentation

- `.ai/implementation-notes/deployment/DEPLOYMENT_IMPLEMENTATION_PLAN.md` - This file

### Updated Files

- `.gitignore` - Added `.vercel`, `*.log`, `.env.local`, `.env.production`

## Next Steps (User Action Required)

### 1. Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `flor-io`
3. Visibility: **Private** (recommended)
4. Don't initialize with README (we have code)
5. Click "Create repository"

### 2. Push Code to GitHub

```bash
cd /Users/mmnowski/Projects/AI/10x/flor-io
git remote add origin https://github.com/<your-username>/flor-io.git
git branch -M main
git push -u origin main
```

### 3. Create Vercel Project

1. Go to https://vercel.com/new
2. "Import from Git" → Select your GitHub repository
3. Framework Preset: **React Router** (or select "Other" if not available)
4. Build settings should auto-detect:
   - Build Command: `yarn build`
   - Output Directory: `build/client`
   - Install Command: `yarn install`
5. Click "Deploy" (will fail on env vars, that's OK)

### 4. Get Vercel Credentials

After creating the Vercel project:

**Find these values:**

- Go to Vercel Dashboard → Project Settings → General
- Copy: `ORG_ID` and `PROJECT_ID`
- Go to Vercel Account → Settings → Tokens
- Create new token (call it "GitHub Actions")
- Copy the token value

### 5. Add GitHub Secrets

1. Go to your GitHub repository
2. Settings → Secrets and variables → Actions → New repository secret
3. Add three secrets:
   - `VERCEL_TOKEN` = (token from step 4)
   - `VERCEL_ORG_ID` = (org ID from step 4)
   - `VERCEL_PROJECT_ID` = (project ID from step 4)

### 6. Configure Environment Variables in Vercel

Dashboard → Project Settings → Environment Variables

**Required for Production:**

| Variable                    | Value                     | Source             |
| --------------------------- | ------------------------- | ------------------ |
| `SUPABASE_URL`              | Your Supabase URL         | Supabase dashboard |
| `SUPABASE_ANON_KEY`         | Your anon key             | Supabase dashboard |
| `SUPABASE_SERVICE_ROLE_KEY` | Your service role key     | Supabase dashboard |
| `VITE_SUPABASE_URL`         | Same as SUPABASE_URL      | Supabase dashboard |
| `VITE_SUPABASE_ANON_KEY`    | Same as SUPABASE_ANON_KEY | Supabase dashboard |
| `SESSION_SECRET`            | 32+ random hex chars      | Generate below     |
| `NODE_ENV`                  | `production`              | Literal value      |
| `USE_REAL_PLANTNET_API`     | `false`                   | Literal value      |
| `USE_REAL_OPENAI_API`       | `false`                   | Literal value      |

**Generate SESSION_SECRET:**

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 7. Trigger First Deployment

Push a commit to main:

```bash
git add .
git commit -m "chore: setup deployment pipeline"
git push origin main
```

Watch the deployment:

1. GitHub → Actions → Latest workflow run
2. Wait for tests to pass
3. Vercel deployment will start automatically
4. Check Vercel dashboard for deployment status

### 8. Verify Production Deployment

Once Vercel deployment completes:

1. Visit your Vercel deployment URL
2. Test authentication (sign up, login)
3. Test plant creation
4. Test plant watering history
5. Test AI wizard (with mock APIs)
6. Test image uploads
7. Check browser console for errors
8. Test on mobile device

## Environment Variables Reference

### Server-Side (Not Exposed to Client)

- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_ANON_KEY` - Public anon key for client operations
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key for admin operations (uploads, etc.)
- `SESSION_SECRET` - Cookie session secret (must be >32 characters)
- `NODE_ENV` - Should be `production` in Vercel
- `USE_REAL_PLANTNET_API` - Set to `false` for MVP (avoid API costs)
- `USE_REAL_OPENAI_API` - Set to `false` for MVP (avoid API costs)

### Client-Side (Exposed via VITE\_ prefix)

- `VITE_SUPABASE_URL` - Same as SUPABASE_URL
- `VITE_SUPABASE_ANON_KEY` - Same as SUPABASE_ANON_KEY

**Important:** Only `VITE_` prefixed variables are exposed to the browser!

## Rollback Strategy

**Quick Rollback via Vercel:**

1. Vercel Dashboard → Deployments
2. Find previous working deployment
3. Click "..." → "Promote to Production"

**Rollback via Git:**

```bash
git revert <commit-sha>
git push origin main
# GitHub Actions will automatically redeploy
```

## Performance Targets

From `.ai/documentation/DEPLOYMENT.md`:

- First Contentful Paint: <1.5s
- Largest Contentful Paint: <2.5s
- Lighthouse Performance: >80
- Main bundle (gzipped): <200KB ✅ (currently ~198KB)

**Post-deployment testing:**

- Chrome DevTools → Lighthouse
- https://pagespeed.web.dev/ (with production URL)

## Cost Estimate

**Free Tier (Expected for MVP with few users):**

- Vercel: Free (Hobby plan)
  - 100GB bandwidth/month
  - 100 hours serverless function execution
  - Automatic SSL
  - 1 preview deployment per PR
- Supabase: Free tier
  - 500MB database
  - 1GB file storage
  - 50,000 monthly active users
- GitHub Actions: 2,000 minutes/month free

**If you exceed free tier:**

- Vercel Pro: $20/month (unlikely needed for low traffic)
- Supabase Pro: $25/month (only if >500MB needed)

## Monitoring & Maintenance

### Daily Checks

- None required (Vercel handles uptime monitoring)

### Weekly Checks

- Check Vercel deployment logs for errors
- Review Supabase storage usage (track if approaching limits)

### Monthly Tasks

- Review GitHub Actions usage (unlikely to exceed free tier)
- Check Vercel bandwidth usage (unlikely to exceed 100GB)
- Review error rates in deployment logs

## Future Enhancements

**When ready to scale:**

1. Enable real AI APIs (OpenAI + PlantNet)
2. Add staging environment on Vercel
3. Set up proper error tracking (Sentry)
4. Add performance monitoring
5. Implement database migrations system
6. Add health check endpoint

**CI/CD Improvements:**

1. Add code coverage reporting
2. Add E2E tests to CI
3. Add Lighthouse CI for performance regression testing
4. Add dependency security scanning

## Troubleshooting

### Common Issues

**1. Build Fails on Vercel**

- Check Node.js version in Vercel settings (should be 18.0.0+)
- Verify all dependencies in package.json
- Check Vercel deployment logs for specific errors
- Try local build first: `yarn build`

**2. Environment Variables Not Working**

- Verify `VITE_` prefix for client-side variables
- Check variables are set in "Production" environment
- Redeploy after adding new variables (Vercel doesn't reload env)
- Verify case sensitivity (env vars are case-sensitive)

**3. Database Connection Fails**

- Verify Supabase URL is correct
- Verify keys are correct (not swapped)
- Check Supabase project is not paused (free tier pauses after 7 days)
- Verify RLS policies allow connections
- Check Supabase status page for outages

**4. Image Uploads Fail**

- Verify Supabase storage bucket exists: `plant-photos`
- Check bucket is public (required for image display)
- Verify storage policies allow uploads
- Verify `SUPABASE_SERVICE_ROLE_KEY` is set (needed for server uploads)

**5. GitHub Actions Fail**

- Check secrets are set correctly (typos in names)
- Verify Vercel token has correct permissions
- Ensure `yarn.lock` is committed (needed for frozen lockfile)
- Check GitHub Actions logs for specific errors

**6. Deployment Stuck in Progress**

- Check Vercel build logs for hanging processes
- Look for infinite loops or long-running operations
- Increase Vercel function timeout if needed

## References

- Vercel React Router docs: https://vercel.com/docs/frameworks/react-router
- GitHub Actions docs: https://docs.github.com/en/actions
- Supabase docs: https://supabase.com/docs
- React Router v7 docs: https://reactrouter.com
- Existing deployment docs: `.ai/documentation/DEPLOYMENT.md`

## Status Checklist

### Implementation Complete ✅

- [x] Created GitHub Actions workflows (deploy.yml, test.yml)
- [x] Created Vercel configuration (vercel.json)
- [x] Updated .gitignore
- [x] Created deployment documentation

### Pending User Action ⏳

- [ ] Create GitHub repository
- [ ] Push code to GitHub
- [ ] Create Vercel project
- [ ] Get Vercel credentials
- [ ] Add GitHub secrets
- [ ] Configure environment variables in Vercel
- [ ] Trigger first deployment
- [ ] Verify production deployment

### Optional Enhancements 🎁

- [ ] Add custom domain
- [ ] Enable Vercel Analytics
- [ ] Set up error monitoring (Sentry)
- [ ] Add Lighthouse CI
- [ ] Add code coverage reporting

---

**Created:** 2026-01-29
**Implementation Plan:** Vercel + GitHub Actions deployment for Flor.io
