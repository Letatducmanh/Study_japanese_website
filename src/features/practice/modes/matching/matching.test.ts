import { describe, expect, it } from 'vitest'
import { createRng } from '@/lib/rng'
import { matchingQuestionType } from './index'
import type { VocabItem } from '@/domain/types'

function makeVocab(overrides: Partial<VocabItem>): VocabItem {
  return {
    id: `id-${Math.random()}`,
    bookId: 'mnn1',
    lesson: 1,
    section: 'main',
    kana: 'たべます',
    kanji: '食べます',
    romaji: 'tabemasu',
    meaning: 'ăn',
    pos: 'verb',
    answers: { kana: ['たべます'], kanji: ['食べます'], meaning: ['ăn'] },
    kanjiChars: ['食'],
    homographKey: 'たべます',
    ...overrides,
  }
}

function makePool(count: number): VocabItem[] {
  return Array.from({ length: count }, (_, i) =>
    makeVocab({
      id: `v${i}`,
      meaning: `nghĩa ${i}`,
      kana: `かな${i}`,
      kanji: `漢${i}`,
      homographKey: `かな${i}`,
    }),
  )
}

describe('matchingQuestionType', () => {
  it('isEligible = false khi chưa đủ 6 từ phân biệt', () => {
    const pool = makePool(3)
    expect(matchingQuestionType.isEligible(pool[0], { pool })).toBe(false)
  })

  it('isEligible = true khi đủ 6 từ', () => {
    const pool = makePool(6)
    expect(matchingQuestionType.isEligible(pool[0], { pool })).toBe(true)
  })

  it('generate: sinh đúng 6 cặp, không trùng id', () => {
    const pool = makePool(10)
    const q = matchingQuestionType.generate(pool[0], pool, createRng(1))
    expect(q.pairs).toHaveLength(6)
    expect(new Set(q.pairs.map((p) => p.id)).size).toBe(6)
  })

  it('grade: đúng khi không có lần ghép sai nào', () => {
    const pool = makePool(6)
    const q = matchingQuestionType.generate(pool[0], pool, createRng(1))
    expect(matchingQuestionType.grade(q, 0).correct).toBe(true)
  })

  it('grade: sai khi có lần ghép sai', () => {
    const pool = makePool(6)
    const q = matchingQuestionType.generate(pool[0], pool, createRng(1))
    expect(matchingQuestionType.grade(q, 2).correct).toBe(false)
  })
})
