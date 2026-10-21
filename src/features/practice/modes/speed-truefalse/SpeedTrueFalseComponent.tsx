import { useEffect, useRef, useState } from 'react'
import { progressRepository } from '@/data/progress/dexie-repo'
import { playCorrectSound, playWrongSound } from '@/lib/sfx'
import { vi } from '@/i18n/vi'
import type { Attempt, VocabItem } from '@/domain/types'
import type { SpeedTrueFalseQuestion } from './types'

const DURATION_MS = 60_000

interface Prompt {
  item: VocabItem
  shownMeaning: string
  isTrue: boolean
}

function randomPrompt(pool: VocabItem[]): Prompt {
  const item = pool[Math.floor(Math.random() * pool.length)]
  if (Math.random() < 0.5) return { item, shownMeaning: item.meaning, isTrue: true }
  const others = pool.filter(
    (v) => v.id !== item.id && v.meaning !== item.meaning,
  )
  if (others.length === 0) return { item, shownMeaning: item.meaning, isTrue: true }
  const decoy = others[Math.floor(Math.random() * others.length)]
  return { item, shownMeaning: decoy.meaning, isTrue: false }
}

interface SpeedTrueFalseComponentProps {
  q: SpeedTrueFalseQuestion
  onAnswer: (answer: unknown) => void
}

export function SpeedTrueFalseComponent({
  q,
  onAnswer,
}: SpeedTrueFalseComponentProps) {
  const [sessionId] = useState(() => crypto.randomUUID())
  const [startedAt] = useState(() => Date.now())
  const [remainingMs, setRemainingMs] = useState(DURATION_MS)
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(0)
  const [prompt, setPrompt] = useState<Prompt | null>(() =>
    q.pool.length >= 2 ? randomPrompt(q.pool) : null,
  )
  const promptStartRef = useRef(startedAt)
  const scoreRef = useRef(0)
  const finishedRef = useRef(false)

  useEffect(() => {
    void progressRepository
      .getSettings()
      .then((s) => setHighScore(s.speedTrueFalseHighScore))
  }, [])

  useEffect(() => {
    if (q.pool.length < 2) return
    const interval = setInterval(() => {
      const left = DURATION_MS - (Date.now() - startedAt)
      setRemainingMs(Math.max(0, left))
      if (left <= 0) clearInterval(interval)
    }, 100)
    return () => clearInterval(interval)
  }, [q.pool.length, startedAt])

  useEffect(() => {
    if (remainingMs > 0 || finishedRef.current) return
    finishedRef.current = true
    void progressRepository.saveSettings({
      speedTrueFalseHighScore: Math.max(scoreRef.current, highScore),
    })
    onAnswer(scoreRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remainingMs])

  function answer(userSaysTrue: boolean) {
    if (!prompt || remainingMs <= 0) return
    const correct = userSaysTrue === prompt.isTrue
    const attempt: Attempt = {
      id: crypto.randomUUID(),
      itemId: prompt.item.id,
      itemType: 'vocab',
      skill: 'meaning',
      mode: 'speed-truefalse',
      correct,
      responseMs: Date.now() - promptStartRef.current,
      sessionId,
      ts: Date.now(),
    }
    void progressRepository.recordAttempt(attempt)
    if (correct) {
      playCorrectSound()
      scoreRef.current += 1
      setScore(scoreRef.current)
    } else {
      playWrongSound()
    }
    setPrompt(randomPrompt(q.pool))
    promptStartRef.current = Date.now()
  }

  if (q.pool.length < 2) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">
        {vi.speedTrueFalse.notEnoughItems}
      </p>
    )
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex w-full max-w-sm justify-between text-xs text-slate-400">
        <span>
          {vi.speedTrueFalse.timeLabel}: {Math.ceil(remainingMs / 1000)}s
        </span>
        <span>{vi.speedTrueFalse.scoreLabel(score)}</span>
        <span>{vi.speedTrueFalse.highScoreLabel(highScore)}</span>
      </div>
      {prompt && (
        <div className="flex min-h-48 w-full max-w-sm flex-col items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <span className="text-3xl font-medium text-slate-900 dark:text-slate-100">
            {prompt.item.kanji ?? prompt.item.kana}
          </span>
          <span className="text-lg text-slate-500">=</span>
          <span className="text-xl text-primary-700 dark:text-primary-500">
            {prompt.shownMeaning}
          </span>
        </div>
      )}
      <div className="flex gap-4">
        <button
          type="button"
          onClick={() => answer(false)}
          className="min-h-11 min-w-20 rounded-full bg-danger px-6 text-lg font-medium text-white"
        >
          ✗
        </button>
        <button
          type="button"
          onClick={() => answer(true)}
          className="min-h-11 min-w-20 rounded-full bg-success px-6 text-lg font-medium text-white"
        >
          ✓
        </button>
      </div>
    </div>
  )
}
