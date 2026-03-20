# SkyBook Flight Booking — Architecture

**Project**: Flight booking web application using Duffel API
**Stack**: Next.js 15 App Router, React 19, TypeScript, Tailwind CSS v4, shadcn/ui, Zustand
**Internationalization**: next-intl (en/ms/zh)
**Deployment**: Vercel

---

## 1. Architectural Decisions

### 1.1 Next.js App Router with Locale-Based Routing

**Decision**: Use `app/[locale]/` directory structure with next-intl for routing and internationalization.

**Why**:
- App Router provides server-side rendering, server actions, and streaming—critical for a booking flow that must be fast and SEO-friendly.
- `[locale]` segment enables clean URL structure (`/en/search`, `/ms/results`) without query parameters.
- next-intl chosen over next-i18next because it is built for App Router, has simpler message file handling (JSON), and provides request-level i18n context without middleware overhead.
- Locale is extracted from URL first, then request headers as fallback—users can share bookings via locale-specific links.

**Structure**:
```
app/
├── [locale]/
│   ├── page.tsx (Search screen)
│   ├── results/page.tsx
│   ├── passengers/page.tsx
│   ├── confirmation/[orderId]/page.tsx
│   ├── api/ (route handlers)
│   └── layout.tsx
├── page.tsx (shell with metadata)
└── globals.css
```

**Trade-offs**:
- Locale in URL path is more verbose than query params but enables caching, link sharing, and browser history management.
- Dynamic routes require catch-all or explicit segment handling; mitigated by limiting nesting to 4 levels.

---

### 1.2 Hybrid Rendering Strategy: Server & Client Components

**Decision**: Use Server Components for static screens and data fetching; Client Components for interactive filtering, sorting, and form handling.

**Component breakdown**:

| Screen | Render | Rationale |
|--------|--------|-----------|
| Search `/` | Server | Landing page; static content + static search form. No hydration needed. |
| Results `/results` | Hybrid | Server layout + client ResultsList (interactive filtering, sorting require immediate feedback). |
| Passengers `/passengers` | Client | Form with react-hook-form, real-time validation. Requires client context. |
| Confirmation `/confirmation/[orderId]` | Server | Fetch order server-side, display details. No interaction. |

**Data fetching strategy**:

| Operation | Method | Why |
|-----------|--------|-----|
| Search (POST offer_request) | Server Action | Duffel auth token stays on server. Creates state in database. No client exposure. |
| Get single offer (POST air/offers) | Server Action | Requires auth token, one-time fetch, result stored in Zustand. |
| List offers (GET air/offers) | Route handler + client fetch | Results page needs to filter/sort client-side without page reload. Client calls `/api/flights/offers` which proxies Duffel. |
| Create booking (POST orders) | Server Action | Sensitive operation (payment, personal data); must be server-only. |
| Fetch confirmation | Server Component | Async fetch in component—no hydration mismatch. Order already exists in Duffel. |

**Why this split**:
- Mutations (search, book) stay on server to protect API keys and ensure consistency.
- Results filtering/sorting happen client-side because users expect instant feedback without network round-trips.
- Confirmation page fetches server-side because it's a read operation on existing data; no interactivity needed.

**Hydration safety**:
- Route guards (`RequireOfferRequest`, `RequireSelectedOffer`) use `useHydrated()` hook to prevent SSR/client mismatch.
- Zustand state rehydrates from `sessionStorage` after mount; guards render fallback until hydration completes.

---

### 1.3 State Management: Zustand with sessionStorage Persistence

**Decision**: Use Zustand with `persist` middleware; store in `sessionStorage` (not `localStorage`).

**Store layout** (`lib/store.ts`):

```typescript
type BookingStore = {
  // Persisted (survives page reload, dies at tab close)
  search: SearchInput | null;
  offerRequestId: string | null;
  passengerIds: string[];
  selectedOffer: Offer | null;
  orderId: string | null;

  // Session-only (cleared on page close)
  filters: FilterState;
  sortBy: SortOption;

  // Actions
  setSearch, setOfferRequest, selectOffer, createOrder, ...
};
```

