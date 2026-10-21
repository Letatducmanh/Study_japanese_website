import { describe, expect, it } from 'vitest'
import { createRng } from '@/lib/rng'
import { fillBlankQuestionType } from './index'
import type { GrammarPoint, VocabItem } from '@/domain/types'

function makeVocab(overrides: Partial<VocabItem>): VocabItem {
  return {
    id: `id-${Math.random()}`,
    bookId: 'mnn1',
    lesson: 1,
    section: 'main',
    kana: 'がいこく',
    kanji: '外国',
    romaji: 'gaikoku',
    meaning: 'nước ngoài',
    pos: 'noun',
    answers: { kana: ['がいこく'], kanji: ['外国'], meaning: ['nước ngoài'] },
    kanjiChars: ['外', '国'],
    homographKey: 'がいこく',
    ...overrides,
  }
}

function makeGrammar(): GrammarPoint {
  return {
    id: 'mnn1-l05-g-1',
    bookId: 'mnn1',
    lesson: 5,
    order: 1,
    title: 'わたしは～です',
    meaning: 'Tôi là ~',
    explanationMd: '',
    supplemental: false,
    examples: [
      {
        jp: 'わたしは 外国人です。',
        romaji: 'watashi wa gaikokujin desu.',
        vi: 'Tôi là người nước ngoài.',
        chunks: ['わたしは', '外国人です。'],
      },
    ],
  }
}

function makePool(): VocabItem[] {
  return [
    makeVocab({ id: 'correct', meaning: 'nước ngoài', kana: 'がいこく', kanji: '外国' }),
    makeVocab({ id: 'b', meaning: 'nước Nhật', kana: 'にほん', kanji: '日本', homographKey: 'にほん' }),
    makeVocab({ id: 'c', meaning: 'nước Mỹ', kana: 'あめりか', kanji: 'アメリカ', homographKey: 'あめりか' }),
    makeVocab({ id: 'd', meaning: 'Trung Quốc', kana: 'ちゅうごく', kanji: '中国', homographKey: 'ちゅうごく' }),
  ]
}

describe('fillBlankQuestionType', () => {
  it('isEligible = true khi tìm được câu ví dụ chứa từ (theo Kanji)', () => {
    const pool = [...makePool(), makeGrammar()]
    const correct = pool[0] as VocabItem
    expect(fillBlankQuestionType.isEligible(correct, { pool })).toBe(true)
  })

  it('isEligible = false khi không câu ví dụ nào chứa từ', () => {
    const pool = [...makePool(), makeGrammar()]
    const other = makeVocab({ id: 'z', kana: 'ねこ', kanji: '猫', meaning: 'con mèo' })
    expect(fillBlankQuestionType.isEligible(other, { pool: [...pool, other] })).toBe(false)
  })

  it('generate: che đúng từ trong câu, 4 lựa chọn gồm đáp án đúng', () => {
    const pool = [...makePool(), makeGrammar()]
    const correct = pool[0] as VocabItem
    const q = fillBlankQuestionType.generate(correct, pool, createRng(1))
    expect(q.before + '___' + q.after).toContain('わたしは')
    expect(q.choices).toHaveLength(4)
    const correctChoice = q.choices.find((c) => c.id === q.correctChoiceId)
    expect(correctChoice?.text).toBe('外国')
  })

  it('grade: đúng khi chọn đúng id', () => {
    const pool = [...makePool(), makeGrammar()]
    const correct = pool[0] as VocabItem
    const q = fillBlankQuestionType.generate(correct, pool, createRng(1))
    expect(fillBlankQuestionType.grade(q, q.correctChoiceId).correct).toBe(true)
  })
})
