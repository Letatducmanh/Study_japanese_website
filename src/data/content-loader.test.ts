import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  clearContentLoaderCache,
  findKanjiBookIdForLevel,
  findLevelIdForBook,
  loadBookIndex,
  loadManifest,
  resolveVocabItems,
} from './content-loader'
import type { Manifest } from '@/domain/types'

const VALID_MANIFEST = {
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

const VALID_BOOK_INDEX = {
  bookId: 'mnn1',
  title: 'JLPT N5',
  type: 'textbook',
  lessons: [
    {
      lesson: 1,
      title: 'Bài 1',
      vocabCount: 10,
      mainVocabCount: 10,
      grammarCount: 2,
      kanjiCount: 0,
    },
  ],
}

function mockFetchOnce(body: unknown, ok = true) {
  return vi.fn().mockResolvedValue({
    ok,
    status: ok ? 200 : 404,
    json: () => Promise.resolve(body),
  })
}

beforeEach(() => {
  clearContentLoaderCache()
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('loadManifest', () => {
  it('tải và validate manifest hợp lệ', async () => {
    vi.stubGlobal('fetch', mockFetchOnce(VALID_MANIFEST))
    const manifest = await loadManifest()
    expect(manifest.levels[0]?.id).toBe('N5')
  })

  it('ném lỗi khi HTTP không ok', async () => {
    vi.stubGlobal('fetch', mockFetchOnce({}, false))
    await expect(loadManifest()).rejects.toThrow(/HTTP 404/)
  })

  it('ném lỗi khi dữ liệu sai schema (chế độ dev)', async () => {
    vi.stubGlobal(
      'fetch',
      mockFetchOnce({ schemaVersion: 1 /* thiếu levels */ }),
    )
    await expect(loadManifest()).rejects.toThrow()
  })

  it('chỉ gọi fetch một lần nhờ cache', async () => {
    const fetchMock = mockFetchOnce(VALID_MANIFEST)
    vi.stubGlobal('fetch', fetchMock)
    await loadManifest()
    await loadManifest()
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
})

describe('loadBookIndex', () => {
  it('tải đúng đường dẫn theo bookId', async () => {
    const fetchMock = mockFetchOnce(VALID_BOOK_INDEX)
    vi.stubGlobal('fetch', fetchMock)
    const index = await loadBookIndex('mnn1')
    expect(index.lessons).toHaveLength(1)
    expect(fetchMock).toHaveBeenCalledWith('/content/mnn1/index.json')
  })
})

const MANIFEST_WITH_KANJI: Manifest = {
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
        {
          id: 'kanji-master-n5',
          title: 'Kanji Master N5',
          type: 'kanji',
          lessonLabel: 'Chương',
          sources: { kanji: 'n5/kanji-master-n5/kanji.md' },
        },
      ],
    },
  ],
}

describe('findKanjiBookIdForLevel / findLevelIdForBook', () => {
  it('tìm đúng giáo trình Kanji cùng cấp độ', () => {
    expect(findKanjiBookIdForLevel(MANIFEST_WITH_KANJI, 'N5')).toBe(
      'kanji-master-n5',
    )
  })

  it('trả về undefined khi cấp độ không có giáo trình Kanji', () => {
    expect(findKanjiBookIdForLevel(MANIFEST_WITH_KANJI, 'N4')).toBeUndefined()
  })

  it('tìm đúng cấp độ chứa một bookId', () => {
    expect(findLevelIdForBook(MANIFEST_WITH_KANJI, 'mnn1')).toBe('N5')
  })
})

describe('resolveVocabItems', () => {
  it('gộp các bài cần thiết và trả theo đúng thứ tự ID yêu cầu', async () => {
    const lesson1 = {
      bookId: 'mnn1',
      lesson: 1,
      title: 'Bài 1',
      vocab: [
        {
          id: 'mnn1-l01-aaaaaaaa',
          bookId: 'mnn1',
          lesson: 1,
          section: 'main',
          kana: 'わたし',
          kanji: '私',
          romaji: 'watashi',
          meaning: 'tôi',
          pos: 'noun',
          answers: { kana: ['わたし'], kanji: ['私'], meaning: ['tôi'] },
          kanjiChars: ['私'],
          homographKey: 'わたし',
        },
      ],
      grammar: [],
    }
    const lesson2 = {
      bookId: 'mnn1',
      lesson: 2,
      title: 'Bài 2',
      vocab: [
        {
          id: 'mnn1-l02-bbbbbbbb',
          bookId: 'mnn1',
          lesson: 2,
          section: 'main',
          kana: 'がいこく',
          kanji: '外国',
          romaji: 'gaikoku',
          meaning: 'nước ngoài',
          pos: 'noun',
          answers: {
            kana: ['がいこく'],
            kanji: ['外国'],
            meaning: ['nước ngoài'],
          },
          kanjiChars: ['外', '国'],
          homographKey: 'がいこく',
        },
      ],
      grammar: [],
    }
    const fetchMock = vi.fn((path: string) => {
      const body = path.includes('l01.json') ? lesson1 : lesson2
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(body),
      })
    })
    vi.stubGlobal('fetch', fetchMock)

    const items = await resolveVocabItems([
      'mnn1-l02-bbbbbbbb',
      'mnn1-l01-aaaaaaaa',
      'mnn1-l02-khong-ton-tai',
    ])

    expect(items.map((i) => i.id)).toEqual([
      'mnn1-l02-bbbbbbbb',
      'mnn1-l01-aaaaaaaa',
    ])
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })
})
