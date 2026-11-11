import { useState } from 'react'
import { SpeakButton } from '@/ui/jp/SpeakButton'
import { parseExplanationMd, parseInlineBold } from '@/lib/explanation-md'
import { vi } from '@/i18n/vi'
import type { GrammarExample, GrammarPoint } from '@/domain/types'

interface GrammarTabProps {
  grammar: GrammarPoint[]
}

export function GrammarTab({ grammar }: GrammarTabProps) {
  if (grammar.length === 0) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">
        {vi.lesson.noGrammar}
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {grammar.map((point) => (
        <GrammarCard key={point.id} point={point} />
      ))}
    </div>
  )
}

function GrammarCard({ point }: { point: GrammarPoint }) {
  const bullets = parseExplanationMd(point.explanationMd)
  return (
    <details className="group rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
      <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-2 p-3">
        <span className="font-medium text-slate-900 dark:text-slate-100">
          {point.order}. {point.title}
        </span>
        {point.supplemental && (
          <span className="shrink-0 rounded bg-slate-100 px-1.5 py-0.5 text-[0.65rem] font-medium text-slate-500 dark:bg-slate-700 dark:text-slate-300">
            {vi.common.supplemental}
          </span>
        )}
      </summary>
      <div className="flex flex-col gap-3 border-t border-slate-100 p-3 dark:border-slate-700">
        <p className="font-medium text-primary-700 dark:text-primary-500">
          {point.meaning}
        </p>
        <ul className="flex flex-col gap-1.5 text-sm text-slate-600 dark:text-slate-300">
          {bullets.map((bullet, i) => (
            <li key={i}>
              <InlineText text={bullet.text} />
              {bullet.children.length > 0 && (
                <ul className="ml-4 mt-1 flex flex-col gap-1 list-disc">
                  {bullet.children.map((child, j) => (
                    <li key={j}>
                      <InlineText text={child} />
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
        <div className="flex flex-col gap-2">
          {point.examples.map((example, i) => (
            <GrammarExampleCard key={i} example={example} />
          ))}
        </div>
      </div>
    </details>
  )
}

function InlineText({ text }: { text: string }) {
  return (
    <>
      {parseInlineBold(text).map((part, i) =>
        typeof part === 'string' ? (
          <span key={i}>{part}</span>
        ) : (
          <strong key={i}>{part.bold}</strong>
        ),
      )}
    </>
  )
}

function GrammarExampleCard({ example }: { example: GrammarExample }) {
  const [revealed, setRevealed] = useState(false)
  return (
    <div className="rounded-md bg-slate-50 p-2.5 dark:bg-slate-900">
      <div className="flex items-center gap-2">
        <SpeakButton text={example.jp} kind="sentence" />
        <p className="text-base text-slate-900 dark:text-slate-100">
          {example.jp}
        </p>
      </div>
      <button
        type="button"
        onClick={() => setRevealed((r) => !r)}
        className="mt-1 min-h-11 text-xs font-medium text-primary-600 hover:underline dark:text-primary-500"
      >
        {revealed ? vi.common.hideTranslation : vi.common.showTranslation}
      </button>
      {revealed && (
        <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          <p>{example.romaji}</p>
          <p>{example.vi}</p>
        </div>
      )}
    </div>
  )
}
