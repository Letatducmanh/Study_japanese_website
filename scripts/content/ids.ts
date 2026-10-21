import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { load as loadYaml } from 'js-yaml'
import { idAliasesSchema } from '../../src/domain/schemas.ts'

/** Mục 6.2: ID ổn định dựa trên hash8(nội dung xác định danh tính mục). */
export function hash8(input: string): string {
  return createHash('sha256').update(input).digest('hex').slice(0, 8)
}

export function vocabId(
  bookId: string,
  lesson: number,
  kana: string,
  kanji: string | null,
): string {
  const lessonPart = String(lesson).padStart(2, '0')
  const h = hash8(`${kana}|${kanji ?? ''}`)
  return `${bookId}-l${lessonPart}-${h}`
}

export function grammarId(
  bookId: string,
  lesson: number,
  title: string,
): string {
  const lessonPart = String(lesson).padStart(2, '0')
  const normalizedTitle = title.replace(/\s*\*\(bổ sung\)\*\s*$/u, '').trim()
  const h = hash8(normalizedTitle)
  return `${bookId}-l${lessonPart}-g-${h}`
}

export function kanjiId(char: string): string {
  return `kanji-${char}`
}

/** content/overrides/id-aliases.yaml: "id cũ" -> "id mới", dùng để migrate tiến độ khi ID đổi. */
export function loadIdAliases(filePath: string): Record<string, string> {
  const raw = loadYaml(readFileSync(filePath, 'utf-8')) ?? {}
  return idAliasesSchema.parse(raw)
}
