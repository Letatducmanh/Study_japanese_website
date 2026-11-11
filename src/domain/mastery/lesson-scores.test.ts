import { describe, expect, it } from 'vitest'
import { computeLessonScores } from './lesson-scores'
import type { BookLessonSummary, Mastery } from '@/domain/types'

function makeMastery(overrides: Partial<Mastery>): Mastery {
  return {
    itemId: 'mnn1-l01-aaa',
    skill: 'meaning',
    score: 0.5,
    attempts: 1,
    streak: 1,
    lastTs: 0,
    ...overrides,
  }
}

function makeLessons(): BookLessonSummary[] {
  return [
    { lesson: 1, title: 'Bài 1', vocabCount: 2, mainVocabCount: 2, grammarCount: 0, kanjiCount: 0 },
    { lesson: 2, title: 'Bài 2', vocabCount: 2, mainVocabCount: 2, grammarCount: 0, kanjiCount: 0 },
  ]
}

describe('computeLessonScores', () => {
  it('tính đúng điểm từng bài, bỏ qua mục của bookId/lesson khác', () => {
    const mastery = [
      makeMastery({ itemId: 'mnn1-l01-aaa', score: 1 }),
      makeMastery({ itemId: 'mnn1-l01-aaa', skill: 'recall', score: 1 }),
      makeMastery({ itemId: 'mnn1-l02-bbb', score: 0.4 }),
      makeMastery({ itemId: 'mnn2-l01-ccc', score: 1 }), // sách khác, bị loại
    ]
    const result = computeLessonScores(mastery, 'mnn1', makeLessons())
    // Bài 1: 1 từ đã làm (avg 1.0 qua 2 kỹ năng) / 2 từ chính = 0.5
    expect(result.get(1)).toBeCloseTo(0.5)
    // Bài 2: 1 từ đã làm (0.4) / 2 từ chính = 0.2
    expect(result.get(2)).toBeCloseTo(0.2)
  })

  // Spec 002 (US1, FR-001): bài chưa có lượt làm không có khóa, không bị tính 0%.
  it('chưa có dữ liệu nào: không bài nào có khóa (không phải 0)', () => {
    const result = computeLessonScores([], 'mnn1', makeLessons())
    expect(result.size).toBe(0)
    expect(result.has(1)).toBe(false)
    expect(result.has(2)).toBe(false)
  })

  it('chỉ bài có mastery mới có khóa', () => {
    const mastery = [makeMastery({ itemId: 'mnn1-l01-aaa', score: 0.8 })]
    const result = computeLessonScores(mastery, 'mnn1', makeLessons())
    expect(result.has(1)).toBe(true)
    expect(result.has(2)).toBe(false)
  })

  it('bài đã làm nhưng toàn sai (score 0) vẫn có khóa với giá trị 0 (FR-003)', () => {
    const mastery = [
      makeMastery({ itemId: 'mnn1-l02-bbb', score: 0, streak: 0, attempts: 3 }),
    ]
    const result = computeLessonScores(mastery, 'mnn1', makeLessons())
    expect(result.has(2)).toBe(true)
    expect(result.get(2)).toBe(0)
  })

  it('mastery của bookId khác không tạo khóa cho bài trùng số', () => {
    const mastery = [makeMastery({ itemId: 'mnn2-l01-ccc', score: 0.1 })]
    const result = computeLessonScores(mastery, 'mnn1', makeLessons())
    expect(result.size).toBe(0)
  })

  it('mastery của từ vựng mở rộng cũng làm bài có khóa', () => {
    // ID từ mở rộng cùng dạng `mnn1-lNN-hash` (section không nằm trong ID)
    const mastery = [makeMastery({ itemId: 'mnn1-l02-ext00001', score: 0.3 })]
    const result = computeLessonScores(mastery, 'mnn1', makeLessons())
    expect(result.has(2)).toBe(true)
  })
})
