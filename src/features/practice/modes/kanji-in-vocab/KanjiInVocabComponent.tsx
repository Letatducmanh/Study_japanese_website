import { BlankChoiceCard } from '@/ui/quiz/BlankChoiceCard'
import type { KanjiInVocabQuestion } from './types'

interface KanjiInVocabComponentProps {
  q: KanjiInVocabQuestion
  onAnswer: (answer: unknown) => void
}

export function KanjiInVocabComponent({
  q,
  onAnswer,
}: KanjiInVocabComponentProps) {
  return (
    <BlankChoiceCard
      before={q.before}
      after={q.after}
      hint={q.hint}
      choices={q.choices}
      correctChoiceId={q.correctChoiceId}
      onAnswer={onAnswer}
    />
  )
}
