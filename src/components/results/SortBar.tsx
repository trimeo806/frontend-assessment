"use client"
import { useTranslations } from "next-intl"
import { useFlightStore } from "@/lib/store"
import { cn } from "@/lib/utils"

export function SortBar() {
  const t = useTranslations("results")
  const { sortBy, setSortBy } = useFlightStore()

  const TABS = [
    { value: "total_amount",   label: t("sort.cheapest") },
    { value: "total_duration", label: t("sort.fastest")  },
    { value: "departure_time", label: t("sort.earliest") },
  ] as const

  return (
    <div className="h-12 bg-primary flex items-end px-4 gap-6">
      {TABS.map(({ value, label }) => (
        <button
          key={value}
          onClick={() => setSortBy(value)}
          className={cn(
            "pb-2 text-sm transition-colors",
            sortBy === value ? "sort-tab-active" : "sort-tab-inactive"
          )}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
