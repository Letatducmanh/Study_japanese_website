import { useEffect } from 'react'
import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  createMemoryRouter,
  MemoryRouter,
  Route,
  RouterProvider,
  Routes,
  useNavigate,
  type NavigateFunction,
} from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { LessonPage } from './LessonPage'
import { vi as viText } from '@/i18n/vi'
import type {
  BookIndexFile,
  LessonFile,
  Manifest,
  VocabItem,
} from '@/domain/types'

function word(id: string, overrides: Partial<VocabItem>): VocabItem {
  return {
    id,
    bookId: 'mnn1',
    lesson: 1,
    section: 'main',
    kana: 'わたし',
    kanji: null,
    romaji: id,
    meaning: `nghĩa ${id}`,
    pos: 'noun',
    answers: { kana: ['わたし'], kanji: [], meaning: [] },
    kanjiChars: [],
    homographKey: 'わたし',
    ...overrides,
  }
}

const manifest: Manifest = {
  schemaVersion: 1,
  levels: [
    {
      id: 'N5',
      title: 'N5',
      order: 1,
      books: [
        {
          id: 'mnn1',
          title: 'Giáo trình thử',
          type: 'textbook',
          lessonLabel: 'Bài',
          sources: {},
          editionFilterDefault: 'all',
        },
      ],
    },
  ],
}

const bookIndex: BookIndexFile = {
  bookId: 'mnn1',
  title: 'Giáo trình thử',
  type: 'textbook',
  lessons: [
    {
      lesson: 1,
      title: 'Bài thử số một',
      vocabCount: 3,
      mainVocabCount: 2,
      grammarCount: 0,
      kanjiCount: 0,
    },
  ],
}

const lessonFile: LessonFile = {
  bookId: 'mnn1',
  lesson: 1,
  title: 'Bài thử số một',
  vocab: [
    word('w-main', { romaji: 'w-main' }),
    word('w-ext', { section: 'extended', sectionTitle: 'Mở rộng thử', romaji: 'w-ext' }),
    word('w-main2', { romaji: 'w-main2' }),
  ],
  grammar: [],
}

vi.mock('@/data/content-loader', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/data/content-loader')>()
  return {
    ...actual,
    loadManifest: () => Promise.resolve(manifestRef()),
    loadBookIndex: () => Promise.resolve(bookIndexRef()),
    loadLesson: () => Promise.resolve(lessonRef()),
  }
})

// Hàm truy xuất dữ liệu thử (vi.mock được kéo lên đầu file nên cần cầu nối qua hàm).
function manifestRef() {
  return manifest
}
function bookIndexRef() {
  return bookIndex
}
function lessonRef() {
  return lessonFile
}

type Harness = { go: (to: string) => Promise<void> }

function GrabNavigate({
  onReady,
}: {
  onReady: (navigate: NavigateFunction) => void
}) {
  const navigate = useNavigate()
  useEffect(() => {
    onReady(navigate)
  }, [navigate, onReady])
  return null
}

/** Kiểu 1: router hiện tại của app (BrowserRouter + Routes) — ở đây dùng MemoryRouter. */
function mountMemoryRouter(url: string): Harness {
  let navigate: NavigateFunction | null = null
  const onReady = (fn: NavigateFunction) => {
    navigate = fn
  }
  render(
    <MemoryRouter initialEntries={[url]}>
      <Routes>
        <Route path="/b/:bookId/:lesson" element={<LessonPage />} />
      </Routes>
      <GrabNavigate onReady={onReady} />
    </MemoryRouter>,
  )
  return {
    go: async (to) => {
      await act(async () => {
        navigate?.(to)
      })
    },
  }
}

/** Kiểu 2: data router + lazy() mà ui-kit-and-shell sắp chuyển sang. */
function mountDataRouter(url: string): Harness {
  const router = createMemoryRouter(
    [
      {
        path: '/b/:bookId/:lesson',
        lazy: async () => ({ Component: LessonPage }),
      },
    ],
    { initialEntries: [url] },
  )
  render(<RouterProvider router={router} />)
  return {
    go: async (to) => {
      await act(async () => {
        await router.navigate(to)
      })
    },
  }
}

const harnesses: [string, (url: string) => Harness][] = [
  ['MemoryRouter + Routes', mountMemoryRouter],
  ['createMemoryRouter + RouterProvider + lazy()', mountDataRouter],
]

