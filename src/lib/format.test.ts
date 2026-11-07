import { describe, expect, it } from 'vitest'
import { formatDuration } from './format'

describe('formatDuration', () => {
  it('dưới 1 phút', () => {
    expect(formatDuration(45_000)).toBe('0:45')
  })

  it('tròn phút', () => {
    expect(formatDuration(120_000)).toBe('2:00')
  })

  it('giây có 1 chữ số được đệm 0', () => {
    expect(formatDuration(65_000)).toBe('1:05')
  })

  it('số âm hoặc 0 không lỗi', () => {
    expect(formatDuration(-100)).toBe('0:00')
    expect(formatDuration(0)).toBe('0:00')
  })
})
