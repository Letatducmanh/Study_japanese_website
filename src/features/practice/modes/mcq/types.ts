import type { VocabItem } from '@/domain/types'

export interface McqChoice {
  id: string
  text: string
  reading?: string
}

export interface McqQuestion {
  item: VocabItem
  /** Văn bản hiển thị làm đề bài (không dùng khi câu hỏi chỉ phát âm thanh). */
  promptText?: string
  promptReading?: string
  /** Văn bản để đọc bằng TTS — luôn có ở hướng "Nghe → Nghĩa". */
  promptAudio?: string
  choices: McqChoice[]
  correctChoiceId: string
}
