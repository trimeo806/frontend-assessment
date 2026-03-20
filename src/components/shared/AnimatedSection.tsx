"use client"
import { m } from "motion/react"

interface Props {
  children: React.ReactNode
  className?: string
  delay?: number
  from?: "bottom" | "right"
}

export function AnimatedSection({ children, className, delay = 0, from = "bottom" }: Props) {
  const initial = from === "right"
    ? { opacity: 0, x: 24 }
    : { opacity: 0, y: 20 }
  const animate = from === "right"
    ? { opacity: 1, x: 0 }
    : { opacity: 1, y: 0 }

  return (
    <m.div
      initial={initial}
      animate={animate}
      transition={{ duration: 0.3, ease: "easeOut", delay }}
      className={className}
    >
      {children}
    </m.div>
  )
}
