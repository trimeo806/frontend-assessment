# Gap Resolution Plan — Flight Booking App
**Date**: 2026-03-20 | **Base**: plans/260315-1200-flight-booking-app

## Audit Correction

The previous audit was overly pessimistic. After direct file verification:

**Already implemented (not gaps):**
- Root layout providers (LazyMotion, TooltipProvider, Toaster, Inter) — in `[locale]/layout.tsx` ✅
- `ActionResult` type, `getOffer` action, `createOrder` action ✅
- Confirmation page — fully fetches + renders order data ✅
- API routes (`/api/places`, `/api/flights/offers`) — both complete ✅
- `BookingSummary` wired in passengers page (`hidden lg:block`) ✅
- Animation tokens, variants, hooks (`usePrefersReducedMotion`) ✅
- `useHydrated` hook — in `lib/hooks/useHydrated.ts` ✅
- Search page — hero, footer, popular destinations all present ✅
- Round-trip, route guards, Zustand persistence ✅

---

## Real Remaining Gaps

| # | Gap | Impact | Effort |
|---|-----|--------|--------|
| G1 | Passport/identity fields missing from passenger form | High — booking fails if offer requires docs | Medium 2hr |
| G2 | Phone validation: `min(7)` only, Duffel requires E.164 (`+...`) | High — API rejects invalid format | Small 30min |
| G3 | Mobile sticky booking bar on `/passengers` (no `lg:hidden` equivalent) | Medium — mobile UX gap | Small 1hr |
| G4 | `generateMetadata` missing on search + results pages | Low — SEO metadata | Tiny 15min |
| G5 | `.env.example` missing at repo root | Medium — setup friction | Tiny 10min |
| G6 | `README.md` is default create-next-app boilerplate | High — assessment deliverable | Small 45min |
| G7 | `ARCHITECTURE.md` missing — required by assessment | Critical — graded deliverable | Large 3-4hr |

**Total effort: ~8–9 hours**

---

## Phases

### Phase 1 — Passenger Form Completeness
**Agent**: `frontend-developer` | **Skills**: `react-expert`, `typescript-pro`

**Scope**:
1. Add conditional `identity_document` fields to `singlePassengerSchema` in `src/lib/types/forms.ts`:
   - Show when `selectedOffer.passenger_identity_documents_required === true`
   - Fields: `type` (`passport`), `number`, `issuing_country_code` (ISO 3166-1 alpha-2), `expires_on`, `unique_identifier`
   - Zod: `expires_on` must be future date, `issuing_country_code` 2 chars uppercase
2. Tighten phone validation: `z.string().regex(/^\+\d{7,15}$/, "Use format +601234567890")`
3. Add identity document section to `PassengerCard.tsx` (conditional render, reuse `Controller`)
4. Extend `PassengerInput` in `src/actions/booking.ts` to accept optional `identity_documents` array and pass it to Duffel payload

**Files**: `src/lib/types/forms.ts`, `src/components/passengers/PassengerCard.tsx`, `src/actions/booking.ts`

---

### Phase 2 — Mobile Booking Bar + Metadata
**Agent**: `frontend-developer` | **Skills**: `react-expert`, `nextjs-developer`, `ui-styling`

**Scope**:
1. Create `src/components/passengers/MobileBookingBar.tsx` — sticky bottom bar (`lg:hidden`):
   - Shows selected offer total price + currency
   - "Book Now" submit button (triggers PassengerForm submit)
   - Reads from `useFlightStore` (`selectedOffer`)
2. Add bar to `src/app/[locale]/passengers/page.tsx` below the main content
3. Add `generateMetadata` to `src/app/[locale]/page.tsx` (search): `title: "SkyBook — Find Cheap Flights"`
4. Add `generateMetadata` to `src/app/[locale]/results/page.tsx`

**Files**: `src/components/passengers/MobileBookingBar.tsx` (new), `src/app/[locale]/passengers/page.tsx`, `src/app/[locale]/page.tsx`, `src/app/[locale]/results/page.tsx`

---

### Phase 3 — Setup Documentation
**Agent**: `docs-manager` | **Skills**: `docs`

**Scope**:
1. Create `.env.example` at repo root:
   ```
   DUFFEL_API_KEY=duffel_test_...
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```
2. Rewrite `README.md`:
   - Project description (SkyBook flight booking with Duffel API)
   - Prerequisites (Node 20+, Duffel test account)
   - Setup: `cp .env.example .env.local` → add key → `npm install` → `npm run dev`
   - Live URL section (Vercel)
   - Link to `ARCHITECTURE.md`

**Files**: `.env.example` (new), `README.md`

---

### Phase 4 — Architecture Documentation
**Agent**: `docs-manager` | **Skills**: `docs`, `architecture-designer`

**Scope**: Write `ARCHITECTURE.md` covering all 4 assessment doc requirements:
1. **Architecture decisions** — component structure, Zustand state, SSR+CSR hybrid, Server Actions pattern, route guards
2. **Competitor analysis** — Trip.com, Booking.com, AirAsia, Expedia UX patterns; what was adopted/avoided
3. **AI tools** — which tools used, how, where helped most
4. **Setup** — defer to README.md (cross-link)

**Files**: `ARCHITECTURE.md` (new at repo root)

---

## Agents & Skills

| Phase | Agent | Skills |
|-------|-------|--------|
| P1 — Passenger form completeness | `frontend-developer` | `react-expert`, `typescript-pro` |
| P2 — Mobile bar + metadata | `frontend-developer` | `react-expert`, `nextjs-developer`, `ui-styling` |
| P3 — Setup docs | `docs-manager` | `docs` |
| P4 — Architecture docs | `docs-manager` | `docs`, `architecture-designer` |

**Parallelism**: P1 + P2 can run concurrently (non-overlapping files). P3 + P4 can run concurrently. P3/P4 independent of P1/P2.

---

## Acceptance Criteria

- [ ] Booking succeeds when `passenger_identity_documents_required = true`
- [ ] Phone `+60123456789` passes validation; `0123456789` fails
- [ ] Mobile viewport shows sticky price bar on `/passengers`
- [ ] All 4 pages have title metadata
- [ ] `cp .env.example .env.local && npm run dev` works for new developer
- [ ] `ARCHITECTURE.md` addresses all 4 assessment documentation requirements
- [ ] End-to-end flow: search → select → fill passengers → confirm booking
