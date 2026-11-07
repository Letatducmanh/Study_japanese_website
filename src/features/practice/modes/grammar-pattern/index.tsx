import { TextChoiceCard } from '@/ui/quiz/TextChoiceCard'
import {
  isGrammarItem,
  register,
  type QuestionType,
  type QuizItem,
} from '@/domain/quiz/registry'
import { shuffle } from '@/lib/rng'
import { vi } from '@/i18n/vi'
import type { GrammarPatternChoice, GrammarPatternQuestion } from './types'
import type { GrammarPoint } from '@/domain/types'

/** Ứng viên mẫu ngữ pháp khác (tiêu đề khác) để làm đáp án nhiễu, ưu tiên cùng bài/gần bài. */
function findDistractorTitles(
  correct: GrammarPoint,
  pool: QuizItem[],
  rng: () => number,
): string[] {
  const candidates = pool.filter(
    (p): p is GrammarPoint =>
      isGrammarItem(p) && p.id !== correct.id && p.title !== correct.title,
  )
  const byScore = new Map<number, string[]>()
  for (const point of candidates) {
    const score =
      point.lesson === correct.lesson
        ? 2
        : Math.abs(point.lesson - correct.lesson) <= 2
          ? 1
          : 0
    const bucket = byScore.get(score) ?? []
    bucket.push(point.title)
    byScore.set(score, bucket)
  }
  const result: string[] = []
  for (const score of [2, 1, 0]) {
    if (result.length >= 3) break
    for (const title of shuffle([...new Set(byScore.get(score) ?? [])], rng)) {
      if (result.length >= 3) break
      if (!result.includes(title)) result.push(title)
    }
  }
  return result
}

export const grammarPatternQuestionType: QuestionType<GrammarPatternQuestion> =
  {
    id: 'grammar-pattern',
    label: vi.grammarPattern.label,
    itemType: 'grammar',
    skill: 'grammar',
    isEligible: (item: QuizItem, ctx) => {
      if (!isGrammarItem(item) || item.examples.length === 0) return false
      return findDistractorTitles(item, ctx.pool, Math.random).length >= 3
    },
    generate: (item, pool, rng) => {
      const point = item as GrammarPoint
      const example = point.examples[Math.floor(rng() * point.examples.length)]
      const distractors = findDistractorTitles(point, pool, rng)
      const all = shuffle([point.title, ...distractors], rng)
      const choices: GrammarPatternChoice[] = all.map((text, i) => ({
        id: String(i),
        text,
      }))
      const correctIndex = all.findIndex((t) => t === point.title)
      return {
        jp: example.jp,
        vi: example.vi,
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
        promptHint={`${q.vi} — ${vi.grammarPattern.promptHint}`}
        choices={q.choices}
        correctChoiceId={q.correctChoiceId}
        onAnswer={onAnswer}
      />
    ),
  }

register(grammarPatternQuestionType)
