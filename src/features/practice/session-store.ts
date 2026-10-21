import { create } from 'zustand'

export interface PendingSessionConfig {
  bookId: string
  lesson: number
  questionTypeId: string
  questionCount: number
  includeExtended: boolean
}

interface PracticeSessionStore {
  pendingConfig: PendingSessionConfig | null
  setPendingConfig: (config: PendingSessionConfig) => void
  clearPendingConfig: () => void
}

/** Cầu nối trạng thái giữa trang thiết lập và trang chạy phiên luyện tập. */
export const usePracticeSessionStore = create<PracticeSessionStore>((set) => ({
  pendingConfig: null,
  setPendingConfig: (config) => set({ pendingConfig: config }),
  clearPendingConfig: () => set({ pendingConfig: null }),
}))
