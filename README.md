# SkyBook

A full-stack flight booking application built with Next.js and the Duffel Flights API.

## Live Demo

https://flight-explorer-twenty-six.vercel.app/en

## Features

- Airport search with real-time auto-suggestions
- One-way and round-trip flight search
- Real-time flight results with advanced filters (stops, airline, time, price)
- Flexible sorting (price, duration, departure time)
- Passenger details form with validation
- Booking confirmation via Duffel API
- Animated UI with smooth transitions
- Multi-language support (English, Malay, Chinese)

## Tech Stack

| Layer      | Technology                       |
| ---------- | -------------------------------- |
| Framework  | Next.js 16, React 19             |
| Language   | TypeScript                       |
| Styling    | Tailwind CSS v4, shadcn/ui       |
| State      | Zustand                          |
| Animations | Framer Motion (motion/react v12) |
| i18n       | next-intl                        |
| API        | Duffel Flights API               |
| Deployment | Vercel                           |

## Prerequisites

- Node.js 20 or higher
- npm 10 or higher
- Free Duffel account (get one at https://app.duffel.com)

## Setup

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd /frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Copy the environment template:

   ```bash
   cp .env.example .env.local
   ```

4. Add your Duffel test API key to `.env.local`:

   ```
   DUFFEL_API_KEY=your_test_key_here
   ```

5. Start the development server:

   ```bash
   npm run dev
   ```

6. Open http://localhost:3000 in your browser.

## Development Process

The project was built in 10 phases across four groups. Full details in [docs/workflow.md](./docs/workflow.md).

### Research (Phases 1–4)

| Step | Phase | What happened |
| ---- | ----- | -------------- |
| 1 | **Brainstorm** | Read the assessment in full; decomposed into 4 screens, API calls, docs, and deployment deliverables |
| 2 | **Competitor research** | Tested 7 OTA platforms (Google Flights, Skyscanner, Expedia, Kayak, AirAsia, Booking.com, Trip.com); selected Skyscanner as the primary design reference |
| 3 | **Tech stack research** | Compared Zustand vs Redux, RHF vs Formik, shadcn/ui vs MUI; each choice documented with rationale |
| 4 | **API research** | Live-tested all 6 Duffel endpoints; discovered `return_offers=false` requirement and `passengerIds[]` constraint from real responses |

### Planning (Phases 5–6)

| Step | Phase | What happened |
| ---- | ----- | -------------- |
| 5 | **Plan** | Wrote 12 implementation plan files covering architecture, tokens, data layer, route guards, forms, animations, and responsive layout |
| 6 | **Architecture gate** | `frontend-architect` agent reviewed and locked the component split; TanStack Query removed; `useHydrated()` pattern added |

### Build (Phases 7–8)

| Step | Phase | What happened |
| ---- | ----- | -------------- |
| 7 | **Implement** | Built all 4 screens in dependency order: Foundation → Search → Results → Passengers → Confirmation → Shared; 40+ components, 3 Server Actions, 2 Route Handlers |
| 8 | **Code review** | `code-reviewer` agent audited TypeScript strictness, accessibility (ARIA, keyboard nav, contrast), and code quality; all issues resolved before testing |

### Verify & Ship (Phases 9–10)

| Step | Phase | What happened |
| ---- | ----- | -------------- |
| 9 | **Test & fix** | End-to-end booking flow tested in browser with live Duffel test API; fixed 3 bugs (import paths, round-trip grid, Zustand hydration flash) |
| 10 | **Deploy** | Connected repo to Vercel, set `DUFFEL_API_KEY` env var, verified live URL end-to-end |

---

## Documentation

Full technical and process documentation is in the [`docs/`](./docs/) directory:

| Document                                                       | What it covers                                                                                                          |
| -------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| [docs/index.md](./docs/index.md)                               | Documentation index — brief description of each document                                                                |
| [docs/architecture.md](./docs/architecture.md)                 | System architecture — library choices, rendering strategy, state management, route guard pattern, Mermaid diagrams      |
| [docs/workflow.md](./docs/workflow.md)                         | Development workflow — 10-phase process from brainstorm to deployment, key learnings                                    |
| [docs/competitive-research.md](./docs/competitive-research.md) | 7 OTA platforms studied, Skyscanner as primary reference, patterns adopted and deliberately avoided                     |
| [docs/ai-tools.md](./docs/ai-tools.md)                         | Claude Code + tri_ai_kit usage, which agents handled which phases, concrete examples of where AI helped most            |
| [docs/ai-kit.md](./docs/ai-kit.md)                             | tri_ai_kit internals — skills vs agents distinction, every skill and agent used, what each produced                     |

---

## Implementation Plans

All planning artefacts live in [`plans/`](./plans/). Two plan batches were produced: the initial build plan and a late-stage gap-resolution plan.

### Batch 1 — Initial Build (`plans/260315-1200-flight-booking-app/`)

#### Research & Exploration

| Plan                                                                                                                                                    | What it covers                                                                                                                               |
| ------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| [research-overview.md](./plans/260315-1200-flight-booking-app/research-overview.md)                                                                     | Top-level summary — frontend vs backend assessment split, stack versions, API endpoints, deployment targets                                  |
| [frontend/plans/1-booking-flow-overview.md](./plans/260315-1200-flight-booking-app/frontend/plans/1-booking-flow-overview.md)                           | 4-screen flow (Search → Results → Passengers → Confirm), API call sequence, Zustand state handoffs, error handling matrix                    |
| [frontend/plans/2-duffel-api-exploration.md](./plans/260315-1200-flight-booking-app/frontend/plans/2-duffel-api-exploration.md)                         | Duffel API live-tested results — token verified, all 6 endpoints with actual request/response payloads                                       |
| [frontend/plans/3-research-overview-frontend.md](./plans/260315-1200-flight-booking-app/frontend/plans/3-research-overview-frontend.md)                 | Full frontend research — tech stack rationale, repo structure, architecture, requirements breakdown, implementation workflow, hosting, risks |
| [frontend/plans/4-research-ui-ux.md](./plans/260315-1200-flight-booking-app/frontend/plans/4-research-ui-ux.md)                                         | UI/UX decisions — screen-by-screen design, component specs, design system, patterns to adopt/avoid                                           |
| [frontend/plans/5-research-ui-ux-competitor-analysis.md](./plans/260315-1200-flight-booking-app/frontend/plans/5-research-ui-ux-competitor-analysis.md) | Competitor deep-dive — 7 OTA platforms (Google Flights, Skyscanner, Kayak, Expedia, Trip.com, AirAsia, Booking.com)                          |
| [research-animations.md](./plans/260315-1200-flight-booking-app/research-animations.md)                                                                 | Animation strategy — Framer Motion (LazyMotion) approach, which transitions to use per screen                                                |
| [research-responsive-design.md](./plans/260315-1200-flight-booking-app/research-responsive-design.md)                                                   | Responsive design research — mobile-first breakpoints, container queries, touch targets                                                      |

#### Implementation Plans (numbered phases)

| Plan                                                                                                                                  | What it covers                                                                                                |
| ------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| [00-architecture.md](./plans/260315-1200-flight-booking-app/frontend/implementation-plans/00-architecture.md)                         | Project scaffold — full directory tree, routing, data-fetching strategy, type system, i18n, environment setup |
| [01-tailwind-config.md](./plans/260315-1200-flight-booking-app/frontend/implementation-plans/01-tailwind-config.md)                   | Tailwind CSS v4 configuration — `@theme` tokens, shadcn/ui integration, font setup                            |
| [02-design-tokens.md](./plans/260315-1200-flight-booking-app/frontend/implementation-plans/02-design-tokens.md)                       | Design tokens — Skyscanner-inspired palette, spacing scale, typography, semantic colour mapping               |
| [03-shadcn-components.md](./plans/260315-1200-flight-booking-app/frontend/implementation-plans/03-shadcn-components.md)               | shadcn/ui component list — which components, where each is used, install commands                             |
| [04-data-layer.md](./plans/260315-1200-flight-booking-app/frontend/implementation-plans/04-data-layer.md)                             | Data layer — Server Actions for mutations, Route Handlers for GETs, token isolation, caching strategy         |
| [05-route-guards-persistence.md](./plans/260315-1200-flight-booking-app/frontend/implementation-plans/05-route-guards-persistence.md) | Route guards + state persistence — Zustand + sessionStorage, back-navigation, offer expiry modal              |
| [06-form-validation.md](./plans/260315-1200-flight-booking-app/frontend/implementation-plans/06-form-validation.md)                   | Form validation — react-hook-form + Zod schemas for Search (F1) and Passenger (F3) forms                      |
| [07-layout-guide.md](./plans/260315-1200-flight-booking-app/frontend/implementation-plans/07-layout-guide.md)                         | Layout guide — 4-screen structure, header/footer, page-level component hierarchy                              |
| [08-round-trip.md](./plans/260315-1200-flight-booking-app/frontend/implementation-plans/08-round-trip.md)                             | Round-trip support — stacked-slices card pattern, return-date handling, Zustand shape extension               |
| [09-responsive-plan.md](./plans/260315-1200-flight-booking-app/frontend/implementation-plans/09-responsive-plan.md)                   | Responsive plan — mobile-first breakpoints, sticky filter bar, card reflow, touch targets                     |
| [10-animation-plan.md](./plans/260315-1200-flight-booking-app/frontend/implementation-plans/10-animation-plan.md)                     | Animation plan — page transitions, skeleton loaders, flight card reveal, reduced-motion support               |
| [11-gaps-draft-plan.md](./plans/260315-1200-flight-booking-app/frontend/implementation-plans/11-gaps-draft-plan.md)                   | Initial gap review — data layer, types, guards, validation, edge cases, performance items                     |

#### Original Assessment Documents

| Plan                                                                                                      | What it covers                                          |
| --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| [overview/frontend-assessment.md](./plans/260315-1200-flight-booking-app/overview/frontend-assessment.md) | Original frontend assessment brief (converted from PDF) |

---

### Batch 2 — Gap Resolution (`plans/260320-gap-resolution/`)

A post-build audit identified 7 gaps. This plan tracks the fixes.

| Plan                                             | What it covers                                                     |
| ------------------------------------------------ | ------------------------------------------------------------------ |
| [plan.md](./plans/260320-gap-resolution/plan.md) | Full gap list, effort estimates, 4 fix phases, acceptance criteria |

#### Gaps identified

| #   | Gap                                                             | Status      |
| --- | --------------------------------------------------------------- | ----------- |
| G1  | Passport / identity document fields missing from passenger form | Pending     |
| G2  | Phone validation not enforcing E.164 (`+...`) format            | Pending     |
| G3  | Mobile sticky booking bar missing on `/passengers`              | Pending     |
| G4  | `generateMetadata` missing on search + results pages            | Pending     |
| G5  | `.env.example` missing at repo root                             | Pending     |
| G6  | `README.md` was default create-next-app boilerplate             | ✅ Done     |
| G7  | `ARCHITECTURE.md` missing (required by assessment)              | ✅ Done     |

#### Fix phases

| Phase                            | Scope                                                           | Agent                |
| -------------------------------- | --------------------------------------------------------------- | -------------------- |
| P1 — Passenger form completeness | Passport fields, E.164 phone validation, Duffel booking payload | `frontend-developer` |
| P2 — Mobile bar + metadata       | Sticky `MobileBookingBar`, `generateMetadata` on all pages      | `frontend-developer` |
| P3 — Setup documentation         | `.env.example`, rewritten `README.md`                           | `docs-manager`       |
| P4 — Architecture documentation  | `ARCHITECTURE.md` covering all 4 assessment requirements        | `docs-manager`       |

---

## Future Implementation

Work tracked in the gap resolution plan ([plans/260320-gap-resolution/plan.md](./plans/260320-gap-resolution/plan.md)). The following items remain open:

### Pending gaps (G1–G5)

| # | Item | Detail |
| --- | --- | --- |
| G1 | Passport / identity document fields | Conditional fields on passenger form when offer requires docs; Duffel payload extension |
| G2 | E.164 phone validation | Tighten regex to `^\+\d{7,15}$`; current `min(7)` allows invalid formats |
| G3 | Mobile sticky booking bar | `MobileBookingBar` component (`lg:hidden`) on `/passengers` showing price + submit |
| G4 | Page metadata | `generateMetadata` on search (`/`) and results (`/results`) pages |
| G5 | `.env.example` | Environment template file at repo root for new developer setup |

### Potential future enhancements

| Area | Description |
| --- | --- |
| Seat selection | Add seat map step between passenger details and confirmation |
| Fare rules | Display baggage allowance and fare conditions on results and confirmation |
| Price alerts | Notify users when tracked route prices drop |
| User accounts | Save past searches and bookings with authentication |
| Multi-city search | Support complex itineraries beyond one-way and round-trip |
| Payment integration | Add Stripe or Duffel Pay for real payment flow instead of test orders |
