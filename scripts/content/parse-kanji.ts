import type { ContentIssueCollector } from './errors.ts'
import {
  findTable,
  parseMarkdownFile,
  sectionsByHeadingDepth,
  tableToRows,
} from './markdown-utils.ts'
import type {
  RawKanjiChapter,
  RawKanjiExample,
  RawKanjiFile,
  RawKanjiRow,
} from './raw-types.ts'

const CHAPTER_HEADING = /CHƯƠNG\s+(\d+)/u
const DECLARED_COUNT = /(\d+)\s*(?:chữ|Kanji)/u
const KANJI_COLUMNS = 5
const STROKES_PATTERN = /\((\d+)\s*nét\)/u

const EXAMPLE_LABELS: { pattern: RegExp; kind: RawKanjiExample['kind'] }[] = [
  { pattern: /^•\s*Âm\s*Kun\s*:\s*/u, kind: 'kun' },
  { pattern: /^•\s*Âm\s*On\s*:\s*/u, kind: 'on' },
  { pattern: /^•\s*Đọc\s*đặc\s*biệt\s*:\s*/u, kind: 'special' },
]

/**
 * Tách ô nguồn của cột Hán Việt thành các đoạn bằng dấu `/` ở độ sâu ngoặc 0.
 * `null` khi ngoặc không cân (thiếu `)` hoặc thừa `)`).
 */
function splitTopLevelSegments(cell: string): string[] | null {
  const segments: string[] = []
  let depth = 0
  let start = 0
  for (let i = 0; i < cell.length; i++) {
    const ch = cell[i]
    if (ch === '(') depth++
    else if (ch === ')') {
      depth--
      if (depth < 0) return null
    } else if (ch === '/' && depth === 0) {
      segments.push(cell.slice(start, i))
      start = i + 1
    }
  }
  if (depth !== 0) return null
  segments.push(cell.slice(start))
  return segments
}

/**
 * Tách một đoạn "HÁN VIỆT (nghĩa)": phần trước `(` đầu tiên là Hán Việt, phần
 * trong cặp ngoặc đó (cân, có thể lồng) là nghĩa, và cặp ngoặc phải kết thúc đoạn.
 */
function splitSegment(
  segment: string,
): { hanViet: string; meaning: string } | null {
  const text = segment.trim()
  const open = text.indexOf('(')
  if (open <= 0 || !text.endsWith(')')) return null
  let depth = 0
  for (let i = open; i < text.length; i++) {
    if (text[i] === '(') depth++
    else if (text[i] === ')') {
      depth--
      // cặp ngoặc đầu đóng trước cuối đoạn → còn chữ thừa sau `)`
      if (depth === 0 && i !== text.length - 1) return null
    }
  }
  const hanViet = text.slice(0, open).trim()
  const meaning = text.slice(open + 1, -1).trim()
  if (hanViet === '' || meaning === '') return null
  return { hanViet, meaning }
}

/**
 * Tách ô "HÁN VIỆT (nghĩa)" (một hoặc nhiều đoạn ngăn bằng `/`) thành
 * `hanViet` và `meaning`, mỗi trường nối các đoạn bằng " / " cùng thứ tự.
 * `null` khi sai quy cách: không đoán, không trả giá trị cắt sai.
 * Hợp đồng: specs/002-data-and-logic-fixes/contracts/hanviet-cell.md
 */
export function splitHanVietMeaning(
  cell: string,
): { hanViet: string; meaning: string } | null {
  const trimmed = cell.trim()
  if (trimmed === '') return null
  const segments = splitTopLevelSegments(trimmed)
  if (!segments) return null

  const hanViets: string[] = []
  const meanings: string[] = []
  for (const segment of segments) {
    const part = splitSegment(segment)
    if (!part) return null
    hanViets.push(part.hanViet)
    meanings.push(part.meaning)
  }
  return { hanViet: hanViets.join(' / '), meaning: meanings.join(' / ') }
}

function splitReadings(value: string): string[] {
  const trimmed = value.trim()
  if (trimmed === '' || trimmed === '-') return []
  return trimmed.split(',').map((s) => s.trim())
}

