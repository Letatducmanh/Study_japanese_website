import { describe, expect, it } from 'vitest'
import { createRng } from '@/lib/rng'
import { particleQuestionType } from './index'
import type { GrammarPoint } from '@/domain/types'

function makeGrammar(overrides: Partial<GrammarPoint> = {}): GrammarPoint {
  return {
    id: 'mnn1-l01-g-1',
    bookId: 'mnn1',
    lesson: 1,
    order: 1,
    title: 'N1 は N2 です',
    meaning: 'N1 là N2',
    explanationMd: '',
    supplemental: false,
    examples: [
      {
        jp: 'わたしは マイク・ミラーです。',
        romaji: 'watashi wa maiku mira desu.',
        vi: 'Tôi là Mike Miller.',
        chunks: ['わたしは', 'マイク・ミラーです。'],
      },
    ],
    ...overrides,
  }
}

describe('particleQuestionType', () => {
  it('isEligible = true khi có cụm kết thúc bằng trợ từ', () => {
    const point = makeGrammar()
    expect(particleQuestionType.isEligible(point, { pool: [point] })).toBe(
      true,
    )
  })

  it('isEligible = false khi không có cụm nào kết thúc bằng trợ từ', () => {
    const point = makeGrammar({
      examples: [
        {
          jp: 'ありがとうございます。',
          romaji: 'arigatou gozaimasu.',
          vi: 'Cảm ơn.',
          chunks: ['ありがとうございます。'],
        },
      ],
    })
    expect(particleQuestionType.isEligible(point, { pool: [point] })).toBe(
      false,
    )
  })

  it('generate: che đúng trợ từ cuối cụm, 4 lựa chọn gồm đáp án đúng', () => {
    const point = makeGrammar()
    const q = particleQuestionType.generate(point, [point], createRng(1))
    expect(q.before).toBe('わたし')
    expect(q.choices).toHaveLength(4)
    const correctChoice = q.choices.find((c) => c.id === q.correctChoiceId)
    expect(correctChoice?.text).toBe('は')
  })

  it('grade: đúng khi chọn đúng id', () => {
    const point = makeGrammar()
    const q = particleQuestionType.generate(point, [point], createRng(1))
    expect(particleQuestionType.grade(q, q.correctChoiceId).correct).toBe(
      true,
    )
  })

  it('không dùng trợ từ nhầm hợp lệ (へ/に) làm đáp án nhiễu của nhau', () => {
    const point = makeGrammar({
      examples: [
        {
          jp: '駅へ 行きます。',
          romaji: 'eki e ikimasu.',
          vi: 'Đi đến nhà ga.',
          chunks: ['駅へ', '行きます。'],
        },
      ],
    })
    for (let seed = 1; seed <= 20; seed++) {
      const q = particleQuestionType.generate(point, [point], createRng(seed))
      const texts = q.choices.map((c) => c.text)
      expect(texts).not.toContain('に')
    }
  })
})
