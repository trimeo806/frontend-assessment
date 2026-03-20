// ─── API ─────────────────────────────────────────────────────────────────────

export const DUFFEL_API_BASE_URL = "https://api.duffel.com"
export const DUFFEL_API_VERSION  = "v2"

// ─── Duffel cabin class ───────────────────────────────────────────────────────

export const CABIN_CLASS = {
  ECONOMY:         "economy",
  PREMIUM_ECONOMY: "premium_economy",
  BUSINESS:        "business",
  FIRST:           "first",
} as const
export type CabinClass = typeof CABIN_CLASS[keyof typeof CABIN_CLASS]

// ─── Trip type ────────────────────────────────────────────────────────────────

export const TRIP_TYPE = {
  ONE_WAY:    "one_way",
  ROUND_TRIP: "round_trip",
} as const
export type TripType = typeof TRIP_TYPE[keyof typeof TRIP_TYPE]

// ─── Routes ───────────────────────────────────────────────────────────────────

export const ROUTES = {
  HOME:         "/",
  RESULTS:      "/results",
  PASSENGERS:   "/passengers",
  CONFIRMATION: "/confirmation",
} as const

// ─── Results / Pagination ─────────────────────────────────────────────────────

export const RESULTS_PAGE_SIZE            = 20
export const INFINITE_SCROLL_ROOT_MARGIN  = "200px"

// ─── Filter — stop options ────────────────────────────────────────────────────

export const STOP_FILTER = {
  ALL:    "all",
  DIRECT: "direct",
  ONE:    "1stop",
  TWO_PLUS: "2plus",
} as const
export type StopFilter = typeof STOP_FILTER[keyof typeof STOP_FILTER]

// ─── Filter — departure time windows (start hour inclusive, end hour inclusive) ─

export const DEPARTURE_TIME_ALL       = [0,  23] as [number, number]
export const DEPARTURE_TIME_MORNING   = [6,  12] as [number, number]
export const DEPARTURE_TIME_AFTERNOON = [12, 18] as [number, number]
export const DEPARTURE_TIME_EVENING   = [18, 23] as [number, number]
export const DEPARTURE_TIME_NIGHT     = [0,   6] as [number, number]

// ─── Filter — default price range ────────────────────────────────────────────

export const DEFAULT_PRICE_RANGE = [0, 9999] as [number, number]

// ─── Sort options ─────────────────────────────────────────────────────────────

export const SORT_BY = {
  TOTAL_AMOUNT:    "total_amount",
  TOTAL_DURATION:  "total_duration",
  DEPARTURE_TIME:  "departure_time",
} as const
export type SortBy = typeof SORT_BY[keyof typeof SORT_BY]

// ─── Store ────────────────────────────────────────────────────────────────────

export const FLIGHT_STORE_KEY = "flight-store"

// ─── Popular Destinations ─────────────────────────────────────────────────────

export const POPULAR_DESTINATIONS_COUNT              = 5
export const POPULAR_DESTINATIONS_REVALIDATE_SECONDS = 3_600   // 1 hour
export const POPULAR_DESTINATIONS_CHECK_ORIGIN       = "LHR"
export const POPULAR_DESTINATIONS_DAYS_AHEAD         = 30
export const POPULAR_DESTINATIONS_CHECK_CABIN        = CABIN_CLASS.ECONOMY

// ─── Events ───────────────────────────────────────────────────────────────────

export const EVENT_PREFILL_DESTINATION = "skybook:prefill-destination"
