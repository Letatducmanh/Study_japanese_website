import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { load as loadYaml } from 'js-yaml'
import type {
  GrammarPoint,
  KanjiItem,
  Pos,
  VocabItem,
} from '../../src/domain/types.ts'
import {
  grammarPointSchema,
  kanjiItemSchema,
  manifestSchema,
  vocabItemSchema,
} from '../../src/domain/schemas.ts'
import type { Manifest } from '../../src/domain/types.ts'
import {
  buildEnrichMaps,
  createEnrichReport,
  enrichGrammarRow,
  enrichKanjiRow,
  enrichVocabRow,
  linkRelatedVocab,
} from './enrich.ts'
import { ContentIssueCollector, formatIssue } from './errors.ts'
import { loadIdAliases } from './ids.ts'
import { loadPosOverrides, loadVerbGroupOverrides } from './overrides.ts'
import { parseGrammarFile } from './parse-grammar.ts'
import { parseKanjiFile } from './parse-kanji.ts'
import { parseVocabFile } from './parse-vocab.ts'
import type { RawGrammarFile, RawKanjiFile, RawVocabFile } from './raw-types.ts'
import {
  validateGrammar,
  validateKanji,
  validateKanjiCoverage,
  validateVocab,
} from './validate-rules.ts'

const pad2 = (n: number) => String(n).padStart(2, '0')

interface ParsedBook {
  bookId: string
  levelTitle: string
  vocab?: RawVocabFile
  grammar?: RawGrammarFile
  kanji?: RawKanjiFile
  enrichedVocab: VocabItem[]
  enrichedGrammar: GrammarPoint[]
  enrichedKanji: KanjiItem[]
}

export interface PipelineOptions {
  contentDir: string
  outDir: string
  write: boolean
}

export interface PipelineSummary {
  books: {
    bookId: string
    vocabMain: number
    vocabExtended: number
    grammar: number
    kanji: number
  }[]
  posCounts: Record<Pos, number>
  verbGroupOverridesApplied: string[]
}

export interface PipelineResult {
  issues: ContentIssueCollector
  summary: PipelineSummary
}