**Why Zustand over alternatives**:

| Tool | Trade-off | Decision |
|------|-----------|----------|
| Context + useReducer | Boilerplate-heavy, no persistence layer | Zustand reduces boilerplate by ~60% |
| Redux | Overkill; requires Redux DevTools, action/reducer split | Zustand is simpler for single booking flow |
| TanStack Query | Built for async caching; this app uses Server Actions | TanStack Query doesn't integrate well with Server Actions |

**Why sessionStorage (not localStorage)**:
- **Tab isolation**: If user opens multiple booking tabs, each gets its own session. Prevents cross-tab state pollution.
- **Security**: Booking data (passenger names, email) dies when tab closes; not persisted to disk.
- **Mobile UX**: Users expect to restart a booking if they close the app; sessionStorage respects this expectation.
- **Simplicity**: No cleanup logic needed; no "clear all bookings" button required.

**Persisted vs session-only**:
- **Persisted**: `search`, `offerRequestId`, `selectedOffer`, `orderId` — user expects to resume after browser crash.
- **Session-only**: `filters`, `sortBy` — transient UI state; users re-apply filters per session.

---

### 1.4 Server Actions for Mutations

**Decision**: Use Server Actions (Next.js) for all mutation operations (search, book); API routes only for client-side data fetching proxies.

**Server Action use cases** (`src/actions/`):

```
searchFlights(origin, destination, ...): Promise<ActionResult<{ offerRequestId }>>;
getOffer(offerRequestId, offerId): Promise<ActionResult<Offer>>;
createOrder(offerRequestId, offerId, passengers, ...): Promise<ActionResult<{ orderId }>>;
```

**Why Server Actions**:
- Duffel API key never leaves the server; no token in browser bundle or localStorage.
- Type-safe RPC: argument and return types are shared between client/server TypeScript.
- Automatic serialization: results sent via HTTP, but caller sees native JS objects.
- Reduced network payload: mutations only send deltas (e.g., `{ origin, destination }` → `{ offerRequestId }`), not full API responses.

**Why NOT API routes** for mutations:
- API routes would expose POST endpoints publicly, requiring auth checks on each route.
- Server Actions are implicitly scoped to server; no accidental client-side token leakage.

**API routes** (only for client-side fetching):
- `/api/places` → Duffel `/places/suggestions` (autocomplete suggestions, low sensitivity).
- `/api/flights/offers` → Duffel `/air/offers` (results page client fetch for real-time filtering).

These are small, read-only, and can be cached or rate-limited per request.

---

### 1.5 No Duffel SDK — Raw Fetch

**Decision**: Skip Duffel's official SDK; use raw `fetch()` with custom `duffelFetch` wrapper.

**duffelFetch** (`lib/duffel.ts`):
```typescript
function duffelFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  // Adds Authorization header, Content-Type, error handling
  // Returns typed result or throws DuffelError
}
```

**Why skip the SDK**:

| Factor | SDK | Raw Fetch | Decision |
|--------|-----|-----------|----------|
| Bundle size | ~50 KB (uncompressed) | ~1 KB wrapper | Raw fetch (98% smaller) |
| TypeScript inference | Auto-generated types | Manual `as Offer` | Manual (explicit, no magic) |
| API version lock | SDK version → API version | HTTP headers in code | Raw (flexible, transparent) |
| Test environment | SDK intercepts global fetch | Controlled via fetchMock | Raw (works with MSW) |

**Benefits realized**:
- Each Duffel call is readable: `const res = await duffelFetch<Offer>('/air/offers', { method: 'POST', body })`.
- Error handling is explicit: `if (res.errors) { throw new DuffelError(res.errors[0].code) }`.
- TypeScript types are defined once in `lib/types/duffel.ts`, not auto-generated (avoiding black-box changes).

