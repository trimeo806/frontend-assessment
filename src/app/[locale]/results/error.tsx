"use client"
import { Button } from "@/components/ui/button"

export default function ResultsError({ reset }: { reset: () => void }) {
  return (
    <div className="flex flex-col items-center gap-4 p-16 text-center">
      <p className="text-lg font-semibold">Failed to load flights</p>
      <p className="text-sm text-muted-foreground">Something went wrong. Please try again.</p>
      <Button onClick={reset}>Try again</Button>
    </div>
  )
}
