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
import { vi as viText } from '@/i18n/vi'
import { FlashcardComponent } from './FlashcardComponent'
import type { VocabItem } from '@/domain/types'

function makeVocab(overrides: Partial<VocabItem>): VocabItem {
  return {
    id: 'flash-1',
    bookId: 'mnn1',
    lesson: 4,
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

describe('FlashcardComponent — chuỗi đọc trên thẻ (spec 004)', () => {
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

  async function spokenAfterClick(item: VocabItem): Promise<string> {
    render(<FlashcardComponent q={{ item }} onAnswer={vitestVi.fn()} />)
    await userEvent.click(
      screen.getByRole('button', { name: viText.common.speak }),
    )
    return (speak.mock.calls[0][0] as SpeechSynthesisUtterance).text
  }

  it('từ có kanji: bấm loa trên thẻ đọc kana, không đọc chữ Hán', async () => {
    const item = makeVocab({ kanji: '何分', kana: 'なんぷん' })
    expect(await spokenAfterClick(item)).toBe('なんぷん')
  })

  it('từ có ký hiệu: kana được làm sạch (～ふん / ～ぷん → ふん)', async () => {
    const item = makeVocab({ kanji: '～分', kana: '～ふん / ～ぷん' })
    expect(await spokenAfterClick(item)).toBe('ふん')
  })

  it('[đặc trưng] từ chỉ có kana đọc đúng kana', async () => {
    expect(await spokenAfterClick(makeVocab({}))).toBe('わたし')
  })

  it('[đặc trưng] chữ hiển thị trên thẻ không đổi (mặt kana mặc định)', () => {
    const item = makeVocab({ kanji: '何分', kana: 'なんぷん' })
    const { container } = render(
      <FlashcardComponent q={{ item }} onAnswer={vitestVi.fn()} />,
    )
    expect(container.textContent).toContain('なんぷん')
    expect(container.textContent).not.toContain('何分')
  })
})
