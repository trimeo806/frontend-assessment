# UI Audit Report — Flight Booking App
**Session**: 260320-1200-flight-booking-ui-audit
**Date**: 2026-03-20
**Mode**: auto-detected → UI + remediation
**Platform**: web (Next.js 16, Tailwind v4, @base-ui/react)
**Verdict**: FIXED ✓ (build pass, 0 TS errors)

---

## Executive Summary

Three classes of defects were found and remediated across 8 files:

1. **Critical — Transparent floating elements** (root cause: 11 missing `@theme` color tokens)
2. **Critical — Hydration mismatch** (root cause: nested `<html><body>` from double layout)
3. **High — Design token violations** (wrong input heights, typography size violations)

---

## Findings & Fixes

### F1 — Missing color tokens → transparent floating elements
**Severity**: Critical
**Files**: `src/app/globals.css`
**Root cause**: `@theme` block lacked `--color-background`, `--color-foreground`, `--color-popover`, `--color-popover-foreground`, `--color-muted`, `--color-muted-foreground`, `--color-accent`, `--color-accent-foreground`, `--color-input`, `--color-ring`, `--color-destructive`. Without these, Tailwind v4 generated no utilities for `bg-popover`, `bg-background`, `bg-muted`, `bg-accent`, `border-ring`, `ring-ring`, `border-input`, `text-muted-foreground`, etc. — all resolved to `transparent`.
**Affects**: AirportCombobox dropdown, PassengerSelector dropdown, DateRangePicker calendar, CabinClass Select dropdown
**Fix**: Added all 11 tokens to `@theme` block with design-token-aligned values.

| Token added | Value | Resolves |
|-------------|-------|---------|
| `--color-background` | `#FFFFFF` | `bg-background` on triggers |
| `--color-foreground` | `#000000` | `text-foreground`, `bg-foreground` (tooltip) |
| `--color-popover` | `#FFFFFF` | `bg-popover` on all dropdown panels |
| `--color-popover-foreground` | `#000000` | `text-popover-foreground` |
| `--color-muted` | `#F1F2F8` | `bg-muted` hover/range states |
| `--color-muted-foreground` | `#68707E` | `text-muted-foreground` placeholders |
| `--color-accent` | `#F1F2F8` | `bg-accent` command item hover |
| `--color-accent-foreground` | `#000000` | `text-accent-foreground` |
| `--color-input` | `#E6E6E6` | `border-input`, `bg-input/30` |
| `--color-ring` | `#0770E3` | `border-ring`, `ring-ring` focus outlines |
| `--color-destructive` | `#E20A17` | `border-destructive`, `text-destructive` |

### F2 — Calendar `in-data-[slot=popover-content]:bg-transparent` override
**Severity**: Critical
**File**: `src/components/ui/calendar.tsx`
**Root cause**: Calendar root className contained `in-data-[slot=popover-content]:bg-transparent` which explicitly forced transparency when inside a Popover, overriding even a correctly-defined `bg-background`.
**Fix**: Removed the substring. Calendar now inherits `bg-background` (#FFFFFF) from its own className.

### F3 — Hydration mismatch (nested `<html><body>`)
**Severity**: Critical
**Files**: `src/app/layout.tsx`, `src/app/[locale]/layout.tsx`
**Root cause**: `app/layout.tsx` rendered `<html><body>…</body></html>` wrapping the locale layout which also rendered `<html lang={locale}><body class="font-sans antialiased">…</body></html>`. Browsers auto-correct invalid nested html/body, producing a DOM structure different from what React serialized on the server → hydration mismatch.
**Fix**: Replaced root `app/layout.tsx` with a minimal fragment pass-through `<>{children}</>`. The `app/[locale]/layout.tsx` already provides the complete `<html lang>` + `<body>` structure for all real routes. The redirect at `app/page.tsx` ensures no real user ever hits the root layout directly.

### F4 — Search input heights (design token violation)
**Severity**: High
**Files**: `AirportCombobox.tsx`, `DateRangePicker.tsx`, `PassengerSelector.tsx`, `SearchForm.tsx`
**Spec**: Design tokens doc §4: "Search inputs and search button use `h-[56px]`"
**Root cause**: All search-form inputs used `h-12` (48px)
**Fix**: Changed to `h-[56px]` in all 4 files.

### F5 — Typography violations (`text-sm`/`text-xs` in UI text)
**Severity**: High
**Files**: `AirportCombobox.tsx`, `DateRangePicker.tsx`, `PassengerSelector.tsx`, `StickyHeader.tsx`
**Spec**: Design tokens doc §2: "Never use `text-sm` (14px) or `text-xs` (12px) for UI text"
**Fix**: Changed all UI text to `text-base` in the listed files.

---

## Build Verification

```
Build: ✓ PASS (Next.js 16.2.0, 0 TypeScript errors, 6 routes compiled)
```

---

## Methodology

**Files Scanned**: `src/app/globals.css`, `src/app/layout.tsx`, `src/app/[locale]/layout.tsx`, `src/app/[locale]/page.tsx`, `src/app/page.tsx`, `src/components/ui/popover.tsx`, `src/components/ui/command.tsx`, `src/components/ui/select.tsx`, `src/components/ui/calendar.tsx`, `src/components/ui/tooltip.tsx`, `src/components/ui/sheet.tsx`, `src/components/search/AirportCombobox.tsx`, `src/components/search/DateRangePicker.tsx`, `src/components/search/PassengerSelector.tsx`, `src/components/search/SearchForm.tsx`, `src/components/results/StickyHeader.tsx`, `src/lib/store.ts`, `tailwind.config.ts`

**Standards Source**: `plans/260315-1200-flight-booking-app/frontend/implementation-plans/02-design-tokens.md`

**Knowledge Tiers**: L4 (Grep/Glob direct scan), L5 (design token doc)

**Coverage Gaps**: Filter panel, FlightCard, PassengerCard, BookingSummary, ConfirmationCard not audited for typography (may have additional `text-sm` violations — recommend follow-up pass)
