import { create } from 'zustand'
import type { QuestionType, QuizItem } from '@/domain/quiz/registry'

export interface PendingSessionConfig {
  bookId: string
  lesson: number
  questionTypeIds: string[]
  questionCount: number
  includeExtended: boolean
  /** Nếu có: chỉ luyện đúng những mục này (dùng cho "Làm lại câu sai"). */
  onlyItemIds?: string[]
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
