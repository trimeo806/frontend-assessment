"use client"
import { useTranslations } from "next-intl"
import { useFlightStore } from "@/lib/store"
import { useRouter } from "@/navigation"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { Edit2 } from "lucide-react"

export function StickyHeader() {
  const t = useTranslations("results")
  const router = useRouter()
  const search = useFlightStore((s) => s.search)

  if (!search) return null

  const summary = [
    `${search.origin.iata} \u2192 ${search.destination.iata}`,
    format(new Date(search.departDate), "d MMM"),
    search.returnDate ? `\u2192 ${format(new Date(search.returnDate), "d MMM")}` : "",
    `${search.passengers.reduce((s, p) => s + p.count, 0)} ${t("pax")}`,
    search.cabinClass,
  ].filter(Boolean).join(" \u00b7 ")

  return (
    <div className="sticky top-0 z-10 bg-primary px-4 py-2 flex items-center justify-between gap-4">
      <p className="text-white text-base truncate">{summary}</p>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push("/")}
        className="text-white hover:bg-white/20 shrink-0 gap-1 rounded-full"
      >
        <Edit2 className="h-3.5 w-3.5" />
        {t("modify")}
      </Button>
    </div>
  )
}
