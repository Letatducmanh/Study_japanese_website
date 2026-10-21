import { toDictionary, toNai, toTa, toTe } from '@/domain/conjugation'
import type { VocabItem } from '@/domain/types'

export type ConjugationForm = 'te' | 'ta' | 'nai' | 'dictionary'

export const CONJUGATION_FORMS: ConjugationForm[] = [
  'te',
  'ta',
  'nai',
  'dictionary',
]

/** Chia `item` sang `form`; trả `null` nếu không phải động từ hoặc engine chia không nhận dạng được. */
export function conjugateSafe(
  item: VocabItem,
  form: ConjugationForm,
): string | null {
  if (item.pos !== 'verb' || !item.verbGroup) return null
  try {
    switch (form) {
      case 'te':
        return toTe(item.kana, item.verbGroup)
      case 'ta':
        return toTa(item.kana, item.verbGroup)
      case 'nai':
        return toNai(item.kana, item.verbGroup)
      case 'dictionary':
        return toDictionary(item.kana, item.verbGroup)
    }
  } catch {
    return null
  }
}

export function isConjugatableVerb(item: VocabItem): boolean {
  return CONJUGATION_FORMS.some((f) => conjugateSafe(item, f) !== null)
}
