"use client"
import { useTranslations } from "next-intl"
import { m } from "motion/react"
import { useFlightStore } from "@/lib/store"
import { format } from "date-fns"
import { parseDuration } from "@/lib/utils"
import { AirlineLogo } from "@/components/shared/AirlineLogo"
import { Separator } from "@/components/ui/separator"

export function BookingSummary() {
  const t = useTranslations("passengers")
  const offer = useFlightStore((s) => s.selectedOffer)
  if (!offer) return null

  const slice = offer.slices[0]
  const first = slice.segments[0]
  const last = slice.segments[slice.segments.length - 1]

  return (
    <m.aside
      className="w-80 shrink-0 bg-white rounded-xl border border-border p-4 h-fit sticky top-24"
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, ease: "easeOut", delay: 0.15 }}
    >
      <p className="font-semibold text-base mb-4">{t("bookingSummary")}</p>

      <div className="flex items-center gap-3 mb-4">
        <AirlineLogo iata={offer.owner.iata_code} url={offer.owner.logo_symbol_url} name={offer.owner.name} />
        <div>
          <p className="text-sm font-medium">{offer.owner.name}</p>
          <p className="text-xs text-muted-foreground">{first.origin.iata_code} &rarr; {last.destination.iata_code}</p>
        </div>
      </div>

      <div className="text-sm space-y-1 text-secondary-foreground">
        <div className="flex justify-between">
          <span className="text-muted-foreground">{t("departure")}</span>
          <span>{format(new Date(first.departing_at), "d MMM, HH:mm")}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">{t("arrival")}</span>
          <span>{format(new Date(last.arriving_at), "d MMM, HH:mm")}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">{t("duration")}</span>
          <span>{parseDuration(slice.duration)}</span>
        </div>
      </div>

      <Separator className="my-4" />

      <div className="space-y-1 text-sm">
        <div className="flex justify-between text-muted-foreground">
          <span>{t("baseFare")}</span>
          <span>{offer.total_currency} {parseFloat(offer.base_amount ?? offer.total_amount).toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>{t("taxes")}</span>
          <span>{offer.total_currency} {parseFloat(offer.tax_amount ?? "0").toFixed(2)}</span>
        </div>
      </div>
      <Separator className="my-3" />
      <div className="flex justify-between font-bold text-base">
        <span>{t("total")}</span>
        <span>{offer.total_currency} {parseFloat(offer.total_amount).toFixed(2)}</span>
      </div>
    </m.aside>
  )
}
