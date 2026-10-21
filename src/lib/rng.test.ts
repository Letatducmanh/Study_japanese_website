import { describe, expect, it } from 'vitest'
import { createRng, pickRandom, shuffle } from './rng'

describe('createRng', () => {
  it('cùng seed cho cùng chuỗi số', () => {
    const a = createRng(42)
    const b = createRng(42)
    const seqA = [a(), a(), a()]
    const seqB = [b(), b(), b()]
    expect(seqA).toEqual(seqB)
  })

  it('seed khác nhau cho chuỗi khác nhau', () => {
    const a = createRng(1)
    const b = createRng(2)
    expect(a()).not.toBe(b())
  })

  it('luôn trả về số trong [0, 1)', () => {
    const rng = createRng(7)
    for (let i = 0; i < 50; i++) {
      const n = rng()
      expect(n).toBeGreaterThanOrEqual(0)
      expect(n).toBeLessThan(1)
    }
  })
})

describe('shuffle', () => {
  it('không làm mất hay thêm phần tử', () => {
    const items = [1, 2, 3, 4, 5]
    const shuffled = shuffle(items, createRng(1))
    expect(shuffled.slice().sort()).toEqual(items.slice().sort())
  })

  it('không thay đổi mảng gốc', () => {
    const items = [1, 2, 3]
    shuffle(items, createRng(1))
    expect(items).toEqual([1, 2, 3])
  })

  it('cùng seed cho cùng thứ tự', () => {
    const items = [1, 2, 3, 4, 5, 6, 7, 8]
    expect(shuffle(items, createRng(99))).toEqual(shuffle(items, createRng(99)))
  })
})

describe('pickRandom', () => {
  it('lấy đúng số lượng yêu cầu', () => {
    expect(pickRandom([1, 2, 3, 4, 5], 3, createRng(1))).toHaveLength(3)
  })

  it('yêu cầu nhiều hơn số phần tử có thì trả về tất cả', () => {
    expect(pickRandom([1, 2], 5, createRng(1))).toHaveLength(2)
  })
})
