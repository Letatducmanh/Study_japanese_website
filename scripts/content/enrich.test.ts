import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  toDictionary,
  toNai,
  toTa,
  toTe,
} from '../../src/domain/conjugation/index.ts'
import {
  buildEnrichMaps,
  createEnrichReport,
  enrichKanjiRow,
  enrichVocabRow,
  guessPos,
  guessVerbGroup,
  linkRelatedVocab,
} from './enrich.ts'
import { ContentIssueCollector } from './errors.ts'
import { parseKanjiFile } from './parse-kanji.ts'
import { parseVocabFile } from './parse-vocab.ts'

const VOCAB_PATH = join(process.cwd(), 'content/n5/mnn1/vocab.md')
const KANJI_PATH = join(process.cwd(), 'content/n5/kanji-master-n5/kanji.md')
const POS_OVERRIDES_PATH = join(process.cwd(), 'content/overrides/pos.yaml')
const VERB_GROUP_OVERRIDES_PATH = join(
  process.cwd(),
  'content/overrides/verb-groups.yaml',
)

function makeRow(
  overrides: Partial<Parameters<typeof enrichVocabRow>[1]> = {},
) {
  return {
    lesson: 1,
    section: 'main' as const,
    kana: 'たべます',
    kanji: '食べます',
    romaji: 'tabemasu',
    meaning: 'ăn',
    line: 1,
    ...overrides,
  }
}

describe('guessPos', () => {
  it('nhận ra động từ dù kana có hậu tố [ ] (bug đã sửa)', () => {
    expect(guessPos('きます', '着ます', 'きます [シャツを～]', '着ます')).toBe(
      'verb',
    )
  })

  it('nhận ra tính từ な nhờ nhãn [な] trên kana gốc, kể cả khi kết thúc bằng い', () => {
    // きれい kết thúc bằng い nhưng vẫn là tính từ な (ghi chú trong vocab.md)
    expect(guessPos('きれい', '綺麗', 'きれい [な]', '綺麗 [な]')).toBe(
      'na-adj',
    )
  })

  it('tính từ い nhận theo đuôi Kanji, không nhầm danh từ kết thúc い (せんせい)', () => {
    expect(guessPos('いそがしい', '忙しい', 'いそがしい', '忙しい')).toBe(
      'i-adj',
    )
    expect(guessPos('せんせい', '先生', 'せんせい', '先生')).toBe('noun')
  })

  it('tính từ い không có Kanji vẫn nhận được qua kana (おいしい)', () => {
    expect(guessPos('おいしい', null, 'おいしい', null)).toBe('i-adj')
  })

  it('hậu tố bắt đầu bằng ～ và câu giao tiếp kết thúc bằng 。', () => {
    expect(guessPos('～さん', null, '～さん', null)).toBe('affix')
    expect(guessPos('はじめまして。', null, 'はじめまして。', null)).toBe(
      'expression',
    )
  })
})

describe('guessVerbGroup', () => {
  it('来ます (qua Kanji) và します đều là nhóm III', () => {
    expect(guessVerbGroup('きます', '来ます')).toBe(3)
    expect(guessVerbGroup('べんきょうします', null)).toBe(3)
  })

  it('âm cuối thân thuộc hàng え -> nhóm II, hàng い -> nhóm I (mặc định)', () => {
    expect(guessVerbGroup('たべます', '食べます')).toBe(2)
    expect(guessVerbGroup('かきます', '書きます')).toBe(1)
  })
})

describe('enrichVocabRow — áp override đúng dù kana có hậu tố [ ]', () => {
  it('きます [シャツを～] (着ます) được áp override nhóm II', () => {
    const maps = buildEnrichMaps(
      [{ kana: 'きます', pos: 'verb' }],
      [{ kana: 'きます', kanji: '着ます', group: 2 }],
    )
    const report = createEnrichReport()
    const issues = new ContentIssueCollector()
    const item = enrichVocabRow(
      'mnn1',
      makeRow({ kana: 'きます [シャツを～]', kanji: '着ます' }),
      maps,
      report,
      issues,
      'test.md',
    )
    expect(item.pos).toBe('verb')
    expect(item.verbGroup).toBe(2)
    expect(issues.hasErrors).toBe(false)
  })

  it('できます (kanji "-") được áp override qua map chuẩn hóa', () => {
    const maps = buildEnrichMaps(
      [],
      [{ kana: 'できます', kanji: '-', group: 2 }],
    )
    const report = createEnrichReport()
    const issues = new ContentIssueCollector()
    const item = enrichVocabRow(
      'mnn1',
      makeRow({ kana: 'できます', kanji: null }),
      maps,
      report,
      issues,
      'test.md',
    )
    expect(item.verbGroup).toBe(2)
  })
})

