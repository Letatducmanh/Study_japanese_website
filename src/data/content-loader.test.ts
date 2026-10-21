import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  clearContentLoaderCache,
  loadBookIndex,
  loadManifest,
} from './content-loader'

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
