import {
  isKanjiItem,
  register,
  type QuestionType,
  type QuizItem,
} from '@/domain/quiz/registry'
import { shuffle } from '@/lib/rng'
import { vi } from '@/i18n/vi'
import { KanjiInVocabComponent } from './KanjiInVocabComponent'
import type { KanjiInVocabChoice, KanjiInVocabQuestion } from './types'
import type { KanjiExample, KanjiItem } from '@/domain/types'

function wordExamples(item: KanjiItem): KanjiExample[] {
  return item.examples.filter((ex) => ex.word.includes(item.char))
}

function otherChars(item: KanjiItem, pool: QuizItem[]): Set<string> {
  const set = new Set<string>()
  for (const p of pool) {
    if (isKanjiItem(p) && p.id !== item.id) set.add(p.char)
  }
  return set
}

export const kanjiInVocabQuestionType: QuestionType<KanjiInVocabQuestion> = {
  id: 'kanji-in-vocab',
  label: vi.kanjiQuiz.labelInVocab,
  itemType: 'kanji',
  skill: 'recall',
  isEligible: (item: QuizItem, ctx) =>
    isKanjiItem(item) &&
    wordExamples(item).length > 0 &&
    otherChars(item, ctx.pool).size >= 3,
  generate: (item, pool, rng) => {
    const kanjiItem = item as KanjiItem
    const examples = wordExamples(kanjiItem)
    const example = examples[Math.floor(rng() * examples.length)]
    const charIndex = example.word.indexOf(kanjiItem.char)
    const before = example.word.slice(0, charIndex)
    const after = example.word.slice(charIndex + 1)

    const distractors = shuffle(
      [...otherChars(kanjiItem, pool)],
      rng,
    ).slice(0, 3)
    const all = shuffle([kanjiItem.char, ...distractors], rng)
    const choices: KanjiInVocabChoice[] = all.map((text, i) => ({
      id: String(i),
      text,
    }))
    const correctIndex = all.findIndex((c) => c === kanjiItem.char)

    return {
      before,
      after,
      hint: `${example.reading} — ${example.meaning}`,
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
  Component: KanjiInVocabComponent,
}

register(kanjiInVocabQuestionType)
