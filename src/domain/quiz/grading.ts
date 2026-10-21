import { toHiraganaFold } from '@/lib/kana'

const IGNORED_CHARS_PATTERN = new RegExp(
  '[\\s' +
    String.fromCharCode(0x3000) +
    ',、。.!！?？~〜・\\-ー]',
  'gu',
)

/**
 * Chuẩn hóa để so khớp dạng gõ (mục 6.4): NFKC, bỏ khoảng trắng/dấu câu/ー,
 * không phân biệt hoa/thường. Đổi về hiragana diễn ra riêng ở `gradeTyped`
 * vì cần giữ nguyên chuỗi gốc trước khi fold kana ↔ romaji.
 */
function normalizeForCompare(text: string): string {
  return text
    .normalize('NFKC')
    .replace(IGNORED_CHARS_PATTERN, '')
    .toLowerCase()
}

export interface TypedGradeResult {
  correct: boolean
  /** Đáp án hiển thị ở màn hình kết quả — ưu tiên đáp án đầu tiên trong danh sách. */
  expected: string
}

/**
 * So khớp câu trả lời gõ tay với danh sách đáp án chấp nhận. Đổi cả hai bên về hiragana
 * trước khi so sánh để chấp nhận mọi cách gõ (romaji, katakana, hiragana) và chấp nhận
 * nhiều đáp án hợp lệ (VD: "ぎゅうにゅう / ミルク").
 */
export function gradeTyped(
  given: string,
  acceptedAnswers: string[],
): TypedGradeResult {
  const givenFolded = normalizeForCompare(toHiraganaFold(given))
  const correct = acceptedAnswers.some(
    (answer) => normalizeForCompare(toHiraganaFold(answer)) === givenFolded,
  )
  return { correct, expected: acceptedAnswers[0] ?? '' }
}
