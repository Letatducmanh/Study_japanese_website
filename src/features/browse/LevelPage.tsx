import { Link, useParams } from 'react-router-dom'
import { ErrorState } from '@/components/ErrorState'
import { LoadingState } from '@/components/LoadingState'
import { NotFound } from '@/components/NotFound'
import { loadManifest } from '@/data/content-loader'
import { vi } from '@/i18n/vi'
import { useAsyncData } from '@/lib/use-async-data'

export function LevelPage() {
  const { level: levelId } = useParams<{ level: string }>()
  const { data: manifest, loading, error } = useAsyncData(loadManifest, [])

  if (loading) return <LoadingState />
  if (error || !manifest) return <ErrorState />

  const level = manifest.levels.find((l) => l.id === levelId)
  if (!level) return <NotFound />

  return (
    <div className="flex flex-col gap-3 py-4">
      <h1 className="text-lg font-bold text-primary-900 dark:text-slate-100">
        {level.title}
      </h1>
      <h2 className="text-sm font-medium text-slate-500 dark:text-slate-400">
        {vi.level.booksTitle}
      </h2>
      <ul className="flex flex-col gap-2">
        {level.books.map((book) => (
          <li key={book.id}>
            <Link
              to={`/b/${book.id}`}
              className="flex min-h-11 items-center justify-between rounded-xl border border-slate-200 px-4 py-3 hover:border-primary-500 dark:border-slate-700"
            >
              <span className="font-medium">{book.title}</span>
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
