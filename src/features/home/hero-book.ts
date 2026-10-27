import {
  findBookMeta,
  findLevelIdForBook,
  loadBookIndex,
  loadManifest,
} from '@/data/content-loader'
import { loadContinueLesson } from '@/features/home/continue-lesson'
import { vi } from '@/i18n/vi'
import type { BookLessonSummary } from '@/domain/types'

export type NumberedLesson = BookLessonSummary & { lesson: number }

export interface HeroBook {
  levelId: string
  bookId: string
  bookTitle: string
  lessonLabel: string
  /** Chỉ bài có số thứ tự (bỏ phụ lục) — dùng vẽ dải ga ở hero. */
  numberedLessons: NumberedLesson[]
  firstLesson: NumberedLesson | null
  /** Bài đang học — từ tiến độ đã lưu, hoặc bài đầu nếu chưa có. */
  currentLessonNumber: number | null
}

/**
 * Giáo trình hiển thị ở hero trang chủ: ưu tiên giáo trình đang có tiến độ gần nhất
 * (`loadContinueLesson`); nếu chưa có, lấy giáo trình đầu tiên (type: 'textbook') của
 * cấp độ xếp đầu trong manifest — không hard-code tên cấp độ/giáo trình (quy tắc #1).
 */
export async function loadHeroBook(): Promise<HeroBook | null> {
  const [manifest, continueLesson] = await Promise.all([
    loadManifest(),
    loadContinueLesson(),
  ])

  let bookId = continueLesson?.bookId
  let levelId = bookId ? findLevelIdForBook(manifest, bookId) : undefined

  if (!bookId || !levelId) {
    const level = [...manifest.levels].sort((a, b) => b.order - a.order)[0]
    const book = level?.books.find((b) => b.type === 'textbook')
    if (!level || !book) return null
    levelId = level.id
    bookId = book.id
  }

  const bookMeta = findBookMeta(manifest, bookId)
  if (!bookMeta) return null

  const bookIndex = await loadBookIndex(bookId)
  const numberedLessons = bookIndex.lessons.filter(
    (l): l is NumberedLesson => typeof l.lesson === 'number',
  )
  const firstLesson = numberedLessons[0] ?? null

  return {
    levelId,
    bookId,
    bookTitle: bookMeta.title,
    lessonLabel: bookMeta.lessonLabel || vi.book.lessonLabelFallback,
    numberedLessons,
    firstLesson,
    currentLessonNumber:
      continueLesson?.bookId === bookId
        ? continueLesson.lesson
        : (firstLesson?.lesson ?? null),
  }
}

export interface StationDot {
  ellipsis?: false
  code: string
  lessonNumber: number
  current: boolean
}

export type StationRailItem = StationDot | { ellipsis: true }

const pad2 = (n: number) => String(n).padStart(2, '0')

const toDot = (
  lesson: NumberedLesson,
  currentLessonNumber: number | null,
): StationDot => ({
  code: `L${pad2(lesson.lesson)}`,
  lessonNumber: lesson.lesson,
  current: lesson.lesson === currentLessonNumber,
})

/** Dải ga rút gọn cho hero: ≤8 bài hiện hết; nhiều hơn thì hiện 7 bài đầu + … + bài cuối. */
export function buildStationRail(
  numberedLessons: NumberedLesson[],
  currentLessonNumber: number | null,
): StationRailItem[] {
  if (numberedLessons.length <= 8) {
    return numberedLessons.map((l) => toDot(l, currentLessonNumber))
  }
  const head = numberedLessons
    .slice(0, 7)
    .map((l) => toDot(l, currentLessonNumber))
  const last = numberedLessons[numberedLessons.length - 1]
  return [...head, { ellipsis: true }, toDot(last, currentLessonNumber)]
}
