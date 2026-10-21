import { loadBookIndex, loadKanjiChapter } from '@/data/content-loader'
import type { KanjiItem } from '@/domain/types'

const allKanjiCache = new Map<string, Promise<KanjiItem[]>>()

/** Tải toàn bộ Kanji của một giáo trình Kanji (mọi chương + phụ lục), gộp lại một lần. */
export function loadAllKanjiForBook(bookId: string): Promise<KanjiItem[]> {
  const hit = allKanjiCache.get(bookId)
  if (hit) return hit

  const promise = (async () => {
    const index = await loadBookIndex(bookId)
    const chapters = await Promise.all(
      index.lessons.map((l) => loadKanjiChapter(bookId, l.lesson)),
    )
    return chapters.flatMap((c) => c.kanji)
  })()

  allKanjiCache.set(bookId, promise)
  promise.catch(() => allKanjiCache.delete(bookId))
  return promise
}

/** Chỉ dùng trong test: xoá cache giữa các ca kiểm thử. */
export function clearKanjiLookupCache(): void {
  allKanjiCache.clear()
}
