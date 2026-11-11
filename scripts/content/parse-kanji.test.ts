import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { ContentIssueCollector } from './errors.ts'
import {
  findTable,
  parseMarkdownFile,
  sectionsByHeadingDepth,
  tableToRows,
} from './markdown-utils.ts'
import { parseKanjiFile, splitHanVietMeaning } from './parse-kanji.ts'

const KANJI_PATH = join(process.cwd(), 'content/n5/kanji-master-n5/kanji.md')

describe('parseKanjiFile — content/n5/kanji-master-n5/kanji.md', () => {
  it('đọc đúng 15 chương + phụ lục, tổng 119 + 15 = 134 chữ, không lỗi', () => {
    const issues = new ContentIssueCollector()
    const result = parseKanjiFile(KANJI_PATH, 'kanji-master-n5', issues)

    expect(issues.hasErrors).toBe(false)
    expect(result.chapters).toHaveLength(16) // 15 chương + phụ lục
    expect(result.rows).toHaveLength(134)

    const appendixRows = result.rows.filter((r) => r.chapter === 'appendix')
    expect(appendixRows).toHaveLength(15)
  })

  it('Kanji 四 có 5 nét, âm Kun/On đúng', () => {
    const issues = new ContentIssueCollector()
    const result = parseKanjiFile(KANJI_PATH, 'kanji-master-n5', issues)
    const si = result.rows.find((r) => r.char === '四')

    expect(si?.strokes).toBe(5)
    expect(si?.kun).toContain('よん')
    expect(si?.on).toEqual(['シ'])
    expect(si?.hanViet).toBe('TỨ')
  })

  it('Kanji 今 có ví dụ đọc đặc biệt 今日 (きょう): hôm nay', () => {
    const issues = new ContentIssueCollector()
    const result = parseKanjiFile(KANJI_PATH, 'kanji-master-n5', issues)
    const kon = result.rows.find((r) => r.char === '今')

    const special = kon?.examples.find(
      (e) => e.kind === 'special' && e.word === '今日',
    )
    expect(special).toEqual({
      kind: 'special',
      word: '今日',
      reading: 'きょう',
      meaning: 'hôm nay',
    })
  })
})

// ---------------------------------------------------------------------------
// Spec 002 (US3): ô "HÀNH (nghĩa) / HÀNG (nghĩa)" có nhiều cặp ngoặc.
// Hợp đồng: specs/002-data-and-logic-fixes/contracts/hanviet-cell.md

/** Regex một cặp ngoặc của bản cũ, chép nguyên làm tham chiếu cho FR-011. */
const OLD_REGEX = /^(.+?)\s*\((.+)\)$/u

/** Các ô "Hán Việt (nghĩa)" thô của kanji.md, theo chữ Kanji (đọc như parser). */
function rawMeaningCells(): { char: string; cell: string }[] {
  const { tree } = parseMarkdownFile(KANJI_PATH)
  const out: { char: string; cell: string }[] = []
  for (const section of sectionsByHeadingDepth(tree.children, 2)) {
    const table = findTable(section.body)
    if (!table) continue
    for (const row of tableToRows(table).rows) {
      const char = (row.cells[0] ?? '').split('\n')[0]!.trim()
      out.push({ char, cell: (row.cells[3] ?? '').trim() })
    }
  }
  return out
}

describe('splitHanVietMeaning — bảng ví dụ của hợp đồng', () => {
  it('một cặp ngoặc: NGOẠI (ngoài) → NGOẠI / ngoài (giữ nguyên hành vi)', () => {
    expect(splitHanVietMeaning('NGOẠI (ngoài)')).toEqual({
      hanViet: 'NGOẠI',
      meaning: 'ngoài',
    })
  })

  it('hai cặp ngoặc: HÀNH (đi; tiến hành) / HÀNG (hàng, dòng)', () => {
    expect(
      splitHanVietMeaning('HÀNH (đi; tiến hành) / HÀNG (hàng, dòng)'),
    ).toEqual({
      hanViet: 'HÀNH / HÀNG',
      meaning: 'đi; tiến hành / hàng, dòng',
    })
  })

  it('hai cặp ngoặc: TRƯỜNG (dài) / TRƯỞNG (người đứng đầu)', () => {
    expect(
      splitHanVietMeaning('TRƯỜNG (dài) / TRƯỞNG (người đứng đầu)'),
    ).toEqual({
      hanViet: 'TRƯỜNG / TRƯỞNG',
      meaning: 'dài / người đứng đầu',
    })
  })

  it('ngoặc lồng nhau cân được chấp nhận: A (x (y)) → meaning "x (y)"', () => {
    expect(splitHanVietMeaning('A (x (y))')).toEqual({
      hanViet: 'A',
      meaning: 'x (y)',
    })
  })

  it('dấu "/" bên trong ngoặc không tách đoạn', () => {
    expect(splitHanVietMeaning('THỦY (nước / sông)')).toEqual({
      hanViet: 'THỦY',
      meaning: 'nước / sông',
    })
  })
})

