import { describe, expect, it } from 'vitest'
import { playCorrectSound, playWrongSound } from './sfx'

describe('sfx', () => {
  it('không ném lỗi khi trình duyệt (jsdom) không hỗ trợ AudioContext', () => {
    expect(() => playCorrectSound()).not.toThrow()
    expect(() => playWrongSound()).not.toThrow()
  })
})
