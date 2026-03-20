export interface DuffelListResponse<T> {
  data: T[]
  meta: { limit: number; after: string | null; before: string | null }
}

export interface DuffelSingleResponse<T> {
  data: T
}

// --- Places ---

export interface DuffelPlace {
  id: string
  iata_code: string
  name: string
  city_name: string
  iata_city_code: string
  iata_country_code: string
  time_zone: string
  type: "airport" | "city"
}

export interface DuffelCity {
  id: string
  name: string
  iata_city_code: string
  iata_country_code: string
  time_zone: string
  airports: DuffelPlace[]
}

// --- Carrier ---

export interface DuffelCarrier {
  id: string
  name: string
  iata_code: string
  logo_symbol_url: string
  logo_lockup_url: string
}

// --- Offer ---

export interface FareCondition {
  allowed: boolean
  penalty_amount: string | null
  penalty_currency: string | null
}

export interface CabinAmenities {
  wifi:  { available: boolean; cost: "free" | "paid" | null }
  seat:  { pitch: string | null; legroom: string | null }
  power: { available: boolean }
}

export interface SegmentPassenger {
  passenger_id: string
  cabin_class: string
  cabin_class_marketing_name: string
  fare_basis_code: string
  cabin: { name: string; amenities: CabinAmenities }
  baggages: { type: "checked" | "carry_on"; quantity: number }[]
}

export interface DuffelSegment {
  id: string
  departing_at: string
  arriving_at: string
  duration: string
  origin: DuffelPlace
  destination: DuffelPlace
  origin_terminal: string | null
  destination_terminal: string | null
  operating_carrier: DuffelCarrier
  marketing_carrier: DuffelCarrier
  operating_carrier_flight_number: string
  aircraft: { name: string; iata_code: string } | null
  stops: unknown[]
  passengers: SegmentPassenger[]
}

export interface DuffelSlice {
  id: string
  duration: string
  fare_brand_name: string | null
  origin: DuffelPlace
  destination: DuffelPlace
  segments: DuffelSegment[]
}

export interface OfferPassenger {
  id: string
  type: "adult" | "child" | "infant_without_seat"
  given_name: string | null
  family_name: string | null
}

export interface DuffelOffer {
  id: string
  total_amount: string
  total_currency: string
  base_amount: string
  tax_amount: string
  expires_at: string
  live_mode: boolean
  owner: DuffelCarrier
  passengers: OfferPassenger[]
  slices: DuffelSlice[]
  conditions: {
    refund_before_departure: FareCondition
    change_before_departure: FareCondition
  }
  payment_requirements: {
    requires_instant_payment: boolean
    price_guarantee_expires_at: string
    payment_required_by: string
  }
  passenger_identity_documents_required: boolean
  supported_passenger_identity_document_types: string[]
}

// --- Order ---

export interface OrderPassenger {
  id: string
  given_name: string
  family_name: string
  title: string
  type: string
  born_on: string
  email: string
  phone_number: string
}

export interface DuffelOrder {
  id: string
  booking_reference: string
  status: "confirmed" | "cancelled"
  total_amount: string
  total_currency: string
  base_amount: string
  tax_amount: string
  passengers: OrderPassenger[]
  slices: DuffelSlice[]
  live_mode: boolean
}
