import { afterEach, describe, expect, it } from 'vitest'
import { clearRegistry, get, list, register } from './registry'
import type { QuestionType } from './registry'

function makeQuestionType(id: string): QuestionType<unknown> {
  return {
    id,
    label: id,
    itemType: 'vocab',
    skill: 'recognition',
    isEligible: () => true,
    generate: (item) => item,
    grade: () => ({ correct: true, expected: '' }),
    Component: () => null,
  }
}

afterEach(() => {
  clearRegistry()
})

describe('questionRegistry', () => {
  it('register rồi get/list tìm lại được đúng dạng', () => {
    register(makeQuestionType('a'))
    expect(get('a')?.id).toBe('a')
    expect(list().map((q) => q.id)).toEqual(['a'])
  })

  it('ném lỗi khi đăng ký trùng id', () => {
    register(makeQuestionType('a'))
    expect(() => register(makeQuestionType('a'))).toThrow()
  })

  it('get id không tồn tại trả về undefined', () => {
    expect(get('khong-ton-tai')).toBeUndefined()
  })

  it('thêm dạng mới thì list() tự có thêm (giả lập tiêu chí hoàn thành Phase 6)', () => {
    register(makeQuestionType('flashcard'))
    register(makeQuestionType('dang-gia'))
    expect(
      list()
        .map((q) => q.id)
        .sort(),
    ).toEqual(['dang-gia', 'flashcard'])
  })
})
