import {
  isGrammarItem,
  register,
  type QuestionType,
  type QuizItem,
} from '@/domain/quiz/registry'
import { shuffle } from '@/lib/rng'
import { vi } from '@/i18n/vi'
import { SentenceOrderComponent } from './SentenceOrderComponent'
import type { SentenceOrderQuestion } from './types'
import type { GrammarPoint } from '@/domain/types'

const MIN_CHUNKS = 3

function eligibleExamples(point: GrammarPoint) {
  return point.examples.filter((ex) => ex.chunks.length >= MIN_CHUNKS)
}

export const sentenceOrderQuestionType: QuestionType<SentenceOrderQuestion> =
  {
    id: 'sentence-order',
    label: vi.sentenceOrder.label,
    itemType: 'grammar',
    skill: 'grammar',
    isEligible: (item: QuizItem) =>
      isGrammarItem(item) && eligibleExamples(item).length > 0,
    generate: (item, _pool, rng) => {
      const point = item as GrammarPoint
      const candidates = eligibleExamples(point)
      const example = candidates[Math.floor(rng() * candidates.length)]
      const chunks = example.chunks.map((text, i) => ({
        id: `chunk-${i}`,
        text,
      }))
      const shuffledIds = shuffle(
        chunks.map((c) => c.id),
        rng,
      )
      return { chunks, shuffledIds, vi: example.vi }
    },
    grade: (question, answer) => {
      const given = (answer as string[] | undefined) ?? []
      const correctIds = question.chunks.map((c) => c.id)
      const correct =
        given.length === correctIds.length &&
        given.every((id, i) => id === correctIds[i])
      const byId = new Map(question.chunks.map((c) => [c.id, c.text]))
      return {
        correct,
        expected: question.chunks.map((c) => c.text).join(' '),
        given: given.map((id) => byId.get(id) ?? '').join(' '),
      }
    },
    Component: SentenceOrderComponent,
  }

register(sentenceOrderQuestionType)
