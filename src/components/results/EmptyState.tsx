"use client"
import { useTranslations } from "next-intl"
import { Plane } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Props { onReset?: () => void }

export function EmptyState({ onReset }: Props) {
  const t = useTranslations("results")
  return (
    <div className="flex flex-col items-center gap-4 py-16 text-center">
      <div className="h-16 w-16 rounded-full bg-secondary flex items-center justify-center">
        <Plane className="h-8 w-8 text-primary" />
      </div>
      <div>
        <p className="font-semibold text-lg text-secondary-foreground">{t("noFlights")}</p>
        <p className="text-sm text-muted-foreground mt-1">{t("adjustFilters")}</p>
      </div>
      {onReset && (
        <Button variant="outline" onClick={onReset}>{t("clearFilters")}</Button>
      )}
    </div>
  )
}
