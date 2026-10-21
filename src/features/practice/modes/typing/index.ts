import { gradeTyped } from '@/domain/quiz/grading'
import { isVocabItem, register, type QuestionType } from '@/domain/quiz/registry'
import { vi } from '@/i18n/vi'
import { TypingComponent } from './TypingComponent'
import type { TypingQuestion } from './types'
import type { VocabItem } from '@/domain/types'

export const typingQuestionType: QuestionType<TypingQuestion> = {
  id: 'typing',
  label: vi.typing.label,
  itemType: 'vocab',
  skill: 'writing',
  isEligible: (item) => isVocabItem(item),
  generate: (item) => ({ item: item as VocabItem }),
  grade: (question, answer) => {
    const given = typeof answer === 'string' ? answer : ''
    const accepted = [
      ...question.item.answers.kana,
      ...question.item.answers.kanji,
    ]
    const { correct } = gradeTyped(given, accepted)
    return {
      correct,
      expected: question.item.kanji ?? question.item.kana,
      given,
    }
  },
  Component: TypingComponent,
}

register(typingQuestionType)
