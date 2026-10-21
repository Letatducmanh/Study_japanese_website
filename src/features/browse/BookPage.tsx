import { Link, useParams } from 'react-router-dom'
import { ErrorState } from '@/components/ErrorState'
import { LoadingState } from '@/components/LoadingState'
import { NotFound } from '@/components/NotFound'
import { loadBookIndex, loadManifest } from '@/data/content-loader'
import { vi } from '@/i18n/vi'
import { useAsyncData } from '@/lib/use-async-data'

export function BookPage() {
  const { bookId } = useParams<{ bookId: string }>()
  const manifestState = useAsyncData(loadManifest, [])
  const indexState = useAsyncData(() => loadBookIndex(bookId!), [bookId])

  if (manifestState.loading || indexState.loading) return <LoadingState />
  if (
    manifestState.error ||
    indexState.error ||
    !manifestState.data ||
    !indexState.data
  ) {
    return <ErrorState />
  }

  const bookMeta = manifestState.data.levels
    .flatMap((l) => l.books)
    .find((b) => b.id === bookId)
  if (!bookMeta) return <NotFound />

  const lessonLabel = bookMeta.lessonLabel || vi.book.lessonLabelFallback

  return (
    <div className="flex flex-col gap-3 p-4">
      <h1 className="text-lg font-bold text-primary-900 dark:text-slate-100">
        {bookMeta.title}
      </h1>
      <h2 className="text-sm font-medium text-slate-500 dark:text-slate-400">
        {vi.book.lessonsTitle}
      </h2>
      <div className="grid grid-cols-5 gap-2 sm:grid-cols-8">
        {indexState.data.lessons.map((lesson) => (
          <Link
            key={lesson.lesson}
            to={`/b/${bookId}/${lesson.lesson}`}
            title={lesson.title}
            className="flex aspect-square min-h-11 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-sm font-medium text-slate-700 hover:border-primary-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            {lesson.lesson}
          </Link>
        ))}
      </div>
      <p className="text-xs text-slate-400">{lessonLabel}</p>
    </div>
  )
}
