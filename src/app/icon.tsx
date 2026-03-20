import { ImageResponse } from "next/og"

export const size = { width: 32, height: 32 }
export const contentType = "image/png"

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          background: "#ffffff",
          border: "2px solid #0770E3",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Plane silhouette — matches SkyBookLogo SVG path */}
        <svg
          width="20"
          height="20"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M8 17.5L14.5 15.8L16.5 21.5L18.5 20.8L17.5 14.5L24 12L23.2 10L16.5 11.8L12 6L10 6.8L13 13L7 14.8L8 17.5Z"
            fill="#0770E3"
          />
        </svg>
      </div>
    ),
    { ...size }
  )
}
