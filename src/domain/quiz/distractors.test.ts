import { describe, expect, it } from 'vitest'
import { createRng } from '@/lib/rng'
import { findDistractorCandidates, pickDistractors } from './distractors'
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
    meaning: 'nghĩa mặc định',
    pos: 'verb',
    answers: { kana: ['たべます'], kanji: ['食べます'], meaning: ['ăn'] },
    kanjiChars: ['食'],
    homographKey: 'たべます',
    ...overrides,
  }
}

describe('pickDistractors', () => {
  const correct = makeVocab({
    id: 'correct',
    lesson: 3,
    pos: 'verb',
    meaning: 'ăn',
  })

  it('không bao giờ chọn mục cùng homographKey với đáp án đúng', () => {
    const pool = [
      correct,
      makeVocab({ id: 'same-homograph', homographKey: correct.homographKey }),
      makeVocab({ id: 'ok-1', homographKey: 'khac-1' }),
      makeVocab({ id: 'ok-2', homographKey: 'khac-2' }),
    ]
    const result = pickDistractors(
      correct,
      pool,
      { field: 'meaning', count: 3 },
      createRng(1),
    )
    expect(result.some((i) => i.id === 'same-homograph')).toBe(false)
  })

  it('không bao giờ chọn mục cùng nghĩa (kể cả khác dấu tiếng Việt)', () => {
    const pool = [
      correct,
      makeVocab({ id: 'same-meaning', homographKey: 'khac', meaning: 'Ăn' }),
      makeVocab({ id: 'ok-1', homographKey: 'khac-1', meaning: 'uống' }),
    ]
    const result = pickDistractors(
      correct,
      pool,
      { field: 'meaning', count: 3 },
      createRng(1),
    )
    expect(result.some((i) => i.id === 'same-meaning')).toBe(false)
  })

  it('không lấy từ sách khác', () => {
    const pool = [
      correct,
      makeVocab({ id: 'other-book', bookId: 'mnn2', homographKey: 'khac' }),
    ]
    const result = pickDistractors(
      correct,
      pool,
      { field: 'meaning', count: 3 },
      createRng(1),
    )
    expect(result).toHaveLength(0)
  })

  it('ưu tiên cùng bài hơn bài xa', () => {
    const pool = [
      correct,
      makeVocab({ id: 'far', homographKey: 'far', lesson: 20 }),
      makeVocab({ id: 'same-lesson', homographKey: 'same', lesson: 3 }),
    ]
    const result = pickDistractors(
      correct,
      pool,
      { field: 'meaning', count: 1 },
      createRng(1),
    )
    expect(result[0]?.id).toBe('same-lesson')
  })

  it('trả về ít hơn count nếu không đủ ứng viên hợp lệ', () => {
    const pool = [correct, makeVocab({ id: 'ok', homographKey: 'khac' })]
    const result = pickDistractors(
      correct,
      pool,
      { field: 'meaning', count: 5 },
      createRng(1),
    )
    expect(result).toHaveLength(1)
  })
})

describe('findDistractorCandidates', () => {
  const correct = makeVocab({
    id: 'correct',
    lesson: 3,
    pos: 'verb',
    meaning: 'ăn',
  })

  it('dùng để kiểm tra đủ ứng viên trước khi cho phép một hướng hỏi (isEligible)', () => {
    const pool = [correct, makeVocab({ id: 'ok', homographKey: 'khac' })]
    expect(findDistractorCandidates(correct, pool, 'meaning')).toHaveLength(1)
    expect(
      findDistractorCandidates(correct, [correct], 'meaning'),
    ).toHaveLength(0)
  })
})
