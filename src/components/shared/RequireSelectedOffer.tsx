"use client"
import { useEffect } from "react"
import { useRouter } from "@/navigation"
import { useFlightStore } from "@/lib/store"
import { useHydrated } from "@/lib/hooks/useHydrated"
import { ROUTES } from "@/lib/constants"
import { Loader2 } from "lucide-react"

export function RequireSelectedOffer({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const selectedOffer = useFlightStore((s) => s.selectedOffer)
  const hydrated = useHydrated()

  useEffect(() => {
    if (hydrated && !selectedOffer) router.replace(ROUTES.HOME)
  }, [hydrated, selectedOffer, router])

  if (!hydrated) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }
  if (!selectedOffer) return null
  return <>{children}</>
}
