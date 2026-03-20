"use client"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"

interface Props { stops: number; className?: string }

export function StopBadge({ stops, className }: Props) {
  const t = useTranslations("results")
  if (stops === 0) return <span className={cn("badge-nonstop", className)}>{t("nonstop")}</span>
  if (stops === 1) return <span className={cn("badge-one-stop", className)}>{t("oneStop")}</span>
  return <span className={cn("badge-multi-stop", className)}>{t("stopsCount", { count: stops })}</span>
}
