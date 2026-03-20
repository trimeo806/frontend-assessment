"use client"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"

export default function ResultsError({ reset }: { reset: () => void }) {
  const t = useTranslations("results")
  return (
    <div className="flex flex-col items-center gap-4 p-16 text-center">
      <p className="text-lg font-semibold">{t("errorHeading")}</p>
      <p className="text-sm text-muted-foreground">{t("errorDetail")}</p>
      <Button onClick={reset}>{t("tryAgain")}</Button>
    </div>
  )
}
