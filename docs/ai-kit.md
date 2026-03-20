# AI Kit Structure — tri_ai_kit Usage on SkyBook

> This document covers the internal structure of the tri_ai_kit system used during development: what agents and skills are, how they differ, and what each one specifically produced during the SkyBook flight booking app build.

---

## 1. How tri_ai_kit Works

tri_ai_kit is a multi-agent orchestration layer built on Claude Code. It routes each task to a specialized agent that dynamically loads the skills relevant to that domain.

```
User prompt
    │
    ▼
Main conversation (orchestrator)
    │  classifies intent
    ▼
Agent dispatch (via Agent tool)
    │  e.g. "plan a booking flow" → planner
    ▼
Agent loads skills on demand
    │  e.g. planner loads: plan, subagent-driven-development
    ▼
Specialized output returned to main context
```

**The key design principle**: agents are executors, skills are knowledge packages. An agent without the right skills is generic — the same agent with the right skills becomes domain-specific. This is why a `frontend-architect` agent with `nextjs-developer` + `architecture-designer` skills produces architecture decisions, while the same agent with different skills would produce different outputs.

---

## 2. Skills vs Agents — The Distinction

| | Skills | Agents |
|---|--------|--------|
| **What it is** | A markdown knowledge document loaded into agent context | A Claude subprocess with its own system prompt, model, and memory |
| **How it works** | Loaded by the agent at task start — shapes how the agent thinks | Spawned via the Agent tool — runs independently, returns a result |
| **Scope** | Domain knowledge: patterns, rules, templates, examples | Task execution: reads files, runs analysis, writes output |
| **Persistence** | Active for the duration of one agent session | Completes and exits; results are returned to the orchestrator |
| **Example** | `nextjs-developer` SKILL.md teaches the agent Next.js App Router patterns | `frontend-architect` agent reads those patterns and applies them to produce an architecture decision |

In short: **skills teach**, **agents act**.

---

## 3. Skills Used in This Project

### `brainstorm`
**What it is**: Structured problem analysis — produces pros/cons, risks, trade-offs vs alternatives, and an opinionated recommendation for any decision or idea.

**Used for**:
- Evaluating sessionStorage vs localStorage for Zustand persistence
- Deciding between sidebar vs bottom-of-page filter panel placement
- Consulting on documentation steps before writing them (whether each step covered assessment requirements)

**What it produced**: Concrete decision rationale that is now documented in the architecture notes — e.g., sessionStorage chosen over localStorage for tab isolation (competitive price-checking across tabs), not just because it was "simpler".

---

### `plan` (fast mode — `/plan --fast`)
**What it is**: Reads the current codebase only — no external research or architecture spawning. Creates a phased implementation plan from what already exists.

**Used for**: Rapid plan creation when the tech stack was already determined (e.g., `05-route-guards-persistence.md`, `08-round-trip.md`, `10-animation-plan.md` — all codebase-only plans).

**What it produced**: Focused phase files with exact file paths, code snippets, and implementation order for specific features. Each plan file was the direct input for the `frontend-developer` agent.

---

### `plan-hard` (deep mode — `/plan --deep`)
**What it is**: Sequential research mode — spawns two `researcher` agents in parallel, aggregates their findings, then creates the plan. Used when the implementation problem requires external investigation before decisions can be made.

**Used for**: Planning the data layer (`04-data-layer.md`) — required understanding Duffel API pagination behavior, `return_offers` parameter behavior, and `passengerIds` constraints before any plan could be written. Also used for the i18n plan (`07-layout-guide.md`) — required verifying next-intl v3 App Router patterns before committing to a locale routing strategy.

**What it produced**: Plans with verified API behavior baked in — e.g., `return_offers=false` was identified via deep research before the plan committed to the paginated fetch pattern, preventing a late refactor of 1,638-offer payloads.

---

### `architecture-designer`
**What it is**: System architecture patterns, ADR (Architecture Decision Record) templates, component interaction diagrams, and trade-off evaluation frameworks.

**Loaded by**: `frontend-architect` agent during Phase 3.

