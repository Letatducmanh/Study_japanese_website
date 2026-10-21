import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ErrorState } from '@/components/ErrorState'
import { LoadingState } from '@/components/LoadingState'
import { loadLesson } from '@/data/content-loader'
import { progressRepository } from '@/data/progress/dexie-repo'
import { get as getQuestionType } from '@/domain/quiz/registry'
import { buildSession } from '@/domain/quiz/session'
import {
  usePracticeSessionStore,
  type AnsweredQuestion,
  type PendingSessionConfig,
} from '@/features/practice/session-store'
import { vi } from '@/i18n/vi'
import { useAsyncData } from '@/lib/use-async-data'
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

  const {
    data: lessonFile,
    loading,
    error,
  } = useAsyncData(
    () => loadLesson(config.bookId, config.lesson),
    [config.bookId, config.lesson],
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

  const pool = useMemo(() => {
    if (!lessonFile) return []
    const bySection = lessonFile.vocab.filter(
      (v) => v.section === 'main' || config.includeExtended,
    )
    if (!config.onlyItemIds) return bySection
    return bySection.filter((v) => config.onlyItemIds!.includes(v.id))
  }, [lessonFile, config.includeExtended, config.onlyItemIds])

  const session = useMemo(() => {
    if (questionTypes.length === 0 || pool.length === 0) return null
    return buildSession({
      items: pool,
      questionTypes,
      questionCount: config.questionCount,
      seed,
    })
  }, [pool, questionTypes, config.questionCount, seed])

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
    })
    navigate(`/practice/result/${sessionId}`, { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFinished])

  if (loading) return <LoadingState />
  if (error || !lessonFile || questionTypes.length === 0) return <ErrorState />
  if (!session || session.questions.length === 0) return <ErrorState />
  if (isFinished) return <LoadingState />

  const current = session.questions[currentIndex]
  const Comp = current.questionType.Component

  function handleAnswer(answer: unknown) {
    const { correct, expected, given } = current.questionType.grade(
      current.question,
      answer,
    )
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
    <div className="flex flex-col gap-4 p-4">
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
