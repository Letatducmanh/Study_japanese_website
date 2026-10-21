import { isVocabItem, register, type QuestionType } from '@/domain/quiz/registry'
import { vi } from '@/i18n/vi'
import { SpeedTrueFalseComponent } from './SpeedTrueFalseComponent'
import type { SpeedTrueFalseQuestion } from './types'

export const speedTrueFalseQuestionType: QuestionType<SpeedTrueFalseQuestion> =
  {
    id: 'speed-truefalse',
    label: vi.speedTrueFalse.label,
    itemType: 'vocab',
    skill: 'meaning',
    isEligible: (item, ctx) =>
      isVocabItem(item) && ctx.pool.filter(isVocabItem).length >= 2,
    generate: (_item, pool) => ({ pool: pool.filter(isVocabItem) }),
    grade: (_question, answer) => {
      const score = answer as number
      return {
        correct: true,
        expected: vi.speedTrueFalse.label,
        given: vi.speedTrueFalse.scoreLabel(score),
      }
    },
    Component: SpeedTrueFalseComponent,
  }

register(speedTrueFalseQuestionType)
