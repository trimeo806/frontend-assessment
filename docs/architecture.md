# Architecture — SkyBook Flight Booking

**Stack**: Next.js 16 App Router · React 19 · TypeScript · Tailwind CSS v4 · shadcn/ui · Zustand
**Deployment**: Vercel · **API**: Duffel REST v2

---

## Diagrams

### 1 — System Architecture

Who lives where, and what calls what. The `DUFFEL_API_KEY` only exists in the server layer.

```mermaid
graph TB
    subgraph BROWSER["Browser — client bundle, no secrets"]
        CC["Client Components\nSearchForm · ResultsList\nPassengerForm · route guards"]
        ZS[("Zustand\nsessionStorage\nofferRequestId · passengerIds\nselectedOffer · orderId")]
        CC <-->|reads / writes| ZS
    end

    subgraph SERVER["Next.js / Vercel — server, holds DUFFEL_API_KEY"]
        SA["Server Actions\nsearchFlights() · getOffer() · createOrder()"]
        RH["Route Handlers\n/api/places · /api/flights/offers"]
        SC["Server Component\nconfirmation/[orderId]/page.tsx"]
    end

    subgraph DUFFEL["Duffel API — api.duffel.com · Duffel-Version: v2"]
        D_RH["GET /places/suggestions\nGET /air/offers"]
        D_SA["POST /air/offer_requests\nGET /air/offers/{id}\nPOST /air/orders\nGET /air/orders/{id}"]
    end

    CC -->|mutations| SA
    CC -->|"fetch /api/..."| RH
    SA -->|"Bearer DUFFEL_API_KEY"| D_SA
    RH -->|"Bearer DUFFEL_API_KEY"| D_RH
    SC -->|"Bearer DUFFEL_API_KEY"| D_SA
```

---

### 2 — Booking Flow (step by step)

Every user action, API call, payload, response, and what gets stored.

**Overview:**

```mermaid
sequenceDiagram
    actor U as User
    participant F1 as F1 Search
    participant F2 as F2 Results
    participant F3 as F3 Passengers
    participant F4 as F4 Confirmation
    participant Z as Zustand
    participant D as Duffel API

    U->>F1: Enter route, dates, passengers
    F1->>D: POST /air/offer_requests
    D-->>F1: offerRequestId, passengerIds[]
    F1->>Z: save offerRequestId, passengerIds
    F1-->>F2: navigate /results?orq=...

    F2->>D: GET /air/offers (Route Handler proxy)
    D-->>F2: paginated offers[]
    U->>F2: Select a flight
    F2->>D: GET /air/offers/{id} (Server Action)
    D-->>F2: full offer + expires_at
    F2->>Z: save selectedOffer
    F2-->>F3: navigate /passengers

    U->>F3: Fill passenger details
    F3->>D: POST /air/orders (Server Action)
    D-->>F3: orderId, booking_reference
    F3->>Z: save orderId
    F3-->>F4: navigate /confirmation/{orderId}

    F4->>D: GET /air/orders/{orderId}
    D-->>F4: full order details
    F4-->>U: Booking confirmed
```

**Detailed breakdown — request and response specifics:**

