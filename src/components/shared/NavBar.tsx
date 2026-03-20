"use client"
import { useTranslations } from "next-intl"
import { Link, usePathname } from "@/navigation"
import { cn } from "@/lib/utils"
import { LocaleSwitcher } from "./LocaleSwitcher"
import { SkyBookLogo } from "./SkyBookLogo"

export function NavBar() {
  const t = useTranslations("nav")
  const pathname = usePathname()

  const NON_FLIGHT_PATHS = ["/hotels", "/cars"]
  const isFlightsActive = !NON_FLIGHT_PATHS.some(p => pathname === p || pathname.startsWith(p + "/"))

  const NAV_LINKS = [
    { href: "/" as const,       label: t("flights"),  isActive: isFlightsActive },
    { href: "/hotels" as const,  label: t("hotels"),   isActive: pathname === "/hotels" || pathname.startsWith("/hotels/") },
    { href: "/cars" as const,    label: t("carHire"),  isActive: pathname === "/cars"   || pathname.startsWith("/cars/") },
  ]

  return (
    <header className="h-14 bg-primary px-8 flex items-center justify-between shrink-0">
      <Link href="/" className="hover:opacity-90 transition-opacity">
        <SkyBookLogo />
      </Link>
      <nav className="hidden md:flex items-center gap-6">
        {NAV_LINKS.map(({ href, label, isActive }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "text-sm font-medium transition-colors",
              isActive ? "nav-link-active" : "text-primary-foreground/85 hover:text-primary-foreground"
            )}
          >
            {label}
          </Link>
        ))}
      </nav>
      <div className="flex items-center gap-3">
        <LocaleSwitcher />
      </div>
    </header>
  )
}
