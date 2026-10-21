export type LevelId = 'N5' | 'N4' | 'N3' | 'N2' | 'N1'
export type Edition = 'old' | 'new'
export type Pos =
  | 'noun'
  | 'verb'
  | 'i-adj'
  | 'na-adj'
  | 'adverb'
  | 'expression'
  | 'counter'
  | 'affix'
  | 'other'
export type VerbGroup = 1 | 2 | 3
export type Skill =
  | 'recognition'
  | 'meaning'
  | 'recall'
  | 'reading'
  | 'listening'
  | 'writing'
  | 'usage'
  | 'particle'
  | 'grammar'
  | 'conjugation'
  | 'kanji-on'
  | 'kanji-kun'
  | 'kanji-meaning'

export interface VocabAnswers {
  kana: string[]
  kanji: string[]
  meaning: string[]
}

export interface VocabItem {
  id: string
  bookId: string
  lesson: number
  section: 'main' | 'extended'
  sectionTitle?: string
  kana: string
  kanji: string | null
  romaji: string
  meaning: string
  note?: string
  edition?: Edition
  pos: Pos
  verbGroup?: VerbGroup
  answers: VocabAnswers
  kanjiChars: string[]
  homographKey: string
}

export interface GrammarExample {
  jp: string
  romaji: string
  vi: string
  chunks: string[]
}

export interface GrammarPoint {
  id: string
  bookId: string
  lesson: number
  order: number
  title: string
  meaning: string
  explanationMd: string
  examples: GrammarExample[]
  supplemental: boolean
}

export interface KanjiExample {
  kind: 'kun' | 'on' | 'special'
  word: string
  reading: string
  meaning: string
}

export interface KanjiItem {
  id: string
  bookId: string
  chapter: number | 'appendix'
  char: string
  strokes: number
  kun: string[]
  on: string[]
  hanViet: string
  meaning: string
  examples: KanjiExample[]
  relatedVocabIds: string[]
}

export interface Attempt {
  id?: number
  itemId: string
  itemType: 'vocab' | 'grammar' | 'kanji'
  skill: Skill
  mode: string
  correct: boolean
  responseMs: number
  given?: string
  expected?: string
  sessionId: string
  ts: number
}

export interface Mastery {
  itemId: string
  skill: Skill
  score: number
  attempts: number
  streak: number
  lastTs: number
}

// --- content/manifest.yaml ---

export type BookType = 'textbook' | 'kanji'
export type EditionFilter = 'all' | Edition

export interface ManifestBookSources {
  vocab?: string
  grammar?: string
  kanji?: string
}

export interface ManifestBook {
  id: string
  title: string
  type: BookType
  lessonLabel: string
  lessonRange?: [number, number]
  sources: ManifestBookSources
  editions?: Edition[]
  defaultEdition?: Edition
  editionFilterDefault?: EditionFilter
}

export interface ManifestLevel {
  id: LevelId
  title: string
  order: number
  books: ManifestBook[]
}

export interface Manifest {
  schemaVersion: number
  levels: ManifestLevel[]
}

// --- public/content/**/*.json (output của pipeline build) ---

export interface LessonFile {
  bookId: string
  lesson: number
  title: string
  vocab: VocabItem[]
  grammar: GrammarPoint[]
}

export interface KanjiChapterFile {
  bookId: string
  chapter: number | 'appendix'
  title: string
  kanji: KanjiItem[]
}

export interface BookLessonSummary {
  lesson: number | 'appendix'
  title: string
  vocabCount: number
  grammarCount: number
  kanjiCount: number
}

export interface BookIndexFile {
  bookId: string
  title: string
  type: BookType
  lessons: BookLessonSummary[]
}
