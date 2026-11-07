import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ErrorState } from '@/ui/primitives/ErrorState'
import { LoadingState } from '@/ui/primitives/LoadingState'
import {
  findBookMeta,
  findKanjiBookIdForLevel,
  findLevelIdForBook,
  loadKanjiChapter,
  loadLesson,
  loadManifest,
} from '@/data/content-loader'
import { loadAllKanjiForBook } from '@/data/kanji-lookup'
import { progressRepository } from '@/data/progress/dexie-repo'
import { get as getQuestionType, type QuizItem } from '@/domain/quiz/registry'
import { buildComprehensiveSession, buildSession } from '@/domain/quiz/session'
import {
  usePracticeSessionStore,
  type AnsweredQuestion,
  type PendingSessionConfig,
} from '@/features/practice/session-store'
import { vi } from '@/i18n/vi'
import { playCorrectSound, playWrongSound } from '@/lib/sfx'
import { useAsyncData } from '@/data/hooks/use-async-data'
import type { Attempt } from '@/domain/types'

export function PracticeRunPage() {
  const pendingConfig = usePracticeSessionStore((s) => s.pendingConfig)

  if (!pendingConfig) {
    return (
      <div className="flex flex-col items-center gap-3 p-8 text-center">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {vi.practice.runNoConfig}
        </p>
        <Link
          to="/n"
          className="min-h-11 rounded-full bg-primary-600 px-5 py-2.5 text-sm font-medium text-white"
        >
          {vi.practice.backToBrowse}
        </Link>
      </div>
    )
  }

  return <SessionRunner config={pendingConfig} />
}

