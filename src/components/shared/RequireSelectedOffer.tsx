"use client"
import { useEffect } from "react"
import { useRouter } from "@/navigation"
import { useFlightStore } from "@/lib/store"
import { useHydrated } from "@/lib/hooks/useHydrated"

export function RequireSelectedOffer({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const selectedOffer = useFlightStore((s) => s.selectedOffer)
  const hydrated = useHydrated()

  useEffect(() => {
    if (hydrated && !selectedOffer) router.replace("/")
  }, [hydrated, selectedOffer, router])

  if (!hydrated || !selectedOffer) return null
  return <>{children}</>
}
