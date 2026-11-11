import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import '@/features/practice/modes/register-all'
import { get as getQuestionType } from '@/domain/quiz/registry'
import { PracticeResultPage } from './PracticeResultPage'
import { PracticeRunPage } from './PracticeRunPage'
import { usePracticeSessionStore } from './session-store'
import { vi as viText } from '@/i18n/vi'
import type { GrammarPoint, LessonFile, VocabItem } from '@/domain/types'

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

function word(n: number): VocabItem {
  const kana = `かな${n}`
  return {
    id: `mnn1-l03-w${n}`,
    bookId: 'mnn1',
    lesson: 3,
    section: 'main',
    kana,
    kanji: null,
    romaji: `kana${n}`,
    meaning: `nghĩa ${n}`,
    pos: 'noun',
    answers: { kana: [kana], kanji: [], meaning: [`nghĩa ${n}`] },
    kanjiChars: [],
    homographKey: kana,
  }
}

function grammar(n: number): GrammarPoint {
  return {
    id: `mnn1-l03-g-00${n}`,
    bookId: 'mnn1',
    lesson: 3,
    order: n,
    title: `Mẫu ${n}`,
    meaning: `ý nghĩa mẫu ${n}`,
    explanationMd: '',
    examples: [
      {
        jp: `例文${n}です。`,
        romaji: `reibun ${n} desu.`,
        vi: `Ví dụ ${n}.`,
        chunks: ['例文', `${n}`, 'です', '。'],
      },
    ],
    supplemental: false,
  }
}

const LESSON3: LessonFile = {
  bookId: 'mnn1',
  lesson: 3,
  title: 'Bài 3',
  vocab: [1, 2, 3, 4, 5, 6].map(word),
  grammar: [1, 2, 3, 4, 5].map(grammar),
}

vi.mock('@/data/content-loader', async () => {
  const actual = await vi.importActual<typeof import('@/data/content-loader')>(
    '@/data/content-loader',
  )
  return {
    ...actual,
    loadManifest: () => Promise.resolve(MANIFEST),
    loadLesson: () => Promise.resolve(LESSON3),
  }
})
vi.mock('@/data/progress/dexie-repo', () => ({
  progressRepository: {
    recordAttempt: () => Promise.resolve(),
  },
}))

function renderFromResult() {
  return render(
    <MemoryRouter initialEntries={['/practice/result/s1']}>
      <Routes>
        <Route path="/practice/result/:sessionId" element={<PracticeResultPage />} />
        <Route path="/practice/run" element={<PracticeRunPage />} />
      </Routes>
    </MemoryRouter>,
  )
}

function setLastResultWithOneWrong(typeId: string, itemId: string) {
  const questionType = getQuestionType(typeId)!
  const item =
    typeId === 'grammar-pattern' ? LESSON3.grammar[0]! : LESSON3.vocab.find((v) => v.id === itemId)!
  usePracticeSessionStore.setState({
    pendingConfig: null,
    lastResult: {
      sessionId: 's1',
      bookId: 'mnn1',
      lesson: 3,
      startedAt: 0,
      finishedAt: 1000,
      answers: [
        { item, questionType, correct: false, given: 'sai', expected: 'đúng', responseMs: 500 },
      ],
    },
  })
}

describe('PracticeResultPage — "Làm lại câu sai"', () => {
  beforeEach(() => {
    usePracticeSessionStore.setState({ pendingConfig: null, lastResult: null })
  })

  it('(a) câu sai là trắc nghiệm Nhật → Nghĩa: bấm "Làm lại câu sai" vẫn ra câu trắc nghiệm', async () => {
    setLastResultWithOneWrong('mcq-jp-vi', 'mnn1-l03-w1')
    renderFromResult()

    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: viText.result.retryWrongButton }))

    expect(await screen.findByText(viText.practice.progress(1, 1))).toBeInTheDocument()
    expect(screen.queryByText(viText.error.loadFailed)).toBeNull()
    const choices = screen
      .getAllByRole('button')
      .filter((b) => /\d$/.test(b.textContent ?? ''))
    expect(choices).toHaveLength(4)
  })

  it('(b) chốt chặn hồi quy: làm lại sau câu ngữ pháp sai vẫn dựng được phiên (không ErrorState)', async () => {
    setLastResultWithOneWrong('grammar-pattern', 'mnn1-l03-g-001')
    renderFromResult()

    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: viText.result.retryWrongButton }))

    // mã ngữ pháp không giải ra bài qua parseVocabItemId: phải dùng bài của cấu hình
    expect(await screen.findByText(viText.practice.progress(1, 1))).toBeInTheDocument()
    expect(screen.queryByText(viText.error.loadFailed)).toBeNull()
  })
})
