import { duffelFetch } from "@/lib/duffel"
import type { DuffelListResponse, DuffelOffer } from "@/lib/types/duffel"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const orq    = searchParams.get("orq")
  const limit  = searchParams.get("limit")  ?? "50"
  const sort   = searchParams.get("sort")   ?? "total_amount"
  const after  = searchParams.get("after")

  if (!orq) {
    return Response.json({ error: "orq is required" }, { status: 400 })
  }

  const params = new URLSearchParams({
    offer_request_id: orq,
    limit,
    sort,
    ...(after ? { after } : {}),
  })

  try {
    const res = await duffelFetch<DuffelListResponse<DuffelOffer>>(
      `/air/offers?${params}`
    )
    return Response.json(res)
  } catch (err: unknown) {
    const status = (err as { status?: number })?.status ?? 500
    return Response.json({ error: "Failed to load offers" }, { status })
  }
}
