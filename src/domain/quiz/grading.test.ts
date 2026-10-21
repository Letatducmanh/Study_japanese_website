import { describe, expect, it } from 'vitest'
import { gradeTyped } from './grading'

describe('gradeTyped', () => {
  it('chấp nhận romaji tự đổi sang hiragana', () => {
    expect(gradeTyped('gaikoku', ['がいこく']).correct).toBe(true)
  })

  it('chấp nhận bất kỳ đáp án nào trong danh sách (kana lẫn katakana)', () => {
    expect(gradeTyped('miruku', ['ぎゅうにゅう', 'ミルク']).correct).toBe(true)
    expect(gradeTyped('gyuunyuu', ['ぎゅうにゅう', 'ミルク']).correct).toBe(true)
  })

  it('bỏ qua khoảng trắng và ー khi so khớp', () => {
    expect(gradeTyped('こーひー', ['こひー']).correct).toBe(true)
    expect(gradeTyped('わたし です', ['わたしです']).correct).toBe(true)
  })

  it('báo sai khi không khớp đáp án nào', () => {
    const result = gradeTyped('nihon', ['がいこく'])
    expect(result.correct).toBe(false)
    expect(result.expected).toBe('がいこく')
  })
})
