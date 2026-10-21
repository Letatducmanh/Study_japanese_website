import { BlankChoiceCard } from '@/components/BlankChoiceCard'
import type { ParticleQuestion } from './types'

interface ParticleComponentProps {
  q: ParticleQuestion
  onAnswer: (answer: unknown) => void
}

export function ParticleComponent({ q, onAnswer }: ParticleComponentProps) {
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
