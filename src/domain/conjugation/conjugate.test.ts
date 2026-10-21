import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  findTable,
  parseMarkdownFile,
  sectionsByHeadingDepth,
  tableToRows,
} from '../../../scripts/content/markdown-utils.ts'
import type { VerbGroup } from '../types.ts'
import {
  cleanMasuForm,
  toDictionary,
  toMasuStem,
  toNai,
  toTa,
  toTe,
} from './conjugate.ts'

const GRAMMAR_PATH = join(process.cwd(), 'content/n5/mnn1/grammar.md')
const GROUP_LABEL: Record<string, VerbGroup> = { I: 1, II: 2, III: 3 }

interface AppendixRow {
  group: VerbGroup
  masu: string
  te: string
  ta: string
  nai: string
  dictionary: string
}

function loadAppendixTable(): AppendixRow[] {
  const { tree } = parseMarkdownFile(GRAMMAR_PATH)
  const sections = sectionsByHeadingDepth(tree.children, 2)
  const section = sections.find((s) => s.title.includes('PHỤ LỤC'))
  if (!section) throw new Error('Không tìm thấy mục PHỤ LỤC trong grammar.md')

  const table = findTable(section.body)
  if (!table) throw new Error('Mục PHỤ LỤC không có bảng động từ')

  const { rows } = tableToRows(table)
  return rows.map(({ cells }) => {
    const [groupLabel, masu, te, ta, nai, dictionary] = cells as [
      string,
      string,
      string,
      string,
      string,
      string,
    ]
    const group = GROUP_LABEL[groupLabel]
    if (!group) throw new Error(`Nhóm động từ không nhận ra: "${groupLabel}"`)
    return { group, masu, te, ta, nai, dictionary }
  })
}

describe('engine chia động từ — đối chiếu bảng PHỤ LỤC grammar.md', () => {
  const appendix = loadAppendixTable()

  it('đọc được đủ 16 dòng trong bảng phụ lục', () => {
    expect(appendix.length).toBe(16)
  })

  it.each(appendix)(
    '$masu (nhóm $group) chia đúng て/た/ない/từ điển',
    (row) => {
      expect(toTe(row.masu, row.group)).toBe(row.te)
      expect(toTa(row.masu, row.group)).toBe(row.ta)
      expect(toNai(row.masu, row.group)).toBe(row.nai)
      expect(toDictionary(row.masu, row.group)).toBe(row.dictionary)
    },
  )
})

describe('engine chia động từ — trường hợp đặc biệt', () => {
  it('bỏ phần [ ] trước khi chia (vd "すいます [たばこを～]")', () => {
    expect(cleanMasuForm('すいます [たばこを～]')).toBe('すいます')
    expect(toTe('すいます [たばこを～]', 1)).toBe('すって')
  })

  it('danh từ + します chia như động từ する (vd べんきょうします)', () => {
    expect(toTe('べんきょうします', 3)).toBe('べんきょうして')
    expect(toTa('べんきょうします', 3)).toBe('べんきょうした')
    expect(toNai('べんきょうします', 3)).toBe('べんきょうしない')
    expect(toDictionary('べんきょうします', 3)).toBe('べんきょうする')
  })

  it('toMasuStem bỏ đúng đuôi ます cho cả 3 nhóm', () => {
    expect(toMasuStem('いきます')).toBe('いき')
    expect(toMasuStem('たべます')).toBe('たべ')
    expect(toMasuStem('します')).toBe('し')
  })
})
