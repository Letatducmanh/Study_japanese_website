import { useEffect, useState } from 'react'
import { Ruby } from '@/components/Ruby'
import { SpeakButton } from '@/components/SpeakButton'
import { vi } from '@/i18n/vi'
import { speakJapanese } from '@/lib/tts'
import type { McqQuestion } from './types'

interface McqComponentProps {
  q: McqQuestion
  onAnswer: (answer: unknown) => void
}

export function McqComponent({ q, onAnswer }: McqComponentProps) {
  const [picked, setPicked] = useState<string | null>(null)

  useEffect(() => {
    if (q.promptAudio) speakJapanese(q.promptAudio)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    function handleKeydown(e: KeyboardEvent) {
      if (picked === null) {
        const index = Number(e.key) - 1
        if (index >= 0 && index < q.choices.length)
          setPicked(q.choices[index].id)
        return
      }
      if (e.key === 'Enter') onAnswer(picked)
    }
    window.addEventListener('keydown', handleKeydown)
    return () => window.removeEventListener('keydown', handleKeydown)
  }, [picked, q.choices, onAnswer])

  return (
    <div className="flex flex-col items-center gap-4">
      {q.promptText ? (
        <div className="flex items-center gap-2">
          <SpeakButton text={q.promptAudio ?? q.promptText} />
          <span className="text-3xl font-medium text-slate-900 dark:text-slate-100">
            <Ruby base={q.promptText} reading={q.promptReading} />
          </span>
        </div>
      ) : (
        q.promptAudio && (
          <button
            type="button"
            onClick={() => speakJapanese(q.promptAudio!)}
            className="flex min-h-11 items-center gap-2 rounded-full bg-primary-50 px-4 text-sm font-medium text-primary-700 dark:bg-slate-800 dark:text-primary-500"
          >
            🔊 {vi.mcq.replay}
          </button>
        )
      )}

      <div className="grid w-full max-w-sm grid-cols-1 gap-2 sm:grid-cols-2">
        {q.choices.map((choice, index) => {
          const showFeedback = picked !== null
          const isCorrect = choice.id === q.correctChoiceId
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
              <Ruby base={choice.text} reading={choice.reading} />
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
