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
  /** uuid tạo ở máy khách (mục 6.8) — để đồng bộ an toàn ở Phase 11, không dùng số tự tăng. */
  id: string
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

// --- Lưu trữ tiến độ (src/data/progress, mục 6.5-6.7) ---

/** Trạng thái thẻ FSRS, lưu dạng thuần (không phụ thuộc kiểu `Card` nội bộ của ts-fsrs). */
export interface SrsCardState {
  due: number
  stability: number
  difficulty: number
  elapsedDays: number
  scheduledDays: number
  learningSteps: number
  reps: number
  lapses: number
  state: number
  lastReview?: number
}

export interface SrsCardRecord {
  itemId: string
  due: number
  card: SrsCardState
  updatedTs: number
}

export interface MistakeRecord {
  itemId: string
  addedTs: number
  /** Số lần đúng liên tiếp kể từ khi vào sổ; gỡ khỏi sổ khi đạt 3 (mục 3.5). */
  correctStreak: number
}

export interface AppSettings {
  showRomaji: boolean
  showFurigana: boolean
  includeExtended: boolean
  editionFilter: EditionFilter
  ttsRate: number
  defaultQuestionCount: number
  /** Điểm kỷ lục dạng "Đúng/Sai tốc độ" (mục 3.2 dạng 7). */
  speedTrueFalseHighScore: number
}

export interface ProgressExport {
  schemaVersion: number
  exportedAt: number
  attempts: Attempt[]
  mastery: Mastery[]
  srsCards: SrsCardRecord[]
  mistakes: MistakeRecord[]
  settings: AppSettings
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
  /** Số từ vựng *chính* (không gồm mở rộng) — mẫu số tính độ thành thạo bài (mục 6.5). */
  mainVocabCount: number
  grammarCount: number
  kanjiCount: number
}

export interface BookIndexFile {
  bookId: string
  title: string
  type: BookType
  lessons: BookLessonSummary[]
}
