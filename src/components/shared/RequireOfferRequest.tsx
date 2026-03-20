"use client"
import { useEffect } from "react"
import { useRouter } from "@/navigation"
import { useFlightStore } from "@/lib/store"
import { useHydrated } from "@/lib/hooks/useHydrated"
import { ROUTES } from "@/lib/constants"
import { Loader2 } from "lucide-react"

export function RequireOfferRequest({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const offerRequestId = useFlightStore((s) => s.offerRequestId)
  const hydrated = useHydrated()

  useEffect(() => {
    if (hydrated && !offerRequestId) router.replace(ROUTES.HOME)
  }, [hydrated, offerRequestId, router])

  if (!hydrated) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }
  if (!offerRequestId) return null
  return <>{children}</>
}
