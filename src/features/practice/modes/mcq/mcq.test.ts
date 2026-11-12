import { describe, expect, it } from 'vitest'
import { createRng } from '@/lib/rng'
import {
  mcqJpVi,
  mcqKanaKanji,
  mcqKanjiReading,
  mcqListenVi,
  mcqViJp,
  mcqViKanji,
} from './index'
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

function makePool(): VocabItem[] {
  return [
    makeVocab({
      id: 'correct',
      meaning: 'ăn',
      kana: 'たべます',
      kanji: '食べます',
      homographKey: 'たべます',
    }),
    makeVocab({
      id: 'b',
      meaning: 'uống',
      kana: 'のみます',
      kanji: '飲みます',
      homographKey: 'のみます',
    }),
    makeVocab({
      id: 'c',
      meaning: 'đi',
      kana: 'いきます',
      kanji: '行きます',
      homographKey: 'いきます',
    }),
    makeVocab({
      id: 'd',
      meaning: 'nghe',
      kana: 'ききます',
      kanji: '聞きます',
      homographKey: 'ききます',
    }),
    makeVocab({
      id: 'e',
      meaning: 'nhìn',
      kana: 'みます',
      kanji: null,
      homographKey: 'みます',
    }),
  ]
}

describe('mcqJpVi', () => {
  it('sinh đúng 4 lựa chọn, đáp án đúng là nghĩa của từ', () => {
    const pool = makePool()
    const correct = pool[0]
    const q = mcqJpVi.generate(correct, pool, createRng(1))
    expect(q.choices).toHaveLength(4)
    const correctChoice = q.choices.find((c) => c.id === q.correctChoiceId)
    expect(correctChoice?.text).toBe('ăn')
  })

  it('grade: đúng khi chọn đúng id, given là nghĩa đã chọn', () => {
    const pool = makePool()
    const q = mcqJpVi.generate(pool[0], pool, createRng(1))
    const wrongChoice = q.choices.find((c) => c.id !== q.correctChoiceId)!
    expect(mcqJpVi.grade(q, q.correctChoiceId)).toEqual({
      correct: true,
      expected: 'ăn',
      given: 'ăn',
    })
    expect(mcqJpVi.grade(q, wrongChoice.id)).toEqual({
      correct: false,
      expected: 'ăn',
      given: wrongChoice.text,
    })
  })

  it('isEligible = false khi không đủ ứng viên nhiễu', () => {
    const correct = makeVocab({ id: 'lonely', meaning: 'ăn' })
    expect(mcqJpVi.isEligible(correct, { pool: [correct] })).toBe(false)
  })
})

describe('mcqKanjiReading / mcqKanaKanji / mcqViKanji (yêu cầu có Kanji)', () => {
  const pool = makePool()

  it('không áp dụng cho từ không có Kanji', () => {
    const noKanji = pool.find((v) => v.kanji === null)!
    expect(mcqKanjiReading.isEligible(noKanji, { pool })).toBe(false)
    expect(mcqKanaKanji.isEligible(noKanji, { pool })).toBe(false)
    expect(mcqViKanji.isEligible(noKanji, { pool })).toBe(false)
  })

  it('áp dụng cho từ có Kanji và đủ ứng viên', () => {
    const withKanji = pool[0]
    expect(mcqKanjiReading.isEligible(withKanji, { pool })).toBe(true)
  })

  it('mcqKanjiReading: đề bài là Kanji, đáp án đúng là cách đọc kana', () => {
    const withKanji = pool[0]
    const q = mcqKanjiReading.generate(withKanji, pool, createRng(1))
    expect(q.promptText).toBe('食べます')
    const correctChoice = q.choices.find((c) => c.id === q.correctChoiceId)
    expect(correctChoice?.text).toBe('たべます')
  })
})

describe('mcqViJp', () => {
  it('đề bài là nghĩa, đáp án đúng là chữ Nhật', () => {
    const pool = makePool()
    const q = mcqViJp.generate(pool[0], pool, createRng(1))
    expect(q.promptText).toBe('ăn')
    const correctChoice = q.choices.find((c) => c.id === q.correctChoiceId)
    expect(correctChoice?.text).toBe('食べます')
  })
})

describe('mcqListenVi', () => {
  it('không có promptText, chỉ có promptAudio để đọc', () => {
    const pool = makePool()
    const q = mcqListenVi.generate(pool[0], pool, createRng(1))
    expect(q.promptText).toBeUndefined()
    expect(q.promptAudio).toBe('食べます')
  })
})

describe('promptSpeak: khi nào nút loa ở đề được hiện', () => {
  const pool = makePool()
  const cases = [
    ['mcq-jp-vi', mcqJpVi, 'always'],
    ['mcq-vi-jp', mcqViJp, 'never'],
    ['mcq-kanji-reading', mcqKanjiReading, 'after-answer'],
    ['mcq-kana-kanji', mcqKanaKanji, 'always'],
    ['mcq-listen-vi', mcqListenVi, 'never'],
    ['mcq-vi-kanji', mcqViKanji, 'never'],
  ] as const

  it.each(cases)('%s → promptSpeak = %s', (_id, direction, expected) => {
    const q = direction.generate(pool[0], pool, createRng(1))
    expect(q.promptSpeak).toBe(expected)
  })
})