```mermaid
sequenceDiagram
    actor U as User
    participant App
    participant Z as Zustand
    participant RH as Route Handler
    participant SA as Server Action
    participant D as Duffel API

    rect rgb(239, 246, 255)
        Note over U,D: F1 — SEARCH (Client Component + Server Action)
        U->>App: type airport e.g. KUL
        App->>RH: GET /api/places?query=KUL
        RH->>D: GET /places/suggestions?query=KUL&types=airport
        D-->>App: array of airports — iata_code, name, city_name
        Note over App: Combobox shows options, user selects origin and destination
        U->>App: click Search flights
        App->>SA: searchFlights()
        SA->>D: POST /air/offer_requests?return_offers=false
        Note right of D: cabin_class · slices with origin+destination+date · passengers with type
        D-->>SA: id=orq_xxx · passengers with ids pas_aaa and pas_bbb
        SA-->>Z: offerRequestId=orq_xxx · passengerIds=pas_aaa,pas_bbb
        Note over Z: ⚠️ passengerIds must be reused verbatim in POST /air/orders
        App-->>App: navigate /results?orq=orq_xxx
    end

    rect rgb(240, 253, 244)
        Note over U,D: F2 — RESULTS (Client Component + Route Handler)
        App->>RH: GET /api/flights/offers?offer_request_id=orq_xxx&limit=20&sort=total_amount
        RH->>D: GET /air/offers — proxied, DUFFEL_API_KEY stays server-side
        D-->>App: data array of offers with id, total_amount, total_currency, expires_at, owner, slices · meta.after=g2EC cursor
        Note over App: useMemo filtering, no re-fetch: stops=segments.length-1 · airline=owner.iata_code · time=departing_at.getHours · price=parseFloat
        U->>App: click Load more
        App->>RH: GET /api/flights/offers?...&after=g2EC
        D-->>App: next 20 offers appended to list
        U->>App: click a flight card
        App->>SA: getOffer(offerId)
        SA->>D: GET /air/offers/offerId
        D-->>SA: full offer with identity_docs_required=false and expires_at timestamp
        SA-->>Z: selectedOffer with id, total_amount, total_currency, slices
        App-->>App: navigate /passengers
    end

    rect rgb(255, 247, 237)
        Note over U,D: F3 — PASSENGER DETAILS (Client Component — no API call)
        App->>Z: read selectedOffer.passengers.length and passengerIds
        Note over App: Per-passenger: title · given_name · family_name · born_on past date · gender
        Note over App: Lead passenger only: email · phone_number in E.164 e.g. +60123456789
        Note over App: identity_documents only if passenger_identity_documents_required=true
        U->>App: submit Confirm Booking
        App->>SA: createOrder(passengers)
        SA->>D: POST /air/orders
        Note right of D: type=instant · selected_offers · payments with balance+currency+amount · passengers with id+name+born_on+title+gender+email+phone
        D-->>SA: id=ord_xxx · booking_reference=ABCDEF · status=confirmed
        SA-->>Z: orderId=ord_xxx
        App-->>App: navigate /confirmation/ord_xxx
    end

    rect rgb(253, 244, 255)
        Note over U,D: F4 — BOOKING CONFIRMATION (Server Action + Server Component)
        App->>D: GET /air/orders/ord_xxx — direct server-side fetch, no hydration needed
        D-->>App: booking_reference · status · slices · passengers · total_amount
        App-->>U: booking reference · itinerary · passenger list · price breakdown
        Note over App,D: offer_expired → Session expired. Please search again.
        Note over App,D: price_changed → re-fetch offer, show new price, ask user to confirm
        Note over App,D: invalid_passenger_name → return to F3 with field highlighted
    end
```

---

### 3 — Zustand Store: What Each Screen Reads and Writes

```mermaid
graph LR
    subgraph STORE["Zustand Store — sessionStorage, per tab"]
        direction TB
        s["search{}"]
        ori["offerRequestId"]
        pid["passengerIds[]"]
        so["selectedOffer"]
        oid["orderId"]
        fi["filters{}"]
        sb["sortBy"]
    end

    F1["F1 Search"] -->|writes| s & ori & pid
    ori -->|reads| F2["F2 Results"]
    F2 -->|writes| so & fi & sb
    pid -->|reads| F3["F3 Passengers"]
    so -->|reads| F3
    so -->|reads| F4["F4 Confirmation"]
    pid -->|reads| F4
    F4 -->|writes| oid
```

---

### 4 — Component Tree (per screen)

