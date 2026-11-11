import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { usePracticeSessionStore } from '@/features/practice/session-store'
import { REVIEW_MODE_IDS } from '@/features/weakness/review-modes'
import { MistakesPage } from '@/features/weakness/MistakesPage'
import { vi as viText } from '@/i18n/vi'
import type { MistakeRecord, VocabItem } from '@/domain/types'

// Đặt ở src/test/ vì cần session-store của features/practice (luật lớp: không thêm ngoại lệ ESLint).

const WORD: VocabItem = {
  id: 'mnn1-l03-w1',
  bookId: 'mnn1',
  lesson: 3,
  section: 'main',
  kana: 'かな1',
  kanji: null,
  romaji: 'kana1',
  meaning: 'nghĩa 1',
  pos: 'noun',
  answers: { kana: ['かな1'], kanji: [], meaning: ['nghĩa 1'] },
  kanjiChars: [],
  homographKey: 'かな1',
}

const mistake: MistakeRecord = { itemId: WORD.id, addedTs: 1, correctStreak: 0 }

vi.mock('@/data/content-loader', () => ({
  resolveVocabItems: () => Promise.resolve([WORD]),
}))
vi.mock('@/data/progress/dexie-repo', () => ({
  progressRepository: { listMistakes: () => Promise.resolve([mistake]) },
}))

describe('MistakesPage — "Ôn lại" một từ', () => {
  beforeEach(() => {
    usePracticeSessionStore.setState({ pendingConfig: null, lastResult: null })
  })

  it('đặt cấu hình phiên 1 từ với đủ dạng bài ôn lại rồi chuyển sang trang chạy', async () => {
    render(
      <MemoryRouter initialEntries={['/mistakes']}>
        <Routes>
          <Route path="/mistakes" element={<MistakesPage />} />
          <Route path="/practice/run" element={<p>TRANG CHẠY PHIÊN</p>} />
        </Routes>
      </MemoryRouter>,
    )

    const user = userEvent.setup()
    await user.click(await screen.findByRole('button', { name: viText.mistakes.reviewButton }))

    await screen.findByText('TRANG CHẠY PHIÊN')
    const config = usePracticeSessionStore.getState().pendingConfig
    expect(config?.onlyItemIds).toEqual([WORD.id])
    expect(config?.questionCount).toBe(1)
    expect(config?.questionTypeIds).toBe(REVIEW_MODE_IDS)
    expect(config?.bookId).toBe('mnn1')
    expect(config?.lesson).toBe(3)
    expect(config?.includeExtended).toBe(true)
  })
})
