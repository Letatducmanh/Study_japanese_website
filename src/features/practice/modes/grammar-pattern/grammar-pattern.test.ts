import { describe, expect, it } from 'vitest'
import { createRng } from '@/lib/rng'
import { grammarPatternQuestionType } from './index'
import type { GrammarPoint } from '@/domain/types'

function makeGrammar(
  id: string,
  title: string,
  lesson: number,
): GrammarPoint {
  return {
    id,
    bookId: 'mnn1',
    lesson,
    order: 1,
    title,
    meaning: '',
    explanationMd: '',
    supplemental: false,
    examples: [{ jp: '文', romaji: '', vi: 'nghĩa', chunks: ['文'] }],
  }
}

function makePool(): GrammarPoint[] {
  return [
    makeGrammar('a', '～ても いいですか', 6),
    makeGrammar('b', '～ては いけません', 6),
    makeGrammar('c', '～たいです', 13),
    makeGrammar('d', '～ましょう', 6),
    makeGrammar('e', '～なければ なりません', 17),
  ]
}

describe('grammarPatternQuestionType', () => {
  it('isEligible = true khi có ≥ 3 mẫu khác để làm đáp án nhiễu', () => {
    const pool = makePool()
    expect(grammarPatternQuestionType.isEligible(pool[0], { pool })).toBe(
      true,
    )
  })

  it('generate: đáp án đúng là tiêu đề mẫu ngữ pháp của câu ví dụ', () => {
    const pool = makePool()
    const q = grammarPatternQuestionType.generate(pool[0], pool, createRng(1))
    const correctChoice = q.choices.find((c) => c.id === q.correctChoiceId)
    expect(correctChoice?.text).toBe('～ても いいですか')
    expect(q.choices).toHaveLength(4)
  })

  it('isEligible = false khi không có mẫu khác', () => {
    const lonely = makeGrammar('lonely', '～たいです', 1)
    expect(
      grammarPatternQuestionType.isEligible(lonely, { pool: [lonely] }),
    ).toBe(false)
  })
})
