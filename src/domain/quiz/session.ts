import { createRng, pickRandom, shuffle } from '@/lib/rng'
import { list as listQuestionTypes } from '@/domain/quiz/registry'
import type { QuestionType, QuizItem } from '@/domain/quiz/registry'

export interface SessionConfig {
  /** Mục đã được lọc sẵn theo phạm vi (1 bài / nhiều bài / điểm yếu / đến hạn ôn...). */
  items: QuizItem[]
  /** Các dạng bài tập được phép dùng trong phiên này. */
  questionTypes: QuestionType<unknown>[]
  questionCount: number
  seed: number
  /**
   * Mục dùng làm "bối cảnh" cho `isEligible`/`generate` (đáp án nhiễu, câu ví dụ liên quan...).
   * Mặc định bằng `items` — chỉ khác khi cần trộn nhiều loại mục (VD: bài kiểm tra tổng hợp
   * lấy mục dẫn từ 1 loại nhưng vẫn cần cả 3 loại trong bối cảnh).
   */
  ctxPool?: QuizItem[]
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
  const pool = config.ctxPool ?? config.items

  const candidates: { item: QuizItem; questionType: QuestionType<unknown> }[] =
    []
  for (const item of config.items) {
    for (const questionType of config.questionTypes) {
      if (questionType.isEligible(item, { pool })) {
        candidates.push({ item, questionType })
      }
    }
  }

  const picked = pickRandom(candidates, config.questionCount, rng)
  const questions = picked.map(({ item, questionType }) => ({
    item,
    questionType,
    question: questionType.generate(item, pool, rng),
  }))

  return { seed: config.seed, questions }
}

export interface ComprehensiveSessionConfig {
  vocabItems: QuizItem[]
  grammarItems: QuizItem[]
  kanjiItems: QuizItem[]
  /** Tỉ lệ số câu mỗi loại (mục 3.3 dạng 17); không cần tổng = 1, được chuẩn hóa ở đây. */
  ratio: { vocab: number; grammar: number; kanji: number }
  questionCount: number
  seed: number
}

/**
 * Bài kiểm tra tổng hợp: trộn câu hỏi từ vựng/ngữ pháp/Kanji theo tỉ lệ cho trước, dùng
 * toàn bộ ba loại mục làm bối cảnh chung (đáp án nhiễu, câu ví dụ liên quan...).
 */
export function buildComprehensiveSession(
  config: ComprehensiveSessionConfig,
): Session {
  const ctxPool = [
    ...config.vocabItems,
    ...config.grammarItems,
    ...config.kanjiItems,
  ]
  const totalRatio =
    config.ratio.vocab + config.ratio.grammar + config.ratio.kanji || 1
  const vocabCount = Math.round(
    (config.questionCount * config.ratio.vocab) / totalRatio,
  )
  const grammarCount = Math.round(
    (config.questionCount * config.ratio.grammar) / totalRatio,
  )
  const kanjiCount = Math.max(0, config.questionCount - vocabCount - grammarCount)

  const allTypes = listQuestionTypes()
  const vocabSession = buildSession({
    items: config.vocabItems,
    ctxPool,
    questionTypes: allTypes.filter((qt) => qt.itemType === 'vocab'),
    questionCount: vocabCount,
    seed: config.seed,
  })
  const grammarSession = buildSession({
    items: config.grammarItems,
    ctxPool,
    questionTypes: allTypes.filter((qt) => qt.itemType === 'grammar'),
    questionCount: grammarCount,
    seed: config.seed + 1,
  })
  const kanjiSession = buildSession({
    items: config.kanjiItems,
    ctxPool,
    questionTypes: allTypes.filter((qt) => qt.itemType === 'kanji'),
    questionCount: kanjiCount,
    seed: config.seed + 2,
  })

  const rng = createRng(config.seed + 3)
  const questions = shuffle(
    [
      ...vocabSession.questions,
      ...grammarSession.questions,
      ...kanjiSession.questions,
    ],
    rng,
  )
  return { seed: config.seed, questions }
}
