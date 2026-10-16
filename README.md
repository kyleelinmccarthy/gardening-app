# 🌱 Garden Planner

Garden Planner helps you plan and look after an **indoor or outdoor garden**. It takes into account:

- your climate (USDA hardiness zone, frost dates, heat and humidity)
- the tools and equipment you already have
- your household: pets, allergies and children
- the kind of gardening you want to do

It ships with a database of 108 vegetables, herbs, fruits, flowers, houseplants and succulents. Each plant entry includes sun, water, temperature, soil, fertilizer, container suitability, companion plants, attracted insects, pests, and pet/human toxicity.

All data stays in your browser (localStorage). There is no backend, no account and no environment variables, so it deploys to Vercel as-is.

---

## Features

| Area | What it does |
| --- | --- |
| **Garden setup** (`/setup`) | A 7-step wizard covering:<ul><li>indoor or outdoor</li><li>climate: hardiness zone (with optional ZIP lookup), frost dates, summer high and winter low, humidity</li><li>indoor light and temperature</li><li>sun, soil type, space and containers-only</li><li>tools you own</li><li>interests, goals, experience and weekly time</li><li>pets, allergies and children</li></ul>You can keep several gardens. |
| **Recommendations** (`/recommendations`) | Scores every plant 0–100 against your garden and explains each score:<ul><li>✅ points in favour</li><li>⚠️ warnings</li><li>⛔ blockers</li></ul>Checks include light, hardiness, season length, heat, container fit, missing tools, experience, goals, soil, humidity, pet toxicity and allergens. |
| **Plant library** (`/plants`) | Search and filter by category, sun, water, difficulty, indoor or outdoor, container-friendly, edible, zone and goals. You can also hide plants toxic to your pets or containing your allergens. |
| **Plant detail** (`/plants/[id]`) | One page per plant: growing conditions, °F/°C temperatures, soil and pH, fertilizer schedule, container size, planting dates for your frost dates, companions and plants to keep apart, beneficial insects and pests, a toxicity table per pet, allergens, tools needed and care/harvest tips. |
| **Bed planner** (`/planner`) | A square-foot grid for each bed or container:<ul><li>place plants from a palette, with your recommended plants first</li><li>live warnings when a plant goes next to one it should be kept apart from</li><li>green/red cell status</li><li>companion suggestions, sun-mismatch warnings and plants-per-square hints</li></ul> |
| **Planting calendar** (`/calendar`) | A yearly timeline worked out from your frost dates: start indoors, direct sow, transplant, fall sow and harvest windows. Also a month-by-month view and an "upcoming" list. |
| **Care hub** (`/care`) | Today's watering, feeding, pest checks and harvests:<ul><li>watering intervals adjust for containers, heat, humidity and season</li><li>repeating reminders</li><li>care log</li><li>garden journal</li><li>per-planting status tracking</li></ul> |
| **Guides** (`/guides`) | A reference section with pages on:<ul><li>pests and wildlife, with integrated pest management steps and pet-safety notes</li><li>beneficial insects and pollinators</li><li>soil types and how to identify them</li><li>fertilizers: NPK, pet safety, how to apply</li><li>tools, with cheap alternatives</li><li>a companion-planting lookup</li><li>hardiness zones</li></ul> |
| **Settings** (`/settings`) | °F/°C, manage gardens, export/import a JSON backup, create your own **custom plants** (full plant editor), reset data. |

---

## Running it locally

**Requires:** Node.js **22** (see `.nvmrc`; ≥ 20.9 works) and npm.

```bash
npm install
npm run dev          # http://localhost:3000
```

To try the production build locally:

```bash
npm run build
npm start            # http://localhost:3000
```

### Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` / `npm start` | Make a production build and serve it |
| `npm test` | Unit and component tests (Vitest + React Testing Library) |
| `npm run test:watch` | Run the tests in watch mode |
| `npm run test:e2e` | Playwright end-to-end tests against a production build (run `npm run build` first) |
| `npm run lint` / `npm run typecheck` | ESLint and TypeScript |
| `npm run check` | Lint + typecheck + unit tests |

