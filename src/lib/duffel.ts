import "server-only"

const BASE_URL = "https://api.duffel.com"
const TOKEN    = process.env.DUFFEL_API_KEY!

if (!TOKEN) throw new Error("DUFFEL_API_KEY is not set")

type Method = "GET" | "POST"

export async function duffelFetch<T>(
  path: string,
  options: { method?: Method; body?: unknown } = {}
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method:  options.method ?? "GET",
    headers: {
      Authorization:    `Bearer ${TOKEN}`,
      "Duffel-Version": "v2",
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
