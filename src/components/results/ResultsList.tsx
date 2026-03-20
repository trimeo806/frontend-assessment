"use client"
import { useState, useEffect, useCallback, useRef } from "react"
import { useTranslations } from "next-intl"
import { m } from "motion/react"
import { useFlightStore } from "@/lib/store"
import { FlightCard } from "./FlightCard"
import { FlightCardSkeleton } from "./FlightCardSkeleton"
import { EmptyState } from "./EmptyState"
import { FilterPanel } from "./FilterPanel"
import { SortBar } from "./SortBar"
import { StickyHeader } from "./StickyHeader"
import { MobileFilterTrigger } from "./MobileFilterTrigger"
import { useFilteredOffers } from "./hooks/useFilteredOffers"
import { usePrefersReducedMotion } from "@/lib/animations/hooks"
import { listVariants, cardVariants } from "./FlightList.animations"
import { Button } from "@/components/ui/button"
import { ProgressStepper } from "@/components/shared/ProgressStepper"
import { Loader2, CheckCircle2 } from "lucide-react"
import type { DuffelOffer } from "@/lib/types/duffel"
import {
  RESULTS_PAGE_SIZE,
  INFINITE_SCROLL_ROOT_MARGIN,
  STOP_FILTER,
  DEPARTURE_TIME_ALL,
  DEFAULT_PRICE_RANGE,
} from "@/lib/constants"

interface Props { offerRequestId: string }

export function ResultsList({ offerRequestId }: Props) {
  const t = useTranslations("results")
  const [offers, setOffers] = useState<DuffelOffer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [after, setAfter] = useState<string | null>(null)
  const [loadingMore, setLoadingMore] = useState(false)
  const { setFilter } = useFlightStore()
  const priceInitialized = useRef(false)
  const sentinelRef = useRef<HTMLDivElement>(null)

  const fetchOffers = useCallback(async (cursor?: string) => {
    const url = `/api/flights/offers?orq=${offerRequestId}&limit=${RESULTS_PAGE_SIZE}${cursor ? `&after=${cursor}` : ""}`
    const res = await fetch(url)
    if (!res.ok) throw new Error("Failed to load flights")
    return res.json()
  }, [offerRequestId])

  useEffect(() => {
    setLoading(true)
    setError(null)
    fetchOffers()
      .then((data) => {
        const newOffers: DuffelOffer[] = data.data ?? []
        setOffers(newOffers)
        setAfter(data.meta?.after ?? null)
        if (!priceInitialized.current && newOffers.length > 0) {
          const prices = newOffers.map((o) => parseFloat(o.total_amount))
          const minP = Math.floor(Math.min(...prices))
          const maxP = Math.ceil(Math.max(...prices))
          setFilter({ priceRange: [minP, maxP] })
          priceInitialized.current = true
        }
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
  }, [fetchOffers])

  const [loadMoreError, setLoadMoreError] = useState<string | null>(null)

  const loadMore = useCallback(async () => {
    if (!after || loadingMore) return
    setLoadingMore(true)
    setLoadMoreError(null)
    try {
      const data = await fetchOffers(after)
      setOffers((prev) => [...prev, ...(data.data ?? [])])
      setAfter(data.meta?.after ?? null)
    } catch (e: unknown) {
      setLoadMoreError(e instanceof Error ? e.message : "Failed to load more flights")
    } finally {
      setLoadingMore(false)
    }
  }, [after, fetchOffers, loadingMore])

  // Infinite scroll — fires on scroll AND handles initial fill-screen
  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel || !after || loadingMore || loading) return

    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) loadMore() },
      { rootMargin: INFINITE_SCROLL_ROOT_MARGIN }
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [after, loadingMore, loading, loadMore])

  const filteredOffers = useFilteredOffers(offers)
  const reduced = usePrefersReducedMotion()

  if (error) {
    return (
      <div className="flex flex-col items-center gap-3 py-16">
        <p className="text-error">{error}</p>
        <Button variant="outline" onClick={() => window.location.reload()}>{t("tryAgain")}</Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-secondary">
      <StickyHeader />
      <div className="mx-auto w-full max-w-220 px-4 pt-3 pb-0">
        <div className="rounded-xl bg-primary px-4 py-2.5 flex justify-center shadow-sm">
          <ProgressStepper step={2} />
        </div>
      </div>

      <div className="flex-1 mx-auto w-full max-w-300 px-4 py-6 flex gap-6">
        {/* Desktop filter sidebar */}
        <div className="hidden lg:block">
          <FilterPanel offers={offers} />
        </div>

        {/* Main content */}
        <div className="flex-1 space-y-3">
          {/* Sort + filter row */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <p className="text-sm text-muted-foreground">{t("flightsCount", { count: filteredOffers.length })}</p>
              <div className="hidden lg:block">
                <SortBar />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="lg:hidden">
                <SortBar />
              </div>
              <MobileFilterTrigger offers={offers} />
            </div>
          </div>

          {loading ? (
            <>
              <FlightCardSkeleton />
              <FlightCardSkeleton />
              <FlightCardSkeleton />
            </>
          ) : filteredOffers.length === 0 ? (
            <EmptyState onReset={() => setFilter({ stops: STOP_FILTER.ALL, airlines: [], departureTime: DEPARTURE_TIME_ALL, priceRange: DEFAULT_PRICE_RANGE })} />
          ) : (
            <>
              {reduced ? (
                filteredOffers.map((offer) => (
                  <FlightCard key={offer.id} offer={offer} />
                ))
              ) : (
                <m.div
                  variants={listVariants}
                  initial="hidden"
                  animate="visible"
                  className="space-y-3"
                >
                  {filteredOffers.map((offer) => (
                    <m.div key={offer.id} variants={cardVariants}>
                      <FlightCard offer={offer} />
                    </m.div>
                  ))}
                </m.div>
              )}

              {/* Sentinel — triggers load-more when visible; doubles as end indicator */}
              <div ref={sentinelRef} className="flex flex-col items-center py-6 gap-2">
                {loadingMore ? (
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                ) : loadMoreError ? (
                  <div className="flex flex-col items-center gap-2">
                    <p className="text-sm text-error">{loadMoreError}</p>
                    <Button variant="outline" size="sm" onClick={() => loadMore()}>{t("tryAgain")}</Button>
                  </div>
                ) : !after ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>{t("allResultsShown")}</span>
                  </div>
                ) : null}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
