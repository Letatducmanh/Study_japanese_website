/** Bọc Web Speech API để đọc tiếng Nhật; không ném lỗi khi thiết bị không hỗ trợ. */

import { toSpeakable, type SpeakKind } from './speakable'

export function isTtsSupported(): boolean {
  return typeof window !== 'undefined' && !!window.speechSynthesis
}

// Web Speech API không có trường "giới tính giọng đọc" chuẩn hóa giữa các trình duyệt —
// đoán qua tên giọng (các tên thường gặp của hệ điều hành/engine phổ biến).
const FEMALE_VOICE_HINTS = [
  'haruka',
  'nanami',
  'kyoko',
  'o-ren',
  'oren',
  'ayumi',
  'sayaka',
  'female',
  '女性',
]
const MALE_VOICE_HINTS = ['ichiro', 'keita', 'otoya', 'male', '男性']

function femaleVoiceScore(voice: SpeechSynthesisVoice): number {
  const name = (voice.name ?? '').toLowerCase()
  if (FEMALE_VOICE_HINTS.some((hint) => name.includes(hint))) return 2
  if (MALE_VOICE_HINTS.some((hint) => name.includes(hint))) return -1
  return 0
}

function getJapaneseVoice(): SpeechSynthesisVoice | null {
  if (!isTtsSupported()) return null
  const voices = window.speechSynthesis.getVoices()
  const exact = voices.filter((v) => v.lang === 'ja-JP')
  const candidates =
    exact.length > 0
      ? exact
      : voices.filter((v) => v.lang.toLowerCase().startsWith('ja'))
  if (candidates.length === 0) return null
  // Ưu tiên giọng nữ (dễ nghe hơn theo phản hồi) khi thiết bị có nhiều lựa chọn.
  return [...candidates].sort(
    (a, b) => femaleVoiceScore(b) - femaleVoiceScore(a),
  )[0]
}

/** true nếu trình duyệt có ít nhất một giọng đọc tiếng Nhật đã nạp xong. */
export function hasJapaneseVoice(): boolean {
  return getJapaneseVoice() !== null
}

/** Lắng nghe lúc trình duyệt nạp xong danh sách giọng đọc (thường là bất đồng bộ). */
export function onVoicesChanged(callback: () => void): () => void {
  if (!isTtsSupported()) return () => {}
  const synth = window.speechSynthesis
  synth.addEventListener('voiceschanged', callback)
  return () => synth.removeEventListener('voiceschanged', callback)
}

export interface SpeakOptions {
  rate?: number
  /** `sentence` cho câu ví dụ ngữ pháp; mặc định `word` (từ vựng, chữ Kanji). */
  kind?: SpeakKind
}

/**
 * Đọc văn bản tiếng Nhật; chuỗi được làm sạch (bỏ ký hiệu ghi chú) trước khi đọc.
 * Không làm gì nếu thiết bị không hỗ trợ, văn bản rỗng, hoặc chuỗi sau làm sạch rỗng.
 */
export function speakJapanese(text: string, options: SpeakOptions = {}): void {
  if (!isTtsSupported() || !text.trim()) return
  const spoken = toSpeakable(text, options.kind ?? 'word')
  if (!spoken.trim()) return
  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(spoken)
  utterance.lang = 'ja-JP'
  utterance.rate = options.rate ?? 1
  const voice = getJapaneseVoice()
  if (voice) utterance.voice = voice
  window.speechSynthesis.speak(utterance)
}
