import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ErrorState } from '@/components/ErrorState'
import { LoadingState } from '@/components/LoadingState'
import { progressRepository } from '@/data/progress/dexie-repo'
import {
  findBookMeta,
  loadKanjiChapter,
  loadLesson,
  loadManifest,
} from '@/data/content-loader'
import { list as listQuestionTypes } from '@/domain/quiz/registry'
import { usePracticeSessionStore } from '@/features/practice/session-store'
import { vi } from '@/i18n/vi'
import { useAsyncData } from '@/lib/use-async-data'
import { hasJapaneseVoice } from '@/lib/tts'
import type { QuizItem } from '@/domain/quiz/registry'

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

  const { data: manifest } = useAsyncData(loadManifest, [])
  const isKanjiBook = manifest
    ? findBookMeta(manifest, bookId)?.type === 'kanji'
    : undefined

  const {
    data: lessonFile,
    loading: lessonLoading,
    error: lessonError,
  } = useAsyncData(
    () => (isKanjiBook === false ? loadLesson(bookId, lesson) : Promise.resolve(null)),
    [bookId, lesson, isKanjiBook],
  )
  const {
    data: kanjiChapter,
    loading: kanjiLoading,
    error: kanjiError,
  } = useAsyncData(
    () =>
      isKanjiBook === true
        ? loadKanjiChapter(bookId, lesson)
        : Promise.resolve(null),
    [bookId, lesson, isKanjiBook],
  )
  const { data: settings } = useAsyncData(
    () => progressRepository.getSettings(),
    [],
  )

  const [includeExtended, setIncludeExtended] = useState(false)
  const [questionCount, setQuestionCount] = useState<QuestionCountOption>('all')
  const [selectedModeIds, setSelectedModeIds] = useState<string[]>([])
  const [isComprehensive, setIsComprehensive] = useState(false)
  const [ratioVocab, setRatioVocab] = useState(50)
  const [ratioGrammar, setRatioGrammar] = useState(30)
  const [ratioKanji, setRatioKanji] = useState(20)
  const [comprehensiveCount, setComprehensiveCount] = useState<20 | 30>(20)

  useEffect(() => {
    // Cài đặt tải bất đồng bộ — đồng bộ vào state cục bộ ngay khi có.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (settings) setIncludeExtended(settings.includeExtended)
  }, [settings])

  const title = isKanjiBook ? kanjiChapter?.title : lessonFile?.title

  const vocabPool = useMemo(() => {
    if (!lessonFile) return []
    return lessonFile.vocab.filter(
      (v) => v.section === 'main' || includeExtended,
    )
  }, [lessonFile, includeExtended])

  /** Mục dẫn sinh câu hỏi: từ vựng + ngữ pháp (bài học) hoặc Kanji (chương Kanji Master). */
  const pool: QuizItem[] = useMemo(() => {
    if (isKanjiBook) return kanjiChapter?.kanji ?? []
    return [...vocabPool, ...(lessonFile?.grammar ?? [])]
  }, [isKanjiBook, kanjiChapter, vocabPool, lessonFile])

  const availableModes = useMemo(
    () =>
      listQuestionTypes().filter(
        (qt) =>
          (qt.skill !== 'listening' || hasJapaneseVoice()) &&
          pool.some((item) => qt.isEligible(item, { pool })),
      ),
    [pool],
  )

  useEffect(() => {
    // Danh sách dạng bài phụ thuộc dữ liệu tải bất đồng bộ — chọn mặc định ngay khi có.
    /* eslint-disable react-hooks/set-state-in-effect */
    if (availableModes.length === 0) {
      setSelectedModeIds([])
      return
    }
    setSelectedModeIds((current) => {
      const stillValid = current.filter((id) =>
        availableModes.some((m) => m.id === id),
      )
      return stillValid.length > 0 ? stillValid : [availableModes[0].id]
    })
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [availableModes])

  function toggleMode(id: string) {
    setSelectedModeIds((current) =>
      current.includes(id) ? current.filter((m) => m !== id) : [...current, id],
    )
  }

  if (isKanjiBook === undefined || lessonLoading || kanjiLoading) {
    return <LoadingState />
  }
  if (
    lessonError ||
    kanjiError ||
    (isKanjiBook ? !kanjiChapter : !lessonFile)
  ) {
    return <ErrorState />
  }

  function handleStart() {
    if (isComprehensive) {
      if (ratioVocab + ratioGrammar + ratioKanji <= 0) return
      setPendingConfig({
        bookId,
        lesson,
        questionTypeIds: [],
        questionCount: comprehensiveCount,
        includeExtended,
        comprehensive: {
          vocab: ratioVocab,
          grammar: ratioGrammar,
          kanji: ratioKanji,
        },
      })
      navigate('/practice/run')
      return
    }
    if (selectedModeIds.length === 0) return
    setPendingConfig({
      bookId,
      lesson,
      questionTypeIds: selectedModeIds,
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
      <p className="text-sm text-slate-500 dark:text-slate-400">{title}</p>

      {!isKanjiBook && (
        <>
          <label className="flex min-h-11 items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
            <input
              type="checkbox"
              checked={includeExtended}
              onChange={(e) => setIncludeExtended(e.target.checked)}
              className="h-5 w-5"
            />
            {vi.practice.includeExtendedLabel}
          </label>

          <label className="flex min-h-11 items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
            <input
              type="checkbox"
              checked={isComprehensive}
              onChange={(e) => setIsComprehensive(e.target.checked)}
              className="h-5 w-5"
            />
            {vi.comprehensive.toggleLabel}
          </label>
        </>
      )}

      {isComprehensive ? (
        <div className="flex flex-col gap-3 rounded-lg border border-slate-200 p-3 dark:border-slate-700">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {vi.comprehensive.ratioHint}
          </p>
          <div className="grid grid-cols-3 gap-2">
            {(
              [
                { label: vi.comprehensive.ratioVocab, value: ratioVocab, set: setRatioVocab },
                { label: vi.comprehensive.ratioGrammar, value: ratioGrammar, set: setRatioGrammar },
                { label: vi.comprehensive.ratioKanji, value: ratioKanji, set: setRatioKanji },
              ] as const
            ).map((r) => (
              <label key={r.label} className="flex flex-col gap-1 text-xs text-slate-500 dark:text-slate-400">
                {r.label}
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={r.value}
                  onChange={(e) => r.set(Number(e.target.value))}
                  className="min-h-11 rounded-lg border border-slate-200 px-2 text-center text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
              </label>
            ))}
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
              {vi.practice.countLabel}
            </span>
            <div className="flex gap-2">
              {([20, 30] as const).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setComprehensiveCount(c)}
                  className={`min-h-11 rounded-full border px-4 text-sm font-medium ${
                    comprehensiveCount === c
                      ? 'border-primary-600 bg-primary-600 text-white'
                      : 'border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-300'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <>
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
                    onClick={() => toggleMode(m.id)}
                    className={`min-h-11 rounded-full border px-4 text-sm font-medium ${
                      selectedModeIds.includes(m.id)
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
        </>
      )}

      <button
        type="button"
        onClick={handleStart}
        disabled={
          isComprehensive
            ? ratioVocab + ratioGrammar + ratioKanji <= 0
            : selectedModeIds.length === 0
        }
        className="min-h-11 rounded-full bg-primary-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
      >
        {vi.practice.startButton}
      </button>
    </div>
  )
}
