import { afterEach, describe, expect, it } from 'vitest'
import { clearRegistry, register } from '@/domain/quiz/registry'
import { buildComprehensiveSession, buildSession } from './session'
import type { QuestionType, QuizItem } from '@/domain/quiz/registry'
import type { GrammarPoint, KanjiItem, VocabItem } from '@/domain/types'

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

function makeGrammar(id: string): GrammarPoint {
  return {
    id,
    bookId: 'mnn1',
    lesson: 1,
    order: 1,
    title: 't',
    meaning: '',
    explanationMd: '',
    supplemental: false,
    examples: [],
  }
}

function makeKanji(id: string): KanjiItem {
  return {
    id,
    bookId: 'kanji-master-n5',
    chapter: 1,
    char: id,
    strokes: 1,
    kun: [],
    on: [],
    hanViet: '',
    meaning: '',
    examples: [],
    relatedVocabIds: [],
  }
}

describe('buildComprehensiveSession', () => {
  afterEach(() => clearRegistry())

  it('trộn đúng tỉ lệ từ vựng/ngữ pháp/Kanji theo loại mục dẫn', () => {
    register({ ...fakeQuestionType, id: 'fake-vocab', itemType: 'vocab' })
    register({ ...fakeQuestionType, id: 'fake-grammar', itemType: 'grammar' })
    register({ ...fakeQuestionType, id: 'fake-kanji', itemType: 'kanji' })

    const vocabItems = Array.from({ length: 10 }, (_, i) => makeVocab(`v${i}`))
    const grammarItems = Array.from({ length: 10 }, (_, i) => makeGrammar(`g${i}`))
    const kanjiItems = Array.from({ length: 10 }, (_, i) => makeKanji(`k${i}`))

    const session = buildComprehensiveSession({
      vocabItems,
      grammarItems,
      kanjiItems,
      ratio: { vocab: 50, grammar: 30, kanji: 20 },
      questionCount: 20,
      seed: 1,
    })

    expect(session.questions).toHaveLength(20)
    const byType = { vocab: 0, grammar: 0, kanji: 0 } as Record<string, number>
    for (const q of session.questions) byType[q.questionType.itemType]++
    expect(byType.vocab).toBe(10)
    expect(byType.grammar).toBe(6)
    expect(byType.kanji).toBe(4)
  })
})
