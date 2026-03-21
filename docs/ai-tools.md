# AI Tools & Development Process — SkyBook

> The assessment explicitly welcomes AI tools: *"The use of AI tools is welcome — document which tools you used and how."*
> This document is a transparent and specific account of that usage.

> **Want to understand the internal kit structure?** See [docs/ai-kit.md](./ai-kit.md) for a full breakdown of every agent and skill used — what each one does, how skills differ from agents, and the concrete outputs each produced during this project.

---

## 1. Tools Used

| Tool | Role | Usage Level |
|------|------|-------------|
| **Claude Code** (claude-sonnet-4-6) | Primary development assistant — architecture, code generation, debugging, review | Heavy |
| **tri_ai_kit** multi-agent system | Structured orchestration layer that routes tasks to specialized Claude agents | Heavy |

---

## 2. Development Environment: tri_ai_kit

### What It Is

tri_ai_kit is a custom multi-agent orchestration system built on Claude Code. Instead of one general-purpose AI conversation, it routes each task to a specialized agent that loads platform-specific skills for that domain.

### How It Works

```
User prompt
    │
    ▼
Intent classification
(build / fix / plan / review / test / research)
    │
    ▼
Agent dispatch + skill loading
(react-expert, typescript-pro, api-designer, ...)
    │
    ▼
Specialized output merged back to main context
```

### Why This Mattered

A normal AI conversation tends to drift — the context fills up, responses become generic, and architectural decisions made in hour 1 get forgotten by hour 4. tri_ai_kit addresses this by:

- **Keeping agents focused**: A `frontend-developer` agent generating a PassengerCard component doesn't carry the context of the Duffel API exploration or the competitor research — it has a clean slate focused on the task.
- **Enforcing an architecture gate**: The `frontend-architect` agent must review and approve the component hierarchy before any implementation agent begins. This caught structural issues (e.g., the rendering strategy per page) before they became expensive to fix.
- **Systematic quality gates**: A `code-reviewer` agent runs after implementation — it doesn't have the implementation agent's blind spots because it's a fresh context with a different set of instructions.

This is why the AI assistance on this project was unusually structured and produced consistent code conventions across 40+ components.

### Agents Used

| Agent | Phase | Responsibility |
|-------|-------|----------------|
| `planner` | Research & Planning | Decomposed assessment requirements into phases; structured implementation plan files |
| `researcher` | Research | Duffel API documentation; library version compatibility; competitor feature verification |
| `frontend-architect` | Architecture Gate | Component hierarchy review; rendering strategy (Server vs Client); state management decisions |
| `frontend-developer` | Implementation | All component code, Server Actions, Route Handlers, i18n wiring |
| `code-reviewer` | Post-implementation | TypeScript correctness audit; accessibility review; code quality gates |
| `debugger` | Bug fixing | Root cause analysis for hydration mismatch, Duffel API edge cases, build errors |

---

## 3. Where AI Helped Most

### Boilerplate-Heavy Work (~60% of AI assistance)

This is where AI assistance was most valuable — not replacing judgment, but eliminating repetitive work.

**Zod validation schemas for passenger forms**

Each passenger type (adult, child, infant) has slightly different validation rules. Writing and maintaining these schemas manually would have been error-prone:

```typescript
// AI-generated, human-reviewed
const passengerSchema = z.object({
  title: z.enum(['mr', 'ms', 'mrs', 'miss', 'dr']),
  given_name: z.string().min(1, 'Required').regex(/^[a-zA-Z\s\-']+$/, 'No special characters'),
  family_name: z.string().min(1, 'Required').regex(/^[a-zA-Z\s\-']+$/, 'No special characters'),
  born_on: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(d => new Date(d) < new Date(), 'Must be past date'),
  email: z.string().email('Invalid email'),
  phone_number: z.string().regex(/^\+\d{7,15}$/, 'Must be E.164 format: +60123456789'),
});
```

**Duffel TypeScript type definitions**

Rather than hand-writing types from the API documentation, AI generated types directly from live API responses, then I verified them against the Duffel docs:

```typescript
interface DuffelOffer {
  id: string;
  total_amount: string;    // String, NOT number — "47.17"
  total_currency: string;  // "EUR"
  expires_at: string;      // ISO 8601 — show countdown in UI
  passenger_identity_documents_required: boolean;
  owner: DuffelCarrier;
  slices: DuffelSlice[];
  passengers: OfferPassenger[];
  // ...
}
```

**i18n message files**

Generating consistent JSON key structures across three locale files (`en.json`, `ms.json`, `zh.json`) with matching namespaces:

```json
{
  "search": {
    "origin": "From",
    "destination": "To",
    "departure": "Departure",
    "passengers": "Passengers"
  }
}
```

**Route Handlers with consistent error handling**

```typescript
// AI-generated boilerplate, human added business logic
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('query') ?? '';
    if (query.length < 2) return Response.json({ data: [] });
    const data = await duffelFetch<DuffelPlaceResponse>(`/places/suggestions?query=${query}&types[]=airport`);
    return Response.json(data);
  } catch (err) {
    if (err instanceof DuffelError) return Response.json({ error: err.message }, { status: err.status });
    return Response.json({ error: 'Internal error' }, { status: 500 });
  }
}
```

---

### Edge-Case Handling (~25% of AI assistance)

These were the non-obvious implementation problems that AI helped surface and solve:

**Offer expiry countdown and redirect**

The Duffel `expires_at` field means an offer becomes invalid after ~30 minutes. AI helped design the `OfferExpiryGuard` component that polls the expiry time and shows an `AlertDialog` redirect:

