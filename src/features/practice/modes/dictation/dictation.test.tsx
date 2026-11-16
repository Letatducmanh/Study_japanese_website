import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi as vitestVi } from 'vitest'
import { vi as viText } from '@/i18n/vi'
import type { VocabItem } from '@/domain/types'
import { DictationComponent } from './DictationComponent'
import { dictationQuestionType } from './index'

function makeItem(overrides: Partial<VocabItem> = {}): VocabItem {
  return {
    id: 'test-1',
    bookId: 'test-book',
    lesson: 1,
    section: 'main',
    kana: '[お]みやげ',
    kanji: null,
    romaji: 'omiyage',
    meaning: 'quà lưu niệm',
    pos: 'noun',
    answers: { kana: ['みやげ'], kanji: [], meaning: ['quà lưu niệm'] },
    kanjiChars: [],
    homographKey: 'みやげ',
    ...overrides,
  }
}

describe('dictation — chuỗi chấm không đổi khi làm sạch chuỗi đọc', () => {
  it('[đặc trưng] grade() trả expected là item.kana thô và chấp nhận answers.kana', () => {
    const item = makeItem()
    const q = dictationQuestionType.generate(item, [item], () => 0.5)
    const result = dictationQuestionType.grade(q, 'みやげ')
    expect(result.correct).toBe(true)
    expect(result.expected).toBe('[お]みやげ')
    expect(result.given).toBe('みやげ')
  })

  it('[đặc trưng] kết quả grade() không đổi: chỉ tập answers.kana được chấp nhận', () => {
    const item = makeItem({
      answers: { kana: ['ぎゅうにゅう', 'ミルク'], kanji: [], meaning: [] },
      kana: 'ぎゅうにゅう / ミルク',
    })
    const q = dictationQuestionType.generate(item, [item], () => 0.5)
    expect(dictationQuestionType.grade(q, 'ぎゅうにゅう').correct).toBe(true)
    expect(dictationQuestionType.grade(q, 'ミルク').correct).toBe(true)
    expect(dictationQuestionType.grade(q, 'みるく').correct).toBe(true)
    // Chuỗi sẽ được ĐỌC chỉ là cách viết đầu tiên, nhưng không làm thu hẹp tập đáp án chấm.
    expect(dictationQuestionType.grade(q, 'ちがう').correct).toBe(false)
  })
})

describe('DictationComponent — chuỗi đưa cho giọng đọc', () => {
  const original = window.speechSynthesis
  let speak: ReturnType<typeof vitestVi.fn>

  beforeEach(() => {
    speak = vitestVi.fn()
    Object.defineProperty(window, 'speechSynthesis', {
      configurable: true,
      value: {
        speak,
        cancel: vitestVi.fn(),
        getVoices: vitestVi
          .fn()
          .mockReturnValue([{ lang: 'ja-JP' } as SpeechSynthesisVoice]),
        addEventListener: vitestVi.fn(),
        removeEventListener: vitestVi.fn(),
      },
    })
  })

  afterEach(() => {
    Object.defineProperty(window, 'speechSynthesis', {
      configurable: true,
      value: original,
    })
  })

  const textOf = (call: number): string =>
    (speak.mock.calls[call][0] as SpeechSynthesisUtterance).text

  it('tự đọc lúc mở câu hỏi và khi bấm "nghe lại" đều dùng chuỗi đã làm sạch', async () => {
    const item = makeItem()
    render(<DictationComponent q={{ item }} onAnswer={() => {}} />)
    expect(speak).toHaveBeenCalledTimes(1)
    expect(textOf(0)).toBe('みやげ')

    await userEvent.click(
      screen.getByRole('button', { name: new RegExp(viText.dictation.replay) }),
    )
    expect(speak).toHaveBeenCalledTimes(2)
    expect(textOf(1)).toBe('みやげ')
  })
})

