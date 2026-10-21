import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ErrorState } from '@/components/ErrorState'
import { KanjiCard } from '@/components/KanjiCard'
import { LoadingState } from '@/components/LoadingState'
import { NotFound } from '@/components/NotFound'
import {
  findLevelIdForBook,
  loadBookIndex,
  loadKanjiChapter,
  loadLesson,
  loadManifest,
} from '@/data/content-loader'
import { GrammarTab } from '@/features/browse/GrammarTab'
import { KanjiRelatedTab } from '@/features/browse/KanjiRelatedTab'
import { VocabTab } from '@/features/browse/VocabTab'
import { vi } from '@/i18n/vi'
import { useAsyncData } from '@/lib/use-async-data'
import type { EditionFilter } from '@/domain/types'

type Tab = 'vocab' | 'grammar' | 'kanji'

export function LessonPage() {
  const { bookId, lesson } = useParams<{ bookId: string; lesson: string }>()

  const manifestState = useAsyncData(loadManifest, [])
  const bookMeta = manifestState.data?.levels
    .flatMap((l) => l.books)
    .find((b) => b.id === bookId)

  if (manifestState.loading) return <LoadingState />
  if (manifestState.error || !manifestState.data) return <ErrorState />
  if (!bookMeta) return <NotFound />

  if (bookMeta.type === 'kanji') {
    return <KanjiChapterLesson bookId={bookId!} chapterParam={lesson!} />
  }

  const levelId = findLevelIdForBook(manifestState.data, bookId!)
  return (
    <TextbookLesson
      bookId={bookId!}
      lessonParam={lesson!}
      levelId={levelId ?? ''}
      editionFilterDefault={bookMeta.editionFilterDefault ?? 'all'}
    />
  )
}

function TextbookLesson({
  bookId,
  lessonParam,
  levelId,
  editionFilterDefault,
}: {
  bookId: string
  lessonParam: string
  levelId: string
  editionFilterDefault: EditionFilter
}) {
  const lessonNumber = Number(lessonParam)
  const [tab, setTab] = useState<Tab>('vocab')

  const {
    data: index,
    loading: indexLoading,
    error: indexError,
  } = useAsyncData(() => loadBookIndex(bookId), [bookId])
  const {
    data: lessonFile,
    loading: lessonLoading,
    error: lessonError,
  } = useAsyncData(
    () => loadLesson(bookId, lessonNumber),
    [bookId, lessonNumber],
  )

  if (indexLoading || lessonLoading) return <LoadingState />
  if (indexError || lessonError || !index || !lessonFile) return <ErrorState />

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

      <div className="py-2">
        {tab === 'vocab' && (
          <VocabTab
            vocab={lessonFile.vocab}
            editionFilterDefault={editionFilterDefault}
          />
        )}
        {tab === 'grammar' && <GrammarTab grammar={lessonFile.grammar} />}
        {tab === 'kanji' && (
          <KanjiRelatedTab vocab={lessonFile.vocab} levelId={levelId} />
        )}
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

function KanjiChapterLesson({
  bookId,
  chapterParam,
}: {
  bookId: string
  chapterParam: string
}) {
  const chapter =
    chapterParam === 'appendix' ? 'appendix' : Number(chapterParam)

  const { data, loading, error } = useAsyncData(
    () => loadKanjiChapter(bookId, chapter),
    [bookId, chapter],
  )

  if (loading) return <LoadingState />
  if (error || !data) return <ErrorState />

  return (
    <div className="flex flex-col gap-3 p-4">
      <h1 className="text-lg font-bold text-primary-900 dark:text-slate-100">
        {data.title}
      </h1>
      {data.kanji.length === 0 ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {vi.kanjiChapter.noKanji}
        </p>
      ) : (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
          {data.kanji.map((item) => (
            <KanjiCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  )
}