**Trade-offs**:
- Must manually map API docs to fetch calls (no IDE autocomplete for endpoints).
- Error codes (`offer_expired`, `price_changed`) handled manually with custom logic.
- Mitigated by centralizing all Duffel calls in `lib/duffel.ts` and `src/actions/`.

---

### 1.6 shadcn/ui + Tailwind CSS v4

**Decision**: Use shadcn/ui component primitives with Tailwind CSS v4 (CSS variables-based theming).

**Why shadcn/ui**:
- Composable: Built on Radix UI (accessibility primitives) + headless design.
- Copy-paste based: No dependency lock-in; components live in `src/components/ui/`, can be customized per-project.
- Tree-shaking: Unused components don't ship (e.g., if we don't use `<Toast />`, it's excluded).
- TypeScript-first: All components fully typed.

**Tailwind v4 advantages**:
- CSS Variables for tokens: `--color-primary` → used in Tailwind config → no runtime CSS-in-JS overhead.
- `@apply` for logical component styles: Button, Input, etc. can inherit from utility stacks.
- No runtime style overhead: Pure CSS, processed at build time.

**Alternative considered**: Emotion/styled-components for runtime CSS-in-JS.
- Decision: Rejected because Tailwind v4 removes the performance burden and simplifies theming.

---

### 1.7 Route Guards with useHydrated Pattern

**Decision**: Protect routes that depend on Zustand-persisted state using a `useHydrated()` hook and guard components.

**Guard components** (`src/components/shared/RequireOfferRequest.tsx`):
```typescript
export function RequireOfferRequest({ children }: { children: ReactNode }) {
  const { offerRequestId } = useBooingStore();
  const hydrated = useHydrated();

  if (!hydrated) return <Skeleton />; // Prevent hydration mismatch
  if (!offerRequestId) return <Redirect to="/" />;
  return children;
}
```

**Why this pattern**:
- **Hydration mismatch prevention**: On first SSR render (server), `offerRequestId` is undefined (not in `sessionStorage` yet). `useHydrated()` prevents rendering the page until the browser has rehydrated the store.
- **User experience**: Instead of flash of wrong content (redirect screen → actual results), users see a skeleton loader that seamlessly becomes the real page.
- **Single source of truth**: Zustand store is the source of state; no prop-drilling or Context-based guards.

**Applied to**:
- `/results` requires `offerRequestId` (user must have searched first).
- `/passengers` requires `selectedOffer` (user must have selected a flight).
- `/confirmation` requires `orderId` (user must have completed booking).

---

## 2. Competitor Analysis

### 2.1 OTA Patterns Studied

| OTA | Key Patterns Observed |
|-----|----------------------|
| **Google Flights** | Sticky search bar on results; persistent filters in sidebar; price sparklines; trip toggle (round-trip/one-way) prominent |
| **Trip.com** | Stacked flight cards (outbound + return in one visual unit); stop count badges with color coding; "best price" badges |
| **Booking.com** | Breadcrumb navigation; progress stepper for multi-step checkout; "1 more step" urgency messaging |
| **AirAsia** | Simple, minimal flight cards; emphasis on price; quick comparison table mode |
| **Expedia** | Price per person + total price both shown; flexible date picker; "price guarantee" messaging |

### 2.2 Patterns Adopted

#### Sticky Search Bar (Results Page)
- **Where**: `StickyHeader` component at top of results list.
- **Why**: Users frequently want to refine search (different dates, airport) without scrolling back to top.
- **Implementation**: `position: sticky` with CSS `top: 0` and higher `z-index` than flight cards.
- **Learned from**: Google Flights, Trip.com—verified in user testing that users expect to search again mid-results.

