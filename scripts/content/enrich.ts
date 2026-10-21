import { toMasuStem } from '../../src/domain/conjugation/index.ts'
import type {
  Edition,
  GrammarExample,
  GrammarPoint,
  KanjiExample,
  KanjiItem,
  Pos,
  VerbGroup,
  VocabAnswers,
  VocabItem,
} from '../../src/domain/types.ts'
import type { ContentIssueCollector } from './errors.ts'
import { grammarId, kanjiId, vocabId } from './ids.ts'
import type { PosOverride, VerbGroupOverride } from './overrides.ts'
import type { RawGrammarRow, RawKanjiRow, RawVocabRow } from './raw-types.ts'

const CJK_CHAR = /[一-鿿]/gu
const E_ROW = new Set([
  'け',
  'げ',
  'せ',
  'ぜ',
  'て',
  'で',
  'ね',
  'へ',
  'べ',
  'ぺ',
  'め',
  'れ',
  'え',
])
const I_ROW = new Set([
  'き',
  'ぎ',
  'し',
  'じ',
  'ち',
  'ぢ',
  'に',
  'ひ',
  'び',
  'ぴ',
  'み',
  'り',
  'い',
])

/** Bỏ phần tùy chọn `[ ... ]` (vd "きます [シャツを～]" → "きます") trước khi phân tích đuôi từ. */
export function stripBracket(value: string): string {
  return value.replace(/\s*\[[^\]]*\]/gu, '').trim()
}

function splitAlternates(value: string): string[] {
  const cleaned = stripBracket(value)
  if (!cleaned) return []
  return cleaned
    .split(/\s*\/\s*/u)
    .map((s) => s.trim())
    .filter(Boolean)
}

function buildAnswers(
  kana: string,
  kanji: string | null,
  meaning: string,
): VocabAnswers {
  return {
    kana: splitAlternates(kana),
    kanji: kanji ? splitAlternates(kanji) : [],
    meaning: splitAlternates(meaning),
  }
}

function buildHomographKey(kana: string): string {
  const primary = splitAlternates(kana)[0] ?? kana
  return primary.normalize('NFKC').replace(/[～〜\s]/gu, '')
}

function extractKanjiChars(kanji: string | null): string[] {
  if (!kanji) return []
  const chars = new Set<string>()
  for (const match of kanji.matchAll(CJK_CHAR)) chars.add(match[0]!)
  return [...chars]
}

/**
 * Mục 6.3 bước 4: đoán từ loại theo thứ tự quy tắc đã định trong kế hoạch.
 * `rawKana`/`rawKanji` (CHƯA bỏ `[ ]`) dùng để nhận diện nhãn `[な]`; `kana`/`kanji`
 * (ĐÃ bỏ `[ ]`) dùng cho các kiểm tra đuôi từ còn lại.
 */
export function guessPos(
  kana: string,
  kanji: string | null,
  rawKana: string,
  rawKanji: string | null,
): Pos {
  if (kana.endsWith('ます')) return 'verb'
  if (rawKana.includes('[な]') || rawKanji?.includes('[な]')) return 'na-adj'
  const target = kanji ?? kana
  if (target.endsWith('い')) return 'i-adj'
  if (kana.startsWith('～')) return 'affix'
  if (kana.endsWith('。') || kana.endsWith('？') || kana.endsWith('?'))
    return 'expression'
  return 'noun'
}

/** Mục 6.3 bước 4: đoán nhóm động từ. `undefined` = không chắc chắn (cần override). */
export function guessVerbGroup(
  kana: string,
  kanji: string | null,
): VerbGroup | undefined {
  if (kanji?.endsWith('来ます')) return 3
  if (kana.endsWith('します')) return 3
  const stem = toMasuStem(kana)
  const last = stem.slice(-1)
  if (E_ROW.has(last)) return 2
  if (I_ROW.has(last)) return 1
  return undefined
}

export interface EnrichMaps {
  posOverrides: Map<string, Pos>
  verbGroupOverrides: Map<string, VerbGroup>
}

/** pos.yaml/verb-groups.yaml khai báo theo kana/kanji ĐÃ bỏ `[ ]`; `-` nghĩa là không có Kanji. */
export function buildEnrichMaps(
  posOverrides: PosOverride[],
  verbGroupOverrides: VerbGroupOverride[],
): EnrichMaps {
  return {
    posOverrides: new Map(
      posOverrides.map((o) => [stripBracket(o.kana), o.pos]),
    ),
    verbGroupOverrides: new Map(
      verbGroupOverrides.map((o) => [
        `${stripBracket(o.kana)}|${o.kanji === '-' ? '' : stripBracket(o.kanji)}`,
        o.group,
      ]),
    ),
  }
}

