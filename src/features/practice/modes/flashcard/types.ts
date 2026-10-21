import type { VocabItem } from '@/domain/types'

export type FlashcardFace = 'kana' | 'kanji' | 'meaning'
export type FlashcardRating = 'forgot' | 'hard' | 'good' | 'easy'

export interface FlashcardQuestion {
  item: VocabItem
}
