import { classifyItemId, parseVocabItemId } from '@/domain/quiz/item-id'
import { REVIEW_MODE_IDS } from '@/features/weakness/review-modes'
import type { Mastery, VocabItem } from '@/domain/types'

/**
 * Cấu hình phiên "Luyện ngay". Kiểu khai báo cục bộ (tương thích cấu trúc với
 * `PendingSessionConfig` của features/practice) để file này không import feature khác.
 */
export interface WeakReviewPlan {
  bookId: string
  lesson: number
  questionTypeIds: string[]
  questionCount: number
  includeExtended: boolean
  onlyItemIds: string[]
}

/** Số từ tối đa của một phiên "Luyện ngay" (nhãn nút: "Luyện ngay 20 câu yếu nhất"). */
export const MAX_REVIEW_WORDS = 20

/**
 * Chọn từ cho phiên "Luyện ngay" từ danh sách mastery yếu đã xếp hạng (yếu nhất trước), bất kể bài
 * (hợp đồng: contracts/review-session.md, P1–P7):
 * - chỉ từ vựng (bỏ mastery ngữ pháp/Kanji);
 * - mỗi từ một lần (một từ yếu ở nhiều kỹ năng chỉ tính một);
 * - tối đa 20 từ phân biệt, yếu nhất trước;
 * - mã không còn trong nội dung (không có trong `resolvedVocab`) bị bỏ qua;
 * - bài/bài học của cấu hình là của từ đầu tiên (để "Luyện tiếp" quay về một bài hợp lệ);
 * - không còn từ nào → `null`.
 */
export function planWeakReview(
  weak: Mastery[],
  resolvedVocab: VocabItem[],
): WeakReviewPlan | null {
  const byId = new Map(resolvedVocab.map((v) => [v.id, v]))
  const chosen: VocabItem[] = []
  const seen = new Set<string>()
  for (const m of weak) {
    if (chosen.length >= MAX_REVIEW_WORDS) break
    if (classifyItemId(m.itemId) !== 'vocab' || seen.has(m.itemId)) continue
    const item = byId.get(m.itemId)
    if (!item) continue
    seen.add(m.itemId)
    chosen.push(item)
  }
  if (chosen.length === 0) return null
  const first = parseVocabItemId(chosen[0].id)
  if (!first) return null
  return {
    bookId: first.bookId,
    lesson: first.lesson,
    questionTypeIds: REVIEW_MODE_IDS,
    questionCount: chosen.length,
    includeExtended: true,
    onlyItemIds: chosen.map((v) => v.id),
  }
}
