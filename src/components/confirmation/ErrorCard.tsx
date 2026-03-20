"use client"
import { useTranslations } from "next-intl"
import { useRouter } from "@/navigation"
import { AlertCircle } from "lucide-react"
import { m } from "motion/react"
import { Button } from "@/components/ui/button"
import { useFlightStore } from "@/lib/store"

interface Props { message?: string }

export function ErrorCard({ message }: Props) {
  const t = useTranslations("confirmation")
  const router = useRouter()
  const resetAll = useFlightStore((s) => s.resetAll)
  return (
    <m.div
      className="bg-white rounded-xl border border-error/30 p-8 max-w-md mx-auto text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <AlertCircle className="h-12 w-12 text-error mx-auto mb-4" />
      <h2 className="text-lg font-bold mb-2">{t("unableToRetrieve")}</h2>
      <p className="text-sm text-muted-foreground mb-6">
        {message ?? t("unableToRetrieveDetail")}
      </p>
      <Button onClick={() => { resetAll(); router.push("/") }} variant="outline">
        {t("returnToSearch")}
      </Button>
    </m.div>
  )
}
