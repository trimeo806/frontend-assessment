import type { Metadata } from "next"
import type { ReactNode } from "react"

export const metadata: Metadata = {
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icon", type: "image/png" },
    ],
    shortcut: "/favicon.svg",
  },
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
