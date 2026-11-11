import type { QuizItem } from '@/domain/quiz/registry'
import type { LessonFile } from '@/domain/types'

export interface ReviewPoolsInput {
  /** Các file bài đã tải (một bài, hoặc nhiều bài khi luyện từ yếu qua nhiều bài). */
  lessonFiles: LessonFile[]
  /** Nếu có: chỉ luyện đúng những mã từ vựng này (ngữ pháp vẫn có mặt như cũ). */
  onlyItemIds?: string[]
  includeExtended: boolean
}

export interface ReviewPools {
  /** Các mục cần luyện (truyền vào `items` của `buildSession`). */
  targets: QuizItem[]
  /** Bối cảnh để sinh đáp án nhiễu (truyền vào `ctxPool` của `buildSession`). */
  ctxPool: QuizItem[]
}

/**
 * Dựng hai tập mục cho một phiên luyện (hợp đồng: contracts/review-session.md, R1–R3).
 * - Không có `onlyItemIds`: `targets` = `ctxPool` = từ vựng (lọc `includeExtended`) + ngữ pháp
 *   của các bài đã tải — giống hệt hành vi trước đây.
 * - Có `onlyItemIds`: `targets` chỉ gồm các từ cần ôn (+ ngữ pháp như cũ), còn `ctxPool` là
 *   toàn bộ từ vựng của các bài đã tải, để dạng trắc nghiệm có đủ đáp án nhiễu dù chỉ ôn vài từ.
 * Không đổi thứ tự hay nội dung của từng mục.
 */
export function buildReviewPools(input: ReviewPoolsInput): ReviewPools {
  const vocab = input.lessonFiles.flatMap((file) =>
    file.vocab.filter((v) => v.section === 'main' || input.includeExtended),
  )
  // Ngữ pháp luôn có mặt (không lọc theo onlyItemIds) để các dạng như "Điền từ vào câu"
  // tìm được câu ví dụ chứa từ, dù dạng đó không tự sinh câu hỏi từ nó.
  const grammar = input.lessonFiles.flatMap((file) => file.grammar)

  if (!input.onlyItemIds) {
    const all: QuizItem[] = [...vocab, ...grammar]
    return { targets: all, ctxPool: all }
  }

  const only = new Set(input.onlyItemIds)
  const targets: QuizItem[] = [...vocab.filter((v) => only.has(v.id)), ...grammar]
  const ctxPool: QuizItem[] = [...vocab, ...grammar]
  return { targets, ctxPool }
}
