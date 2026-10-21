import type { Edition } from '../../src/domain/types.ts'

/** Dữ liệu đã trích xuất từ markdown, CHƯA qua enrich (Phase 2: pos, verbGroup, answers, kanjiChars, homographKey). */
export interface RawVocabRow {
  lesson: number
  section: 'main' | 'extended'
  sectionTitle?: string
  kana: string
  kanji: string | null
  romaji: string
  meaning: string
  note?: string
  edition?: Edition
  line: number
}

export interface RawVocabLesson {
  lesson: number
  title: string
  line: number
}

export interface RawVocabFile {
  bookId: string
  lessons: RawVocabLesson[]
  rows: RawVocabRow[]
}

export interface RawGrammarExample {
  jp: string
  romaji: string
  vi: string
  line: number
}

/** CHƯA có `chunks` (tách theo khoảng trắng) — việc này thuộc Phase 2 (enrich). */
export interface RawGrammarRow {
  lesson: number
  order: number
  title: string
  meaning: string
  explanationMd: string
  examples: RawGrammarExample[]
  supplemental: boolean
  line: number
}

export interface RawGrammarLesson {
  lesson: number
  title: string
  line: number
}

export interface RawGrammarFile {
  bookId: string
  lessons: RawGrammarLesson[]
  rows: RawGrammarRow[]
}

export interface RawKanjiExample {
  kind: 'kun' | 'on' | 'special'
  word: string
  reading: string
  meaning: string
}

/** CHƯA có `relatedVocabIds` — việc liên kết sang từ vựng thuộc Phase 2 (enrich). */
export interface RawKanjiRow {
  chapter: number | 'appendix'
  char: string
  strokes: number
  kun: string[]
  on: string[]
  hanViet: string
  meaning: string
  examples: RawKanjiExample[]
  line: number
}

export interface RawKanjiChapter {
  chapter: number | 'appendix'
  title: string
  declaredCount?: number
  line: number
}

export interface RawKanjiFile {
  bookId: string
  chapters: RawKanjiChapter[]
  rows: RawKanjiRow[]
}
