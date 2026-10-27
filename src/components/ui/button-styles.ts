export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'inverse'

export const buttonBaseClass =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-[var(--radius-btn)] px-5 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-line disabled:cursor-not-allowed disabled:opacity-50'

export const buttonVariantClass: Record<ButtonVariant, string> = {
  primary: 'bg-yellow text-ink-on-yellow hover:brightness-95',
  secondary: 'border-2 border-line bg-transparent text-line hover:bg-tint',
  ghost: 'bg-transparent text-line hover:bg-tint',
  // Dùng trên nền tối cố định (thẻ "deep") — không đổi theo sáng/tối trang.
  inverse:
    'border-2 border-white/50 bg-transparent text-white hover:bg-white/10',
}