function parseExamples(
  cellValue: string,
  filePath: string,
  line: number,
  issues: ContentIssueCollector,
): RawKanjiExample[] {
  const examples: RawKanjiExample[] = []
  const groups = cellValue
    .split('\n')
    .map((g) => g.trim())
    .filter(Boolean)

  for (const group of groups) {
    const label = EXAMPLE_LABELS.find(({ pattern }) => pattern.test(group))
    if (!label) {
      issues.warning(
        filePath,
        `Nhóm ví dụ Kanji không rõ nhãn: "${group.slice(0, 20)}..."`,
        line,
      )
      continue
    }
    const rest = group.replace(label.pattern, '')
    for (const entry of rest
      .split('/')
      .map((e) => e.trim())
      .filter(Boolean)) {
      const match = /^(.+?)\s*\(([^)]+)\)\s*:\s*(.+)$/u.exec(entry)
      if (!match) {
        issues.warning(
          filePath,
          `Ví dụ Kanji không đúng dạng "Từ (đọc): nghĩa": "${entry}"`,
          line,
        )
        continue
      }
      const [, word, reading, meaning] = match
      examples.push({
        kind: label.kind,
        word: (word ?? '').trim(),
        reading: (reading ?? '').trim(),
        meaning: (meaning ?? '').trim(),
      })
    }
  }

  return examples
}

export function parseKanjiFile(
  filePath: string,
  bookId: string,
  issues: ContentIssueCollector,
): RawKanjiFile {
  const { tree } = parseMarkdownFile(filePath)
  const chapterSections = sectionsByHeadingDepth(tree.children, 2)

  const chapters: RawKanjiChapter[] = []
  const rows: RawKanjiRow[] = []

  for (const section of chapterSections) {
    const isAppendix = section.title.includes('PHỤ LỤC')
    const chapterMatch = CHAPTER_HEADING.exec(section.title)
    if (!isAppendix && !chapterMatch) continue // phần giới thiệu đầu file

    const chapter: number | 'appendix' = isAppendix
      ? 'appendix'
      : Number(chapterMatch![1])
    const declaredMatch = DECLARED_COUNT.exec(section.title)
    const declaredCount = declaredMatch ? Number(declaredMatch[1]) : undefined
    chapters.push({
      chapter,
      title: section.title,
      declaredCount,
      line: section.line,
    })

    const table = findTable(section.body)
    if (!table) {
      issues.error(
        filePath,
        `"${section.title}" không có bảng Kanji.`,
        section.line,
      )
      continue
    }

    const { header, rows: tableRows } = tableToRows(table)
    if (header.length !== KANJI_COLUMNS) {
      issues.error(
        filePath,
        `Bảng Kanji "${section.title}" phải có đúng ${KANJI_COLUMNS} cột, hiện có ${header.length}.`,
        section.line,
      )
    }

    for (const row of tableRows) {
      const line = row.line
      if (row.cells.length !== KANJI_COLUMNS) {
        issues.error(
          filePath,
          `Dòng Kanji thiếu cột (có ${row.cells.length}/${KANJI_COLUMNS} cột).`,
          line,
        )
        continue
      }
      const [charCell, kunCell, onCell, meaningCell, exampleCell] =
        row.cells as [string, string, string, string, string]

      const [charLine, strokesLine] = charCell.split('\n').map((s) => s.trim())
      const char = charLine ?? ''
      const strokesMatch = strokesLine
        ? STROKES_PATTERN.exec(strokesLine)
        : null
      const strokes = strokesMatch ? Number(strokesMatch[1]) : NaN

      if (!char) {
        issues.error(filePath, 'Thiếu chữ Kanji.', line)
        continue
      }
      if (Number.isNaN(strokes)) {
        issues.error(
          filePath,
          `Kanji "${char}" thiếu số nét (dạng "(n nét)").`,
          line,
        )
      }

      const split = splitHanVietMeaning(meaningCell)
      if (!split) {
        issues.error(
          filePath,
          `Kanji "${char}" thiếu "NGHĨA HÁN VIỆT (nghĩa)".`,
          line,
        )
      }
      const hanViet = split ? split.hanViet : meaningCell.trim()
      const meaning = split ? split.meaning : ''

      const examples = parseExamples(exampleCell, filePath, line, issues)

      rows.push({
        chapter,
        char,
        strokes,
        kun: splitReadings(kunCell),
        on: splitReadings(onCell),
        hanViet,
        meaning,
        examples,
        line,
      })
    }

    if (declaredCount !== undefined && tableRows.length !== declaredCount) {
      issues.warning(
        filePath,
        `"${section.title}" khai báo ${declaredCount} chữ nhưng bảng có ${tableRows.length} chữ.`,
        section.line,
      )
    }
  }

  if (chapters.length === 0) {
    issues.error(
      filePath,
      'Không tìm thấy chương Kanji nào (tiêu đề phải chứa "CHƯƠNG <số>").',
      1,
    )
  }

  return { bookId, chapters, rows }
}
