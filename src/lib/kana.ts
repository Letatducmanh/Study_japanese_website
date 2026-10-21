import { bind, toHiragana, unbind } from 'wanakana'

/** Gắn WanaKana vào ô nhập: gõ romaji tự đổi sang hiragana khi gõ (mục 3.2 dạng 3). */
export function bindKanaInput(el: HTMLInputElement): () => void {
  bind(el)
  return () => unbind(el)
}

/** Đổi mọi dạng (romaji, katakana, hiragana) về hiragana — dùng khi chấm điểm. */
export function toHiraganaFold(text: string): string {
  return toHiragana(text, { passRomaji: false })
}
