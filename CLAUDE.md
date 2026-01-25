# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Quick Commands

### Development
- **Start dev server**: `yarn dev` (runs on http://localhost:5173)
- **Type checking**: `yarn typecheck` (runs `react-router typegen && tsc`)
- **Build for production**: `yarn build`
- **Start production server**: `yarn start` (serves the built app)

### Code Quality
- No lint or test commands configured. TypeScript strict mode is enforced (tsconfig.json).

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
  root.tsx          # Root layout, error boundary, links
  routes.ts         # Route definitions
  routes/           # Route components
    home.tsx        # Index route
  welcome/          # Welcome component assets
  app.css           # Global styles
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

## Notes

- No linter or test framework currently configured
- Project uses ES2022 as compilation target
- JSON module resolution is enabled (can import JSON files as modules)