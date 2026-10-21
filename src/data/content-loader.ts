import {
  bookIndexFileSchema,
  kanjiChapterFileSchema,
  lessonFileSchema,
  manifestSchema,
} from '@/domain/schemas'
import type {
  BookIndexFile,
  KanjiChapterFile,
  LessonFile,
  Manifest,
  ManifestBook,
  VocabItem,
} from '@/domain/types'

const BASE = '/content'

const pad2 = (n: number) => String(n).padStart(2, '0')

const cache = new Map<string, Promise<unknown>>()

function cached<T>(key: string, load: () => Promise<T>): Promise<T> {
  const hit = cache.get(key)
  if (hit) return hit as Promise<T>
  const promise = load()
  cache.set(key, promise)
  promise.catch(() => cache.delete(key))
  return promise
}

async function fetchJson<T>(
  path: string,
  schema: { parse: (value: unknown) => T },
): Promise<T> {
  const res = await fetch(path)
  if (!res.ok) {
    throw new Error(`Không tải được "${path}" (HTTP ${res.status})`)
  }
  const data: unknown = await res.json()
  return import.meta.env.DEV ? schema.parse(data) : (data as T)
}

export function loadManifest(): Promise<Manifest> {
  return cached('manifest', () =>
    fetchJson(`${BASE}/manifest.json`, manifestSchema),
  )
}

export function loadBookIndex(bookId: string): Promise<BookIndexFile> {
  return cached(`book-index:${bookId}`, () =>
    fetchJson(`${BASE}/${bookId}/index.json`, bookIndexFileSchema),
  )
}

export function loadLesson(
  bookId: string,
  lesson: number,
): Promise<LessonFile> {
  return cached(`lesson:${bookId}:${lesson}`, () =>
    fetchJson(`${BASE}/${bookId}/l${pad2(lesson)}.json`, lessonFileSchema),
  )
}

export function loadKanjiChapter(
  bookId: string,
  chapter: number | 'appendix',
): Promise<KanjiChapterFile> {
  const fileName =
    chapter === 'appendix' ? 'appendix.json' : `ch${pad2(chapter)}.json`
  return cached(`kanji-chapter:${bookId}:${chapter}`, () =>
    fetchJson(`${BASE}/${bookId}/${fileName}`, kanjiChapterFileSchema),
  )
}

/** Tìm giáo trình Kanji (`type: 'kanji'`) cùng cấp độ với `bookId` đã cho, nếu có. */
export function findKanjiBookIdForLevel(
  manifest: Manifest,
  levelId: string,
): string | undefined {
  const level = manifest.levels.find((l) => l.id === levelId)
  return level?.books.find((b) => b.type === 'kanji')?.id
}

/** Tìm cấp độ (`levelId`) chứa `bookId` đã cho. */
export function findLevelIdForBook(
  manifest: Manifest,
  bookId: string,
): string | undefined {
  return manifest.levels.find((l) => l.books.some((b) => b.id === bookId))?.id
}

/** Tìm khai báo giáo trình (`type: 'textbook' | 'kanji'`...) ứng với `bookId`. */
export function findBookMeta(
  manifest: Manifest,
  bookId: string,
): ManifestBook | undefined {
  return manifest.levels.flatMap((l) => l.books).find((b) => b.id === bookId)
}

const VOCAB_ID_PATTERN = /^(.+)-l(\d+)-/

/** Tải và gộp các bài có chứa `vocabIds`, trả về đúng thứ tự `vocabIds` (bỏ qua ID không tìm thấy). */
export async function resolveVocabItems(
  vocabIds: string[],
): Promise<VocabItem[]> {
  const lessonsNeeded = new Map<string, { bookId: string; lesson: number }>()
  for (const id of vocabIds) {
    const match = VOCAB_ID_PATTERN.exec(id)
    if (!match) continue
    const key = `${match[1]}:${match[2]}`
    lessonsNeeded.set(key, { bookId: match[1], lesson: Number(match[2]) })
  }

  const lessonFiles = await Promise.all(
    [...lessonsNeeded.values()].map(({ bookId, lesson }) =>
      loadLesson(bookId, lesson),
    ),
  )

  const byId = new Map<string, VocabItem>()
  for (const file of lessonFiles) {
    for (const item of file.vocab) byId.set(item.id, item)
  }

  return vocabIds
    .map((id) => byId.get(id))
    .filter((item): item is VocabItem => item !== undefined)
}

/** Chỉ dùng trong test: xoá cache giữa các ca kiểm thử. */
export function clearContentLoaderCache(): void {
  cache.clear()
}