export function runContentPipeline(options: PipelineOptions): PipelineResult {
  const { contentDir, outDir, write } = options
  const issues = new ContentIssueCollector()
  const manifestPath = join(contentDir, 'manifest.yaml')

  let manifest: Manifest | undefined
  try {
    const raw = loadYaml(readFileSync(manifestPath, 'utf-8'))
    manifest = manifestSchema.parse(raw) as Manifest
  } catch (err) {
    issues.error(
      manifestPath,
      `manifest.yaml không hợp lệ: ${(err as Error).message}`,
    )
  }

  const enrichReport = createEnrichReport()
  const summary: PipelineSummary = {
    books: [],
    posCounts: enrichReport.posCounts,
    verbGroupOverridesApplied: enrichReport.verbGroupOverridesApplied,
  }
  if (!manifest) return { issues, summary }

  const posOverridesPath = join(contentDir, 'overrides', 'pos.yaml')
  const verbGroupOverridesPath = join(
    contentDir,
    'overrides',
    'verb-groups.yaml',
  )
  const enrichMaps = buildEnrichMaps(
    loadPosOverrides(posOverridesPath),
    loadVerbGroupOverrides(verbGroupOverridesPath),
  )

  const parsedBooks: ParsedBook[] = []

  for (const level of manifest.levels) {
    for (const book of level.books) {
      const parsed: ParsedBook = {
        bookId: book.id,
        levelTitle: level.title,
        enrichedVocab: [],
        enrichedGrammar: [],
        enrichedKanji: [],
      }

      if (book.sources.vocab) {
        parsed.vocab = parseVocabFile(
          join(contentDir, book.sources.vocab),
          book.id,
          issues,
        )
      }
      if (book.sources.grammar) {
        parsed.grammar = parseGrammarFile(
          join(contentDir, book.sources.grammar),
          book.id,
          issues,
        )
      }
      if (book.sources.kanji) {
        parsed.kanji = parseKanjiFile(
          join(contentDir, book.sources.kanji),
          book.id,
          issues,
        )
      }

      if (parsed.vocab)
        validateVocab(
          join(contentDir, book.sources.vocab!),
          parsed.vocab,
          issues,
        )
      if (parsed.grammar)
        validateGrammar(
          join(contentDir, book.sources.grammar!),
          parsed.grammar,
          issues,
        )
      if (parsed.kanji)
        validateKanji(
          join(contentDir, book.sources.kanji!),
          parsed.kanji,
          issues,
        )

      if (parsed.vocab && parsed.grammar) {
        const grammarLessons = new Map(
          parsed.grammar.lessons.map((l) => [l.lesson, l.title]),
        )
        for (const vl of parsed.vocab.lessons) {
          const gTitle = grammarLessons.get(vl.lesson)
          if (gTitle && gTitle !== vl.title) {
            issues.warning(
              join(contentDir, book.sources.grammar!),
              `Bài ${vl.lesson}: tiêu đề khác với vocab.md ("${gTitle}" ≠ "${vl.title}").`,
            )
          }
        }
      }

      if (parsed.vocab) {
        const filePath = join(contentDir, book.sources.vocab!)
        parsed.enrichedVocab = parsed.vocab.rows.map((row) =>
          enrichVocabRow(
            book.id,
            row,
            enrichMaps,
            enrichReport,
            issues,
            filePath,
          ),
        )
      }
      if (parsed.grammar) {
        parsed.enrichedGrammar = parsed.grammar.rows.map((row) =>
          enrichGrammarRow(book.id, row),
        )
      }
      if (parsed.kanji) {
        parsed.enrichedKanji = parsed.kanji.rows.map((row) =>
          enrichKanjiRow(book.id, row),
        )
      }

      parsedBooks.push(parsed)

      summary.books.push({
        bookId: book.id,
        vocabMain:
          parsed.vocab?.rows.filter((r) => r.section === 'main').length ?? 0,
        vocabExtended:
          parsed.vocab?.rows.filter((r) => r.section === 'extended').length ??
          0,
        grammar: parsed.grammar?.rows.length ?? 0,
        kanji: parsed.kanji?.rows.length ?? 0,
      })
    }

    // Đối chiếu Kanji dùng trong từ vựng với toàn bộ Kanji đã học trong cùng cấp độ.
    const levelBookIds = new Set(level.books.map((b) => b.id))
    const booksInLevel = parsedBooks.filter((b) => levelBookIds.has(b.bookId))
    const levelKanjiRows = booksInLevel.flatMap((b) => b.kanji?.rows ?? [])
    if (levelKanjiRows.length > 0) {
      for (const book of booksInLevel) {
        if (!book.vocab) continue
        const sourceBook = level.books.find((b) => b.id === book.bookId)
        if (!sourceBook?.sources.vocab) continue
        validateKanjiCoverage(
          join(contentDir, sourceBook.sources.vocab),
          book.vocab,
          { bookId: '*', chapters: [], rows: levelKanjiRows },
          issues,
        )
      }
    }

    // Liên kết Kanji ↔ từ vựng trong cùng cấp độ (mục 6.3 bước 4).
    const levelVocab = booksInLevel.flatMap((b) => b.enrichedVocab)
    const levelKanji = booksInLevel.flatMap((b) => b.enrichedKanji)
    linkRelatedVocab(levelKanji, levelVocab)
  }

  if (issues.hasErrors || !write) {
    return { issues, summary }
  }

  mkdirSync(outDir, { recursive: true })
  writeFileSync(
    join(outDir, 'manifest.json'),
    JSON.stringify(manifest, null, 2),
  )

  const idAliasesPath = join(contentDir, 'overrides', 'id-aliases.yaml')
  try {
    const aliases = loadIdAliases(idAliasesPath)
    writeFileSync(
      join(outDir, 'id-aliases.json'),
      JSON.stringify(aliases, null, 2),
    )
  } catch (err) {
    issues.warning(
      idAliasesPath,
      `Không đọc được id-aliases.yaml: ${(err as Error).message}`,
    )
  }

  for (const book of parsedBooks) {
    const bookDir = join(outDir, book.bookId)
    mkdirSync(bookDir, { recursive: true })

    if (book.vocab || book.grammar) {
      const lessonNumbers = new Set<number>([
        ...(book.vocab?.lessons.map((l) => l.lesson) ?? []),
        ...(book.grammar?.lessons.map((l) => l.lesson) ?? []),
      ])

      const indexLessons = [...lessonNumbers]
        .sort((a, b) => a - b)
        .map((lesson) => {
          const title =
            book.vocab?.lessons.find((l) => l.lesson === lesson)?.title ??
            book.grammar?.lessons.find((l) => l.lesson === lesson)?.title ??
            ''
          const vocab = book.enrichedVocab.filter((v) => v.lesson === lesson)
          const grammar = book.enrichedGrammar.filter(
            (g) => g.lesson === lesson,
          )

          for (const item of vocab)
            validateAgainstSchema(vocabItemSchema, item, issues, bookDir)
          for (const item of grammar)
            validateAgainstSchema(grammarPointSchema, item, issues, bookDir)

          writeFileSync(
            join(bookDir, `l${pad2(lesson)}.json`),
            JSON.stringify(
              { bookId: book.bookId, lesson, title, vocab, grammar },
              null,
              2,
            ),
          )

          return {
            lesson,
            title,
            vocabCount: vocab.length,
            mainVocabCount: vocab.filter((v) => v.section === 'main').length,
            grammarCount: grammar.length,
            kanjiCount: 0,
          }
        })

      writeFileSync(
        join(bookDir, 'index.json'),
        JSON.stringify(
          {
            bookId: book.bookId,
            title: book.levelTitle,
            type: 'textbook',
            lessons: indexLessons,
          },
          null,
          2,
        ),
      )
    }

    if (book.kanji) {
      const indexLessons = book.kanji.chapters.map((chapter) => {
        const kanji = book.enrichedKanji.filter(
          (k) => k.chapter === chapter.chapter,
        )
        for (const item of kanji)
          validateAgainstSchema(kanjiItemSchema, item, issues, bookDir)

        const fileName =
          chapter.chapter === 'appendix'
            ? 'appendix.json'
            : `ch${pad2(chapter.chapter)}.json`

        writeFileSync(
          join(bookDir, fileName),
          JSON.stringify(
            {
              bookId: book.bookId,
              chapter: chapter.chapter,
              title: chapter.title,
              kanji,
            },
            null,
            2,
          ),
        )

        return {
          lesson: chapter.chapter,
          title: chapter.title,
          vocabCount: 0,
          mainVocabCount: 0,
          grammarCount: 0,
          kanjiCount: kanji.length,
        }
      })

      writeFileSync(
        join(bookDir, 'index.json'),
        JSON.stringify(
          {
            bookId: book.bookId,
            title: book.levelTitle,
            type: 'kanji',
            lessons: indexLessons,
          },
          null,
          2,
        ),
      )
    }
  }

  writeReport(join(dirname(contentDir), 'content-report.md'), summary, issues)

  return { issues, summary }
}

