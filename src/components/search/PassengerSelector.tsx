"use client"
import { useState } from "react"
import { useTranslations } from "next-intl"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Users } from "lucide-react"
import type { SearchFormValues } from "@/lib/types/forms"

type PassengerType = "adult" | "child" | "infant_without_seat"

interface Props {
  value: SearchFormValues["passengers"]
  onChange: (v: SearchFormValues["passengers"]) => void
}

export function PassengerSelector({ value, onChange }: Props) {
  const t = useTranslations("passengers")
  const [open, setOpen] = useState(false)
  const total = value.reduce((s, p) => s + p.count, 0)

  const LABELS: Record<PassengerType, { label: string; sub: string }> = {
    adult:               { label: t("adults"),   sub: t("ageAdult") },
    child:               { label: t("children"), sub: t("ageChild") },
    infant_without_seat: { label: t("infants"),  sub: t("ageInfant") },
  }

  const update = (type: PassengerType, delta: number) => {
    onChange(value.map((p) => p.type === type ? { ...p, count: Math.max(0, p.count + delta) } : p))
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button variant="outline" className="h-[56px] justify-start gap-2 w-full font-normal" />
        }
      >
        <Users className="h-4 w-4 text-primary shrink-0" />
        <span className="font-medium">{t("passengerCount", { count: total })}</span>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-4" align="start">
        <div className="space-y-4">
          {value.map(({ type, count }) => (
            <div key={type} className="flex items-center justify-between">
              <div>
                <p className="text-base font-medium">{LABELS[type as PassengerType].label}</p>
                <p className="text-base text-muted-foreground">{LABELS[type as PassengerType].sub}</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => update(type as PassengerType, -1)}
                  disabled={count === 0 || (type === "adult" && count <= 1)}
                  className="h-8 w-8 rounded-full border border-border flex items-center justify-center text-base font-bold disabled:opacity-30 hover:bg-secondary"
                >
                  &minus;
                </button>
                <span className="w-4 text-center text-base font-medium">{count}</span>
                <button
                  type="button"
                  onClick={() => update(type as PassengerType, 1)}
                  disabled={count >= 9}
                  className="h-8 w-8 rounded-full border border-border flex items-center justify-center text-base font-bold disabled:opacity-30 hover:bg-secondary"
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>
        <Button className="mt-4 w-full" size="sm" onClick={() => setOpen(false)}>{t("done")}</Button>
      </PopoverContent>
    </Popover>
  )
}
