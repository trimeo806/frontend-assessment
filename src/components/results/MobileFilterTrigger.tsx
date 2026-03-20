"use client"
import { FilterSheet } from "./FilterSheet"
import type { DuffelOffer } from "@/lib/types/duffel"

interface Props { offers: DuffelOffer[] }

export function MobileFilterTrigger({ offers }: Props) {
  return <FilterSheet offers={offers} />
}
