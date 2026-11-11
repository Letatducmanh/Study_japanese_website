import { describe, expect, it } from 'vitest'
import '@/features/practice/modes/register-all'
import { get as getQuestionType } from '@/domain/quiz/registry'
import { buildSession } from '@/domain/quiz/session'
import { buildReviewPools } from './review-pools'
import type { LessonFile, VocabItem } from '@/domain/types'

function word(
  lesson: number,
  n: number,
  section: 'main' | 'extended' = 'main',
): VocabItem {
  const kana = `かな${lesson}${n}`
  return {
    id: `mnn1-l${String(lesson).padStart(2, '0')}-w${n}`,
    bookId: 'mnn1',
    lesson,
    section,
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

function lessonFile(lesson: number, vocab: VocabItem[]): LessonFile {
  return { bookId: 'mnn1', lesson, title: `Bài ${lesson}`, vocab, grammar: [] }
}

// 3 bài, 9 từ chính + 1 từ mở rộng ở Bài 3
const l3 = lessonFile(3, [word(3, 1), word(3, 2), word(3, 3), word(3, 4), word(3, 9, 'extended')])
const l5 = lessonFile(5, [word(5, 1), word(5, 2), word(5, 3)])
const l8 = lessonFile(8, [word(8, 1), word(8, 2)])

const REVIEW_TYPES = ['flashcard', 'mcq-jp-vi', 'mcq-vi-jp'].map(
  (id) => getQuestionType(id)!,
)

const ids = (items: { id: string }[]) => items.map((i) => i.id)

describe('buildReviewPools', () => {
  it('(a) đặc tả nguyên nhân: một từ + ctxPool = chính nó → chỉ ra thẻ ghi nhớ', () => {
    const only = word(3, 1)
    for (let seed = 1; seed <= 20; seed++) {
      const session = buildSession({
        items: [only],
        questionTypes: REVIEW_TYPES,
        questionCount: 10,
        seed,
      })
      expect(session.questions.map((q) => q.questionType.id)).toEqual([
        'flashcard',
      ])
    }
  })

  it('(b) Ôn lại một từ: ctxPool đủ từ của bài, qua nhiều seed ra đủ 3 dạng', () => {
    const target = word(3, 1)
    const { targets, ctxPool } = buildReviewPools({
      lessonFiles: [l3],
      onlyItemIds: [target.id],
      includeExtended: true,
    })
    expect(ids(targets).filter((id) => id.startsWith('mnn1-l03-w'))).toEqual([
      target.id,
    ])
    // ctxPool có toàn bộ từ vựng của bài đã tải
    expect(ids(ctxPool)).toEqual(expect.arrayContaining(ids(l3.vocab)))

    const typesSeen = new Set<string>()
    for (let seed = 1; seed <= 30; seed++) {
      const session = buildSession({
        items: targets,
        ctxPool,
        questionTypes: REVIEW_TYPES,
        questionCount: 1,
        seed,
      })
      for (const q of session.questions) typesSeen.add(q.questionType.id)
    }
    expect([...typesSeen].sort()).toEqual(
      ['flashcard', 'mcq-jp-vi', 'mcq-vi-jp'].sort(),
    )
  })

  it('(c) từ yếu ở 3 bài: ctxPool chứa từ vựng của cả 3 bài', () => {
    const { targets, ctxPool } = buildReviewPools({
      lessonFiles: [l3, l5, l8],
      onlyItemIds: ['mnn1-l03-w1', 'mnn1-l05-w2', 'mnn1-l08-w1'],
      includeExtended: true,
    })
    expect(ids(targets).sort()).toEqual(
      ['mnn1-l03-w1', 'mnn1-l05-w2', 'mnn1-l08-w1'].sort(),
    )
    const pool = new Set(ids(ctxPool))
    for (const file of [l3, l5, l8]) {
      for (const v of file.vocab) expect(pool.has(v.id), v.id).toBe(true)
    }
  })

  it('(d) không có onlyItemIds: targets và ctxPool giống hành vi cũ', () => {
    const { targets, ctxPool } = buildReviewPools({
      lessonFiles: [l3],
      includeExtended: false,
    })
    // từ chính của bài (loại từ mở rộng) — như hành vi cũ
    expect(ids(targets)).toEqual(['mnn1-l03-w1', 'mnn1-l03-w2', 'mnn1-l03-w3', 'mnn1-l03-w4'])
    expect(ids(ctxPool)).toEqual(ids(targets))
  })

  it('(e) includeExtended: false loại từ mở rộng khỏi ctxPool', () => {
    const { ctxPool } = buildReviewPools({
      lessonFiles: [l3],
      onlyItemIds: ['mnn1-l03-w1'],
      includeExtended: false,
    })
    expect(ids(ctxPool)).not.toContain('mnn1-l03-w9')
  })
})
