"use client"
import { useState, useEffect, useRef } from "react"
import { useTranslations } from "next-intl"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandInput, CommandList, CommandItem, CommandEmpty } from "@/components/ui/command"
import { MapPin, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { DuffelPlace } from "@/lib/types/duffel"

interface Props {
  placeholder: string
  value: { iata: string; name: string; city: string } | null
  onChange: (v: { iata: string; name: string; city: string }) => void
  error?: string
}

export function AirportCombobox({ placeholder, value, onChange, error }: Props) {
  const t = useTranslations("search")
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<DuffelPlace[]>([])
  const [loading, setLoading] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (query.length < 2) { setResults([]); return }
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/places?query=${encodeURIComponent(query)}`)
        const data = await res.json()
        setResults(data)
      } catch {
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 300)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [query])

  return (
    <div className="flex flex-col gap-1">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          className={cn(
            "inline-flex h-[56px] w-full items-center justify-start gap-2 rounded-lg border border-border bg-background px-3 text-base font-normal outline-none hover:bg-muted/50 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
            error ? "border-error" : ""
          )}
        >
          <MapPin className="h-4 w-4 text-primary shrink-0" />
          {value ? (
            <span className="font-medium">{value.city} ({value.iata})</span>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
        </PopoverTrigger>
        <PopoverContent className="p-0 w-(--anchor-width)" align="start">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder={t("searchAirports")}
              value={query}
              onValueChange={setQuery}
            />
            <CommandList>
              {loading && (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              )}
              {!loading && results.length === 0 && query.length >= 2 && (
                <CommandEmpty>{t("noAirports")}</CommandEmpty>
              )}
              {results.map((place) => (
                <CommandItem
                  key={place.id}
                  onSelect={() => {
                    onChange({ iata: place.iata_code, name: place.name, city: place.city_name })
                    setOpen(false)
                    setQuery("")
                  }}
                  className="cursor-pointer"
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{place.city_name} ({place.iata_code})</span>
                    <span className="text-xs text-muted-foreground">{place.name}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {error && <p className="text-xs text-error">{error}</p>}
    </div>
  )
}