```mermaid
graph TD
    subgraph S1["F1 — Search  ·  page.tsx RSC"]
        SearchForm["SearchForm Client"] --> TripTypePills & AirportCombobox["AirportCombobox\ndebounce 300ms"] & SwapButton & DateRangePicker & PassengerSelector["PassengerSelector\nadults · children · infants"]
    end

    subgraph S2["F2 — Results  ·  page.tsx RSC"]
        ResultsList["ResultsList Client"] --> StickyHeader & SortBar & FlightCard["FlightCard × N\nairline · times · stops · price"] & FCS["FlightCardSkeleton × 3"] & EmptyState
        ResultsList --> FilterPanel["FilterPanel ≥lg\nStops · Airlines · Time · Price"] & FilterSheet["FilterSheet mobile\nsame filters, drawer"]
    end

    subgraph S3["F3 — Passengers  ·  page.tsx RSC"]
        PassengerForm["PassengerForm Client"] --> OfferExpiryGuard & BookingSummary["BookingSummary sticky"]
        PassengerForm --> PassengerCard["PassengerCard × N"] --> DateOfBirthPicker & PassportFields["Passport fields\nconditional"]
    end

    subgraph S4["F4 — Confirmation  ·  Server RSC"]
        ConfirmationCard
        ErrorCard
    end

    SHARED(["Shared every screen\nNavBar · ProgressStepper · LocaleSwitcher"])
    GUARDS(["Route Guards\nRequireOfferRequest → /results needs offerRequestId\nRequireSelectedOffer → /passengers needs selectedOffer"])
```

---

## 1. Library Selection Rationale

Every dependency was chosen deliberately. This table documents the decision:

| Layer | Chosen | Rejected | Why chosen |
|-------|--------|----------|------------|
| **Framework** | Next.js 16 App Router | CRA, Vite+React | Required by assessment; App Router gives Server Components + Server Actions in one framework |
| **State** | Zustand v5 | Redux Toolkit, Jotai, Context | ~2KB bundle vs ~25KB Redux; single-store pattern suits a 4-screen linear flow; `persist` middleware built-in |
| **Forms** | React Hook Form + Zod | Formik, plain state | Uncontrolled forms = no re-render per keystroke; Zod schemas serve double duty (runtime validation + static types) |
| **UI** | shadcn/ui (Radix + Tailwind) | MUI, Chakra, Ant Design | Copy-paste ownership — no vendor lock-in; Radix provides combobox ARIA, focus management, keyboard navigation out of the box |
| **Styling** | Tailwind CSS v4 | CSS Modules, styled-components | Zero runtime; CSS-custom-property theming; pairs naturally with shadcn/ui |
| **Animation** | Framer Motion (`motion/react` v12) | CSS transitions only | Needed for list stagger + offer expiry guard; `LazyMotion` + `domAnimation` bundle keeps it ~7–9KB |
| **i18n** | next-intl | next-i18next, react-intl | Built specifically for App Router; server + client hooks; clean JSON message files |
| **Duffel access** | Raw `fetch` + custom wrapper | `@duffel/api` SDK | SDK is ~50KB; raw `fetch` wrapper is ~1KB; each call is readable without abstraction |
| **Data fetching** | Route Handlers + Server Actions | TanStack Query, SWR | Mutations need server-side auth (Server Actions); results need client-side filtering (Route Handlers proxy); TQ's client cache isn't needed |

**Why NOT TanStack Query**: Initially planned, but Server Actions eliminated the need. When mutations go through Server Actions, TQ's `useMutation` is redundant — you already have a typed server-side RPC call. For results, client-side filtering in a Zustand-driven `useMemo` replaces the need for TQ's cache entirely.

**Why NOT Duffel SDK**: The `@duffel/api` SDK adds ~50KB and wraps calls in SDK-specific abstractions that obscure error handling. A 30-line `duffelFetch<T>()` generic wrapper is transparent, debuggable, and produces zero bundle weight on the client.

---

## 2. Routing & Locale Strategy

**Decision**: `app/[locale]/` directory structure with next-intl.

**Why**:
- App Router enables Server Components, Server Actions, and streaming — critical for a fast booking flow.
- `[locale]` segment creates clean URLs (`/en/results`, `/ms/passengers`) without query parameters.
- next-intl chosen over next-i18next: built for App Router, simple JSON message files, no middleware overhead.
- Locale extracted from URL first, then request headers as fallback — confirmation pages are shareable as locale-specific deep links.

