import MiniSearch from 'minisearch'
import { loadBookIndex, loadLesson, loadManifest } from '@/data/content-loader'
import { stripDiacritics } from '@/lib/normalize'
import type { Manifest, VocabItem } from '@/domain/types'

export interface VocabSearchDoc {
  id: string
  bookId: string
  lesson: number
  kana: string
  kanji: string
  romaji: string
  meaning: string
}

export interface VocabSearchResult {
  id: string
  bookId: string
  lesson: number
  kana: string
  kanji: string | null
  romaji: string
  meaning: string
  score: number
}

async function collectAllVocab(manifest: Manifest): Promise<VocabItem[]> {
  const textbooks = manifest.levels
    .flatMap((l) => l.books)
    .filter((b) => b.type === 'textbook')

  const items: VocabItem[] = []
  for (const book of textbooks) {
    const index = await loadBookIndex(book.id)
    const lessonNumbers = index.lessons
      .map((l) => l.lesson)
      .filter((lesson): lesson is number => typeof lesson === 'number')
    const lessons = await Promise.all(
      lessonNumbers.map((lesson) => loadLesson(book.id, lesson)),
    )
    for (const lesson of lessons) items.push(...lesson.vocab)
  }
  return items
}

function buildIndex(items: VocabItem[]): MiniSearch<VocabSearchDoc> {
  const mini = new MiniSearch<VocabSearchDoc>({
    fields: ['kana', 'kanji', 'romaji', 'meaning'],
    storeFields: ['bookId', 'lesson', 'kana', 'kanji', 'romaji', 'meaning'],
    processTerm: (term) => stripDiacritics(term),
  })
  mini.addAll(
    items.map((item): VocabSearchDoc => ({
      id: item.id,
      bookId: item.bookId,
      lesson: item.lesson,
      kana: item.kana,
      kanji: item.kanji ?? '',
      romaji: item.romaji,
      meaning: item.meaning,
    })),
  )
  return mini
}

let indexPromise: Promise<MiniSearch<VocabSearchDoc>> | null = null

/** Tải toàn bộ từ vựng (mọi giáo trình dạng textbook) và dựng chỉ mục tìm kiếm; chỉ làm một lần. */
export function getVocabSearchIndex(): Promise<MiniSearch<VocabSearchDoc>> {
  if (!indexPromise) {
    indexPromise = (async () => {
      const manifest = await loadManifest()
      const items = await collectAllVocab(manifest)
      return buildIndex(items)
    })()
    indexPromise.catch(() => {
      indexPromise = null
    })
  }
  return indexPromise
}

/** Tìm theo kana / kanji / romaji / nghĩa; bỏ dấu tiếng Việt khi so khớp. */
export async function searchVocab(
  query: string,
  limit = 30,
): Promise<VocabSearchResult[]> {
  const trimmed = query.trim()
  if (!trimmed) return []

  const mini = await getVocabSearchIndex()
  const hits = mini.search(trimmed, { prefix: true, fuzzy: 0.2 })

  return hits.slice(0, limit).map((hit) => ({
    id: hit.id as string,
    bookId: hit.bookId as string,
    lesson: hit.lesson as number,
    kana: hit.kana as string,
    kanji: (hit.kanji as string) || null,
    romaji: hit.romaji as string,
    meaning: hit.meaning as string,
    score: hit.score,
  }))
}

/** Chỉ dùng trong test: xoá chỉ mục đã dựng. */
export function clearVocabSearchIndexCache(): void {
  indexPromise = null
}
