import { vi } from '@/i18n/vi'

export function LoadingState() {
  return (
    <div className="flex flex-1 items-center justify-center py-16 text-sm text-slate-500 dark:text-slate-400">
      {vi.loading}
    </div>
  )
}
