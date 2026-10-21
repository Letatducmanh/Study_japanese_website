import { useEffect, useState } from 'react'
import { vi } from '@/i18n/vi'

export interface BlankChoice {
  id: string
  text: string
}

interface BlankChoiceCardProps {
  before: string
  after: string
  hint?: string
  choices: BlankChoice[]
  correctChoiceId: string
  onAnswer: (answer: unknown) => void
}

/** Thẻ "câu có ô trống + N lựa chọn" dùng chung cho Điền từ vào câu, Chọn trợ từ, Kanji trong từ vựng. */
export function BlankChoiceCard({
  before,
  after,
  hint,
  choices,
  correctChoiceId,
  onAnswer,
}: BlankChoiceCardProps) {
  const [picked, setPicked] = useState<string | null>(null)

  useEffect(() => {
    function handleKeydown(e: KeyboardEvent) {
      if (picked === null) {
        const index = Number(e.key) - 1
        if (index >= 0 && index < choices.length) setPicked(choices[index].id)
        return
      }
      if (e.key === 'Enter') onAnswer(picked)
    }
    window.addEventListener('keydown', handleKeydown)
    return () => window.removeEventListener('keydown', handleKeydown)
  }, [picked, choices, onAnswer])

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-center text-xl font-medium text-slate-900 dark:text-slate-100">
        {before}
        <span className="mx-1 inline-block min-w-12 border-b-2 border-primary-500 text-center text-primary-500">
          {picked !== null
            ? choices.find((c) => c.id === picked)?.text
            : '＿＿'}
        </span>
        {after}
      </p>
      {hint && <p className="text-sm text-slate-400">{hint}</p>}

      <div className="grid w-full max-w-sm grid-cols-1 gap-2 sm:grid-cols-2">
        {choices.map((choice, index) => {
          const showFeedback = picked !== null
          const isCorrect = choice.id === correctChoiceId
          const isPicked = choice.id === picked
          const style = !showFeedback
            ? 'border-slate-200 hover:border-primary-500 dark:border-slate-700'
            : isCorrect
              ? 'border-success bg-success/10 text-success'
              : isPicked
                ? 'border-danger bg-danger/10 text-danger'
                : 'border-slate-200 opacity-50 dark:border-slate-700'
          return (
            <button
              key={choice.id}
              type="button"
              disabled={showFeedback}
              onClick={() => setPicked(choice.id)}
              className={`flex min-h-11 items-center justify-center gap-1 rounded-lg border px-3 py-2 text-sm font-medium ${style}`}
            >
              {choice.text}
              <span className="text-xs text-slate-400">{index + 1}</span>
            </button>
          )
        })}
      </div>

      {picked !== null && (
        <button
          type="button"
          onClick={() => onAnswer(picked)}
          className="min-h-11 rounded-full bg-primary-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-700"
        >
          {vi.mcq.next}
        </button>
      )}
    </div>
  )
}
