"use client"
import { useEffect, useState, startTransition } from "react"
import { useTranslations } from "next-intl"
import { useRouter } from "@/navigation"
import { useFlightStore } from "@/lib/store"
import { ROUTES } from "@/lib/constants"
import {
  AlertDialog, AlertDialogAction, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from "@/components/ui/alert-dialog"

export function OfferExpiryGuard() {
  const t = useTranslations("passengers")
  const router = useRouter()
  const { selectedOffer, resetAll } = useFlightStore()
  const [expired, setExpired] = useState(false)

  useEffect(() => {
    if (!selectedOffer?.expires_at) return
    const ms = new Date(selectedOffer.expires_at).getTime() - Date.now()
    if (ms <= 0) {
      startTransition(() => setExpired(true))
      return
    }
    const timerId = setTimeout(() => startTransition(() => setExpired(true)), ms)
    return () => clearTimeout(timerId)
  }, [selectedOffer])

  const handleNewSearch = () => {
    resetAll()
    router.replace(ROUTES.HOME)
  }

  return (
    <AlertDialog open={expired}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("offerExpiredTitle")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("offerExpiredDescription")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={handleNewSearch}>{t("startNewSearch")}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
