/**
 * Dạng bài dùng cho "Luyện ngay" (trang Điểm yếu) và "Ôn lại" (Sổ lỗi sai) — bộ cố định,
 * đủ để ôn nhanh nhận biết + nhớ lại. Một nguồn duy nhất cho cả hai trang; mọi id phải có
 * trong registry sau khi nạp `register-all` (test ở `src/test/review-mode-ids.test.ts`).
 */
export const REVIEW_MODE_IDS = ['flashcard', 'mcq-jp-vi', 'mcq-vi-jp']
