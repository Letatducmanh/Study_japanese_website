import { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ErrorState } from '@/ui/primitives/ErrorState'
import { LoadingState } from '@/ui/primitives/LoadingState'
import { Ruby } from '@/ui/jp/Ruby'
import {
  loadBookIndex,
  loadManifest,
  resolveVocabItems,
} from '@/data/content-loader'
import { progressRepository } from '@/data/progress/dexie-repo'
import { averageMastery } from '@/domain/mastery/formula'
import { computeLessonScores } from '@/domain/mastery/lesson-scores'
import { classifyItemId, parseVocabItemId } from '@/domain/quiz/item-id'
import { usePracticeSessionStore } from '@/features/practice/session-store'
import { vi } from '@/i18n/vi'
import { useAsyncData } from '@/data/hooks/use-async-data'
import type { Mastery, Skill, VocabItem } from '@/domain/types'

const WEAK_LIMIT = 20
/** Dạng bài dùng cho "Luyện ngay" — bộ cố định, đủ để ôn nhanh nhận biết + nhớ lại. */
const REVIEW_MODE_IDS = ['flashcard', 'mcq-jp-vi', 'mcq-vi-jp']

export function WeaknessPage() {
  const navigate = useNavigate()
  const setPendingConfig = usePracticeSessionStore((s) => s.setPendingConfig)

  const {
    data: manifest,
    loading: manifestLoading,
    error: manifestError,
  } = useAsyncData(loadManifest, [])
  const {
    data: weakList,
    loading: weakLoading,
    error: weakError,
  } = useAsyncData(() => progressRepository.listWeak(WEAK_LIMIT), [])
  const {
    data: allMastery,
    loading: allLoading,
    error: allError,
  } = useAsyncData(() => progressRepository.listAllMastery(), [])

  // Phạm vi mục 10 Phase này: chỉ xét từ vựng (ID ngữ pháp/Kanji có quy ước ID khác).
  const vocabWeak = useMemo(
    () => (weakList ?? []).filter((m) => classifyItemId(m.itemId) === 'vocab'),
    [weakList],
  )
  const vocabWeakIds = useMemo(
    () => [...new Set(vocabWeak.map((m) => m.itemId))],
    [vocabWeak],
  )
  const {
    data: resolvedVocab,
    loading: vocabLoading,
    error: vocabError,
  } = useAsyncData(() => resolveVocabItems(vocabWeakIds), [vocabWeakIds])

  const textbookBooks = useMemo(
    () =>
      manifest?.levels
        .flatMap((l) => l.books)
        .filter((b) => b.type === 'textbook') ?? [],
    [manifest],
  )
  const {
    data: bookIndexes,
    loading: bookIndexesLoading,
    error: bookIndexesError,
  } = useAsyncData(
    () => Promise.all(textbookBooks.map((b) => loadBookIndex(b.id))),
    [textbookBooks],
  )

  const weakestLessons = useMemo(() => {
    if (!allMastery || !bookIndexes) return []
    const rows: {
      bookId: string
      bookTitle: string
      lesson: number
      score: number
    }[] = []
    textbookBooks.forEach((book, i) => {
      const index = bookIndexes[i]
      if (!index) return
      const scores = computeLessonScores(allMastery, book.id, index.lessons)
      for (const [lesson, score] of scores) {
        rows.push({ bookId: book.id, bookTitle: book.title, lesson, score })
      }
    })
    return rows.sort((a, b) => a.score - b.score).slice(0, 5)
  }, [allMastery, bookIndexes, textbookBooks])

  const weakestSkill = useMemo<{ skill: Skill; score: number } | null>(() => {
    if (!allMastery || allMastery.length === 0) return null
    const bySkill = new Map<Skill, number[]>()
    for (const m of allMastery) {
      const arr = bySkill.get(m.skill) ?? []
      arr.push(m.score)
      bySkill.set(m.skill, arr)
    }
    let worst: { skill: Skill; score: number } | null = null
    for (const [skill, scores] of bySkill) {
      const avg = averageMastery(scores)
      if (!worst || avg < worst.score) worst = { skill, score: avg }
    }
    return worst
  }, [allMastery])

  if (
    manifestLoading ||
    weakLoading ||
    allLoading ||
    vocabLoading ||
    bookIndexesLoading
  ) {
    return <LoadingState />
  }
  if (
    manifestError ||
    weakError ||
    allError ||
    vocabError ||
    bookIndexesError
  ) {
    return <ErrorState />
  }

  const byId = new Map((resolvedVocab ?? []).map((v) => [v.id, v]))
  const topWords = vocabWeak
    .map((m) => ({ mastery: m, item: byId.get(m.itemId) }))
    .filter(
      (r): r is { mastery: Mastery; item: VocabItem } => r.item !== undefined,
    )

  function handlePracticeNow() {
    if (topWords.length === 0) return
    const parsed = parseVocabItemId(topWords[0].item.id)
    if (!parsed) return
    const sameLesson = topWords.filter((r) => {
      const p = parseVocabItemId(r.item.id)
      return p && p.bookId === parsed.bookId && p.lesson === parsed.lesson
    })
    setPendingConfig({
      bookId: parsed.bookId,
      lesson: parsed.lesson,
      questionTypeIds: REVIEW_MODE_IDS,
      questionCount: sameLesson.length,
      includeExtended: true,
      onlyItemIds: sameLesson.map((r) => r.item.id),
    })
    navigate('/practice/run')
  }

  return (
    <div className="flex flex-col gap-5 py-4">
      <h1 className="text-lg font-bold text-primary-900 dark:text-slate-100">
        {vi.weak.pageTitle}
      </h1>

      {topWords.length === 0 ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {vi.weak.empty}
        </p>
      ) : (
        <>
          <button
            type="button"
            onClick={handlePracticeNow}
            className="min-h-11 rounded-full bg-primary-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-700"
          >
            {vi.weak.practiceNowButton}
          </button>

          <section className="flex flex-col gap-2">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              {vi.weak.topWordsTitle}
            </h2>
            <ul className="flex flex-col divide-y divide-slate-100 dark:divide-slate-800">
              {topWords.map(({ mastery, item }, i) => (
                <li
                  key={`${item.id}-${mastery.skill}-${i}`}
                  className="flex items-center justify-between gap-2 py-2 text-sm"
                >
                  <span className="font-medium text-slate-900 dark:text-slate-100">
                    <Ruby
                      base={item.kanji ?? item.kana}
                      reading={item.kanji ? item.kana : undefined}
                    />
                  </span>
                  <span className="text-xs text-slate-400">
                    {vi.skills[mastery.skill]}
                  </span>
                  <span className="text-xs text-danger">
                    {Math.round(mastery.score * 100)}%
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}

      {weakestLessons.length > 0 && (
        <section className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            {vi.weak.weakLessonsTitle}
          </h2>
          <ul className="flex flex-col divide-y divide-slate-100 dark:divide-slate-800">
            {weakestLessons.map((row) => (
              <li
                key={`${row.bookId}-${row.lesson}`}
                className="flex items-center justify-between py-2 text-sm"
              >
                <Link
                  to={`/b/${row.bookId}/${row.lesson}`}
                  className="text-primary-600 dark:text-primary-500"
                >
                  {row.bookTitle} — {row.lesson}
                </Link>
                <span className="text-xs text-slate-400">
                  {vi.weak.scoreSuffix(Math.round(row.score * 100))}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {weakestSkill && (
        <section className="flex flex-col gap-1">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            {vi.weak.weakSkillTitle}
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            {vi.skills[weakestSkill.skill]}:{' '}
            {Math.round(weakestSkill.score * 100)}%
          </p>
        </section>
      )}

      <Link
        to="/mistakes"
        className="text-center text-sm text-primary-600 underline dark:text-primary-500"
      >
        {vi.weak.goToMistakes}
      </Link>
    </div>
  )
}
