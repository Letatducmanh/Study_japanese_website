import { describe, expect, it } from 'vitest'
import { createRng } from '@/lib/rng'
import { sentenceOrderQuestionType } from './index'
import type { GrammarPoint } from '@/domain/types'

function makeGrammar(): GrammarPoint {
  return {
    id: 'mnn1-l01-g-1',
    bookId: 'mnn1',
    lesson: 1,
    order: 1,
    title: 'N1 は N2 じゃ ありません',
    meaning: '',
    explanationMd: '',
    supplemental: false,
    examples: [
      {
        jp: 'サントスさんは 学生じゃ ありません。',
        romaji: '',
        vi: 'Anh Santos không phải là sinh viên.',
        chunks: ['サントスさんは', '学生じゃ', 'ありません。'],
      },
      {
        jp: 'わたしは 日本人では ありません。',
        romaji: '',
        vi: 'Tôi không phải là người Nhật.',
        chunks: ['わたしは', '日本人では', 'ありません。'],
      },
    ],
  }
}

describe('sentenceOrderQuestionType', () => {
  it('isEligible = true khi có câu ví dụ ≥ 3 cụm', () => {
    const point = makeGrammar()
    expect(sentenceOrderQuestionType.isEligible(point, { pool: [point] })).toBe(
      true,
    )
  })

  it('isEligible = false khi mọi câu ví dụ < 3 cụm', () => {
    const point = { ...makeGrammar(), examples: [
      { jp: 'あ。', romaji: '', vi: '', chunks: ['あ', 'い。'] },
    ] }
    expect(sentenceOrderQuestionType.isEligible(point, { pool: [point] })).toBe(
      false,
    )
  })

  it('generate: sinh đủ số cụm, shuffledIds là hoán vị của chunks', () => {
    const point = makeGrammar()
    const q = sentenceOrderQuestionType.generate(point, [point], createRng(1))
    expect(q.shuffledIds.sort()).toEqual(q.chunks.map((c) => c.id).sort())
  })

  it('grade: đúng khi trả đúng thứ tự, sai khi sai thứ tự', () => {
    const point = makeGrammar()
    const q = sentenceOrderQuestionType.generate(point, [point], createRng(1))
    const correctOrder = q.chunks.map((c) => c.id)
    expect(sentenceOrderQuestionType.grade(q, correctOrder).correct).toBe(true)
    const wrongOrder = [...correctOrder].reverse()
    expect(sentenceOrderQuestionType.grade(q, wrongOrder).correct).toBe(false)
  })
})