**Route structure**:
```
app/
├── [locale]/
│   ├── page.tsx                        ← F1: Search
│   ├── results/page.tsx                ← F2: Results
│   ├── passengers/page.tsx             ← F3: Passenger Details
│   ├── confirmation/[orderId]/page.tsx ← F4: Confirmation (Server Component)
│   └── layout.tsx
├── api/
│   ├── places/route.ts                 ← Airport autocomplete proxy
│   └── flights/offers/route.ts         ← Offers listing proxy
└── page.tsx (root redirect)
```

---

## 3. Rendering Strategy

**Decision**: Server Components for static screens and data fetching; Client Components for interactive filtering, sorting, and form handling.

| Screen | Strategy | Rationale |
|--------|----------|-----------|
| Search `/` | RSC layout + Client form | Form needs interactivity (combobox, date picker, live validation). Page shell is static. |
| Results `/results` | Hybrid | Server layout + Client `ResultsList`. Filtering/sorting require instant feedback without page reload. |
| Passengers `/passengers` | Client | Multi-field form with React Hook Form + real-time Zod validation. Requires full client context. |
| Confirmation `/confirmation/[orderId]` | Server Component | Async fetch at render time. No interactivity needed. Enables deep-link and page refresh. |

**Data fetching per operation**:

| Operation | Method | Why |
|-----------|--------|-----|
| Search (POST offer_request) | Server Action | Duffel token stays on server. Type-safe RPC. No client exposure. |
| Get single offer | Server Action | Auth token required; one-time fetch; result stored in Zustand. |
| List offers (GET air/offers) | Route Handler + client fetch | Client-side filter/sort needs the raw data without page reload. Proxy keeps token server-side. |
| Create booking (POST orders) | Server Action | Sensitive mutation — must be server-only. |
| Fetch confirmation | Server Component | Async RSC fetch — no hydration mismatch. Order already exists in Duffel. |

---

## 4. State Management

**Decision**: Zustand with `persist` middleware stored in `sessionStorage`.

**Store shape** (`lib/store.ts`):
```typescript
type BookingStore = {
  // Persisted — survives page reload, dies at tab close
  search: SearchInput | null;
  offerRequestId: string | null;   // ← from POST /air/offer_requests
  passengerIds: string[];           // ← MUST use verbatim in POST /air/orders
  selectedOffer: DuffelOffer | null;
  orderId: string | null;

  // Session-only — transient UI state
  filters: FilterState;
  sortBy: SortOption;
};
```

**Why sessionStorage, not localStorage**:
- **Tab isolation**: Multiple booking tabs get their own session. No cross-tab state pollution when comparing prices.
- **Security**: Passenger data (name, email, phone) dies when the tab closes — not persisted to disk.
- **UX**: Mobile users expect a fresh booking when they reopen the app; sessionStorage respects that expectation.

---

## 5. Server Actions for Mutations

**Decision**: Server Actions for all mutations; API Route Handlers only for client-side data fetching.

```
src/actions/
├── search.ts   → searchFlights()  → POST /air/offer_requests
├── offers.ts   → getOffer()       → GET  /air/offers/{id}
└── booking.ts  → createOrder()    → POST /air/orders
```

**Why Server Actions over API routes for mutations**:
- Duffel API key never leaves the server — no token in browser bundle or localStorage.
- Type-safe RPC: argument and return types are shared between client and server TypeScript.
- No accidental public endpoint exposure: Server Actions are implicitly server-scoped.

---

## 6. No Duffel SDK — Raw Fetch

