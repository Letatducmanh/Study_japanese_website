interface JapanMotifBackgroundProps {
  className?: string
}

/**
 * Hậu cảnh trang trí: núi Phú Sĩ + cổng torii + vài cánh hoa anh đào, rất nhạt (trang trí,
 * không phải nội dung — `aria-hidden`). Dùng `currentColor` để tự đổi theo sáng/tối.
 */
export function JapanMotifBackground({ className }: JapanMotifBackgroundProps) {
  return (
    <svg
      viewBox="0 0 800 300"
      preserveAspectRatio="xMidYMax slice"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M520 260 L610 120 L640 160 L700 60 L800 260 Z"
        fill="currentColor"
        opacity="0.08"
      />
      <path
        d="M672 92 L700 60 L728 92 Q710 100 700 112 Q690 100 672 92 Z"
        fill="currentColor"
        opacity="0.14"
      />

      <g stroke="currentColor" strokeWidth="6" fill="none" opacity="0.1">
        <line x1="90" y1="100" x2="80" y2="260" />
        <line x1="210" y1="100" x2="220" y2="260" />
        <line x1="70" y1="100" x2="230" y2="100" />
        <line x1="60" y1="118" x2="240" y2="118" />
        <line x1="100" y1="130" x2="200" y2="130" />
      </g>

      <circle cx="340" cy="60" r="4" fill="var(--color-sakura-400)" opacity="0.5" />
      <circle cx="380" cy="110" r="3" fill="var(--color-sakura-400)" opacity="0.4" />
      <circle cx="300" cy="140" r="3" fill="var(--color-sakura-400)" opacity="0.4" />
      <circle cx="430" cy="40" r="3" fill="var(--color-sakura-400)" opacity="0.4" />
    </svg>
  )
}
