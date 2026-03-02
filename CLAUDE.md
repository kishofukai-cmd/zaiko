# CLAUDE.md

This file provides guidance to AI assistants (Claude, Copilot, etc.) working in this repository.

## Project Overview

**zaiko** (在庫) — An inventory management system. The name is Japanese for "inventory/stock".

> This repository is in early setup. Update this file as the project evolves.

## Repository Status

This repository is currently empty (no source code committed yet). This CLAUDE.md establishes conventions and workflows to be followed as development begins.

## Development Workflow

### Branch Strategy

- `main` — stable, production-ready code
- `develop` — integration branch for features
- `claude/<description>` — branches used by AI assistants
- `feature/<description>` — human-developed feature branches
- `fix/<description>` — bug fix branches

### Commit Conventions

Use conventional commits format:

```
<type>(<scope>): <short summary>

[optional body]
```

Types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `ci`

Examples:
- `feat(inventory): add stock level tracking`
- `fix(api): correct item quantity calculation`
- `docs: update CLAUDE.md with project structure`

### Pull Requests

- Keep PRs focused and small when possible
- Include a summary of changes and how to test
- Link to relevant issues

## Git Operations

### Pushing Changes

Always push to the correct branch:

```bash
git push -u origin <branch-name>
```

Branch names for AI sessions start with `claude/` — never push to `main` directly.

### Retry Policy

For network failures during push/fetch, retry with exponential backoff:
- Retry 1: wait 2s
- Retry 2: wait 4s
- Retry 3: wait 8s
- Retry 4: wait 16s

## Code Conventions

> Update this section once the tech stack is chosen.

### General

- Prefer clarity over cleverness
- Write self-documenting code; only add comments for non-obvious logic
- Keep functions small and single-purpose
- Validate input at system boundaries (user input, external APIs); trust internal code

### File Organization

> To be defined once project structure is established.

## Testing

> To be defined once testing framework is chosen.

- Run all tests before committing
- New features should include tests
- Bug fixes should include a regression test

## Environment Setup

> To be defined. Expected: document required environment variables, dependencies, and setup steps here.

## Key Decisions Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-03-02 | Repository created | Initial setup of zaiko inventory system |

## For AI Assistants

- This is an early-stage project; conventions above are the starting baseline
- Update this file whenever new conventions, tech choices, or workflows are established
- Do not push to `main` without explicit permission
- Prefer small, incremental commits over large changesets
- When uncertain about requirements, ask before implementing
