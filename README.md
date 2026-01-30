# Flor.io

A full-stack plant care management application built with React Router v7, TypeScript, Supabase, and TailwindCSS.

## Tech Stack

- **Framework**: React Router v7 (full-stack with SSR)
- **Language**: TypeScript (strict mode)
- **Styling**: TailwindCSS + shadcn/ui
- **Backend**: Supabase (PostgreSQL with RLS, Auth, Storage)
- **Build**: Vite with React Router SSR
- **Testing**: Vitest + React Testing Library
- **Code Quality**: ESLint + Prettier
- **Validation**: Zod

## Features

- Server-side rendering (SSR) for improved performance
- Type-safe database operations with generated types
- Plant identification using PlantNet API (mocked by default, real API available)
- AI-powered care instructions via OpenAI GPT-4o-mini (mocked by default, real API available)
- Watering reminders and tracking
- Room-based plant organization
- User authentication with Supabase
- Responsive dark/light mode
- Image optimization and storage

## Quick Start

### Prerequisites

- Node.js 18+ (ES2022 target)
- Yarn (package manager, switched from npm)
- Supabase account (for backend database and authentication)

### Installation

```bash
yarn install
```

### Environment Setup

Copy `.env.example` to `.env.local` and configure required variables for Supabase, session management, and API keys. See `.env.example` for details.

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
yarn format            # Format code
yarn typecheck         # Type check and generate types
yarn test              # Run all tests
yarn test:watch        # Run tests in watch mode
yarn quality           # Run all checks: format → lint → typecheck → test
```

## Building for Production

```bash
yarn build     # Create optimized builds
yarn start     # Serve the production build locally
```

## Documentation

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Architecture and design patterns
- **[STYLE_GUIDE.md](./STYLE_GUIDE.md)** - Code style and conventions

## Project Structure

```
app/
├── features/         # Feature modules (plants, watering, rooms, ai-wizard)
├── shared/          # Shared components, hooks, contexts, utilities
├── lib/             # Server-side utilities and data layer
├── layout/          # Layout components
├── routes/          # Route handlers and pages
├── types/           # TypeScript type definitions
└── root.tsx         # Root layout with error boundary
```

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed structure.

## Development Workflow

1. Create a feature branch from `main`
2. Implement changes following patterns in ARCHITECTURE.md
3. Run `yarn quality` before committing
4. Commit with format: `[TYPE](context): description`
5. Git hooks run pre-commit checks automatically
6. Submit a PR and merge after review

## Project Status

**Current Phase**: Phase 7 - Deployment

**Key Features:**

- Plant CRUD operations with advanced filtering
- Watering reminders and tracking
- Room-based organization
- User authentication and session management
- Dark/light mode
- Image upload and optimization
- AI-assisted plant identification and care instructions
- Server-side rendering (SSR)
- Row Level Security (RLS) in Supabase

## Contributing

- Follow patterns in ARCHITECTURE.md
- Collocate tests with source code
- Run `yarn quality` before committing

## Testing

Current status: **544/544 tests passing (100%)**

```bash
yarn test          # Run all tests
yarn test:watch    # Run tests in watch mode
```
