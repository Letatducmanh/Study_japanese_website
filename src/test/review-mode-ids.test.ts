import { describe, expect, it } from 'vitest'
import '@/features/practice/modes/register-all'
import { questionRegistry } from '@/domain/quiz/registry'
import { REVIEW_MODE_IDS } from '@/features/weakness/review-modes'

// Đặt ở src/test/ vì cần nạp register-all của features/practice (luật lớp: features không import nhau).
describe('REVIEW_MODE_IDS (Luyện ngay / Ôn lại)', () => {
  it('mọi id đều có trong registry thật sau khi nạp register-all', () => {
    const registered = new Set(questionRegistry.list().map((q) => q.id))
    for (const id of REVIEW_MODE_IDS) {
      expect(registered.has(id), `dạng bài "${id}" chưa đăng ký`).toBe(true)
    }
  })

  it('gồm đủ thẻ ghi nhớ và hai hướng trắc nghiệm', () => {
    expect([...REVIEW_MODE_IDS].sort()).toEqual(
      ['flashcard', 'mcq-jp-vi', 'mcq-vi-jp'].sort(),
    )
  })
})
