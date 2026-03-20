import { duffelFetch } from "@/lib/duffel"
import type { DuffelListResponse, DuffelPlace } from "@/lib/types/duffel"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const query = searchParams.get("query") ?? ""

  if (query.length < 2) {
    return Response.json([])
  }

  try {
    const res = await duffelFetch<DuffelListResponse<DuffelPlace>>(
      `/places/suggestions?query=${encodeURIComponent(query)}`,
      { method: "GET" }
    )
    const places = res.data.filter((p) => p.type === "airport")
    return Response.json(places)
  } catch (err) {
    console.error("[places/suggestions]", err)
    return Response.json([], { status: 500 })
  }
}
