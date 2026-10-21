import { useEffect, useState } from 'react'
import { Ruby } from '@/components/Ruby'
import { SpeakButton } from '@/components/SpeakButton'
import { vi } from '@/i18n/vi'
import type { FlashcardFace, FlashcardQuestion, FlashcardRating } from './types'

interface FlashcardComponentProps {
  q: FlashcardQuestion
  onAnswer: (answer: unknown) => void
}

const FACES: { id: FlashcardFace; label: string }[] = [
  { id: 'kana', label: vi.flashcard.faceKana },
  { id: 'kanji', label: vi.flashcard.faceKanji },
  { id: 'meaning', label: vi.flashcard.faceMeaning },
]

const RATINGS: {
  id: FlashcardRating
  label: string
  key: string
  className: string
}[] = [
  {
    id: 'forgot',
    label: vi.flashcard.ratingForgot,
    key: '1',
    className: 'bg-danger',
  },
  {
    id: 'hard',
    label: vi.flashcard.ratingHard,
    key: '2',
    className: 'bg-warning',
  },
  {
    id: 'good',
    label: vi.flashcard.ratingGood,
    key: '3',
    className: 'bg-primary-600',
  },
  {
    id: 'easy',
    label: vi.flashcard.ratingEasy,
    key: '4',
    className: 'bg-success',
  },
]

function frontText(
  item: FlashcardQuestion['item'],
  face: FlashcardFace,
): string {
  if (face === 'kanji') return item.kanji ?? item.kana
  if (face === 'meaning') return item.meaning
  return item.kana
}

export function FlashcardComponent({ q, onAnswer }: FlashcardComponentProps) {
  const [face, setFace] = useState<FlashcardFace>('kana')
  const [flipped, setFlipped] = useState(false)

  useEffect(() => {
    function handleKeydown(e: KeyboardEvent) {
      if (e.code === 'Space') {
        e.preventDefault()
        setFlipped((f) => !f)
        return
      }
      if (!flipped) return
      const rating = RATINGS.find((r) => r.key === e.key)
      if (rating) onAnswer(rating.id)
    }
    window.addEventListener('keydown', handleKeydown)
    return () => window.removeEventListener('keydown', handleKeydown)
  }, [flipped, onAnswer])

  const { item } = q

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex overflow-hidden rounded-full border border-slate-200 dark:border-slate-700">
        {FACES.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFace(f.id)}
            className={`min-h-11 px-3 text-xs font-medium ${
              face === f.id
                ? 'bg-primary-600 text-white'
                : 'text-slate-600 hover:bg-primary-50 dark:text-slate-300 dark:hover:bg-slate-800'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={() => setFlipped((f) => !f)}
        className="flex min-h-48 w-full max-w-sm flex-col items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm dark:border-slate-700 dark:bg-slate-800"
      >
        <SpeakButton text={item.kanji ?? item.kana} />
        {!flipped ? (
          <>
            <span className="text-4xl font-medium text-slate-900 dark:text-slate-100">
              {frontText(item, face)}
            </span>
            <p className="text-xs text-slate-400">{vi.flashcard.flipHint}</p>
          </>
        ) : (
          <>
            <span className="text-3xl font-medium text-slate-900 dark:text-slate-100">
              <Ruby
                base={item.kanji ?? item.kana}
                reading={item.kanji ? item.kana : undefined}
              />
            </span>
            <span className="text-xs text-slate-400">{item.romaji}</span>
            <span className="text-lg text-primary-700 dark:text-primary-500">
              {item.meaning}
            </span>
          </>
        )}
      </button>

      {flipped && (
        <div className="grid w-full max-w-sm grid-cols-4 gap-2">
          {RATINGS.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => onAnswer(r.id)}
              className={`min-h-11 rounded-lg px-1 text-xs font-medium text-white ${r.className}`}
            >
              {r.label}
              <span className="block text-[0.65rem] opacity-80">{r.key}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
