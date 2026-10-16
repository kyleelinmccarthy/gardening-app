@AGENTS.md

# Garden Planner — engineering guide

Next.js 16 (App Router) + React 19 + TypeScript (strict) + Tailwind CSS v4.
Tests: Vitest + React Testing Library (unit/component), Playwright (e2e).
All user data lives in the browser (localStorage) — no backend, no env vars.

## Principles
- **TDD**: write/extend the failing test first, then the code. Every domain
  function and reducer action has unit tests; UI components have RTL tests
  for their key behaviour.
- **SOLID**: domain logic is pure and framework-free (`src/domain`), storage
  is behind an interface (`src/storage`), UI depends on hooks/abstractions,
  not on localStorage directly. One responsibility per module.
- **DRY**: enums and labels live in one place (`src/domain/types.ts`,
  `src/lib/labels.ts`); reuse UI primitives in `src/components/ui`.
- **KISS**: no global state library, no backend, no premature abstraction.

## Layout
```
src/domain/     pure logic + types (no React, no browser APIs)
src/data/       built-in reference data (plants, insects, soils, fertilizers, tools, zones)
src/storage/    persistence adapters, schema validation, import/export
src/state/      React context/provider + pure reducer for AppData
src/lib/        small shared helpers (ids, labels, class names)
src/components/ UI components (ui/ = generic primitives, feature folders otherwise)
src/app/        Next.js routes (thin; compose components)
e2e/            Playwright tests
```

## Conventions
- Temperatures stored in °F; dates as ISO `YYYY-MM-DD`; month-day as `MM-DD`.
- Tests sit next to the code: `foo.ts` → `foo.test.ts`.
- Client components that touch app data use `useAppData()` from
  `@/state/AppDataProvider`; data hydrates after mount (check `hydrated`).
- Commands: `npm test`, `npm run typecheck`, `npm run lint`, `npm run build`,
  `npm run test:e2e`, `npm run check` (lint + typecheck + unit tests).
