import type { ComponentType } from 'react'
import type { GrammarPoint, KanjiItem, Skill, VocabItem } from '@/domain/types'

export type QuizItem = VocabItem | GrammarPoint | KanjiItem
export type QuizItemType = 'vocab' | 'grammar' | 'kanji'

export function isVocabItem(item: QuizItem): item is VocabItem {
  return 'kanjiChars' in item
}

export interface QuizContext {
  /** Toàn bộ mục trong phạm vi đang luyện — dùng để sinh đáp án nhiễu, v.v. */
  pool: QuizItem[]
}

export interface GradeResult {
  correct: boolean
  expected: string
  /** Mô tả dễ đọc về câu trả lời của người dùng — dùng ở màn hình kết quả. */
  given?: string
}

/**
 * Một dạng bài tập (mục 6.4). Thêm dạng mới = tạo thư mục trong
 * `src/features/practice/modes/<tên>/` rồi gọi `questionRegistry.register(...)` —
 * không sửa registry hay session runner.
 */
export interface QuestionType<Q = unknown> {
  id: string
  label: string
  itemType: QuizItemType
  skill: Skill
  isEligible(item: QuizItem, ctx: QuizContext): boolean
  generate(item: QuizItem, pool: QuizItem[], rng: () => number): Q
  grade(question: Q, answer: unknown): GradeResult
  Component: ComponentType<{ q: Q; onAnswer: (answer: unknown) => void }>
}

const registry = new Map<string, QuestionType<never>>()

/** Đăng ký một dạng bài tập; ném lỗi nếu `id` đã tồn tại (tránh ghi đè nhầm). */
export function register<Q>(questionType: QuestionType<Q>): void {
  if (registry.has(questionType.id)) {
    throw new Error(`QuestionType "${questionType.id}" đã được đăng ký.`)
  }
  registry.set(questionType.id, questionType as unknown as QuestionType<never>)
}

export function get(id: string): QuestionType<unknown> | undefined {
  return registry.get(id) as unknown as QuestionType<unknown> | undefined
}

export function list(): QuestionType<unknown>[] {
  return [...registry.values()] as unknown as QuestionType<unknown>[]
}

/** Chỉ dùng trong test: xoá toàn bộ đăng ký giữa các ca kiểm thử. */
export function clearRegistry(): void {
  registry.clear()
}

export const questionRegistry = { register, get, list, clearRegistry }
