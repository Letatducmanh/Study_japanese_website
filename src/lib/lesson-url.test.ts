import { describe, expect, it } from 'vitest'
import { lessonUrl, parseLessonJump, type LessonTab } from './lesson-url'

const parse = (query: string) => parseLessonJump(new URLSearchParams(query))

describe('lessonUrl (spec 005, contract C-2)', () => {
  it('không có tab và từ: đúng như địa chỉ hiện nay', () => {
    expect(lessonUrl({ bookId: 'mnn1', lesson: 13 })).toBe('/b/mnn1/13')
  })

  it('có từ mà vắng tab: thêm tab=vocab, tab đứng trước word', () => {
    expect(
      lessonUrl({ bookId: 'mnn1', lesson: 13, wordId: 'mnn1-l13-af449570' }),
    ).toBe('/b/mnn1/13?tab=vocab&word=mnn1-l13-af449570')
  })

  it('chỉ có tab: chỉ mang tab', () => {
    expect(lessonUrl({ bookId: 'mnn1', lesson: 13, tab: 'grammar' })).toBe(
      '/b/mnn1/13?tab=grammar',
    )
  })

  it('có cả tab và từ: giữ tab đã cho', () => {
    expect(
      lessonUrl({ bookId: 'mnn1', lesson: 13, tab: 'kanji', wordId: 'x' }),
    ).toBe('/b/mnn1/13?tab=kanji&word=x')
  })

  it('wordId rỗng: như không có wordId', () => {
    expect(lessonUrl({ bookId: 'mnn1', lesson: 13, wordId: '' })).toBe(
      '/b/mnn1/13',
    )
  })

  it("lesson kiểu chuỗi '13' cho cùng kết quả như số 13", () => {
    expect(lessonUrl({ bookId: 'mnn1', lesson: '13', wordId: 'x' })).toBe(
      lessonUrl({ bookId: 'mnn1', lesson: 13, wordId: 'x' }),
    )
  })
})

describe('parseLessonJump (spec 005, contract C-3)', () => {
  it('không tham số → {}', () => {
    expect(parse('')).toEqual({})
  })

  it('?tab=grammar → chỉ tab', () => {
    expect(parse('tab=grammar')).toEqual({ tab: 'grammar' })
  })

  it('?tab=vocab&word=ABC → cả hai', () => {
    expect(parse('tab=vocab&word=ABC')).toEqual({
      tab: 'vocab',
      wordId: 'ABC',
    })
  })

  it('?word=ABC (vắng tab) → tab mặc định vocab', () => {
    expect(parse('word=ABC')).toEqual({ tab: 'vocab', wordId: 'ABC' })
  })

  it('tab lạ kèm word → tab vocab', () => {
    expect(parse('tab=bậy&word=ABC')).toEqual({ tab: 'vocab', wordId: 'ABC' })
  })

  it('tab lạ, không word → {}', () => {
    expect(parse('tab=bậy')).toEqual({})
  })

  it('word rỗng → {}', () => {
    expect(parse('word=')).toEqual({})
  })
})

describe('lessonUrl và parseLessonJump khớp hai chiều', () => {
  const origin = 'http://x'
  const tabs: (LessonTab | undefined)[] = [undefined, 'vocab', 'grammar', 'kanji']
  const words = ['mnn1-l13-af449570', 'a b&c=d', 'ký-tự/đặc?biệt#1', undefined]

  for (const tab of tabs) {
    for (const wordId of words) {
      it(`tab=${tab ?? '-'} word=${wordId ?? '-'}`, () => {
        const url = lessonUrl({ bookId: 'mnn1', lesson: 5, tab, wordId })
        const parsed = parseLessonJump(new URL(url, origin).searchParams)
        expect(parsed.wordId).toBe(wordId)
        // Có từ mà vắng tab thì tab đọc ra là vocab; có tab thì đọc ra đúng tab đã đưa vào.
        expect(parsed.tab).toBe(tab ?? (wordId ? 'vocab' : undefined))
      })
    }
  }
})
