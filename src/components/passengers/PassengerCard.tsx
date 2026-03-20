"use client"
import { useTranslations } from "next-intl"
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useFormContext, Controller } from "react-hook-form"
import type { PassengerFormValues } from "@/lib/types/forms"
import { User } from "lucide-react"
import { DateOfBirthPicker } from "./DateOfBirthPicker"

interface Props { index: number; label: string; requiresPassport?: boolean }

export function PassengerCard({ index, label, requiresPassport }: Props) {
  const t = useTranslations("passengers")
  const { register, control, formState: { errors } } = useFormContext<PassengerFormValues>()
  const paxErrors = errors.passengers?.[index]

  const TITLES = [
    { value: "mr",   label: t("titleMr") },
    { value: "ms",   label: t("titleMs") },
    { value: "mrs",  label: t("titleMrs") },
    { value: "miss", label: t("titleMiss") },
    { value: "dr",   label: t("titleDr") },
  ]

  const GENDERS = [
    { value: "m", label: t("male") },
    { value: "f", label: t("female") },
  ]

  return (
    <AccordionItem value={`pax-${index}`} className="bg-white rounded-xl border border-border px-4 mb-3">
      <AccordionTrigger className="gap-3 hover:no-underline">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-4 w-4 text-primary" />
          </div>
          <span className="font-medium text-sm">{label}</span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="pb-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Title */}
          <div>
            <Label className="text-xs mb-1.5 block">{t("title")}</Label>
            <Controller
              control={control}
              name={`passengers.${index}.title`}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="h-10 w-full">
                    <SelectValue placeholder={t("select")}>
                      {TITLES.find((opt) => opt.value === field.value)?.label}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {TITLES.map(({ value, label: lbl }) => (
                      <SelectItem key={value} value={value}>{lbl}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {/* Gender */}
          <div>
            <Label className="text-xs mb-1.5 block">{t("gender")}</Label>
            <Controller
              control={control}
              name={`passengers.${index}.gender`}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="h-10 w-full">
                    <SelectValue placeholder={t("select")}>
                      {GENDERS.find((opt) => opt.value === field.value)?.label}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {GENDERS.map(({ value, label: lbl }) => (
                      <SelectItem key={value} value={value}>{lbl}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {/* First name */}
          <div>
            <Label className="text-xs mb-1.5 block">{t("firstName")}</Label>
            <Input
              {...register(`passengers.${index}.given_name`)}
              placeholder={t("givenName")}
              className="h-10"
            />
            {paxErrors?.given_name && (
              <p className="text-xs text-error mt-1">{paxErrors.given_name.message}</p>
            )}
          </div>

          {/* Last name */}
          <div>
            <Label className="text-xs mb-1.5 block">{t("lastName")}</Label>
            <Input
              {...register(`passengers.${index}.family_name`)}
              placeholder={t("familyName")}
              className="h-10"
            />
            {paxErrors?.family_name && (
              <p className="text-xs text-error mt-1">{paxErrors.family_name.message}</p>
            )}
          </div>

          {/* Date of birth */}
          <div>
            <Label className="text-xs mb-1.5 block">{t("dateOfBirth")}</Label>
            <Controller
              control={control}
              name={`passengers.${index}.born_on`}
              render={({ field }) => (
                <DateOfBirthPicker
                  value={field.value || ""}
                  onChange={field.onChange}
                  error={paxErrors?.born_on?.message}
                />
              )}
            />
          </div>

          {/* Email */}
          <div>
            <Label className="text-xs mb-1.5 block">{t("email")}</Label>
            <Input
              {...register(`passengers.${index}.email`)}
              type="email"
              placeholder={t("emailPlaceholder")}
              className="h-10"
            />
            {paxErrors?.email && (
              <p className="text-xs text-error mt-1">{paxErrors.email.message}</p>
            )}
          </div>

          {/* Phone — full width */}
          <div className="sm:col-span-2">
            <Label className="text-xs mb-1.5 block">{t("phone")}</Label>
            <Input
              {...register(`passengers.${index}.phone`)}
              type="tel"
              placeholder={"+60123456789"}
              className="h-10"
            />
            {paxErrors?.phone && (
              <p className="text-xs text-error mt-1">{paxErrors.phone.message}</p>
            )}
          </div>

          {/* Travel Document */}
          {requiresPassport && (
            <>
              <p className="sm:col-span-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide mt-2">
                Travel Document
              </p>

              {/* Passport number */}
              <div>
                <Label className="text-xs mb-1.5 block">{t("passportNumber")}</Label>
                <Input
                  {...register(`passengers.${index}.identity_document.number`)}
                  placeholder={t("passportNumberPlaceholder")}
                  className="h-10"
                />
                {paxErrors?.identity_document?.number && (
                  <p className="text-xs text-error mt-1">{paxErrors.identity_document.number.message}</p>
                )}
              </div>

              {/* Issuing country code */}
              <div>
                <Label className="text-xs mb-1.5 block">{t("issuingCountry")}</Label>
                <Input
                  {...register(`passengers.${index}.identity_document.issuing_country_code`)}
                  placeholder="MY"
                  maxLength={2}
                  className="h-10 uppercase"
                />
                {paxErrors?.identity_document?.issuing_country_code && (
                  <p className="text-xs text-error mt-1">{paxErrors.identity_document.issuing_country_code.message}</p>
                )}
              </div>

              {/* Expiry date — hidden type field */}
              <input
                type="hidden"
                {...register(`passengers.${index}.identity_document.type`)}
                value="passport"
              />

              {/* Expiry date */}
              <div className="sm:col-span-2">
                <Label className="text-xs mb-1.5 block">{t("passportExpiry")}</Label>
                <Input
                  {...register(`passengers.${index}.identity_document.expires_on`)}
                  type="date"
                  className="h-10"
                />
                {paxErrors?.identity_document?.expires_on && (
                  <p className="text-xs text-error mt-1">{paxErrors.identity_document.expires_on.message}</p>
                )}
              </div>
            </>
          )}
        </div>
      </AccordionContent>
    </AccordionItem>
  )
}
