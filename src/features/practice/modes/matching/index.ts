import {
  findDistractorCandidates,
  pickDistractors,
} from '@/domain/quiz/distractors'
import {
  isVocabItem,
  register,
  type QuestionType,
  type QuizItem,
} from '@/domain/quiz/registry'
import { shuffle } from '@/lib/rng'
import { vi } from '@/i18n/vi'
import { MatchingComponent } from './MatchingComponent'
import type { MatchingQuestion } from './types'
import type { VocabItem } from '@/domain/types'

const PAIR_COUNT = 6

export const matchingQuestionType: QuestionType<MatchingQuestion> = {
  id: 'matching',
  label: vi.matching.label,
  itemType: 'vocab',
  skill: 'meaning',
  isEligible: (item: QuizItem, ctx) => {
    if (!isVocabItem(item)) return false
    const pool = ctx.pool.filter(isVocabItem)
    return (
      findDistractorCandidates(item, pool, 'meaning').length >= PAIR_COUNT - 1
    )
  },
  generate: (item, pool, rng) => {
    const vocabItem = item as VocabItem
    const vocabPool = pool.filter(isVocabItem)
    const others = pickDistractors(
      vocabItem,
      vocabPool,
      { field: 'meaning', count: PAIR_COUNT - 1 },
      rng,
    )
    const all = shuffle([vocabItem, ...others], rng)
    return {
      pairs: all.map((v) => ({
        id: v.id,
        jp: v.kanji ?? v.kana,
        vi: v.meaning,
      })),
    }
  },
  grade: (_question, answer) => {
    const mistakes = answer as number
    return {
      correct: mistakes === 0,
      expected: vi.matching.allCorrect,
      given: vi.matching.mistakeCount(mistakes),
    }
  },
  Component: MatchingComponent,
}

register(matchingQuestionType)
