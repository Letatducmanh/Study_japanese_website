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
