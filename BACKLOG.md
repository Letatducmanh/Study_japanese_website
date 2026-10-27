# BACKLOG

Những điểm biết trước nhưng cố ý không xử lý ngay (quyết định của người dùng khi duyệt từng giai đoạn). Không phải lỗi cần sửa gấp — ghi lại để không quên.

## 1. Matching / Speed-truefalse tự ghi Attempt trong component

`MatchingComponent.tsx` và `SpeedTrueFalseComponent.tsx` tự gọi `progressRepository.recordAttempt` ngay trong component, không qua session runner chung như các dạng bài khác. Quyết định (Prompt 1, phụ lục F): **không gộp lại** vì CLAUDE.md quy tắc #4 cấm sửa session runner để thêm dạng bài — việc chuẩn hoá cách ghi Attempt cần đánh giá riêng, không làm kèm việc đổi giao diện. Theo dõi ở đây, xử lý khi có kế hoạch riêng được duyệt.

- `src/features/practice/modes/matching/MatchingComponent.tsx`
- `src/features/practice/modes/speed-truefalse/SpeedTrueFalseComponent.tsx`

## 2. Nút "Tiếp tục Bài N" ở trang chủ chưa đọc được tiến độ chỉ có ngữ pháp/kanji

(Prompt 1, giai đoạn 2) `loadContinueLesson()` (`src/features/home/continue-lesson.ts`) tìm bản ghi `Mastery` mới nhất có `itemId` đọc được `bookId`/`lesson` qua `parseVocabItemId` — chỉ áp dụng cho mastery của **từ vựng**. Nếu người dùng chỉ luyện ngữ pháp hoặc Kanji (chưa có mastery từ vựng nào), hero vẫn hiện nút mặc định "Bắt đầu học" dù đã có tiến độ khác. Không có hàm `parseGrammarItemId` tương đương để đọc `bookId`/`lesson` từ ID ngữ pháp (Kanji không gắn với lesson). Cần bổ sung cách đọc tiến độ cho ngữ pháp/Kanji nếu muốn nút "Tiếp tục" chính xác hơn — để ở Prompt 3 cùng lúc với việc nối dữ liệu thật cho 3 thẻ "Hôm nay của bạn".

## 3. Trang chủ bản đầy đủ (web-home.png) còn 3 khối chưa làm

(Prompt 1, giai đoạn 2) Theo yêu cầu, giai đoạn 2 chỉ làm lại khung ứng dụng + hero + 3 thẻ "Hôm nay của bạn" + vị trí mascot. Ảnh `Web · Trang chủ@1x.png` còn có: thanh số liệu nhanh (25 bài học / 16 dạng luyện tập / "Có tiếng..."), lưới "Chọn cách luyện" (16 dạng theo 4 nhóm kỹ năng), và dải 25 ga "Tuyến Minna no Nihongo 1" — đều là phần nội dung mới (không tồn tại trong `HomePage.tsx` trước đó), cần dữ liệu thật (danh sách bài, danh sách dạng luyện) nên để lại cho lúc trang chủ được nối dữ liệu thật (Prompt 3) thay vì dựng khung rỗng ở giai đoạn chỉ-sửa-hiển-thị này.
