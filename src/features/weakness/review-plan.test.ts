import { describe, expect, it } from 'vitest'
import { planWeakReview } from './review-plan'
import { REVIEW_MODE_IDS } from './review-modes'
import type { Mastery, VocabItem } from '@/domain/types'

function word(lesson: number, n: number): VocabItem {
  const kana = `かな${lesson}${n}`
  return {
    id: `mnn1-l${String(lesson).padStart(2, '0')}-w${n}`,
    bookId: 'mnn1',
    lesson,
    section: 'main',
    kana,
    kanji: null,
    romaji: `kana${lesson}${n}`,
    meaning: `nghĩa ${lesson}-${n}`,
    pos: 'noun',
    answers: { kana: [kana], kanji: [], meaning: [] },
    kanjiChars: [],
    homographKey: kana,
  }
}

function weak(itemId: string, skill: Mastery['skill'] = 'meaning'): Mastery {
  return { itemId, skill, score: 0.2, attempts: 3, streak: 0, lastTs: 1 }
}

/** Các từ xếp xen kẽ giữa Bài 3, 5, 8 (yếu nhất trước). */
function mixedWords(count: number): VocabItem[] {
  const lessons = [3, 5, 8]
  return Array.from({ length: count }, (_, i) =>
    word(lessons[i % 3]!, Math.floor(i / 3) + 1),
  )
}

/** Các từ cùng một bài (để ca chốt chặn không phụ thuộc việc lấy qua nhiều bài). */
function lessonWords(lesson: number, count: number): VocabItem[] {
  return Array.from({ length: count }, (_, i) => word(lesson, i + 1))
}

describe('planWeakReview', () => {
  it('(a) 12 từ yếu ở 3 bài → đủ 12 mã khác nhau, 12 câu, đúng dạng bài', () => {
    const words = mixedWords(12)
    const plan = planWeakReview(
      words.map((w) => weak(w.id)),
      words,
    )
    expect(plan).not.toBeNull()
    expect(new Set(plan!.onlyItemIds).size).toBe(12)
    expect(plan!.questionCount).toBe(12)
    expect(plan!.questionTypeIds).toBe(REVIEW_MODE_IDS)
    expect(plan!.includeExtended).toBe(true)
  })

  it('(b) bài của cấu hình là bài của từ yếu nhất (để "Luyện tiếp" quay về bài hợp lệ)', () => {
    const words = mixedWords(6)
    const plan = planWeakReview(
      words.map((w) => weak(w.id)),
      words,
    )
    expect(plan?.bookId).toBe('mnn1')
    expect(plan?.lesson).toBe(3)
  })

  it('(c) 25 từ yếu ở nhiều bài → tối đa 20 từ, theo thứ hạng yếu nhất trước', () => {
    const words = mixedWords(25)
    const plan = planWeakReview(
      words.map((w) => weak(w.id)),
      words,
    )
    expect(plan!.onlyItemIds).toHaveLength(20)
    expect(plan!.questionCount).toBe(20)
    expect(plan!.onlyItemIds).toEqual(words.slice(0, 20).map((w) => w.id))
  })

  it('(d) chốt chặn: mastery ngữ pháp và Kanji bị bỏ qua', () => {
    const words = lessonWords(3, 3)
    const plan = planWeakReview(
      [
        weak('mnn1-l03-g-001', 'grammar'),
        weak('kanji-行', 'reading'),
        ...words.map((w) => weak(w.id)),
      ],
      words,
    )
    expect(plan!.onlyItemIds).toEqual(words.map((w) => w.id))
  })

  it('(e) một từ yếu ở nhiều kỹ năng chỉ tính một lần', () => {
    const words = mixedWords(6)
    const rows = words.flatMap((w) => [weak(w.id, 'meaning'), weak(w.id, 'recall')])
    const plan = planWeakReview(rows, words)
    expect(plan!.onlyItemIds).toEqual(words.map((w) => w.id))
    expect(plan!.questionCount).toBe(6)
  })

  it('(f) chốt chặn: danh sách rỗng → null', () => {
    expect(planWeakReview([], [])).toBeNull()
  })

  it('(g) chỉ có mastery ngữ pháp/Kanji → null', () => {
    expect(
      planWeakReview([weak('mnn1-l03-g-001', 'grammar'), weak('kanji-行', 'reading')], []),
    ).toBeNull()
  })

  it('(h) chốt chặn: từ không còn trong nội dung bị bỏ qua, không tính vào 20 từ', () => {
    const words = lessonWords(3, 4)
    const plan = planWeakReview(
      [weak('mnn1-l03-gone'), ...words.map((w) => weak(w.id))],
      words, // 'mnn1-l03-gone' không giải ra được
    )
    expect(plan!.onlyItemIds).toEqual(words.map((w) => w.id))
  })
})
