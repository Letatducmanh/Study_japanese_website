import {
  pickDistractors,
  type DistractorField,
} from '@/domain/quiz/distractors'
import {
  isGrammarItem,
  isVocabItem,
  register,
  type QuestionType,
  type QuizItem,
} from '@/domain/quiz/registry'
import { shuffle } from '@/lib/rng'
import { vi } from '@/i18n/vi'
import { FillBlankComponent } from './FillBlankComponent'
import type { FillBlankChoice, FillBlankQuestion } from './types'
import type { GrammarExample, GrammarPoint, VocabItem } from '@/domain/types'

interface Match {
  point: GrammarPoint
  example: GrammarExample
  matchedText: string
}

function findMatches(item: VocabItem, grammarPool: GrammarPoint[]): Match[] {
  const candidates = [item.kanji, item.kana].filter(
    (v): v is string => !!v,
  )
  const matches: Match[] = []
  for (const point of grammarPool) {
    for (const example of point.examples) {
      for (const text of candidates) {
        if (example.jp.includes(text)) {
          matches.push({ point, example, matchedText: text })
          break
        }
      }
    }
  }
  return matches
}

export const fillBlankQuestionType: QuestionType<FillBlankQuestion> = {
  id: 'fill-blank',
  label: vi.fillBlank.label,
  itemType: 'vocab',
  skill: 'usage',
  isEligible: (item: QuizItem, ctx) => {
    if (!isVocabItem(item)) return false
    const grammarPool = ctx.pool.filter(isGrammarItem)
    return findMatches(item, grammarPool).length > 0
  },
  generate: (item, pool, rng) => {
    const vocabItem = item as VocabItem
    const grammarPool = pool.filter(isGrammarItem)
    const matches = findMatches(vocabItem, grammarPool)
    const match = matches[Math.floor(rng() * matches.length)]
    const index = match.example.jp.indexOf(match.matchedText)
    const before = match.example.jp.slice(0, index)
    const after = match.example.jp.slice(index + match.matchedText.length)

    const field: DistractorField =
      match.matchedText === vocabItem.kanji ? 'kanji' : 'kana'
    const vocabPool = pool.filter(isVocabItem)
    const distractors = pickDistractors(
      vocabItem,
      vocabPool,
      { field, count: 3 },
      rng,
    )
    const all = shuffle([vocabItem, ...distractors], rng)
    const choices: FillBlankChoice[] = all.map((candidate, i) => ({
      id: String(i),
      text: field === 'kanji' ? candidate.kanji ?? candidate.kana : candidate.kana,
    }))
    const correctIndex = all.findIndex((c) => c.id === vocabItem.id)

    return {
      before,
      after,
      vi: match.example.vi,
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
  Component: FillBlankComponent,
}

register(fillBlankQuestionType)
