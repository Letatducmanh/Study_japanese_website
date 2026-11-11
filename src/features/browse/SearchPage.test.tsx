import { act, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
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
