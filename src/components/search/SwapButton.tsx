"use client"
import { useTranslations } from "next-intl"
import { ArrowLeftRight } from "lucide-react"

interface Props { onSwap: () => void }

export function SwapButton({ onSwap }: Props) {
  const t = useTranslations("search")
  return (
    <button
      type="button"
      onClick={onSwap}
      className="h-10 w-10 rounded-full border border-border bg-white flex items-center justify-center hover:bg-secondary transition-colors shrink-0"
      aria-label={t("swapAriaLabel")}
    >
      <ArrowLeftRight className="h-4 w-4 text-primary" />
    </button>
  )
}
