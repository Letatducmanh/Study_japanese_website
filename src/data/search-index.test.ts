import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as contentLoader from '@/data/content-loader'
import { clearVocabSearchIndexCache, searchVocab } from './search-index'
import type { VocabItem } from '@/domain/types'

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
      vocabCount: 16,
      mainVocabCount: 16,
      grammarCount: 0,
      kanjiCount: 0,
    },
  ],
}

function word(
  id: string,
  kana: string,
  kanji: string | null,
  romaji: string,
  meaning: string,
): VocabItem {
  return {
    id,
    bookId: 'mnn1',
    lesson: 2,
    section: 'main',
    kana,
    kanji,
    romaji,
    meaning,
    pos: 'noun',
    answers: { kana: [kana], kanji: kanji ? [kanji] : [], meaning: [meaning] },
    kanjiChars: [],
    homographKey: kana,
  }
}

// Từ đúng (học sinh, giáo viên, ...) cùng từ nhiễu cố ý (教師, お勘定, 社員, ...).
const GAKUSEI = 'mnn1-l02-gakusei'
const SENSEI = 'mnn1-l02-sensei'
const GAIKOKU = 'mnn1-l02-abc'
const NIHON = 'mnn1-l02-nihon'
const SENSAI = 'mnn1-l02-sensai'
const KAIWA = 'mnn1-l02-kaiwa'

const lesson2 = {
  bookId: 'mnn1',
  lesson: 2,
  title: 'Bài 2',
  vocab: [
    word(GAKUSEI, 'がくせい', '学生', 'gakusei', 'sinh viên'),
    word(SENSEI, 'せんせい', '先生', 'sensei', 'giáo viên'),
    word(GAIKOKU, 'がいこく', '外国', 'gaikoku', 'nước ngoài'),
    word(NIHON, 'にほん', '日本', 'nihon', 'Nhật Bản'),
    word('mnn1-l02-nihongo', 'にほんご', '日本語', 'nihongo', 'tiếng Nhật'),
    word('mnn1-l02-kyoushi', 'きょうし', '教師', 'kyoushi', 'giáo viên'),
    word('mnn1-l02-okanjou', 'おかんじょう', 'お勘定', 'okanjou', 'thanh toán'),
    word('mnn1-l02-shain', 'しゃいん', '社員', 'shain', 'nhân viên công ty'),
    word('mnn1-l02-tanjoubi', 'たんじょうび', '誕生日', 'tanjoubi', 'ngày sinh nhật'),
    word('mnn1-l02-gakkou', 'がっこう', '学校', 'gakkou', 'trường học'),
    word('mnn1-l02-senjitsu', 'せんじつ', '先日', 'senjitsu', 'hôm trước'),
    word('mnn1-l02-ginkou', 'ぎんこう', '銀行', 'ginkou', 'ngân hàng'),
    word('mnn1-l02-kaishain', 'かいしゃいん', '会社員', 'kaishain', 'nhân viên văn phòng'),
    word('mnn1-l02-anata', 'あなた', null, 'anata', 'anh/chị'),
    // gần đúng với "sensei" (lệch một ký tự romaji)
    word(SENSAI, 'せんさい', '戦災', 'sensai', 'thiệt hại do chiến tranh'),
    // nghĩa chứa đúng chuỗi "gakusei" nhưng khớp ở phần nghĩa (kém ưu tiên hơn romaji)
    word(KAIWA, 'かいわ', '会話', 'kaiwa', 'cách gọi gakusei trong hội thoại'),
  ],
  grammar: [],
}

beforeEach(() => {
  clearVocabSearchIndexCache()
  vi.mocked(contentLoader.loadManifest).mockResolvedValue(manifest)
  vi.mocked(contentLoader.loadBookIndex).mockResolvedValue(bookIndex)
  vi.mocked(contentLoader.loadLesson).mockResolvedValue(lesson2)
})

const ids = (rs: { id: string }[]) => rs.map((r) => r.id)

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

// ---------------------------------------------------------------------------
// Spec 002 (US4): bộ truy vấn mẫu của hợp đồng contracts/search.md (SC-005)

describe('searchVocab — bộ truy vấn mẫu (SC-005)', () => {
  it('(a) "sinh viên" và "sinh vien": 学生 hạng 1, tối đa 3 kết quả, không có 教師 và お勘定', async () => {
    for (const q of ['sinh viên', 'sinh vien']) {
      const results = await searchVocab(q)
      expect(ids(results)[0], q).toBe(GAKUSEI)
      expect(results.length, q).toBeLessThanOrEqual(3)
      expect(ids(results), q).not.toContain('mnn1-l02-kyoushi')
      expect(ids(results), q).not.toContain('mnn1-l02-okanjou')
    }
  })

  it('(b) "nhat ban": 日本 hạng 1, tối đa 3 kết quả', async () => {
    const results = await searchVocab('nhat ban')
    expect(ids(results)[0]).toBe(NIHON)
    expect(results.length).toBeLessThanOrEqual(3)
  })

  it('(c) kana, kanji, romaji cho cùng từ hạng 1', async () => {
    for (const q of ['がくせい', '学生', 'gakusei']) {
      const results = await searchVocab(q)
      expect(ids(results)[0], q).toBe(GAKUSEI)
    }
    expect(ids(await searchVocab('sensei'))[0]).toBe(SENSEI)
  })

  it('(d) "nuoc ngoai" (không dấu): 外国 trong top 3', async () => {
    const results = await searchVocab('nuoc ngoai')
    expect(ids(results).slice(0, 3)).toContain(GAIKOKU)
  })

  it('(e) gõ sai một chữ: "gakusai" vẫn ra 学生 trong top 3', async () => {
    const results = await searchVocab('gakusai')
    expect(ids(results).slice(0, 3)).toContain(GAKUSEI)
  })

  it('(f) truy vấn vô nghĩa → rỗng; một ký tự ASCII → rỗng', async () => {
    expect(await searchVocab('zzzz')).toEqual([])
    expect(await searchVocab('a')).toEqual([])
  })

  it('(g) mọi kết quả có điểm ≥ 30% điểm của kết quả đầu', async () => {
    for (const q of ['sinh vien', 'sensei', 'gakusei', 'nhat ban']) {
      const results = await searchVocab(q)
      expect(results.length, q).toBeGreaterThan(0)
      const top = results[0]!.score
      for (const r of results) {
        expect(r.score, `${q} → ${r.id}`).toBeGreaterThanOrEqual(0.3 * top)
      }
    }
  })

  it('(h) tham số limit được tôn trọng', async () => {
    // "sinh" khớp 学生 ("sinh viên") và 誕生日 ("ngày sinh nhật")
    const all = await searchVocab('sinh')
    expect(all.length).toBeGreaterThanOrEqual(2)
    const one = await searchVocab('sinh', 1)
    expect(one).toHaveLength(1)
  })

  it('(i) khớp đúng xếp trước khớp gần đúng: "sensei" → 先生 trước 戦災', async () => {
    const results = await searchVocab('sensei')
    expect(ids(results)[0]).toBe(SENSEI)
    const near = ids(results).indexOf(SENSAI)
    if (near !== -1) expect(near).toBeGreaterThan(0)
  })

  it('(j) khớp qua romaji xếp trước khớp qua nghĩa: "gakusei" → 学生 trước 会話', async () => {
    const results = await searchVocab('gakusei')
    expect(ids(results)[0]).toBe(GAKUSEI)
    const viaMeaning = ids(results).indexOf(KAIWA)
    if (viaMeaning !== -1) expect(viaMeaning).toBeGreaterThan(0)
  })
})
