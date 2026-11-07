import { Link } from 'react-router-dom'
import { vi } from '@/i18n/vi'

interface ComingSoonProps {
  title?: string
}

export function ComingSoon({ title = vi.comingSoon.title }: ComingSoonProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 py-16 text-center">
      <h1 className="text-xl font-semibold text-primary-900 dark:text-slate-100">
        {title}
      </h1>
      <p className="max-w-sm text-sm text-slate-500 dark:text-slate-400">
        {vi.comingSoon.description}
      </p>
      <Link
        to="/"
        className="mt-2 rounded-full bg-primary-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-700"
      >
        {vi.comingSoon.backHome}
      </Link>
    </div>
  )
}
