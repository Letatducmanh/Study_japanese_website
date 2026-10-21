import { TextChoiceCard } from '@/components/TextChoiceCard'
import {
  isKanjiItem,
  register,
  type QuestionType,
  type QuizItem,
} from '@/domain/quiz/registry'
import { shuffle } from '@/lib/rng'
import { vi } from '@/i18n/vi'
import type { KanjiHanVietChoice, KanjiHanVietQuestion } from './types'
import type { KanjiItem } from '@/domain/types'

function otherHanViet(item: KanjiItem, pool: QuizItem[]): Set<string> {
  const set = new Set<string>()
  for (const p of pool) {
    if (isKanjiItem(p) && p.id !== item.id) set.add(p.hanViet)
  }
  return set
}

export const kanjiHanVietQuestionType: QuestionType<KanjiHanVietQuestion> = {
  id: 'kanji-hanviet',
  label: vi.kanjiQuiz.labelHanViet,
  itemType: 'kanji',
  skill: 'kanji-meaning',
  isEligible: (item: QuizItem, ctx) =>
    isKanjiItem(item) && otherHanViet(item, ctx.pool).size >= 3,
  generate: (item, pool, rng) => {
    const kanjiItem = item as KanjiItem
    const distractors = shuffle(
      [...otherHanViet(kanjiItem, pool)].filter(
        (h) => h !== kanjiItem.hanViet,
      ),
      rng,
    ).slice(0, 3)
    const all = shuffle([kanjiItem.hanViet, ...distractors], rng)
    const choices: KanjiHanVietChoice[] = all.map((text, i) => ({
      id: String(i),
      text,
    }))
    const correctIndex = all.findIndex((h) => h === kanjiItem.hanViet)
    return {
      char: kanjiItem.char,
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
      promptText={q.char}
      choices={q.choices}
      correctChoiceId={q.correctChoiceId}
      onAnswer={onAnswer}
    />
  ),
}

register(kanjiHanVietQuestionType)
