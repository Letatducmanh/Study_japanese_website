import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { usePracticeSessionStore } from '@/features/practice/session-store'
import { REVIEW_MODE_IDS } from '@/features/weakness/review-modes'
import { WeaknessPage } from '@/features/weakness/WeaknessPage'
import { vi as viText } from '@/i18n/vi'
import type { Mastery, VocabItem } from '@/domain/types'

// Đặt ở src/test/ vì cần session-store của features/practice (luật lớp: không thêm ngoại lệ ESLint).

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
  lessons: [3, 5, 8].map((n) => ({
    lesson: n,
    title: `Bài ${n}`,
    vocabCount: 20,
    mainVocabCount: 20,
    grammarCount: 0,
    kanjiCount: 0,
  })),
}

function word(lesson: number, n: number): VocabItem {
  const kana = `かな${lesson}${n}`
  return {
    id: `mnn1-l${String(lesson).padStart(2, '0')}-w${n}`,
    bookId: 'mnn1',
    lesson,
    section: 'main',
    kana,
    kanji: null,
    romaji: `kana${lesson}${n}`,
    meaning: `nghĩa ${lesson}-${n}`,
    pos: 'noun',
    answers: { kana: [kana], kanji: [], meaning: [] },
    kanjiChars: [],
    homographKey: kana,
  }
}

function row(itemId: string, skill: Mastery['skill'] = 'meaning'): Mastery {
  return { itemId, skill, score: 0.2, attempts: 3, streak: 0, lastTs: 1 }
}

/** Từ thứ i, xen kẽ Bài 3, 5, 8. */
const mixedWord = (i: number) => word([3, 5, 8][i % 3]!, Math.floor(i / 3) + 1)

const mockListWeak = vi.fn<(limit?: number) => Promise<Mastery[]>>()
const mockListAllMastery = vi.fn<() => Promise<Mastery[]>>()
const mockResolve = vi.fn<(ids: string[]) => Promise<VocabItem[]>>()

vi.mock('@/data/content-loader', () => ({
  loadManifest: () => Promise.resolve(MANIFEST),
  loadBookIndex: () => Promise.resolve(INDEX),
  resolveVocabItems: (ids: string[]) => mockResolve(ids),
}))
vi.mock('@/data/progress/dexie-repo', () => ({
  progressRepository: {
    listWeak: (limit?: number) => mockListWeak(limit),
    listAllMastery: () => mockListAllMastery(),
  },
}))

/** Dựng dữ liệu giả: `rows` theo thứ hạng yếu nhất trước; `vocab` là các từ còn trong nội dung. */
function setup(rows: Mastery[], vocab: VocabItem[]) {
  const byId = new Map(vocab.map((v) => [v.id, v]))
  mockListWeak.mockReset().mockImplementation((limit = 20) => Promise.resolve(rows.slice(0, limit)))
  mockListAllMastery.mockReset().mockResolvedValue(rows)
  mockResolve
    .mockReset()
    .mockImplementation((ids) =>
      Promise.resolve(ids.map((id) => byId.get(id)).filter((v): v is VocabItem => !!v)),
    )
  usePracticeSessionStore.setState({ pendingConfig: null, lastResult: null })
  return render(
    <MemoryRouter initialEntries={['/weak']}>
      <Routes>
        <Route path="/weak" element={<WeaknessPage />} />
        <Route path="/practice/run" element={<p>TRANG CHẠY PHIÊN</p>} />
      </Routes>
    </MemoryRouter>,
  )
}

async function clickPracticeNow() {
  const user = userEvent.setup()
  await user.click(
    await screen.findByRole('button', { name: viText.weak.practiceNowButton }),
  )
}

describe('WeaknessPage — "Luyện ngay 20 câu yếu nhất"', () => {
  beforeEach(() => {
    usePracticeSessionStore.setState({ pendingConfig: null, lastResult: null })
  })

  it('(b) 12 từ yếu ở 3 bài → phiên có đủ 12 từ, dạng bài đúng, chuyển sang trang chạy', async () => {
    const words = Array.from({ length: 12 }, (_, i) => mixedWord(i))
    setup(words.map((w) => row(w.id)), words)
    await clickPracticeNow()

    await screen.findByText('TRANG CHẠY PHIÊN')
    const config = usePracticeSessionStore.getState().pendingConfig
    expect(config?.onlyItemIds).toHaveLength(12)
    expect(new Set(config?.onlyItemIds).size).toBe(12)
    expect(config?.questionCount).toBe(12)
    expect(config?.questionTypeIds).toBe(REVIEW_MODE_IDS)
  })

  it('(c) 25 từ yếu ở nhiều bài → đúng 20 từ theo thứ hạng', async () => {
    const words = Array.from({ length: 25 }, (_, i) => mixedWord(i))
    setup(words.map((w) => row(w.id)), words)
    await clickPracticeNow()

    await screen.findByText('TRANG CHẠY PHIÊN')
    const config = usePracticeSessionStore.getState().pendingConfig
    expect(config?.onlyItemIds).toEqual(words.slice(0, 20).map((w) => w.id))
  })

  it('(g) 30 từ, mỗi từ 2 kỹ năng, xen 10 mastery ngữ pháp → đúng 20 từ phân biệt; danh sách hiển thị vẫn lấy listWeak(20)', async () => {
    const words = Array.from({ length: 30 }, (_, i) => mixedWord(i))
    const rows: Mastery[] = []
    words.forEach((w, i) => {
      rows.push(row(w.id, 'meaning'), row(w.id, 'recall'))
      if (i % 3 === 2) rows.push(row(`mnn1-l03-g-00${i}`, 'grammar'))
    })
    setup(rows, words)
    await clickPracticeNow()

    await screen.findByText('TRANG CHẠY PHIÊN')
    const config = usePracticeSessionStore.getState().pendingConfig
    expect(config?.onlyItemIds).toHaveLength(20)
    expect(new Set(config?.onlyItemIds).size).toBe(20)
    expect(config?.questionCount).toBe(20)
    // danh sách "Top từ yếu nhất" vẫn do listWeak(20) cấp (không đổi), lấy thêm bản ghi chỉ khi bấm nút
    expect(mockListWeak).toHaveBeenCalledWith(20)
    expect(mockListWeak.mock.calls.some((c) => (c[0] ?? 0) > 20)).toBe(true)
  })

  it('(h) chốt chặn: từ không còn trong nội dung bị bỏ qua, phiên chỉ gồm các từ còn lại', async () => {
    const present = Array.from({ length: 7 }, (_, i) => word(3, i + 1))
    const gone = [word(5, 90), word(5, 91), word(5, 92)] // không có trong nội dung
    setup([...gone, ...present].map((w) => row(w.id)), present)
    await clickPracticeNow()

    await screen.findByText('TRANG CHẠY PHIÊN')
    const config = usePracticeSessionStore.getState().pendingConfig
    expect(config?.onlyItemIds).toEqual(present.map((w) => w.id))
    expect(screen.queryByText(viText.error.loadFailed)).toBeNull()
  })

  it('(i) không có từ yếu nào: nút không hiện, không có phiên', async () => {
    setup([], [])
    await screen.findByText(viText.weak.empty)
    await waitFor(() => {
      expect(
        screen.queryByRole('button', { name: viText.weak.practiceNowButton }),
      ).toBeNull()
    })
    expect(usePracticeSessionStore.getState().pendingConfig).toBeNull()
  })
})
