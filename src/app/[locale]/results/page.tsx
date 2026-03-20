import type { Metadata } from "next"
import { RequireOfferRequest } from "@/components/shared/RequireOfferRequest"
import { ResultsList } from "@/components/results/ResultsList"

export const metadata: Metadata = { title: "Search Results \u2014 SkyBook" }

export default async function ResultsPage({
  searchParams,
}: {
  searchParams: Promise<{ orq?: string }>
}) {
  const { orq } = await searchParams
  const offerRequestId = orq ?? ""

  return (
    <div className="flex flex-col bg-secondary min-h-screen">
      <RequireOfferRequest>
        <ResultsList offerRequestId={offerRequestId} />
      </RequireOfferRequest>
    </div>
  )
}
