import { z } from 'zod'

export const levelIdSchema = z.enum(['N5', 'N4', 'N3', 'N2', 'N1'])
export const editionSchema = z.enum(['old', 'new'])
export const posSchema = z.enum([
  'noun',
  'verb',
  'i-adj',
  'na-adj',
  'adverb',
  'expression',
  'counter',
  'affix',
  'other',
])
export const verbGroupSchema = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
])
export const skillSchema = z.enum([
  'recognition',
  'meaning',
  'recall',
  'reading',
  'listening',
  'writing',
  'usage',
  'particle',
  'grammar',
  'conjugation',
  'kanji-on',
  'kanji-kun',
  'kanji-meaning',
])

export const vocabAnswersSchema = z.object({
  kana: z.array(z.string()),
  kanji: z.array(z.string()),
  meaning: z.array(z.string()),
})

export const vocabItemSchema = z.object({
  id: z.string().min(1),
  bookId: z.string().min(1),
  lesson: z.number().int().positive(),
  section: z.enum(['main', 'extended']),
  sectionTitle: z.string().optional(),
  kana: z.string().min(1),
  kanji: z.string().nullable(),
  romaji: z.string().min(1),
  meaning: z.string().min(1),
  note: z.string().optional(),
  edition: editionSchema.optional(),
  pos: posSchema,
  verbGroup: verbGroupSchema.optional(),
  answers: vocabAnswersSchema,
  kanjiChars: z.array(z.string()),
  homographKey: z.string().min(1),
})

export const grammarExampleSchema = z.object({
  jp: z.string().min(1),
  romaji: z.string().min(1),
  vi: z.string().min(1),
  chunks: z.array(z.string()),
})

export const grammarPointSchema = z.object({
  id: z.string().min(1),
  bookId: z.string().min(1),
  lesson: z.number().int().positive(),
  order: z.number().int().positive(),
  title: z.string().min(1),
  meaning: z.string().min(1),
  explanationMd: z.string().min(1),
  examples: z.array(grammarExampleSchema),
  supplemental: z.boolean(),
})

export const kanjiExampleSchema = z.object({
  kind: z.enum(['kun', 'on', 'special']),
  word: z.string().min(1),
  reading: z.string().min(1),
  meaning: z.string().min(1),
})

export const kanjiItemSchema = z.object({
  id: z.string().min(1),
  bookId: z.string().min(1),
  chapter: z.union([z.number().int().positive(), z.literal('appendix')]),
  char: z.string().length(1),
  strokes: z.number().int().positive(),
  kun: z.array(z.string()),
  on: z.array(z.string()),
  hanViet: z.string().min(1),
  meaning: z.string().min(1),
  examples: z.array(kanjiExampleSchema),
  relatedVocabIds: z.array(z.string()),
})

export const attemptSchema = z.object({
  id: z.number().int().optional(),
  itemId: z.string().min(1),
  itemType: z.enum(['vocab', 'grammar', 'kanji']),
  skill: skillSchema,
  mode: z.string().min(1),
  correct: z.boolean(),
  responseMs: z.number().nonnegative(),
  given: z.string().optional(),
  expected: z.string().optional(),
  sessionId: z.string().min(1),
  ts: z.number().int().nonnegative(),
})

export const masterySchema = z.object({
  itemId: z.string().min(1),
  skill: skillSchema,
  score: z.number().min(0).max(1),
  attempts: z.number().int().nonnegative(),
  streak: z.number().int().nonnegative(),
  lastTs: z.number().int().nonnegative(),
})

// --- content/manifest.yaml ---

export const manifestBookSourcesSchema = z.object({
  vocab: z.string().optional(),
  grammar: z.string().optional(),
  kanji: z.string().optional(),
})

export const manifestBookSchema = z.object({
  id: z
    .string()
    .regex(/^[a-z0-9-]+$/, 'id phải là chữ thường, số, dấu gạch ngang'),
  title: z.string().min(1),
  type: z.enum(['textbook', 'kanji']),
  lessonLabel: z.string().min(1),
  lessonRange: z
    .tuple([z.number().int().positive(), z.number().int().positive()])
    .optional(),
  sources: manifestBookSourcesSchema,
  editions: z.array(editionSchema).optional(),
  defaultEdition: editionSchema.optional(),
  editionFilterDefault: z.union([z.literal('all'), editionSchema]).optional(),
})

export const manifestLevelSchema = z.object({
  id: levelIdSchema,
  title: z.string().min(1),
  order: z.number().int().positive(),
  books: z.array(manifestBookSchema).min(1),
})

export const manifestSchema = z.object({
  schemaVersion: z.number().int().positive(),
  levels: z.array(manifestLevelSchema).min(1),
})

// --- public/content/**/*.json ---

export const lessonFileSchema = z.object({
  bookId: z.string().min(1),
  lesson: z.number().int().positive(),
  title: z.string(),
  vocab: z.array(vocabItemSchema),
  grammar: z.array(grammarPointSchema),
})

export const kanjiChapterFileSchema = z.object({
  bookId: z.string().min(1),
  chapter: z.union([z.number().int().positive(), z.literal('appendix')]),
  title: z.string(),
  kanji: z.array(kanjiItemSchema),
})

export const bookLessonSummarySchema = z.object({
  lesson: z.union([z.number().int().positive(), z.literal('appendix')]),
  title: z.string(),
  vocabCount: z.number().int().nonnegative(),
  grammarCount: z.number().int().nonnegative(),
  kanjiCount: z.number().int().nonnegative(),
})

export const bookIndexFileSchema = z.object({
  bookId: z.string().min(1),
  title: z.string(),
  type: z.enum(['textbook', 'kanji']),
  lessons: z.array(bookLessonSummarySchema),
})

// --- content/overrides/*.yaml ---

export const verbGroupOverrideSchema = z.object({
  kana: z.string().min(1),
  kanji: z.string().min(1),
  group: verbGroupSchema,
})
export const verbGroupOverridesSchema = z.array(verbGroupOverrideSchema)

export const posOverrideSchema = z.object({
  kana: z.string().min(1),
  pos: posSchema,
})
export const posOverridesSchema = z.array(posOverrideSchema)

export const idAliasesSchema = z.record(z.string(), z.string())
