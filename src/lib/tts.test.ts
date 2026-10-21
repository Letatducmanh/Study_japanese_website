import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { hasJapaneseVoice, isTtsSupported, speakJapanese } from './tts'

function makeVoice(lang: string, name = ''): SpeechSynthesisVoice {
  return { lang, name } as SpeechSynthesisVoice
}

describe('tts', () => {
  const originalSpeechSynthesis = window.speechSynthesis
  let speak: ReturnType<typeof vi.fn>
  let cancel: ReturnType<typeof vi.fn>
  let getVoices: ReturnType<typeof vi.fn>

  beforeEach(() => {
    speak = vi.fn()
    cancel = vi.fn()
    getVoices = vi.fn().mockReturnValue([])
    Object.defineProperty(window, 'speechSynthesis', {
      configurable: true,
      value: {
        speak,
        cancel,
        getVoices,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      },
    })
  })

  afterEach(() => {
    Object.defineProperty(window, 'speechSynthesis', {
      configurable: true,
      value: originalSpeechSynthesis,
    })
  })

  it('báo đã hỗ trợ khi có speechSynthesis', () => {
    expect(isTtsSupported()).toBe(true)
  })

  it('không có giọng tiếng Nhật thì hasJapaneseVoice = false', () => {
    expect(hasJapaneseVoice()).toBe(false)
  })

  it('tìm được giọng ja-JP khi có', () => {
    getVoices.mockReturnValue([makeVoice('en-US'), makeVoice('ja-JP')])
    expect(hasJapaneseVoice()).toBe(true)
  })

  it('speakJapanese huỷ câu đang đọc rồi gọi speak với lang ja-JP', () => {
    speakJapanese('こんにちは')
    expect(cancel).toHaveBeenCalledOnce()
    expect(speak).toHaveBeenCalledOnce()
    const utterance = speak.mock.calls[0][0] as SpeechSynthesisUtterance
    expect(utterance.lang).toBe('ja-JP')
    expect(utterance.text).toBe('こんにちは')
  })

  it('không gọi speak khi văn bản rỗng', () => {
    speakJapanese('   ')
    expect(speak).not.toHaveBeenCalled()
  })

  it('ưu tiên giọng nữ khi có nhiều lựa chọn tiếng Nhật', () => {
    const male = makeVoice('ja-JP', 'Microsoft Ichiro - Japanese (Japan)')
    const female = makeVoice('ja-JP', 'Microsoft Nanami - Japanese (Japan)')
    getVoices.mockReturnValue([male, female])
    speakJapanese('こんにちは')
    const utterance = speak.mock.calls[0][0] as SpeechSynthesisUtterance
    expect(utterance.voice).toBe(female)
  })
})
