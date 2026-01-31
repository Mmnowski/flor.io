# Archive Index

This directory contains historical implementation notes, plans, and documentation from previous project phases. These files are kept for reference but are not part of the active development documentation.

For current documentation, see the main [docs/](../../docs/) directory.

## Directory Structure

### phase-summaries/

Summaries of completed project phases:

- `PHASE_1_SUMMARY.md` - Foundation & Infrastructure (completed Jan 25, 2025)
- `PHASE_2_SUMMARY.md` - Core Plant Management (completed)
- `PHASE_3_SUMMARY.md` - Watering System (completed)

**Use:** Historical reference, understanding what was built in each phase

---

### planning-docs/

Project planning documents and phase plans:

- `IMPLEMENTATION_PLAN.md` - Initial high-level implementation plan
- `PHASE_2_PLAN.md` - Plant management feature planning
- `PHASE_3_PLAN.md` - Watering system planning
- `PHASE_3_COMPLETION.md` - Phase 3 completion summary
- `PHASE_4_PLAN.md` - AI integration planning
- `PHASE_5_PLAN.md` - Organization & polish planning
- `PHASE_5_PROGRESS.md` - Phase 5 progress notes
- `PHASE_6_PLAN.md` - Testing & optimization planning (most detailed)
- `ROOM_MANAGEMENT_PLAN.md` - Room management improvements (2026-01-31)

**Use:** Understanding how features were planned and what decisions were made

**Most useful:** PHASE_6_PLAN.md for detailed test failure analysis and implementation approach

---

### session-notes/

Session summaries and work logs:

- `PHASE_5_SESSION_1_SUMMARY.md` - First phase 5 work session
- `PHASE_5_SESSION_2_SUMMARY.md` - Second phase 5 work session

**Use:** Understanding what work was done in each session and outcomes

---

### completion-records/

Completion records and summaries of finished work:

- `NEXT_STEPS.md` - Next steps from earlier phases
- `PHASE_5_ACCESSIBILITY_COMPLETE.md` - Accessibility work completion
- `PHASE_5_ERROR_HANDLING_SUMMARY.md` - Error handling implementation summary
- `DARK_THEME_SUMMARY.md` - Dark theme implementation summary
- `INTEGRATION_TESTS_CREATED.md` - Integration tests created summary

**Use:** Understanding what was completed and current state

---

### task-notes/

Detailed task implementation notes:

- `ACCESSIBILITY_IMPLEMENTATION_ROADMAP.md` - Accessibility implementation approach
- `ACCESSIBILITY_TASK_5.2.1_CONTRAST_AUDIT.md` - Contrast audit details
- `ACCESSIBILITY_TASK_5.2.2_TOUCH_TARGETS.md` - Touch target audit
- `ACCESSIBILITY_TASK_5.2.3_KEYBOARD_NAVIGATION.md` - Keyboard navigation audit
- `ACCESSIBILITY_TASK_5.2.4_SCREEN_READERS.md` - Screen reader audit
- `ACCESSIBILITY_TASK_5.2.5_LANGUAGE_LABELS.md` - Language label audit
- `TESTING_IMPLEMENTATION_PLAN.md` - Testing setup and configuration
- `TESTING_RULES.md` - Testing conventions and best practices
- `INTEGRATION_TESTS_PLAN.md` - Integration testing approach
- `DEPLOYMENT_IMPLEMENTATION_PLAN.md` - Deployment setup details

**Use:** Reference for how specific features were implemented

---

### guides/

Implementation guides for completed features:

- `ACCESSIBILITY_GUIDE.md` - WCAG compliance guide for accessibility
- `DARK_THEME_GUIDE.md` - Dark mode implementation guide
- `ERROR_HANDLING_IMPLEMENTATION.md` - Error handling patterns

**Use:** Understanding implementation details of complex features

---

### documentation/

Supporting documentation that was archived:

- `DEPLOYMENT.md` - Deployment guide (also in docs/guides/)
- `PROCESS.md` - Implementation process rules
- `VALIDATION_QUICK_REFERENCE.md` - Form validation reference

**Use:** Reference for processes and standards

---

### IMPLEMENTATION_TODO.md

Original implementation todo list from early in the project.

**Use:** Understanding initial scope and priorities

---

## Using the Archive

### When to Use Archive Files

✅ **Good reasons to consult archive:**

- Understanding how a feature was originally designed
- Finding rationale for architectural decisions
- Reviewing what accessibility audits were completed
- Understanding testing setup and approach
- Reference for similar problems solved before

❌ **Not appropriate for:**

- Current implementation details (use docs/ instead)
- API endpoint information (use docs/reference/API.md)
- Code style rules (use docs/guides/STYLE_GUIDE.md)
- Component guides (use docs/features/)

### Navigation

**Current documentation:**

- Project architecture: [../../docs/ARCHITECTURE.md](../../docs/ARCHITECTURE.md)
- Feature guides: [../../docs/features/](../../docs/features/)
- API reference: [../../docs/reference/API.md](../../docs/reference/API.md)
- Setup guide: [../../docs/guides/SETUP.md](../../docs/guides/SETUP.md)

**Contributing:**

- [../../docs/CONTRIBUTING.md](../../docs/CONTRIBUTING.md) - How to contribute
- Style guide: [../../docs/guides/STYLE_GUIDE.md](../../docs/guides/STYLE_GUIDE.md)
- Testing guide: [../../docs/guides/TESTING.md](../../docs/guides/TESTING.md)

---

## Archive Maintenance

### Adding to Archive

When a plan or phase is complete:

1. Move files to appropriate subdirectory
2. Update this INDEX.md with description
3. Keep files for historical reference only

### Removing from Archive

Files should be archived indefinitely. If cleanup is needed:

- Document in git commit why file is being removed
- Keep most recent phase plan for reference
- Delete oldest duplicate files

---

## Statistics

- **Total archived files**: 32
- **Phase plans**: 8
- **Task notes**: 13
- **Session summaries**: 2
- **Phase summaries**: 3
- **Completion records**: 5
- **Supporting docs**: 1

**Total size**: ~205KB

---

## Last Updated

- Index created: 2026-01-30
- Archive reorganized: 2026-01-30
- Room management plan added: 2026-01-31
