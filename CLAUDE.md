# CLAUDE.md

This file provides guidance to AI assistants (Claude, Copilot, etc.) working in this repository.

## Project Overview

**zaiko** (在庫) — An internal inventory variance analysis tool for finance teams.

Identifies root causes of differences between:
- Accounting inventory (MF会計など)
- Physical inventory (棚卸)
- Logistics transactions (IN / OUT)

Analysis priority:
1. Quantity reconciliation (Phase 1)
2. Monetary variance analysis (Phase 2)
3. Root cause classification

**Design philosophy: Excel-first.** Input and output are Excel workbooks. No UI, no auth, internal finance use only.

---

## Input Sheets (Excel)

| Sheet | Key Columns |
|-------|-------------|
| `SKU_MASTER` | SKU, JAN, Product Name, Standard Cost (opt.) |
| `IN_TX` | Date, Partner, SKU, Quantity, DocNo |
| `OUT_TX` | Date, Partner, SKU, Quantity, DocNo |
| `STOCKTAKE` | Month, Partner, SKU, Physical Quantity |
| `ACCOUNTING_SUMMARY` | Month, Opening, Purchases, COGS, Adjustments, Ending *(Phase 2)* |

## Core Logic — Quantity Bridge (Phase 1)

```
Theoretical Qty = Previous Month Physical + Σ Inbound − Σ Outbound
Variance        = Theoretical Qty − Current Physical Qty
```

Output sheet `BRIDGE_QUANTITY`: SKU | Opening Qty | Inbound | Outbound | Theoretical | Physical | Variance
Sorted by absolute variance descending.

## Root Cause Heuristics (Phase 2)

1. **Timing Issue** — small diff, transaction near month end
2. **Missing Return** — unmatched inbound/outbound return
3. **Write-off / Disposal** — physical < theoretical, no accounting adjustment
4. **Cost Mismatch** — qty matches but accounting value differs
5. **Partner Code Inconsistency** — similar partner names across sheets

## Monetary Reconciliation (Phase 2)

```
Variance Amount = Quantity Variance × Standard Cost
Accounting Ending = Opening + Purchases − COGS ± Adjustments
Compare: Accounting Ending vs. Physical Ending × Standard Cost
```

## Repository Status

Phase 1 (quantity reconciliation) is **complete** — all core source files are implemented.
Phase 2 (monetary reconciliation, root cause classification) is planned but not yet started.

## Development Workflow

### Branch Strategy

- `master` — stable, production-ready code (default branch)
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

Branch names for AI sessions start with `claude/` — never push to `master` directly.

### Retry Policy

For network failures during push/fetch, retry with exponential backoff:
- Retry 1: wait 2s
- Retry 2: wait 4s
- Retry 3: wait 8s
- Retry 4: wait 16s

## Tech Stack

- **Language:** TypeScript (strict mode)
- **Runtime:** Node.js
- **Package manager:** npm

## Development

```bash
npm install       # Install dependencies
npm run dev       # Run CLI via ts-node (no compilation needed)
npm run build     # Compile TypeScript to dist/
npm test          # Run tests (no framework configured yet)
```

### CLI Usage

```bash
# Basic usage (output file auto-named bridge_{partner}_{YYYY-MM}.xlsx)
npx ts-node src/index.ts <input.xlsx> <partner> <YYYY-MM>

# With explicit output path
npx ts-node src/index.ts <input.xlsx> <partner> <YYYY-MM> <output.xlsx>

# Example
npx ts-node src/index.ts data.xlsx WH-TOKYO 2026-02
# → writes bridge_WH-TOKYO_2026-02.xlsx
```

## Code Conventions

### General

- Prefer clarity over cleverness
- Write self-documenting code; only add comments for non-obvious logic
- Keep functions small and single-purpose
- Validate input at system boundaries (user input, external APIs); trust internal code

### TypeScript

- Strict mode enabled — no `any`; use proper types or `unknown`
- Use `const` by default; `let` only when reassignment is needed
- Prefer `async/await` over raw Promise chains
- Type errors as custom error classes or discriminated unions

### File Organization

```
src/
├── index.ts    # CLI entry point — argument parsing and orchestration
├── types.ts    # All shared TypeScript types (SkuMaster, InboundTransaction, etc.)
├── loader.ts   # Excel input reader — parses SKU_MASTER, IN_TX, OUT_TX, STOCKTAKE
├── bridge.ts   # Core reconciliation logic — calculateBridge()
└── excel.ts    # Excel output writer — writeBridgeSheet()
```

**Data flow:** `index.ts` → `loader.ts` (read input) → `bridge.ts` (compute) → `excel.ts` (write output)

**Adding new Phase 2 logic:**
- Add new types to `types.ts`
- Add a new reader function in `loader.ts` for `ACCOUNTING_SUMMARY`
- Create `monetaryBridge.ts` alongside `bridge.ts` for Phase 2 calculations
- Extend `excel.ts` with a new sheet writer function

## Testing

- Tests live alongside source files as `*.test.ts`
- Run all tests before committing
- New features should include tests
- Bug fixes should include a regression test

> **Current status:** No test framework is configured yet (`npm test` exits with an error).
> When adding tests, choose a framework (e.g. Vitest or Jest) and update `package.json` and this file.

## Environment Setup

No environment variables are required. The tool is fully self-contained.

**Prerequisites:**
- Node.js (tested with ES2020 target; Node 18+ recommended)
- npm

**First-time setup:**
```bash
git clone <repo-url>
cd zaiko
npm install
```

**Runtime dependencies:**
| Package | Version | Purpose |
|---------|---------|---------|
| `exceljs` | ^4.4.0 | Read/write Excel workbooks (.xlsx) |

**Dev dependencies:**
| Package | Version | Purpose |
|---------|---------|---------|
| `typescript` | ^5.9.3 | TypeScript compiler |
| `ts-node` | ^10.9.2 | Run `.ts` files directly without pre-compiling |
| `@types/node` | ^25.3.3 | Node.js type definitions |

**Output files:** Generated `.xlsx` files are gitignored (see `.gitignore`). Sample files in `sample/` are not ignored.

## Key Decisions Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-03-02 | Repository created | Initial setup of zaiko inventory system |
| 2026-03-03 | Tech stack chosen: TypeScript / Node.js | Typed language for reliability in inventory logic |
| 2026-03-03 | Excel-first design, Phase 1 = quantity reconciliation | Internal finance tool, no UI needed |
| 2026-03-04 | Phase 1 scaffold complete | All core src/ files implemented (loader, bridge, excel, types, index) |

## For AI Assistants

- Update this file whenever new conventions, tech choices, or workflows are established
- Do not push to `master` without explicit permission
- Prefer small, incremental commits over large changesets
- When uncertain about requirements, ask before implementing
- Phase 2 work (monetary reconciliation, root cause classification) has not been started — do not implement it unless explicitly requested
- No test framework is wired up yet; do not assume `npm test` passes
- The default branch is `master` (not `main`)
