import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { BookPage } from './BookPage'
import { heatmapClass } from '@/ui/signature/heatmap'
import type { Mastery } from '@/domain/types'

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
          title: 'Minna no Nihongo 1',
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
  title: 'Minna no Nihongo 1',
  type: 'textbook',
  lessons: [1, 2, 3, 4, 5].map((n) => ({
    lesson: n,
    title: `Bài ${n}`,
    vocabCount: 4,
    mainVocabCount: 4,
    grammarCount: 0,
    kanjiCount: 0,
  })),
}

const mockListAllMastery = vi.fn<() => Promise<Mastery[]>>()

// vi.mock được đưa lên đầu file; các hàm bên trong chỉ đọc hằng số lúc được gọi.
vi.mock('@/data/content-loader', () => ({
  loadManifest: () => Promise.resolve(MANIFEST),
  loadBookIndex: () => Promise.resolve(INDEX),
}))
vi.mock('@/data/progress/dexie-repo', () => ({
  progressRepository: { listAllMastery: () => mockListAllMastery() },
}))

function renderBookPage() {
  return render(
    <MemoryRouter initialEntries={['/b/mnn1']}>
      <Routes>
        <Route path="/b/:bookId" element={<BookPage />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('BookPage — màu ô bài theo độ thành thạo (FR-004)', () => {
  beforeEach(() => {
    mockListAllMastery.mockReset()
  })

  it('bài chưa làm hiện màu trung tính; bài đã làm yếu hiện màu đỏ', async () => {
    mockListAllMastery.mockResolvedValue([
      // chỉ có mastery điểm thấp ở Bài 3
      {
        itemId: 'mnn1-l03-aaaa',
        skill: 'meaning',
        score: 0.1,
        attempts: 3,
        streak: 0,
        lastTs: 1,
      },
    ])
    renderBookPage()

    const lesson3 = await screen.findByRole('link', { name: '3' })
    expect(lesson3.className).toContain('border-danger')

    // Bài 1 chưa làm: đúng các lớp của trạng thái "chưa có dữ liệu", không đỏ
    const lesson1 = screen.getByRole('link', { name: '1' })
    for (const cls of heatmapClass(null).split(' ')) {
      expect(lesson1.className).toContain(cls)
    }
    expect(lesson1.className).not.toContain('border-danger')
  })

  it('chưa có mastery nào: mọi ô trung tính, không ô nào đỏ', async () => {
    mockListAllMastery.mockResolvedValue([])
    renderBookPage()

    const links = await screen.findAllByRole('link')
    const lessonLinks = links.filter((l) => /^[1-5]$/.test(l.textContent ?? ''))
    expect(lessonLinks).toHaveLength(5)
    for (const link of lessonLinks) {
      expect(link.className).not.toContain('border-danger')
    }
  })
})
