import type { ButtonHTMLAttributes } from 'react'
import {
  buttonBaseClass,
  buttonVariantClass,
  type ButtonVariant,
} from './button-styles'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
}

/** Nút dùng chung theo SPEC mục 5 — chính (vàng), phụ (viền xanh), ghost. Xem `LinkButton` cho điều hướng. */
export function Button({
  variant = 'primary',
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      className={`${buttonBaseClass} ${buttonVariantClass[variant]} ${className ?? ''}`}
      {...props}
    />
  )
}
