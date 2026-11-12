import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi as vitestVi,
} from 'vitest'
import { vi as viText } from '@/i18n/vi'
import { VocabTab } from './VocabTab'
import type { VocabItem } from '@/domain/types'

function makeVocab(overrides: Partial<VocabItem>): VocabItem {
  return {
    id: `id-${Math.random()}`,
    bookId: 'mnn1',
    lesson: 1,
    section: 'main',
    kana: 'わたし',
    kanji: null,
    romaji: 'watashi',
    meaning: 'tôi',
    pos: 'noun',
    answers: { kana: ['わたし'], kanji: [], meaning: ['tôi'] },
    kanjiChars: [],
    homographKey: 'わたし',
    ...overrides,
  }
}

const ITEMS: VocabItem[] = [
  makeVocab({ id: 'jin', kanji: '～人', kana: '～じん', romaji: 'jin' }),
  makeVocab({ id: 'nanji', kanji: '何時', kana: 'なんじ', romaji: 'nanji' }),
  makeVocab({
    id: 'hanami',
    kanji: '[お]花見',
    kana: '[お]はなみ',
    romaji: 'hanami',
  }),
  makeVocab({
    id: 'fun',
    kanji: '～分',
    kana: '～ふん / ～ぷん',
    romaji: 'fun',
  }),
  makeVocab({ id: 'watashi', kanji: null, kana: 'わたし' }),
]

describe('VocabTab — chuỗi đọc ở danh sách từ (spec 004)', () => {
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

  function rowOf(romaji: string): HTMLElement {
    // Mỗi hàng là một <li>; hàng được nhận ra bằng romaji hiển thị trong hàng.
    const row = screen.getByText(romaji, { exact: true }).closest('li')
    if (!row) throw new Error(`không thấy hàng ${romaji}`)
    return row
  }

  async function speakOf(romaji: string): Promise<string> {
    speak.mockClear()
    await userEvent.click(
      within(rowOf(romaji)).getByRole('button', { name: viText.common.speak }),
    )
    return (speak.mock.calls[0][0] as SpeechSynthesisUtterance).text
  }

  it.each([
    ['jin', 'じん'],
    ['nanji', 'なんじ'],
    ['hanami', 'はなみ'],
    ['fun', 'ふん'],
  ])(
    'từ có kanji (%s): bấm loa đọc kana đã làm sạch %s',
    async (romaji, expected) => {
      render(<VocabTab vocab={ITEMS} editionFilterDefault="all" />)
      expect(await speakOf(romaji)).toBe(expected)
    },
  )

  it('[đặc trưng] từ chỉ có kana đọc y như trước', async () => {
    render(<VocabTab vocab={ITEMS} editionFilterDefault="all" />)
    expect(await speakOf('watashi')).toBe('わたし')
  })

  it('[đặc trưng] chữ hiển thị không đổi (chỉ chuỗi đọc đổi)', () => {
    const { container } = render(
      <VocabTab vocab={ITEMS} editionFilterDefault="all" />,
    )
    for (const shown of ['～人', '何時', '[お]花見', '～分']) {
      expect(container.textContent).toContain(shown)
    }
  })
})
