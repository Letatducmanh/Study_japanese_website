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

/** Chỉ dùng trong test: xoá cache giữa các ca kiểm thử. */
export function clearContentLoaderCache(): void {
  cache.clear()
}
