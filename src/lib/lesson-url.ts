/**
 * Địa chỉ trang bài kèm đích nhảy (spec 005, contracts/lesson-jump-url.md):
 *   /b/<bookId>/<lesson>?tab=<tab>&word=<wordId>
 * Hàm thuần, không phụ thuộc React hay lớp nào khác; `SearchPage` dựng, `LessonPage` đọc.
 */

export type LessonTab = 'vocab' | 'grammar' | 'kanji'

const TABS: readonly LessonTab[] = ['vocab', 'grammar', 'kanji']

const isLessonTab = (value: string | null): value is LessonTab =>
  value !== null && (TABS as readonly string[]).includes(value)

export interface LessonUrlArgs {
  bookId: string
  lesson: number | string
  tab?: LessonTab
  /** ID từ vựng nguyên văn; rỗng hoặc vắng thì không nhảy tới từ nào. */
  wordId?: string
}

export function lessonUrl({
  bookId,
  lesson,
  tab,
  wordId,
}: LessonUrlArgs): string {
  const base = `/b/${bookId}/${lesson}`
  const params = new URLSearchParams()
  // Có từ mà vắng tab thì mặc định tab Từ vựng; thứ tự tham số: tab rồi word.
  const effectiveTab = tab ?? (wordId ? 'vocab' : undefined)
  if (effectiveTab) params.set('tab', effectiveTab)
  if (wordId) params.set('word', wordId)
  const query = params.toString()
  return query ? `${base}?${query}` : base
}

export interface LessonJump {
  tab?: LessonTab
  wordId?: string
}

export function parseLessonJump(params: URLSearchParams): LessonJump {
  const wordId = params.get('word') || undefined
  const rawTab = params.get('tab')
  const tab = isLessonTab(rawTab) ? rawTab : wordId ? 'vocab' : undefined
  return {
    ...(tab ? { tab } : {}),
    ...(wordId ? { wordId } : {}),
  }
}
