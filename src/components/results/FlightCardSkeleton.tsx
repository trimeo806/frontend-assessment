function ShimmerBar({ className }: { className?: string }) {
  return (
    <div
      className={`rounded animate-shimmer bg-gradient-to-r from-muted via-muted-foreground/10 to-muted bg-[length:800px_100%] ${className ?? ""}`}
    />
  )
}

export function FlightCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-border p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ShimmerBar className="h-10 w-10" />
          <div className="space-y-2">
            <ShimmerBar className="h-4 w-24" />
            <ShimmerBar className="h-3 w-16" />
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <ShimmerBar className="h-6 w-20" />
          <ShimmerBar className="h-9 w-24" />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <ShimmerBar className="h-4 w-16" />
        <ShimmerBar className="h-px flex-1" />
        <ShimmerBar className="h-4 w-16" />
      </div>
    </div>
  )
}
