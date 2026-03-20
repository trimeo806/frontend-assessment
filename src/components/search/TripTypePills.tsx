"use client"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"

interface Props {
  value: "one_way" | "round_trip"
  onChange: (v: "one_way" | "round_trip") => void
}

export function TripTypePills({ value, onChange }: Props) {
  const t = useTranslations("search")

  const OPTIONS = [
    { value: "one_way" as const,    label: t("oneWay") },
    { value: "round_trip" as const, label: t("roundTrip") },
  ]

  return (
    <div className="flex gap-2">
      {OPTIONS.map(({ value: v, label }) => (
        <button
          key={v}
          type="button"
          onClick={() => onChange(v)}
          className={cn(
            "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
            value === v
              ? "bg-primary border-primary text-white"
              : "border-border bg-white text-secondary-foreground hover:border-primary"
          )}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
