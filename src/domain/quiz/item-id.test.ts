import { describe, expect, it } from 'vitest'
import { classifyItemId, parseVocabItemId } from './item-id'

describe('classifyItemId', () => {
  it('nhận diện ID Kanji', () => {
    expect(classifyItemId('kanji-外')).toBe('kanji')
  })

  it('nhận diện ID ngữ pháp', () => {
    expect(classifyItemId('mnn1-l01-g-c16c5461')).toBe('grammar')
  })

  it('nhận diện ID từ vựng', () => {
    expect(classifyItemId('mnn1-l04-7d86b648')).toBe('vocab')
  })
})

describe('parseVocabItemId', () => {
  it('tách đúng bookId và lesson của ID từ vựng', () => {
    expect(parseVocabItemId('mnn1-l04-7d86b648')).toEqual({
      bookId: 'mnn1',
      lesson: 4,
    })
  })

  it('trả null với ID không phải từ vựng', () => {
    expect(parseVocabItemId('kanji-外')).toBeNull()
    expect(parseVocabItemId('mnn1-l01-g-c16c5461')).toBeNull()
  })
})
