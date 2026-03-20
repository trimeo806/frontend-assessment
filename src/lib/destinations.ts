import "server-only"
import { unstable_cache } from "next/cache"
import { duffelFetch } from "@/lib/duffel"
import {
  POPULAR_DESTINATIONS_COUNT,
  POPULAR_DESTINATIONS_REVALIDATE_SECONDS,
  POPULAR_DESTINATIONS_CHECK_ORIGIN,
  POPULAR_DESTINATIONS_DAYS_AHEAD,
  POPULAR_DESTINATIONS_CHECK_CABIN,
} from "@/lib/constants"
import type { DuffelListResponse, DuffelSingleResponse, DuffelCity } from "@/lib/types/duffel"

export interface PopularDestination {
  id: string
  city: string
  iata: string
  flag: string
  price: string | null
  currency: string | null
}

function countryFlag(code: string): string {
  return code
    .toUpperCase()
    .split("")
    .map((c) => String.fromCodePoint(c.charCodeAt(0) + 127397))
    .join("")
}

function departureDateIn(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

async function cheapestPrice(
  destinationIata: string
): Promise<{ amount: string; currency: string } | null> {
  try {
    const orq = await duffelFetch<DuffelSingleResponse<{ id: string }>>(
      "/air/offer_requests?return_offers=false",
      {
        method: "POST",
        body: {
          data: {
            cabin_class: POPULAR_DESTINATIONS_CHECK_CABIN,
            slices: [
              {
                origin: POPULAR_DESTINATIONS_CHECK_ORIGIN,
                destination: destinationIata,
                departure_date: departureDateIn(POPULAR_DESTINATIONS_DAYS_AHEAD),
              },
            ],
            passengers: [{ type: "adult" }],
          },
        },
      }
    )

    const offers = await duffelFetch<
      DuffelListResponse<{ total_amount: string; total_currency: string }>
    >(`/air/offers?offer_request_id=${orq.data.id}&sort=total_amount&limit=1`)

    const cheapest = offers.data[0]
    if (!cheapest) return null
    return { amount: cheapest.total_amount, currency: cheapest.total_currency }
  } catch {
    return null
  }
}

async function fetchPopularDestinations(): Promise<PopularDestination[]> {
  const citiesRes = await duffelFetch<DuffelListResponse<DuffelCity>>(
    `/air/cities?limit=${POPULAR_DESTINATIONS_COUNT}`
  )

  const results = await Promise.allSettled(
    citiesRes.data.map(async (city) => {
      const airport = city.airports?.[0]
      const pricing = airport ? await cheapestPrice(airport.iata_code) : null

      return {
        id: city.id,
        city: city.name,
        iata: city.iata_city_code,
        flag: countryFlag(city.iata_country_code),
        price: pricing?.amount ?? null,
        currency: pricing?.currency ?? null,
      } satisfies PopularDestination
    })
  )

  return results
    .filter(
      (r): r is PromiseFulfilledResult<PopularDestination> =>
        r.status === "fulfilled"
    )
    .map((r) => r.value)
}

export const getPopularDestinations = unstable_cache(
  fetchPopularDestinations,
  ["popular-destinations"],
  { revalidate: POPULAR_DESTINATIONS_REVALIDATE_SECONDS }
)