describe('DictationComponent — đọc kana (spec 004)', () => {
  const original = window.speechSynthesis
  let speak: ReturnType<typeof vitestVi.fn>

  beforeEach(() => {
    speak = vitestVi.fn()
    Object.defineProperty(window, 'speechSynthesis', {
      configurable: true,
      value: {
        speak,
        cancel: vitestVi.fn(),
        getVoices: vitestVi
          .fn()
          .mockReturnValue([{ lang: 'ja-JP' } as SpeechSynthesisVoice]),
        addEventListener: vitestVi.fn(),
        removeEventListener: vitestVi.fn(),
      },
    })
  })

  afterEach(() => {
    Object.defineProperty(window, 'speechSynthesis', {
      configurable: true,
      value: original,
    })
  })

  const spoken = (): string[] =>
    speak.mock.calls.map((c) => (c[0] as SpeechSynthesisUtterance).text)

  const nanji = () =>
    makeItem({
      kanji: '何時',
      kana: 'なんじ',
      answers: { kana: ['なんじ'], kanji: ['何時'], meaning: ['mấy giờ'] },
    })

  it('(a) tự đọc lúc mở câu hỏi là kana "なんじ", không phải "何時"', () => {
    render(<DictationComponent q={{ item: nanji() }} onAnswer={() => {}} />)
    expect(spoken()).toEqual(['なんじ'])
  })

  it('(b) bấm "nghe lại" cũng đọc "なんじ"', async () => {
    render(<DictationComponent q={{ item: nanji() }} onAnswer={() => {}} />)
    await userEvent.click(
      screen.getByRole('button', { name: new RegExp(viText.dictation.replay) }),
    )
    expect(spoken()).toEqual(['なんじ', 'なんじ'])
  })

  it('[đặc trưng] (c) grade() không đổi: gõ なんじ đúng, gõ いつ sai, expected là item.kana', () => {
    const item = nanji()
    const q = dictationQuestionType.generate(item, [item], () => 0.5)
    expect(dictationQuestionType.grade(q, 'なんじ')).toEqual({
      correct: true,
      expected: 'なんじ',
      given: 'なんじ',
    })
    expect(dictationQuestionType.grade(q, 'いつ')).toEqual({
      correct: false,
      expected: 'なんじ',
      given: 'いつ',
    })
  })

  const gradeCases: Array<{
    name: string
    item: Partial<VocabItem>
    typed: Array<[string, boolean]>
    expected: string
  }> = [
    {
      name: '(1) có [ ]',
      item: {
        kana: '[お]みやげ',
        kanji: null,
        answers: { kana: ['みやげ'], kanji: [], meaning: [] },
      },
      typed: [
        ['みやげ', true],
        ['おみやげ', false],
      ],
      expected: '[お]みやげ',
    },
    {
      name: '(2) có " / "',
      item: {
        kana: 'ぎゅうにゅう / ミルク',
        kanji: null,
        answers: { kana: ['ぎゅうにゅう', 'ミルク'], kanji: [], meaning: [] },
      },
      typed: [
        ['ミルク', true],
        ['ちがう', false],
      ],
      expected: 'ぎゅうにゅう / ミルク',
    },
    {
      name: '(3) có ～',
      item: {
        kana: '～じん',
        kanji: '～人',
        answers: { kana: ['じん'], kanji: ['人'], meaning: [] },
      },
      typed: [
        ['じん', true],
        ['にん', false],
        ['人', false],
      ],
      expected: '～じん',
    },
    {
      name: '(4) có kanji',
      item: {
        kana: 'なんじ',
        kanji: '何時',
        answers: { kana: ['なんじ'], kanji: ['何時'], meaning: [] },
      },
      typed: [
        ['なんじ', true],
        ['いつ', false],
        ['何時', false],
      ],
      expected: 'なんじ',
    },
    {
      name: '(5) có [ ] và kanji',
      item: {
        kana: '[お]はなみ',
        kanji: '[お]花見',
        answers: { kana: ['はなみ'], kanji: ['花見'], meaning: [] },
      },
      typed: [
        ['はなみ', true],
        ['花見', false],
      ],
      expected: '[お]はなみ',
    },
    {
      name: '(6) có ～ và " / "',
      item: {
        kana: '～ふん / ～ぷん',
        kanji: '～分',
        answers: { kana: ['ふん', 'ぷん'], kanji: ['分'], meaning: [] },
      },
      typed: [
        ['ふん', true],
        ['ぷん', true],
        ['ぱん', false],
        ['分', false],
      ],
      expected: '～ふん / ～ぷん',
    },
  ]

  it.each(gradeCases)(
    '[đặc trưng] (d) grade() không đổi: $name',
    ({ item: overrides, typed, expected }) => {
      const item = makeItem(overrides)
      const q = dictationQuestionType.generate(item, [item], () => 0.5)
      for (const [given, correct] of typed) {
        const result = dictationQuestionType.grade(q, given)
        expect({ given, correct: result.correct }).toEqual({ given, correct })
        expect(result.expected).toBe(expected)
      }
    },
  )
})
