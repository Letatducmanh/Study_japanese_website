import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ErrorState } from '@/components/ErrorState'
import { LoadingState } from '@/components/LoadingState'
import { Ruby } from '@/components/Ruby'
import { resolveVocabItems } from '@/data/content-loader'
import { progressRepository } from '@/data/progress/dexie-repo'
import { classifyItemId, parseVocabItemId } from '@/domain/quiz/item-id'
import { usePracticeSessionStore } from '@/features/practice/session-store'
import { vi } from '@/i18n/vi'
import { useAsyncData } from '@/data/hooks/use-async-data'
import type { MistakeRecord, VocabItem } from '@/domain/types'

/** Dạng bài dùng cho "Ôn lại" — bộ cố định, đủ để ôn nhanh nhận biết + nhớ lại. */
const REVIEW_MODE_IDS = ['flashcard', 'mcq-jp-vi', 'mcq-vi-jp']

export function MistakesPage() {
  const navigate = useNavigate()
  const setPendingConfig = usePracticeSessionStore((s) => s.setPendingConfig)
  const [lessonFilter, setLessonFilter] = useState<number | 'all'>('all')

  const {
    data: mistakes,
    loading: mistakesLoading,
    error: mistakesError,
  } = useAsyncData(() => progressRepository.listMistakes(), [])

  // Phạm vi mục 10 Phase này: chỉ xét từ vựng (ID ngữ pháp/Kanji có quy ước ID khác).
  const vocabMistakes = useMemo(
    () => (mistakes ?? []).filter((m) => classifyItemId(m.itemId) === 'vocab'),
    [mistakes],
  )
  const ids = useMemo(() => vocabMistakes.map((m) => m.itemId), [vocabMistakes])
  const {
    data: resolvedVocab,
    loading: vocabLoading,
    error: vocabError,
  } = useAsyncData(() => resolveVocabItems(ids), [ids])

  if (mistakesLoading || vocabLoading) return <LoadingState />
  if (mistakesError || vocabError) return <ErrorState />

  const byId = new Map((resolvedVocab ?? []).map((v) => [v.id, v]))
  const rows = vocabMistakes
    .map((m) => ({
      mistake: m,
      item: byId.get(m.itemId),
      lesson: parseVocabItemId(m.itemId)?.lesson,
    }))
    .filter(
      (r): r is { mistake: MistakeRecord; item: VocabItem; lesson: number } =>
        r.item !== undefined && r.lesson !== undefined,
    )
    .sort((a, b) => b.mistake.addedTs - a.mistake.addedTs)

  const lessons = [...new Set(rows.map((r) => r.lesson))].sort((a, b) => a - b)
  const filtered =
    lessonFilter === 'all'
      ? rows
      : rows.filter((r) => r.lesson === lessonFilter)

  function handleReview(item: VocabItem, lesson: number) {
    const parsed = parseVocabItemId(item.id)
    if (!parsed) return
    setPendingConfig({
      bookId: parsed.bookId,
      lesson,
      questionTypeIds: REVIEW_MODE_IDS,
      questionCount: 1,
      includeExtended: true,
      onlyItemIds: [item.id],
    })
    navigate('/practice/run')
  }

  return (
    <div className="flex flex-col gap-4 py-4">
      <h1 className="text-lg font-bold text-primary-900 dark:text-slate-100">
        {vi.mistakes.pageTitle}
      </h1>

      {rows.length === 0 ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {vi.mistakes.empty}
        </p>
      ) : (
        <>
          {lessons.length > 1 && (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setLessonFilter('all')}
                className={`min-h-11 rounded-full border px-4 text-sm font-medium ${
                  lessonFilter === 'all'
                    ? 'border-primary-600 bg-primary-600 text-white'
                    : 'border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-300'
                }`}
              >
                {vi.mistakes.lessonFilterAll}
              </button>
              {lessons.map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLessonFilter(l)}
                  className={`min-h-11 rounded-full border px-4 text-sm font-medium ${
                    lessonFilter === l
                      ? 'border-primary-600 bg-primary-600 text-white'
                      : 'border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-300'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          )}

          <ul className="flex flex-col divide-y divide-slate-100 dark:divide-slate-800">
            {filtered.map(({ mistake, item, lesson }) => (
              <li
                key={item.id}
                className="flex items-center justify-between gap-2 py-2 text-sm"
              >
                <div className="flex flex-col">
                  <span className="font-medium text-slate-900 dark:text-slate-100">
                    <Ruby
                      base={item.kanji ?? item.kana}
                      reading={item.kanji ? item.kana : undefined}
                    />
                  </span>
                  <span className="text-xs text-slate-400">
                    {item.meaning} —{' '}
                    {vi.mistakes.streakSuffix(mistake.correctStreak)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleReview(item, lesson)}
                  className="min-h-11 rounded-full border border-primary-600 px-3 text-xs font-medium text-primary-600 dark:text-primary-500"
                >
                  {vi.mistakes.reviewButton}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}
