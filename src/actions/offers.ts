"use server"
import { duffelFetch, DuffelError } from "@/lib/duffel"
import type { DuffelSingleResponse, DuffelOffer } from "@/lib/types/duffel"
import type { ActionResult } from "@/lib/types/actions"

export async function getOffer(
  offerId: string
): Promise<ActionResult<DuffelOffer>> {
  try {
    const res = await duffelFetch<DuffelSingleResponse<DuffelOffer>>(
      `/air/offers/${offerId}`
    )
    return { success: true, data: res.data }
  } catch (err) {
    if (err instanceof DuffelError) {
      return { success: false, error: err.message, code: err.error.code }
    }
    return { success: false, error: "Could not load flight details." }
  }
}
