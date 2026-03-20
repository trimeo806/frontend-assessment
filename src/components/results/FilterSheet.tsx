"use client"
import { useState } from "react"
import { m, AnimatePresence } from "motion/react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { SlidersHorizontal, X } from "lucide-react"
import { useTranslations } from "next-intl"
import { FilterPanel } from "./FilterPanel"
import { duration } from "@/lib/animations/tokens"
import type { DuffelOffer } from "@/lib/types/duffel"

interface Props { offers: DuffelOffer[] }

export function FilterSheet({ offers }: Props) {
  const t = useTranslations("results")
  const [open, setOpen] = useState(false)

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Trigger
        className="lg:hidden inline-flex items-center gap-2 h-9 px-3 rounded-lg border border-border bg-background text-sm font-medium hover:bg-muted/50 outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <SlidersHorizontal className="h-4 w-4" />
        {t("filters")}
      </DialogPrimitive.Trigger>

      <AnimatePresence>
        {open && (
          <DialogPrimitive.Portal forceMount>
            {/* Overlay */}
            <DialogPrimitive.Overlay asChild>
              <m.div
                className="fixed inset-0 bg-black/40 z-40"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: duration.base }}
              />
            </DialogPrimitive.Overlay>

            {/* Panel */}
            <DialogPrimitive.Content asChild>
              <m.div
                className="fixed left-0 top-0 bottom-0 w-80 bg-background border-r border-border z-50 overflow-y-auto flex flex-col"
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ duration: duration.base, ease: "easeOut" }}
              >
                <div className="flex items-center justify-between p-4 border-b border-border shrink-0">
                  <span className="font-semibold text-base">{t("filters")}</span>
                  <DialogPrimitive.Close className="rounded-sm opacity-70 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring">
                    <X className="h-4 w-4" />
                    <span className="sr-only">Close</span>
                  </DialogPrimitive.Close>
                </div>
                <div className="p-4 flex-1 overflow-y-auto">
                  <FilterPanel offers={offers} />
                </div>
              </m.div>
            </DialogPrimitive.Content>
          </DialogPrimitive.Portal>
        )}
      </AnimatePresence>
    </DialogPrimitive.Root>
  )
}
