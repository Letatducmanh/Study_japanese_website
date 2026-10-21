import { describe, expect, it } from 'vitest'
import { createRng } from '@/lib/rng'
import { conjugationMcqQuestionType } from './index'
import type { VocabItem } from '@/domain/types'

function makeVerb(overrides: Partial<VocabItem>): VocabItem {
  return {
    id: `v-${Math.random()}`,
    bookId: 'mnn1',
    lesson: 1,
    section: 'main',
    kana: 'たべます',
    kanji: '食べます',
    romaji: 'tabemasu',
    meaning: 'ăn',
    pos: 'verb',
    verbGroup: 2,
    answers: { kana: ['たべます'], kanji: ['食べます'], meaning: ['ăn'] },
    kanjiChars: ['食'],
    homographKey: 'たべます',
    ...overrides,
  }
}

function makePool(): VocabItem[] {
  return [
    makeVerb({ id: 'correct' }),
    makeVerb({ id: 'b', kana: 'のみます', kanji: '飲みます', verbGroup: 1 }),
    makeVerb({ id: 'c', kana: 'いきます', kanji: '行きます', verbGroup: 1 }),
    makeVerb({ id: 'd', kana: 'みます', kanji: null, verbGroup: 2 }),
  ]
}

describe('conjugationMcqQuestionType', () => {
  it('isEligible = true khi là động từ và có ≥ 3 động từ khác trong pool', () => {
    const pool = makePool()
    expect(
      conjugationMcqQuestionType.isEligible(pool[0], { pool }),
    ).toBe(true)
  })

  it('isEligible = false với từ không phải động từ', () => {
    const noun = makeVerb({ id: 'n', pos: 'noun', verbGroup: undefined })
    expect(
      conjugationMcqQuestionType.isEligible(noun, { pool: makePool() }),
    ).toBe(false)
  })

  it('generate: sinh 4 lựa chọn, đáp án đúng nằm trong danh sách', () => {
    const pool = makePool()
    const q = conjugationMcqQuestionType.generate(pool[0], pool, createRng(1))
    expect(q.choices.length).toBeGreaterThan(1)
    const correctChoice = q.choices.find((c) => c.id === q.correctChoiceId)
    expect(correctChoice).toBeDefined()
  })

  it('grade: đúng khi chọn đúng id', () => {
    const pool = makePool()
    const q = conjugationMcqQuestionType.generate(pool[0], pool, createRng(1))
    expect(
      conjugationMcqQuestionType.grade(q, q.correctChoiceId).correct,
    ).toBe(true)
  })
})
