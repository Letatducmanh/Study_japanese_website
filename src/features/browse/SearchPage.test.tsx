import { act, fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { SearchPage } from './SearchPage'
import { vi as viText } from '@/i18n/vi'

const mockSearchVocab = vi.fn()

vi.mock('@/data/search-index', () => ({
  searchVocab: (query: string) => mockSearchVocab(query),
}))

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/search']}>
      <SearchPage />
    </MemoryRouter>,
  )
}

function type(input: HTMLElement, value: string) {
  fireEvent.change(input, { target: { value } })
}

describe('SearchPage — debounce lời gọi tìm kiếm (FR-018)', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    mockSearchVocab.mockReset().mockResolvedValue([])
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('gõ liên tục từng ký tự không gọi tìm kiếm theo từng phím; chỉ gọi một lần sau 250 ms', async () => {
    renderPage()
    const input = screen.getByRole('searchbox')

    // ô rỗng: không gọi tìm kiếm với chuỗi khác rỗng
    const callsWith = (q: string) =>
      mockSearchVocab.mock.calls.filter((c) => c[0] === q).length

    for (const text of ['s', 'si', 'sin', 'sinh', 'sinh ', 'sinh v', 'sinh vi', 'sinh vie', 'sinh vien']) {
      type(input, text)
      await act(async () => {
        await vi.advanceTimersByTimeAsync(50)
      })
    }
    // chưa đủ 250 ms kể từ phím cuối: chưa có lời gọi cho bất kỳ chuỗi gõ dở nào
    const nonEmptyCalls = mockSearchVocab.mock.calls.filter((c) => c[0] !== '')
    expect(nonEmptyCalls).toHaveLength(0)

    await act(async () => {
      await vi.advanceTimersByTimeAsync(250)
    })
    expect(callsWith('sinh vien')).toBe(1)
    expect(mockSearchVocab.mock.calls.filter((c) => c[0] !== '')).toHaveLength(1)
  })

  it('URL ?q= và ô nhập cập nhật ngay theo chữ gõ (không chờ)', () => {
    renderPage()
    const input = screen.getByRole('searchbox') as HTMLInputElement
    type(input, 'sinh')
    expect(input.value).toBe('sinh')
  })

  it('xóa hết chữ thì hiện gợi ý ngay, không chờ debounce', async () => {
    renderPage()
    const input = screen.getByRole('searchbox')
    type(input, 'sinh')
    await act(async () => {
      await vi.advanceTimersByTimeAsync(300)
    })
    expect(screen.queryByText(viText.search.hint)).toBeNull()

    type(input, '')
    // không advance timer: gợi ý phải hiện ngay
    expect(screen.getByText(viText.search.hint)).toBeInTheDocument()
  })
})
describe('SearchPage — chuỗi đọc ở kết quả (spec 004)', () => {
  const originalSpeech = window.speechSynthesis
  let speak: ReturnType<typeof vi.fn>

  function result(overrides: Record<string, unknown>) {
    return {
      id: 'r-1',
      bookId: 'mnn1',
      lesson: 4,
      kana: 'わたし',
      kanji: null,
      romaji: 'watashi',
      meaning: 'tôi',
      score: 1,
      ...overrides,
    }
  }

  beforeEach(() => {
    vi.useFakeTimers()
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
    mockSearchVocab
      .mockReset()
      .mockResolvedValue([
        result({
          id: 'r-nanji',
          kanji: '何時',
          kana: 'なんじ',
          romaji: 'nanji',
        }),
        result({ id: 'r-watashi', kanji: null, kana: 'わたし' }),
      ])
  })

  afterEach(() => {
    vi.useRealTimers()
    Object.defineProperty(window, 'speechSynthesis', {
      configurable: true,
      value: originalSpeech,
    })
  })

  async function searchAndGetButtons() {
    const { container } = renderPage()
    type(screen.getByRole('searchbox'), 'nanji')
    await act(async () => {
      await vi.advanceTimersByTimeAsync(300)
    })
    return {
      container,
      buttons: screen.getAllByRole('button', { name: viText.common.speak }),
    }
  }

  it('kết quả có kanji: bấm loa đọc kana, không đọc chữ Hán', async () => {
    const { buttons } = await searchAndGetButtons()
    fireEvent.click(buttons[0])
    expect((speak.mock.calls[0][0] as SpeechSynthesisUtterance).text).toBe(
      'なんじ',
    )
  })

  it('[đặc trưng] kết quả chỉ có kana đọc đúng kana', async () => {
    const { buttons } = await searchAndGetButtons()
    fireEvent.click(buttons[1])
    expect((speak.mock.calls[0][0] as SpeechSynthesisUtterance).text).toBe(
      'わたし',
    )
  })

  it('[đặc trưng] chữ hiển thị ở kết quả không đổi', async () => {
    const { container } = await searchAndGetButtons()
    expect(container.textContent).toContain('何時')
    expect(container.textContent).toContain('わたし')
  })
})

