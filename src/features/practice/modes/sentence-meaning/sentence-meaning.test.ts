import { describe, expect, it } from 'vitest'
import { createRng } from '@/lib/rng'
import { sentenceMeaningQuestionType } from './index'
import type { GrammarPoint } from '@/domain/types'

function makeGrammar(id: string, vi: string, jp = '文'): GrammarPoint {
  return {
    id,
    bookId: 'mnn1',
    lesson: 1,
    order: 1,
    title: 't',
    meaning: '',
    explanationMd: '',
    supplemental: false,
    examples: [{ jp, romaji: '', vi, chunks: [jp] }],
  }
}

function makePool(): GrammarPoint[] {
  return [
    makeGrammar('a', 'Tôi là Mike.', '私はマイクです。'),
    makeGrammar('b', 'Anh ấy là bác sĩ.'),
    makeGrammar('c', 'Đây là cái bút.'),
    makeGrammar('d', 'Ngày mai tôi đi học.'),
  ]
}

describe('sentenceMeaningQuestionType', () => {
  it('isEligible = true khi pool có ≥ 3 bản dịch khác', () => {
    const pool = makePool()
    expect(
      sentenceMeaningQuestionType.isEligible(pool[0], { pool }),
    ).toBe(true)
  })

  it('isEligible = false khi pool quá ít bản dịch khác', () => {
    const pool = makePool().slice(0, 2)
    expect(
      sentenceMeaningQuestionType.isEligible(pool[0], { pool }),
    ).toBe(false)
  })

  it('generate: đề bài là câu tiếng Nhật, đáp án đúng là bản dịch của nó', () => {
    const pool = makePool()
    const q = sentenceMeaningQuestionType.generate(pool[0], pool, createRng(1))
    expect(q.jp).toBe('私はマイクです。')
    const correctChoice = q.choices.find((c) => c.id === q.correctChoiceId)
    expect(correctChoice?.text).toBe('Tôi là Mike.')
  })
})
