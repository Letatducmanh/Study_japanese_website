import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { runContentPipeline } from '../../scripts/content/pipeline'
import { clearVocabSearchIndexCache, searchVocab } from './search-index'

// Đây là lần chạy pipeline RIÊNG (thứ hai trong toàn bộ bộ test, lần đầu ở
// scripts/content/pipeline.test.ts): không đọc được public/content vì `npm run check`
// chạy trước `content:build`, và mỗi file test chạy cô lập. Timeout riêng cho file này.
vi.setConfig({ testTimeout: 30000, hookTimeout: 30000 })

let outDir = ''

const pad2 = (n: number) => String(n).padStart(2, '0')
const readJson = (...parts: string[]): unknown =>
  JSON.parse(readFileSync(join(outDir, ...parts), 'utf-8'))

// Đọc JSON đã dựng ở thư mục tạm thay cho fetch tới /content (chỉ đọc lúc được gọi).
vi.mock('@/data/content-loader', () => ({
  loadManifest: () => Promise.resolve(readJson('manifest.json')),
  loadBookIndex: (bookId: string) =>
    Promise.resolve(readJson(bookId, 'index.json')),
  loadLesson: (bookId: string, lesson: number) =>
    Promise.resolve(readJson(bookId, `l${pad2(lesson)}.json`)),
}))

beforeAll(() => {
  outDir = mkdtempSync(join(tmpdir(), 'search-real-'))
  const { issues } = runContentPipeline({
    contentDir: join(process.cwd(), 'content'),
    outDir,
    write: true,
  })
  expect(issues.hasErrors).toBe(false)
  clearVocabSearchIndexCache()
})

afterAll(() => {
  if (outDir) rmSync(outDir, { recursive: true, force: true })
})

const kanjiOf = (rs: { kanji: string | null; kana: string }[]) =>
  rs.map((r) => r.kanji ?? r.kana)

describe('searchVocab trên 1.295 từ thật (SC-005)', () => {
  it('"sinh vien": tối đa 3 kết quả, 学生 hạng 1 (trước khi sửa: 156)', async () => {
    const results = await searchVocab('sinh vien')
    expect(results.length).toBeLessThanOrEqual(3)
    expect(kanjiOf(results)[0]).toBe('学生')
  })

  it('"nhat ban": tối đa 3 kết quả, 日本 hạng 1 (trước khi sửa: 246)', async () => {
    const results = await searchVocab('nhat ban')
    expect(results.length).toBeLessThanOrEqual(3)
    expect(kanjiOf(results)[0]).toBe('日本')
  })

  it('kana, kanji, romaji cho đúng từ hạng 1', async () => {
    expect(kanjiOf(await searchVocab('gakusei'))[0]).toBe('学生')
    expect(kanjiOf(await searchVocab('がくせい'))[0]).toBe('学生')
    expect(kanjiOf(await searchVocab('学生'))[0]).toBe('学生')
    expect(kanjiOf(await searchVocab('sensei'))[0]).toBe('先生')
    expect(kanjiOf(await searchVocab('nihon'))[0]).toBe('日本')
  })

  it('"nuoc ngoai" (không dấu): 外国 trong top 3', async () => {
    const results = await searchVocab('nuoc ngoai')
    expect(kanjiOf(results).slice(0, 3)).toContain('外国')
  })

  it('một ký tự CJK (kanji, kana) vẫn tìm được, khác với một ký tự ASCII', async () => {
    for (const q of ['日', '学', 'あ']) {
      const results = await searchVocab(q)
      expect(results.length, q).toBeGreaterThan(0)
    }
  })

  it('truy vấn vô nghĩa hoặc một ký tự ASCII → rỗng', async () => {
    expect(await searchVocab('zzzz')).toEqual([])
    expect(await searchVocab('a')).toEqual([])
  })
})