function LocationProbe() {
  const location = useLocation()
  return <div data-testid="location">{location.pathname + location.search}</div>
}

describe('SearchPage — bấm loa không điều hướng (spec 005)', () => {
  const originalSpeech = window.speechSynthesis
  const KANA = ['わたし', 'あなた', 'がくせい', 'せんせい', 'かいしゃいん']
  let speak: ReturnType<typeof vi.fn>

  function makeResults(count: number) {
    return KANA.slice(0, count).map((kana, i) => ({
      id: `r-${i + 1}`,
      bookId: 'mnn1',
      lesson: 4,
      kana,
      kanji: i % 2 === 0 ? null : '学生',
      romaji: `romaji-${i + 1}`,
      meaning: `nghĩa ${i + 1}`,
      score: 1,
    }))
  }

  beforeEach(() => {
    // shouldAdvanceTime: để userEvent (chờ setTimeout) không kẹt dưới đồng hồ giả.
    vi.useFakeTimers({ shouldAdvanceTime: true })
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
    mockSearchVocab.mockReset().mockResolvedValue(makeResults(2))
  })

  afterEach(() => {
    vi.useRealTimers()
    Object.defineProperty(window, 'speechSynthesis', {
      configurable: true,
      value: originalSpeech,
    })
  })

  async function searchWithRoutes() {
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={['/search']}>
        <Routes>
          <Route path="/search" element={<SearchPage />} />
          <Route
            path="/b/:bookId/:lesson"
            element={<div data-testid="lesson-page" />}
          />
        </Routes>
        <LocationProbe />
      </MemoryRouter>,
    )
    fireEvent.change(screen.getByRole('searchbox'), {
      target: { value: 'watashi' },
    })
    await act(async () => {
      await vi.advanceTimersByTimeAsync(300)
    })
    return {
      user,
      buttons: screen.getAllByRole('button', { name: viText.common.speak }),
      location: () => screen.getByTestId('location').textContent,
    }
  }

  const spokenText = (call: number) =>
    (speak.mock.calls[call][0] as SpeechSynthesisUtterance).text

  it('(a) bấm loa ở kết quả đầu: địa chỉ, ô tìm kiếm không đổi, chỉ phát âm một lần', async () => {
    const { user, buttons, location } = await searchWithRoutes()
    expect(location()).toBe('/search?q=watashi')

    await user.click(buttons[0])

    expect(location()).toBe('/search?q=watashi')
    expect(screen.queryByTestId('lesson-page')).toBeNull()
    expect((screen.getByRole('searchbox') as HTMLInputElement).value).toBe(
      'watashi',
    )
    expect(speak).toHaveBeenCalledTimes(1)
    expect(spokenText(0)).toBe('わたし')
  })

  it('(b) nút loa không nằm trong thẻ <a>: nút và liên kết là hai phần tử anh em trong <li>', async () => {
    const { buttons } = await searchWithRoutes()
    expect(buttons).toHaveLength(2)
    for (const button of buttons) {
      expect(button.closest('a')).toBeNull()
      const item = button.closest('li') as HTMLElement
      const link = within(item).getByRole('link')
      expect(button.parentElement).toBe(link.parentElement)
      expect(link.parentElement).toBe(item)
    }
  })

  it('(c) bàn phím: Tab tới nút loa; Enter và Space chỉ phát âm, không điều hướng', async () => {
    const { user, location } = await searchWithRoutes()
    screen.getByRole('searchbox').focus()

    await user.tab()
    const firstSpeak = screen.getAllByRole('button', {
      name: viText.common.speak,
    })[0]
    expect(firstSpeak).toHaveFocus()

    await user.keyboard('{Enter}')
    await user.keyboard(' ')

    expect(location()).toBe('/search?q=watashi')
    expect(screen.queryByTestId('lesson-page')).toBeNull()
    expect(speak).toHaveBeenCalledTimes(2)
  })

  it('(d) bấm loa liên tiếp ở năm kết quả: không điều hướng, đọc đúng kana từng kết quả, không console.error', async () => {
    mockSearchVocab.mockResolvedValue(makeResults(5))
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    try {
      const { user, buttons, location } = await searchWithRoutes()
      expect(buttons).toHaveLength(5)

      for (let i = 0; i < buttons.length; i++) {
        await user.click(buttons[i])
        expect(location()).toBe('/search?q=watashi')
        expect(speak).toHaveBeenCalledTimes(i + 1)
        expect(spokenText(i)).toBe(KANA[i])
      }
      expect(screen.queryByTestId('lesson-page')).toBeNull()
      expect(errorSpy).not.toHaveBeenCalled()
    } finally {
      errorSpy.mockRestore()
    }
  })

  it('[đặc trưng] (e) liên kết của hàng vẫn mở trang bài và chứa chữ hiển thị của từ', async () => {
    await searchWithRoutes()
    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(2)
    expect(links[0].getAttribute('href')).toMatch(/^\/b\/mnn1\/4/)
    expect(links[1].getAttribute('href')).toMatch(/^\/b\/mnn1\/4/)
    expect(links[1].textContent).toContain('学生')
  })

  it('[đặc trưng] (f) nút loa giữ vùng chạm 44×44 (h-11 w-11)', async () => {
    const { buttons } = await searchWithRoutes()
    for (const button of buttons) {
      expect(button.className).toContain('h-11')
      expect(button.className).toContain('w-11')
    }
  })

  it('[đặc trưng] (g) chữ hiển thị (kanji, romaji, nghĩa) vẫn nằm trong hàng', async () => {
    await searchWithRoutes()
    const items = screen.getAllByRole('listitem')
    expect(items).toHaveLength(2)
    expect(items[1].textContent).toContain('学生')
    expect(items[1].textContent).toContain('romaji-2')
    expect(items[1].textContent).toContain('nghĩa 2')
  })
})

