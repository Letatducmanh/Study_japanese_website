import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { runContentPipeline, type PipelineResult } from './pipeline.ts'

// Q-1: pipeline đọc cả 25 bài + Kanji nên có thể quá hạn 5 giây mặc định.
// Chỉ tăng timeout cho file này, không đổi cấu hình kiểm thử chung.
vi.setConfig({ testTimeout: 30000, hookTimeout: 30000 })

const CONTENT_DIR = join(process.cwd(), 'content')

interface LessonSummary {
  lesson: number | 'appendix'
  vocabCount: number
  mainVocabCount: number
  kanjiCount: number
}

describe('runContentPipeline — dữ liệu N5 thật', () => {
  // Một lần chạy pipeline dùng chung cho mọi kiểm tra (không thêm lần chạy nào).
  let outDir: string
  let result: PipelineResult

  const readJson = <T>(...parts: string[]): T =>
    JSON.parse(readFileSync(join(outDir, ...parts), 'utf-8')) as T

  beforeAll(() => {
    outDir = mkdtempSync(join(tmpdir(), 'content-out-'))
    result = runContentPipeline({
      contentDir: CONTENT_DIR,
      outDir,
      write: true,
    })
  })

  afterAll(() => {
    if (outDir) rmSync(outDir, { recursive: true, force: true })
  })

  it('không có lỗi và sinh được file JSON khi write:true', () => {
    expect(result.issues.hasErrors).toBe(false)

    const lesson5 = readJson<{ vocab: { id: string }[] }>('mnn1', 'l05.json')
    expect(lesson5.vocab.some((v) => v.id.startsWith('mnn1-l05-'))).toBe(true)

    const ids = new Set<string>()
    for (const file of ['l01.json', 'l05.json', 'l25.json']) {
      const data = readJson<{ vocab: { id: string }[] }>('mnn1', file)
      for (const v of data.vocab) {
        expect(ids.has(v.id)).toBe(false)
        ids.add(v.id)
      }
    }
  })

  it('số từ chính của giáo trình mnn1 là 1.020', () => {
    const mnn1 = result.summary.books.find((b) => b.bookId === 'mnn1')
    expect(mnn1?.vocabMain).toBe(1020)
  })

  it('số từ mở rộng của giáo trình mnn1 là 275', () => {
    const mnn1 = result.summary.books.find((b) => b.bookId === 'mnn1')
    expect(mnn1?.vocabExtended).toBe(275)
  })

  it('số mẫu ngữ pháp mnn1 là 132', () => {
    const mnn1 = result.summary.books.find((b) => b.bookId === 'mnn1')
    expect(mnn1?.grammar).toBe(132)
  })

  it('Kanji Master N5 có 134 chữ: 119 ở các chương và 15 ở phụ lục', () => {
    const kanjiBook = result.summary.books.find(
      (b) => b.bookId === 'kanji-master-n5',
    )
    expect(kanjiBook?.kanji).toBe(134)

    const index = readJson<{ lessons: LessonSummary[] }>(
      'kanji-master-n5',
      'index.json',
    )
    const inChapters = index.lessons
      .filter((l) => l.lesson !== 'appendix')
      .reduce((sum, l) => sum + l.kanjiCount, 0)
    const inAppendix = index.lessons
      .filter((l) => l.lesson === 'appendix')
      .reduce((sum, l) => sum + l.kanjiCount, 0)
    expect(inChapters).toBe(119)
    expect(inAppendix).toBe(15)
  })

  it('Bài 6 có 51 từ chính + 10 từ mở rộng; Bài 13 có 38 + 11', () => {
    const index = readJson<{ lessons: LessonSummary[] }>('mnn1', 'index.json')
    const lesson = (n: number) => index.lessons.find((l) => l.lesson === n)!
    const l6 = lesson(6)
    const l13 = lesson(13)
    expect([l6.mainVocabCount, l6.vocabCount - l6.mainVocabCount]).toEqual([
      51, 10,
    ])
    expect([l13.mainVocabCount, l13.vocabCount - l13.mainVocabCount]).toEqual([
      38, 11,
    ])
  })

  it('ba từ chuyển sang mở rộng giữ nguyên mã định danh và ở phần extended', () => {
    // [mã, bài]: DVD (Bài 6); おなかが すきます, のどが かわきます (Bài 13)
    const moved: [string, number][] = [
      ['mnn1-l06-20bdf436', 6],
      ['mnn1-l13-cd7659ef', 13],
      ['mnn1-l13-af449570', 13],
    ]
    for (const lessonNo of [6, 13]) {
      const file = `l${String(lessonNo).padStart(2, '0')}.json`
      const data = readJson<{ vocab: { id: string; section: string }[] }>(
        'mnn1',
        file,
      )
      const ids = data.vocab.map((v) => v.id)
      expect(new Set(ids).size, `trùng mã trong ${file}`).toBe(ids.length)

      for (const [id, l] of moved.filter(([, l]) => l === lessonNo)) {
        const items = data.vocab.filter((v) => v.id === id)
        expect(items, `${id} phải có đúng một mục trong ${file}`).toHaveLength(
          1,
        )
        expect(items[0]?.section, `${id} (Bài ${l})`).toBe('extended')
      }
    }
  })
})

describe('runContentPipeline — write:false', () => {
  let outDir: string

  afterEach(() => {
    if (outDir) rmSync(outDir, { recursive: true, force: true })
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
