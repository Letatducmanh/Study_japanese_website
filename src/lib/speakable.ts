/**
 * Làm sạch chuỗi tiếng Nhật trước khi đưa cho giọng đọc (Web Speech API).
 *
 * CHỈ DÙNG CHO VIỆC ĐỌC. KHÔNG dùng để chấm điểm, hiển thị hay lưu: chữ trên màn hình,
 * nội dung giáo trình và `answers.*` giữ nguyên các ký hiệu ghi chú này.
 *
 * Hàm thuần, không phụ thuộc DOM/`window`: file này cũng được `scripts/` import (test nội dung)
 * và khi đó được biên dịch với thư viện không có DOM.
 * Quy tắc và ví dụ: specs/003-speakable-text/contracts/speakable-contract.md (C-1).
 */

/**
 * `word`: từ vựng, chữ Kanji, từ ví dụ — dấu `/` là "cách viết khác" (đọc cách đầu tiên).
 * `sentence`: câu ví dụ ngữ pháp — `→` và `/` là danh sách (nối bằng `、`).
 */
export type SpeakKind = 'word' | 'sentence'

/** Phần tùy chọn `[..]` / `［..］`, kèm khoảng trắng đứng ngay trước (khớp `stripBracket` lúc build). */
const OPTIONAL_PART = /\s*[[［][^\]］]*[\]］]/gu
/** Ký hiệu "chỗ trống": ～ (toàn-rộng), 〜, ~. */
const PLACEHOLDER = /[～〜~]/gu
const ANY_SLASH = /[/／]/u
const ALTERNATIVE_SEPARATOR = /\s*[/／]\s*/u
/** Chú thích trong ngoặc tròn `（..）` / `(..)`. */
const ANNOTATION = /[（(][^）)]*[）)]/gu
/** Dấu `…` đơn (mở đầu câu đáp); `……` đôi được giữ nguyên. */
const SINGLE_ELLIPSIS = /(?<!…)…(?!…)/gu
const ANY_LIST_SEPARATOR = /→|[/／]/u
const LIST_SEPARATOR = /\s*(?:→|[/／])\s*/u
const SENTENCE_END = /[。！？]$/u

/** Gộp khoảng trắng, bỏ khoảng trắng trước dấu câu, trim. */
function tidy(s: string): string {
  return s
    .replace(/\s+/gu, ' ')
    .replace(/\s+([、。！？])/gu, '$1')
    .trim()
}

function nonEmptyParts(s: string, separator: RegExp): string[] {
  return s
    .split(separator)
    .map((part) => part.trim())
    .filter((part) => part !== '')
}

/** Nối các mục danh sách bằng `、`; nếu mục trước đã kết thúc bằng 。！？ thì chỉ dùng khoảng ngắt. */
function joinListItems(parts: string[]): string {
  return parts.reduce(
    (joined, part, index) =>
      index === 0 ? part : joined + (SENTENCE_END.test(joined) ? ' ' : '、') + part,
    '',
  )
}

/**
 * Trả về chuỗi sẽ được ĐỌC (có thể là chuỗi rỗng nếu đầu vào chỉ gồm ký hiệu bị bỏ).
 * Nếu không quy tắc nào đổi gì thì trả về y nguyên đầu vào, kể cả dấu cách.
 */
export function toSpeakable(text: string, kind: SpeakKind = 'word'): string {
  let s = text.replace(OPTIONAL_PART, '').replace(PLACEHOLDER, '')

  if (kind === 'word') {
    if (ANY_SLASH.test(s)) s = nonEmptyParts(s, ALTERNATIVE_SEPARATOR)[0] ?? ''
  } else {
    s = s.replace(ANNOTATION, '').replace(SINGLE_ELLIPSIS, ' ')
    if (ANY_LIST_SEPARATOR.test(s)) {
      s = joinListItems(nonEmptyParts(s, LIST_SEPARATOR))
    }
  }

  if (s === text) return text
  return tidy(s)
}

/** Dấu phẩy ngăn cách các cách đọc của từ ví dụ ("じゅっぷん, じっぷん"). */
const READING_SEPARATOR = /\s*,\s*/u
/** Dấu chấm nối thân và đuôi của âm Kun ("あ・げる"). */
const KUN_DOT = /・/gu

/**
 * Chuỗi ĐỌC của một từ ví dụ ở trang Kanji: cách đọc kana đầu tiên.
 * "じゅっぷん, じっぷん" → "じゅっぷん". Không có phần nào thì trả về chuỗi rỗng.
 * Quy tắc và ví dụ: specs/004-kana-pronunciation/contracts/speech-contract.md (C-3).
 */
export function exampleWordSpeech(reading: string): string {
  return nonEmptyParts(reading, READING_SEPARATOR)[0] ?? ''
}

/**
 * Chuỗi ĐỌC của một chữ Kanji đơn: On đầu tiên rồi Kun đầu tiên, nối bằng "、", bỏ mọi "・".
 * Kun đầu chỉ được mở rộng thành dạng có đuôi khi nó là phần gốc của một Kun khác
 * ("ひと" có "ひと・つ" → "ひとつ"); không lấy "Kun đầu tiên có ・" (上 phải ra "うえ", không phải "あげる").
 * Quy tắc và ví dụ: specs/004-kana-pronunciation/contracts/speech-contract.md (C-4).
 */
export function kanjiCharSpeech(
  on: readonly string[],
  kun: readonly string[],
): string {
  const onFirst = on[0]?.trim() ?? ''
  const kunFirst = kun[0]?.trim() ?? ''
  const stem = kunFirst + '・'
  const kunSpoken =
    kunFirst !== '' && !kunFirst.includes('・')
      ? (kun.find((k) => k.trim().startsWith(stem)) ?? kunFirst)
      : kunFirst
  return [onFirst, kunSpoken.trim().replace(KUN_DOT, '')]
    .filter((part) => part !== '')
    .join('、')
}