```typescript
// Discovered need during API research: offers expire in ~30 min
// AI designed the countdown pattern; human decided the UX (alert vs silent redirect)
useEffect(() => {
  const remaining = new Date(offer.expires_at).getTime() - Date.now();
  if (remaining <= 0) { onExpired(); return; }
  const timer = setTimeout(onExpired, remaining);
  return () => clearTimeout(timer);
}, [offer.expires_at]);
```

**`return_offers=false` for offer requests**

Discovered through live API testing: a round-trip offer request returns **1,638 offers inline** by default — too large a payload for the browser. AI helped identify the `return_offers=false` parameter that returns only the `orq_` ID, then allows paginated fetching:

```
POST /air/offer_requests?return_offers=false
→ returns: { id: "orq_xxx", passengers: [...] }
← then: GET /air/offers?offer_request_id=orq_xxx&limit=20
```

**Price changed error handling**

When `POST /air/orders` returns `price_changed`, the offer price has moved since the user selected it. AI designed the error recovery flow — re-fetch the offer, show the new price, require explicit re-confirmation:

```typescript
if (err.code === 'price_changed') {
  const refreshed = await getOffer(offerId);
  setOffer(refreshed);
  toast.error(`Price updated to ${refreshed.total_amount} ${refreshed.total_currency}. Please confirm.`);
}
```

**Hydration mismatch in route guards**

On the server, `sessionStorage` doesn't exist — Zustand's persisted state is always `null` during SSR. A naive route guard would always redirect. AI proposed and implemented the `useHydrated()` pattern:

```typescript
export function useHydrated() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return hydrated;
}
// Usage: if (!hydrated) return <Skeleton />  ← wait for client rehydration
```

**passengerIds must survive to booking**

A non-obvious Duffel API constraint: the `passenger.id` values from `POST /air/offer_requests` (e.g., `"pas_0000B4NPfY7Rjtyzn8v5k0"`) must be used verbatim in `POST /air/orders`. They cannot be fabricated. AI flagged this from the API docs and ensured they were persisted in Zustand's `passengerIds[]`.

---

### Type Safety (~10% of AI assistance)

**`ActionResult<T>` discriminated union**

AI designed a consistent return type for all Server Actions that prevents uncaught errors at the call site:

```typescript
type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; code?: string };

// Caller is forced to handle both branches
const result = await searchFlights(params);
if (!result.success) {
  toast.error(result.error);
  return;
}
setOfferRequest(result.data.offerRequestId);
```

**Generic `duffelFetch<T>`**

```typescript
// Type inference flows through: duffelFetch<DuffelOffer> infers return type
const offer = await duffelFetch<{ data: DuffelOffer }>(`/air/offers/${offerId}`);
```

---

### Performance (~5% of AI assistance)

- `useFilteredOffers` hook: AI suggested `useMemo` with a dependency array of `[offers, filters, sortBy]` to prevent re-running the filter pipeline on every unrelated render.
- `LazyMotion` + `domAnimation`: AI flagged that importing `motion/react` without `LazyMotion` loads the full animation bundle; wrapping in `LazyMotion` + using `domAnimation` reduced the animation bundle from ~35KB to ~9KB.
- Airport combobox: AI added 300ms debounce to limit Duffel Places API calls while the user is still typing.

---

## 4. Where Human Judgment Was Applied

AI generated options; human made the final call in each of these cases.

**UX decisions**

| Decision | What AI provided | What human decided |
|----------|-----------------|-------------------|
| Filter panel placement | Comparison of sidebar vs. bottom vs. drawer | Sidebar (desktop) + Sheet (mobile) — based on Kayak usability research finding |
| Round-trip card layout | Stacked vs. side-by-side options | Stacking — users think in "trip pairs"; side-by-side too wide on mobile |
| sessionStorage vs localStorage | Pros/cons matrix | sessionStorage — tab isolation for competitive price-checking; passenger data shouldn't persist |
| Dropping TanStack Query | Note that it was in initial research | Cut it — Server Actions made client-side mutation management redundant |

**Competitor analysis synthesis**

Manually visiting and interacting with 7 OTAs was done by the developer, not AI. AI helped organize findings into structured tables; the developer synthesized them into design decisions and the adopt/avoid list. The decision to avoid dark patterns was an ethical call, not a pattern-matching output.

**Architecture trade-offs**

- **Server Actions vs. API routes**: AI presented options; human chose based on security analysis of Vercel's serverless deployment model and the need to protect the Duffel API key.
- **Skyscanner as primary reference**: AI listed reference options; human selected Skyscanner based on feature completeness verification (all 4 required screens present) and design quality assessment.

**Error message copy**

Every user-facing error message was written by the developer, not AI. AI provided the error code mapping (`offer_expired`, `price_changed`, `invalid_passenger_name`); developer wrote the plain-language copy that a traveler would understand.

---

## Related Documents

| Document | Relationship |
| --- | --- |
| [docs/ai-kit.md](./ai-kit.md) | Deeper breakdown of every agent and skill used — what each one specifically produced, with the agent interaction map |
| [docs/workflow.md](./workflow.md) | The 10-phase process — shows which agent ran in which phase and what it contributed |
| [docs/architecture.md](./architecture.md) | The architectural output that the AI-assisted planning process produced |
| [plans/260315-1200-flight-booking-app/](../plans/260315-1200-flight-booking-app/) | The planning artefacts that agents produced — research reports, implementation plans, and the architecture gate document |
