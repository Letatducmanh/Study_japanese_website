import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ErrorState } from '@/components/ErrorState'
import { LoadingState } from '@/components/LoadingState'
import { progressRepository } from '@/data/progress/dexie-repo'
import { loadLesson } from '@/data/content-loader'
import { list as listQuestionTypes } from '@/domain/quiz/registry'
import { usePracticeSessionStore } from '@/features/practice/session-store'
import { vi } from '@/i18n/vi'
import { useAsyncData } from '@/lib/use-async-data'

const QUESTION_COUNT_OPTIONS = [10, 20, 50] as const
type QuestionCountOption = (typeof QUESTION_COUNT_OPTIONS)[number] | 'all'

export function PracticeSetupPage() {
  const [params] = useSearchParams()
  const bookId = params.get('bookId')
  const lessonParam = params.get('lesson')
  const lesson = lessonParam ? Number(lessonParam) : null

  if (!bookId || !lesson) {
    return (
      <div className="flex flex-col items-center gap-3 p-8 text-center">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {vi.practice.noScope}
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

  return <SetupForm bookId={bookId} lesson={lesson} />
}

function SetupForm({ bookId, lesson }: { bookId: string; lesson: number }) {
  const navigate = useNavigate()
  const setPendingConfig = usePracticeSessionStore((s) => s.setPendingConfig)

  const {
    data: lessonFile,
    loading,
    error,
  } = useAsyncData(() => loadLesson(bookId, lesson), [bookId, lesson])
  const { data: settings } = useAsyncData(
    () => progressRepository.getSettings(),
    [],
  )

  const [includeExtended, setIncludeExtended] = useState(false)
  const [questionCount, setQuestionCount] = useState<QuestionCountOption>('all')
  const [modeId, setModeId] = useState<string | null>(null)

  useEffect(() => {
    // Cài đặt tải bất đồng bộ — đồng bộ vào state cục bộ ngay khi có.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (settings) setIncludeExtended(settings.includeExtended)
  }, [settings])

  const pool = useMemo(() => {
    if (!lessonFile) return []
    return lessonFile.vocab.filter(
      (v) => v.section === 'main' || includeExtended,
    )
  }, [lessonFile, includeExtended])

  const availableModes = useMemo(
    () =>
      listQuestionTypes().filter(
        (qt) =>
          qt.itemType === 'vocab' &&
          pool.some((item) => qt.isEligible(item, { pool })),
      ),
    [pool],
  )

  useEffect(() => {
    // Danh sách dạng bài phụ thuộc dữ liệu tải bất đồng bộ — chọn mặc định ngay khi có.
    /* eslint-disable react-hooks/set-state-in-effect */
    if (availableModes.length === 0) {
      setModeId(null)
      return
    }
    if (!modeId || !availableModes.some((m) => m.id === modeId)) {
      setModeId(availableModes[0].id)
    }
    /* eslint-enable react-hooks/set-state-in-effect */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availableModes])

  if (loading) return <LoadingState />
  if (error || !lessonFile) return <ErrorState />

  function handleStart() {
    if (!modeId) return
    setPendingConfig({
      bookId,
      lesson,
      questionTypeId: modeId,
      questionCount: questionCount === 'all' ? pool.length : questionCount,
      includeExtended,
    })
    navigate('/practice/run')
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <h1 className="text-lg font-bold text-primary-900 dark:text-slate-100">
        {vi.practice.setupTitle}
      </h1>
      <p className="text-sm text-slate-500 dark:text-slate-400">
        {lessonFile.title}
      </p>

      <label className="flex min-h-11 items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
        <input
          type="checkbox"
          checked={includeExtended}
          onChange={(e) => setIncludeExtended(e.target.checked)}
          className="h-5 w-5"
        />
        {vi.practice.includeExtendedLabel}
      </label>

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
          {vi.practice.modeLabel}
        </span>
        {availableModes.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {vi.practice.noModeAvailable}
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {availableModes.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setModeId(m.id)}
                className={`min-h-11 rounded-full border px-4 text-sm font-medium ${
                  modeId === m.id
                    ? 'border-primary-600 bg-primary-600 text-white'
                    : 'border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-300'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
          {vi.practice.countLabel}
        </span>
        <div className="flex flex-wrap gap-2">
          {[...QUESTION_COUNT_OPTIONS, 'all' as const].map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setQuestionCount(c)}
              className={`min-h-11 rounded-full border px-4 text-sm font-medium ${
                questionCount === c
                  ? 'border-primary-600 bg-primary-600 text-white'
                  : 'border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-300'
              }`}
            >
              {c === 'all' ? vi.practice.countAll : c}
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={handleStart}
        disabled={!modeId}
        className="min-h-11 rounded-full bg-primary-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
      >
        {vi.practice.startButton}
      </button>
    </div>
  )
}
