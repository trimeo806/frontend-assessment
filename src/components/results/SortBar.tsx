"use client"
import { useTranslations } from "next-intl"
import { useFlightStore } from "@/lib/store"
import { SORT_BY } from "@/lib/constants"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { ArrowUpDown } from "lucide-react"

export function SortBar() {
  const t = useTranslations("results")
  const { sortBy, setSortBy } = useFlightStore()

  const TABS = [
    { value: SORT_BY.TOTAL_AMOUNT,   label: t("sort.cheapest") },
    { value: SORT_BY.TOTAL_DURATION, label: t("sort.fastest")  },
    { value: SORT_BY.DEPARTURE_TIME, label: t("sort.earliest") },
  ] as const

  const currentLabel = TABS.find((tab) => tab.value === sortBy)?.label ?? sortBy

  return (
    <div className="flex items-center gap-2">
      <ArrowUpDown className="h-4 w-4 text-muted-foreground shrink-0" />
      <span className="text-sm text-muted-foreground shrink-0">{t("sort.label")}</span>
      <Select value={sortBy} onValueChange={(v) => { if (v !== null) setSortBy(v) }}>
        <SelectTrigger className="h-8 w-[130px] text-sm">
          <SelectValue>{currentLabel}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {TABS.map(({ value, label }) => (
            <SelectItem key={value} value={value}>{label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