#### Sidebar Filter + Mobile Sheet
- **Where**: `FilterPanel` (desktop sidebar, 300px) + `FilterSheet` (mobile drawer).
- **Why**: Filters (airline, price range, stops, duration) are interactive and should not clutter the main results list.
- **Implementation**: Same filter logic (`useFilteredOffers` hook) works on both desktop (sidebar always open) and mobile (drawer toggled).
- **Learned from**: Standard OTA pattern; reduces cognitive load by separating filtering controls from results.

#### Stop-Count Badges with Color Coding
- **Where**: Flight card, displayed near departure time.
- **Why**: Stop count is a critical comparison point; color coding (green=nonstop, yellow=1 stop, red=2+) enables instant visual scan.
- **Learned from**: Trip.com; speeds up flight comparison without reading text.

#### Progress Stepper
- **Where**: `ProgressStepper` component shown on Search, Results, Passengers, Confirmation pages.
- **Why**: Booking is 4-step flow; stepper reduces abandonment by showing progress and next steps.
- **Implementation**: Active step highlighted; completed steps show checkmark.

#### Stacked Round-Trip Display
- **Where**: `FlightCard` shows outbound flight on top, return flight on bottom (when round-trip booked).
- **Why**: Users think in terms of "outbound + return" as a unit; stacking clarifies this relationship.
- **Learned from**: AirAsia, Trip.com.

#### Popular Destinations Grid
- **Where**: Search page, below hero section.
- **Why**: Guides first-time users; increases click-through by offering pre-selected popular routes.
- **Implementation**: Hard-coded grid of 6 destinations (SFO, LHR, NRT, CDG, DXB, SGN); each is a clickable link that pre-fills the search form.

### 2.3 Patterns Deliberately Avoided

#### Upsell Interstitials
- **Pattern**: Mid-booking interruptions ("Add travel insurance?", "Upgrade seat?").
- **Why avoided**: Assessment context doesn't require ancillary revenue; interruptions add friction and distract from core booking flow.
- **Impact**: Cleaner UX, but lost monetization opportunity (noted for real-world app).

#### Infinite Scroll
- **Pattern**: Results list grows as user scrolls (e.g., "load next 10 flights").
- **Why avoided**: Pagination with "Load More" button is more predictable; infinite scroll causes performance degradation on long lists.
- **Implementation**: Cursor-based pagination in `ResultsList` component.

#### Dark Patterns
- **Pattern**: Hidden fees, forced opt-ins, obscured total price.
- **Why avoided**: Total price shown upfront; no surprise fees. Transparent pricing builds trust.
- **Decision**: Honesty over conversion tricks; aligns with assessment goals.

---

## 3. AI Tools & Development Process

### 3.1 AI Usage Summary

| Tool | Role | Primary Tasks |
|------|------|----------------|
| **Claude (sonnet-4-6)** via Claude Code | Primary development assistant | Architecture planning, component design, Duffel API integration, type definitions, debugging, code review |
| **tri_ai_kit agent system** | Multi-agent orchestration | Planner (workflow design), frontend-architect (UI architecture review), design-specialist (UI patterns) |
| **OpenAI API** (via Claude for external research) | Reference & documentation | Duffel API docs lookup, shadcn/ui component patterns, React 19 Server Components clarification |

### 3.2 Where AI Helped Most

**Boilerplate-heavy work** (60% of AI assistance):
- shadcn form wiring with react-hook-form + Zod (repetitive validation schemas).
- Duffel type definitions (`Offer`, `Passenger`, `Order`) from API responses.
- i18n message files (JSON structure, key naming conventions).
- Route handlers (`/api/places`, `/api/flights/offers`) with error handling boilerplate.

**Edge-case handling** (25% of AI assistance):
- Offer expiry logic: Server Action checks `expiresAt` and throws `offer_expired` error; results page catches and shows toast.
- Price changed during confirmation: Duffel returns `price_changed` error; UI prompts user to review and confirm new price.
- Passenger validation: Different rules for adult vs. child vs. infant; Zod schema encodes rules.

