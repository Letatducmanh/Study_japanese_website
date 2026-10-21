import { describe, expect, it } from 'vitest'
import { createRng } from '@/lib/rng'
import { kanjiHanVietQuestionType } from './index'
import type { KanjiItem } from '@/domain/types'

function makeKanji(overrides: Partial<KanjiItem>): KanjiItem {
  return {
    id: `kanji-${Math.random()}`,
    bookId: 'kanji-master-n5',
    chapter: 1,
    char: '一',
    strokes: 1,
    kun: ['ひと'],
    on: ['イチ'],
    hanViet: 'NHẤT',
    meaning: 'một',
    examples: [],
    relatedVocabIds: [],
    ...overrides,
  }
}

function makePool(): KanjiItem[] {
  return [
    makeKanji({ id: 'k1', char: '一', hanViet: 'NHẤT' }),
    makeKanji({ id: 'k2', char: '二', hanViet: 'NHỊ' }),
    makeKanji({ id: 'k3', char: '三', hanViet: 'TAM' }),
    makeKanji({ id: 'k4', char: '四', hanViet: 'TỨ' }),
  ]
}

describe('kanjiHanVietQuestionType', () => {
  it('isEligible = true khi pool có ≥ 3 Hán Việt khác', () => {
    const pool = makePool()
    expect(kanjiHanVietQuestionType.isEligible(pool[0], { pool })).toBe(true)
  })

  it('isEligible = false khi không đủ đáp án nhiễu', () => {
    const lonely = makeKanji({ id: 'lonely' })
    expect(
      kanjiHanVietQuestionType.isEligible(lonely, { pool: [lonely] }),
    ).toBe(false)
  })

  it('generate: đáp án đúng là Hán Việt của chữ', () => {
    const pool = makePool()
    const q = kanjiHanVietQuestionType.generate(pool[0], pool, createRng(1))
    expect(q.char).toBe('一')
    const correctChoice = q.choices.find((c) => c.id === q.correctChoiceId)
    expect(correctChoice?.text).toBe('NHẤT')
  })
})
