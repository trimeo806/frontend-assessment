import { cn } from "@/lib/utils"

interface Props {
  className?: string
  /** Size of the icon mark in px */
  iconSize?: number
}

export function SkyBookLogo({ className, iconSize = 32 }: Props) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      {/* Icon mark */}
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* White circular background with blue border */}
        <circle cx="16" cy="16" r="15" fill="white" />
        <circle cx="16" cy="16" r="15" stroke="white" strokeOpacity="0.3" strokeWidth="1" fill="none" />

        {/* Plane body — fuselage in primary blue */}
        <path
          d="M8 17.5L14.5 15.8L16.5 21.5L18.5 20.8L17.5 14.5L24 12L23.2 10L16.5 11.8L12 6L10 6.8L13 13L7 14.8L8 17.5Z"
          fill="#0770E3"
        />

        {/* Speed arcs in blue */}
        <path
          d="M5.5 22 Q8 19.5 11.5 20.5"
          stroke="#0770E3"
          strokeOpacity="0.4"
          strokeWidth="1.4"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M4 24.5 Q7.5 21.5 12.5 22.5"
          stroke="#0770E3"
          strokeOpacity="0.2"
          strokeWidth="1.2"
          strokeLinecap="round"
          fill="none"
        />
      </svg>

      {/* Wordmark */}
      <span className="font-bold text-xl tracking-tight leading-none text-white select-none">
        Sky<span className="text-white/70">Book</span>
      </span>
    </span>
  )
}
