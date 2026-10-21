import { describe, expect, it } from 'vitest'
import { conjugateSafe, isConjugatableVerb } from './conjugation-prompt'
import type { VocabItem } from '@/domain/types'

function makeVerb(overrides: Partial<VocabItem> = {}): VocabItem {
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
    ...overrides,
  }
}

describe('conjugateSafe', () => {
  it('chia đúng thể て của động từ nhóm II', () => {
    expect(conjugateSafe(makeVerb(), 'te')).toBe('たべて')
  })

  it('trả null với từ không phải động từ', () => {
    const noun = makeVerb({ pos: 'noun', verbGroup: undefined })
    expect(conjugateSafe(noun, 'te')).toBeNull()
  })

  it('isConjugatableVerb = true với động từ hợp lệ, false với danh từ', () => {
    expect(isConjugatableVerb(makeVerb())).toBe(true)
    expect(isConjugatableVerb(makeVerb({ pos: 'noun', verbGroup: undefined }))).toBe(
      false,
    )
  })
})
