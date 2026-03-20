"use client"
import { useTranslations } from "next-intl"
import { useFlightStore } from "@/lib/store"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import type { DuffelOffer } from "@/lib/types/duffel"
import { useMemo } from "react"
import {
  STOP_FILTER,
  DEPARTURE_TIME_ALL,
  DEPARTURE_TIME_MORNING,
  DEPARTURE_TIME_AFTERNOON,
  DEPARTURE_TIME_EVENING,
  DEPARTURE_TIME_NIGHT,
  DEFAULT_PRICE_RANGE,
} from "@/lib/constants"

interface Props { offers: DuffelOffer[] }

export function FilterPanel({ offers }: Props) {
  const t = useTranslations("results")
  const { filters, setFilter } = useFlightStore()

  const STOP_OPTIONS = [
    { value: STOP_FILTER.ALL,      label: t("any") },
    { value: STOP_FILTER.DIRECT,   label: t("nonstop") },
    { value: STOP_FILTER.ONE,      label: t("oneStop") },
    { value: STOP_FILTER.TWO_PLUS, label: t("twoPlus") },
  ] as const

  const TIME_CHIPS = [
    { label: t("morning"),   range: DEPARTURE_TIME_MORNING },
    { label: t("afternoon"), range: DEPARTURE_TIME_AFTERNOON },
    { label: t("evening"),   range: DEPARTURE_TIME_EVENING },
    { label: t("night"),     range: DEPARTURE_TIME_NIGHT },
  ]

  const airlines = useMemo(() => {
    const map = new Map<string, string>()
    offers.forEach((o) => map.set(o.owner.iata_code, o.owner.name))
    return Array.from(map.entries()).map(([iata, name]) => ({ iata, name }))
  }, [offers])

  const priceRange = useMemo(() => {
    if (!offers.length) return DEFAULT_PRICE_RANGE
    const prices = offers.map((o) => parseFloat(o.total_amount))
    return [Math.floor(Math.min(...prices)), Math.ceil(Math.max(...prices))] as [number, number]
  }, [offers])

  const currency = offers[0]?.total_currency ?? ""

  return (
    <aside className="w-72 shrink-0 space-y-6 bg-white rounded-xl border border-border p-4 h-fit">
      {/* Stops */}
      <div>
        <p className="text-sm font-semibold mb-3">{t("stops")}</p>
        <RadioGroup
          value={filters.stops}
          onValueChange={(v) => setFilter({ stops: v as typeof filters.stops })}
          className="space-y-2"
        >
          {STOP_OPTIONS.map(({ value, label }) => (
            <div key={value} className="flex items-center gap-2">
              <RadioGroupItem value={value} id={`stop-${value}`} />
              <Label htmlFor={`stop-${value}`} className="cursor-pointer text-sm">{label}</Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      {/* Airlines */}
      {airlines.length > 0 && (
        <div>
          <p className="text-sm font-semibold mb-3">{t("airlines")}</p>
          <div className="space-y-2">
            {airlines.map(({ iata, name }) => (
              <div key={iata} className="flex items-center gap-2">
                <Checkbox
                  id={`airline-${iata}`}
                  checked={filters.airlines.includes(iata)}
                  onCheckedChange={(checked) =>
                    setFilter({
                      airlines: checked
                        ? [...filters.airlines, iata]
                        : filters.airlines.filter((a) => a !== iata),
                    })
                  }
                />
                <Label htmlFor={`airline-${iata}`} className="cursor-pointer text-sm">{name}</Label>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Price range */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold">{t("priceRange")}</p>
          <p className="text-xs text-muted-foreground">
            {currency} {filters.priceRange[0].toFixed(0)} – {currency} {filters.priceRange[1].toFixed(0)}
          </p>
        </div>
        <Slider
          min={priceRange[0]}
          max={priceRange[1]}
          step={10}
          value={[filters.priceRange[0], filters.priceRange[1]]}
          onValueChange={(v) => {
            const arr = Array.isArray(v) ? v : [v, v]
            setFilter({ priceRange: [arr[0] ?? 0, arr[1] ?? 9999] })
          }}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-2">
          <span>{currency} {priceRange[0]}</span>
          <span>{currency} {priceRange[1]}</span>
        </div>
      </div>

      {/* Departure time */}
      <div>
        <p className="text-sm font-semibold mb-3">{t("departureTime")}</p>
        <div className="flex flex-wrap gap-2">
          {TIME_CHIPS.map(({ label, range }) => {
            const active =
              filters.departureTime[0] === range[0] && filters.departureTime[1] === range[1]
            return (
              <button
                key={label}
                type="button"
                onClick={() => setFilter({ departureTime: active ? DEPARTURE_TIME_ALL : range })}
                className="time-chip"
                data-active={active}
              >
                {label}
              </button>
            )
          })}
        </div>
      </div>
    </aside>
  )
}
