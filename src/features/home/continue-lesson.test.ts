import { describe, expect, it } from 'vitest'
import { findLatestVocabMastery } from './continue-lesson'
import type { Mastery } from '@/domain/types'

function mastery(itemId: string, lastTs: number): Mastery {
  return {
    itemId,
    skill: 'meaning',
    score: 0.5,
    attempts: 1,
    streak: 1,
    lastTs,
  }
}

describe('findLatestVocabMastery', () => {
  it('trả về null khi danh sách rỗng', () => {
    expect(findLatestVocabMastery([])).toBeNull()
  })

  it('bỏ qua mastery grammar/kanji, chỉ nhận itemId từ vựng đọc được', () => {
    const list = [
      mastery('kanji-行', 300),
      mastery('mnn1-l05-g-01', 200),
      mastery('mnn1-l03-005', 100),
    ]
    expect(findLatestVocabMastery(list)?.itemId).toBe('mnn1-l03-005')
  })

  it('chọn mastery từ vựng có lastTs lớn nhất', () => {
    const list = [
      mastery('mnn1-l03-005', 100),
      mastery('mnn1-l07-002', 500),
      mastery('mnn1-l01-001', 300),
    ]
    expect(findLatestVocabMastery(list)?.itemId).toBe('mnn1-l07-002')
  })

  it('trả về null khi không có mastery nào đọc được bookId/lesson', () => {
    const list = [mastery('kanji-行', 300), mastery('mnn1-l05-g-01', 200)]
    expect(findLatestVocabMastery(list)).toBeNull()
  })
})
