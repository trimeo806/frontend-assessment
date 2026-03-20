"use client"
import { useEffect, useState, startTransition } from "react"

export function usePrefersReducedMotion() {
  const [prefersReduced, setPrefersReduced] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    const handler = (e: MediaQueryListEvent) => {
      startTransition(() => setPrefersReduced(e.matches))
    }
    startTransition(() => setPrefersReduced(mq.matches))
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [])
  return prefersReduced
}
