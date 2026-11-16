import { mkdtempSync, readdirSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import {
  exampleWordSpeech,
  kanjiCharSpeech,
  toSpeakable,
  type SpeakKind,
} from '../../src/lib/speakable.ts'
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
  on: string[]
  kun: string[]
  examples: { word: string; reading: string }[]
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
const kanjiItems: KanjiJson[] = []
const sentences: { id: string; jp: string }[] = []

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
      kanjiItems.push(k)
      spoken.push({ id: k.id, text: k.char, kind: 'word' })
      k.examples.forEach((e, i) =>
        spoken.push({ id: `${k.id}#ví-dụ-${i}`, text: e.word, kind: 'word' }),
      )
    }
    for (const g of lesson.grammar ?? []) {
      g.examples.forEach((e, i) =>
        sentences.push({ id: `${g.id}#${i}`, jp: e.jp }),
      )
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
// ---------------------------------------------------------------------------
// Spec 004 (kana-pronunciation): chuỗi đọc của từ vựng là cách đọc kana.
// Dùng chung `beforeAll` ở trên (không chạy thêm lần pipeline nào) và giữ timeout 30 giây.
// ---------------------------------------------------------------------------
const HAN = /\p{Script=Han}/u

describe('kana-pronunciation (spec 004)', () => {
  describe('từ vựng', () => {
    it('[đặc trưng] mọi từ có chuỗi đọc không rỗng, không chữ Hán, không ký tự cấm', () => {
      expect(vocab.length).toBeGreaterThan(0)
      const failures = vocab
        .map((v) => ({
          id: v.id,
          kana: v.kana,
          spoken: toSpeakable(v.kana, 'word'),
        }))
        .filter(
          (r) =>
            r.spoken.trim() === '' ||
            HAN.test(r.spoken) ||
            FORBIDDEN.test(r.spoken),
        )
      expect(failures).toEqual([])
    })

    // Cặp (kanji, kana) tra trong nội dung thật; `何` và `～人` mỗi từ có hai mục nên không tra theo kanji một mình.
    it.each([
      ['～人', '～じん', 'じん'],
      ['～人', '～にん', 'にん'],
      ['何時', 'なんじ', 'なんじ'],
      ['何', 'なん', 'なん'],
      ['何', 'なに', 'なに'],
      ['何分', 'なんぷん', 'なんぷん'],
      ['あの方', 'あのかた', 'あのかた'],
      ['この間', 'このあいだ', 'このあいだ'],
      ['[お]花見', '[お]はなみ', 'はなみ'],
      ['～分', '～ふん / ～ぷん', 'ふん'],
    ])(
      '[đặc trưng] (%s, %s) tồn tại trong nội dung và được đọc là %s',
      (kanji, kana, expected) => {
        const found = vocab.filter((v) => v.kanji === kanji && v.kana === kana)
        expect(found.length).toBeGreaterThan(0)
        for (const v of found) {
          expect(toSpeakable(v.kana, 'word')).toBe(expected)
        }
      },
    )

    it('[đặc trưng] ghi số liệu để đưa vào evidence.md', () => {
      const valid = vocab.filter((v) => {
        const spoken = toSpeakable(v.kana, 'word')
        return (
          spoken.trim() !== '' && !HAN.test(spoken) && !FORBIDDEN.test(spoken)
        )
      }).length
      const withKanji = vocab.filter((v) => v.kanji !== null).length
      console.info(
        `[kana-speech] từ vựng: ${valid}/${vocab.length} có chuỗi đọc hợp lệ; có kanji: ${withKanji}`,
      )
      expect(valid).toBe(vocab.length)
    })
  })

  describe('Kanji', () => {
    const byChar = (char: string): KanjiJson => {
      const found = kanjiItems.find((k) => k.char === char)
      expect(found, `không thấy chữ ${char}`).toBeDefined()
      return found as KanjiJson
    }
    const speechOf = (char: string): string => {
      const k = byChar(char)
      return kanjiCharSpeech(k.on, k.kun)
    }
    const allExamples = (): Array<{
      char: string
      reading: string
      word: string
    }> =>
      kanjiItems.flatMap((k) =>
        k.examples.map((e) => ({
          char: k.char,
          reading: e.reading,
          word: e.word,
        })),
      )

    it('mọi chữ Kanji đơn có chuỗi đọc không rỗng, không chữ Hán, không "・"', () => {
      expect(kanjiItems.length).toBeGreaterThan(0)
      const failures = kanjiItems
        .map((k) => ({ char: k.char, spoken: kanjiCharSpeech(k.on, k.kun) }))
        .filter(
          (r) =>
            r.spoken.trim() === '' ||
            HAN.test(r.spoken) ||
            r.spoken.includes('・'),
        )
      expect(failures).toEqual([])
    })

    it('mọi từ ví dụ có chuỗi đọc không rỗng, không chữ Hán, không ","', () => {
      expect(allExamples().length).toBeGreaterThan(0)
      const failures = allExamples()
        .map((e) => ({ ...e, spoken: exampleWordSpeech(e.reading) }))
        .filter(
          (r) =>
            r.spoken.trim() === '' ||
            HAN.test(r.spoken) ||
            r.spoken.includes(','),
        )
      expect(failures).toEqual([])
    })

    it.each([
      ['一', 'イチ、ひとつ'],
      ['二', 'ニ、ふたつ'],
      ['白', 'ハク、しろい'],
      ['人', 'ジン、ひと'],
      ['上', 'ジョウ、うえ'],
      ['大', 'ダイ、おおきい'],
      ['行', 'コウ、いく'],
      ['食', 'ショク、たべる'],
    ])('bảng thật: chữ %s đọc là %s', (char, expected) => {
      expect(speechOf(char)).toBe(expected)
    })

    it('畑 (không có On) chỉ đọc Kun đầu; 午 (không có Kun) chỉ đọc On đầu', () => {
      const hatake = speechOf('畑')
      expect(hatake).not.toContain('、')
      expect(hatake).toBe(byChar('畑').kun[0].replace(/・/gu, ''))
      expect(speechOf('午')).toBe('ゴ')
    })

    it.each([
      ['十', '十分', 'じゅっぷん'],
      ['何', '何', 'なに'],
      ['一', '一人', 'ひとり'],
    ])('ví dụ thật: chữ %s, ví dụ %s đọc là %s', (char, word, expected) => {
      const example = byChar(char).examples.find((e) => e.word === word)
      expect(example, `không thấy ví dụ ${word} ở chữ ${char}`).toBeDefined()
      expect(exampleWordSpeech((example as { reading: string }).reading)).toBe(
        expected,
      )
    })

    it('đúng 11 chữ được mở rộng thành dạng có đuôi (白, 一 đến 九, 大)', () => {
      // Theo quy tắc: Kun đầu không có "・" và có Kun khác bắt đầu bằng "<Kun đầu>・".
      const byRule = kanjiItems
        .filter((k) => {
          const first = k.kun[0]
          return (
            first !== undefined &&
            !first.includes('・') &&
            k.kun.some((other) => other.startsWith(first + '・'))
          )
        })
        .map((k) => k.char)
      // Theo hàm: phần Kun của chuỗi đọc khác Kun đầu đã bỏ "・".
      const byFunction = kanjiItems
        .filter((k) => {
          if (k.kun.length === 0) return false
          const kunPart = kanjiCharSpeech([], k.kun)
          return kunPart !== k.kun[0].replace(/・/gu, '')
        })
        .map((k) => k.char)
      const expected = [
        '白',
        '一',
        '二',
        '三',
        '四',
        '五',
        '六',
        '七',
        '八',
        '九',
        '大',
      ]
      expect([...byRule].sort()).toEqual([...expected].sort())
      expect([...byFunction].sort()).toEqual([...expected].sort())
      expect(byRule).toHaveLength(11)
    })

    it('ghi số liệu để đưa vào evidence.md', () => {
      const expanded = kanjiItems.filter((k) => {
        if (k.kun.length === 0) return false
        return kanjiCharSpeech([], k.kun) !== k.kun[0].replace(/・/gu, '')
      }).length
      console.info(
        `[kana-speech] Kanji: ${kanjiItems.length} chữ, ${allExamples().length} ví dụ, ${expanded} chữ mở rộng`,
      )
      expect(expanded).toBe(11)
    })
  })

  describe('bảng sửa cách đọc', () => {
    interface Correction {
      match: string
      speak: string
      note?: string
    }
    const table = (): Correction[] => {
      const json = JSON.parse(
        readFileSync(
          join(process.cwd(), 'content/overrides/speech-corrections.json'),
          'utf-8',
        ),
      ) as { sentence: Correction[] }
      return json.sentence
    }

    it('FR-010: có ít nhất một mục; mỗi mục hợp lệ; match không trùng', () => {
      const entries = table()
      expect(entries.length).toBeGreaterThanOrEqual(1)
      for (const e of entries) {
        expect(typeof e.match).toBe('string')
        expect(typeof e.speak).toBe('string')
        expect(e.match.trim()).not.toBe('')
        expect(e.speak.trim()).not.toBe('')
        expect(e.speak).not.toBe(e.match)
        expect(HAN.test(e.speak), `speak "${e.speak}" còn chữ Hán`).toBe(false)
      }
      const matches = entries.map((e) => e.match)
      expect(new Set(matches).size).toBe(matches.length)
    })

    it('mỗi match khớp ít nhất một câu trong nội dung (không có mục chết)', () => {
      for (const e of table()) {
        expect(
          sentences.some((s) => s.jp.includes(e.match)),
          `mục "${e.match}" không khớp câu nào`,
        ).toBe(true)
      }
    })

    it('câu đổi khi và chỉ khi chứa một match; câu "あの 方" ra "あの かた"', () => {
      const entries = table()
      const wrong = sentences.filter((s) => {
        const changed =
          toSpeakable(s.jp, 'sentence', entries) !==
          toSpeakable(s.jp, 'sentence')
        const contains = entries.some((e) => s.jp.includes(e.match))
        return changed !== contains
      })
      expect(wrong).toEqual([])
      const ano = sentences.find((s) => s.id === 'mnn1-l01-g-31547a22#0')
      expect(ano, 'không thấy câu mnn1-l01-g-31547a22#0').toBeDefined()
      expect(toSpeakable((ano as { jp: string }).jp, 'sentence', entries)).toBe(
        'あの かたは どなたですか。 ワット先生です。',
      )
    })

    it('ghi số liệu để đưa vào evidence.md', () => {
      const entries = table()
      const changed = sentences.filter(
        (s) =>
          toSpeakable(s.jp, 'sentence', entries) !==
          toSpeakable(s.jp, 'sentence'),
      ).length
      console.info(
        `[kana-speech] bảng sửa: ${entries.length} mục, ${changed}/${sentences.length} câu bị đổi`,
      )
      expect(changed).toBeGreaterThan(0)
    })
  })
})