describe('splitHanVietMeaning — lỗi trả null, không trả giá trị cắt sai', () => {
  const bad: [string, string][] = [
    ['ngoặc không cân (thiếu ")")', 'A (x'],
    ['ngoặc không cân (thừa ")")', 'A (x))'],
    ['một đoạn không có ngoặc', 'HÀNH / HÀNG (y)'],
    ['đoạn rỗng sau "/"', 'A (x) / '],
    ['chữ thừa sau ")" cuối', 'A (x) y'],
    ['ô rỗng', ''],
  ]
  for (const [label, cell] of bad) {
    it(label, () => {
      expect(splitHanVietMeaning(cell)).toBeNull()
    })
  }
})

describe('parseKanjiFile — 行 và 長 trên kanji.md thật (US3)', () => {
  it('行: hanViet "HÀNH / HÀNG", meaning "đi; tiến hành / hàng, dòng"', () => {
    const issues = new ContentIssueCollector()
    const result = parseKanjiFile(KANJI_PATH, 'kanji-master-n5', issues)
    const row = result.rows.find((r) => r.char === '行')
    expect(row?.hanViet).toBe('HÀNH / HÀNG')
    expect(row?.meaning).toBe('đi; tiến hành / hàng, dòng')
  })

  it('長: hanViet "TRƯỜNG / TRƯỞNG", meaning "dài / người đứng đầu"', () => {
    const issues = new ContentIssueCollector()
    const result = parseKanjiFile(KANJI_PATH, 'kanji-master-n5', issues)
    const row = result.rows.find((r) => r.char === '長')
    expect(row?.hanViet).toBe('TRƯỜNG / TRƯỞNG')
    expect(row?.meaning).toBe('dài / người đứng đầu')
  })

  it('FR-011: mọi chữ khác 行 và 長 cho kết quả giống hệt regex cũ', () => {
    const issues = new ContentIssueCollector()
    const result = parseKanjiFile(KANJI_PATH, 'kanji-master-n5', issues)
    const cells = rawMeaningCells()
    expect(cells).toHaveLength(134)
    let checked = 0
    for (const { char, cell } of cells) {
      if (char === '行' || char === '長') continue
      const old = OLD_REGEX.exec(cell)
      expect(old, `regex cũ phải khớp ô của ${char}`).not.toBeNull()
      const row = result.rows.find((r) => r.char === char)
      expect(row?.hanViet, `hanViet của ${char}`).toBe(old![1]!.trim())
      expect(row?.meaning, `meaning của ${char}`).toBe(old![2]!.trim())
      checked++
    }
    expect(checked).toBe(132)
  })

  it('khứ hồi: ghép lại từ hanViet và meaning ra đúng ô nguồn của mọi chữ', () => {
    const issues = new ContentIssueCollector()
    const result = parseKanjiFile(KANJI_PATH, 'kanji-master-n5', issues)
    for (const { char, cell } of rawMeaningCells()) {
      const row = result.rows.find((r) => r.char === char)!
      const hv = row.hanViet.split(' / ')
      const mn = row.meaning.split(' / ')
      expect(hv.length, `số cụm của ${char}`).toBe(mn.length)
      const rebuilt = hv.map((h, i) => `${h} (${mn[i]})`).join(' / ')
      expect(rebuilt, `khứ hồi của ${char}`).toBe(cell)
    }
  })
})

describe('parseKanjiFile — ô nghĩa sai quy cách báo lỗi kèm số dòng', () => {
  const dirs: string[] = []
  afterEach(() => {
    for (const d of dirs.splice(0)) rmSync(d, { recursive: true, force: true })
  })

  /** Dựng một file kanji.md nhỏ với một dòng có ô nghĩa `cell`. */
  function parseWithCell(cell: string) {
    const dir = mkdtempSync(join(tmpdir(), 'kanji-md-'))
    dirs.push(dir)
    const file = join(dir, 'kanji.md')
    const rowLine = `| **四**<br>(5 nét) | よん | シ | ${cell} | **• Âm On:** 四月 (しがつ): tháng tư |`
    const content = [
      '# Kanji thử',
      '',
      '## CHƯƠNG 1 — Thử (1 chữ)',
      '',
      '| Chữ | Kun | On | Nghĩa | Ví dụ |',
      '|---|---|---|---|---|',
      rowLine,
      '',
    ].join('\n')
    writeFileSync(file, content)
    const issues = new ContentIssueCollector()
    const result = parseKanjiFile(file, 'kanji-test', issues)
    return {
      issues,
      result,
      expectedLine: content.split('\n').indexOf(rowLine) + 1,
    }
  }

  const bad: [string, string][] = [
    ['ngoặc không cân (thiếu ")")', 'TỨ (bốn'],
    ['ngoặc không cân (thừa ")")', 'TỨ (bốn))'],
    ['đoạn không có ngoặc', 'TỨ (bốn) / TỨ2'],
    ['đoạn rỗng sau "/"', 'TỨ (bốn) / '],
    ['chữ thừa sau ")" cuối', 'TỨ (bốn) thừa'],
    ['ô không có ngoặc nào', 'TỨ'],
  ]
  for (const [label, cell] of bad) {
    it(label, () => {
      const { issues, expectedLine } = parseWithCell(cell)
      expect(issues.hasErrors).toBe(true)
      expect(issues.errors[0]?.line).toBe(expectedLine)
    })
  }

  it('ô hợp lệ không báo lỗi', () => {
    const { issues, result } = parseWithCell('TỨ (bốn)')
    expect(issues.hasErrors).toBe(false)
    expect(result.rows[0]?.hanViet).toBe('TỨ')
    expect(result.rows[0]?.meaning).toBe('bốn')
  })
})
