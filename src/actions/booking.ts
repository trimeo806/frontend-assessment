"use server"
import { duffelFetch, DuffelError } from "@/lib/duffel"
import type { DuffelSingleResponse, DuffelOrder } from "@/lib/types/duffel"
import type { ActionResult } from "@/lib/types/actions"

interface PassengerInput {
  id:          string
  title:       string
  given_name:  string
  family_name: string
  born_on:     string
  gender:      string
  email:       string
  phone:       string
  identity_document?: {
    type:                 string
    number:               string
    issuing_country_code: string
    expires_on:           string
    unique_identifier?:   string
  }
}

interface CreateOrderParams {
  offerId:       string
  passengers:    PassengerInput[]
  totalAmount:   string
  totalCurrency: string
}

export async function createOrder(
  params: CreateOrderParams
): Promise<ActionResult<{ orderId: string }>> {
  const payload = {
    data: {
      type:            "instant",
      selected_offers: [params.offerId],
      payments: [{
        type:     "balance",
        currency: params.totalCurrency,
        amount:   params.totalAmount,
      }],
      passengers: params.passengers.map((pax) => ({
        id:           pax.id,
        given_name:   pax.given_name,
        family_name:  pax.family_name,
        born_on:      pax.born_on,
        title:        pax.title,
        gender:       pax.gender,
        email:        pax.email,
        phone_number: pax.phone,
        ...(pax.identity_document ? { identity_documents: [pax.identity_document] } : {}),
      })),
    },
  }

  try {
    const res = await duffelFetch<DuffelSingleResponse<DuffelOrder>>(
      "/air/orders",
      { method: "POST", body: payload }
    )
    return {
      success: true,
      data: { orderId: res.data.id },
    }
  } catch (err) {
    if (err instanceof DuffelError) {
      const code = err.error.code
      if (code === "offer_expired" || code === "offer_no_longer_available") {
        return { success: false, error: "Your session expired. Please search again.", code }
      }
      if (code === "price_changed") {
        return { success: false, error: "The price changed. Please review and confirm.", code }
      }
      if (code === "invalid_passenger_name") {
        return { success: false, error: "Check passenger name — no special characters allowed.", code }
      }
      return { success: false, error: err.message, code }
    }
    return { success: false, error: "Booking failed. Please try again." }
  }
}