describe.each(harnesses)('LessonPage — nhảy tới từ (%s)', (_name, mount) => {
  const originalScrollIntoView = Element.prototype.scrollIntoView
  const hadScrollIntoView = 'scrollIntoView' in Element.prototype
  let scrollIntoView: ReturnType<typeof vi.fn>

  beforeEach(() => {
    scrollIntoView = vi.fn()
    Element.prototype.scrollIntoView =
      scrollIntoView as unknown as typeof Element.prototype.scrollIntoView
  })

  afterEach(() => {
    if (hadScrollIntoView) {
      Element.prototype.scrollIntoView = originalScrollIntoView
    } else {
      delete (Element.prototype as { scrollIntoView?: unknown }).scrollIntoView
    }
  })

  const heading = () =>
    screen.findByRole('heading', { name: 'Bài thử số một' })
  const row = (id: string) => document.getElementById(`vocab-${id}`)
  const current = () => document.querySelectorAll('[aria-current="true"]')

  it('(a) ?tab=vocab&word=<id>: tab Từ vựng, đúng một hàng tô sáng, cuộn một lần', async () => {
    mount('/b/mnn1/1?tab=vocab&word=w-ext')
    await heading()

    await waitFor(() => expect(row('w-ext')).not.toBeNull())
    expect(current()).toHaveLength(1)
    expect(row('w-ext')?.getAttribute('aria-current')).toBe('true')
    await waitFor(() => expect(scrollIntoView).toHaveBeenCalledTimes(1))
    expect(scrollIntoView.mock.contexts[0]).toBe(row('w-ext'))
  })

  it('(b) ?tab=grammar: tab Ngữ pháp, không tô sáng, không hàng từ vựng', async () => {
    mount('/b/mnn1/1?tab=grammar')
    await heading()

    expect(await screen.findByText(viText.lesson.noGrammar)).toBeInTheDocument()
    expect(current()).toHaveLength(0)
    expect(row('w-main')).toBeNull()
    expect(scrollIntoView).not.toHaveBeenCalled()
  })

  it('[đặc trưng] (c) không tham số: tab Từ vựng, không tô sáng, không cuộn', async () => {
    mount('/b/mnn1/1')
    await heading()

    // Hàng hiện ra (nhận bằng romaji hiển thị, không phụ thuộc id hàng mới).
    expect(await screen.findByText('w-main')).toBeInTheDocument()
    expect(screen.queryByText(viText.lesson.noGrammar)).toBeNull()
    expect(current()).toHaveLength(0)
    expect(scrollIntoView).not.toHaveBeenCalled()
  })

  it('[đặc trưng] (d) ?word=khong-co: trang dựng bình thường, không tô sáng, không cuộn, không lỗi', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    try {
      mount('/b/mnn1/1?tab=vocab&word=khong-co')
      await heading()

      await waitFor(() => expect(screen.getAllByRole('listitem')).toHaveLength(3))
      expect(current()).toHaveLength(0)
      expect(scrollIntoView).not.toHaveBeenCalled()
      expect(errorSpy).not.toHaveBeenCalled()
    } finally {
      errorSpy.mockRestore()
    }
  })

  it('(e) đang ở tab Ngữ pháp rồi điều hướng sang ?tab=vocab&word=<id>: về tab Từ vựng và tô sáng', async () => {
    const harness = mount('/b/mnn1/1?tab=grammar')
    await heading()
    expect(await screen.findByText(viText.lesson.noGrammar)).toBeInTheDocument()

    await harness.go('/b/mnn1/1?tab=vocab&word=w-main2')

    await waitFor(() => expect(row('w-main2')).not.toBeNull())
    expect(screen.queryByText(viText.lesson.noGrammar)).toBeNull()
    expect(row('w-main2')?.getAttribute('aria-current')).toBe('true')
    await waitFor(() => expect(scrollIntoView).toHaveBeenCalledTimes(1))
  })

  it('(f) đổi tab bằng tay rồi quay lại Từ vựng: hàng vẫn tô sáng, không cuộn lại', async () => {
    mount('/b/mnn1/1?tab=vocab&word=w-ext')
    await heading()
    await waitFor(() => expect(scrollIntoView).toHaveBeenCalledTimes(1))

    await userEvent.click(
      screen.getByRole('button', { name: viText.lesson.tabGrammar }),
    )
    expect(await screen.findByText(viText.lesson.noGrammar)).toBeInTheDocument()

    await userEvent.click(
      screen.getByRole('button', { name: viText.lesson.tabVocab }),
    )
    await waitFor(() => expect(row('w-ext')).not.toBeNull())
    expect(row('w-ext')?.getAttribute('aria-current')).toBe('true')
    expect(scrollIntoView).toHaveBeenCalledTimes(1)
  })
})
