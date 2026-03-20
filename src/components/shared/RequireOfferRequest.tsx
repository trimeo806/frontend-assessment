"use client"
import { useEffect } from "react"
import { useRouter } from "@/navigation"
import { useFlightStore } from "@/lib/store"
import { useHydrated } from "@/lib/hooks/useHydrated"

export function RequireOfferRequest({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const offerRequestId = useFlightStore((s) => s.offerRequestId)
  const hydrated = useHydrated()

  useEffect(() => {
    if (hydrated && !offerRequestId) router.replace("/")
  }, [hydrated, offerRequestId, router])

  if (!hydrated || !offerRequestId) return null
  return <>{children}</>
}
