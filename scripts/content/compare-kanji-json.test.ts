import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { compareKanjiDirs, DEFAULT_ALLOWED_IDS } from './compare-kanji-json.ts'

type Item = Record<string, unknown> & { id: string }

function makeItems(): Item[] {
  return [
    {
      id: 'kanji-行',
      char: '行',
      strokes: 6,
      hanViet: 'HÀNH',
      meaning: 'đi; tiến hành) / HÀNG (hàng, dòng',
    },
    {
      id: 'kanji-長',
      char: '長',
      strokes: 8,
      hanViet: 'TRƯỜNG',
      meaning: 'dài) / TRƯỞNG (người đứng đầu',
    },
    { id: 'kanji-四', char: '四', strokes: 5, hanViet: 'TỨ', meaning: 'bốn' },
  ]
}

describe('compareKanjiDirs', () => {
  const dirs: string[] = []

  afterEach(() => {
    for (const d of dirs.splice(0)) rmSync(d, { recursive: true, force: true })
  })

  /** Tạo hai thư mục trước/sau; `mutate` sửa bản "sau". */
  function setup(mutate?: (after: Record<string, unknown>) => void) {
    const root = mkdtempSync(join(tmpdir(), 'cmp-kanji-'))
    dirs.push(root)
    const before = join(root, 'before')
    const after = join(root, 'after')
    mkdirSync(before)
    mkdirSync(after)

    const build = (): Record<string, unknown> => ({
      'index.json': { bookId: 'kanji-master-n5', title: 'T', lessons: [1] },
      'ch01.json': { bookId: 'kanji-master-n5', chapter: 1, kanji: makeItems() },
      'ch02.json': {
        bookId: 'kanji-master-n5',
        chapter: 2,
        kanji: [
          { id: 'kanji-二', char: '二', strokes: 2, hanViet: 'NHỊ', meaning: 'hai' },
        ],
      },
    })
    const b = build()
    const a = build()
    mutate?.(a)
    for (const [name, data] of Object.entries(b))
      writeFileSync(join(before, name), JSON.stringify(data, null, 2))
    for (const [name, data] of Object.entries(a))
      writeFileSync(join(after, name), JSON.stringify(data, null, 2))
    return { before, after }
  }

  function items(after: Record<string, unknown>): Item[] {
    return (after['ch01.json'] as { kanji: Item[] }).kanji
  }

  it('mặc định chỉ cho phép hai mục 行 và 長', () => {
    expect([...DEFAULT_ALLOWED_IDS].sort()).toEqual(['kanji-行', 'kanji-長'])
  })

  it('hai thư mục giống hệt → OK, không có mục nào khác', () => {
    const { before, after } = setup()
    const r = compareKanjiDirs(before, after)
    expect(r.ok).toBe(true)
    expect(r.changedIds).toEqual([])
  })

  it('chỉ 行 và 長 đổi hanViet/meaning → OK', () => {
    const { before, after } = setup((a) => {
      const [gyou, cho] = items(a) as [Item, Item, Item]
      gyou.hanViet = 'HÀNH / HÀNG'
      gyou.meaning = 'đi; tiến hành / hàng, dòng'
      cho.hanViet = 'TRƯỜNG / TRƯỞNG'
      cho.meaning = 'dài / người đứng đầu'
    })
    const r = compareKanjiDirs(before, after)
    expect(r.ok).toBe(true)
    expect(r.changedIds.sort()).toEqual(['kanji-行', 'kanji-長'])
  })

  it('đổi số nét của 行 → lỗi (trường ngoài hanViet/meaning)', () => {
    const { before, after } = setup((a) => {
      const [gyou] = items(a) as [Item]
      gyou.hanViet = 'HÀNH / HÀNG'
      gyou.strokes = 7
    })
    const r = compareKanjiDirs(before, after)
    expect(r.ok).toBe(false)
    expect(r.problems.join('\n')).toContain('strokes')
  })

  it('đổi một chữ khác 行/長 → lỗi', () => {
    const { before, after } = setup((a) => {
      const item = items(a)[2] as Item
      item.hanViet = 'KHÁC'
    })
    const r = compareKanjiDirs(before, after)
    expect(r.ok).toBe(false)
    expect(r.problems.join('\n')).toContain('kanji-四')
  })

  it('thiếu một file ở thư mục sau → lỗi', () => {
    const { before, after } = setup()
    rmSync(join(after, 'ch02.json'))
    const r = compareKanjiDirs(before, after)
    expect(r.ok).toBe(false)
    expect(r.problems.join('\n')).toContain('ch02.json')
  })

  it('đổi file không phải danh sách Kanji (index.json) → lỗi', () => {
    const { before, after } = setup((a) => {
      ;(a['index.json'] as { title: string }).title = 'Đã đổi'
    })
    const r = compareKanjiDirs(before, after)
    expect(r.ok).toBe(false)
    expect(r.problems.join('\n')).toContain('index.json')
  })
})
