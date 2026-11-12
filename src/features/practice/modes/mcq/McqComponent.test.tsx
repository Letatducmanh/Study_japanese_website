import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi as vitestVi,
} from 'vitest'
import { createRng } from '@/lib/rng'
import { vi as viText } from '@/i18n/vi'
import {
  mcqJpVi,
  mcqKanaKanji,
  mcqKanjiReading,
  mcqListenVi,
  mcqViJp,
  mcqViKanji,
} from './index'
import { McqComponent } from './McqComponent'
import type { McqQuestion } from './types'
import type { VocabItem } from '@/domain/types'

function makeVocab(overrides: Partial<VocabItem>): VocabItem {
  return {
    id: `id-${Math.random()}`,
    bookId: 'mnn1',
    lesson: 1,
    section: 'main',
    kana: 'たべます',
    kanji: '食べます',
    romaji: 'tabemasu',
    meaning: 'ăn',
    pos: 'verb',
    answers: { kana: ['たべます'], kanji: ['食べます'], meaning: ['ăn'] },
    kanjiChars: ['食'],
    homographKey: 'たべます',
    ...overrides,
  }
}

const pool: VocabItem[] = [
  makeVocab({ id: 'correct' }),
  makeVocab({
    id: 'b',
    meaning: 'uống',
    kana: 'のみます',
    kanji: '飲みます',
    homographKey: 'のみます',
  }),
  makeVocab({
    id: 'c',
    meaning: 'đi',
    kana: 'いきます',
    kanji: '行きます',
    homographKey: 'いきます',
  }),
  makeVocab({
    id: 'd',
    meaning: 'nghe',
    kana: 'ききます',
    kanji: '聞きます',
    homographKey: 'ききます',
  }),
]

describe('McqComponent: nút loa ở đề', () => {
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

  function spokenTexts(): string[] {
    return speak.mock.calls.map((c) => (c[0] as SpeechSynthesisUtterance).text)
  }

  function renderQuestion(q: McqQuestion) {
    return render(<McqComponent q={q} onAnswer={() => {}} />)
  }

  const speakButton = () =>
    screen.queryByRole('button', { name: viText.common.speak })

  it('mcq-vi-jp: đề tiếng Việt không có nút loa', () => {
    renderQuestion(mcqViJp.generate(pool[0], pool, createRng(1)))
    expect(speakButton()).toBeNull()
  })

  it('mcq-vi-kanji: đề tiếng Việt không có nút loa', () => {
    renderQuestion(mcqViKanji.generate(pool[0], pool, createRng(1)))
    expect(speakButton()).toBeNull()
  })

  it('mcq-kanji-reading: ẩn nút loa trước khi chọn, hiện sau khi chọn và đọc chữ kanji của đề', async () => {
    const q = mcqKanjiReading.generate(pool[0], pool, createRng(1))
    renderQuestion(q)
    expect(speakButton()).toBeNull()

    const choice = q.choices[0]
    await userEvent.click(
      screen.getByRole('button', { name: new RegExp(choice.text) }),
    )
    const button = speakButton()
    expect(button).not.toBeNull()

    await userEvent.click(button!)
    expect(spokenTexts()).toEqual(['食べます'])
  })

  it('[đặc trưng] mcq-jp-vi có nút loa ở đề, đọc chữ của đề', async () => {
    renderQuestion(mcqJpVi.generate(pool[0], pool, createRng(1)))
    await userEvent.click(speakButton()!)
    expect(spokenTexts()).toEqual(['食べます'])
  })

  it('[đặc trưng] mcq-kana-kanji có nút loa ở đề', () => {
    renderQuestion(mcqKanaKanji.generate(pool[0], pool, createRng(1)))
    expect(speakButton()).not.toBeNull()
  })

  it('[đặc trưng] mcq-listen-vi: không có nút "Nghe phát âm", có "Nghe lại", tự đọc khi mở', () => {
    renderQuestion(mcqListenVi.generate(pool[0], pool, createRng(1)))
    expect(speakButton()).toBeNull()
    expect(
      screen.getByRole('button', { name: new RegExp(viText.mcq.replay) }),
    ).toBeInTheDocument()
    expect(spokenTexts()).toEqual(['食べます'])
  })

  it('[đặc trưng] mcq-jp-vi không tự đọc khi mở câu hỏi', () => {
    renderQuestion(mcqJpVi.generate(pool[0], pool, createRng(1)))
    expect(spokenTexts()).toEqual([])
  })

  it('[đặc trưng] chọn đáp án không làm đổi kết quả grade()', async () => {
    const q = mcqKanjiReading.generate(pool[0], pool, createRng(1))
    renderQuestion(q)
    const correct = q.choices.find((c) => c.id === q.correctChoiceId)!
    await userEvent.click(
      screen.getByRole('button', { name: new RegExp(correct.text) }),
    )
    expect(mcqKanjiReading.grade(q, q.correctChoiceId).correct).toBe(true)
  })

  it('[đặc trưng] E2: đề hiển thị chữ thô "[お]土産", nhưng giọng đọc nhận "土産"', async () => {
    const q: McqQuestion = {
      ...mcqJpVi.generate(pool[0], pool, createRng(1)),
      promptText: '[お]土産',
      promptReading: undefined,
      promptAudio: undefined,
      promptSpeak: 'always',
    }
    const { container } = renderQuestion(q)
    expect(container.textContent).toContain('[お]土産')
    await userEvent.click(speakButton()!)
    expect(spokenTexts()).toEqual(['土産'])
  })
})
