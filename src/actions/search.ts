"use server"
import { duffelFetch, DuffelError } from "@/lib/duffel"
import type { DuffelSingleResponse } from "@/lib/types/duffel"
import type { ActionResult } from "@/lib/types/actions"

interface SearchFormValues {
  origin: { iata: string; name: string; city: string }
  destination: { iata: string; name: string; city: string }
  departDate: string
  returnDate?: string
  tripType: "one_way" | "round_trip" | "multi_city"
  cabinClass: "economy" | "premium_economy" | "business" | "first"
  passengers: { type: "adult" | "child" | "infant_without_seat"; count: number }[]
}

interface OfferRequest {
  id: string
  passengers: { id: string; type: string }[]
}

export async function searchFlights(
  params: SearchFormValues
): Promise<ActionResult<{ offerRequestId: string; passengerIds: string[] }>> {
  const slices = [
    {
      origin:         params.origin.iata,
      destination:    params.destination.iata,
      departure_date: params.departDate,
    },
    ...(params.tripType === "round_trip" && params.returnDate
      ? [{
          origin:         params.destination.iata,
          destination:    params.origin.iata,
          departure_date: params.returnDate,
        }]
      : []),
  ]

  const passengers = params.passengers.flatMap(({ type, count }) =>
    Array.from({ length: count }, () => ({ type }))
  )

  try {
    const res = await duffelFetch<DuffelSingleResponse<OfferRequest>>(
      "/air/offer_requests?return_offers=false",
      {
        method: "POST",
        body: {
          data: {
            cabin_class: params.cabinClass,
            slices,
            passengers,
          },
        },
      }
    )

    return {
      success: true,
      data: {
        offerRequestId: res.data.id,
        passengerIds:   res.data.passengers.map((p) => p.id),
      },
    }
  } catch (err) {
    if (err instanceof DuffelError) {
      return { success: false, error: err.message, code: err.error.code }
    }
    return { success: false, error: "Search failed. Please try again." }
  }
}