describe('SearchPage — liên kết nhảy tới từ (spec 005)', () => {
  function makeResult(id: string, lesson: number, kana = 'さとう') {
    return {
      id,
      bookId: 'mnn1',
      lesson,
      kana,
      kanji: null,
      romaji: `romaji-${id}`,
      meaning: `nghĩa ${id}`,
      score: 1,
    }
  }

  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  async function searchRouted(results: ReturnType<typeof makeResult>[]) {
    mockSearchVocab.mockReset().mockResolvedValue(results)
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={['/search']}>
        <Routes>
          <Route path="/search" element={<SearchPage />} />
          <Route
            path="/b/:bookId/:lesson"
            element={<div data-testid="lesson-page" />}
          />
        </Routes>
        <LocationProbe />
      </MemoryRouter>,
    )
    fireEvent.change(screen.getByRole('searchbox'), {
      target: { value: 'sato' },
    })
    await act(async () => {
      await vi.advanceTimersByTimeAsync(300)
    })
    return { user, links: screen.getAllByRole('link') }
  }

  it('(a) liên kết của kết quả mang ?tab=vocab&word=<id>', async () => {
    const { links } = await searchRouted([
      makeResult('r-1', 4),
      makeResult('r-2', 4, 'あなた'),
    ])
    expect(links.map((l) => l.getAttribute('href'))).toEqual([
      '/b/mnn1/4?tab=vocab&word=r-1',
      '/b/mnn1/4?tab=vocab&word=r-2',
    ])
  })

  it('(b) hai kết quả cùng kana khác ID và khác bài: hai liên kết khác nhau', async () => {
    const { links } = await searchRouted([
      makeResult('mnn1-l02-b23ffe1b', 2),
      makeResult('mnn1-l14-97deba9a', 14),
    ])
    const hrefs = links.map((l) => l.getAttribute('href'))
    expect(hrefs).toEqual([
      '/b/mnn1/2?tab=vocab&word=mnn1-l02-b23ffe1b',
      '/b/mnn1/14?tab=vocab&word=mnn1-l14-97deba9a',
    ])
    expect(new Set(hrefs).size).toBe(2)
  })

  it('(c) bấm thân hàng (liên kết, không phải loa): sang trang bài kèm tab và từ', async () => {
    const { user, links } = await searchRouted([makeResult('r-1', 4)])

    await user.click(links[0])

    expect(screen.getByTestId('location').textContent).toBe(
      '/b/mnn1/4?tab=vocab&word=r-1',
    )
    expect(screen.getByTestId('lesson-page')).toBeInTheDocument()
  })
})
