import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as contentLoader from '@/data/content-loader'
import { clearVocabSearchIndexCache, searchVocab } from './search-index'

vi.mock('@/data/content-loader', async () => {
  const actual = await vi.importActual<typeof import('@/data/content-loader')>(
    '@/data/content-loader',
  )
  return {
    ...actual,
    loadManifest: vi.fn(),
    loadBookIndex: vi.fn(),
    loadLesson: vi.fn(),
  }
})

const manifest = {
  schemaVersion: 1,
  levels: [
    {
      id: 'N5' as const,
      title: 'JLPT N5',
      order: 5,
      books: [
        {
          id: 'mnn1',
          title: 'Minna no Nihongo 1',
          type: 'textbook' as const,
          lessonLabel: 'Bài',
          sources: { vocab: 'n5/mnn1/vocab.md' },
        },
      ],
    },
  ],
}

const bookIndex = {
  bookId: 'mnn1',
  title: 'Minna no Nihongo 1',
  type: 'textbook' as const,
  lessons: [
    {
      lesson: 2,
      title: 'Bài 2',
      vocabCount: 1,
      grammarCount: 0,
      kanjiCount: 0,
    },
  ],
}

const lesson2 = {
  bookId: 'mnn1',
  lesson: 2,
  title: 'Bài 2',
  vocab: [
    {
      id: 'mnn1-l02-abc',
      bookId: 'mnn1',
      lesson: 2,
      section: 'main' as const,
      kana: 'がいこく',
      kanji: '外国',
      romaji: 'gaikoku',
      meaning: 'nước ngoài',
      pos: 'noun' as const,
      answers: { kana: ['がいこく'], kanji: ['外国'], meaning: ['nước ngoài'] },
      kanjiChars: ['外', '国'],
      homographKey: 'がいこく',
    },
  ],
  grammar: [],
}

beforeEach(() => {
  clearVocabSearchIndexCache()
  vi.mocked(contentLoader.loadManifest).mockResolvedValue(manifest)
  vi.mocked(contentLoader.loadBookIndex).mockResolvedValue(bookIndex)
  vi.mocked(contentLoader.loadLesson).mockResolvedValue(lesson2)
})

describe('searchVocab', () => {
  it('tìm theo kana ra đúng từ', async () => {
    const results = await searchVocab('がいこく')
    expect(results.map((r) => r.kanji)).toContain('外国')
  })

  it('tìm theo nghĩa tiếng Việt không dấu ra đúng từ', async () => {
    const results = await searchVocab('nuoc ngoai')
    expect(results.map((r) => r.kanji)).toContain('外国')
  })

  it('chuỗi rỗng trả về mảng rỗng, không gọi dựng chỉ mục', async () => {
    const results = await searchVocab('   ')
    expect(results).toEqual([])
    expect(contentLoader.loadManifest).not.toHaveBeenCalled()
  })
})
