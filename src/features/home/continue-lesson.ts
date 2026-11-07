import { findBookMeta, loadManifest } from '@/data/content-loader'
import { progressRepository } from '@/data/progress/dexie-repo'
import { parseVocabItemId } from '@/domain/quiz/item-id'
import { vi } from '@/i18n/vi'
import type { Mastery } from '@/domain/types'

export interface ContinueLesson {
  bookId: string
  lesson: number
  lessonLabel: string
}

/**
 * Mastery mới nhất (lastTs lớn nhất) có itemId đọc được bookId/lesson qua `parseVocabItemId`.
 * Bỏ qua mastery của grammar/kanji vì chưa có cách đọc bookId/lesson cho các loại đó (xem docs/reference/BACKLOG.md).
 */
export function findLatestVocabMastery(list: Mastery[]): Mastery | null {
  let latest: Mastery | null = null
  for (const m of list) {
    if (!parseVocabItemId(m.itemId)) continue
    if (!latest || m.lastTs > latest.lastTs) latest = m
  }
  return latest
}

/** Bài học gần nhất người dùng có tiến độ — dùng cho nút chính ở hero trang chủ. `null` nếu chưa có. */
export async function loadContinueLesson(): Promise<ContinueLesson | null> {
  const all = await progressRepository.listAllMastery()
  const latest = findLatestVocabMastery(all)
  if (!latest) return null

  const parsed = parseVocabItemId(latest.itemId)
  if (!parsed) return null

  const manifest = await loadManifest()
  const bookMeta = findBookMeta(manifest, parsed.bookId)

  return {
    bookId: parsed.bookId,
    lesson: parsed.lesson,
    lessonLabel: bookMeta?.lessonLabel || vi.book.lessonLabelFallback,
  }
}
