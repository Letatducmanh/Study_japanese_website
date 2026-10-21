import { describe, expect, it } from 'vitest'
import { stripDiacritics } from './normalize'

describe('stripDiacritics', () => {
  it('bỏ dấu và viết thường tiếng Việt có chữ đ', () => {
    expect(stripDiacritics('nước ngoài')).toBe('nuoc ngoai')
    expect(stripDiacritics('Đất nước')).toBe('dat nuoc')
  })

  it('giữ nguyên chuỗi không dấu', () => {
    expect(stripDiacritics('Watashi')).toBe('watashi')
  })

  it('không đổi kana/kanji', () => {
    expect(stripDiacritics('がいこく')).toBe('がいこく')
    expect(stripDiacritics('外国')).toBe('外国')
  })
})
