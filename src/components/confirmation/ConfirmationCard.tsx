"use client"
import { useTranslations } from "next-intl"
import { useRouter } from "@/navigation"
import { format } from "date-fns"
import { CheckCircle2, Search } from "lucide-react"
import { m } from "motion/react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { AirlineLogo } from "@/components/shared/AirlineLogo"
import { StopBadge } from "@/components/shared/StopBadge"
import { parseDuration } from "@/lib/utils"
import { useFlightStore } from "@/lib/store"
import { usePrefersReducedMotion } from "@/lib/animations/hooks"
import type { DuffelOrder } from "@/lib/types/duffel"
import { ROUTES } from "@/lib/constants"

interface Props { order: DuffelOrder }

export function ConfirmationCard({ order }: Props) {
  const t = useTranslations("confirmation")
  const router = useRouter()
  const resetAll = useFlightStore((s) => s.resetAll)
  const reduced = usePrefersReducedMotion()

  const handleSearchAgain = () => {
    resetAll()
    router.push(ROUTES.HOME)
  }

  return (
    <m.div
      className="bg-white rounded-xl border border-border p-6 max-w-2xl mx-auto"
      initial={{ opacity: 0, scale: reduced ? 1 : 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      {/* Success header */}
      <div className="flex flex-col items-center gap-3 mb-6 text-center">
        <m.div
          initial={{ scale: reduced ? 1 : 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={reduced
            ? { duration: 0.01 }
            : { type: "spring", stiffness: 400, damping: 18, delay: 0.2 }}
        >
          <CheckCircle2 className="h-14 w-14 text-success" />
        </m.div>
        <div>
          <h1 className="text-2xl font-bold text-secondary-foreground">{t("confirmed")}</h1>
          <p className="text-muted-foreground mt-1">
            {t("reference")}: <span className="font-bold text-secondary-foreground">{order.booking_reference}</span>
          </p>
        </div>
      </div>

      <Separator className="mb-6" />

      {/* Flight summary */}
      {order.slices.map((slice, i) => {
        const first = slice.segments[0]
        const last = slice.segments[slice.segments.length - 1]
        return (
          <div key={slice.id} className={i > 0 ? "mt-4 pt-4 border-t border-border" : ""}>
            <p className="text-xs text-muted-foreground mb-2">
              {i === 0 ? t("outbound") : t("returnFlight")}
            </p>
            <div className="flex items-center gap-4">
              <AirlineLogo iata={first.operating_carrier.iata_code} url={first.operating_carrier.logo_symbol_url} name={first.operating_carrier.name} />
              <div className="flex-1">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-lg font-bold">{format(new Date(first.departing_at), "HH:mm")}</p>
                    <p className="text-xs text-muted-foreground">{first.origin.iata_code}</p>
                  </div>
                  <div className="flex-1 text-center">
                    <p className="text-xs text-muted-foreground">{parseDuration(slice.duration)}</p>
                    <div className="h-px bg-border my-1" />
                    <StopBadge stops={slice.segments.length - 1} className="text-xs" />
                  </div>
                  <div>
                    <p className="text-lg font-bold">{format(new Date(last.arriving_at), "HH:mm")}</p>
                    <p className="text-xs text-muted-foreground">{last.destination.iata_code}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      })}

      <Separator className="my-6" />

      {/* Passengers */}
      <div>
        <p className="text-sm font-semibold mb-3">{t("passengers")}</p>
        <div className="space-y-2">
          {order.passengers.map((p) => (
            <div key={p.id} className="flex items-center justify-between text-sm">
              <span>{p.title ? p.title.charAt(0).toUpperCase() + p.title.slice(1) + " " : ""}{p.given_name} {p.family_name}</span>
              <span className="text-muted-foreground capitalize">{p.type?.replace("_without_seat", "")}</span>
            </div>
          ))}
        </div>
      </div>

      <Separator className="my-6" />

      {/* Price breakdown */}
      <div className="space-y-2 text-sm">
        <div className="flex justify-between text-muted-foreground">
          <span>{t("baseFare")}</span>
          <span>{order.total_currency} {parseFloat(order.base_amount ?? order.total_amount).toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>{t("taxes")}</span>
          <span>{order.total_currency} {parseFloat(order.tax_amount ?? "0").toFixed(2)}</span>
        </div>
        <Separator />
        <div className="flex justify-between font-bold text-base">
          <span>{t("totalPaid")}</span>
          <span>{order.total_currency} {parseFloat(order.total_amount).toFixed(2)}</span>
        </div>
      </div>

      <div className="mt-6 flex justify-center">
        <Button
          onClick={handleSearchAgain}
          className="gap-2 bg-primary hover:bg-primary/90 text-white"
        >
          <Search className="h-4 w-4" />
          {t("searchAgain")}
        </Button>
      </div>
    </m.div>
  )
}
