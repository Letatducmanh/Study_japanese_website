import type { HTMLAttributes } from 'react'

/**
 * Container căn giữa theo SPEC mục 7: full width dưới 768px, 720px từ 768px,
 * tối đa 1200px từ 1024px.
 */
export function Container({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`w-full px-4 md:mx-auto md:max-w-[720px] md:px-6 lg:max-w-[1200px] ${className ?? ''}`}
      {...props}
    />
  )
}