function validateAgainstSchema(
  schema: { parse: (value: unknown) => unknown },
  value: unknown,
  issues: ContentIssueCollector,
  bookDir: string,
): void {
  try {
    schema.parse(value)
  } catch (err) {
    issues.error(
      bookDir,
      `Dữ liệu sau enrich không khớp schema: ${(err as Error).message}`,
    )
  }
}

function writeReport(
  path: string,
  summary: PipelineSummary,
  issues: ContentIssueCollector,
): void {
  const lines: string[] = ['# Báo cáo nội dung', '']
  for (const book of summary.books) {
    lines.push(`## ${book.bookId}`)
    lines.push(`- Từ vựng chính: ${book.vocabMain}`)
    lines.push(`- Từ vựng mở rộng: ${book.vocabExtended}`)
    lines.push(`- Mẫu ngữ pháp: ${book.grammar}`)
    lines.push(`- Kanji: ${book.kanji}`)
    lines.push('')
  }

  lines.push('## Từ vựng theo từ loại (pos)', '')
  for (const [pos, count] of Object.entries(summary.posCounts)) {
    if (count > 0) lines.push(`- ${pos}: ${count}`)
  }
  lines.push('')

  if (summary.verbGroupOverridesApplied.length > 0) {
    lines.push('## Động từ đã sửa nhóm bằng overrides/verb-groups.yaml', '')
    for (const entry of summary.verbGroupOverridesApplied)
      lines.push(`- ${entry}`)
    lines.push('')
  }

  if (issues.warnings.length > 0) {
    lines.push('## Cảnh báo', '')
    for (const issue of issues.warnings) lines.push(`- ${formatIssue(issue)}`)
    lines.push('')
  }

  if (issues.errors.length > 0) {
    lines.push('## Lỗi', '')
    for (const issue of issues.errors) lines.push(`- ${formatIssue(issue)}`)
    lines.push('')
  }

  writeFileSync(path, lines.join('\n'))
}
