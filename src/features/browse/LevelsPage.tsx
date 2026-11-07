import { Link } from 'react-router-dom'
import { ErrorState } from '@/components/ErrorState'
import { LoadingState } from '@/components/LoadingState'
import { loadManifest } from '@/data/content-loader'
import { vi } from '@/i18n/vi'
import { useAsyncData } from '@/data/hooks/use-async-data'

export function LevelsPage() {
  const { data: manifest, loading, error } = useAsyncData(loadManifest, [])

  if (loading) return <LoadingState />
  if (error || !manifest) return <ErrorState />

  const levels = [...manifest.levels].sort((a, b) => b.order - a.order)

  return (
    <div className="flex flex-col gap-3 py-4">
      <h1 className="text-lg font-bold text-primary-900 dark:text-slate-100">
        {vi.levels.pageTitle}
      </h1>
      <ul className="flex flex-col gap-2">
        {levels.map((level) => (
          <li key={level.id}>
            <Link
              to={`/n/${level.id}`}
              className="flex min-h-11 items-center justify-between rounded-xl border border-slate-200 px-4 py-3 hover:border-primary-500 dark:border-slate-700"
            >
              <span className="font-medium">{level.title}</span>
              <span aria-hidden="true" className="text-primary-600">
                →
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
