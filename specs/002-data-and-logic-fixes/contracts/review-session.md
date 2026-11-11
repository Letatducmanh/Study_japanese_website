# Hợp đồng: phiên "Luyện ngay" (Điểm yếu) và "Ôn lại" (Sổ lỗi sai)

## Phía chọn từ (feature `weakness`)

### `REVIEW_MODE_IDS` (`src/features/weakness/review-modes.ts`)

`['flashcard', 'mcq-jp-vi', 'mcq-vi-jp']`. Một nguồn duy nhất cho `WeaknessPage` và `MistakesPage`. Mọi id phải có trong `questionRegistry` sau khi nạp `register-all` (test ở `src/test/review-mode-ids.test.ts`).

### Nguồn dữ liệu của nút "Luyện ngay" (`WeaknessPage.handlePracticeNow`)

Hai danh sách khác nhau, **không gộp**:

| Danh sách | Nguồn | Dùng để |
|---|---|---|
| "Top từ yếu nhất" hiển thị trên trang | `progressRepository.listWeak(20)` | Chỉ hiển thị; **giữ nguyên** như hiện nay |
| Tập từ của phiên "Luyện ngay" | `progressRepository.listWeak(200)`, gọi **lúc bấm nút** (bất đồng bộ) | Đưa vào `planWeakReview` |

Lý do: `listWeak(20)` trả 20 bản ghi mastery (cặp từ × kỹ năng, lẫn ngữ pháp/Kanji). Sau khi lọc từ vựng và bỏ trùng thì có thể còn ít hơn 20 từ, dù người học yếu nhiều từ hơn. Lấy rộng hơn (200 bản ghi, thứ hạng yếu nhất trước) rồi mới chọn 20 từ phân biệt thì phiên đủ 20 từ khi có đủ từ yếu.

Sau khi lấy bản ghi: lọc mục từ vựng, bỏ trùng mã, giải ra `VocabItem` (`resolveVocabItems`); mã mà nội dung không còn thì bỏ qua (không lỗi). Rồi gọi `planWeakReview`.

### `planWeakReview` (`src/features/weakness/review-plan.ts`, hàm thuần)

Đầu vào: danh sách mastery yếu đã xếp hạng (kết quả `listWeak(200)`), danh sách `VocabItem` đã giải mã từ mã.
Đầu ra: `WeakReviewPlan | null`.

`WeakReviewPlan` là **kiểu khai báo cục bộ trong `review-plan.ts`**, gồm các trường `bookId`, `lesson`, `questionTypeIds`, `questionCount`, `includeExtended`, `onlyItemIds`. Kiểu này **tương thích cấu trúc** với `PendingSessionConfig` (feature `practice`) nên `WeaknessPage` truyền thẳng vào `setPendingConfig`. `review-plan.ts` **không import** gì từ `@/features/practice` (luật lớp: ngoại lệ TD-2 chỉ áp cho `WeaknessPage.tsx` và `MistakesPage.tsx`; không thêm ngoại lệ ESLint).

| Quy tắc | |
|---|---|
| P1 | Chỉ mục từ vựng; bỏ mastery ngữ pháp/Kanji. Chỉ có mastery ngữ pháp/Kanji → `null` |
| P2 | Mỗi từ một lần (một từ yếu ở nhiều kỹ năng chỉ tính một) |
| P3 | Tối đa **20 từ phân biệt**, theo thứ hạng yếu nhất trước, **bất kể bài** |
| P4 | `onlyItemIds` = các mã đó; `questionCount` = số mã; `questionTypeIds` = `REVIEW_MODE_IDS`; `includeExtended: true` |
| P5 | `bookId`/`lesson` = của từ đầu tiên (để nút "Luyện tiếp" ở màn kết quả quay về một bài hợp lệ) |
| P6 | Không có từ nào → `null` (nút không làm gì như hiện nay) |
| P7 | Mã không còn trong nội dung (không giải ra được `VocabItem`) bị bỏ qua, không tính vào 20 từ |

"Ôn lại" (MistakesPage) giữ cấu hình như hiện tại: 1 từ, `questionCount: 1`.

## Phía chạy phiên (feature `practice`)

### `buildReviewPools` (`src/features/practice/review-pools.ts`, hàm thuần)

Đầu vào: các file bài đã tải, `onlyItemIds?`, `includeExtended`.
Đầu ra: `{ targets: QuizItem[], ctxPool: QuizItem[] }`.

| Quy tắc | |
|---|---|
| R1 | Không có `onlyItemIds`: `targets` = `ctxPool` = từ vựng bài (lọc `includeExtended`) + ngữ pháp bài — **giống hệt hành vi hiện tại** |
| R2 | Có `onlyItemIds`: `targets` = từ vựng khớp mã (+ ngữ pháp như cũ); `ctxPool` = **toàn bộ** từ vựng của mọi bài đã tải (lọc `includeExtended`) + ngữ pháp |
| R3 | Không đổi thứ tự hay nội dung của từng `QuizItem` |

`PracticeRunPage` gọi `buildSession({ items: targets, ctxPool, questionTypes, questionCount, seed })`. `ctxPool` là tham số **đã có** của `buildSession`; không sửa `session.ts`, `registry.ts`, `grading.ts`.

### Tập bài cần tải (`PracticeRunPage`)

Tập bài = **(`config.bookId`, `config.lesson`) luôn có mặt** + các bài suy ra từ `onlyItemIds` (qua `parseVocabItemId`), mỗi bài tải bằng `loadLesson` (đã có cache), bỏ trùng.

- Gộp bài của `config` là bắt buộc: mã ngữ pháp hoặc Kanji (ví dụ "Làm lại câu sai" sau một câu ngữ pháp sai) không giải ra bài qua `parseVocabItemId`. Nếu chỉ dùng bài suy ra từ `onlyItemIds` thì tập bài rỗng và trang báo lỗi (hồi quy).
- Không có `onlyItemIds`: chỉ một bài `(config.bookId, config.lesson)` như cũ.
- Mã không giải ra được hoặc bài không tải được thì bỏ qua mục đó; tập bài (kể cả bài của `config`) không tải được bài nào → màn lỗi như hiện nay.

## Điều kiện nghiệm thu

- Một từ trong Sổ lỗi sai: dựng phiên 3 dạng mặc định, quan sát qua `buildSession` rằng cả `flashcard`, `mcq-jp-vi`, `mcq-vi-jp` đều nằm trong các cặp đủ điều kiện.
- 12 từ yếu ở 3 bài: `planWeakReview` trả `onlyItemIds` đủ 12 mã, `questionCount` 12; tập từ của phiên gồm đủ 12 từ.
- Trang `WeaknessPage` có 30 từ yếu, mỗi từ 2 kỹ năng, kèm mastery ngữ pháp: bấm "Luyện ngay" tạo phiên đúng 20 từ phân biệt (kiểm ở cấp trang, không chỉ ở `planWeakReview`).
- Chỉ có mastery ngữ pháp/Kanji: trang Điểm yếu không lỗi, "Luyện ngay" không làm gì (P1, P6).
- Từ yếu không còn trong nội dung: bị bỏ qua, không lỗi (P7).
- "Làm lại câu sai" sau câu ngữ pháp sai: phiên vẫn dựng được (tập bài gồm bài của `config`).
- Hành vi không có `onlyItemIds` giữ nguyên (test hồi quy).
- Giới hạn đã biết: không bảo đảm mỗi từ ra đúng một lần (`buildSession` chọn ngẫu nhiên cặp; plan.md Q2). SC-003 chỉ yêu cầu tập từ của phiên gồm đủ các từ.
