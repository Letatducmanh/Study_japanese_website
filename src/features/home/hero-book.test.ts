import { describe, expect, it } from 'vitest'
import { buildStationRail, type NumberedLesson } from './hero-book'

function lesson(n: number): NumberedLesson {
  return {
    lesson: n,
    title: `Bài ${n}`,
    vocabCount: 10,
    mainVocabCount: 8,
    grammarCount: 3,
    kanjiCount: 2,
  }
}

describe('buildStationRail', () => {
  it('hiện hết khi có tối đa 8 bài, không chèn dấu ...', () => {
    const lessons = Array.from({ length: 8 }, (_, i) => lesson(i + 1))
    const rail = buildStationRail(lessons, 1)
    expect(rail).toHaveLength(8)
    expect(rail.some((item) => item.ellipsis)).toBe(false)
  })

  it('rút gọn còn 7 bài đầu + ... + bài cuối khi nhiều hơn 8 bài', () => {
    const lessons = Array.from({ length: 25 }, (_, i) => lesson(i + 1))
    const rail = buildStationRail(lessons, 5)
    expect(rail).toHaveLength(9)
    expect(rail[7]).toEqual({ ellipsis: true })
    const last = rail[8]
    expect(last.ellipsis).toBeFalsy()
    if (!last.ellipsis) expect(last.code).toBe('L25')
  })

  it('đánh dấu đúng bài đang học là current', () => {
    const lessons = Array.from({ length: 5 }, (_, i) => lesson(i + 1))
    const rail = buildStationRail(lessons, 3)
    const dot3 = rail.find((item) => !item.ellipsis && item.lessonNumber === 3)
    expect(dot3 && !dot3.ellipsis && dot3.current).toBe(true)
    const dot1 = rail.find((item) => !item.ellipsis && item.lessonNumber === 1)
    expect(dot1 && !dot1.ellipsis && dot1.current).toBe(false)
  })
})
