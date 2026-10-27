import type { ReactNode } from 'react'

interface EmptyStateProps {
  title: string
  description?: string
  action?: ReactNode
}

/** EmptyState theo SPEC mục 5: khung nét đứt mờ thay cho nội dung chưa có, không chỉ chữ "Sắp có". */
export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-[var(--radius-frame)] border border-dashed border-border-strong bg-bg p-8 text-center">
      <div
        aria-hidden="true"
        className="h-3 w-24 rounded-[var(--radius-pill)] bg-track opacity-60"
      />
      <div
        aria-hidden="true"
        className="h-3 w-40 rounded-[var(--radius-pill)] bg-track opacity-40"
      />
      <p className="text-base font-semibold text-ink">{title}</p>
      {description && <p className="text-sm text-muted">{description}</p>}
      {action}
    </div>
  )
}
