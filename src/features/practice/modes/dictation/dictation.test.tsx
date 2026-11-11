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
