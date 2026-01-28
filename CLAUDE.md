# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Quick Commands

### Development

- **Start dev server**: `yarn dev` (runs on http://localhost:5173)
- **Type checking**: `yarn typecheck` (runs `react-router typegen && tsc`)
- **Build for production**: `yarn build`
- **Start production server**: `yarn start` (serves the built app)

### Testing

- **Run tests**: `yarn test` (runs all tests once)
- **Watch mode**: `yarn test:watch` (rerun on file changes)
- **UI dashboard**: `yarn test:ui` (visual test interface)
- **Coverage report**: `yarn test:coverage` (generates HTML report in `coverage/`)

**Test Status**: 368/439 tests passing (84%)

- See `.ai/TESTING.md` for comprehensive testing guide
- Test files in `app/**/__tests__/` directories

### Performance

- **Lighthouse**: Target scores >80 on all metrics
- **Bundle analysis**: `yarn build` creates `dist/stats.html`
- **Performance targets**: <200KB main bundle (gzipped), <2.5s LCP
- See `.ai/DEPLOYMENT.md` for performance optimization details

### Code Quality

- **Type checking**: `yarn typecheck` (react-router typegen && tsc)
- TypeScript strict mode is enforced (tsconfig.json)
- No linter currently configured (ESLint/Prettier can be added)

### Commit Messages

Follow the commit message template defined in `.ai/prompts/create-commit-message.md`. Key principles:

- **Format**: `[TYPE]([CONTEXT]): [description]`
- **Types**: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`
- **Description focus**: Describe _what changed in the code_, not the impact or outcome
  - ✅ "Replace type casts with helpers" (what changed)
  - ❌ "Improved type safety" (outcome)
- **Character limit**: ~72 characters (guideline, not hard limit)
- **Bullet points**: Use only for multi-file or complex changes (2-4 points)
- **Process**: Reference `.ai/prompts/create-commit-message.md` for decision tree and examples

### Component Generation

Follow the standards in `.ai/prompts/component-generation-prompt.md` when creating React components. Key requirements:

- **TypeScript**: Props interface with JSDoc, explicit return types, no `any` types
- **Styling**: Tailwind CSS only, mobile-first responsive design
- **Accessibility**: WCAG 2.1 AA compliant (4.5:1 contrast, 44px touch targets, focus states)
- **Design system**: Use color palette, spacing grid (8px), rounded corners (16px minimum)
- **Quality**: Use validation checklist before considering component complete
- **Process**: Follow the 6-step workflow in the prompt for consistency

## Project Architecture

### Framework: React Router v7 (Full-Stack Framework)

This is a **full-stack React application** using React Router v7 with server-side rendering (SSR) enabled. Key architectural points:

#### Core Configuration

- **SSR**: Enabled by default (set in `react-router.config.ts`)
- **Build output**: `build/client/` (static assets) and `build/server/` (server code)
- **Package manager**: Yarn (switched from npm in recent commit)
- **Entry point**: `app/root.tsx` (root layout and error boundary)

#### Routing

- Routes are defined in `app/routes.ts` using React Router's route config API
- Currently has a single index route (`routes/home.tsx`)
- Route files can use the Route type from `./+types/<routename>` for type-safe loaders/actions

#### Type Paths

- `~/*` alias points to `./app/*` (defined in tsconfig.json)
- Generated types in `.react-router/types/` directory (auto-generated, don't edit)

#### Styling

- **TailwindCSS v4** via Vite plugin (`@tailwindcss/vite`)
- Global styles in `app/app.css`
- Fonts loaded from Google Fonts in root layout

#### Build System

- **Vite** with react-router and tailwindcss plugins
- `vite-tsconfig-paths` for path alias support
- TypeScript strict mode enabled

### File Structure

```
app/
  root.tsx                    # Root layout, error boundary, links
  routes.ts                   # Route definitions
  routes/                     # Route components
    home.tsx                  # Index route
    __tests__/                # Route integration tests
  components/                 # React components
    __tests__/                # Component unit tests
  lib/                        # Server utilities and libraries
    __tests__/                # Server function tests
  __tests__/
    setup.ts                  # Global test setup
    factories.ts              # Test data factory functions
  welcome/                    # Welcome component assets
  app.css                     # Global styles

.ai/
  IMPLEMENTATION_PLAN.md      # Full implementation roadmap
  PHASE_6_PLAN.md             # Phase 6 detailed plan
  TESTING.md                  # Testing guide and patterns
  DEPLOYMENT.md               # Deployment and production setup
```

## Key Patterns & Conventions

### Route Components

- Use `Route.LinksFunction`, `Route.LoaderFunction`, `Route.ActionFunction` types for loaders/actions
- Error boundaries via `export function ErrorBoundary()`
- Client/server code separation using `.client` and `.server` file extensions if needed

### Type Safety

- All routes have generated type files in `.react-router/types/`
- Run `yarn typecheck` to regenerate types and check TS errors
- Use strict TypeScript (strict mode is on)

### Error Handling

- Root error boundary catches unhandled errors and renders user-friendly messages
- Stack traces shown only in development mode

## Testing & Quality

- **Test Framework**: Vitest with @testing-library/react
- **Coverage Target**: >80% overall, >85% for core utilities
- **Current Status**: 368/439 tests passing (84%)
- **Test Commands**: See "Testing" section under Quick Commands

## Notes

- Project uses ES2022 as compilation target
- JSON module resolution is enabled (can import JSON files as modules)
- Row Level Security (RLS) enforced in Supabase for data privacy
- Server-side image processing with Sharp library
- Session management via React Router cookie-based sessions