#### End-to-end tests

The first time you run them, install a browser:

```bash
npx playwright install chromium
```

If you already have Chromium installed, point Playwright at it instead with `PLAYWRIGHT_CHROMIUM_PATH=/path/to/chromium`. By default the tests start `next start` on port 3100. Set `E2E_BASE_URL=https://your-preview.vercel.app` to test a deployed URL instead.

---

## Deploying to Vercel (production)

The app is a standard Next.js 16 project with no environment variables, databases or secrets.

### Option A: Vercel dashboard (recommended)

1. Push this repository to GitHub.
2. Go to <https://vercel.com/new>, choose **Import Git Repository** and pick the repo.
3. Vercel detects **Next.js**. Keep the defaults:
   - Build command `next build`
   - Output directory: the default
   - Install command `npm install`
4. Under **Settings → General → Node.js Version**, choose **22.x**.
5. Click **Deploy**.

After that:
- Every push to the production branch (usually `main`) deploys to production.
- Every other branch and pull request gets its own preview URL.

### Option B: Vercel CLI

```bash
npm i -g vercel
vercel login
vercel link          # first time: link or create the project
vercel               # deploy a preview
vercel --prod        # deploy to production
```

### Before going to production

- `npm run check && npm run build && npm run test:e2e` should all pass. The workflow in `.github/workflows/ci.yml` runs the same checks on every push and pull request.
- To add a custom domain: Vercel → Project → **Settings → Domains**.
- **No server state:** each visitor's gardens live in their own browser. Use *Settings → Backup* to export or import data between browsers or devices.

---

## Privacy and data

- Everything is saved in your browser's `localStorage` under the key `garden-planner:v1`.
- **The only network request** is the optional **ZIP → hardiness zone lookup** in setup, which calls the public `https://phzmapi.org/<zip>.json`. If the lookup fails, pick your zone by hand.
- **Corrupted data:** if saved data can't be read, the app keeps a timestamped backup copy (`garden-planner:v1:corrupt-backup:<time>`) and tells you.
- **Blocked storage:** if the browser blocks storage (for example some private-browsing modes), the app says your changes won't be saved.

> **Plant safety information is general guidance**, based on sources such as the ASPCA's toxic and non-toxic plant lists and university extension services. It is not veterinary or medical advice. If a pet or child eats a plant, contact your vet, the ASPCA Animal Poison Control Center (888-426-4435) or Poison Control (1-800-222-1222, US).

---

## Architecture

```
src/domain/     Pure, framework-free logic and types (fully unit tested)
                recommendation (rule-based scoring), safety, filters, companions,
                calendar, care scheduling, climate, dates, catalog, plantings
src/data/       Built-in reference data: plants/, insects, soils, fertilizers, tools, zones
src/storage/    Storage adapters, zod schema validation, sanitising, import/export
src/state/      Pure app reducer + React context provider (hydrates after mount)
src/components/ ui/ primitives + one folder per feature
src/app/        Thin Next.js routes
e2e/            Playwright tests
```

Design principles (see `CLAUDE.md`):

- **TDD:** domain logic, the reducer and components each have tests next to the code.
- **SOLID:** recommendation rules are a list of independent `Rule` functions, so you add a rule without editing the engine. Storage is behind a repository interface, which the provider receives as a parameter.
- **DRY:** one place each for enums (const arrays in `types.ts`), labels (`lib/labels.ts`) and UI primitives.
- **KISS:** no backend and no global state library.

### Adding or editing plants

- **In the app:** go to *Settings → Custom plants*.
- **For everyone:** add an entry to the right file in `src/data/plants/`. The `Plant` type in `src/domain/types.ts` documents every field. `npm test` runs integrity tests that check unique IDs, valid companion references, temperature ordering, pH ranges, indoor light levels and so on.
