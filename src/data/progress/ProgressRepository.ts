import type {
  AppSettings,
  Attempt,
  Mastery,
  MistakeRecord,
  ProgressExport,
  Skill,
  SrsCardRecord,
} from '@/domain/types'

/**
 * Giao diện lưu trữ tiến độ — UI/engine chỉ phụ thuộc interface này, không import Dexie
 * ngoài `dexie-repo.ts` (quy tắc bất biến #5).
 */
export interface ProgressRepository {
  /** Lưu một lượt trả lời và cập nhật độ thành thạo + sổ lỗi sai liên quan. */
  recordAttempt(attempt: Attempt): Promise<void>

  getMastery(itemId: string, skill: Skill): Promise<Mastery | undefined>
  listMasteryForItem(itemId: string): Promise<Mastery[]>
  /** Các cặp (mục, kỹ năng) yếu nhất, sắp xếp từ yếu nhất; mặc định tối đa 20. */
  listWeak(limit?: number): Promise<Mastery[]>

  getSrsCard(itemId: string): Promise<SrsCardRecord | undefined>
  saveSrsCard(record: SrsCardRecord): Promise<void>
  /** Các thẻ đến hạn ôn (due ≤ `beforeTs`), sắp xếp theo hạn gần nhất trước. */
  listDueSrsCards(beforeTs: number, limit?: number): Promise<SrsCardRecord[]>

  addMistake(itemId: string): Promise<void>
  removeMistake(itemId: string): Promise<void>
  listMistakes(): Promise<MistakeRecord[]>

  getSettings(): Promise<AppSettings>
  saveSettings(patch: Partial<AppSettings>): Promise<void>

  exportAll(): Promise<ProgressExport>
  importAll(data: ProgressExport): Promise<void>
  /** Xóa toàn bộ tiến độ trên máy này (không hoàn tác được). */
  clearAll(): Promise<void>
}

export const DEFAULT_APP_SETTINGS: AppSettings = {
  showRomaji: true,
  showFurigana: true,
  includeExtended: true,
  editionFilter: 'all',
  ttsRate: 1,
  defaultQuestionCount: 20,
}
