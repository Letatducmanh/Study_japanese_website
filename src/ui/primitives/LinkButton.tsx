import { Link, type LinkProps } from 'react-router-dom'
import {
  buttonBaseClass,
  buttonVariantClass,
  type ButtonVariant,
} from './button-styles'

interface LinkButtonProps extends LinkProps {
  variant?: ButtonVariant
}

/** Như `Button` nhưng điều hướng (react-router `Link`) thay vì submit/onClick. */
export function LinkButton({
  variant = 'primary',
  className,
  ...props
}: LinkButtonProps) {
  return (
    <Link
      className={`${buttonBaseClass} ${buttonVariantClass[variant]} ${className ?? ''}`}
      {...props}
    />
  )
}
