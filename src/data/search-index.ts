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

/** Kana, Kanji (và kana nửa chiều rộng): một ký tự đã là một từ, không có khoảng trắng giữa các từ. */
const CJK_CHAR = /[぀-ヿ㐀-鿿ｦ-ﾟ]/u
const SINGLE_ASCII_CHAR = /^[!-~]$/

/** Khớp tiền tố: từ từ 2 ký tự (CJK: từ 1 ký tự, vì một chữ Hán đã là một từ). */
const PREFIX_MIN_LENGTH = 2
/** Khớp gần đúng (sai ký tự): chỉ từ ≥ 5 ký tự không phải CJK, mức sai 0,15 độ dài từ. */
const FUZZY_MIN_LENGTH = 5
const FUZZY_RATIO = 0.15
/** Bỏ kết quả có điểm dưới tỉ lệ này so với kết quả đầu (điểm chốt bằng bộ truy vấn mẫu, SC-005). */
const MIN_RELATIVE_SCORE = 0.3

const isCjk = (term: string): boolean => CJK_CHAR.test(term)

/**
 * Tìm theo kana / kanji / romaji / nghĩa; bỏ dấu tiếng Việt khi so khớp.
 * Mọi từ trong truy vấn phải khớp (AND); kết quả kana/kanji/romaji được ưu tiên hơn nghĩa.
 * Hợp đồng: specs/002-data-and-logic-fixes/contracts/search.md
 */
export async function searchVocab(
  query: string,
  limit = 30,
): Promise<VocabSearchResult[]> {
  const trimmed = query.trim()
  if (!trimmed) return []
  // Một ký tự ASCII (vd "a") khớp quá nhiều từ vô nghĩa
  if (SINGLE_ASCII_CHAR.test(trimmed)) return []

  const mini = await getVocabSearchIndex()
  const hits = mini.search(trimmed, {
    combineWith: 'AND',
    boost: { kana: 3, kanji: 3, romaji: 2, meaning: 1 },
    prefix: (term) => isCjk(term) || term.length >= PREFIX_MIN_LENGTH,
    fuzzy: (term) =>
      !isCjk(term) && term.length >= FUZZY_MIN_LENGTH ? FUZZY_RATIO : false,
  })

  const top = hits[0]?.score ?? 0
  return hits
    .filter((hit) => hit.score >= top * MIN_RELATIVE_SCORE)
    .slice(0, limit)
    .map((hit) => ({
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
