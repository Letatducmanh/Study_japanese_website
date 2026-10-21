import { describe, expect, it } from 'vitest'
import { buildSession } from './session'
import type { QuestionType, QuizItem } from '@/domain/quiz/registry'
import type { VocabItem } from '@/domain/types'

function makeVocab(id: string): VocabItem {
  return {
    id,
    bookId: 'mnn1',
    lesson: 1,
    section: 'main',
    kana: 'わたし',
    kanji: '私',
    romaji: 'watashi',
    meaning: 'tôi',
    pos: 'noun',
    answers: { kana: ['わたし'], kanji: ['私'], meaning: ['tôi'] },
    kanjiChars: ['私'],
    homographKey: 'わたし',
  }
}

const fakeQuestionType: QuestionType<unknown> = {
  id: 'fake',
  label: 'Fake',
  itemType: 'vocab',
  skill: 'recognition',
  isEligible: () => true,
  generate: (item) => ({ itemId: (item as VocabItem).id }),
  grade: () => ({ correct: true, expected: '' }),
  Component: () => null,
}

const ineligibleQuestionType: QuestionType<unknown> = {
  ...fakeQuestionType,
  id: 'ineligible',
  isEligible: () => false,
}

describe('buildSession', () => {
  const items: QuizItem[] = [makeVocab('a'), makeVocab('b'), makeVocab('c')]

  it('tạo đúng số câu hỏi yêu cầu khi đủ mục', () => {
    const session = buildSession({
      items,
      questionTypes: [fakeQuestionType],
      questionCount: 2,
      seed: 1,
    })
    expect(session.questions).toHaveLength(2)
  })

  it('yêu cầu nhiều hơn số mục có thì trả về tất cả', () => {
    const session = buildSession({
      items,
      questionTypes: [fakeQuestionType],
      questionCount: 10,
      seed: 1,
    })
    expect(session.questions).toHaveLength(3)
  })

  it('bỏ qua dạng không hợp lệ (isEligible = false)', () => {
    const session = buildSession({
      items,
      questionTypes: [ineligibleQuestionType],
      questionCount: 3,
      seed: 1,
    })
    expect(session.questions).toHaveLength(0)
  })

  it('cùng seed cho cùng thứ tự câu hỏi', () => {
    const a = buildSession({
      items,
      questionTypes: [fakeQuestionType],
      questionCount: 3,
      seed: 42,
    })
    const b = buildSession({
      items,
      questionTypes: [fakeQuestionType],
      questionCount: 3,
      seed: 42,
    })
    expect(a.questions.map((q) => q.item.id)).toEqual(
      b.questions.map((q) => q.item.id),
    )
  })
})
