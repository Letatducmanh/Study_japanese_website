import { Link, useNavigate, useParams } from 'react-router-dom'
import { Ruby } from '@/components/Ruby'
import { isVocabItem } from '@/domain/quiz/registry'
import { usePracticeSessionStore } from '@/features/practice/session-store'
import { vi } from '@/i18n/vi'
import { formatDuration } from '@/lib/format-duration'

export function PracticeResultPage() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const lastResult = usePracticeSessionStore((s) => s.lastResult)
  const setPendingConfig = usePracticeSessionStore((s) => s.setPendingConfig)
  const navigate = useNavigate()

  if (!lastResult || lastResult.sessionId !== sessionId) {
    return (
      <div className="flex flex-col items-center gap-3 p-8 text-center">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {vi.result.notFound}
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

  const total = lastResult.answers.length
  const correctCount = lastResult.answers.filter((a) => a.correct).length
  const wrong = lastResult.answers.filter((a) => !a.correct)
  const duration = formatDuration(lastResult.finishedAt - lastResult.startedAt)

  function handleRetryWrong() {
    setPendingConfig({
      bookId: lastResult!.bookId,
      lesson: lastResult!.lesson,
      questionTypeIds: [...new Set(wrong.map((a) => a.questionType.id))],
      questionCount: wrong.length,
      includeExtended: true,
      onlyItemIds: wrong.map((a) => a.item.id),
    })
    navigate('/practice/run')
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <h1 className="text-lg font-bold text-primary-900 dark:text-slate-100">
        {vi.result.title}
      </h1>

      <div className="flex justify-center gap-10">
        <div className="text-center">
          <p className="text-3xl font-bold text-primary-700 dark:text-primary-500">
            {correctCount}/{total}
          </p>
          <p className="text-xs text-slate-400">{vi.result.scoreLabel}</p>
        </div>
        <div className="text-center">
          <p className="text-3xl font-bold text-slate-700 dark:text-slate-200">
            {duration}
          </p>
          <p className="text-xs text-slate-400">{vi.result.timeLabel}</p>
        </div>
      </div>

      {wrong.length > 0 && (
        <section className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            {vi.result.wrongListTitle}
          </h2>
          <ul className="flex flex-col divide-y divide-slate-100 dark:divide-slate-800">
            {wrong.map((a, i) => (
              <li key={i} className="flex flex-col gap-1 py-2 text-sm">
                <div className="flex items-center gap-2">
                  {isVocabItem(a.item) && (
                    <span className="text-base font-medium text-slate-900 dark:text-slate-100">
                      <Ruby
                        base={a.item.kanji ?? a.item.kana}
                        reading={a.item.kanji ? a.item.kana : undefined}
                      />
                    </span>
                  )}
                  <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[0.65rem] font-medium text-slate-500 dark:bg-slate-700 dark:text-slate-300">
                    {a.questionType.label}
                  </span>
                </div>
                <p className="text-danger">
                  {vi.result.givenLabel}: {a.given || '—'}
                </p>
                <p className="text-success">
                  {vi.result.expectedLabel}: {a.expected}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="flex gap-2">
        {wrong.length > 0 && (
          <button
            type="button"
            onClick={handleRetryWrong}
            className="min-h-11 flex-1 rounded-full border border-danger px-4 text-sm font-medium text-danger"
          >
            {vi.result.retryWrongButton}
          </button>
        )}
        <Link
          to={`/practice/setup?bookId=${lastResult.bookId}&lesson=${lastResult.lesson}`}
          className="flex min-h-11 flex-1 items-center justify-center rounded-full bg-primary-600 px-4 text-sm font-medium text-white"
        >
          {vi.result.continueButton}
        </Link>
      </div>
    </div>
  )
}
