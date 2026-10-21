import { describe, expect, it } from 'vitest'
import { createRng } from '@/lib/rng'
import { conjugationTypingQuestionType } from './index'
import type { VocabItem } from '@/domain/types'

function makeVerb(): VocabItem {
  return {
    id: 'v1',
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
  }
}

describe('conjugationTypingQuestionType', () => {
  it('isEligible = true với động từ', () => {
    expect(
      conjugationTypingQuestionType.isEligible(makeVerb(), { pool: [] }),
    ).toBe(true)
  })

  it('grade: chấp nhận gõ romaji tự đổi sang hiragana khớp đáp án', () => {
    const q = conjugationTypingQuestionType.generate(
      makeVerb(),
      [],
      createRng(1),
    )
    expect(conjugationTypingQuestionType.grade(q, q.correctForm).correct).toBe(
      true,
    )
  })
})
