import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { ContentIssueCollector } from './errors.ts'
import { parseGrammarFile } from './parse-grammar.ts'

const GRAMMAR_PATH = join(process.cwd(), 'content/n5/mnn1/grammar.md')

describe('parseGrammarFile — content/n5/mnn1/grammar.md', () => {
  it('đọc đúng 25 bài và 132 mẫu ngữ pháp, không lỗi', () => {
    const issues = new ContentIssueCollector()
    const result = parseGrammarFile(GRAMMAR_PATH, 'mnn1', issues)

    expect(issues.hasErrors).toBe(false)
    expect(result.lessons).toHaveLength(25)
    expect(result.rows).toHaveLength(132)
  })

  it('mỗi mẫu ngữ pháp có ít nhất 1 ví dụ đủ 3 dòng (Nhật/Romaji/Dịch)', () => {
    const issues = new ContentIssueCollector()
    const result = parseGrammarFile(GRAMMAR_PATH, 'mnn1', issues)

    for (const point of result.rows) {
      for (const example of point.examples) {
        expect(example.jp.length).toBeGreaterThan(0)
        expect(example.romaji.length).toBeGreaterThan(0)
        expect(example.vi.length).toBeGreaterThan(0)
      }
    }
  })

  it('mẫu ngữ pháp Bài 5 thứ 1 là "N (địa điểm) へ 行きます..." và có 3 ví dụ', () => {
    const issues = new ContentIssueCollector()
    const result = parseGrammarFile(GRAMMAR_PATH, 'mnn1', issues)
    const point = result.rows.find((r) => r.lesson === 5 && r.order === 1)

    expect(point?.title).toContain('行きます')
    expect(point?.examples).toHaveLength(3)
    expect(point?.supplemental).toBe(false)
  })
})
