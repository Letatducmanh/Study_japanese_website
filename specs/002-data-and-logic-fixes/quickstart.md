# Quickstart: tự kiểm tra feature data-and-logic-fixes

Chạy từ gốc repo, nhánh `002-data-and-logic-fixes`. Baseline: xem [research.md](./research.md) R0 (220 test, 568 cảnh báo, JS 185,24 KB gzip, lint sạch).

## Cổng chung (trước commit của mỗi story)

```bash
npm test -- --testTimeout=30000
npm run build
npm run content:validate     # 0 lỗi, không quá 568 cảnh báo; số từ ghi ở dòng cuối
npm run lint
npm run check                # Hiến pháp IV: phải xanh trước mọi commit
```

Q-1 (`pipeline.test.ts` quá hạn 5 giây) **đã sửa ở spec 002** (task T002a: timeout riêng cho file đó, ba lần `npm run check` liên tiếp xanh), nên cổng dùng thẳng `npm run check`, không có ngoại lệ.

Mong đợi sau khi xong cả 5 story (5 commit): test > 220 và không đỏ; `content:validate` in `mnn1: 1020 từ chính, 275 từ mở rộng, 132 mẫu ngữ pháp`; build thành công, JS gzip ≤ 200 KB.

## A. Kanji (US3) — so sánh trước/sau

1. Trước khi sửa parser: `npm run content:build`, chép `public/content/kanji-master-n5/` sang thư mục tạm A.
2. Sửa parser, `npm run content:build` lại, chép sang thư mục tạm B.
3. So sánh từng file: chỉ `ch04.json`… chứa 行 và 長 khác; trong đó chỉ hai mục `kanji-行`, `kanji-長`, chỉ các trường `hanViet` và `meaning`.
4. Mở `npm run dev` → `/kanji/行`: dòng Hán Việt "HÀNH / HÀNG", dòng nghĩa "đi; tiến hành / hàng, dòng", không còn dấu ngoặc lẻ.

Mong đợi: 132 chữ khác giống từng byte.

## B. Số liệu (US5)

1. Sau khi chuyển 3 hàng: `npm run content:validate` → 1020 chính, 275 mở rộng.
2. Test pipeline: ID `mnn1-l06-20bdf436`, `mnn1-l13-cd7659ef`, `mnn1-l13-af449570` có mặt, `section: 'extended'`.
3. `npm run dev` → Bài 6 và Bài 13 → tab Từ vựng: ba mục không còn ở "Từ vựng chính", xuất hiện khi bật "Gồm từ vựng mở rộng"/lọc mở rộng, dưới tiêu đề bảng mới.
4. Tiến độ cũ: trong trình duyệt đã có mastery của DVD (làm vài câu trước khi dựng lại nội dung); sau khi dựng lại, trang Điểm yếu vẫn thấy từ đó.

## C. Tìm kiếm (US4)

1. Script thăm dò (ngoài repo, thư mục tạm của phiên) chạy bộ truy vấn trên JSON thật trước/sau; `sinh vien`: 156 → ≤ 3 kết quả.
2. `npm run dev` → `/search`: gõ nhanh "sinh vien" không thấy danh sách nháy theo từng phím; gõ "a" không ra danh sách; gõ "gakusei" ra 学生 đầu tiên.
3. Test: `npx vitest run src/data/search-index.test.ts`.

## D. Điểm yếu (US1)

1. Trong trình duyệt mới (xóa tiến độ ở Cài đặt): `/weak` → thông báo chưa đủ dữ liệu; `/b/mnn1` → mọi ô bài màu trung tính.
2. Làm một phiên ở Bài 3, cố sai nhiều. `/weak`: mục "bài thấp nhất" chỉ có Bài 3. `/b/mnn1`: chỉ ô Bài 3 có màu theo độ thành thạo.
3. Test: `npx vitest run src/domain/mastery/lesson-scores.test.ts`.

## E. Luyện ngay / Ôn lại (US2)

1. Làm sai vài từ ở ít nhất 3 bài khác nhau (dùng phiên luyện bài). `/weak` → "Luyện ngay 20 câu yếu nhất": số câu bằng số từ yếu (tối đa 20 từ phân biệt, kể cả khi mỗi từ yếu ở 2 kỹ năng), câu hỏi lấy từ cả 3 bài.
2. `/mistakes` → "Ôn lại" một từ: cho phép thấy dạng trắc nghiệm (có thể phải thử vài lần vì dạng được chọn ngẫu nhiên giữa 3 dạng); trắc nghiệm có 4 lựa chọn.
3. Test: `npx vitest run src/features/weakness src/features/practice src/test`.

## F. Chứng minh "đỏ trước, xanh sau"

Mỗi story **một commit** gồm test, bản sửa và `evidence.md` (không commit test đỏ riêng, vì Hiến pháp IV yêu cầu `npm run check` xanh trước mọi commit). Vì vậy bằng chứng đỏ nằm ở hai chỗ:

1. `specs/002-data-and-logic-fixes/evidence.md`, mục của story: lệnh đã chạy, ngày giờ, tên test đỏ, thông báo lỗi chính, lý do. Ghi **trước khi** viết mã sửa.
2. Thân commit của story có một dòng `Đỏ trước khi sửa: <tên test> — <lý do>`.

## G. Ràng buộc trên toàn nhánh và e2e

1. Không đụng vùng cấm và giao diện: `git diff --stat a593f51..HEAD -- src/domain/quiz/registry.ts src/domain/quiz/session.ts src/domain/quiz/grading.ts src/ui src/i18n` phải rỗng. Không dùng `main...HEAD` vì `main` cục bộ chậm 19 commit so với `a593f51`.
2. e2e ở 360×740: `npm run content:build; npm run build; npx playwright test`. Spec e2e mới: `weakness-practice` (Điểm yếu → Luyện ngay, Sổ lỗi sai → Ôn lại), `kanji` (`/kanji/行`), `search`. Ngoại lệ đã biết Q-2: `browse.spec.ts` "mở trang chủ → …" đỏ từ commit `8746c15`, không sửa ở spec này.
