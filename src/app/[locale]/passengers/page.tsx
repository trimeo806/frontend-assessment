import { getTranslations } from "next-intl/server"
import { RequireSelectedOffer } from "@/components/shared/RequireSelectedOffer"
import { PassengerForm } from "@/components/passengers/PassengerForm"
import { BookingSummary } from "@/components/passengers/BookingSummary"
import { OfferExpiryGuard } from "@/components/passengers/OfferExpiryGuard"
import { ProgressStepper } from "@/components/shared/ProgressStepper"
import { AnimatedSection } from "@/components/shared/AnimatedSection"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Passenger Details \u2014 SkyBook" }

export default async function PassengersPage() {
  const t = await getTranslations("passengers")

  return (
    <div className="flex flex-col bg-secondary">
      <RequireSelectedOffer>
        <OfferExpiryGuard />
        <main className="flex-1 mx-auto w-full max-w-300 px-4 py-6">
          <div className="mb-6 rounded-xl bg-primary px-4 py-3 flex justify-center shadow-sm">
            <ProgressStepper step={3} />
          </div>
          <AnimatedSection delay={0.05}>
            <h1 className="text-2xl font-bold text-secondary-foreground mb-6">{t("heading")}</h1>
          </AnimatedSection>
          <div className="flex gap-6 items-start">
            <div className="flex-1">
              <PassengerForm />
            </div>
            <div className="hidden lg:block">
              <BookingSummary />
            </div>
          </div>
        </main>
      </RequireSelectedOffer>
    </div>
  )
}
