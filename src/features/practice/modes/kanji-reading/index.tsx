import { TextChoiceCard } from '@/ui/quiz/TextChoiceCard'
import {
  isKanjiItem,
  register,
  type QuestionType,
  type QuizItem,
} from '@/domain/quiz/registry'
import { shuffle } from '@/lib/rng'
import { vi } from '@/i18n/vi'
import type { KanjiReadingChoice, KanjiReadingQuestion } from './types'
import type { KanjiExample, KanjiItem, Skill } from '@/domain/types'

type ReadingKind = KanjiExample['kind']

function otherReadings(
  item: KanjiItem,
  pool: QuizItem[],
  kind: ReadingKind,
): Set<string> {
  const set = new Set<string>()
  for (const p of pool) {
    if (!isKanjiItem(p) || p.id === item.id) continue
    for (const ex of p.examples) if (ex.kind === kind) set.add(ex.reading)
  }
  return set
}

function createKanjiReadingType(
  id: string,
  label: string,
  skill: Skill,
  kind: ReadingKind,
): QuestionType<KanjiReadingQuestion> {
  return {
    id,
    label,
    itemType: 'kanji',
    skill,
    isEligible: (item: QuizItem, ctx) => {
      if (!isKanjiItem(item)) return false
      if (!item.examples.some((e) => e.kind === kind)) return false
      return otherReadings(item, ctx.pool, kind).size >= 3
    },
    generate: (item, pool, rng) => {
      const kanjiItem = item as KanjiItem
      const examples = kanjiItem.examples.filter((e) => e.kind === kind)
      const example = examples[Math.floor(rng() * examples.length)]
      const distractors = shuffle(
        [...otherReadings(kanjiItem, pool, kind)].filter(
          (r) => r !== example.reading,
        ),
        rng,
      ).slice(0, 3)
      const all = shuffle([example.reading, ...distractors], rng)
      const choices: KanjiReadingChoice[] = all.map((text, i) => ({
        id: String(i),
        text,
      }))
      const correctIndex = all.findIndex((r) => r === example.reading)
      return {
        promptText: example.word,
        promptHint: example.meaning,
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
        promptText={q.promptText}
        promptHint={q.promptHint}
        choices={q.choices}
        correctChoiceId={q.correctChoiceId}
        onAnswer={onAnswer}
      />
    ),
  }
}

export const kanjiReadingOnQuestionType = createKanjiReadingType(
  'kanji-reading-on',
  vi.kanjiQuiz.labelReadingOn,
  'kanji-on',
  'on',
)

export const kanjiReadingKunQuestionType = createKanjiReadingType(
  'kanji-reading-kun',
  vi.kanjiQuiz.labelReadingKun,
  'kanji-kun',
  'kun',
)

register(kanjiReadingOnQuestionType)
register(kanjiReadingKunQuestionType)
