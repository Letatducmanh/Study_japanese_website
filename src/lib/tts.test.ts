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

  describe('làm sạch chuỗi đọc (toSpeakable)', () => {
    function spokenText(): string {
      return (speak.mock.calls[0][0] as SpeechSynthesisUtterance).text
    }

    it('từ vựng (mặc định word): bỏ phần [..] trước khi đọc', () => {
      speakJapanese('[お]土産')
      expect(spokenText()).toBe('土産')
    })

    it('câu ngữ pháp (kind sentence): nối danh sách → bằng 、', () => {
      speakJapanese('書きます → 書いて', { kind: 'sentence' })
      expect(spokenText()).toBe('書きます、書いて')
    })

    it('mặc định kind là word: lấy cách viết đầu tiên của "晩 / 夜"', () => {
      speakJapanese('晩 / 夜')
      expect(spokenText()).toBe('晩')
    })

    it('chuỗi chỉ gồm ký hiệu bị bỏ thì không huỷ và không đọc gì', () => {
      speakJapanese('～')
      expect(cancel).not.toHaveBeenCalled()
      expect(speak).not.toHaveBeenCalled()
    })
  })
})
