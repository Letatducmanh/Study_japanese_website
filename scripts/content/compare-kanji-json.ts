// So sánh JSON Kanji đã dựng trước và sau khi sửa parser (spec 002, US3).
// Dùng: npx tsx scripts/content/compare-kanji-json.ts <thư-mục-trước> <thư-mục-sau>
// Chỉ các mục trong DEFAULT_ALLOWED_IDS được khác, và chỉ ở trường hanViet, meaning.
import { readdirSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

export const DEFAULT_ALLOWED_IDS: readonly string[] = ['kanji-行', 'kanji-長']
const ALLOWED_FIELDS: readonly string[] = ['hanViet', 'meaning']

export interface CompareResult {
  ok: boolean
  /** Mã các mục Kanji có khác biệt (đều hợp lệ khi ok). */
  changedIds: string[]
  problems: string[]
}

type Json = unknown
type KanjiItem = Record<string, Json> & { id: string }

function listJson(dir: string): string[] {
  return readdirSync(dir)
    .filter((f) => f.endsWith('.json'))
    .sort()
}

function same(a: Json, b: Json): boolean {
  return JSON.stringify(a) === JSON.stringify(b)
}

function isObject(v: Json): v is Record<string, Json> {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}

function compareFile(
  name: string,
  before: Json,
  after: Json,
  allowedIds: readonly string[],
  changedIds: string[],
  problems: string[],
): void {
  if (!isObject(before) || !isObject(after)) {
    problems.push(`${name}: không phải đối tượng JSON.`)
    return
  }
  const keys = new Set([...Object.keys(before), ...Object.keys(after)])
  for (const key of keys) {
    if (key === 'kanji') continue
    if (!same(before[key], after[key]))
      problems.push(`${name}: trường "${key}" khác (chỉ mục Kanji được phép khác).`)
  }

  const bList = before.kanji
  const aList = after.kanji
  if (!Array.isArray(bList) || !Array.isArray(aList)) {
    if (!same(bList, aList)) problems.push(`${name}: danh sách "kanji" khác.`)
    return
  }
  const bIds = bList.map((i) => (i as KanjiItem).id)
  const aIds = aList.map((i) => (i as KanjiItem).id)
  if (!same(bIds, aIds)) {
    problems.push(`${name}: danh sách mã Kanji khác (thừa/thiếu/đổi thứ tự).`)
    return
  }

  bList.forEach((bItem, index) => {
    const b = bItem as KanjiItem
    const a = aList[index] as KanjiItem
    if (same(b, a)) return
    if (!allowedIds.includes(b.id)) {
      problems.push(`${name}: mục ${b.id} khác nhưng không nằm trong danh sách được phép.`)
      return
    }
    const fields = new Set([...Object.keys(b), ...Object.keys(a)])
    const badFields = [...fields].filter(
      (f) => !same(b[f], a[f]) && !ALLOWED_FIELDS.includes(f),
    )
    if (badFields.length > 0) {
      problems.push(
        `${name}: mục ${b.id} khác ở trường ngoài ${ALLOWED_FIELDS.join('/')}: ${badFields.join(', ')}.`,
      )
      return
    }
    changedIds.push(b.id)
  })
}

export function compareKanjiDirs(
  beforeDir: string,
  afterDir: string,
  allowedIds: readonly string[] = DEFAULT_ALLOWED_IDS,
): CompareResult {
  const problems: string[] = []
  const changedIds: string[] = []
  const bFiles = listJson(beforeDir)
  const aFiles = listJson(afterDir)

  for (const f of bFiles)
    if (!aFiles.includes(f)) problems.push(`${f}: có ở thư mục trước, thiếu ở thư mục sau.`)
  for (const f of aFiles)
    if (!bFiles.includes(f)) problems.push(`${f}: thừa ở thư mục sau.`)

  for (const f of bFiles) {
    if (!aFiles.includes(f)) continue
    const bRaw = readFileSync(join(beforeDir, f))
    const aRaw = readFileSync(join(afterDir, f))
    if (bRaw.equals(aRaw)) continue
    compareFile(
      f,
      JSON.parse(bRaw.toString('utf-8')) as Json,
      JSON.parse(aRaw.toString('utf-8')) as Json,
      allowedIds,
      changedIds,
      problems,
    )
  }

  return { ok: problems.length === 0, changedIds, problems }
}

function main(): void {
  const [beforeDir, afterDir] = process.argv.slice(2)
  if (!beforeDir || !afterDir) {
    console.error(
      'Dùng: npx tsx scripts/content/compare-kanji-json.ts <thư-mục-trước> <thư-mục-sau>',
    )
    process.exit(2)
  }
  const result = compareKanjiDirs(beforeDir, afterDir)
  if (!result.ok) {
    for (const p of result.problems) console.error(`[KHÁC NGOÀI PHẠM VI] ${p}`)
    process.exit(1)
  }
  if (result.changedIds.length === 0) console.log('OK: không có khác biệt')
  else console.log(`OK: chỉ ${result.changedIds.join(', ')} khác`)
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main()
}
