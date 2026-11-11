import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { runContentPipeline } from './pipeline.ts'

// Q-1: pipeline đọc cả 25 bài + Kanji nên có thể quá hạn 5 giây mặc định.
// Chỉ tăng timeout cho file này, không đổi cấu hình kiểm thử chung.
vi.setConfig({ testTimeout: 30000, hookTimeout: 30000 })

const CONTENT_DIR = join(process.cwd(), 'content')

describe('runContentPipeline — dữ liệu N5 thật', () => {
  let outDir: string

  afterEach(() => {
    if (outDir) rmSync(outDir, { recursive: true, force: true })
  })

  it('không có lỗi, đếm đúng số lượng, và sinh được file JSON khi write:true', () => {
    outDir = mkdtempSync(join(tmpdir(), 'content-out-'))
    const { issues, summary } = runContentPipeline({
      contentDir: CONTENT_DIR,
      outDir,
      write: true,
    })

    expect(issues.hasErrors).toBe(false)

    const mnn1 = summary.books.find((b) => b.bookId === 'mnn1')
    expect(mnn1?.grammar).toBe(132)
    expect(mnn1?.vocabExtended).toBe(272)

    const kanjiBook = summary.books.find((b) => b.bookId === 'kanji-master-n5')
    expect(kanjiBook?.kanji).toBe(134)

    const lesson5 = JSON.parse(
      readFileSync(join(outDir, 'mnn1', 'l05.json'), 'utf-8'),
    )
    expect(
      lesson5.vocab.some((v: { id: string }) => v.id.startsWith('mnn1-l05-')),
    ).toBe(true)

    const ids = new Set<string>()
    for (const file of ['l01.json', 'l05.json', 'l25.json']) {
      const data = JSON.parse(readFileSync(join(outDir, 'mnn1', file), 'utf-8'))
      for (const v of data.vocab) {
        expect(ids.has(v.id)).toBe(false)
        ids.add(v.id)
      }
    }
  })

  it('write:false không ghi file nào ra outDir', () => {
    outDir = mkdtempSync(join(tmpdir(), 'content-out-'))
    const { issues } = runContentPipeline({
      contentDir: CONTENT_DIR,
      outDir,
      write: false,
    })
    expect(issues.hasErrors).toBe(false)
    expect(() => readFileSync(join(outDir, 'manifest.json'))).toThrow()
  })
})
