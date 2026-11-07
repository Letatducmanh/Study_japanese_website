import type { HTMLAttributes } from 'react'

/** Khung thẻ dùng chung theo SPEC mục 4: nền surface, viền border, bo góc 14px. */
export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-[var(--radius-card)] border border-border bg-surface ${className ?? ''}`}
      {...props}
    />
  )
}