**Custom wrapper** (`lib/duffel.ts`, marked `'server only'`):
```typescript
async function duffelFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`https://api.duffel.com${endpoint}`, {
    headers: {
      Authorization: `Bearer ${process.env.DUFFEL_API_KEY}`,
      'Duffel-Version': 'v2',
      'Content-Type': 'application/json',
    },
    ...options,
  });
  if (!res.ok) {
    const { errors } = await res.json();
    throw new DuffelError(errors[0]);
  }
  return res.json();
}
```

| Factor | SDK | Raw Fetch |
|--------|-----|-----------|
| Bundle | ~50KB | ~1KB |
| Readability | Abstracted | Call-by-call, explicit |
| API version | Tied to SDK release | `Duffel-Version` header in code |
| Error handling | SDK exceptions | Custom `DuffelError` class |

---

## 7. Route Guards — useHydrated Pattern

**Problem**: Zustand rehydrates from `sessionStorage` only after client-side mount. On the server, `offerRequestId` is always `undefined` — a naive redirect guard would always redirect during SSR.

**Solution**: `useHydrated()` hook defers the guard until after client hydration.

```typescript
// components/shared/RequireOfferRequest.tsx
export function RequireOfferRequest({ children }: { children: ReactNode }) {
  const { offerRequestId } = useBookingStore();
  const hydrated = useHydrated();

  if (!hydrated) return <SkeletonLayout />;  // Wait — don't redirect yet
  if (!offerRequestId) redirect('/');         // Now safe to check
  return children;
}
```

**Applied to**:
- `/results` → requires `offerRequestId` (user must have submitted a search)
- `/passengers` → requires `selectedOffer` (user must have selected a flight)

---

## Appendix: Full File Structure

```
src/
├── app/
│   ├── [locale]/
│   │   ├── page.tsx                        ← F1: Search
│   │   ├── results/page.tsx                ← F2: Results
│   │   ├── passengers/page.tsx             ← F3: Passengers
│   │   ├── confirmation/[orderId]/page.tsx ← F4: Confirmation
│   │   ├── api/
│   │   │   ├── places/route.ts
│   │   │   └── flights/offers/route.ts
│   │   └── layout.tsx
│   └── page.tsx
├── actions/
│   ├── search.ts
│   ├── offers.ts
│   └── booking.ts
├── components/
│   ├── search/     (SearchForm, AirportCombobox, DateRangePicker, PassengerSelector, TripTypePills, SwapButton, PopularDestinationsGrid)
│   ├── results/    (ResultsList, FlightCard, FlightCardSkeleton, FilterPanel, FilterSheet, SortBar, StickyHeader, EmptyState, hooks/useFilteredOffers)
│   ├── passengers/ (PassengerForm, PassengerCard, DateOfBirthPicker, BookingSummary, OfferExpiryGuard)
│   ├── confirmation/ (ConfirmationCard, ErrorCard)
│   ├── shared/     (NavBar, ProgressStepper, RequireOfferRequest, RequireSelectedOffer, AirlineLogo, StopBadge, LocaleSwitcher)
│   └── ui/         (shadcn/ui — Button, Input, Calendar, Combobox, Accordion, Sheet, Popover, Slider, ...)
├── lib/
│   ├── duffel.ts       ← duffelFetch<T> + DuffelError
│   ├── store.ts        ← Zustand store
│   ├── types/
│   │   ├── duffel.ts   ← DuffelOffer, DuffelSlice, DuffelSegment, DuffelOrder
│   │   ├── forms.ts    ← Zod schemas
│   │   └── actions.ts  ← ActionResult<T>
│   ├── hooks/useHydrated.ts
│   └── animations/     (tokens, variants, hooks)
├── messages/
│   ├── en.json
│   ├── ms.json
│   └── zh.json
└── navigation.ts
```

---

## Related Documents

| Document | Relationship |
| --- | --- |
| [docs/workflow.md](./workflow.md) | The 10-phase process that produced these decisions — Phase 6 (Architecture Gate) is where this document was locked |
| [docs/ai-tools.md](./ai-tools.md) | How AI helped with specific architectural calls: Server Actions vs Route Handlers, `useHydrated()`, sessionStorage vs localStorage |
| [docs/competitive-research.md](./competitive-research.md) | The design system tokens (colors, spacing, component sizes) were sourced from the 7-OTA competitor analysis |
| [plans/…/00-architecture.md](../plans/260315-1200-flight-booking-app/frontend/implementation-plans/00-architecture.md) | The original pre-implementation planning artifact that this document was built from |
| [README.md](../README.md) | Project setup, feature list, and deployment guide |
