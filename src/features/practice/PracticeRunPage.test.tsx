import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import '@/features/practice/modes/register-all'
import { PracticeRunPage } from './PracticeRunPage'
import { usePracticeSessionStore } from './session-store'
import { vi as viText } from '@/i18n/vi'
import type { Attempt, LessonFile, VocabItem } from '@/domain/types'

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
    answers: { kana: [kana], kanji: [], meaning: [`nghĩa ${lesson}-${n}`] },
    kanjiChars: [],
    homographKey: kana,
  }
}

const FILES: Record<number, LessonFile> = {
  3: {
    bookId: 'mnn1',
    lesson: 3,
    title: 'Bài 3',
    vocab: [1, 2, 3, 4, 5, 6].map((n) => word(3, n)),
    grammar: [],
  },
  5: {
    bookId: 'mnn1',
    lesson: 5,
    title: 'Bài 5',
    vocab: [1, 2, 3, 4].map((n) => word(5, n)),
    grammar: [],
  },
}

const mockLoadLesson = vi.fn<(bookId: string, lesson: number) => Promise<LessonFile>>()
const mockRecordAttempt = vi.fn<(attempt: Attempt) => Promise<void>>()

vi.mock('@/data/content-loader', async () => {
  const actual = await vi.importActual<typeof import('@/data/content-loader')>(
    '@/data/content-loader',
  )
  return {
    ...actual,
    loadManifest: () => Promise.resolve(MANIFEST),
    loadLesson: (bookId: string, lesson: number) => mockLoadLesson(bookId, lesson),
  }
})
vi.mock('@/data/progress/dexie-repo', () => ({
  progressRepository: {
    recordAttempt: (attempt: Attempt) => mockRecordAttempt(attempt),
  },
}))

function renderRun() {
  return render(
    <MemoryRouter initialEntries={['/practice/run']}>
      <PracticeRunPage />
    </MemoryRouter>,
  )
}

/** Các nút lựa chọn của câu trắc nghiệm (nhãn kết thúc bằng số thứ tự 1–4). */
function choiceButtons(): HTMLElement[] {
  return screen
    .getAllByRole('button')
    .filter((b) => /\d$/.test(b.textContent ?? ''))
}

describe('PracticeRunPage — phiên luyện lại từ yếu', () => {
  beforeEach(() => {
    mockLoadLesson
      .mockReset()
      .mockImplementation((_book, lesson) => Promise.resolve(FILES[lesson]!))
    mockRecordAttempt.mockReset().mockResolvedValue(undefined)
    usePracticeSessionStore.setState({ pendingConfig: null, lastResult: null })
  })

  it('(a) Ôn lại một từ: vẫn ra trắc nghiệm 4 lựa chọn (không ErrorState) và ghi tiến độ', async () => {
    const target = word(3, 1)
    usePracticeSessionStore.setState({
      pendingConfig: {
        bookId: 'mnn1',
        lesson: 3,
        questionTypeIds: ['mcq-jp-vi'],
        questionCount: 1,
        includeExtended: true,
        onlyItemIds: [target.id],
      },
    })
    renderRun()

    expect(await screen.findByText(viText.practice.progress(1, 1))).toBeInTheDocument()
    expect(screen.queryByText(viText.error.loadFailed)).toBeNull()
    const choices = choiceButtons()
    expect(choices).toHaveLength(4)

    // FR-009: trả lời một câu thì ghi tiến độ với mã từ, kỹ năng, dạng bài, đúng/sai
    const user = userEvent.setup()
    await user.click(choices[0]!)
    await user.click(screen.getByRole('button', { name: viText.mcq.next }))
    await waitFor(() => expect(mockRecordAttempt).toHaveBeenCalledTimes(1))
    expect(mockRecordAttempt).toHaveBeenCalledWith(
      expect.objectContaining({
        itemId: target.id,
        skill: 'meaning',
        mode: 'mcq-jp-vi',
        correct: expect.any(Boolean),
      }),
    )
  })

  it('(b) từ yếu ở Bài 3 và Bài 5: tải cả hai bài', async () => {
    usePracticeSessionStore.setState({
      pendingConfig: {
        bookId: 'mnn1',
        lesson: 3,
        questionTypeIds: ['flashcard', 'mcq-jp-vi', 'mcq-vi-jp'],
        questionCount: 2,
        includeExtended: true,
        onlyItemIds: [word(3, 1).id, word(5, 2).id],
      },
    })
    renderRun()

    await screen.findByText(viText.practice.progress(1, 2))
    await waitFor(() => {
      const loaded = mockLoadLesson.mock.calls.map((c) => c[1]).sort()
      expect(loaded).toEqual([3, 5])
    })
  })

  it('(c) không có onlyItemIds: vẫn ra trắc nghiệm như cũ', async () => {
    usePracticeSessionStore.setState({
      pendingConfig: {
        bookId: 'mnn1',
        lesson: 3,
        questionTypeIds: ['mcq-jp-vi'],
        questionCount: 3,
        includeExtended: true,
      },
    })
    renderRun()

    expect(await screen.findByText(viText.practice.progress(1, 3))).toBeInTheDocument()
    expect(choiceButtons()).toHaveLength(4)
    // chỉ tải đúng một bài như cũ
    expect(mockLoadLesson.mock.calls.map((c) => c[1])).toEqual([3])
  })

  it('(d) chốt chặn FR-009 cho đường chạy cũ: trả lời một câu thì ghi tiến độ', async () => {
    usePracticeSessionStore.setState({
      pendingConfig: {
        bookId: 'mnn1',
        lesson: 3,
        questionTypeIds: ['mcq-jp-vi'],
        questionCount: 3,
        includeExtended: true,
      },
    })
    renderRun()
    await screen.findByText(viText.practice.progress(1, 3))

    const user = userEvent.setup()
    await user.click(choiceButtons()[0]!)
    await user.click(screen.getByRole('button', { name: viText.mcq.next }))
    await waitFor(() => expect(mockRecordAttempt).toHaveBeenCalledTimes(1))
    expect(mockRecordAttempt).toHaveBeenCalledWith(
      expect.objectContaining({
        itemId: expect.stringMatching(/^mnn1-l03-w\d$/),
        skill: 'meaning',
        mode: 'mcq-jp-vi',
        correct: expect.any(Boolean),
      }),
    )
  })
})
