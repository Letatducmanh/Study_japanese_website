import { TextChoiceCard } from '@/ui/quiz/TextChoiceCard'
import {
  conjugateSafe,
  isConjugatableVerb,
  CONJUGATION_FORMS,
  type ConjugationForm,
} from '@/domain/quiz/conjugation-prompt'
import {
  isVocabItem,
  register,
  type QuestionType,
  type QuizItem,
} from '@/domain/quiz/registry'
import { shuffle } from '@/lib/rng'
import { vi } from '@/i18n/vi'
import type { ConjugationMcqChoice, ConjugationMcqQuestion } from './types'
import type { VocabItem } from '@/domain/types'

const FORM_LABEL: Record<ConjugationForm, string> = {
  te: vi.conjugation.formTe,
  ta: vi.conjugation.formTa,
  nai: vi.conjugation.formNai,
  dictionary: vi.conjugation.formDictionary,
}

export const conjugationMcqQuestionType: QuestionType<ConjugationMcqQuestion> =
  {
    id: 'conjugation-mcq',
    label: vi.conjugation.labelMcq,
    itemType: 'vocab',
    skill: 'conjugation',
    isEligible: (item: QuizItem, ctx) => {
      if (!isVocabItem(item) || !isConjugatableVerb(item)) return false
      const otherVerbs = ctx.pool
        .filter(isVocabItem)
        .filter((v) => v.id !== item.id && isConjugatableVerb(v))
      return otherVerbs.length >= 3
    },
    generate: (item, pool, rng) => {
      const verb = item as VocabItem
      const form = CONJUGATION_FORMS[Math.floor(rng() * CONJUGATION_FORMS.length)]
      const correct = conjugateSafe(verb, form) ?? verb.kana

      const otherForms = pool
        .filter(isVocabItem)
        .filter((v) => v.id !== verb.id)
        .map((v) => conjugateSafe(v, form))
        .filter((v): v is string => v !== null && v !== correct)
      const distractors = [...new Set(shuffle(otherForms, rng))].slice(0, 3)

      const all = shuffle([correct, ...distractors], rng)
      const choices: ConjugationMcqChoice[] = all.map((text, i) => ({
        id: String(i),
        text,
      }))
      const correctIndex = all.findIndex((t) => t === correct)

      return {
        promptText: verb.kanji ?? verb.kana,
        promptHint: vi.conjugation.promptPrefix(verb.kana, FORM_LABEL[form]),
        choices,
        correctChoiceId: choices[correctIndex].id,
      }
    },
    grade: (question, answer) => {
      const correctChoice = question.choices.find(
        (c) => c.id === question.correctChoiceId,
      )
      const givenChoice = question.choices.find((c) => c.id === answer)
      return {
        correct: answer === question.correctChoiceId,
        expected: correctChoice?.text ?? '',
        given: givenChoice?.text ?? '',
      }
    },
    Component: ({ q, onAnswer }) => (
      <TextChoiceCard
        promptText={q.promptText}
        promptHint={q.promptHint}
        choices={q.choices}
        correctChoiceId={q.correctChoiceId}
        onAnswer={onAnswer}
      />
    ),
  }

register(conjugationMcqQuestionType)
