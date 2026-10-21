import { Link } from 'react-router-dom'
import { vi } from '@/i18n/vi'

export function HomePage() {
  return (
    <div className="flex flex-col gap-6 p-4">
      <section className="flex flex-col items-center gap-3 py-10 text-center">
        <h1 className="text-2xl font-bold text-primary-700 dark:text-primary-600">
          {vi.home.heroTitle}
        </h1>
        <p className="max-w-sm text-sm text-slate-500 dark:text-slate-400">
          {vi.home.heroSubtitle}
        </p>
        <Link
          to="/n"
          className="mt-2 flex min-h-11 items-center justify-center rounded-full bg-primary-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-primary-700"
        >
          {vi.home.browseCta}
        </Link>
      </section>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[vi.home.reviewTitle, vi.home.weakTitle, vi.home.streakTitle].map(
          (title) => (
            <div
              key={title}
              className="rounded-xl border border-slate-200 p-4 text-sm text-slate-400 dark:border-slate-700"
            >
              <p className="font-medium text-slate-600 dark:text-slate-300">
                {title}
              </p>
              <p className="mt-1">{vi.comingSoon.title}</p>
            </div>
          ),
        )}
      </section>
    </div>
  )
}
