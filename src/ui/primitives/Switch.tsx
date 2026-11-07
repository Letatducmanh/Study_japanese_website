interface SwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  'aria-label': string
}

/** Switch theo SPEC mục 5 — role="switch", track/thumb dùng màu line khi bật. */
export function Switch({
  checked,
  onChange,
  'aria-label': ariaLabel,
}: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-[var(--radius-pill)] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-line ${
        checked ? 'bg-line' : 'bg-track'
      }`}
    >
      <span
        className={`inline-block h-5 w-5 rounded-full bg-surface transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  )
}
