"use client"
import { useTransition } from "react"
import { useTranslations } from "next-intl"
import { useRouter } from "@/navigation"
import { format } from "date-fns"
import { toast } from "sonner"
import { Loader2, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AirlineLogo } from "@/components/shared/AirlineLogo"
import { StopBadge } from "@/components/shared/StopBadge"
import { getOffer } from "@/actions/offers"
import { useFlightStore } from "@/lib/store"
import { parseDuration } from "@/lib/utils"
import type { DuffelOffer } from "@/lib/types/duffel"
import { ROUTES } from "@/lib/constants"

interface Props { offer: DuffelOffer }

export function FlightCard({ offer }: Props) {
  const t = useTranslations("results")
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const setSelectedOffer = useFlightStore((s) => s.setSelectedOffer)

  const handleSelect = () => {
    startTransition(async () => {
      const result = await getOffer(offer.id)
      if (!result.success) {
        toast.error(result.error)
        return
      }
      setSelectedOffer(result.data)
      router.push(ROUTES.PASSENGERS)
    })
  }

  const paxCount = offer.passengers.length
  const perPersonAmount = (parseFloat(offer.total_amount) / paxCount).toFixed(2)

  return (
    <div className="bg-white rounded-xl border border-border p-4 hover:shadow-md transition-shadow">
      {offer.slices.map((slice, i) => {
        const first = slice.segments[0]
        const last = slice.segments[slice.segments.length - 1]
        const stops = slice.segments.length - 1

        return (
          <div key={slice.id} className={`${i > 0 ? "mt-3 pt-3 border-t border-border" : ""}`}>
            {/* Airline logo + route row */}
            <div className="flex items-center gap-3 sm:gap-4">
              {/* Airline logo */}
              <div className="w-8 sm:w-10 shrink-0">
                {i === 0 && (
                  <AirlineLogo
                    iata={offer.owner.iata_code}
                    url={offer.owner.logo_symbol_url}
                    name={offer.owner.name}
                  />
                )}
              </div>

              {/* Route + times */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="text-center">
                    <p className="text-base sm:text-lg font-bold leading-none">
                      {format(new Date(first.departing_at), "HH:mm")}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">{first.origin.iata_code}</p>
                  </div>
                  <div className="flex-1 flex flex-col items-center min-w-0">
                    <p className="text-xs text-muted-foreground">{parseDuration(slice.duration)}</p>
                    <div className="w-full flex items-center gap-1 my-1">
                      <div className="h-px flex-1 bg-border" />
                      <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
                    </div>
                    <StopBadge stops={stops} />
                  </div>
                  <div className="text-center">
                    <p className="text-base sm:text-lg font-bold leading-none">
                      {format(new Date(last.arriving_at), "HH:mm")}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">{last.destination.iata_code}</p>
                  </div>
                </div>
              </div>

              {/* Price + CTA desktop (sm+) */}
              {i === 0 && (
                <div className="hidden sm:flex flex-col items-end text-right shrink-0 ml-2">
                  <p className="text-2xl font-bold text-secondary-foreground">
                    {offer.total_currency} {perPersonAmount}
                  </p>
                  <p className="text-xs text-muted-foreground mb-2">{t("perPerson")}</p>
                  <Button
                    onClick={handleSelect}
                    disabled={isPending}
                    className="bg-primary hover:bg-primary/90 text-white h-9 px-4"
                  >
                    {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : t("select")}
                  </Button>
                </div>
              )}
            </div>

            {/* Price + CTA mobile (below route, only on first slice) */}
            {i === 0 && (
              <div className="flex sm:hidden items-center justify-between mt-3 pt-3 border-t border-border">
                <div>
                  <p className="text-xl font-bold text-secondary-foreground">
                    {offer.total_currency} {perPersonAmount}
                  </p>
                  <p className="text-xs text-muted-foreground">{t("perPerson")}</p>
                </div>
                <Button
                  onClick={handleSelect}
                  disabled={isPending}
                  className="bg-primary hover:bg-primary/90 text-white h-9 px-4"
                >
                  {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : t("select")}
                </Button>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
