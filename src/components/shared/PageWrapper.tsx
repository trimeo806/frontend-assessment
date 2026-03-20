"use client"
import { usePathname } from "next/navigation"
import { m } from "motion/react"
import { usePrefersReducedMotion } from "@/lib/animations/hooks"

export function PageWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const reduced = usePrefersReducedMotion()

  return (
    <m.div
      key={pathname}
      initial={{ opacity: 0, y: reduced ? 0 : 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduced ? 0.01 : 0.3 }}
    >
      {children}
    </m.div>
  )
}