**Used for**:
- Defining the 4-screen routing hierarchy (`/ → /en/results → /en/passengers → /en/confirmation`)
- Deciding which pages are Server Components vs Client Components
- Documenting the rendering strategy per page (see `00-architecture.md` in plans)
- Writing ADRs for: no SDK vs raw fetch, sessionStorage vs localStorage, Server Actions vs API routes

**What it produced**: `plans/.../implementation-plans/00-architecture.md` — the authoritative reference document for all other plan files. Every subsequent plan referenced it for file paths, naming conventions, and architectural constraints.

---

### `ui-ux-pro-max`
**What it is**: 50+ UI/UX design patterns, 161 color palettes, 57 font pairings, 99 UX guidelines, and component specifications across web and mobile. Loaded by `design-specialist` agent.

**Used for**:
- Selecting the Skyscanner-inspired color system (`#0770E3` primary, `#F1F2F8` background)
- Choosing Inter typeface at the correct weights (700 for headings, 600 for card titles, 400 for body)
- Specifying component sizing (52px search inputs, 48px primary buttons, 36px card selectors, 8px base grid)
- Defining the stop badge color system (green/orange/red with WCAG-compliant contrast)

**What it produced**: `plans/.../02-design-tokens.md` — the complete CSS token definitions that `globals.css` was built from, including the 3-layer token architecture (primitive → semantic → component).

---

### `design-system`
**What it is**: Three-layer design token architecture, component specification format, CSS custom property patterns, and handoff note templates for developer implementation.

**Loaded by**: `design-specialist` agent alongside `ui-ux-pro-max`.

**Used for**:
- Structuring the Tailwind CSS v4 `@theme` block in `globals.css`
- Defining badge component states (nonstop/one-stop/multi-stop) with all visual variants
- Writing the shadcn/ui component integration spec (`plans/.../03-shadcn-components.md`)

**What it produced**: The token file structure now reflected in `src/styles/globals.css` (lines 7–132) — colors, typography scale, spacing values, and component-specific classes like `.badge-nonstop`, `.prog-dot-active`, `.prog-line-done`.

---

### `nextjs-developer`
**What it is**: Next.js 15+ App Router patterns — Server Components, Client Components, Route Handlers, Server Actions, `generateMetadata`, middleware, i18n routing, and streaming SSR.

**Loaded by**: `frontend-architect` and `frontend-developer` agents.

**Used for**:
- Deciding which pages render as Server Components (results, confirmation) vs Client Components (search form, passenger form)
- Designing the `[locale]/` App Router segment for i18n
- Planning Server Actions for mutations (`searchFlights`, `getOffer`, `createOrder`) vs Route Handlers for streaming GETs (`/api/places`, `/api/flights/offers`)
- Implementing `server-only` import guard on `lib/duffel.ts` to prevent API key leaking into the client bundle

**What it produced**: `plans/.../04-data-layer.md` — the complete Server Actions + Route Handlers architecture, with exact file paths, the `duffelFetch<T>()` generic wrapper, and the `ActionResult<T>` discriminated union.

---

### `typescript-pro`
**What it is**: Advanced TypeScript type system patterns — discriminated unions, branded types, utility types, generic constraints, and Zod-to-TypeScript inference.

**Loaded by**: `frontend-architect` and `frontend-developer` agents.

**Used for**:
- Designing `ActionResult<T>` as a discriminated union so every Server Action caller is forced to handle both success and error branches at the type level
- Typing `duffelFetch<T>()` so the return type flows through without casting
- Generating `DuffelOffer`, `DuffelSlice`, `DuffelPassenger` types from live API responses rather than by hand
- Ensuring `total_amount` was typed as `string` (not `number`) — Duffel returns monetary values as strings

**What it produced**: `src/lib/types/duffel.ts` and `src/lib/types/actions.ts` — the complete TypeScript type definitions used by every component and action in the project.

---

### `code-review`
**What it is**: Code quality standards, security check rules (SEC/PERF/TS/LOGIC/DEAD/ARCH), review report format, and escalation gates for critical findings.

**Loaded by**: `code-reviewer` agent.

**Used for**: Post-implementation audits after each major feature was built. The skill defines what to check — the agent applies it.

