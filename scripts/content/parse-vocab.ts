import type { ContentIssueCollector } from './errors.ts'
import {
  findTable,
  lineOf,
  parseMarkdownFile,
  sectionsByHeadingDepth,
  tableToRows,
} from './markdown-utils.ts'
import type { RawVocabFile, RawVocabLesson, RawVocabRow } from './raw-types.ts'

const LESSON_HEADING = /BÀI\s+(\d+)/u
const VOCAB_COLUMNS = 5

function detectEdition(note: string | undefined): RawVocabRow['edition'] {
  if (!note) return undefined
  if (note.includes('Bản mới')) return 'new'
  if (note.includes('Bản cũ')) return 'old'
  return undefined
}

export function parseVocabFile(
  filePath: string,
  bookId: string,
  issues: ContentIssueCollector,
): RawVocabFile {
  const { tree } = parseMarkdownFile(filePath)
  const lessonSections = sectionsByHeadingDepth(tree.children, 2)

  const lessons: RawVocabLesson[] = []
  const rows: RawVocabRow[] = []

  for (const lessonSection of lessonSections) {
    const match = LESSON_HEADING.exec(lessonSection.title)
    if (!match) continue // mục giới thiệu, không phải tiêu đề bài

    const lesson = Number(match[1])
    const titleAfterDash =
      lessonSection.title.split('—')[1]?.trim() ?? lessonSection.title
    lessons.push({ lesson, title: titleAfterDash, line: lessonSection.line })

    const subsections = sectionsByHeadingDepth(lessonSection.body, 3)
    for (const sub of subsections) {
      const isExtended = sub.title.includes('mở rộng')
      const section: RawVocabRow['section'] = isExtended ? 'extended' : 'main'
      const sectionTitle = isExtended
        ? (sub.title.split('—')[1]?.trim() ?? undefined)
        : undefined

      const table = findTable(sub.body)
      if (!table) {
        issues.error(
          filePath,
          `Bài ${lesson}, mục "${sub.title}" không có bảng từ vựng.`,
          sub.line,
        )
        continue
      }

      const { header, rows: tableRows } = tableToRows(table)
      if (header.length !== VOCAB_COLUMNS) {
        issues.error(
          filePath,
          `Bảng từ vựng Bài ${lesson} phải có đúng ${VOCAB_COLUMNS} cột, hiện có ${header.length}.`,
          sub.line,
        )
      }

      for (const row of tableRows) {
        const line = row.line
        if (row.cells.length !== VOCAB_COLUMNS) {
          issues.error(
            filePath,
            `Dòng từ vựng thiếu cột (có ${row.cells.length}/${VOCAB_COLUMNS} cột).`,
            line,
          )
          continue
        }

        const [kanaRaw, kanjiRaw, romajiRaw, meaningRaw, noteRaw] =
          row.cells as [string, string, string, string, string]
        const kana = kanaRaw.trim()
        const kanjiTrimmed = kanjiRaw.trim()
        const kanji =
          kanjiTrimmed === '' || kanjiTrimmed === '-' ? null : kanjiTrimmed
        const romaji = romajiRaw.trim()
        const meaning = meaningRaw.trim()
        const note = noteRaw.trim() || undefined

        if (!kana) {
          issues.error(filePath, 'Thiếu cột Kana (Tiếng Nhật).', line)
        }
        if (!romaji) {
          issues.error(filePath, `Thiếu cột Romaji cho "${kana}".`, line)
        }
        if (!meaning) {
          issues.error(filePath, `Thiếu cột Nghĩa cho "${kana}".`, line)
        }
        if (!kana || !romaji || !meaning) continue

        rows.push({
          lesson,
          section,
          sectionTitle,
          kana,
          kanji,
          romaji,
          meaning,
          note,
          edition: detectEdition(note),
          line,
        })
      }
    }
  }

  if (lessons.length === 0) {
    issues.error(
      filePath,
      'Không tìm thấy bài học nào (tiêu đề phải chứa "BÀI <số>").',
      lineOf(tree) ?? 1,
    )
  }

  return { bookId, lessons, rows }
}