describe('enrichVocabRow — answers/homographKey/kanjiChars', () => {
  it('tách "A / B" và bỏ "[ ]" khi tạo answers', () => {
    const maps = buildEnrichMaps([], [])
    const report = createEnrichReport()
    const issues = new ContentIssueCollector()
    const item = enrichVocabRow(
      'mnn1',
      makeRow({
        kana: 'いい / よい',
        kanji: '良い',
        romaji: 'ii / yoi',
        meaning: 'tốt',
        section: 'main',
      }),
      maps,
      report,
      issues,
      'test.md',
    )
    expect(item.answers.kana).toEqual(['いい', 'よい'])
    expect(item.pos).toBe('i-adj')
  })

  it('kanjiChars trích đúng các chữ Hán trong kanji, bỏ trùng', () => {
    const maps = buildEnrichMaps([], [])
    const report = createEnrichReport()
    const issues = new ContentIssueCollector()
    const item = enrichVocabRow(
      'mnn1',
      makeRow({
        kana: 'がいこくじん',
        kanji: '外国人',
        meaning: 'người nước ngoài',
      }),
      maps,
      report,
      issues,
      'test.md',
    )
    expect(item.kanjiChars).toEqual(['外', '国', '人'])
  })
})

describe('Tích hợp trên dữ liệu N5 thật', () => {
  it('"外" có relatedVocabIds chứa 外国, 外国人', () => {
    const issues = new ContentIssueCollector()
    const rawVocab = parseVocabFile(VOCAB_PATH, 'mnn1', issues)
    const rawKanji = parseKanjiFile(KANJI_PATH, 'kanji-master-n5', issues)
    expect(issues.hasErrors).toBe(false)

    const maps = buildEnrichMaps([], [])
    const report = createEnrichReport()
    const vocabItems = rawVocab.rows.map((row) =>
      enrichVocabRow('mnn1', row, maps, report, issues, VOCAB_PATH),
    )
    const kanjiItems = rawKanji.rows.map((row) =>
      enrichKanjiRow('kanji-master-n5', row),
    )

    linkRelatedVocab(kanjiItems, vocabItems)

    const gai = kanjiItems.find((k) => k.char === '外')
    expect(gai).toBeDefined()
    const relatedWords = gai!.relatedVocabIds.map(
      (id) => vocabItems.find((v) => v.id === id)?.kanji,
    )
    expect(relatedWords).toContain('外国')
    expect(relatedWords.length).toBeGreaterThan(1)
  })

  it('mọi từ pos=verb chia được て/た/ない/từ điển không lỗi', () => {
    const issues = new ContentIssueCollector()
    const rawVocab = parseVocabFile(VOCAB_PATH, 'mnn1', issues)
    expect(issues.hasErrors).toBe(false)

    const maps = buildEnrichMaps([], [])
    const report = createEnrichReport()
    const vocabItems = rawVocab.rows.map((row) =>
      enrichVocabRow('mnn1', row, maps, report, issues, VOCAB_PATH),
    )
    const verbs = vocabItems.filter((v) => v.pos === 'verb')

    expect(verbs.length).toBeGreaterThan(100)
    for (const verb of verbs) {
      expect(verb.verbGroup).toBeDefined()
      expect(() => toTe(verb.kana, verb.verbGroup!)).not.toThrow()
      expect(() => toTa(verb.kana, verb.verbGroup!)).not.toThrow()
      expect(() => toNai(verb.kana, verb.verbGroup!)).not.toThrow()
      expect(() => toDictionary(verb.kana, verb.verbGroup!)).not.toThrow()
      expect(toTe(verb.kana, verb.verbGroup!).length).toBeGreaterThan(0)
    }
  })

  it('không còn cảnh báo "Không đoán được nhóm động từ" khi dùng overrides thật', async () => {
    const { loadPosOverrides, loadVerbGroupOverrides } =
      await import('./overrides.ts')
    const issues = new ContentIssueCollector()
    const rawVocab = parseVocabFile(VOCAB_PATH, 'mnn1', issues)
    const maps = buildEnrichMaps(
      loadPosOverrides(POS_OVERRIDES_PATH),
      loadVerbGroupOverrides(VERB_GROUP_OVERRIDES_PATH),
    )
    const report = createEnrichReport()
    rawVocab.rows.forEach((row) =>
      enrichVocabRow('mnn1', row, maps, report, issues, VOCAB_PATH),
    )

    const ambiguous = issues.warnings.filter((w) =>
      w.message.includes('Không đoán được nhóm động từ'),
    )
    expect(ambiguous).toHaveLength(0)
    expect(report.verbGroupOverridesApplied).toHaveLength(9)
  })
})
