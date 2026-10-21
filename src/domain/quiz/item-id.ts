/** Phân loại `itemId` theo quy ước đặt ID (mục 6.2) để gộp dữ liệu Mastery/Mistake theo loại/bài. */

export type ItemIdKind = 'vocab' | 'grammar' | 'kanji'

const GRAMMAR_ID_PATTERN = /-l\d+-g-/
const VOCAB_LESSON_PATTERN = /^(.+)-l(\d+)-/

export function classifyItemId(id: string): ItemIdKind {
  if (id.startsWith('kanji-')) return 'kanji'
  if (GRAMMAR_ID_PATTERN.test(id)) return 'grammar'
  return 'vocab'
}

/** Tách `bookId`/`lesson` từ ID từ vựng; trả `null` nếu không phải ID từ vựng. */
export function parseVocabItemId(
  id: string,
): { bookId: string; lesson: number } | null {
  if (classifyItemId(id) !== 'vocab') return null
  const match = VOCAB_LESSON_PATTERN.exec(id)
  if (!match) return null
  return { bookId: match[1], lesson: Number(match[2]) }
}
