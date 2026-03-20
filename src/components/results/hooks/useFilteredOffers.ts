"use client"
import { useMemo } from "react"
import { useFlightStore } from "@/lib/store"
import { SORT_BY, STOP_FILTER } from "@/lib/constants"
import type { DuffelOffer } from "@/lib/types/duffel"

// Parse ISO 8601 duration "PT2H30M" to milliseconds
function parseDurationMs(iso: string): number {
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?/)
  if (!m) return 0
  return ((parseInt(m[1] ?? "0") * 60) + parseInt(m[2] ?? "0")) * 60_000
}

export function useFilteredOffers(offers: DuffelOffer[]) {
  const { filters, sortBy } = useFlightStore()

  return useMemo(() => {
    let result = [...offers]

    // Stops
    if (filters.stops !== STOP_FILTER.ALL) {
      result = result.filter((o) => {
        const stops = o.slices[0].segments.length - 1
        if (filters.stops === STOP_FILTER.DIRECT) return stops === 0
        if (filters.stops === STOP_FILTER.ONE)    return stops === 1
        if (filters.stops === STOP_FILTER.TWO_PLUS) return stops >= 2
        return true
      })
    }

    // Airlines
    if (filters.airlines.length > 0) {
      result = result.filter((o) => filters.airlines.includes(o.owner.iata_code))
    }

    // Price range
    result = result.filter((o) => {
      const price = parseFloat(o.total_amount)
      return price >= filters.priceRange[0] && price <= filters.priceRange[1]
    })

    // Departure time (hour window on outbound first segment)
    result = result.filter((o) => {
      const dep = new Date(o.slices[0].segments[0].departing_at)
      const hour = dep.getHours()
      return hour >= filters.departureTime[0] && hour <= filters.departureTime[1]
    })

    // Sort
    result.sort((a, b) => {
      if (sortBy === SORT_BY.TOTAL_AMOUNT) {
        return parseFloat(a.total_amount) - parseFloat(b.total_amount)
      }
      if (sortBy === SORT_BY.TOTAL_DURATION) {
        const durA = a.slices.reduce((s, sl) => s + parseDurationMs(sl.duration), 0)
        const durB = b.slices.reduce((s, sl) => s + parseDurationMs(sl.duration), 0)
        return durA - durB
      }
      if (sortBy === SORT_BY.DEPARTURE_TIME) {
        const timeA = new Date(a.slices[0].segments[0].departing_at).getTime()
        const timeB = new Date(b.slices[0].segments[0].departing_at).getTime()
        return timeA - timeB
      }
      return 0
    })

    return result
  }, [offers, filters, sortBy])
}
