import { useEffect, useRef, useState } from 'react'
import { bindKanaInput } from '@/lib/kana'
import { vi } from '@/i18n/vi'
import type { TypingQuestion } from './types'

interface TypingComponentProps {
  q: TypingQuestion
  onAnswer: (answer: unknown) => void
}

export function TypingComponent({ q, onAnswer }: TypingComponentProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [value, setValue] = useState('')
  const [showHint, setShowHint] = useState(false)

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
        {q.item.meaning}
      </p>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') submit()
        }}
        placeholder={vi.typing.placeholder}
        autoComplete="off"
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck={false}
        className="min-h-11 w-full max-w-sm rounded-lg border border-slate-200 px-4 text-xl text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
      />
      {showHint ? (
        <p className="text-sm text-slate-400">
          {vi.typing.hintPrefix}
          {q.item.kana.at(0)}
        </p>
      ) : (
        <button
          type="button"
          onClick={() => setShowHint(true)}
          className="min-h-11 text-xs text-primary-600 underline dark:text-primary-500"
        >
          {vi.typing.showHint}
        </button>
      )}
      <button
        type="button"
        onClick={submit}
        className="min-h-11 rounded-full bg-primary-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-700"
      >
        {vi.typing.submit}
      </button>
    </div>
  )
}
