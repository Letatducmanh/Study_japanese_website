import { describe, expect, it } from 'vitest'
import { typingQuestionType } from './index'
import type { VocabItem } from '@/domain/types'

function makeVocab(overrides: Partial<VocabItem> = {}): VocabItem {
  return {
    id: 'gaikoku',
    bookId: 'mnn1',
    lesson: 1,
    section: 'main',
    kana: 'がいこく',
    kanji: '外国',
    romaji: 'gaikoku',
    meaning: 'nước ngoài',
    pos: 'noun',
    answers: { kana: ['がいこく'], kanji: ['外国'], meaning: ['nước ngoài'] },
    kanjiChars: ['外', '国'],
    homographKey: 'がいこく',
    ...overrides,
  }
}

describe('typingQuestionType', () => {
  it('isEligible với mọi từ vựng', () => {
    const item = makeVocab()
    expect(typingQuestionType.isEligible(item, { pool: [item] })).toBe(true)
  })

  it('grade: đúng khi gõ romaji tự đổi sang hiragana khớp kana', () => {
    const q = typingQuestionType.generate(makeVocab(), [], () => 0)
    expect(typingQuestionType.grade(q, 'gaikoku').correct).toBe(true)
  })

  it('grade: đúng khi gõ đúng kanji', () => {
    const q = typingQuestionType.generate(makeVocab(), [], () => 0)
    expect(typingQuestionType.grade(q, '外国').correct).toBe(true)
  })

  it('grade: sai khi gõ không khớp đáp án nào', () => {
    const q = typingQuestionType.generate(makeVocab(), [], () => 0)
    const result = typingQuestionType.grade(q, 'nihon')
    expect(result.correct).toBe(false)
    expect(result.expected).toBe('外国')
  })

  it('chấp nhận nhiều đáp án (A / B)', () => {
    const milk = makeVocab({
      id: 'miruku',
      kana: 'ぎゅうにゅう',
      kanji: null,
      answers: { kana: ['ぎゅうにゅう', 'ミルク'], kanji: [], meaning: ['sữa'] },
    })
    const q = typingQuestionType.generate(milk, [], () => 0)
    expect(typingQuestionType.grade(q, 'miruku').correct).toBe(true)
    expect(typingQuestionType.grade(q, 'gyuunyuu').correct).toBe(true)
  })
})
