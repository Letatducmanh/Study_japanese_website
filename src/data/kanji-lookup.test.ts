import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { clearContentLoaderCache } from '@/data/content-loader'
import { clearKanjiLookupCache, loadAllKanjiForBook } from './kanji-lookup'

const INDEX = {
  bookId: 'kanji-master-n5',
  title: 'Kanji Master N5',
  type: 'kanji',
  lessons: [
    {
      lesson: 1,
      title: 'Chương 1',
      vocabCount: 0,
      grammarCount: 0,
      kanjiCount: 1,
    },
    {
      lesson: 'appendix',
      title: 'Phụ lục',
      vocabCount: 0,
      grammarCount: 0,
      kanjiCount: 1,
    },
  ],
}

function kanjiItem(char: string) {
  return {
    id: `kanji-${char}`,
    bookId: 'kanji-master-n5',
    chapter: 1,
    char,
    strokes: 1,
    kun: [],
    on: [],
    hanViet: 'X',
    meaning: 'x',
    examples: [],
    relatedVocabIds: [],
  }
}

beforeEach(() => {
  clearContentLoaderCache()
  clearKanjiLookupCache()
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('loadAllKanjiForBook', () => {
  it('gộp Kanji từ mọi chương + phụ lục', async () => {
    const fetchMock = vi.fn((path: string) => {
      let body: unknown = INDEX
      if (path.includes('ch01.json'))
        body = {
          bookId: 'kanji-master-n5',
          chapter: 1,
          title: '',
          kanji: [kanjiItem('一')],
        }
      if (path.includes('appendix.json'))
        body = {
          bookId: 'kanji-master-n5',
          chapter: 'appendix',
          title: '',
          kanji: [kanjiItem('駅')],
        }
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(body),
      })
    })
    vi.stubGlobal('fetch', fetchMock)

    const all = await loadAllKanjiForBook('kanji-master-n5')
    expect(all.map((k) => k.char)).toEqual(['一', '駅'])
  })

  it('chỉ fetch một lần nhờ cache', async () => {
    const fetchMock = vi.fn((path: string) => {
      let body: unknown = INDEX
      if (path.includes('ch01.json'))
        body = {
          bookId: 'kanji-master-n5',
          chapter: 1,
          title: '',
          kanji: [kanjiItem('一')],
        }
      if (path.includes('appendix.json'))
        body = {
          bookId: 'kanji-master-n5',
          chapter: 'appendix',
          title: '',
          kanji: [],
        }
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(body),
      })
    })
    vi.stubGlobal('fetch', fetchMock)

    await loadAllKanjiForBook('kanji-master-n5')
    await loadAllKanjiForBook('kanji-master-n5')
    expect(fetchMock).toHaveBeenCalledTimes(3)
  })
})
