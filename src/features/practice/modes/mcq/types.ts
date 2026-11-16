import type { VocabItem } from '@/domain/types'

export interface McqChoice {
  id: string
  text: string
  reading?: string
}

/**
 * Khi nào hiện nút loa cạnh đề: `always` luôn hiện; `after-answer` chỉ hiện sau khi
 * chọn đáp án (đề là chữ kanji, nghe trước sẽ lộ cách đọc là đáp án); `never` không hiện
 * (đề là tiếng Việt, giọng Nhật sẽ đọc nhầm ngôn ngữ).
 */
export type PromptSpeak = 'always' | 'after-answer' | 'never'

export interface McqQuestion {
  item: VocabItem
  /** Văn bản hiển thị làm đề bài (không dùng khi câu hỏi chỉ phát âm thanh). */
  promptText?: string
  promptReading?: string
  /**
   * Văn bản tự đọc lúc mở câu hỏi và cho nút "Nghe lại" — luôn có ở hướng "Nghe → Nghĩa";
   * là kana của từ.
   */
  promptAudio?: string
  /**
   * Chuỗi nút loa ở đề sẽ ĐỌC (kana của từ khi đề hiển thị kanji). Ưu tiên hơn
   * `promptAudio`/`promptText` cho nút loa ở đề; không ảnh hưởng tự đọc lúc mở
   * (chỉ `promptAudio` tự đọc) và nút "Nghe lại". Khác `promptSpeak`: trường đó chỉ
   * quyết định có hiện nút loa hay không.
   */
  promptSpeech?: string
  choices: McqChoice[]
  correctChoiceId: string
  /**
   * Có hiện nút loa ở đề hay không (`always` | `after-answer` | `never`); không quyết định
   * nút đọc gì (xem `promptSpeech`), không ảnh hưởng tự đọc (`promptAudio`) và nút "Nghe lại".
   */
  promptSpeak: PromptSpeak
}
