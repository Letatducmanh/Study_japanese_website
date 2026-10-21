import {
  isVocabItem,
  register,
  type QuestionType,
} from '@/domain/quiz/registry'
import { vi } from '@/i18n/vi'
import { FlashcardComponent } from './FlashcardComponent'
import type { FlashcardQuestion, FlashcardRating } from './types'
import type { VocabItem } from '@/domain/types'

const RATING_LABEL: Record<FlashcardRating, string> = {
  forgot: vi.flashcard.ratingForgot,
  hard: vi.flashcard.ratingHard,
  good: vi.flashcard.ratingGood,
  easy: vi.flashcard.ratingEasy,
}

export const flashcardQuestionType: QuestionType<FlashcardQuestion> = {
  id: 'flashcard',
  label: 'Flashcard',
  itemType: 'vocab',
  skill: 'recognition',
  isEligible: (item) => isVocabItem(item),
  generate: (item) => ({ item: item as VocabItem }),
  grade: (question, answer) => {
    const rating = answer as FlashcardRating
    return {
      correct: rating !== 'forgot',
      expected: question.item.meaning,
      given: RATING_LABEL[rating],
    }
  },
  Component: FlashcardComponent,
}

register(flashcardQuestionType)
