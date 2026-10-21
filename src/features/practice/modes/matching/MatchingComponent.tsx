import { useEffect, useMemo, useRef, useState } from 'react'
import { progressRepository } from '@/data/progress/dexie-repo'
import { shuffle } from '@/lib/rng'
import { playCorrectSound, playWrongSound } from '@/lib/sfx'
import { vi } from '@/i18n/vi'
import type { Attempt } from '@/domain/types'
import type { MatchingQuestion } from './types'

interface MatchingComponentProps {
  q: MatchingQuestion
  onAnswer: (answer: unknown) => void
}

export function MatchingComponent({ q, onAnswer }: MatchingComponentProps) {
  const [sessionId] = useState(() => crypto.randomUUID())
  const [startedAt] = useState(() => Date.now())
  const [elapsedMs, setElapsedMs] = useState(0)
  const [matchedIds, setMatchedIds] = useState<Set<string>>(new Set())
  const [mistakes, setMistakes] = useState<Record<string, number>>({})
  const [selectedJp, setSelectedJp] = useState<string | null>(null)
  const [selectedVi, setSelectedVi] = useState<string | null>(null)
  const [shakeIds, setShakeIds] = useState<string[]>([])
  const finishedRef = useRef(false)

  const jpOrder = useMemo(() => shuffle(q.pairs, Math.random), [q.pairs])
  const viOrder = useMemo(() => shuffle(q.pairs, Math.random), [q.pairs])

  useEffect(() => {
    const interval = setInterval(() => setElapsedMs(Date.now() - startedAt), 200)
    return () => clearInterval(interval)
  }, [startedAt])

  useEffect(() => {
    if (finishedRef.current || matchedIds.size < q.pairs.length) return
    finishedRef.current = true
    const totalMistakes = Object.values(mistakes).reduce((a, b) => a + b, 0)
    onAnswer(totalMistakes)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchedIds])

  /** So khớp 2 lựa chọn ngay trong trình xử lý sự kiện — ghi attempt cho từng cặp (mục Phase 8). */
  function evaluate(jpId: string, viId: string, now: number) {
    if (jpId === viId) {
      playCorrectSound()
      setMatchedIds((prev) => new Set(prev).add(jpId))
      const attempt: Attempt = {
        id: crypto.randomUUID(),
        itemId: jpId,
        itemType: 'vocab',
        skill: 'meaning',
        mode: 'matching',
        correct: (mistakes[jpId] ?? 0) === 0,
        responseMs: now - startedAt,
        sessionId,
        ts: now,
      }
      void progressRepository.recordAttempt(attempt)
      setSelectedJp(null)
      setSelectedVi(null)
      return
    }

    playWrongSound()
    setMistakes((prev) => ({ ...prev, [jpId]: (prev[jpId] ?? 0) + 1 }))
    setShakeIds([jpId, viId])
    setTimeout(() => {
      setShakeIds([])
      setSelectedJp(null)
      setSelectedVi(null)
    }, 400)
  }

  function pickJp(id: string, now: number) {
    if (matchedIds.has(id) || shakeIds.length > 0) return
    if (selectedVi !== null) evaluate(id, selectedVi, now)
    else setSelectedJp(id)
  }

  function pickVi(id: string, now: number) {
    if (matchedIds.has(id) || shakeIds.length > 0) return
    if (selectedJp !== null) evaluate(selectedJp, id, now)
    else setSelectedVi(id)
  }

  function cardClass(id: string, selected: boolean) {
    if (matchedIds.has(id)) return 'border-success bg-success/10 text-success opacity-50'
    if (shakeIds.includes(id)) return 'border-danger bg-danger/10 text-danger'
    if (selected) return 'border-primary-600 bg-primary-50 dark:bg-slate-800'
    return 'border-slate-200 dark:border-slate-700'
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-xs text-slate-400">
        {vi.matching.timeLabel}: {(elapsedMs / 1000).toFixed(1)}s
      </p>
      <div className="grid w-full max-w-sm grid-cols-2 gap-2">
        <div className="flex flex-col gap-2">
          {jpOrder.map((p) => (
            <button
              key={p.id}
              type="button"
              disabled={matchedIds.has(p.id)}
              onClick={() => pickJp(p.id, Date.now())}
              className={`min-h-11 rounded-lg border px-3 text-sm font-medium ${cardClass(p.id, selectedJp === p.id)}`}
            >
              {p.jp}
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-2">
          {viOrder.map((p) => (
            <button
              key={p.id}
              type="button"
              disabled={matchedIds.has(p.id)}
              onClick={() => pickVi(p.id, Date.now())}
              className={`min-h-11 rounded-lg border px-3 text-sm font-medium ${cardClass(p.id, selectedVi === p.id)}`}
            >
              {p.vi}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
