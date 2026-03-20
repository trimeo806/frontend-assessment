"use client"
import { m } from "motion/react"
import { useTranslations } from "next-intl"
import { usePrefersReducedMotion } from "@/lib/animations/hooks"
import { stagger, duration, ease } from "@/lib/animations/tokens"
import type { PopularDestination } from "@/lib/destinations"
import { EVENT_PREFILL_DESTINATION } from "@/lib/constants"

export function dispatchPrefillDestination(dest: { iata: string; name: string; city: string }) {
  window.dispatchEvent(new CustomEvent(EVENT_PREFILL_DESTINATION, { detail: dest }))
  const el = document.getElementById("search-form")
  if (el) el.scrollIntoView({ behavior: "smooth", block: "center" })
  else window.scrollTo({ top: 0, behavior: "smooth" })
}

const gridVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: stagger.fast, delayChildren: 0.15 },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: duration.base, ease: ease.out } },
}

interface Props { destinations: PopularDestination[] }

export function PopularDestinationsGrid({ destinations }: Props) {
  const t = useTranslations("popularDestinations")
  const reduced = usePrefersReducedMotion()

  if (reduced) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {destinations.map((dest) => (
          <DestCard key={dest.id} dest={dest} t={t} />
        ))}
      </div>
    )
  }

  return (
    <m.div
      variants={gridVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4"
    >
      {destinations.map((dest) => (
        <m.div key={dest.id} variants={cardVariants}>
          <DestCard dest={dest} t={t} />
        </m.div>
      ))}
    </m.div>
  )
}

function DestCard({ dest, t }: { dest: PopularDestination; t: ReturnType<typeof useTranslations> }) {
  const handleClick = () => {
    dispatchPrefillDestination({ iata: dest.iata, name: dest.city, city: dest.city })
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") handleClick() }}
      className="bg-white rounded-xl border border-border p-5 hover:shadow-md hover:border-primary/40 transition-all cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      <div className="text-3xl mb-3">{dest.flag}</div>
      <div className="font-semibold text-secondary-foreground text-lg">{dest.city}</div>
      <div className="text-sm text-muted-foreground mb-2">{dest.iata}</div>
      {dest.price != null ? (
        <div className="text-primary font-bold text-sm">
          {t("from")} {new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: dest.currency ?? "USD",
            maximumFractionDigits: 0,
          }).format(parseFloat(dest.price))}
        </div>
      ) : (
        <div className="text-muted-foreground text-sm">—</div>
      )}
    </div>
  )
}
