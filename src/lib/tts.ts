/** Bọc Web Speech API để đọc tiếng Nhật; không ném lỗi khi thiết bị không hỗ trợ. */

export function isTtsSupported(): boolean {
  return typeof window !== 'undefined' && !!window.speechSynthesis
}

function getJapaneseVoice(): SpeechSynthesisVoice | null {
  if (!isTtsSupported()) return null
  const voices = window.speechSynthesis.getVoices()
  return (
    voices.find((v) => v.lang === 'ja-JP') ??
    voices.find((v) => v.lang.toLowerCase().startsWith('ja')) ??
    null
  )
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
}

/** Đọc văn bản tiếng Nhật; không làm gì nếu thiết bị không hỗ trợ hoặc văn bản rỗng. */
export function speakJapanese(text: string, options: SpeakOptions = {}): void {
  if (!isTtsSupported() || !text.trim()) return
  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'ja-JP'
  utterance.rate = options.rate ?? 1
  const voice = getJapaneseVoice()
  if (voice) utterance.voice = voice
  window.speechSynthesis.speak(utterance)
}
