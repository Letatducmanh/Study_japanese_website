import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { ContentIssueCollector } from './errors.ts'
import { parseKanjiFile } from './parse-kanji.ts'

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
