import { gradeTyped } from '@/domain/quiz/grading'
import { isVocabItem, register, type QuestionType } from '@/domain/quiz/registry'
import { vi } from '@/i18n/vi'
import { DictationComponent } from './DictationComponent'
import type { DictationQuestion } from './types'
import type { VocabItem } from '@/domain/types'

export const dictationQuestionType: QuestionType<DictationQuestion> = {
  id: 'dictation',
  label: vi.dictation.label,
  itemType: 'vocab',
  skill: 'listening',
  isEligible: (item) => isVocabItem(item),
  generate: (item) => ({ item: item as VocabItem }),
  grade: (question, answer) => {
    const given = typeof answer === 'string' ? answer : ''
    const { correct } = gradeTyped(given, question.item.answers.kana)
    return { correct, expected: question.item.kana, given }
  },
  Component: DictationComponent,
}

register(dictationQuestionType)