function SessionRunner({ config }: { config: PendingSessionConfig }) {
  const navigate = useNavigate()
  const setLastResult = usePracticeSessionStore((s) => s.setLastResult)

  const { data: manifest } = useAsyncData(loadManifest, [])
  const isKanjiBook = manifest
    ? findBookMeta(manifest, config.bookId)?.type === 'kanji'
    : undefined

  const {
    data: lessonFile,
    loading: lessonLoading,
    error: lessonError,
  } = useAsyncData(
    () =>
      isKanjiBook === false
        ? loadLesson(config.bookId, config.lesson)
        : Promise.resolve(null),
    [config.bookId, config.lesson, isKanjiBook],
  )
  const {
    data: kanjiChapter,
    loading: kanjiLoading,
    error: kanjiError,
  } = useAsyncData(
    () =>
      isKanjiBook === true
        ? loadKanjiChapter(config.bookId, config.lesson)
        : Promise.resolve(null),
    [config.bookId, config.lesson, isKanjiBook],
  )

  const isComprehensive = config.comprehensive !== undefined
  const levelId = manifest
    ? findLevelIdForBook(manifest, config.bookId)
    : undefined
  const kanjiBookId =
    manifest && levelId ? findKanjiBookIdForLevel(manifest, levelId) : undefined
  const {
    data: allKanjiForLevel,
    loading: allKanjiLoading,
    error: allKanjiError,
  } = useAsyncData(
    () =>
      isComprehensive && kanjiBookId
        ? loadAllKanjiForBook(kanjiBookId)
        : Promise.resolve([]),
    [isComprehensive, kanjiBookId],
  )

  const [seed] = useState(() => Date.now())
  const [sessionId] = useState(() => crypto.randomUUID())
  const [startedAt] = useState(() => Date.now())
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<AnsweredQuestion[]>([])
  const cardStartedAtRef = useRef(0)

  const questionTypes = useMemo(
    () =>
      config.questionTypeIds
        .map(getQuestionType)
        .filter((qt) => qt !== undefined),
    [config.questionTypeIds],
  )

  const pool: QuizItem[] = useMemo(() => {
    if (isKanjiBook) {
      const kanji = kanjiChapter?.kanji ?? []
      return config.onlyItemIds
        ? kanji.filter((k) => config.onlyItemIds!.includes(k.id))
        : kanji
    }
    if (!lessonFile) return []
    const bySection = lessonFile.vocab.filter(
      (v) => v.section === 'main' || config.includeExtended,
    )
    const vocab = config.onlyItemIds
      ? bySection.filter((v) => config.onlyItemIds!.includes(v.id))
      : bySection
    // Ngữ pháp luôn có mặt trong pool (không lọc theo onlyItemIds) để các dạng như
    // "Điền từ vào câu" tìm được câu ví dụ chứa từ, dù dạng đó không tự sinh câu hỏi từ nó.
    return [...vocab, ...lessonFile.grammar]
  }, [
    isKanjiBook,
    kanjiChapter,
    lessonFile,
    config.includeExtended,
    config.onlyItemIds,
  ])

  const session = useMemo(() => {
    if (config.comprehensive) {
      if (!lessonFile) return null
      const vocabItems = lessonFile.vocab.filter(
        (v) => v.section === 'main' || config.includeExtended,
      )
      const kanjiChars = new Set(vocabItems.flatMap((v) => v.kanjiChars))
      const kanjiItems = (allKanjiForLevel ?? []).filter((k) =>
        kanjiChars.has(k.char),
      )
      return buildComprehensiveSession({
        vocabItems,
        grammarItems: lessonFile.grammar,
        kanjiItems,
        ratio: config.comprehensive,
        questionCount: config.questionCount,
        seed,
      })
    }
    if (questionTypes.length === 0 || pool.length === 0) return null
    return buildSession({
      items: pool,
      questionTypes,
      questionCount: config.questionCount,
      seed,
    })
  }, [
    config.comprehensive,
    lessonFile,
    allKanjiForLevel,
    config.includeExtended,
    pool,
    questionTypes,
    config.questionCount,
    seed,
  ])

  useEffect(() => {
    cardStartedAtRef.current = Date.now()
  }, [currentIndex])

  const total = session?.questions.length ?? 0
  const isFinished = session !== null && currentIndex >= total

  useEffect(() => {
    if (!isFinished) return
    setLastResult({
      sessionId,
      bookId: config.bookId,
      lesson: config.lesson,
      startedAt,
      finishedAt: Date.now(),
      answers,
      isComprehensive: config.comprehensive !== undefined,
    })
    navigate(`/practice/result/${sessionId}`, { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFinished])

  if (
    isKanjiBook === undefined ||
    lessonLoading ||
    kanjiLoading ||
    (isComprehensive && allKanjiLoading)
  ) {
    return <LoadingState />
  }
  if (
    lessonError ||
    kanjiError ||
    (isComprehensive && allKanjiError) ||
    (isKanjiBook ? !kanjiChapter : !lessonFile) ||
    (!isComprehensive && questionTypes.length === 0)
  ) {
    return <ErrorState />
  }
  if (!session || session.questions.length === 0) return <ErrorState />
  if (isFinished) return <LoadingState />

  const current = session.questions[currentIndex]
  const Comp = current.questionType.Component

  function handleAnswer(answer: unknown) {
    const { correct, expected, given } = current.questionType.grade(
      current.question,
      answer,
    )
    if (correct) playCorrectSound()
    else playWrongSound()
    const responseMs = Date.now() - cardStartedAtRef.current
    const attempt: Attempt = {
      id: crypto.randomUUID(),
      itemId: current.item.id,
      itemType: current.questionType.itemType,
      skill: current.questionType.skill,
      mode: current.questionType.id,
      correct,
      responseMs,
      expected,
      given: typeof answer === 'string' ? answer : undefined,
      sessionId,
      ts: Date.now(),
    }
    void progressRepository.recordAttempt(attempt)
    setAnswers((prev) => [
      ...prev,
      {
        item: current.item,
        questionType: current.questionType,
        correct,
        given: given ?? '',
        expected,
        responseMs,
      },
    ])
    setCurrentIndex((i) => i + 1)
  }

  return (
    <div className="flex flex-col gap-4 py-4">
      <p className="text-center text-xs text-slate-400">
        {vi.practice.progress(currentIndex + 1, total)}
      </p>
      <Comp
        key={current.item.id}
        q={current.question}
        onAnswer={handleAnswer}
      />
    </div>
  )
}