**What it caught**:
- `useEffect` missing dependency array on the `OfferExpiryGuard` countdown timer
- `total_amount` being parsed with `parseFloat()` in display code (correct) but at risk of being used in arithmetic elsewhere
- Missing `aria-label` on the swap button (fixed before final build)
- `[locale]` segment not being included in the `next.config.js` locale middleware — caught before deployment

---

### `audit`
**What it is**: Multi-specialist audit orchestration — dispatches `muji` (UI component audit), `code-reviewer`, and `a11y-specialist` in sequence, then merges findings.

**Used for**: Final pre-deployment audit of the full component set — checking that UI token usage, accessibility, TypeScript correctness, and code quality all met the standard before the Vercel deploy.

**What it produced**: A structured audit report covering: stop badge contrast ratios (WCAG AA confirmed), keyboard navigation on the search combobox (confirmed focusable), and TypeScript `strict` compliance across all 40+ components.

---

### `web-i18n`
**What it is**: next-intl App Router patterns — locale routing via `[locale]` segment, `getTranslations()` in Server Components, `useTranslations()` in Client Components, message namespace structure, and locale detection middleware.

**Loaded by**: `frontend-developer` agent when working on i18n-related files.

**Used for**:
- Setting up the `[locale]/` App Router segment structure
- Writing `i18n/request.ts` for locale resolution
- Generating the initial JSON message key structure for `en.json`, `ms.json`, `zh.json`
- Wiring `getTranslations('search')` in Server Components and `useTranslations('results')` in Client Components without mixing the two APIs

**What it produced**: `src/i18n/` directory and all three locale message files — consistent namespace structure across languages with no missing keys.

---

## 4. Agents Used in This Project

### `planner`
**Model**: Claude Opus 4.6 (most capable — used for planning)
**Skills loaded**: `plan`, `plan-hard`, `subagent-driven-development`, `knowledge-retrieval`

**Role**: Entry point for every new feature. Decomposes the assessment requirements into phased plan files. Orchestrates `researcher` agents when external investigation is needed.

**Phases it ran**:

| Plan File | Mode | What it decomposed |
|-----------|------|-------------------|
| `00-architecture.md` | `--arch` | Full architecture gate — spawned `frontend-architect` first, then synthesized the plan |
| `01-tailwind-config.md` | `--fast` | Tailwind CSS v4 `@theme` configuration |
| `04-data-layer.md` | `--deep` | Duffel API data fetching architecture — researched `return_offers` behavior first |
| `05-route-guards-persistence.md` | `--fast` | Zustand `persist` + `useHydrated()` route guard pattern |
| `06-form-validation.md` | `--fast` | React Hook Form + Zod schema for search and passenger forms |
| `08-round-trip.md` | `--fast` | Round-trip offer_request flow and stacked card UI |
| `11-gaps-draft-plan.md` | `--fast` | Gap analysis against assessment requirements before final deploy |

---

### `researcher`
**Model**: Claude Haiku 4.5 (fast — used for high-volume research tasks)
**Skills loaded**: `research`, `knowledge-retrieval`, `docs-seeker`

**Role**: Technical investigation. Spawned in parallel pairs by `planner` in deep mode. Reads official docs, GitHub repos, and community sources. Returns structured research reports.

**What it researched for this project**:

| Topic | Finding that changed the plan |
|-------|------------------------------|
| Duffel offer_requests | `return_offers=false` required — default returns 1,638 offers inline |
| Duffel passenger IDs | `passengerIds[]` from offer_request must be reused verbatim in orders |
| next-intl v3 App Router | `getTranslations()` is async (Server), `useTranslations()` is sync (Client) — cannot mix |
| Zustand v5 + SSR | `persist` with `sessionStorage` requires `useHydrated()` guard to avoid hydration mismatch |
| motion/react v12 | `LazyMotion + domAnimation` required to avoid loading the full 35KB animation bundle |
| @hookform/resolvers v5 | New type inference pattern for Zod v4 — `zodResolver` call signature changed |

---

### `frontend-architect`
**Model**: Claude Opus 4.6
**Skills loaded**: `architecture-designer`, `api-designer`, `react-expert`, `nextjs-developer`, `typescript-pro`

**Role**: Architecture gate — runs before any implementation begins. Produces the authoritative architecture document that all subsequent plan files reference. Does not write implementation code.

