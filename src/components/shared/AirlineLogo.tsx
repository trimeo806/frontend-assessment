"use client"
import Image from "next/image"
import { useState } from "react"

interface Props { iata: string; url?: string | null; name: string; size?: number }

export function AirlineLogo({ iata, url, name, size = 40 }: Props) {
  const [error, setError] = useState(false)
  if (error || !url) {
    return (
      <div
        style={{ width: size, height: size }}
        className="rounded bg-secondary border border-border flex items-center justify-center text-xs font-bold text-secondary-foreground/60"
      >
        {iata.slice(0, 2)}
      </div>
    )
  }
  return (
    <Image
      src={url} alt={`${name} logo`}
      width={size} height={size}
      className="rounded object-contain"
      onError={() => setError(true)}
    />
  )
}
