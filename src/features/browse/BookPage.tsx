import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ErrorState } from '@/components/ErrorState'
import { LoadingState } from '@/components/LoadingState'
import { NotFound } from '@/components/NotFound'
import { loadBookIndex, loadManifest } from '@/data/content-loader'
import { progressRepository } from '@/data/progress/dexie-repo'
import { computeLessonScores } from '@/domain/mastery/lesson-scores'
import { vi } from '@/i18n/vi'
import { heatmapClass } from '@/lib/heatmap'
import { useAsyncData } from '@/data/hooks/use-async-data'

export function BookPage() {
  const { bookId } = useParams<{ bookId: string }>()
  const manifestState = useAsyncData(loadManifest, [])
  const indexState = useAsyncData(() => loadBookIndex(bookId!), [bookId])
  const masteryState = useAsyncData(
    () => progressRepository.listAllMastery(),
    [],
  )

  const bookMeta = manifestState.data?.levels
    .flatMap((l) => l.books)
    .find((b) => b.id === bookId)
  const isTextbook = bookMeta?.type === 'textbook'

  /** Độ thành thạo từng bài (mục 6.5), chỉ tính cho giáo trình từ vựng (`type: 'textbook'`). */
  const lessonScores = useMemo(() => {
    if (!isTextbook || !masteryState.data || !indexState.data) {
      return new Map<number, number>()
    }
    return computeLessonScores(
      masteryState.data,
      bookId!,
      indexState.data.lessons,
    )
  }, [isTextbook, masteryState.data, indexState.data, bookId])

  if (manifestState.loading || indexState.loading) return <LoadingState />
  if (
    manifestState.error ||
    indexState.error ||
    !manifestState.data ||
    !indexState.data
  ) {
    return <ErrorState />
  }
  if (!bookMeta) return <NotFound />

  const lessonLabel = bookMeta.lessonLabel || vi.book.lessonLabelFallback

  return (
    <div className="flex flex-col gap-3 py-4">
      <h1 className="text-lg font-bold text-primary-900 dark:text-slate-100">
        {bookMeta.title}
      </h1>
      <h2 className="text-sm font-medium text-slate-500 dark:text-slate-400">
        {vi.book.lessonsTitle}
      </h2>
      <div className="grid grid-cols-5 gap-2 sm:grid-cols-8">
        {indexState.data.lessons.map((lesson) => {
          const score =
            lesson.lesson === 'appendix'
              ? null
              : (lessonScores.get(lesson.lesson) ?? null)
          return (
            <Link
              key={lesson.lesson}
              to={`/b/${bookId}/${lesson.lesson}`}
              title={lesson.title}
              className={`flex aspect-square min-h-11 items-center justify-center rounded-lg border text-sm font-medium hover:border-primary-500 ${heatmapClass(score)}`}
            >
              {lesson.lesson}
            </Link>
          )
        })}
      </div>
      <p className="text-xs text-slate-400">{lessonLabel}</p>
    </div>
  )
}
