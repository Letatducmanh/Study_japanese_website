import { gradeTyped } from '@/domain/quiz/grading'
import {
  conjugateSafe,
  isConjugatableVerb,
  CONJUGATION_FORMS,
  type ConjugationForm,
} from '@/domain/quiz/conjugation-prompt'
import { isVocabItem, register, type QuestionType } from '@/domain/quiz/registry'
import { vi } from '@/i18n/vi'
import { ConjugationTypingComponent } from './ConjugationTypingComponent'
import type { ConjugationTypingQuestion } from './types'
import type { VocabItem } from '@/domain/types'

const FORM_LABEL: Record<ConjugationForm, string> = {
  te: vi.conjugation.formTe,
  ta: vi.conjugation.formTa,
  nai: vi.conjugation.formNai,
  dictionary: vi.conjugation.formDictionary,
}

export const conjugationTypingQuestionType: QuestionType<ConjugationTypingQuestion> =
  {
    id: 'conjugation-typing',
    label: vi.conjugation.labelTyping,
    itemType: 'vocab',
    skill: 'conjugation',
    isEligible: (item) => isVocabItem(item) && isConjugatableVerb(item),
    generate: (item, _pool, rng) => {
      const verb = item as VocabItem
      const form = CONJUGATION_FORMS[Math.floor(rng() * CONJUGATION_FORMS.length)]
      const correctForm = conjugateSafe(verb, form) ?? verb.kana
      return {
        promptText: verb.kanji ?? verb.kana,
        promptHint: vi.conjugation.promptPrefix(verb.kana, FORM_LABEL[form]),
        correctForm,
      }
    },
    grade: (question, answer) => {
      const given = typeof answer === 'string' ? answer : ''
      const { correct } = gradeTyped(given, [question.correctForm])
      return { correct, expected: question.correctForm, given }
    },
    Component: ConjugationTypingComponent,
  }

register(conjugationTypingQuestionType)
