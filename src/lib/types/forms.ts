import { z } from "zod"

const airportSchema = z.object({
  iata: z.string().length(3, "Select a valid airport"),
  name: z.string().min(1),
  city: z.string().min(1),
})

const passengerCountSchema = z.object({
  type:  z.enum(["adult", "child", "infant_without_seat"]),
  count: z.number().int().min(0).max(9),
})

export const searchFormSchema = z
  .object({
    tripType:    z.enum(["one_way", "round_trip"]),
    origin:      airportSchema,
    destination: airportSchema,
    departDate:  z
      .string()
      .min(1, "Select a departure date")
      .refine(
        (d) => new Date(d) >= new Date(new Date().setHours(0, 0, 0, 0)),
        "Departure must be today or later"
      ),
    returnDate:  z.string().nullable(),
    passengers:  z
      .array(passengerCountSchema)
      .refine(
        (p) => p.reduce((sum, x) => sum + x.count, 0) >= 1,
        "At least 1 passenger required"
      ),
    cabinClass:  z.enum(["economy", "premium_economy", "business", "first"]),
  })
  .refine(
    (d) => d.origin.iata !== d.destination.iata,
    { message: "Origin and destination must differ", path: ["destination"] }
  )
  .refine(
    (d) => d.tripType === "one_way" || !!d.returnDate,
    { message: "Select a return date", path: ["returnDate"] }
  )
  .refine(
    (d) =>
      !d.returnDate || !d.departDate ||
      new Date(d.returnDate) >= new Date(d.departDate),
    { message: "Return must be after departure", path: ["returnDate"] }
  )

export type SearchFormValues = z.infer<typeof searchFormSchema>

export const searchFormDefaults: SearchFormValues = {
  tripType:    "one_way",
  origin:      { iata: "", name: "", city: "" },
  destination: { iata: "", name: "", city: "" },
  departDate:  "",
  returnDate:  null,
  passengers:  [
    { type: "adult",               count: 1 },
    { type: "child",               count: 0 },
    { type: "infant_without_seat", count: 0 },
  ],
  cabinClass:  "economy",
}

// ─── Passenger Form ──────────────────────────────────────────────────────────

const identityDocumentSchema = z.object({
  type:                 z.literal("passport"),
  number:               z.string().min(3, "Passport number required"),
  issuing_country_code: z.string().length(2, "Enter 2-letter country code").transform(s => s.toUpperCase()),
  expires_on:           z.string()
    .min(1, "Expiry date required")
    .refine(d => !isNaN(Date.parse(d)) && new Date(d) > new Date(), "Passport must not be expired"),
})

const basePassengerFields = {
  title:       z.enum(["mr", "ms", "mrs", "miss", "dr"]),
  given_name:  z.string().min(1, "First name required"),
  family_name: z.string().min(1, "Last name required"),
  born_on:     z
    .string()
    .min(1, "Date of birth required")
    .refine(
      (d) => !isNaN(Date.parse(d)) && new Date(d) < new Date(),
      "Enter a valid date of birth"
    ),
  gender:      z.enum(["m", "f"]),
  email:       z.string().email("Enter a valid email"),
  phone:       z.string().regex(/^\+\d{7,15}$/, "Use international format e.g. +60123456789"),
}

export const singlePassengerSchema = z.object({
  ...basePassengerFields,
  identity_document: identityDocumentSchema.optional(),
})

export function makePassengerFormSchema(requiresPassport: boolean) {
  const passengerSchema = z.object({
    ...basePassengerFields,
    identity_document: requiresPassport
      ? identityDocumentSchema
      : identityDocumentSchema.optional(),
  })
  return z.object({ passengers: z.array(passengerSchema) })
}

export const passengerFormSchema = z.object({
  passengers: z.array(singlePassengerSchema),
})

export type SinglePassengerValues = z.infer<typeof singlePassengerSchema>
export type PassengerFormValues = z.infer<typeof passengerFormSchema>
