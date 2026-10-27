import type { ReactNode } from 'react'

interface EmptyStateProps {
  title?: string
  description?: string
  action?: ReactNode
  /**
   * panel (mặc định): khung nét đứt đầy đủ, dùng khi cả trang/khu vực chưa có gì.
   * inline: chỉ 2 thanh mờ, không khung/tiêu đề — gắn trong thẻ đã có tiêu đề riêng
   * (vd 3 thẻ "Hôm nay của bạn" ở trang chủ) để báo "nội dung thật sẽ hiện ở đây".
   */
  variant?: 'panel' | 'inline'
}

/** EmptyState theo SPEC mục 5: xem trước mờ thay cho nội dung chưa có, không chỉ chữ "Sắp có". */
export function EmptyState({
  title,
  description,
  action,
  variant = 'panel',
}: EmptyStateProps) {
  if (variant === 'inline') {
    return (
      <div aria-hidden="true" className="flex flex-col gap-2">
        <div className="h-2.5 w-full max-w-40 rounded-[var(--radius-pill)] bg-track opacity-60" />
        <div className="h-2.5 w-full max-w-28 rounded-[var(--radius-pill)] bg-track opacity-40" />
      </div>
    )
  }

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
      {title && <p className="text-base font-semibold text-ink">{title}</p>}
      {description && <p className="text-sm text-muted">{description}</p>}
      {action}
    </div>
  )
}
