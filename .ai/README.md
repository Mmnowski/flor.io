# .ai Directory

This directory contains Claude AI agent guidance, rules, and archived implementation notes.

## Directory Structure

```
.ai/
├── prompts/                 # Agent guidance and rules
│   ├── commit-message-rule.md        # Git commit message format rules
│   └── component-generation-rule.md  # React component generation rules
├── documentation/
│   └── prd.md                        # Product Requirements Document (kept for MCP)
├── archive/                 # Historical implementation notes and plans
│   ├── INDEX.md            # Archive index and navigation
│   ├── phase-summaries/    # Completed phase summaries
│   ├── planning-docs/      # Phase plans and implementation plans
│   ├── session-notes/      # Work session summaries
│   ├── completion-records/ # Feature completion records
│   ├── task-notes/         # Detailed task implementation notes
│   ├── guides/             # Implementation guides (archived)
│   └── documentation/      # Supporting documentation (archived)
└── README.md               # This file
```

## Files & Purpose

### prompts/

Rules and guidance for Claude AI agents. These files define standards and patterns.

**commit-message-rule.md**

- Git commit message format and conventions
- Type definitions (feat, fix, refactor, docs, test, chore)
- Examples and decision tree
- Reference: See [../CLAUDE.md](../CLAUDE.md) for project-specific rules

**component-generation-rule.md**

- React component generation standards
- TypeScript best practices
- Accessibility requirements
- Quality checklist
- 6-step component creation workflow

### documentation/

MCP-related and persistent documentation.

**prd.md**

- Product Requirements Document
- Kept in .ai/ for MCP server validation
- Describes project goals, features, success metrics
- Do not move or delete

### archive/

Historical implementation notes from project development phases.

**Archive Index**: See [archive/INDEX.md](archive/INDEX.md) for detailed breakdown and navigation

**Common reasons to use archive:**

- Understanding feature design rationale
- Accessibility audit results
- Testing implementation approach
- Error handling implementation patterns
- Dark theme implementation guide

---

## Quick Navigation

### Current Documentation

For active development reference:

- **Project Architecture**: [../docs/ARCHITECTURE.md](../docs/ARCHITECTURE.md)
- **Contributing Guide**: [../docs/CONTRIBUTING.md](../docs/CONTRIBUTING.md)
- **Style Guide**: [../docs/guides/STYLE_GUIDE.md](../docs/guides/STYLE_GUIDE.md)
- **Setup Guide**: [../docs/guides/SETUP.md](../docs/guides/SETUP.md)
- **Testing Guide**: [../docs/guides/TESTING.md](../docs/guides/TESTING.md)
- **Feature Documentation**: [../docs/features/](../docs/features/)
- **API Reference**: [../docs/reference/API.md](../docs/reference/API.md)
- **Database Schema**: [../docs/reference/DATABASE_SCHEMA.md](../docs/reference/DATABASE_SCHEMA.md)

### Agent Rules

When working with Claude AI agents:

- **Commit Messages**: See [prompts/commit-message-rule.md](prompts/commit-message-rule.md)
- **Component Generation**: See [prompts/component-generation-rule.md](prompts/component-generation-rule.md)

### Historical Reference

To understand how features were built:

- **View Archive Index**: See [archive/INDEX.md](archive/INDEX.md)
- **Phase Plans**: [archive/planning-docs/](archive/planning-docs/)
- **Task Details**: [archive/task-notes/](archive/task-notes/)
- **Feature Guides**: [archive/guides/](archive/guides/)

---

## Using This Directory

### What Goes Here

✅ **Add to .ai/:**

- Agent rules and guidance (in prompts/)
- MCP-required files (in documentation/)
- Completed work notes (archived after project phase)

❌ **Don't add here:**

- User documentation (goes in docs/)
- Code files (goes in app/)
- Feature architecture (goes in docs/features/)
- API endpoints (goes in docs/reference/API.md)

### .ai/prompts/ - Contributing Rules

To add new agent rules:

1. Create descriptive filename (e.g., `testing-rule.md`)
2. Document the rule with examples
3. Include decision tree if complex
4. Reference in README.md
5. Consider adding to [../CLAUDE.md](../CLAUDE.md) if critical

### Archiving Implementation Notes

When a phase completes:

1. Move completion summary to [archive/completion-records/](archive/completion-records/)
2. Move phase plan to [archive/planning-docs/](archive/planning-docs/)
3. Move task details to [archive/task-notes/](archive/task-notes/)
4. Update [archive/INDEX.md](archive/INDEX.md)
5. Commit with message: `chore: archive phase X implementation notes`

---

## Important Files

### PRD.md (Do Not Move)

Located at `.ai/documentation/prd.md`

**Important:** This file must remain in this exact location. An MCP server validates its presence and content.

**Never:**

- ❌ Move to docs/ directory
- ❌ Delete or rename
- ❌ Modify without careful consideration

**Safe to:**

- ✅ Update content if product requirements change
- ✅ Reference when making architectural decisions

---

## Directory Size

Current disk usage:

```
.ai/
├── prompts/            ~20KB
├── documentation/      ~8KB  (prd.md)
├── archive/           ~200KB
└── README.md          ~3KB

Total: ~230KB (negligible)
```

Archive can grow as project phases complete. Consider periodic cleanup of very old files (>1 year).

---

## Contributing

### Adding to prompts/

1. Document new standard clearly with examples
2. Consider impact on current codebase
3. Test rule with actual implementations
4. Document exceptions
5. Reference in related docs

Example template:

```markdown
# [Rule Name]

## Objective

[What this rule helps achieve]

## When to Apply

[Situations where this rule applies]

## Format/Pattern

[Specific format or pattern to follow]

## Examples

[Correct and incorrect examples]

## Related Rules

[Links to related rules]
```

### Updating README.md

When changing .ai/ structure:

1. Update directory structure section
2. Add/remove entries from "Files & Purpose"
3. Update quick navigation if needed
4. Keep archive/ description current
5. Commit: `docs: update .ai directory documentation`

---

## Questions?

- **How to contribute**: See [../docs/CONTRIBUTING.md](../docs/CONTRIBUTING.md)
- **Project structure**: See [../docs/ARCHITECTURE.md](../docs/ARCHITECTURE.md)
- **Code standards**: See [../docs/guides/STYLE_GUIDE.md](../docs/guides/STYLE_GUIDE.md)
- **Archive contents**: See [archive/INDEX.md](archive/INDEX.md)

---

## Project Context

Flor.io is a plant care management web application:

- **Tech Stack**: React Router v7, Supabase, TailwindCSS v4
- **Status**: In active development (Phase 6+)
- **Documentation**: Primary documentation in [../docs/](../docs/)

This directory supports:

- Claude AI agent work with rulesets
- Historical record of development process
- Reference for future implementation decisions
