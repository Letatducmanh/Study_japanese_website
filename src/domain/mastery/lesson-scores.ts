import { parseVocabItemId } from '@/domain/quiz/item-id'
import { averageMastery, lessonMasteryScore } from './formula'
import type { BookLessonSummary, Mastery } from '@/domain/types'

/**
 * Độ thành thạo từng bài của 1 giáo trình (mục 6.5), dùng cho bản đồ nhiệt và trang Điểm yếu.
 * Chỉ có khóa cho bài đã có ít nhất một mastery của từ vựng (chính hay mở rộng) thuộc bài đó;
 * bài chưa làm không có khóa (không phải 0%) để không bị coi là "yếu nhất" (spec 002, FR-001).
 * Bài đã làm toàn sai vẫn có khóa với giá trị 0.
 */
export function computeLessonScores(
  allMastery: Mastery[],
  bookId: string,
  lessons: BookLessonSummary[],
): Map<number, number> {
  const scoresByItem = new Map<string, number[]>()
  const lessonByItem = new Map<string, number>()
  for (const m of allMastery) {
    const parsed = parseVocabItemId(m.itemId)
    if (!parsed || parsed.bookId !== bookId) continue
    lessonByItem.set(m.itemId, parsed.lesson)
    const arr = scoresByItem.get(m.itemId) ?? []
    arr.push(m.score)
    scoresByItem.set(m.itemId, arr)
  }

  const itemAveragesByLesson = new Map<number, number[]>()
  for (const [itemId, scores] of scoresByItem) {
    const lesson = lessonByItem.get(itemId)!
    const arr = itemAveragesByLesson.get(lesson) ?? []
    arr.push(averageMastery(scores))
    itemAveragesByLesson.set(lesson, arr)
  }

  const result = new Map<number, number>()
  for (const lessonMeta of lessons) {
    if (lessonMeta.lesson === 'appendix') continue
    const itemAverages = itemAveragesByLesson.get(lessonMeta.lesson)
    if (!itemAverages) continue // bài chưa có lượt làm: không có khóa
    result.set(
      lessonMeta.lesson,
      lessonMasteryScore(itemAverages, lessonMeta.mainVocabCount),
    )
  }
  return result
}
