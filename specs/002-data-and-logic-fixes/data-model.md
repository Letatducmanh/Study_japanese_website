# Data Model: data-and-logic-fixes

Không thêm bảng, không đổi lược đồ IndexedDB, không đổi schema Zod của nội dung. Tài liệu này ghi các thực thể bị ảnh hưởng và quy tắc mới.

## KanjiItem (nội dung, sinh lúc build)

| Trường | Quy tắc mới / giữ nguyên |
|---|---|
| `id` | `kanji-<chữ>` — **không đổi** |
| `hanViet` | Các cụm Hán Việt của ô nguồn nối bằng `" / "`. Ô một cụm: giống hệt trước |
| `meaning` | Các nghĩa trong ngoặc nối bằng `" / "`, cùng thứ tự với `hanViet`. Ô một cụm: giống hệt trước |
| các trường khác | không đổi |

Bất biến: với ô nguồn `A1 (m1) / A2 (m2)`, ghép `A1 (m1) / A2 (m2)` từ `hanViet.split(" / ")` và `meaning.split(" / ")` tái tạo đúng ô nguồn (kiểm bằng test khứ hồi). Độ dài hai mảng bằng nhau.

Ảnh hưởng: chỉ `kanji-行` và `kanji-長`.

## VocabItem (nội dung)

| Trường | Quy tắc |
|---|---|
| `id` | `mnn1-lNN-hash8(kana ghép kanji)` — không chứa `section`; **không đổi** khi chuyển phần |
| `section` | `main` → `extended` cho 3 mục dưới đây |
| `sectionTitle` | tiêu đề bảng mở rộng chứa mục (bảng mới) |

| Mục | Bài | ID (giữ nguyên) | Trước | Sau |
|---|---|---|---|---|
| DVD | 6 | `mnn1-l06-20bdf436` | main | extended |
| おなかが すきます | 13 | `mnn1-l13-cd7659ef` | main | extended |
| のどが かわきます | 13 | `mnn1-l13-af449570` | main | extended |

Số liệu: tổng chính 1023 → **1020**, mở rộng 272 → **275**. Bài 6: 52/9 → 51/10; Bài 13: 40/9 → 38/11 (chính/mở rộng). `BookLessonSummary.mainVocabCount` của hai bài giảm tương ứng (mẫu số của độ thành thạo bài).

## Mastery và độ thành thạo của bài (tiến độ, không đổi lược đồ)

`computeLessonScores(allMastery, bookId, lessons) → Map<số bài, điểm>`:

- Có khóa cho bài **khi và chỉ khi** tồn tại ít nhất một bản ghi mastery của một từ vựng thuộc bài đó (mã từ giải ra `bookId` + `lesson`; từ chính hay mở rộng đều tính).
- Giá trị: như cũ (`lessonMasteryScore(trung bình các từ đã làm, mainVocabCount)`). Bài đã làm toàn sai → giá trị 0 nhưng **có** khóa.
- Bài chưa có lượt: **không có khóa** (trước đây: khóa với giá trị 0).

Người dùng: `WeaknessPage` (mục "bài thấp nhất"), `BookPage` (màu ô; `?? null` → "chưa có dữ liệu").

## Phiên ôn tập (trạng thái tạm, Zustand `PendingSessionConfig`)

Không đổi kiểu `PendingSessionConfig` (feature `practice`). `planWeakReview` (feature `weakness`) trả kiểu **`WeakReviewPlan` khai báo cục bộ** trong `review-plan.ts`, cùng các trường và tương thích cấu trúc với `PendingSessionConfig`, không import từ `features/practice` (luật lớp). Dùng các trường sẵn có:

| Trường | Dùng trong "Luyện ngay" | Dùng trong "Ôn lại" |
|---|---|---|
| `bookId`, `lesson` | của từ đầu tiên trong danh sách | của từ được ôn |
| `questionTypeIds` | `REVIEW_MODE_IDS` | `REVIEW_MODE_IDS` |
| `questionCount` | số từ trong `onlyItemIds` (≤ 20) | 1 |
| `includeExtended` | `true` | `true` |
| `onlyItemIds` | ≤ 20 mã **từ phân biệt** yếu nhất, **mọi bài** | `[mã từ]` |

Nguồn của `onlyItemIds` ở "Luyện ngay": khi bấm nút, `WeaknessPage` lấy `listWeak(200)`, lọc từ vựng, bỏ trùng, rồi chọn 20 từ phân biệt. Danh sách "Top từ yếu nhất" hiển thị vẫn dùng `listWeak(20)` (không đổi).

Quy tắc mới ở phía chạy phiên:

- `onlyItemIds` chỉ chọn *mục cần luyện*; *bối cảnh* (đáp án nhiễu) lấy từ toàn bộ từ vựng của các bài chứa các mục đó.
- Tập bài cần tải = (`bookId`, `lesson`) của cấu hình **luôn có mặt** + các bài suy ra từ `onlyItemIds`. Cần vậy vì mã ngữ pháp/Kanji (ví dụ "Làm lại câu sai" sau câu ngữ pháp sai) không giải ra bài qua `parseVocabItemId`.

Xem `contracts/review-session.md`.

## Kết quả tìm kiếm (trạng thái tạm)

`VocabSearchResult` không đổi kiểu (`id, bookId, lesson, kana, kanji, romaji, meaning, score`). Thay đổi là tập và thứ tự kết quả. Xem `contracts/search.md`.
