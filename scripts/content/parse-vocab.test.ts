import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { ContentIssueCollector } from './errors.ts'
import { parseVocabFile } from './parse-vocab.ts'

const VOCAB_PATH = join(process.cwd(), 'content/n5/mnn1/vocab.md')

describe('parseVocabFile — content/n5/mnn1/vocab.md', () => {
  it('đọc đúng 25 bài, 1.020±vài từ chính và 272 từ mở rộng, không lỗi', () => {
    const issues = new ContentIssueCollector()
    const result = parseVocabFile(VOCAB_PATH, 'mnn1', issues)

    expect(issues.hasErrors).toBe(false)
    expect(result.lessons).toHaveLength(25)

    const main = result.rows.filter((r) => r.section === 'main')
    const extended = result.rows.filter((r) => r.section === 'extended')
    expect(main.length).toBeGreaterThan(1000)
    expect(extended).toHaveLength(272)
  })

  it('Bài 3 có じどうはんばいき (máy bán hàng tự động)', () => {
    const issues = new ContentIssueCollector()
    const result = parseVocabFile(VOCAB_PATH, 'mnn1', issues)
    const item = result.rows.find(
      (r) => r.lesson === 3 && r.kana === 'じどうはんばいき',
    )
    expect(item).toBeDefined()
    expect(item?.kanji).toBe('自動販売機')
    expect(item?.section).toBe('main')
  })
})

describe('parseVocabFile — dòng thiếu cột', () => {
  let dir: string

  afterEach(() => {
    if (dir) rmSync(dir, { recursive: true, force: true })
  })

  it('báo lỗi đúng dòng khi một ô bị xóa mất nội dung', () => {
    dir = mkdtempSync(join(tmpdir(), 'vocab-test-'))
    const filePath = join(dir, 'vocab.md')
    const lines = [
      '## 📖 BÀI 1 — Test',
      '',
      '### 1. Từ vựng chính',
      '',
      '| Tiếng Nhật (Kana) | Hán tự (Kanji) | Cách đọc (Romaji) | Nghĩa tiếng Việt | Ghi chú |',
      '|---|---|---|---|---|',
      '| わたし | 私 | watashi | tôi | |',
      '| あなた | - | | anh/chị | |',
    ]
    writeFileSync(filePath, lines.join('\n'))

    const issues = new ContentIssueCollector()
    parseVocabFile(filePath, 'test', issues)

    expect(issues.hasErrors).toBe(true)
    const romajiError = issues.errors.find((e) => e.message.includes('Romaji'))
    expect(romajiError?.line).toBe(8)
  })
})
