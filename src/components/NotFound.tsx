import { Link } from 'react-router-dom'
import { vi } from '@/i18n/vi'

export function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 py-16 text-center">
      <p className="text-5xl font-bold text-primary-600">404</p>
      <h1 className="text-xl font-semibold text-primary-900 dark:text-slate-100">
        {vi.notFound.title}
      </h1>
      <p className="max-w-sm text-sm text-slate-500 dark:text-slate-400">
        {vi.notFound.description}
      </p>
      <Link
        to="/"
        className="mt-2 rounded-full bg-primary-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-700"
      >
        {vi.notFound.backHome}
      </Link>
    </div>
  )
}
