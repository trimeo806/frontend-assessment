"use client"
import { useState } from "react"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"

interface SingleProps {
  mode: "single"
  value: string | null
  onChange: (v: string) => void
  placeholder?: string
  minDate?: Date
  maxDate?: Date
  error?: string
  className?: string
}

interface RangeProps {
  mode: "range"
  departValue: string | null
  returnValue: string | null
  onDepartChange: (v: string) => void
  onReturnChange: (v: string) => void
  error?: string
  className?: string
}

type Props = SingleProps | RangeProps

const triggerClass = (error?: string, className?: string) =>
  cn(
    "inline-flex h-[56px] w-full items-center justify-start gap-2 rounded-lg border border-border bg-background px-3 text-base font-normal outline-none hover:bg-muted/50 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
    error ? "border-error" : "",
    className
  )

export function DateRangePicker(props: Props) {
  const [open, setOpen] = useState(false)
  // "from" = waiting for departure click, "to" = waiting for return click
  const [phase, setPhase] = useState<"from" | "to">("from")
  const [pendingFrom, setPendingFrom] = useState<Date | undefined>(undefined)

  if (props.mode === "single") {
    const { value, onChange, placeholder = "Select date", minDate, maxDate, error, className } = props
    const selected = value ? new Date(value) : undefined
    const today = new Date(new Date().setHours(0, 0, 0, 0))
    const isDisabled = (d: Date) =>
      maxDate ? d > maxDate : d < (minDate ?? today)
    return (
      <div className="flex flex-col gap-1">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger className={triggerClass(error, className)}>
            <CalendarIcon className="h-4 w-4 text-primary shrink-0" />
            {selected ? (
              <span className="font-medium">{format(selected, "EEE, d MMM yyyy")}</span>
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={selected}
              onSelect={(d) => { if (d) { onChange(format(d, "yyyy-MM-dd")); setOpen(false) } }}
              disabled={isDisabled}
              defaultMonth={maxDate ?? selected}
            />
          </PopoverContent>
        </Popover>
        {error && <p className="text-xs text-error">{error}</p>}
      </div>
    )
  }

  // Range mode
  const { departValue, returnValue, onDepartChange, onReturnChange, error, className } = props
  const from = departValue ? new Date(departValue) : undefined
  const to = returnValue ? new Date(returnValue) : undefined

  const handleRangeOpenChange = (next: boolean) => {
    setOpen(next)
    if (next) {
      // Reset phase each time the panel opens so we always start fresh
      setPhase("from")
      setPendingFrom(undefined)
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <Popover open={open} onOpenChange={handleRangeOpenChange}>
        <PopoverTrigger className={triggerClass(error, className)}>
          <CalendarIcon className="h-4 w-4 text-primary shrink-0" />
          {from ? (
            <span className="font-medium">
              {format(from, "d MMM")} {to ? `\u2192 ${format(to, "d MMM")}` : "\u2192 Return date"}
            </span>
          ) : (
            <span className="text-muted-foreground">Select dates</span>
          )}
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            selected={phase === "to" ? { from: pendingFrom, to: undefined } : { from, to }}
            onSelect={(range) => {
              if (phase === "from") {
                // First click: record departure date and wait for return
                if (range?.from) {
                  onDepartChange(format(range.from, "yyyy-MM-dd"))
                  setPendingFrom(range.from)
                  setPhase("to")
                }
              } else {
                // Second click: complete the range or restart if user picked before departure
                if (range?.from && range?.to) {
                  onReturnChange(format(range.to, "yyyy-MM-dd"))
                  setOpen(false)
                  setPhase("from")
                } else if (range?.from) {
                  // Clicked a date earlier than pendingFrom — treat as new departure
                  onDepartChange(format(range.from, "yyyy-MM-dd"))
                  setPendingFrom(range.from)
                }
              }
            }}
            disabled={(d) => d < new Date(new Date().setHours(0,0,0,0))}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
      {error && <p className="text-xs text-error">{error}</p>}
    </div>
  )
}
