"use client"
import { useTranslations } from "next-intl"
import { useFlightStore } from "@/lib/store"
import { useRouter } from "@/navigation"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { Plane, Calendar, Users, Edit2 } from "lucide-react"
import { ROUTES } from "@/lib/constants"

export function StickyHeader() {
  const t = useTranslations("results")
  const router = useRouter()
  const search = useFlightStore((s) => s.search)

  if (!search) return null

  const paxCount = search.passengers.reduce((s, p) => s + p.count, 0)
  const dateStr = format(new Date(search.departDate), "d MMM") +
    (search.returnDate ? ` — ${format(new Date(search.returnDate), "d MMM")}` : "")

  return (
    <div className="sticky top-0 z-10 bg-white border-b border-border shadow-sm">
      <div className="mx-auto max-w-220 px-4 py-2 flex items-center gap-3">
        {/* Inline input-style summary (Skyscanner style) */}
        <button
          onClick={() => router.push(ROUTES.HOME)}
          className="flex-1 min-w-0 h-10 flex items-center gap-2.5 px-3.5 rounded-lg border border-input bg-white hover:border-primary transition-colors overflow-hidden"
        >
          <Plane className="h-4 w-4 text-primary shrink-0" />
          <span className="text-sm font-semibold text-secondary-foreground shrink-0">
            {search.origin.iata} → {search.destination.iata}
          </span>
          <span className="text-muted-foreground shrink-0">·</span>
          <span className="flex items-center gap-1 text-sm shrink-0">
            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
            <span>{dateStr}</span>
          </span>
          <span className="text-muted-foreground shrink-0">·</span>
          <span className="flex items-center gap-1 text-sm text-muted-foreground shrink-0">
            <Users className="h-3.5 w-3.5" />
            {paxCount} {t("pax")} · {search.cabinClass}
          </span>
        </button>

        <Button
          size="sm"
          onClick={() => router.push(ROUTES.HOME)}
          className="shrink-0 gap-1 rounded-full bg-primary hover:bg-primary/90 text-white"
        >
          <Edit2 className="h-3.5 w-3.5" />
          {t("modify")}
        </Button>
      </div>
    </div>
  )
}
