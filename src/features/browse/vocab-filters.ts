import type { EditionFilter, VocabItem } from '@/domain/types'

export type SectionFilter = 'all' | 'main' | 'extended'

export interface VocabFilterState {
  section: SectionFilter
  edition: EditionFilter
}

/**
 * Bộ lọc khởi tạo khi mở trang bài để nhảy tới một từ (spec 005, research R-4).
 * Chiều nào đang che từ đích thì nới về "all"; chiều không che giữ nguyên.
 * Chỉ dùng cho lần xem này: không lưu ở đâu cả (bộ lọc vốn chỉ là state của trang).
 */
export function relaxFilters(
  item: VocabItem | undefined,
  defaults: VocabFilterState,
): VocabFilterState {
  if (!item) return defaults
  return {
    section:
      defaults.section !== 'all' && item.section !== defaults.section
        ? 'all'
        : defaults.section,
    edition:
      defaults.edition !== 'all' &&
      item.edition !== undefined &&
      item.edition !== defaults.edition
        ? 'all'
        : defaults.edition,
  }
}
