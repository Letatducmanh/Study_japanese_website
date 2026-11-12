import { mkdtempSync, readdirSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { toSpeakable, type SpeakKind } from '../../src/lib/speakable.ts'
import { runContentPipeline } from './pipeline.ts'

// Lần chạy pipeline RIÊNG (thứ ba trong bộ test): `public/content/*.json` bị gitignore và
// `npm run check` chạy trước `content:build`, nên không đọc sẵn được. Timeout riêng như Q-1.
vi.setConfig({ testTimeout: 30000, hookTimeout: 30000 })

interface VocabJson {
  id: string
  kana: string
  kanji: string | null
  answers: { kana: string[]; kanji: string[] }
}
interface KanjiJson {
  id: string
  char: string
  examples: { word: string }[]
}
interface GrammarJson {
  id: string
  examples: { jp: string }[]
}
interface LessonJson {
  vocab?: VocabJson[]
  kanji?: KanjiJson[]
  grammar?: GrammarJson[]
}

interface SpokenString {
  id: string
  text: string
  kind: SpeakKind
}

/** Ngoại lệ của FR-012: chuỗi vẫn còn ký tự bị cấm sau làm sạch. Hiện RỖNG; mỗi mục phải có lý do. */
const EXCEPTIONS: Array<{ id: string; reason: string }> = []

/** [ ] ［ ］ ～ 〜 ~ （ ） ( ) / ／ — các ký tự FR-012 cấm trong chuỗi đọc. */
const FORBIDDEN = /[[\]［］～〜~（）()/／]/u

/** Bỏ ký hiệu chỗ trống và gộp khoảng trắng để so khớp với `answers.*[0]` (đã làm sạch lúc build). */
const normalize = (s: string): string =>
  s.replace(/[～〜~]/gu, '').replace(/\s+/gu, ' ').trim()

let outDir = ''
const spoken: SpokenString[] = []
const vocab: VocabJson[] = []

function readLessonFiles(): LessonJson[] {
  const files: LessonJson[] = []
  for (const book of readdirSync(outDir, { withFileTypes: true })) {
    if (!book.isDirectory()) continue
    for (const name of readdirSync(join(outDir, book.name))) {
      if (!/^(l\d+|ch\d+|appendix)\.json$/u.test(name)) continue
      files.push(
        JSON.parse(
          readFileSync(join(outDir, book.name, name), 'utf-8'),
        ) as LessonJson,
      )
    }
  }
  return files
}

beforeAll(() => {
  outDir = mkdtempSync(join(tmpdir(), 'speakable-content-'))
  const { issues } = runContentPipeline({
    contentDir: join(process.cwd(), 'content'),
    outDir,
    write: true,
  })
  expect(issues.hasErrors).toBe(false)

  for (const lesson of readLessonFiles()) {
    for (const v of lesson.vocab ?? []) {
      vocab.push(v)
      spoken.push({ id: v.id, text: v.kanji ?? v.kana, kind: 'word' })
    }
    for (const k of lesson.kanji ?? []) {
      spoken.push({ id: k.id, text: k.char, kind: 'word' })
      k.examples.forEach((e, i) =>
        spoken.push({ id: `${k.id}#ví-dụ-${i}`, text: e.word, kind: 'word' }),
      )
    }
    for (const g of lesson.grammar ?? []) {
      g.examples.forEach((e, i) =>
        spoken.push({ id: `${g.id}#${i}`, text: e.jp, kind: 'sentence' }),
      )
    }
  }
})

afterAll(() => {
  if (outDir) rmSync(outDir, { recursive: true, force: true })
})

describe('toSpeakable trên toàn bộ nội dung đã dựng', () => {
  it('có chuỗi để kiểm (không kiểm trên tập rỗng)', () => {
    expect(spoken.length).toBeGreaterThan(0)
    expect(vocab.length).toBeGreaterThan(0)
  })

  it('FR-012: danh sách ngoại lệ rỗng', () => {
    expect(EXCEPTIONS).toEqual([])
  })

  it('FR-012: chuỗi đọc không còn [ ] ～ （ ） / và không rỗng', () => {
    const excepted = new Set(EXCEPTIONS.map((e) => e.id))
    const failures = spoken
      .filter((s) => !excepted.has(s.id))
      .map((s) => ({ ...s, result: toSpeakable(s.text, s.kind) }))
      .filter((s) => FORBIDDEN.test(s.result) || s.result === '')
    expect(failures).toEqual([])
  })

  it('toSpeakable(kana) khớp answers.kana[0] ở mọi từ vựng (0 chỗ lệch)', () => {
    const mismatches = vocab
      .filter(
        (v) =>
          normalize(toSpeakable(v.kana, 'word')) !==
          normalize(v.answers.kana[0] ?? ''),
      )
      .map((v) => ({
        id: v.id,
        kana: v.kana,
        answer: v.answers.kana[0],
        spoken: toSpeakable(v.kana, 'word'),
      }))
    expect(mismatches).toEqual([])
  })

  it('toSpeakable(kanji) khớp answers.kanji[0] ở mọi từ vựng có kanji (0 chỗ lệch)', () => {
    const withKanji = vocab.filter((v) => v.kanji !== null)
    const mismatches = withKanji
      .filter(
        (v) =>
          normalize(toSpeakable(v.kanji ?? '', 'word')) !==
          normalize(v.answers.kanji[0] ?? ''),
      )
      .map((v) => ({
        id: v.id,
        kanji: v.kanji,
        answer: v.answers.kanji[0],
        spoken: toSpeakable(v.kanji ?? '', 'word'),
      }))
    expect(mismatches).toEqual([])
  })

  it('ghi số liệu để đưa vào evidence.md', () => {
    const changed = spoken.filter(
      (s) => toSpeakable(s.text, s.kind) !== s.text,
    ).length
    const withKanji = vocab.filter((v) => v.kanji !== null)
    const matchKana = vocab.filter(
      (v) =>
        normalize(toSpeakable(v.kana, 'word')) ===
        normalize(v.answers.kana[0] ?? ''),
    ).length
    const matchKanji = withKanji.filter(
      (v) =>
        normalize(toSpeakable(v.kanji ?? '', 'word')) ===
        normalize(v.answers.kanji[0] ?? ''),
    ).length
    console.info(
      `[speakable] chuỗi được đọc: ${spoken.length}; đổi sau làm sạch: ${changed}; ` +
        `khớp answers.kana[0]: ${matchKana}/${vocab.length}; ` +
        `khớp answers.kanji[0]: ${matchKanji}/${withKanji.length}`,
    )
    expect(changed).toBeGreaterThan(0)
  })
})
