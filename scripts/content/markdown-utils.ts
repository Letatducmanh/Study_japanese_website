import { readFileSync } from 'node:fs'
import remarkGfm from 'remark-gfm'
import remarkParse from 'remark-parse'
import { unified } from 'unified'
import type {
  Heading,
  Html,
  PhrasingContent,
  Root,
  RootContent,
  Table,
  TableRow,
} from 'mdast'
import { toString as mdastToString } from 'mdast-util-to-string'
import type { Node } from 'unist'

export interface ParsedMarkdown {
  filePath: string
  source: string
  tree: Root
}

export function parseMarkdownFile(filePath: string): ParsedMarkdown {
  const source = readFileSync(filePath, 'utf-8')
  const tree = unified().use(remarkParse).use(remarkGfm).parse(source) as Root
  return { filePath, source, tree }
}

export function headingText(node: Heading): string {
  return mdastToString(node).trim()
}

export function lineOf(node: Node): number | undefined {
  return node.position?.start.line
}

/**
 * Nhóm các node cùng cấp thành từng "section" bắt đầu bằng một heading ở `depth`
 * cho trước, gồm mọi node tiếp theo cho tới heading kế tiếp cùng cấp (hoặc nông hơn).
 */
export interface MarkdownSection {
  heading: Heading
  title: string
  line: number
  body: RootContent[]
}

export function sectionsByHeadingDepth(
  nodes: RootContent[],
  depth: number,
): MarkdownSection[] {
  const sections: MarkdownSection[] = []
  let current: MarkdownSection | null = null

  for (const node of nodes) {
    if (node.type === 'heading' && node.depth <= depth) {
      if (node.depth === depth) {
        current = {
          heading: node,
          title: headingText(node),
          line: lineOf(node) ?? 0,
          body: [],
        }
        sections.push(current)
        continue
      }
      // Heading nông hơn (vd depth 1 khi đang quét depth 2) kết thúc section hiện tại.
      current = null
      continue
    }
    current?.body.push(node)
  }

  return sections
}

export function findTable(nodes: RootContent[]): Table | undefined {
  return nodes.find((node): node is Table => node.type === 'table')
}

function isBreakHtml(value: string): boolean {
  return /^<br\s*\/?>$/i.test(value.trim())
}

/** Chuyển nội dung inline markdown (đoạn văn, ô bảng...) thành text thuần, giữ `<br>` thành "\n". */
export function inlineText(children: PhrasingContent[]): string {
  let out = ''
  for (const child of children) {
    switch (child.type) {
      case 'text':
        out += child.value
        break
      case 'inlineCode':
        out += child.value
        break
      case 'html':
        out += isBreakHtml((child as Html).value) ? '\n' : ''
        break
      case 'break':
        out += '\n'
        break
      case 'strong':
      case 'emphasis':
      case 'delete':
      case 'link':
        out += inlineText(child.children)
        break
      default:
        break
    }
  }
  return out
}

/** Chuyển nội dung một ô bảng (markdown inline, có thể chứa `<br>`, **bold**...) thành text thuần. */
export function cellText(row: TableRow, index: number): string {
  const cell = row.children[index]
  if (!cell) return ''
  return inlineText(cell.children).trim()
}

export interface TableRows {
  header: string[]
  rows: { cells: string[]; line: number }[]
}

export function tableToRows(table: Table): TableRows {
  const [headerRow, ...bodyRows] = table.children
  const header = headerRow
    ? headerRow.children.map((_, i) => cellText(headerRow, i))
    : []
  const rows = bodyRows.map((row) => ({
    cells: row.children.map((_, i) => cellText(row, i)),
    line: lineOf(row) ?? 0,
  }))
  return { header, rows }
}

/** Lấy nguyên văn markdown (giữ **bold**, gạch đầu dòng...) của một dải node, dùng offset trong source gốc. */
export function sliceSource(source: string, nodes: RootContent[]): string {
  if (nodes.length === 0) return ''
  const start = nodes[0]?.position?.start.offset
  const end = nodes[nodes.length - 1]?.position?.end.offset
  if (start === undefined || end === undefined) return ''
  return source.slice(start, end).trim()
}
