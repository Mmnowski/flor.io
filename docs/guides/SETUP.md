# Development Setup Guide

Complete guide to setting up a local development environment for Flor.io.

## Prerequisites

- **Node.js**: 18+ (check with `node --version`)
- **Yarn**: Latest version (install with `npm install -g yarn`)
- **Git**: For version control
- **Supabase Account**: Free tier available at https://supabase.com

## Step 1: Clone and Install

```bash
# Clone the repository
git clone <repository-url>
cd flor-io

# Install dependencies
yarn install

# Verify installation
yarn --version
node --version
```

## Step 2: Environment Configuration

### Create .env.local

Copy `.env.example` to `.env.local` and fill in values:

```bash
cp .env.example .env.local
```

### Required Environment Variables

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://[project-id].supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Server-side Supabase (service role)
SUPABASE_URL=https://[project-id].supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Session Secret (for cookie encryption)
SESSION_SECRET=generate-a-random-32-character-string

# External APIs (optional, can be mocked)
OPENAI_API_KEY=sk-...
PLANT_ID_API_KEY=...

# Feature Flags (optional, defaults to false to use mocked data)
USE_REAL_PLANT_ID_API=false
USE_REAL_OPENAI_API=false
```

### Getting Supabase Credentials

1. Go to https://supabase.com and sign in
2. Create a new project
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** → `VITE_SUPABASE_URL` and `SUPABASE_URL`
   - **anon public key** → `VITE_SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY`
5. Go to **Settings** → **Auth** → **Providers** → **Email**
6. Enable email authentication

### Generating SESSION_SECRET

```bash
# Generate a random 32-character secret
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
```

## Step 3: Database Setup

### Run Migrations

The project uses Supabase migrations. To set up the database:

1. Go to Supabase Dashboard
2. Navigate to **SQL Editor**
3. Run the migration SQL from IMPLEMENTATION_PLAN.md or run:

```bash
# If using Supabase CLI
supabase db push
```

### Create Storage Bucket

1. Go to **Storage** in Supabase dashboard
2. Create a new bucket called `plant-photos`
3. Set the bucket as **Private** (access controlled by RLS policies)

## Step 4: Start Development

```bash
# Start development server
yarn dev

# Open http://localhost:5173 in your browser
```

## Development Commands

### Running the Application

```bash
yarn dev          # Start dev server with hot reload
yarn build        # Create production build
yarn start        # Serve production build locally
```

### Code Quality

```bash
yarn typecheck    # TypeScript checking
yarn format       # Format code with Prettier
yarn lint         # Check for linting errors
yarn lint:fix     # Auto-fix linting errors
yarn quality      # Run all quality checks (recommended before committing)
```

### Testing

```bash
yarn test              # Run all tests once
yarn test:watch       # Watch mode (rerun on file changes)
yarn test:ui          # Open visual test dashboard
yarn test:coverage    # Generate coverage report (opens in coverage/index.html)
```

## Project Structure

Key directories to understand:

```
app/
├── features/           # Feature modules (plants, watering, rooms, ai-wizard)
├── shared/             # Shared components, hooks, utilities
├── routes/             # Route handlers and pages
├── lib/                # Server utilities (*.server.ts suffix)
├── types/              # TypeScript type definitions
└── layout/             # Layout components (navigation, header)

docs/                  # Documentation (you are here)
.ai/                   # AI agent notes and prompts
public/                # Static assets
```

See [../ARCHITECTURE.md](../ARCHITECTURE.md) for detailed structure.

## Useful Development Tips

### Watch Mode

Use watch mode during development for real-time feedback:

```bash
# Terminal 1: Development server
yarn dev

# Terminal 2: Type checking
yarn test:watch

# Terminal 3 (optional): Test UI
yarn test:ui
```

### Hot Module Replacement (HMR)

The dev server automatically reloads when you save files. Sometimes you may need to:

1. Hard refresh the browser (Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows)
2. Restart the dev server if encountering persistent issues

### TypeScript Errors

If you see TypeScript errors:

```bash
# Regenerate types and check
yarn typecheck

# Or for React Router specifically
npx react-router typegen
```

### Test Debugging

Run a single test file:

```bash
yarn test app/components/__tests__/PlantCard.test.tsx
```

Run tests matching a pattern:

```bash
yarn test -- --grep "watering"
```

## Troubleshooting

### "Cannot find module" errors

```bash
# Clear node_modules and reinstall
rm -rf node_modules yarn.lock
yarn install
```

### Supabase connection errors

1. Verify environment variables are set correctly
2. Check Supabase project is active
3. Ensure IP is allowed (usually automatic)
4. Test with: `curl https://[project-id].supabase.co/rest/v1/`

### Port 5173 already in use

```bash
# Use a different port
yarn dev -- --port 3000

# Or find and kill the process
lsof -i :5173
kill -9 <PID>
```

### Tests failing with module errors

```bash
# Clear Vitest cache
rm -rf node_modules/.vitest

# Run with debugging
yarn test -- --reporter=verbose
```

## Database Schema

The application expects these main tables:

- **users** (managed by Supabase Auth)
- **plants** - User's plant collection
- **watering_history** - Records of when plants were watered
- **rooms** - Plant groupings/locations
- **notifications** - Watering reminders

See [../reference/DATABASE_SCHEMA.md](../reference/DATABASE_SCHEMA.md) for detailed schema.

## Next Steps

1. **Understand the architecture**: Read [../ARCHITECTURE.md](../ARCHITECTURE.md)
2. **Set up your IDE**: Configure ESLint and Prettier
3. **Review code standards**: Read [STYLE_GUIDE.md](./STYLE_GUIDE.md)
4. **Write your first test**: See [TESTING.md](./TESTING.md)
5. **Create a feature**: Follow [../CONTRIBUTING.md](../CONTRIBUTING.md)

## Getting Help

- **Setup issues**: Check this guide first
- **Architecture questions**: See [../ARCHITECTURE.md](../ARCHITECTURE.md)
- **Testing questions**: See [TESTING.md](./TESTING.md)
- **Styling questions**: See [STYLE_GUIDE.md](./STYLE_GUIDE.md)
- **Repository issues**: Open a GitHub issue

## Additional Resources

- [React Router Documentation](https://reactrouter.com/)
- [Supabase Documentation](https://supabase.com/docs)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vitest Documentation](https://vitest.dev/)
