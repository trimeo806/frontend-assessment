import "server-only"
import { duffelFetch } from "@/lib/duffel"
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
            cabin_class: "economy",
            slices: [
              {
                origin: "LHR",
                destination: destinationIata,
                departure_date: departureDateIn(30),
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

export async function getPopularDestinations(): Promise<PopularDestination[]> {
  const citiesRes = await duffelFetch<DuffelListResponse<DuffelCity>>(
    "/air/cities?limit=5"
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
