import { useEffect, useRef, useState } from 'react'
import { bindKanaInput } from '@/lib/kana'
import { vi } from '@/i18n/vi'
import type { ConjugationTypingQuestion } from './types'

interface ConjugationTypingComponentProps {
  q: ConjugationTypingQuestion
  onAnswer: (answer: unknown) => void
}

export function ConjugationTypingComponent({
  q,
  onAnswer,
}: ConjugationTypingComponentProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [value, setValue] = useState('')

  useEffect(() => {
    const el = inputRef.current
    if (!el) return
    el.focus()
    return bindKanaInput(el)
  }, [])

  function submit() {
    if (!value.trim()) return
    onAnswer(value)
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-2xl font-medium text-slate-900 dark:text-slate-100">
        {q.promptText}
      </p>
      <p className="text-sm text-slate-400">{q.promptHint}</p>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') submit()
        }}
        placeholder={vi.conjugation.placeholder}
        autoComplete="off"
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck={false}
        className="min-h-11 w-full max-w-sm rounded-lg border border-slate-200 px-4 text-xl text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
      />
      <button
        type="button"
        onClick={submit}
        className="min-h-11 rounded-full bg-primary-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-700"
      >
        {vi.conjugation.submit}
      </button>
    </div>
  )
}
