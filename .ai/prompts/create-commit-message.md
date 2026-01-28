# Commit Message Generation

## Objective

Generate a clear, concise commit message that accurately describes the changed files in the working directory. The message should help future readers understand _why_ changes were made, not just _what_ changed.

## Process

1. **Examine changed files** using `git diff` or `git status`
2. **Identify the primary purpose** - what is the main goal of these changes?
3. **Categorize the change type** - choose the most specific type
4. **Summarize with bullet points** - list 2-4 key changes (only if multi-file or complex)

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
- **Bullet points**: Use only if changes span multiple files or require explanation. Otherwise, omit section entirely.

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

**Single-file fix:**

```
fix(API): resolve null pointer in plant query response
```

**Multi-file refactor:**

```
refactor(PHASE-6): eliminate 'as any' type casts from production code

- Replace unsafe type casts with type-safe helper functions
- Create TypedError class for proper error typing
- Update 9 files to use proper type inference
```

**Feature with multiple changes:**

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
6. **Skip bullet points** - If the change is simple enough to describe in one line, omit the bullet section

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
