# Flor.io

A full-stack plant care management application built with React Router v7, TypeScript, Supabase, and TailwindCSS.

## Tech Stack

- **Framework**: React Router v7 (full-stack)
- **Language**: TypeScript (strict mode)
- **Styling**: TailwindCSS v4 + shadcn/ui
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Build**: Vite + React Router SSR
- **Testing**: Vitest + React Testing Library
- **Code Quality**: ESLint + Prettier

## Features

- Server-side rendering (SSR) for improved performance
- Type-safe database operations with generated types
- Plant identification using mock PlantNet API
- AI-powered care instructions (mocked)
- Watering reminders and tracking
- Room-based plant organization
- User authentication with Supabase
- Responsive dark/light mode
- Image optimization and storage

## Quick Start

### Prerequisites

- Node.js 18+
- Yarn package manager
- Supabase account (for backend)

### Installation

```bash
yarn install
```

### Environment Setup

Create a `.env.local` file with:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Development

Start the development server:

```bash
yarn dev
```

The application will be available at `http://localhost:5173`.

### Code Quality

```bash
yarn lint              # Check for linting issues
yarn lint:fix          # Auto-fix linting issues
yarn format            # Format code with Prettier
yarn typecheck         # Type check with TypeScript
yarn test              # Run tests
yarn test:watch        # Run tests in watch mode
yarn test:ui           # Visual test interface
yarn quality           # Run all checks (lint, format, typecheck, test)
```

## Building for Production

```bash
yarn build
```

This creates optimized builds in `build/client/` and `build/server/`.

## Documentation

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Technical architecture and design patterns
- **[MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)** - Import path changes and migration steps
- **[STYLE_GUIDE.md](./STYLE_GUIDE.md)** - Code style, formatting, and naming conventions
- **[.ai/TESTING.md](./.ai/TESTING.md)** - Testing patterns and guidelines
- **[.ai/DEPLOYMENT.md](./.ai/DEPLOYMENT.md)** - Production deployment setup
- **[.ai/IMPLEMENTATION_PLAN.md](./.ai/IMPLEMENTATION_PLAN.md)** - Full refactoring roadmap

## Project Structure

```
app/
├── features/              # Feature modules (plants, watering, rooms, ai-wizard)
├── shared/               # Shared components, hooks, contexts, utilities
├── lib/                  # Server-side utilities and data layer
├── layout/               # Layout components
├── routes/               # Route handlers and pages
├── types/                # TypeScript type definitions
└── root.tsx              # Root layout
```

For detailed structure, see [ARCHITECTURE.md](./ARCHITECTURE.md)

## Development Workflow

1. Create a feature branch from `main`
2. Implement changes following patterns in ARCHITECTURE.md
3. Run `yarn quality` to ensure code passes all checks
4. Submit a PR with a detailed description
5. Merge to main after review

## Contributing

When adding new code:

- Follow patterns documented in ARCHITECTURE.md
- Collocate tests with source code
- Use custom hooks from `~/shared/hooks` for common patterns
- Use structured logging with `logger` instead of console
- Add JSDoc comments to public APIs
- Run `yarn quality` before committing

## Deployment

For production deployment setup, see [.ai/DEPLOYMENT.md](./.ai/DEPLOYMENT.md).

Supported deployment platforms:

- AWS ECS
- Google Cloud Run
- Azure Container Apps
- Digital Ocean App Platform
- Fly.io
- Railway
- Docker-compatible platforms

## Testing

Current test coverage: 368/439 passing (84%)

See [.ai/TESTING.md](./.ai/TESTING.md) for comprehensive testing guide.

## Performance

- Main bundle: <200KB (gzipped)
- Lighthouse targets: >80 on all metrics
- LCP target: <2.5s

## Resources

- [React Router Documentation](https://reactrouter.com/)
- [Supabase Documentation](https://supabase.io/docs)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
