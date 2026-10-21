export interface SentenceOrderChunk {
  id: string
  text: string
}

export interface SentenceOrderQuestion {
  /** Thứ tự đúng. */
  chunks: SentenceOrderChunk[]
  /** Thứ tự xáo trộn ban đầu hiển thị cho người học. */
  shuffledIds: string[]
  vi: string
}
