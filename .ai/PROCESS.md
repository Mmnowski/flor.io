# Implementation Process Rules

## Before Every Action
1. Check `.ai/IMPLEMENTATION_TODO.md` for current status
2. Identify which task you're working on
3. Mark that task as `in progress` in the todo list

## During Implementation
- Work on ONE task at a time
- Commit often with meaningful messages
- Test as you go (manual testing for UI, type checking for code)
- Use `yarn typecheck` after changes

## After Completing a Task
1. Test the feature/code thoroughly
2. Mark task as ✅ COMPLETE in IMPLEMENTATION_TODO.md
3. Update any dependent tasks
4. Commit with: `git commit -m "feat: [phase].[task] - description"`
5. Move to next task in the list

## Running Commands
- **Type check**: `yarn typecheck`
- **Dev server**: `yarn dev` (http://localhost:5173)
- **Build**: `yarn build`
- **Tests** (when Vitest is set up): `yarn test`

## Key Files to Reference
- `CLAUDE.md` - Project architecture and commands
- `.ai/IMPLEMENTATION_TODO.md` - Detailed task breakdown
- `app/routes.ts` - Route definitions (update here)
- `package.json` - Dependencies

## Database Setup Notes
- Supabase project must be created before Phase 2
- SQL schema file provided in plan - execute in Supabase SQL editor
- Storage bucket must be created for plant photos
- RLS policies required for multi-tenant isolation

## Git Strategy
- Commit after each completed task
- Use conventional commits: feat, fix, refactor, docs, etc.
- Reference phase: `feat(phase-1): setup environment and auth`

