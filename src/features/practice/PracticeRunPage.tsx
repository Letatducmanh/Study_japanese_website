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
import { parseVocabItemId } from '@/domain/quiz/item-id'
import { get as getQuestionType, type QuizItem } from '@/domain/quiz/registry'
import { buildComprehensiveSession, buildSession } from '@/domain/quiz/session'
import {
  usePracticeSessionStore,
  type AnsweredQuestion,
  type PendingSessionConfig,
} from '@/features/practice/session-store'
import { buildReviewPools } from '@/features/practice/review-pools'
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

  // Bài cần tải: bài của cấu hình luôn có mặt (mã ngữ pháp/Kanji không suy ra được bài), cộng
  // các bài của những từ cần luyện — để "Luyện ngay" qua nhiều bài có đủ bối cảnh đáp án nhiễu.
  const lessonKeys = useMemo(() => {
    const keys = new Map([
      [`${config.bookId}:${config.lesson}`, { bookId: config.bookId, lesson: config.lesson }],
    ])
    for (const id of config.onlyItemIds ?? []) {
      const parsed = parseVocabItemId(id)
      if (parsed) keys.set(`${parsed.bookId}:${parsed.lesson}`, parsed)
    }
    return [...keys.values()]
  }, [config.bookId, config.lesson, config.onlyItemIds])
  const lessonKeysId = lessonKeys.map((k) => `${k.bookId}:${k.lesson}`).join('|')

  const {
    data: lessonFiles,
    loading: lessonLoading,
    error: lessonError,
  } = useAsyncData(async () => {
    if (isKanjiBook !== false) return null
    const [main, ...others] = lessonKeys
    // Bài của cấu hình lỗi thì báo lỗi như trước; bài phụ không tải được thì bỏ qua bài đó.
    const mainFile = await loadLesson(main.bookId, main.lesson)
    const otherFiles = await Promise.all(
      others.map((k) => loadLesson(k.bookId, k.lesson).catch(() => null)),
    )
    return [mainFile, ...otherFiles.filter((f) => f !== null)]
  }, [lessonKeysId, isKanjiBook])
  const lessonFile = lessonFiles?.[0] ?? null
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

  const pools: { targets: QuizItem[]; ctxPool: QuizItem[] } = useMemo(() => {
    if (isKanjiBook) {
      const kanji = kanjiChapter?.kanji ?? []
      const items = config.onlyItemIds
        ? kanji.filter((k) => config.onlyItemIds!.includes(k.id))
        : kanji
      return { targets: items, ctxPool: items }
    }
    if (!lessonFiles) return { targets: [], ctxPool: [] }
    return buildReviewPools({
      lessonFiles,
      onlyItemIds: config.onlyItemIds,
      includeExtended: config.includeExtended,
    })
  }, [
    isKanjiBook,
    kanjiChapter,
    lessonFiles,
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
    if (questionTypes.length === 0 || pools.targets.length === 0) return null
    return buildSession({
      items: pools.targets,
      ctxPool: pools.ctxPool,
      questionTypes,
      questionCount: config.questionCount,
      seed,
    })
  }, [
    config.comprehensive,
    lessonFile,
    allKanjiForLevel,
    config.includeExtended,
    pools,
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
