import { describe, expect, it } from 'vitest'
import { createRng } from '@/lib/rng'
import { kanjiReadingKunQuestionType, kanjiReadingOnQuestionType } from './index'
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
    examples: [
      { kind: 'kun', word: '一つ', reading: 'ひとつ', meaning: '1 cái' },
      { kind: 'on', word: '一月', reading: 'いちがつ', meaning: 'tháng 1' },
    ],
    relatedVocabIds: [],
    ...overrides,
  }
}

function makePool(): KanjiItem[] {
  return [
    makeKanji({ id: 'k1', char: '一' }),
    makeKanji({
      id: 'k2',
      char: '二',
      examples: [
        { kind: 'kun', word: '二つ', reading: 'ふたつ', meaning: '2 cái' },
        { kind: 'on', word: '二月', reading: 'にがつ', meaning: 'tháng 2' },
      ],
    }),
    makeKanji({
      id: 'k3',
      char: '三',
      examples: [
        { kind: 'kun', word: '三つ', reading: 'みっつ', meaning: '3 cái' },
        { kind: 'on', word: '三月', reading: 'さんがつ', meaning: 'tháng 3' },
      ],
    }),
    makeKanji({
      id: 'k4',
      char: '四',
      examples: [
        { kind: 'kun', word: '四つ', reading: 'よっつ', meaning: '4 cái' },
        { kind: 'on', word: '四月', reading: 'しがつ', meaning: 'tháng 4' },
      ],
    }),
  ]
}

describe('kanjiReadingOnQuestionType / kanjiReadingKunQuestionType', () => {
  it('isEligible = true khi pool có ≥ 3 cách đọc khác cùng loại', () => {
    const pool = makePool()
    expect(kanjiReadingOnQuestionType.isEligible(pool[0], { pool })).toBe(true)
    expect(kanjiReadingKunQuestionType.isEligible(pool[0], { pool })).toBe(
      true,
    )
  })

  it('generate (on): đề bài là từ ví dụ On, đáp án đúng là cách đọc On', () => {
    const pool = makePool()
    const q = kanjiReadingOnQuestionType.generate(pool[0], pool, createRng(1))
    expect(q.promptText).toBe('一月')
    const correctChoice = q.choices.find((c) => c.id === q.correctChoiceId)
    expect(correctChoice?.text).toBe('いちがつ')
  })

  it('generate (kun): đáp án đúng là cách đọc Kun', () => {
    const pool = makePool()
    const q = kanjiReadingKunQuestionType.generate(pool[0], pool, createRng(1))
    const correctChoice = q.choices.find((c) => c.id === q.correctChoiceId)
    expect(correctChoice?.text).toBe('ひとつ')
  })
})