export interface EnrichReport {
  posCounts: Record<Pos, number>
  verbGroupOverridesApplied: string[]
}

export function createEnrichReport(): EnrichReport {
  return {
    posCounts: {
      noun: 0,
      verb: 0,
      'i-adj': 0,
      'na-adj': 0,
      adverb: 0,
      expression: 0,
      counter: 0,
      affix: 0,
      other: 0,
    },
    verbGroupOverridesApplied: [],
  }
}

export function enrichVocabRow(
  bookId: string,
  row: RawVocabRow,
  maps: EnrichMaps,
  report: EnrichReport,
  issues: ContentIssueCollector,
  filePath: string,
): VocabItem {
  // Bỏ phần tùy chọn "[ ]" trước khi đoán pos/nhóm động từ — nếu không, các từ như
  // "きます [シャツを～]" sẽ không được nhận ra là kết thúc bằng "ます".
  const cleanKana = stripBracket(row.kana)
  const cleanKanji = row.kanji ? stripBracket(row.kanji) : null

  const pos =
    maps.posOverrides.get(cleanKana) ??
    guessPos(cleanKana, cleanKanji, row.kana, row.kanji)
  report.posCounts[pos] += 1

  let verbGroup: VerbGroup | undefined
  if (pos === 'verb') {
    const overrideKey = `${cleanKana}|${cleanKanji ?? ''}`
    const override = maps.verbGroupOverrides.get(overrideKey)
    if (override) {
      verbGroup = override
      report.verbGroupOverridesApplied.push(
        `${cleanKana}（${cleanKanji ?? '-'}）→ nhóm ${override}`,
      )
    } else {
      const guessed = guessVerbGroup(cleanKana, cleanKanji)
      if (guessed === undefined) {
        issues.warning(
          filePath,
          `Không đoán được nhóm động từ cho "${cleanKana}" (Bài ${row.lesson}) — tạm coi là nhóm I.`,
          row.line,
        )
      }
      verbGroup = guessed ?? 1
    }
  }

  return {
    id: vocabId(bookId, row.lesson, row.kana, row.kanji),
    bookId,
    lesson: row.lesson,
    section: row.section,
    sectionTitle: row.sectionTitle,
    kana: row.kana,
    kanji: row.kanji,
    romaji: row.romaji,
    meaning: row.meaning,
    note: row.note,
    edition: row.edition as Edition | undefined,
    pos,
    verbGroup,
    answers: buildAnswers(row.kana, row.kanji, row.meaning),
    kanjiChars: extractKanjiChars(row.kanji),
    homographKey: buildHomographKey(row.kana),
  }
}

function toChunks(jp: string): string[] {
  return jp.split(/\s+/u).filter(Boolean)
}

export function enrichGrammarRow(
  bookId: string,
  row: RawGrammarRow,
): GrammarPoint {
  const examples: GrammarExample[] = row.examples.map((ex) => ({
    jp: ex.jp,
    romaji: ex.romaji,
    vi: ex.vi,
    chunks: toChunks(ex.jp),
  }))

  return {
    id: grammarId(bookId, row.lesson, row.title),
    bookId,
    lesson: row.lesson,
    order: row.order,
    title: row.title,
    meaning: row.meaning,
    explanationMd: row.explanationMd,
    examples,
    supplemental: row.supplemental,
  }
}

export function enrichKanjiRow(bookId: string, row: RawKanjiRow): KanjiItem {
  const examples: KanjiExample[] = row.examples.map((ex) => ({ ...ex }))

  return {
    id: kanjiId(row.char),
    bookId,
    chapter: row.chapter,
    char: row.char,
    strokes: row.strokes,
    kun: row.kun,
    on: row.on,
    hanViet: row.hanViet,
    meaning: row.meaning,
    examples,
    relatedVocabIds: [],
  }
}

/** Liên kết Kanji ↔ từ vựng (mục 6.3 bước 4): điền `relatedVocabIds` cho từng KanjiItem. */
export function linkRelatedVocab(
  kanjiItems: KanjiItem[],
  vocabItems: VocabItem[],
): void {
  const byChar = new Map<string, string[]>()
  for (const vocab of vocabItems) {
    for (const char of vocab.kanjiChars) {
      const list = byChar.get(char) ?? []
      list.push(vocab.id)
      byChar.set(char, list)
    }
  }
  for (const kanji of kanjiItems) {
    kanji.relatedVocabIds = byChar.get(kanji.char) ?? []
  }
}
