import { Check } from 'lucide-react'
import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  selected: boolean
  children: ReactNode
}

/** Chip toggle theo SPEC mục 5: chọn = nền line + dấu ✓, chưa chọn = viền border-strong. */
export function Chip({ selected, children, className, ...props }: ChipProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={`inline-flex min-h-11 items-center gap-1.5 rounded-[var(--radius-pill)] border px-4 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-line ${
        selected
          ? 'border-line bg-line text-white'
          : 'border-border-strong bg-surface text-ink'
      } ${className ?? ''}`}
      {...props}
    >
      {selected && <Check size={16} strokeWidth={2.5} aria-hidden="true" />}
      {children}
    </button>
  )
}
