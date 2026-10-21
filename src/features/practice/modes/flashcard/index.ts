import { register, type QuestionType } from '@/domain/quiz/registry'
import { FlashcardComponent } from './FlashcardComponent'
import type { FlashcardQuestion, FlashcardRating } from './types'
import type { VocabItem } from '@/domain/types'

function isVocabItem(item: unknown): item is VocabItem {
  return typeof item === 'object' && item !== null && 'kanjiChars' in item
}

export const flashcardQuestionType: QuestionType<FlashcardQuestion> = {
  id: 'flashcard',
  label: 'Flashcard',
  itemType: 'vocab',
  skill: 'recognition',
  isEligible: (item) => isVocabItem(item),
  generate: (item) => ({ item: item as VocabItem }),
  grade: (question, answer) => ({
    correct: (answer as FlashcardRating) !== 'forgot',
    expected: question.item.meaning,
  }),
  Component: FlashcardComponent,
}

register(flashcardQuestionType)
