"use client"
import { useForm, Controller, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTransition, useEffect } from "react"
import { useTranslations } from "next-intl"
import { useRouter } from "@/navigation"
import { toast } from "sonner"
import { searchFormSchema, searchFormDefaults, type SearchFormValues } from "@/lib/types/forms"
import { searchFlights } from "@/actions/search"
import { useFlightStore } from "@/lib/store"
import { TripTypePills } from "./TripTypePills"
import { AirportCombobox } from "./AirportCombobox"
import { SwapButton } from "./SwapButton"
import { DateRangePicker } from "./DateRangePicker"
import { PassengerSelector } from "./PassengerSelector"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Loader2, Search, Plane, Calendar } from "lucide-react"
import { format } from "date-fns"
import { EVENT_PREFILL_DESTINATION, ROUTES } from "@/lib/constants"

export function SearchForm() {
  const t = useTranslations("search")
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const { setSearch, setOfferRequest, resetForNewSearch, search } = useFlightStore()

  const CABIN_OPTIONS = [
    { value: "economy",         label: t("economy") },
    { value: "premium_economy", label: t("premiumEconomy") },
    { value: "business",        label: t("business") },
    { value: "first",           label: t("first") },
  ] as const

  const form = useForm<SearchFormValues>({
    resolver: zodResolver(searchFormSchema),
    defaultValues: search ?? searchFormDefaults,
  })

  const tripType = useWatch({ control: form.control, name: "tripType" })
  const originWatch = useWatch({ control: form.control, name: "origin" })
  const destinationWatch = useWatch({ control: form.control, name: "destination" })
  const departDateWatch = useWatch({ control: form.control, name: "departDate" })
  const returnDateWatch = useWatch({ control: form.control, name: "returnDate" })

  useEffect(() => {
    const handler = (e: Event) => {
      const dest = (e as CustomEvent<{ iata: string; name: string; city: string }>).detail
      form.setValue("destination", dest, { shouldValidate: false, shouldDirty: false })
    }
    window.addEventListener(EVENT_PREFILL_DESTINATION, handler)
    return () => window.removeEventListener(EVENT_PREFILL_DESTINATION, handler)
  }, [form])

  const handleSwap = () => {
    const origin = form.getValues("origin")
    const dest = form.getValues("destination")
    form.setValue("origin", dest)
    form.setValue("destination", origin)
  }

  const onSubmit = (values: SearchFormValues) => {
    startTransition(async () => {
      resetForNewSearch()
      setSearch(values)
      const result = await searchFlights({
        ...values,
        returnDate: values.returnDate ?? undefined,
      })
      if (!result.success) {
        toast.error(result.error)
        return
      }
      setOfferRequest(result.data.offerRequestId, result.data.passengerIds)
      router.push(`${ROUTES.RESULTS}?orq=${result.data.offerRequestId}`)
    })
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <Controller
        control={form.control}
        name="tripType"
        render={({ field }) => (
          <TripTypePills value={field.value} onChange={field.onChange} />
        )}
      />

      {/* Origin / Destination row — stacks vertically on mobile, side-by-side on sm+ */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
        <div className="flex-1 min-w-0">
          <Controller
            control={form.control}
            name="origin"
            render={({ field, fieldState }) => (
              <AirportCombobox
                placeholder={t("from")}
                value={field.value?.iata ? field.value : null}
                onChange={field.onChange}
                error={fieldState.error?.message}
              />
            )}
          />
        </div>
        <div className="flex justify-center sm:block">
          <SwapButton onSwap={handleSwap} />
        </div>
        <div className="flex-1 min-w-0">
          <Controller
            control={form.control}
            name="destination"
            render={({ field, fieldState }) => (
              <AirportCombobox
                placeholder={t("to")}
                value={field.value?.iata ? field.value : null}
                onChange={field.onChange}
                error={fieldState.error?.message ?? form.formState.errors.destination?.message}
              />
            )}
          />
        </div>
      </div>

      {/* Dates row */}
      {tripType === "round_trip" ? (
        <Controller
          control={form.control}
          name="departDate"
          render={({ field, fieldState }) => (
            <Controller
              control={form.control}
              name="returnDate"
              render={({ field: returnField, fieldState: returnState }) => (
                <DateRangePicker
                  mode="range"
                  departValue={field.value || null}
                  returnValue={returnField.value}
                  onDepartChange={field.onChange}
                  onReturnChange={returnField.onChange}
                  error={fieldState.error?.message ?? returnState.error?.message}
                />
              )}
            />
          )}
        />
      ) : (
        <Controller
          control={form.control}
          name="departDate"
          render={({ field, fieldState }) => (
            <DateRangePicker
              mode="single"
              value={field.value || null}
              onChange={field.onChange}
              placeholder={t("departureDate")}
              error={fieldState.error?.message}
            />
          )}
        />
      )}

      {/* Cabin class — full-width pills */}
      <Controller
        control={form.control}
        name="cabinClass"
        render={({ field }) => (
          <div className="flex gap-2 flex-wrap">
            {CABIN_OPTIONS.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => field.onChange(value)}
                className={cn(
                  "flex-1 rounded-full border px-4 py-2 text-sm font-medium transition-colors text-center whitespace-nowrap",
                  field.value === value
                    ? "bg-primary border-primary text-white"
                    : "border-border bg-white text-secondary-foreground hover:border-primary"
                )}
              >
                {label}
              </button>
            ))}
          </div>
        )}
      />

      {/* Passengers */}
      <Controller
        control={form.control}
        name="passengers"
        render={({ field }) => (
          <PassengerSelector value={field.value} onChange={field.onChange} />
        )}
      />

      {/* Trip summary strip — visible when route + date are selected */}
      {originWatch?.iata && destinationWatch?.iata && departDateWatch && (
        <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-lg border border-primary/25 bg-primary/5 text-sm overflow-hidden min-w-0">
          <Plane className="h-4 w-4 text-primary shrink-0" />
          <span className="font-semibold text-secondary-foreground shrink-0">
            {originWatch.iata} → {destinationWatch.iata}
          </span>
          <span className="text-muted-foreground shrink-0">·</span>
          <span className="flex items-center gap-1 text-secondary-foreground min-w-0">
            <Calendar className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <span className="truncate">
              {format(new Date(departDateWatch), "EEE, d MMM")}
              {returnDateWatch && ` — ${format(new Date(returnDateWatch), "EEE, d MMM")}`}
            </span>
          </span>
        </div>
      )}

      <Button
        type="submit"
        disabled={isPending}
        className="w-full h-[56px] bg-primary hover:bg-primary/90 text-white font-semibold text-base active:scale-[0.98] transition-transform duration-150"
      >
        {isPending ? (
          <><Loader2 className="h-4 w-4 animate-spin mr-2" />{t("searching")}</>
        ) : (
          <><Search className="h-4 w-4 mr-2" />{t("searchFlights")}</>
        )}
      </Button>

      {form.formState.errors.passengers?.root && (
        <p className="text-xs text-error">{form.formState.errors.passengers.root.message}</p>
      )}
    </form>
  )
}
