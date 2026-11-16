import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { vi as viText } from '@/i18n/vi'
import { GrammarTab } from './GrammarTab'
import type { GrammarPoint } from '@/domain/types'

const POINT: GrammarPoint = {
  id: 'mnn1-l01-g-test',
  bookId: 'mnn1',
  lesson: 1,
  order: 4,
  title: 'N1 は 何／だれ／どなた ですか',
  meaning: 'Hỏi người hoặc vật',
  explanationMd: '- Hỏi **người** hoặc vật.',
  supplemental: false,
  examples: [
    {
      jp: 'あの 方は どなたですか。 …ワット先生です。',
      romaji: 'Ano kata wa donata desu ka.',
      vi: 'Vị kia là ai? Là thầy Watt.',
      chunks: [],
    },
    {
      jp: 'ミラーさんは アメリカ人ですか。 …はい、アメリカ人です。',
      romaji: 'Mirā-san wa Amerikajin desu ka.',
      vi: 'Anh Miller là người Mỹ à? Vâng.',
      chunks: [],
    },
  ],
}

describe('GrammarTab — chuỗi đọc của câu ví dụ (spec 004)', () => {
  const original = window.speechSynthesis
  let speak: ReturnType<typeof vi.fn>

  beforeEach(() => {
    speak = vi.fn()
    Object.defineProperty(window, 'speechSynthesis', {
      configurable: true,
      value: {
        speak,
        cancel: vi.fn(),
        getVoices: vi
          .fn()
          .mockReturnValue([{ lang: 'ja-JP' } as SpeechSynthesisVoice]),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      },
    })
  })

  afterEach(() => {
    Object.defineProperty(window, 'speechSynthesis', {
      configurable: true,
      value: original,
    })
  })

  const spokenTexts = (): string[] =>
    speak.mock.calls.map((c) => (c[0] as SpeechSynthesisUtterance).text)

  async function renderOpened() {
    const utils = render(<GrammarTab grammar={[POINT]} />)
    // Ví dụ nằm trong thẻ <details> đang thu gọn: bấm summary để mở.
    await userEvent.click(screen.getByText(/N1 は 何／だれ／どなた ですか/))
    return utils
  }

  const speakButtons = () =>
    screen.getAllByRole('button', { name: viText.common.speak })

  it('ví dụ có "あの 方": loa đọc "あの かた"', async () => {
    await renderOpened()
    await userEvent.click(speakButtons()[0])
    expect(spokenTexts()).toEqual([
      'あの かたは どなたですか。 ワット先生です。',
    ])
  })

  it('[đặc trưng] ví dụ "ミラーさん…" đọc như trước', async () => {
    await renderOpened()
    await userEvent.click(speakButtons()[1])
    expect(spokenTexts()).toEqual([
      'ミラーさんは アメリカ人ですか。 はい、アメリカ人です。',
    ])
  })

  it('[đặc trưng] chữ hiển thị không đổi (còn "あの 方は")', async () => {
    const { container } = await renderOpened()
    expect(container.textContent).toContain('あの 方は どなたですか。')
    expect(container.textContent).toContain('ミラーさんは アメリカ人ですか。')
  })
})
