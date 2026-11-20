import { StrictMode } from 'react'
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

describe('VocabTab — nhảy tới từ (spec 005)', () => {
  // Chữ nhãn cố định, để test [đặc trưng] không phụ thuộc khóa i18n mới.
  const JUMP_LABEL = 'Từ vừa tìm'
  const originalScrollIntoView = Element.prototype.scrollIntoView
  const hadScrollIntoView = 'scrollIntoView' in Element.prototype
  const originalSpeech = window.speechSynthesis
  let scrollIntoView: ReturnType<typeof vitestVi.fn>
  let speak: ReturnType<typeof vitestVi.fn>

  beforeEach(() => {
    // jsdom không có scrollIntoView.
    scrollIntoView = vitestVi.fn()
    Element.prototype.scrollIntoView =
      scrollIntoView as unknown as typeof Element.prototype.scrollIntoView
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
    if (hadScrollIntoView) {
      Element.prototype.scrollIntoView = originalScrollIntoView
    } else {
      delete (Element.prototype as { scrollIntoView?: unknown }).scrollIntoView
    }
    Object.defineProperty(window, 'speechSynthesis', {
      configurable: true,
      value: originalSpeech,
    })
  })

  const highlighted = (container: HTMLElement) =>
    Array.from(container.querySelectorAll('[aria-current="true"]'))

  it('(a) có highlightId: đúng một hàng aria-current, có nhãn chữ và id vocab-<id>', () => {
    const { container } = render(
      <VocabTab vocab={ITEMS} editionFilterDefault="all" highlightId="nanji" />,
    )
    const rows = highlighted(container)
    expect(rows).toHaveLength(1)
    expect(rows[0].tagName).toBe('LI')
    expect(rows[0].id).toBe('vocab-nanji')
    expect(rows[0].textContent).toContain(JUMP_LABEL)
    expect(viText.lesson.jumpHighlightLabel).toBe(JUMP_LABEL)
    // Nhãn chữ chỉ có ở hàng được tô sáng.
    expect(screen.getAllByText(JUMP_LABEL)).toHaveLength(1)
  })

  it('(b) từ trùng kana khác ID: chỉ đúng hàng được tô sáng và cuộn tới', () => {
    const twins = [
      makeVocab({ id: 'sato-1', kana: 'さとう', kanji: '佐藤', romaji: 'sato-one' }),
      makeVocab({ id: 'sato-2', kana: 'さとう', kanji: '砂糖', romaji: 'sato-two' }),
    ]
    const { container } = render(
      <VocabTab
        vocab={twins}
        editionFilterDefault="all"
        highlightId="sato-2"
        scrollToId="sato-2"
      />,
    )
    const rows = highlighted(container)
    expect(rows).toHaveLength(1)
    expect(rows[0].id).toBe('vocab-sato-2')
    expect(scrollIntoView).toHaveBeenCalledTimes(1)
    expect(scrollIntoView.mock.contexts[0]).toBe(
      document.getElementById('vocab-sato-2'),
    )
  })

  it('(c) scrollToId có thật: cuộn đúng một lần vào giữa, tức thì; onScrolled một lần; không cuộn lặp', () => {
    const onScrolled = vitestVi.fn()
    const props = {
      vocab: ITEMS,
      editionFilterDefault: 'all' as const,
      highlightId: 'nanji',
      scrollToId: 'nanji',
      onScrolled,
    }
    const { rerender } = render(<VocabTab {...props} />)

    expect(scrollIntoView).toHaveBeenCalledTimes(1)
    expect(scrollIntoView).toHaveBeenCalledWith({
      block: 'center',
      behavior: 'instant',
    })
    expect(scrollIntoView.mock.contexts[0]).toBe(
      document.getElementById('vocab-nanji'),
    )
    expect(onScrolled).toHaveBeenCalledTimes(1)
    expect(onScrolled).toHaveBeenCalledWith('nanji')

    // Render lại cùng props: không cuộn thêm.
    rerender(<VocabTab {...props} />)
    expect(scrollIntoView).toHaveBeenCalledTimes(1)

    // Đổi tham chiếu onScrolled (effect chạy lại): cờ "đã cuộn" vẫn chặn cuộn lặp.
    rerender(<VocabTab {...props} onScrolled={vitestVi.fn()} />)
    expect(scrollIntoView).toHaveBeenCalledTimes(1)
  })

  it('(c) bọc StrictMode (effect chạy hai lần): vẫn cuộn đúng một lần', () => {
    const onScrolled = vitestVi.fn()
    render(
      <StrictMode>
        <VocabTab
          vocab={ITEMS}
          editionFilterDefault="all"
          highlightId="nanji"
          scrollToId="nanji"
          onScrolled={onScrolled}
        />
      </StrictMode>,
    )
    expect(scrollIntoView).toHaveBeenCalledTimes(1)
    expect(onScrolled).toHaveBeenCalledTimes(1)
  })

  it('(c) scrollToId vắng (đã cuộn xong): không cuộn, hàng vẫn tô sáng', () => {
    const { container } = render(
      <VocabTab vocab={ITEMS} editionFilterDefault="all" highlightId="nanji" />,
    )
    expect(scrollIntoView).not.toHaveBeenCalled()
    expect(highlighted(container)).toHaveLength(1)
  })

  it('(d) ID không có trong bài: không cuộn, không tô sáng, không lỗi', () => {
    const onScrolled = vitestVi.fn()
    let container!: HTMLElement
    expect(() => {
      ;({ container } = render(
        <VocabTab
          vocab={ITEMS}
          editionFilterDefault="all"
          highlightId="khong-co"
          scrollToId="khong-co"
          onScrolled={onScrolled}
        />,
      ))
    }).not.toThrow()
    expect(scrollIntoView).not.toHaveBeenCalled()
    expect(onScrolled).not.toHaveBeenCalled()
    expect(highlighted(container)).toHaveLength(0)
    expect(screen.queryByText(JUMP_LABEL)).toBeNull()
    expect(screen.getAllByRole('listitem')).toHaveLength(ITEMS.length)
    // ID lạ không làm hỏng việc dựng: mọi hàng của bài vẫn có id để cuộn tới.
    for (const item of ITEMS) {
      expect(document.getElementById(`vocab-${item.id}`)).not.toBeNull()
    }
  })

  it('(e) bộ lọc bản "new" che từ bản cũ: nới tạm để hàng hiện và tô sáng; bộ lọc vẫn dùng được', async () => {
    const oldWord = makeVocab({
      id: 'old-1',
      edition: 'old',
      kana: 'ふるい',
      romaji: 'furui',
    })
    const vocab = [...ITEMS, oldWord]
    const { container } = render(
      <VocabTab vocab={vocab} editionFilterDefault="new" highlightId="old-1" />,
    )
    const row = document.getElementById('vocab-old-1')
    expect(row).not.toBeNull()
    expect(row?.getAttribute('aria-current')).toBe('true')
    expect(highlighted(container)).toHaveLength(1)

    // Người học vẫn đổi lại được bộ lọc: bấm "Bản mới" thì từ bản cũ biến mất.
    await userEvent.click(
      screen.getByRole('button', { name: viText.lesson.filterEditionNew }),
    )
    expect(document.getElementById('vocab-old-1')).toBeNull()
  })

  it('[đặc trưng] (e) không có highlightId, bộ lọc bản "new": từ bản cũ vẫn bị ẩn như trước', () => {
    const oldWord = makeVocab({ id: 'old-1', edition: 'old', romaji: 'furui' })
    render(<VocabTab vocab={[...ITEMS, oldWord]} editionFilterDefault="new" />)
    expect(screen.queryByText('furui')).toBeNull()
  })

  it('[đặc trưng] (f) không có highlightId: không tô sáng, không nhãn, không cuộn', () => {
    const { container } = render(
      <VocabTab vocab={ITEMS} editionFilterDefault="all" />,
    )
    expect(highlighted(container)).toHaveLength(0)
    expect(screen.queryByText(JUMP_LABEL)).toBeNull()
    expect(scrollIntoView).not.toHaveBeenCalled()
    for (const shown of ['～人', '何時']) {
      expect(container.textContent).toContain(shown)
    }
  })

  it('(f) mỗi hàng có id vocab-<id> ổn định để cuộn tới', () => {
    render(<VocabTab vocab={ITEMS} editionFilterDefault="all" />)
    for (const item of ITEMS) {
      const row = document.getElementById(`vocab-${item.id}`)
      expect(row, `thiếu hàng vocab-${item.id}`).not.toBeNull()
      expect(row?.tagName).toBe('LI')
    }
  })

  it('[đặc trưng] (g) nút loa của hàng vẫn đọc kana', async () => {
    render(<VocabTab vocab={ITEMS} editionFilterDefault="all" />)
    const row = screen.getByText('nanji', { exact: true }).closest('li')
    await userEvent.click(
      within(row as HTMLElement).getByRole('button', {
        name: viText.common.speak,
      }),
    )
    expect((speak.mock.calls[0][0] as SpeechSynthesisUtterance).text).toBe(
      'なんじ',
    )
  })
})
