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

describe('tts — bảng sửa cách đọc của câu (spec 004)', () => {
  const originalSpeechSynthesis = window.speechSynthesis
  let speak: ReturnType<typeof vi.fn>

  beforeEach(() => {
    speak = vi.fn()
    Object.defineProperty(window, 'speechSynthesis', {
      configurable: true,
      value: {
        speak,
        cancel: vi.fn(),
        getVoices: vi.fn().mockReturnValue([makeVoice('ja-JP')]),
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

  const spokenText = (): string =>
    (speak.mock.calls[0][0] as SpeechSynthesisUtterance).text

  const ANO_KATA = 'あの 方は どなたですか。 …ワット先生です。'

  it('câu "あの 方" (kind sentence) được đọc là "あの かた" theo bảng thật', () => {
    speakJapanese(ANO_KATA, { kind: 'sentence' })
    expect(spokenText()).toBe('あの かたは どなたですか。 ワット先生です。')
  })

  it('[đặc trưng] cùng chuỗi với kind mặc định word: bảng chỉ áp cho câu', () => {
    speakJapanese(ANO_KATA)
    expect(spokenText()).toContain('あの 方')
  })

  it('[đặc trưng] câu không chứa cụm đọc như trước', () => {
    speakJapanese('ミラーさんは アメリカ人ですか。', { kind: 'sentence' })
    expect(spokenText()).toBe('ミラーさんは アメリカ人ですか。')
  })
})
