import { useState } from 'react'
import { vi } from '@/i18n/vi'
import type { SentenceOrderQuestion } from './types'

interface SentenceOrderComponentProps {
  q: SentenceOrderQuestion
  onAnswer: (answer: unknown) => void
}

/** Sắp xếp câu bằng cách chạm (hỗ trợ cảm ứng, không cần kéo-thả). */
export function SentenceOrderComponent({
  q,
  onAnswer,
}: SentenceOrderComponentProps) {
  const [placedIds, setPlacedIds] = useState<string[]>([])
  const [showHint, setShowHint] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const byId = new Map(q.chunks.map((c) => [c.id, c.text]))
  const remainingIds = q.shuffledIds.filter((id) => !placedIds.includes(id))
  const correctIds = q.chunks.map((c) => c.id)
  const isComplete = placedIds.length === q.chunks.length

  function place(id: string) {
    if (submitted) return
    setPlacedIds((prev) => [...prev, id])
  }

  function unplace(id: string) {
    if (submitted) return
    setPlacedIds((prev) => prev.filter((p) => p !== id))
  }

  function check() {
    if (!isComplete || submitted) return
    setSubmitted(true)
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex min-h-14 w-full max-w-sm flex-wrap items-center gap-2 rounded-lg border border-dashed border-slate-300 p-2 dark:border-slate-600">
        {placedIds.length === 0 && (
          <span className="text-sm text-slate-400">
            {vi.sentenceOrder.placeholder}
          </span>
        )}
        {placedIds.map((id, index) => {
          const isWrong = submitted && correctIds[index] !== id
          return (
            <button
              key={id}
              type="button"
              onClick={() => unplace(id)}
              disabled={submitted}
              className={`min-h-11 rounded-lg border px-3 text-lg font-medium ${
                isWrong
                  ? 'border-danger bg-danger/10 text-danger'
                  : 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-slate-800 dark:text-primary-500'
              }`}
            >
              {byId.get(id)}
            </button>
          )
        })}
      </div>

      <div className="flex w-full max-w-sm flex-wrap justify-center gap-2">
        {remainingIds.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => place(id)}
            className="min-h-11 rounded-lg border border-slate-200 px-3 text-lg font-medium dark:border-slate-700"
          >
            {byId.get(id)}
          </button>
        ))}
      </div>

      {showHint ? (
        <p className="text-sm text-slate-400">{q.vi}</p>
      ) : (
        <button
          type="button"
          onClick={() => setShowHint(true)}
          className="min-h-11 text-xs text-primary-600 underline dark:text-primary-500"
        >
          {vi.sentenceOrder.showHint}
        </button>
      )}

      {isComplete && !submitted && (
        <button
          type="button"
          onClick={check}
          className="min-h-11 rounded-full bg-primary-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-700"
        >
          {vi.sentenceOrder.submit}
        </button>
      )}

      {submitted && (
        <button
          type="button"
          onClick={() => onAnswer(placedIds)}
          className="min-h-11 rounded-full bg-primary-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-700"
        >
          {vi.mcq.next}
        </button>
      )}
    </div>
  )
}
