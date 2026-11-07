import { TextChoiceCard } from '@/ui/quiz/TextChoiceCard'
import {
  isGrammarItem,
  register,
  type QuestionType,
  type QuizItem,
} from '@/domain/quiz/registry'
import { shuffle } from '@/lib/rng'
import { vi } from '@/i18n/vi'
import type { SentenceMeaningChoice, SentenceMeaningQuestion } from './types'
import type { GrammarPoint } from '@/domain/types'

function allTranslations(pool: QuizItem[]): string[] {
  const result: string[] = []
  for (const item of pool) {
    if (!isGrammarItem(item)) continue
    for (const ex of item.examples) result.push(ex.vi)
  }
  return result
}

export const sentenceMeaningQuestionType: QuestionType<SentenceMeaningQuestion> =
  {
    id: 'sentence-meaning',
    label: vi.sentenceMeaning.label,
    itemType: 'grammar',
    skill: 'grammar',
    isEligible: (item: QuizItem, ctx) => {
      if (!isGrammarItem(item) || item.examples.length === 0) return false
      const correctVi = item.examples[0].vi
      const distinct = new Set(
        allTranslations(ctx.pool).filter((v) => v !== correctVi),
      )
      return distinct.size >= 3
    },
    generate: (item, pool, rng) => {
      const point = item as GrammarPoint
      const example = point.examples[Math.floor(rng() * point.examples.length)]
      const candidates = [
        ...new Set(allTranslations(pool).filter((v) => v !== example.vi)),
      ]
      const distractors = shuffle(candidates, rng).slice(0, 3)
      const all = shuffle([example.vi, ...distractors], rng)
      const choices: SentenceMeaningChoice[] = all.map((text, i) => ({
        id: String(i),
        text,
      }))
      const correctIndex = all.findIndex((v) => v === example.vi)
      return {
        jp: example.jp,
        choices,
        correctChoiceId: choices[correctIndex].id,
      }
    },
    grade: (question, answer) => {
      const correctChoice = question.choices.find(
        (c) => c.id === question.correctChoiceId,
      )
      const givenChoice = question.choices.find((c) => c.id === answer)
      return {
        correct: answer === question.correctChoiceId,
        expected: correctChoice?.text ?? '',
        given: givenChoice?.text ?? '',
      }
    },
    Component: ({ q, onAnswer }) => (
      <TextChoiceCard
        promptText={q.jp}
        choices={q.choices}
        correctChoiceId={q.correctChoiceId}
        onAnswer={onAnswer}
      />
    ),
  }

register(sentenceMeaningQuestionType)
