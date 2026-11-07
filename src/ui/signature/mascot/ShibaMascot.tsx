interface ShibaMascotProps {
  className?: string
}

/**
 * Linh vật Shiba Inu đeo hachimaki (khăn cổ vũ) — hình vector gốc, không dùng ảnh
 * ngoài để tránh vấn đề bản quyền. Vẫy tay chào ở trang chủ (mục 7 — thiết kế sinh động hơn).
 */
export function ShibaMascot({ className }: ShibaMascotProps) {
  return (
    <svg
      viewBox="0 0 200 200"
      className={className}
      role="img"
      aria-label="Shiba Inu đang vẫy tay chào bạn học tiếng Nhật"
    >
      <ellipse cx="100" cy="170" rx="56" ry="30" fill="var(--color-shiba-500)" />

      <path d="M46 72 L26 14 L78 54 Z" fill="var(--color-shiba-500)" />
      <path d="M52 64 L40 30 L70 52 Z" fill="var(--color-shiba-300)" />
      <path d="M154 72 L174 14 L122 54 Z" fill="var(--color-shiba-500)" />
      <path d="M148 64 L160 30 L130 52 Z" fill="var(--color-shiba-300)" />

      <ellipse cx="100" cy="106" rx="70" ry="64" fill="var(--color-shiba-500)" />
      <ellipse cx="100" cy="126" rx="46" ry="38" fill="#fff8f0" />

      <path
        d="M34 74 Q100 50 166 74 L166 86 Q100 64 34 86 Z"
        fill="#dc2626"
      />
      <circle cx="100" cy="78" r="6" fill="#fff8f0" />
      <path d="M160 76 L178 70 L174 84 Z" fill="#dc2626" />

      <path
        d="M70 94 Q80 84 90 92"
        stroke="#5b3a21"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M130 94 Q120 84 110 92"
        stroke="#5b3a21"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
      />

      <circle cx="78" cy="112" r="6" fill="#2b1b12" />
      <circle cx="80.5" cy="109.5" r="2" fill="#fff" />
      <circle cx="122" cy="112" r="6" fill="#2b1b12" />
      <circle cx="124.5" cy="109.5" r="2" fill="#fff" />

      <ellipse
        cx="64"
        cy="130"
        rx="9"
        ry="6"
        fill="var(--color-sakura-400)"
        opacity="0.7"
      />
      <ellipse
        cx="136"
        cy="130"
        rx="9"
        ry="6"
        fill="var(--color-sakura-400)"
        opacity="0.7"
      />

      <path
        d="M93 126 Q100 132 107 126 Q107 136 100 138 Q93 136 93 126 Z"
        fill="#2b1b12"
      />
      <path
        d="M100 138 Q92 148 82 142"
        stroke="#5b3a21"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M100 138 Q108 148 118 142"
        stroke="#5b3a21"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />

      <g className="mascot-wave-paw">
        <ellipse
          cx="152"
          cy="148"
          rx="16"
          ry="22"
          fill="var(--color-shiba-500)"
          transform="rotate(-20 152 148)"
        />
        <ellipse cx="150" cy="130" rx="11" ry="13" fill="#fff8f0" />
      </g>
    </svg>
  )
}
