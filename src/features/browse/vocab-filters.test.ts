import { describe, expect, it } from 'vitest'
import { relaxFilters } from './vocab-filters'
import type { EditionFilter, VocabItem } from '@/domain/types'

function item(overrides: Partial<VocabItem>): VocabItem {
  return {
    id: 'x',
    bookId: 'mnn1',
    lesson: 1,
    section: 'main',
    kana: 'わたし',
    kanji: null,
    romaji: 'watashi',
    meaning: 'tôi',
    pos: 'noun',
    answers: { kana: ['わたし'], kanji: [], meaning: ['tôi'] },
    kanjiChars: [],
    homographKey: 'わたし',
    ...overrides,
  }
}

type Filters = { section: 'all' | 'main' | 'extended'; edition: EditionFilter }
const ALL: Filters = { section: 'all', edition: 'all' }

describe('relaxFilters (spec 005, research R-4)', () => {
  it('(1) từ mở rộng, bộ lọc phần ở "main" → phần về "all", bản giữ nguyên', () => {
    expect(
      relaxFilters(item({ section: 'extended' }), {
        section: 'main',
        edition: 'all',
      }),
    ).toEqual({ section: 'all', edition: 'all' })
  })

  it('(2) từ chính, bộ lọc phần ở "extended" → phần về "all"', () => {
    expect(
      relaxFilters(item({ section: 'main' }), {
        section: 'extended',
        edition: 'all',
      }),
    ).toEqual({ section: 'all', edition: 'all' })
  })

  it('(3) từ bản cũ, bộ lọc bản ở "new" → bản về "all"', () => {
    expect(
      relaxFilters(item({ edition: 'old' }), { section: 'all', edition: 'new' }),
    ).toEqual({ section: 'all', edition: 'all' })
  })

  it('(4) từ bản mới, bộ lọc bản ở "old" → bản về "all"', () => {
    expect(
      relaxFilters(item({ edition: 'new' }), { section: 'all', edition: 'old' }),
    ).toEqual({ section: 'all', edition: 'all' })
  })

  it('(5) cả hai chiều cùng che → cả hai về "all"', () => {
    expect(
      relaxFilters(item({ section: 'extended', edition: 'old' }), {
        section: 'main',
        edition: 'new',
      }),
    ).toEqual(ALL)
  })

  it('(6) không bị che → giữ nguyên mặc định (kể cả từ không có bản)', () => {
    expect(relaxFilters(item({}), ALL)).toEqual(ALL)
    expect(
      relaxFilters(item({ section: 'main' }), { section: 'main', edition: 'new' }),
    ).toEqual({ section: 'main', edition: 'new' })
    // Từ không có `edition` luôn hiện, dù bộ lọc bản là "new" hay "old".
    expect(
      relaxFilters(item({ edition: undefined }), {
        section: 'all',
        edition: 'old',
      }),
    ).toEqual({ section: 'all', edition: 'old' })
  })

  it('không tìm thấy từ đích (ID cũ) → trả mặc định nguyên vẹn', () => {
    const defaults: Filters = { section: 'main', edition: 'new' }
    expect(relaxFilters(undefined, defaults)).toEqual(defaults)
  })

  it('chỉ nới chiều che: từ mở rộng bản mới, phần "main" + bản "new" → phần "all", bản vẫn "new"', () => {
    expect(
      relaxFilters(item({ section: 'extended', edition: 'new' }), {
        section: 'main',
        edition: 'new',
      }),
    ).toEqual({ section: 'all', edition: 'new' })
  })
})
