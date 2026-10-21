import { describe, expect, it } from 'vitest'
import { createRng } from '@/lib/rng'
import { kanjiInVocabQuestionType } from './index'
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
    examples: [{ kind: 'on', word: '一月', reading: 'いちがつ', meaning: 'tháng 1' }],
    relatedVocabIds: [],
    ...overrides,
  }
}

function makePool(): KanjiItem[] {
  return [
    makeKanji({ id: 'k1', char: '一' }),
    makeKanji({ id: 'k2', char: '二' }),
    makeKanji({ id: 'k3', char: '三' }),
    makeKanji({ id: 'k4', char: '四' }),
  ]
}

describe('kanjiInVocabQuestionType', () => {
  it('isEligible = true khi có ví dụ chứa chữ và đủ đáp án nhiễu', () => {
    const pool = makePool()
    expect(kanjiInVocabQuestionType.isEligible(pool[0], { pool })).toBe(true)
  })

  it('generate: che đúng vị trí chữ Kanji trong từ ví dụ', () => {
    const pool = makePool()
    const q = kanjiInVocabQuestionType.generate(pool[0], pool, createRng(1))
    expect(q.before + '_' + q.after).toBe('_月')
    const correctChoice = q.choices.find((c) => c.id === q.correctChoiceId)
    expect(correctChoice?.text).toBe('一')
  })

  it('grade: đúng khi chọn đúng id', () => {
    const pool = makePool()
    const q = kanjiInVocabQuestionType.generate(pool[0], pool, createRng(1))
    expect(kanjiInVocabQuestionType.grade(q, q.correctChoiceId).correct).toBe(
      true,
    )
  })
})