**What it produced** (`plans/.../00-architecture.md`):
- 4-screen route tree with `[locale]` segment structure
- Server vs Client Component assignment per page (results page = Server shell + Client `ResultsList`)
- State management decision: Zustand with `sessionStorage` persist (not localStorage, not URL params)
- API contract: which calls go through Server Actions vs Route Handlers, and why
- Component directory structure (`search/`, `results/`, `passengers/`, `confirmation/`, `shared/`)
- TypeScript strict mode requirements and path alias configuration
- Error handling coverage: which components need loading/error/empty states

**Why it was necessary**: Without this gate, the `frontend-developer` agent would have made locally reasonable but globally inconsistent decisions — e.g., some pages using `localStorage`, some using `sessionStorage`; some components calling Duffel directly from the client, others via Server Actions. The architecture document enforced a single consistent pattern across 40+ components.

---

### `design-specialist`
**Model**: Claude Sonnet 4.6
**Skills loaded**: `ui-ux-pro-max`, `design-system`, `design`

**Role**: Design phase (before implementation). Produces design tokens, component specs, and visual decisions. Does not write component code — handoff notes go to `frontend-developer`.

**What it produced**:
- Complete CSS token set sourced from Skyscanner's design system (verified from live screenshots)
- Stop badge design spec: three variants (nonstop/one-stop/multi-stop), text + color, pill shape, WCAG contrast verified
- Progress stepper spec: 4-step, circular dots, connecting line, blue-on-dark-background variant
- Tailwind CSS v4 `@theme` block for `globals.css` — the exact CSS variables for colors, spacing, radius, and animation
- Component sizing table (52px inputs, 48px buttons, 32px airline logos, 8px base grid)

**Why it was separate from `frontend-developer`**: Design decisions require different thinking than implementation. Mixing them produces inconsistent visual systems — the developer optimizes for "it works", the designer optimizes for "it's consistent and accessible". Separating the roles meant the design system was frozen before the first component was written, preventing constant visual rework during implementation.

---

### `code-reviewer`
**Model**: Claude Sonnet 4.6
**Skills loaded**: `code-review`, `knowledge-retrieval`

**Role**: Post-implementation quality gate. Reads changed files, applies a fixed set of rules (SEC, PERF, TS, LOGIC, DEAD, ARCH, STATE), and produces a report. Does not modify source files.

**What it caught on SkyBook**:

| Finding | File | Fix Applied |
|---------|------|-------------|
| Missing `useEffect` dependency | `OfferExpiryGuard.tsx` | Added `onExpired` to dependency array |
| `aria-label` missing on swap button | `SwapButton.tsx` | Added `aria-label="Swap origin and destination"` |
| `[locale]` missing from `next.config.js` matcher | `next.config.ts` | Added locale prefix to middleware matcher |
| `total_amount` cast to number in sort comparator | `useFilteredOffers.ts` | Changed to `parseFloat()` for consistent string→number conversion |

**Why a separate agent**: A reviewer that wrote the code also has the blind spots of the person who wrote it. Running a fresh agent with no implementation context — only the finished code and the review rules — surfaces issues the implementation agent normalized during the build.

---

## 5. Agent Interaction Map

```
                    ┌─────────────────────────────────┐
                    │     User prompt (orchestrator)  │
                    └────────────┬────────────────────┘
                                 │
               ┌─────────────────┼──────────────────┐
               ▼                 ▼                  ▼
         [planner]          [researcher]    [design-specialist]
          /plan --deep      (2 in parallel)  design tokens
          /plan --fast       API research    component specs
               │                 │
               │   findings ◄────┘
               │
               ▼
        [frontend-architect]
         architecture gate
         00-architecture.md
               │
               │   architecture doc ◄─────────────────┐
               ▼                                       │
        [frontend-developer]                    (reads as input)
         implements per plan files
               │
               ▼
        [code-reviewer]
         post-implementation audit
         catches regressions + issues
```

Each agent runs in isolation — it cannot see what the other agents produced unless the orchestrator explicitly provides that output as input context. This isolation is the feature: it prevents the "tunnel vision" that occurs when one context holds both the implementation decisions and the review responsibility.
