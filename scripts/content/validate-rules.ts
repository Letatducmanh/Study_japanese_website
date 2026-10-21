import type { ContentIssueCollector } from './errors.ts'
import type { RawKanjiFile, RawVocabFile } from './raw-types.ts'

const KANJI_CHAR = /[一-鿿]/gu

export function validateVocab(
  filePath: string,
  raw: RawVocabFile,
  issues: ContentIssueCollector,
): void {
  const byLesson = new Map<number, Map<string, number[]>>()

  for (const row of raw.rows) {
    if (KANJI_CHAR.test(row.kana)) {
      issues.warning(
        filePath,
        `Bài ${row.lesson}: cột Kana "${row.kana}" có vẻ chứa ký tự Hán.`,
        row.line,
      )
    }
    KANJI_CHAR.lastIndex = 0

    let seen = byLesson.get(row.lesson)
    if (!seen) {
      seen = new Map()
      byLesson.set(row.lesson, seen)
    }
    const key = `${row.kana}|${row.kanji ?? ''}`
    const lines = seen.get(key) ?? []
    lines.push(row.line)
    seen.set(key, lines)
  }

  for (const [lesson, seen] of byLesson) {
    for (const [key, lines] of seen) {
      if (lines.length > 1) {
        const [kana] = key.split('|')
        issues.error(
          filePath,
          `Bài ${lesson}: từ "${kana}" bị lặp lại ${lines.length} lần (dòng ${lines.join(', ')}).`,
          lines[0],
        )
      }
    }
  }
}

export function validateGrammar(
  filePath: string,
  raw: { rows: { lesson: number; order: number; line: number }[] },
  issues: ContentIssueCollector,
): void {
  const byLesson = new Map<number, Map<number, number[]>>()
  for (const row of raw.rows) {
    let seen = byLesson.get(row.lesson)
    if (!seen) {
      seen = new Map()
      byLesson.set(row.lesson, seen)
    }
    const lines = seen.get(row.order) ?? []
    lines.push(row.line)
    seen.set(row.order, lines)
  }
  for (const [lesson, seen] of byLesson) {
    for (const [order, lines] of seen) {
      if (lines.length > 1) {
        issues.error(
          filePath,
          `Bài ${lesson}: số thứ tự mẫu ngữ pháp ${order} bị lặp lại.`,
          lines[0],
        )
      }
    }
  }
}

export function validateKanji(
  filePath: string,
  raw: RawKanjiFile,
  issues: ContentIssueCollector,
): void {
  const seen = new Map<string, number[]>()
  for (const row of raw.rows) {
    const lines = seen.get(row.char) ?? []
    lines.push(row.line)
    seen.set(row.char, lines)
  }
  for (const [char, lines] of seen) {
    if (lines.length > 1) {
      issues.error(
        filePath,
        `Kanji "${char}" xuất hiện ${lines.length} lần (dòng ${lines.join(', ')}).`,
        lines[0],
      )
    }
  }
}

/** Cảnh báo Kanji xuất hiện trong từ vựng nhưng không có trong giáo trình Kanji N5. */
export function validateKanjiCoverage(
  vocabFilePath: string,
  vocab: RawVocabFile,
  kanji: RawKanjiFile,
  issues: ContentIssueCollector,
): void {
  const known = new Set(kanji.rows.map((row) => row.char))
  const reported = new Set<string>()

  for (const row of vocab.rows) {
    if (!row.kanji) continue
    for (const char of row.kanji.matchAll(KANJI_CHAR)) {
      const value = char[0]
      if (!known.has(value) && !reported.has(value)) {
        reported.add(value)
        issues.warning(
          vocabFilePath,
          `Kanji "${value}" (trong từ "${row.kanji}", Bài ${row.lesson}) không có trong Kanji Master N5.`,
          row.line,
        )
      }
    }
  }
}
