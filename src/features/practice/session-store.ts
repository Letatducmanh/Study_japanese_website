import { create } from 'zustand'
import type { QuestionType, QuizItem } from '@/domain/quiz/registry'

/** Tỉ lệ pha trộn của Bài kiểm tra tổng hợp (mục 3.3 dạng 17); tổng không cần đúng 1, được chuẩn hóa lúc dùng. */
export interface ComprehensiveRatio {
  vocab: number
  grammar: number
  kanji: number
}

export interface PendingSessionConfig {
  bookId: string
  lesson: number
  questionTypeIds: string[]
  questionCount: number
  includeExtended: boolean
  /** Nếu có: chỉ luyện đúng những mục này (dùng cho "Làm lại câu sai", "Luyện câu yếu"). */
  onlyItemIds?: string[]
  /** Có: đây là Bài kiểm tra tổng hợp — trộn từ vựng/ngữ pháp/Kanji theo tỉ lệ, xếp loại A/B/C. */
  comprehensive?: ComprehensiveRatio
}

export interface AnsweredQuestion {
  item: QuizItem
  questionType: QuestionType<unknown>
  correct: boolean
  given: string
  expected: string
  responseMs: number
}

export interface SessionResult {
  sessionId: string
  bookId: string
  lesson: number
  startedAt: number
  finishedAt: number
  answers: AnsweredQuestion[]
  isComprehensive?: boolean
}

interface PracticeSessionStore {
  pendingConfig: PendingSessionConfig | null
  setPendingConfig: (config: PendingSessionConfig) => void
  clearPendingConfig: () => void
  lastResult: SessionResult | null
  setLastResult: (result: SessionResult) => void
}

/** Cầu nối trạng thái giữa trang thiết lập, trang chạy và trang kết quả phiên luyện tập. */
export const usePracticeSessionStore = create<PracticeSessionStore>((set) => ({
  pendingConfig: null,
  setPendingConfig: (config) => set({ pendingConfig: config }),
  clearPendingConfig: () => set({ pendingConfig: null }),
  lastResult: null,
  setLastResult: (result) => set({ lastResult: result }),
}))
