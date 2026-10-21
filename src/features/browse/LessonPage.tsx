import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ErrorState } from '@/components/ErrorState'
import { LoadingState } from '@/components/LoadingState'
import { NotFound } from '@/components/NotFound'
import { loadBookIndex } from '@/data/content-loader'
import { vi } from '@/i18n/vi'
import { useAsyncData } from '@/lib/use-async-data'

type Tab = 'vocab' | 'grammar' | 'kanji'

export function LessonPage() {
  const { bookId, lesson } = useParams<{ bookId: string; lesson: string }>()
  const lessonNumber = Number(lesson)
  const [tab, setTab] = useState<Tab>('vocab')

  const {
    data: index,
    loading,
    error,
  } = useAsyncData(() => loadBookIndex(bookId!), [bookId])

  if (loading) return <LoadingState />
  if (error || !index) return <ErrorState />

  const lessonMeta = index.lessons.find((l) => l.lesson === lessonNumber)
  if (!lessonMeta) return <NotFound />

  const tabs: { id: Tab; label: string }[] = [
    { id: 'vocab', label: vi.lesson.tabVocab },
    { id: 'grammar', label: vi.lesson.tabGrammar },
    { id: 'kanji', label: vi.lesson.tabKanji },
  ]

  return (
    <div className="flex flex-col gap-3 p-4">
      <h1 className="text-lg font-bold text-primary-900 dark:text-slate-100">
        {lessonMeta.title}
      </h1>

      <div className="flex gap-1 border-b border-slate-200 dark:border-slate-800">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`min-h-11 flex-1 border-b-2 px-2 text-sm font-medium ${
              tab === t.id
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-slate-500 dark:text-slate-400'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="py-4 text-sm text-slate-500 dark:text-slate-400">
        {tab === 'vocab' && (
          <p>
            {vi.lesson.vocabMainTitle}: {lessonMeta.vocabCount}
          </p>
        )}
        {tab === 'grammar' && <p>{vi.lesson.grammarComingSoon}</p>}
        {tab === 'kanji' && <p>{vi.lesson.kanjiComingSoon}</p>}
      </div>

      <Link
        to="/practice/setup"
        className="flex min-h-11 items-center justify-center rounded-full bg-primary-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-700"
      >
        {vi.lesson.practiceCta}
      </Link>
    </div>
  )
}
