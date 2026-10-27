import type { ButtonHTMLAttributes } from 'react'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
}

const base =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-[var(--radius-btn)] px-5 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-line disabled:cursor-not-allowed disabled:opacity-50'

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-yellow text-ink-on-yellow hover:brightness-95',
  secondary: 'border-2 border-line bg-transparent text-line hover:bg-tint',
  ghost: 'bg-transparent text-line hover:bg-tint',
}

/** Nút dùng chung theo SPEC mục 5 — chính (vàng), phụ (viền xanh), ghost. */
export function Button({
  variant = 'primary',
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      className={`${base} ${variants[variant]} ${className ?? ''}`}
      {...props}
    />
  )
}
