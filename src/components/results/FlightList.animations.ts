import type { Variants } from "motion/react"
import { stagger, duration, ease } from "@/lib/animations/tokens"

export const listVariants: Variants = {
  hidden:  { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: stagger.base,
      delayChildren: 0.1,
    },
  },
}

export const cardVariants: Variants = {
  hidden:  { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: duration.base, ease: ease.out },
  },
}
