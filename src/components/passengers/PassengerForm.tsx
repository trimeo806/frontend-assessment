"use client"
import { useForm, FormProvider } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTransition } from "react"
import { useTranslations } from "next-intl"
import { useRouter } from "@/navigation"
import { toast } from "sonner"
import { m } from "motion/react"
import { Accordion } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { passengerFormSchema, type PassengerFormValues } from "@/lib/types/forms"
import { createOrder } from "@/actions/booking"
import { useFlightStore } from "@/lib/store"
import { PassengerCard } from "./PassengerCard"
import { usePrefersReducedMotion } from "@/lib/animations/hooks"
import { stagger, duration, ease } from "@/lib/animations/tokens"
import { Loader2 } from "lucide-react"

const listVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: stagger.base, delayChildren: 0.05 } },
}
const itemVariants = {
  hidden:  { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: duration.base, ease: ease.out } },
}

export function PassengerForm() {
  const t = useTranslations("passengers")
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const { selectedOffer, passengerIds, setOrderId } = useFlightStore()
  const requiresPassport = useFlightStore(s => s.selectedOffer?.passenger_identity_documents_required ?? false)

  const paxCount = passengerIds.length
  const methods = useForm<PassengerFormValues>({
    resolver: zodResolver(passengerFormSchema),
    defaultValues: {
      passengers: Array.from({ length: paxCount }, () => ({
        title: "mr" as const,
        given_name: "",
        family_name: "",
        born_on: "",
        gender: "m" as const,
        email: "",
        phone: "",
      })),
    },
  })

  const TYPE_LABELS: Record<string, string> = {
    adult:               t("adult"),
    child:               t("child"),
    infant_without_seat: t("infant"),
  }

  const onSubmit = (values: PassengerFormValues) => {
    if (!selectedOffer) return
    startTransition(async () => {
      const result = await createOrder({
        offerId: selectedOffer.id,
        passengers: values.passengers.map((p, i) => ({
          id: passengerIds[i],
          ...p,
        })),
        totalAmount: selectedOffer.total_amount,
        totalCurrency: selectedOffer.total_currency,
      })
      if (!result.success) {
        toast.error(result.error)
        return
      }
      setOrderId(result.data.orderId)
      router.push(`/confirmation/${result.data.orderId}`)
    })
  }

  const reduced = usePrefersReducedMotion()
  const paxLabels = selectedOffer?.passengers.map((p, i) => `${TYPE_LABELS[p.type] ?? t("passenger", { n: i + 1 })} ${i + 1}`) ?? []

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-4">
        <Accordion
          multiple
          defaultValue={Array.from({ length: paxCount }, (_, i) => `pax-${i}`)}
        >
          {reduced ? (
            Array.from({ length: paxCount }, (_, i) => (
              <PassengerCard key={i} index={i} label={paxLabels[i] ?? t("passenger", { n: i + 1 })} requiresPassport={requiresPassport} />
            ))
          ) : (
            <m.div variants={listVariants} initial="hidden" animate="visible">
              {Array.from({ length: paxCount }, (_, i) => (
                <m.div key={i} variants={itemVariants}>
                  <PassengerCard index={i} label={paxLabels[i] ?? t("passenger", { n: i + 1 })} requiresPassport={requiresPassport} />
                </m.div>
              ))}
            </m.div>
          )}
        </Accordion>

        {/* Mobile sticky footer */}
        <div className="lg:hidden fixed bottom-0 inset-x-0 border-t bg-white p-4 flex items-center justify-between z-10">
          <div>
            <p className="text-xs text-muted-foreground">{t("total")}</p>
            <p className="text-xl font-bold">
              {selectedOffer?.total_currency} {parseFloat(selectedOffer?.total_amount ?? "0").toFixed(2)}
            </p>
          </div>
          <Button
            type="submit"
            disabled={isPending}
            className="bg-primary hover:bg-primary/90 text-white h-12 px-8"
          >
            {isPending
              ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />{t("booking")}</>
              : t("confirmBooking")}
          </Button>
        </div>

        {/* Desktop submit */}
        <div className="hidden lg:flex justify-end mt-4">
          <Button
            type="submit"
            disabled={isPending}
            className="bg-primary hover:bg-primary/90 text-white h-12 px-8"
          >
            {isPending
              ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />{t("booking")}</>
              : t("confirmBooking")}
          </Button>
        </div>
      </form>
    </FormProvider>
  )
}
