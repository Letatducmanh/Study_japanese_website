import type { List, Paragraph, RootContent } from 'mdast'
import type { ContentIssueCollector } from './errors.ts'
import {
  inlineText,
  lineOf,
  parseMarkdownFile,
  sectionsByHeadingDepth,
  sliceSource,
} from './markdown-utils.ts'
import type {
  RawGrammarExample,
  RawGrammarFile,
  RawGrammarLesson,
  RawGrammarRow,
} from './raw-types.ts'

const LESSON_HEADING = /BÀI\s+(\d+)/u
const POINT_HEADING = /^(\d+)\.\s*(.+)$/u
const SUPPLEMENTAL_MARK = /\s*\(bổ sung\)\s*$/u

function isParagraphStartingWith(
  node: RootContent,
  label: string,
): node is Paragraph {
  return (
    node.type === 'paragraph' &&
    inlineText(node.children).trim().startsWith(label)
  )
}

export function parseGrammarFile(
  filePath: string,
  bookId: string,
  issues: ContentIssueCollector,
): RawGrammarFile {
  const { tree, source } = parseMarkdownFile(filePath)
  const lessonSections = sectionsByHeadingDepth(tree.children, 2)

  const lessons: RawGrammarLesson[] = []
  const rows: RawGrammarRow[] = []

  for (const lessonSection of lessonSections) {
    const lessonMatch = LESSON_HEADING.exec(lessonSection.title)
    if (!lessonMatch) continue

    const lesson = Number(lessonMatch[1])
    const titleAfterDash =
      lessonSection.title.split('—')[1]?.trim() ?? lessonSection.title
    lessons.push({ lesson, title: titleAfterDash, line: lessonSection.line })

    const pointSections = sectionsByHeadingDepth(lessonSection.body, 3)
    for (const point of pointSections) {
      const supplemental = point.title.includes('(bổ sung)')
      const headingMatch = POINT_HEADING.exec(point.title)
      if (!headingMatch) {
        issues.error(
          filePath,
          `Tiêu đề mẫu ngữ pháp không đúng dạng "n. Mẫu câu": "${point.title}".`,
          point.line,
        )
        continue
      }
      const order = Number(headingMatch[1])
      const title = (headingMatch[2] ?? '')
        .replace(SUPPLEMENTAL_MARK, '')
        .trim()

      const meaningNode = point.body.find((n) =>
        isParagraphStartingWith(n, 'Ý nghĩa:'),
      )
      const meaning = meaningNode
        ? inlineText(meaningNode.children)
            .replace(/^Ý nghĩa:\s*/u, '')
            .trim()
        : ''
      if (!meaning) {
        issues.error(
          filePath,
          `Bài ${lesson}, mẫu "${title}" thiếu "Ý nghĩa:".`,
          point.line,
        )
      }

      const explIndex = point.body.findIndex((n) =>
        isParagraphStartingWith(n, 'Giải thích'),
      )
      const explList = explIndex !== -1 ? point.body[explIndex + 1] : undefined
      const explanationMd =
        explList && explList.type === 'list'
          ? sliceSource(source, [explList])
          : ''
      if (!explanationMd) {
        issues.warning(
          filePath,
          `Bài ${lesson}, mẫu "${title}" thiếu "Giải thích & Cách dùng".`,
          point.line,
        )
      }

      const examplesIndex = point.body.findIndex((n) =>
        isParagraphStartingWith(n, 'Ví dụ minh họa'),
      )
      const examplesList =
        examplesIndex !== -1 ? point.body[examplesIndex + 1] : undefined
      const examples: RawGrammarExample[] = []

      if (examplesList && examplesList.type === 'list') {
        for (const item of (examplesList as List).children) {
          const itemLine = lineOf(item) ?? point.line
          const firstPara = item.children.find(
            (c): c is Paragraph => c.type === 'paragraph',
          )
          const jpText = firstPara ? inlineText(firstPara.children).trim() : ''
          const jpMatch = /^Tiếng Nhật:\s*(.+)$/u.exec(jpText)
          if (!jpMatch) {
            issues.error(
              filePath,
              `Bài ${lesson}, mẫu "${title}": ví dụ thiếu dòng "Tiếng Nhật:".`,
              itemLine,
            )
            continue
          }

          let romaji = ''
          let vi = ''
          const subList = item.children.find(
            (c): c is List => c.type === 'list',
          )
          for (const subItem of subList?.children ?? []) {
            const p = subItem.children.find(
              (c): c is Paragraph => c.type === 'paragraph',
            )
            if (!p) continue
            const text = inlineText(p.children).trim()
            if (text.startsWith('Romaji:'))
              romaji = text.replace(/^Romaji:\s*/u, '').trim()
            else if (text.startsWith('Dịch nghĩa:'))
              vi = text.replace(/^Dịch nghĩa:\s*/u, '').trim()
          }

          const jp = jpMatch[1].trim()
          if (!jp || !romaji || !vi) {
            issues.error(
              filePath,
              `Bài ${lesson}, mẫu "${title}": ví dụ phải đủ 3 dòng (Tiếng Nhật, Romaji, Dịch nghĩa).`,
              itemLine,
            )
            continue
          }
          examples.push({ jp, romaji, vi, line: itemLine })
        }
      }

      if (examples.length === 0) {
        issues.warning(
          filePath,
          `Bài ${lesson}, mẫu "${title}" không có ví dụ minh họa.`,
          point.line,
        )
      }

      rows.push({
        lesson,
        order,
        title,
        meaning,
        explanationMd,
        examples,
        supplemental,
        line: point.line,
      })
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
