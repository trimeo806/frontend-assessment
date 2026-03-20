"use client"
import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import type { SearchFormValues } from "@/lib/types/forms"
import type { DuffelOffer } from "@/lib/types/duffel"
import {
  FLIGHT_STORE_KEY,
  DEFAULT_PRICE_RANGE,
  DEPARTURE_TIME_ALL,
  STOP_FILTER,
  SORT_BY,
} from "@/lib/constants"

interface Filters {
  stops:         "all" | "direct" | "1stop" | "2plus"
  airlines:      string[]
  departureTime: [number, number]
  priceRange:    [number, number]
}

interface FlightStore {
  // ── Persisted ──────────────────────────────────────
  search:         SearchFormValues | null
  offerRequestId: string | null
  passengerIds:   string[]
  selectedOffer:  DuffelOffer | null
  orderId:        string | null

  // ── Session only (not persisted) ───────────────────
  filters: Filters
  sortBy:  typeof SORT_BY[keyof typeof SORT_BY]

  // ── Actions ────────────────────────────────────────
  setSearch:        (params: SearchFormValues) => void
  setOfferRequest:  (id: string, passengerIds: string[]) => void
  setSelectedOffer: (offer: DuffelOffer) => void
  setOrderId:       (id: string) => void
  setFilter:        (filter: Partial<Filters>) => void
  setSortBy:        (sort: FlightStore["sortBy"]) => void
  resetForNewSearch: () => void
  resetAll:          () => void
}

const defaultFilters: Filters = {
  stops:         STOP_FILTER.ALL,
  airlines:      [],
  departureTime: DEPARTURE_TIME_ALL,
  priceRange:    DEFAULT_PRICE_RANGE,
}

export const useFlightStore = create<FlightStore>()(
  persist(
    (set) => ({
      // Initial state
      search: null,
      offerRequestId: null,
      passengerIds: [],
      selectedOffer: null,
      orderId: null,
      filters: defaultFilters,
      sortBy: SORT_BY.TOTAL_AMOUNT,

      // Actions
      setSearch: (params) => set({ search: params }),
      setOfferRequest: (id, passengerIds) => set({ offerRequestId: id, passengerIds }),
      setSelectedOffer: (offer) => set({ selectedOffer: offer }),
      setOrderId: (id) => set({ orderId: id }),
      setFilter: (filter) => set((s) => ({ filters: { ...s.filters, ...filter } })),
      setSortBy: (sort) => set({ sortBy: sort }),
      resetForNewSearch: () =>
        set({ selectedOffer: null, orderId: null, filters: defaultFilters, sortBy: SORT_BY.TOTAL_AMOUNT }),
      resetAll: () =>
        set({
          search: null, offerRequestId: null, passengerIds: [], selectedOffer: null,
          orderId: null, filters: defaultFilters, sortBy: SORT_BY.TOTAL_AMOUNT,
        }),
    }),
    {
      name: FLIGHT_STORE_KEY,
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? sessionStorage : localStorage
      ),
      partialize: (state) => ({
        search: state.search,
        offerRequestId: state.offerRequestId,
        passengerIds: state.passengerIds,
        selectedOffer: state.selectedOffer,
        orderId: state.orderId,
      }),
    }
  )
)