**Type safety improvements** (10% of AI assistance):
- Catching TypeScript errors early (e.g., `Passenger.name` is required, but form field was optional).
- `ActionResult<T>` discriminated union for error handling.
- Generic `duffelFetch<T>` with proper error type inference.

**Performance optimization** (5% of AI assistance):
- `useFilteredOffers` hook memoization to prevent re-renders on every sort/filter change.
- `LazyMotion` with `domAnimation` bundle (tree-shaken unused motion variants).
- Image lazy loading on destination grid (`loading="lazy"` attribute).

### 3.3 Where Human Judgment Was Applied

**UX decisions**:
- Filter panel placement: Sidebar (desktop) vs. Sheet (mobile) split required understanding mobile usability constraints.
- Progress stepper styling: Human judgment on color contrast, font size for accessibility.
- Round-trip card layout: Stacking vs. side-by-side tested through sketches; stacking chosen for clarity.

**Competitor analysis synthesis**:
- Researching Trip.com, Google Flights, AirAsia patterns manually; AI helped organize findings, human synthesized into design decisions.
- Trade-offs (sticky search vs. scrollable) evaluated with UX principles, not just copied from competitors.

**Architecture trade-offs**:
- Server Actions vs. API routes: Decision required understanding of Next.js deployment constraints (Vercel serverless) and Duffel auth strategy. AI provided options; human chose based on security analysis.
- sessionStorage vs. localStorage: Decision based on booking flow expectations (tab isolation for competitive bookings); AI provided matrix, human chose context-appropriately.

**Error messaging**:
- "Offer expired. Search for new flights." vs. generic error—human-written copy, AI provided error code mapping.

---

## 4. Setup Instructions

For environment setup, dependency installation, and local development:

**See [README.md](./README.md) for complete setup instructions.**

Key commands:
```bash
npm install          # Install dependencies
npm run dev          # Start Next.js dev server
npm run build        # Build for production
npm run lint         # Run ESLint
```

Environment variables required:
```
NEXT_PUBLIC_DUFFEL_API_KEY=<your-duffel-api-key>
```

---

## Appendix: File Structure

```
src/
├── app/
│   ├── [locale]/
│   │   ├── page.tsx (Search)
│   │   ├── results/page.tsx
│   │   ├── passengers/page.tsx
│   │   ├── confirmation/[orderId]/page.tsx
│   │   ├── api/
│   │   │   ├── places/route.ts
│   │   │   └── flights/offers/route.ts
│   │   └── layout.tsx
│   ├── page.tsx (shell)
│   ├── globals.css
│   └── layout.tsx (root layout)
├── actions/
│   └── flights.ts (Server Actions: searchFlights, getOffer, createOrder)
├── components/
│   ├── search/ (SearchForm, AirportCombobox, DateRangePicker, etc.)
│   ├── results/ (FlightCard, FilterPanel, ResultsList, etc.)
│   ├── passengers/ (PassengerForm, BookingSummary, etc.)
│   ├── confirmation/ (ConfirmationCard, ErrorCard)
│   ├── shared/ (NavBar, ProgressStepper, RequireOfferRequest, etc.)
│   └── ui/ (shadcn/ui: Button, Input, Select, Calendar, etc.)
├── lib/
│   ├── duffel.ts (duffelFetch wrapper, DuffelError class)
│   ├── store.ts (Zustand store + persist middleware)
│   ├── types/
│   │   └── duffel.ts (Offer, Passenger, Order, etc.)
│   ├── animations/ (motion tokens, variants, hooks)
│   ├── hooks/ (useFilteredOffers, useHydrated, etc.)
│   ├── utils.ts (classNameMerger, cn(), etc.)
│   └── destinations.ts (Popular destinations data)
├── i18n/
│   ├── en.json
│   ├── ms.json
│   └── zh.json
└── navigation.ts (i18n routing config)
```

---

**Document Version**: 1.0
**Last Updated**: 2026-03-20
**Assessment Deliverable**: Yes
