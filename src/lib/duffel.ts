import "server-only"
import { DUFFEL_API_BASE_URL, DUFFEL_API_VERSION } from "@/lib/constants"

type Method = "GET" | "POST"

export async function duffelFetch<T>(
  path: string,
  options: { method?: Method; body?: unknown } = {}
): Promise<T> {
  const TOKEN = process.env.DUFFEL_API_KEY
  if (!TOKEN) throw new Error("DUFFEL_API_KEY is not set")

  const res = await fetch(`${DUFFEL_API_BASE_URL}${path}`, {
    method:  options.method ?? "GET",
    headers: {
      Authorization:    `Bearer ${TOKEN}`,
      "Duffel-Version": DUFFEL_API_VERSION,
      "Content-Type":   "application/json",
      Accept:           "application/json",
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new DuffelError(res.status, err?.errors?.[0] ?? { message: "Unknown error" })
  }

  return res.json() as Promise<T>
}

export class DuffelError extends Error {
  constructor(
    public readonly status: number,
    public readonly error: { title?: string; message?: string; code?: string }
  ) {
    super(error.message ?? "Duffel API error")
    this.name = "DuffelError"
  }
}
