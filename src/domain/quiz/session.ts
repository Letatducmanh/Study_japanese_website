import { createRng, pickRandom } from '@/lib/rng'
import type { QuestionType, QuizItem } from '@/domain/quiz/registry'

export interface SessionConfig {
  /** Mục đã được lọc sẵn theo phạm vi (1 bài / nhiều bài / điểm yếu / đến hạn ôn...). */
  items: QuizItem[]
  /** Các dạng bài tập được phép dùng trong phiên này. */
  questionTypes: QuestionType<unknown>[]
  questionCount: number
  seed: number
}

export interface SessionQuestion {
  item: QuizItem
  questionType: QuestionType<unknown>
  question: unknown
}

export interface Session {
  seed: number
  questions: SessionQuestion[]
}

/** Tạo phiên luyện tập: với mỗi mục, chọn ngẫu nhiên 1 dạng hợp lệ rồi sinh câu hỏi. */
export function buildSession(config: SessionConfig): Session {
  const rng = createRng(config.seed)

  const candidates: { item: QuizItem; questionType: QuestionType<unknown> }[] =
    []
  for (const item of config.items) {
    for (const questionType of config.questionTypes) {
      if (questionType.isEligible(item, { pool: config.items })) {
        candidates.push({ item, questionType })
      }
    }
  }

  const picked = pickRandom(candidates, config.questionCount, rng)
  const questions = picked.map(({ item, questionType }) => ({
    item,
    questionType,
    question: questionType.generate(item, config.items, rng),
  }))

  return { seed: config.seed, questions }
}
