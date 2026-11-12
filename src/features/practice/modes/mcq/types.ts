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
  /** Văn bản để đọc bằng TTS — luôn có ở hướng "Nghe → Nghĩa". */
  promptAudio?: string
  choices: McqChoice[]
  correctChoiceId: string
  /** Quyết định nút loa ở đề; không ảnh hưởng tự đọc (`promptAudio`) và nút "Nghe lại". */
  promptSpeak: PromptSpeak
}
