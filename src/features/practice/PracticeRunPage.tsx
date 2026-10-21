import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ErrorState } from '@/components/ErrorState'
import { LoadingState } from '@/components/LoadingState'
import { loadLesson } from '@/data/content-loader'
import { progressRepository } from '@/data/progress/dexie-repo'
import { get as getQuestionType } from '@/domain/quiz/registry'
import { buildSession } from '@/domain/quiz/session'
import {
  usePracticeSessionStore,
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
  const [currentIndex, setCurrentIndex] = useState(0)
  const cardStartedAtRef = useRef(0)

  const questionType = getQuestionType(config.questionTypeId)

  const pool = useMemo(() => {
    if (!lessonFile) return []
    return lessonFile.vocab.filter(
      (v) => v.section === 'main' || config.includeExtended,
    )
  }, [lessonFile, config.includeExtended])

  const session = useMemo(() => {
    if (!questionType || pool.length === 0) return null
    return buildSession({
      items: pool,
      questionTypes: [questionType],
      questionCount: config.questionCount,
      seed,
    })
  }, [pool, questionType, config.questionCount, seed])

  useEffect(() => {
    cardStartedAtRef.current = Date.now()
  }, [currentIndex])

  if (loading) return <LoadingState />
  if (error || !lessonFile || !questionType) return <ErrorState />
  if (!session || session.questions.length === 0) return <ErrorState />

  const total = session.questions.length

  if (currentIndex >= total) {
    return (
      <div className="flex flex-col items-center gap-3 p-8 text-center">
        <h1 className="text-lg font-bold text-primary-900 dark:text-slate-100">
          {vi.practice.doneTitle}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {vi.practice.doneBody(total)}
        </p>
        <div className="flex gap-2">
          <Link
            to={`/b/${config.bookId}/${config.lesson}`}
            className="min-h-11 rounded-full border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 dark:border-slate-700 dark:text-slate-200"
          >
            {vi.practice.doneBackToLesson}
          </Link>
          <Link
            to={`/practice/setup?bookId=${config.bookId}&lesson=${config.lesson}`}
            className="min-h-11 rounded-full bg-primary-600 px-4 py-2.5 text-sm font-medium text-white"
          >
            {vi.practice.doneRetry}
          </Link>
        </div>
      </div>
    )
  }

  const current = session.questions[currentIndex]
  const Comp = current.questionType.Component

  function handleAnswer(answer: unknown) {
    const { correct, expected } = current.questionType.grade(
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
