export const duration = {
  fast:   0.15,
  base:   0.25,
  slow:   0.4,
  slower: 0.6,
} as const

export const ease = {
  out:    [0.0, 0.0, 0.2, 1] as const,
  in:     [0.4, 0.0, 1, 1]   as const,
  inOut:  [0.4, 0.0, 0.2, 1] as const,
  spring: { type: "spring" as const, stiffness: 300, damping: 30 },
}

export const stagger = {
  fast: 0.05,
  base: 0.08,
  slow: 0.12,
}
