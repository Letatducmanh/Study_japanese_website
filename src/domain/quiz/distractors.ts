import { shuffle, type Rng } from '@/lib/rng'
import { stripDiacritics } from '@/lib/normalize'
import type { VocabItem } from '@/domain/types'

export type DistractorField = 'meaning' | 'kana' | 'kanji' | 'romaji'

export interface DistractorOptions {
  field: DistractorField
  count: number
}

const LESSON_MATCH_SCORE = 3
const LESSON_NEAR_SCORE = 1
const LESSON_NEAR_RANGE = 2
const POS_MATCH_SCORE = 2
const MAX_LENGTH_SCORE = 2

function fieldValue(item: VocabItem, field: DistractorField): string {
  switch (field) {
    case 'meaning':
      return item.meaning
    case 'kana':
      return item.kana
    case 'kanji':
      return item.kanji ?? ''
    case 'romaji':
      return item.romaji
  }
}

function normalize(text: string): string {
  return stripDiacritics(text.trim())
}

function score(correct: VocabItem, candidate: VocabItem): number {
  let total = 0
  if (candidate.lesson === correct.lesson) total += LESSON_MATCH_SCORE
  else if (Math.abs(candidate.lesson - correct.lesson) <= LESSON_NEAR_RANGE) {
    total += LESSON_NEAR_SCORE
  }
  if (candidate.pos === correct.pos) total += POS_MATCH_SCORE
  const lengthDiff = Math.abs(candidate.kana.length - correct.kana.length)
  total += Math.max(0, MAX_LENGTH_SCORE - lengthDiff)
  return total
}

/**
 * Chọn đáp án nhiễu cho `correct` từ `pool` (mục 6.4): ưu tiên cùng bài/gần bài, cùng từ
 * loại, độ dài gần nhau; loại từ cùng âm (homograph) hoặc cùng nghĩa với đáp án đúng.
 */
export function pickDistractors(
  correct: VocabItem,
  pool: VocabItem[],
  options: DistractorOptions,
  rng: Rng,
): VocabItem[] {
  const correctValue = normalize(fieldValue(correct, options.field))
  const correctMeaning = normalize(correct.meaning)

  const candidates = pool.filter((item) => {
    if (item.id === correct.id) return false
    if (item.bookId !== correct.bookId) return false
    if (item.homographKey === correct.homographKey) return false
    const value = fieldValue(item, options.field)
    if (!value) return false
    if (normalize(value) === correctValue) return false
    if (normalize(item.meaning) === correctMeaning) return false
    return true
  })

  const byScore = new Map<number, VocabItem[]>()
  for (const item of candidates) {
    const s = score(correct, item)
    const bucket = byScore.get(s) ?? []
    bucket.push(item)
    byScore.set(s, bucket)
  }

  const result: VocabItem[] = []
  for (const s of [...byScore.keys()].sort((a, b) => b - a)) {
    if (result.length >= options.count) break
    const bucket = byScore.get(s)
    if (!bucket) continue
    for (const item of shuffle(bucket, rng)) {
      if (result.length >= options.count) break
      result.push(item)
    }
  }
  return result
}
