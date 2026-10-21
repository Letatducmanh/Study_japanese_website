import { useEffect, useRef, useState } from 'react'
import { bindKanaInput } from '@/lib/kana'
import { speakJapanese } from '@/lib/tts'
import { vi } from '@/i18n/vi'
import type { DictationQuestion } from './types'

interface DictationComponentProps {
  q: DictationQuestion
  onAnswer: (answer: unknown) => void
}

export function DictationComponent({ q, onAnswer }: DictationComponentProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [value, setValue] = useState('')

  useEffect(() => {
    speakJapanese(q.item.kanji ?? q.item.kana)
    const el = inputRef.current
    if (!el) return
    el.focus()
    return bindKanaInput(el)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function submit() {
    if (!value.trim()) return
    onAnswer(value)
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <button
        type="button"
        onClick={() => speakJapanese(q.item.kanji ?? q.item.kana)}
        className="flex min-h-11 items-center gap-2 rounded-full bg-primary-50 px-4 text-sm font-medium text-primary-700 dark:bg-slate-800 dark:text-primary-500"
      >
        🔊 {vi.dictation.replay}
      </button>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') submit()
        }}
        placeholder={vi.dictation.placeholder}
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
        {vi.dictation.submit}
      </button>
    </div>
  )
}
