import { BlankChoiceCard } from '@/ui/quiz/BlankChoiceCard'
import type { FillBlankQuestion } from './types'

interface FillBlankComponentProps {
  q: FillBlankQuestion
  onAnswer: (answer: unknown) => void
}

export function FillBlankComponent({ q, onAnswer }: FillBlankComponentProps) {
  return (
    <BlankChoiceCard
      before={q.before}
      after={q.after}
      hint={q.vi}
      choices={q.choices}
      correctChoiceId={q.correctChoiceId}
      onAnswer={onAnswer}
    />
  )
}
