# Commit Message Generation

## Objective

Generate a clear, concise commit message that accurately describes the changed files in the working directory. The message should help future readers understand _why_ changes were made, not just _what_ changed.

## Process

1. **Examine changed files** using `git diff` or `git status`
2. **Identify the primary purpose** - what is the main goal of these changes?
3. **Categorize the change type** - choose the most specific type
4. **Determine if bullet points needed** - Use only if there are 2+ distinct logical changes. If the entire commit is one cohesive change, just use the header line.

## Format

```
[TYPE]([CONTEXT]): [description]

- [Optional: bullet point 1]
- [Optional: bullet point 2]
```

### Format Rules

- **[TYPE]**: One of: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`
- **[CONTEXT]**: Phase/issue identifier or feature area (e.g., `PHASE-6`, `AUTH-LOGIN`)
- **[description]**: ~72 characters max (guideline, not hard limit). Imperative mood ("add", "fix", "remove"). Lowercase. Focus on **what changed in the code**, not the result or impact.
- **Bullet points**: Use only if there are **2+ logical changes**. A single cohesive change (even affecting many files) doesn't need bullets. Rule of thumb: Can a developer understand the changes in under 1 minute by reading the code?

## Type Definitions

| Type       | Use When                                                     |
| ---------- | ------------------------------------------------------------ |
| `feat`     | Adding new functionality or features                         |
| `fix`      | Fixing bugs or broken functionality                          |
| `refactor` | Restructuring code without changing behavior                 |
| `docs`     | Documentation, comments, or README changes only              |
| `test`     | Adding/modifying tests                                       |
| `chore`    | Configuration, dependencies, tooling (no code logic changes) |

## Examples

**Single logical change (no bullets needed):**

```
feat(Navigation): improve navbar branding and alignment
```

Even though this affected 1 file with 3 improvements (title text, split color, alignment fix), it's one cohesive navigation update. Developer can understand it instantly by reading the code.

**Multi-file, single logical change (no bullets needed):**

```
chore: format code with linter
```

100 files changed, but one logical change. A developer knows exactly what happened.

**Multiple distinct logical changes (bullets needed):**

```
refactor(PHASE-6): eliminate 'as any' type casts from production code

- Replace unsafe type casts with type-safe helper functions
- Create TypedError class for proper error typing
- Update UI components and helper modules for type safety
```

**Feature with multiple distinct changes (bullets needed):**

```
feat(AUTH): implement password reset flow

- Add password reset endpoint
- Create reset email template
- Add tests for reset flow
```

## Critical Rules

1. **Never mention AI authorship** - Omit any reference to Claude, AI, or automation
2. **Imperative mood only** - Write as commands ("add", "fix"), not descriptions ("added", "fixed")
3. **Describe code changes, not impact** - Focus on _what changed_ in the codebase, not the result or benefit
   - ❌ "Increased code coverage" / "Improved safety"
   - ✅ "Added tests for error handling" / "Replaced type casts with helpers"
4. **One primary change per commit** - If describing multiple unrelated changes, reconsider the commit structure
5. **Test changes**: Only list which tests were added/modified, not implementation details or coverage percentages
6. **Bullet points decision** - Use bullets if and only if there are 2+ **distinct logical changes**. Don't create bullets just because multiple files changed.

## Decision Tree

```
Is this a code logic change?
├─ YES: Is it new functionality?
│  ├─ YES → TYPE = feat
│  └─ NO → Is it restructuring?
│     ├─ YES → TYPE = refactor
│     └─ NO → TYPE = fix
└─ NO: Is it documentation-only?
   ├─ YES → TYPE = docs
   └─ NO: Is it tests?
      ├─ YES → TYPE = test
      └─ NO → TYPE = chore
```

## Quality Checklist

- [ ] Describes _what changed in the code_, not the impact or outcome
- [ ] Follows imperative mood ("add", "fix", "refactor", not "added", "fixed", "refactored")
- [ ] No "and" or "or" in description (focus on primary change)
- [ ] Bullet points add clarity, not redundancy
- [ ] No AI/automation references
- [ ] CONTEXT tag matches project convention
- [ ] Description is ~72 characters or fewer
- [ ] Avoids abstract language ("improved", "increased", "enhanced") in favor of concrete changes
