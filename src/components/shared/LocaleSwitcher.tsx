"use client"
import { useLocale } from "next-intl"
import { useRouter, usePathname } from "@/navigation"

const LOCALES = [
  { code: "en", label: "EN" },
  { code: "ms", label: "MY" },
  { code: "zh", label: "ZH" },
] as const

export function LocaleSwitcher() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()

  return (
    <div className="flex items-center gap-1">
      {LOCALES.map(({ code, label }) => (
        <button
          key={code}
          onClick={() => router.replace(pathname, { locale: code })}
          className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
            locale === code
              ? "bg-white/20 text-white"
              : "text-white/60 hover:text-white"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
