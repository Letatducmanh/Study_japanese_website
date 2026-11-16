import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { vi as viText } from '@/i18n/vi'
import { KanjiPage } from './KanjiPage'
import type { KanjiItem } from '@/domain/types'

const MANIFEST = {
  levels: [
    {
      id: 'N5',
      title: 'JLPT N5',
      order: 5,
      books: [
        {
          id: 'kanji-n5',
          title: 'Kanji N5',
          type: 'kanji',
          lessonLabel: 'Chương',
          sources: { kanji: 'n5/kanji.md' },
        },
      ],
    },
  ],
}

const ICHI: KanjiItem = {
  id: 'kanji-n5-1',
  bookId: 'kanji-n5',
  chapter: 1,
  char: '一',
  strokes: 1,
  kun: ['ひと', 'ひと・つ'],
  on: ['イチ', 'イツ'],
  hanViet: 'NHẤT',
  meaning: 'một',
  examples: [
    { kind: 'kun', word: '一人', reading: 'ひとり', meaning: 'một người' },
    {
      kind: 'on',
      word: '十分',
      reading: 'じゅっぷん, じっぷん',
      meaning: '10 phút',
    },
    { kind: 'special', word: '何', reading: 'なに, なん', meaning: 'cái gì' },
  ],
  relatedVocabIds: [],
}

// vi.mock được đưa lên đầu file; các hàm bên trong chỉ đọc hằng số lúc được gọi.
vi.mock('@/data/content-loader', () => ({
  loadManifest: () => Promise.resolve(MANIFEST),
  resolveVocabItems: () => Promise.resolve([]),
}))
vi.mock('@/data/kanji-lookup', () => ({
  loadAllKanjiForBook: () => Promise.resolve([ICHI]),
}))

describe('KanjiPage — chuỗi đọc của chữ đơn và từ ví dụ (spec 004)', () => {
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

  async function renderKanjiPage() {
    const utils = render(
      <MemoryRouter initialEntries={['/kanji/一']}>
        <Routes>
          <Route path="/kanji/:char" element={<KanjiPage />} />
        </Routes>
      </MemoryRouter>,
    )
    await screen.findByText('NHẤT')
    return utils
  }

  const speakButtons = () =>
    screen.getAllByRole('button', { name: viText.common.speak })

  it('[đặc trưng] số nút loa không đổi: một cho chữ đơn và một cho mỗi ví dụ', async () => {
    await renderKanjiPage()
    expect(speakButtons()).toHaveLength(1 + ICHI.examples.length)
  })

  it('[đặc trưng] chữ hiển thị không đổi (kể cả dấu "・" của Kun)', async () => {
    const { container } = await renderKanjiPage()
    const text = container.textContent ?? ''
    expect(text).toContain('一')
    expect(text).toContain('一人')
    expect(text).toContain('十分')
    expect(text).toContain('何')
    expect(text).toContain('ひと、ひと・つ')
    expect(text).toContain('イチ、イツ')
  })

  it('loa của chữ đơn "一" đọc "イチ、ひとつ"', async () => {
    await renderKanjiPage()
    await userEvent.click(speakButtons()[0])
    expect(spokenTexts()).toEqual(['イチ、ひとつ'])
  })

  it.each([
    [1, 'ひとり', '一人'],
    [2, 'じゅっぷん', '十分'],
    [3, 'なに', '何'],
  ])(
    'loa của ví dụ thứ %i đọc cách đọc kana đầu tiên "%s" (hiển thị %s)',
    async (index, expected) => {
      await renderKanjiPage()
      await userEvent.click(speakButtons()[index])
      expect(spokenTexts()).toEqual([expected])
    },
  )
})
