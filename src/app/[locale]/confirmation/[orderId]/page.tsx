import { ConfirmationCard } from "@/components/confirmation/ConfirmationCard"
import { ErrorCard } from "@/components/confirmation/ErrorCard"
import { ProgressStepper } from "@/components/shared/ProgressStepper"
import { duffelFetch } from "@/lib/duffel"
import type { DuffelSingleResponse, DuffelOrder } from "@/lib/types/duffel"

export async function generateMetadata({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params
  return { title: `Booking ${orderId} \u2014 SkyBook` }
}

export default async function ConfirmationPage({
  params,
}: {
  params: Promise<{ orderId: string }>
}) {
  const { orderId } = await params

  let order: DuffelOrder | null = null
  let fetchError: string | null = null

  try {
    const res = await duffelFetch<DuffelSingleResponse<DuffelOrder>>(`/air/orders/${orderId}`)
    order = res.data
  } catch (e: unknown) {
    fetchError = e instanceof Error ? e.message : "Unknown error"
  }

  return (
    <div className="flex flex-col bg-secondary">
      <main className="flex-1 mx-auto w-full max-w-300 px-4 py-8">
        <div className="mb-6 rounded-xl bg-primary px-4 py-3 flex justify-center shadow-sm">
          <ProgressStepper step={4} />
        </div>
        {order ? (
          <ConfirmationCard order={order} />
        ) : (
          <ErrorCard message={fetchError ?? undefined} />
        )}
      </main>
    </div>
  )
}
