"use client"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

export function ProgressStepper({ step }: { step: 1 | 2 | 3 | 4 }) {
  const t = useTranslations("stepper")
  const STEPS = [t("search"), t("results"), t("passengers"), t("confirm")]

  return (
    <div className="flex items-center gap-2">
      {STEPS.map((label, i) => {
        const n = i + 1
        const done = n < step
        const active = n === step
        return (
          <div key={label} className="flex items-center gap-2">
            <div className={cn(
              "flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold border-2",
              done   ? "prog-dot-done" : "",
              active ? "prog-dot-active" : "border-white/40 text-white/60"
            )}>
              {done ? <Check className="h-3.5 w-3.5" /> : n}
            </div>
            <span className={cn(
              "hidden sm:block text-xs",
              active ? "text-white font-semibold" : done ? "text-white/80" : "text-white/50"
            )}>
              {label}
            </span>
            {i < STEPS.length - 1 && (
              <div className={cn("h-px w-8 mx-1", done ? "prog-line-done" : "bg-white/30")} />
            )}
          </div>
        )
      })}
    </div>
  )
}
