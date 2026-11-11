import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { WeaknessPage } from './WeaknessPage'
import { vi as viText } from '@/i18n/vi'
import type { Mastery, VocabItem } from '@/domain/types'

const MANIFEST = {
  schemaVersion: 1,
  levels: [
    {
      id: 'N5',
      title: 'JLPT N5',
      order: 5,
      books: [
        {
          id: 'mnn1',
          title: 'Minna',
          type: 'textbook',
          lessonLabel: 'Bài',
          sources: { vocab: 'n5/mnn1/vocab.md' },
        },
      ],
    },
  ],
}

const INDEX = {
  bookId: 'mnn1',
  title: 'Minna',
  type: 'textbook',
  lessons: [1, 2, 3, 4, 5, 6].map((n) => ({
    lesson: n,
    title: `Bài ${n}`,
    vocabCount: 4,
    mainVocabCount: 4,
    grammarCount: 0,
    kanjiCount: 0,
  })),
}

const mockListWeak = vi.fn<(limit?: number) => Promise<Mastery[]>>()
const mockListAllMastery = vi.fn<() => Promise<Mastery[]>>()
const mockResolveVocabItems =
  vi.fn<(ids: string[]) => Promise<VocabItem[]>>()

vi.mock('@/data/content-loader', () => ({
  loadManifest: () => Promise.resolve(MANIFEST),
  loadBookIndex: () => Promise.resolve(INDEX),
  resolveVocabItems: (ids: string[]) => mockResolveVocabItems(ids),
}))
vi.mock('@/data/progress/dexie-repo', () => ({
  progressRepository: {
    listWeak: (limit?: number) => mockListWeak(limit),
    listAllMastery: () => mockListAllMastery(),
  },
}))

function m(itemId: string, score: number, extra: Partial<Mastery> = {}): Mastery {
  return {
    itemId,
    skill: 'meaning',
    score,
    attempts: 3,
    streak: score < 0.6 ? 0 : 2,
    lastTs: 1,
    ...extra,
  }
}

function renderPage() {
  return render(
    <MemoryRouter>
      <WeaknessPage />
    </MemoryRouter>,
  )
}

/** Các liên kết trong mục "Bài có độ thành thạo thấp nhất" (rỗng nếu không có mục). */
function weakLessonLinks(): HTMLElement[] {
  const heading = screen.queryByRole('heading', {
    name: viText.weak.weakLessonsTitle,
  })
  if (!heading) return []
  return within(heading.closest('section')!).getAllByRole('link')
}

describe('WeaknessPage — mục "Bài có độ thành thạo thấp nhất" (US1)', () => {
  beforeEach(() => {
    mockListWeak.mockReset().mockResolvedValue([])
    mockListAllMastery.mockReset().mockResolvedValue([])
    mockResolveVocabItems.mockReset().mockResolvedValue([])
  })

  it('A: chỉ làm Bài 3 và Bài 5 → đúng hai bài đó, điểm tăng dần', async () => {
    mockListAllMastery.mockResolvedValue([
      m('mnn1-l03-aaaa', 0.2),
      m('mnn1-l05-bbbb', 0.9, { streak: 3 }),
    ])
    renderPage()

    await screen.findByRole('heading', { name: viText.weak.weakLessonsTitle })
    const links = weakLessonLinks()
    expect(links.map((l) => l.textContent)).toEqual([
      'Minna — 3',
      'Minna — 5',
    ])
  })

  it('B: chưa làm câu nào → hiện thông báo chưa đủ dữ liệu, không có mục bài thấp nhất', async () => {
    renderPage()

    await screen.findByText(viText.weak.empty)
    expect(
      screen.queryByRole('heading', { name: viText.weak.weakLessonsTitle }),
    ).toBeNull()
  })

  it('C: Bài 3 làm toàn sai (0%) vẫn được liệt kê, chỉ mình Bài 3', async () => {
    mockListAllMastery.mockResolvedValue([
      m('mnn1-l03-aaaa', 0, { attempts: 4, streak: 0 }),
    ])
    renderPage()

    await screen.findByRole('heading', { name: viText.weak.weakLessonsTitle })
    const links = weakLessonLinks()
    expect(links.map((l) => l.textContent)).toEqual(['Minna — 3'])
    expect(screen.getByText(viText.weak.scoreSuffix(0))).toBeInTheDocument()
  })

  it('D (chốt chặn): chỉ có mastery ngữ pháp/Kanji → không lỗi, không có bài thấp nhất', async () => {
    const rows = [m('mnn1-l03-g-001', 0.2), m('kanji-行', 0.1)]
    mockListWeak.mockResolvedValue(rows)
    mockListAllMastery.mockResolvedValue(rows)
    renderPage()

    await screen.findByText(viText.weak.empty)
    expect(
      screen.queryByRole('heading', { name: viText.weak.weakLessonsTitle }),
    ).toBeNull()
    expect(screen.queryByText(viText.error.loadFailed)).toBeNull()
  })

  it('E (chốt chặn): từ yếu không còn trong nội dung bị bỏ qua, không lỗi', async () => {
    const row = m('mnn1-l03-gone', 0.1)
    mockListWeak.mockResolvedValue([row])
    mockListAllMastery.mockResolvedValue([row])
    mockResolveVocabItems.mockResolvedValue([]) // không tìm thấy từ

    renderPage()

    await screen.findByText(viText.weak.empty)
    expect(screen.queryByText(viText.error.loadFailed)).toBeNull()
  })
})
