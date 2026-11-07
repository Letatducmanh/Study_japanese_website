import { vi } from '@/i18n/vi'

interface ErrorStateProps {
  message?: string
}

export function ErrorState({ message = vi.error.loadFailed }: ErrorStateProps) {
  return (
    <div className="flex flex-1 items-center justify-center py-16 text-sm text-danger">
      {message}
    </div>
  )
}
