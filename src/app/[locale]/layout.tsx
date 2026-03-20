import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { NextIntlClientProvider } from "next-intl"
import { getMessages } from "next-intl/server"
import { notFound } from "next/navigation"
import { routing } from "@/i18n/routing"
import { LazyMotion, domAnimation } from "motion/react"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster } from "@/components/ui/sonner"
import { NavBar } from "@/components/shared/NavBar"
import { PageWrapper } from "@/components/shared/PageWrapper"
import "@/app/globals.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })

export const metadata: Metadata = {
  title: "SkyBook — Flight Search",
  description: "Search hundreds of airlines for the best deal",
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  if (!routing.locales.includes(locale as "en" | "ms" | "zh")) {
    notFound()
  }

  const messages = await getMessages()

  return (
    <html lang={locale} suppressHydrationWarning className={inter.variable}>
      <body className="font-sans antialiased">
        <NextIntlClientProvider messages={messages}>
          <LazyMotion features={domAnimation}>
            <TooltipProvider>
              <NavBar />
              <PageWrapper>{children}</PageWrapper>
              <Toaster position="bottom-right" />
            </TooltipProvider>
          </LazyMotion>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
