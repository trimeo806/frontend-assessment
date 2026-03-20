"use client"
import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

interface Props {
  value: string           // "yyyy-MM-dd" or ""
  onChange: (v: string) => void
  error?: string
  direction?: "past" | "future"  // "past" = date of birth (default), "future" = expiry date
}

const MONTHS = [
  { label: "January",   value: "1"  },
  { label: "February",  value: "2"  },
  { label: "March",     value: "3"  },
  { label: "April",     value: "4"  },
  { label: "May",       value: "5"  },
  { label: "June",      value: "6"  },
  { label: "July",      value: "7"  },
  { label: "August",    value: "8"  },
  { label: "September", value: "9"  },
  { label: "October",   value: "10" },
  { label: "November",  value: "11" },
  { label: "December",  value: "12" },
]

function daysInMonth(month: string, year: string): number {
  const m = parseInt(month, 10)
  if (!m) return 31
  const y = parseInt(year, 10) || 2000 // 2000 is a leap year, safe fallback
  return new Date(y, m, 0).getDate()
}

function parseParts(value: string) {
  if (!value) return { year: "", month: "", day: "" }
  const [y = "", m = "", d = ""] = value.split("-")
  return {
    year:  y,
    month: m ? String(parseInt(m, 10)) : "",
    day:   d ? String(parseInt(d, 10)) : "",
  }
}

export function DateOfBirthPicker({ value, onChange, error, direction = "past" }: Props) {
  // Local state so each part persists independently of the form value
  const [parts, setParts] = useState(() => parseParts(value))

  function update(next: { year: string; month: string; day: string }) {
    setParts(next)
    const { year, month, day } = next
    if (year && month && day) {
      const mm = month.padStart(2, "0")
      const dd = day.padStart(2, "0")
      onChange(`${year}-${mm}-${dd}`)
    }
    // Do NOT call onChange("") on partial — let local state hold the partial value
  }

  const currentYear = new Date().getFullYear()
  const years = direction === "future"
    ? Array.from({ length: 21 }, (_, i) => currentYear + i)
    : Array.from({ length: currentYear - 1900 + 1 }, (_, i) => currentYear - i)

  const maxDay = daysInMonth(parts.month, parts.year)
  const days   = Array.from({ length: maxDay }, (_, i) => i + 1)

  // Clamp day when month/year change reduce max days
  function handleMonth(month: string | null) {
    if (!month) return
    const newMax  = daysInMonth(month, parts.year)
    const clipped = parts.day && parseInt(parts.day, 10) > newMax ? String(newMax) : parts.day
    update({ ...parts, month, day: clipped })
  }

  function handleDay(day: string | null) {
    if (!day) return
    update({ ...parts, day })
  }

  function handleYear(year: string | null) {
    if (!year) return
    const newMax  = daysInMonth(parts.month, year)
    const clipped = parts.day && parseInt(parts.day, 10) > newMax ? String(newMax) : parts.day
    update({ ...parts, year, day: clipped })
  }

  const triggerCls = cn(
    "h-10 w-full",
    error && "border-error"
  )

  return (
    <div className="flex flex-col gap-1">
      <div className="grid grid-cols-3 gap-2">

        {/* Month */}
        <Select value={parts.month} onValueChange={handleMonth}>
          <SelectTrigger className={triggerCls}>
            <SelectValue placeholder="Month" />
          </SelectTrigger>
          <SelectContent>
            {MONTHS.map(({ label, value: v }) => (
              <SelectItem key={v} value={v}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Day */}
        <Select value={parts.day} onValueChange={handleDay}>
          <SelectTrigger className={triggerCls}>
            <SelectValue placeholder="Day" />
          </SelectTrigger>
          <SelectContent>
            {days.map((d) => (
              <SelectItem key={d} value={String(d)}>{d}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Year */}
        <Select value={parts.year} onValueChange={handleYear}>
          <SelectTrigger className={triggerCls}>
            <SelectValue placeholder="Year" />
          </SelectTrigger>
          <SelectContent className="max-h-56 overflow-y-auto">
            {years.map((y) => (
              <SelectItem key={y} value={String(y)}>{y}</SelectItem>
            ))}
          </SelectContent>
        </Select>

      </div>
      {error && <p className="text-xs text-error mt-0.5">{error}</p>}
    </div>
  )
}
