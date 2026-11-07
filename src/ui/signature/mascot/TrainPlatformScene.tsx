interface TrainPlatformSceneProps {
  className?: string
}

/**
 * Sân ga + đoàn tàu (SPEC mục 5 — mascot "đứng trên sân ga bên cạnh đoàn tàu"), chỉ dùng
 * token màu (`var(--color-*)`), không hard-code hex. Trang trí, không phải nội dung.
 */
export function TrainPlatformScene({ className }: TrainPlatformSceneProps) {
  return (
    <svg
      viewBox="0 0 400 140"
      preserveAspectRatio="xMidYMax meet"
      aria-hidden="true"
      className={className}
    >
      <rect x="0" y="120" width="400" height="4" fill="var(--color-track)" />
      <rect
        x="0"
        y="126"
        width="400"
        height="2"
        fill="var(--color-line)"
        opacity="0.6"
      />

      <g>
        <rect
          x="180"
          y="38"
          width="200"
          height="74"
          rx="14"
          fill="var(--color-line)"
        />
        <rect
          x="196"
          y="54"
          width="34"
          height="30"
          rx="6"
          fill="var(--color-surface)"
        />
        <rect
          x="244"
          y="54"
          width="34"
          height="30"
          rx="6"
          fill="var(--color-surface)"
        />
        <rect
          x="292"
          y="54"
          width="34"
          height="30"
          rx="6"
          fill="var(--color-surface)"
        />
        <rect
          x="340"
          y="54"
          width="28"
          height="30"
          rx="6"
          fill="var(--color-surface)"
        />
        <rect x="180" y="100" width="200" height="8" fill="var(--color-deep)" />
        <circle cx="212" cy="120" r="10" fill="var(--color-deep)" />
        <circle cx="348" cy="120" r="10" fill="var(--color-deep)" />
      </g>
    </svg>
  )
}
