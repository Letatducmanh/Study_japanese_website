# Quickstart: kiểm tra search-speaker-and-jump

Mọi lệnh chạy ở gốc repo. Hợp đồng địa chỉ: [contracts/lesson-jump-url.md](contracts/lesson-jump-url.md). Trạng thái tạm: [data-model.md](data-model.md).

## A. Tự động

```text
npm run check                                   # content:validate + tsc -b + eslint + vitest (phải xanh)
npm run build                                   # e2e chạy trên bản build (npm run preview, cổng 4173)
npx playwright test tests/e2e/search.spec.ts tests/e2e/search-jump.spec.ts
npm run test:e2e                                # cả bộ; chỉ Q-2 (browse.spec.ts "mở trang chủ → …") được đỏ như đã ghi
```

Mỗi commit phải qua `npm run check` trước khi commit.

### Bằng chứng "đỏ trước" (Constitution IV)

Trước khi sửa mã của từng câu chuyện, chạy các test mới của câu chuyện đó trên mã cũ và dán kết quả đỏ vào `specs/005-search-speaker-and-jump/evidence.md` (tên test + dòng lỗi chính), rồi mới sửa.

| Câu chuyện | Test phải ĐỎ trên mã hiện tại | Lý do đỏ |
|---|---|---|
| 1 | `SearchPage.test.tsx` — bấm loa giữ nguyên địa chỉ | `Link` bao nút nên bấm loa điều hướng sang trang bài |
| 1 | `SearchPage.test.tsx` — nút loa không nằm trong `<a>` | `button.closest('a')` khác `null` |
| 1 | `search.spec.ts` — bấm loa vẫn ở `/search` | Trình duyệt chuyển sang `/b/mnn1/…` |
| 2 | `lesson-url.test.ts` | Chưa có module |
| 2 | `VocabTab.test.tsx` — tô sáng, cuộn, nới bộ lọc, từ trùng, ID lạ | Chưa có prop, chưa có hàng `id` |
| 2 | `LessonPage.jump.test.tsx` (cả hai kiểu router) | Chưa đọc `tab`/`word` |
| 2 | `SearchPage.test.tsx` — liên kết mang `?tab=vocab&word=<id>` | Liên kết chưa mang `word` |
| 2 | `search-jump.spec.ts` | Chưa nhảy, chưa tô sáng |

Nếu một test dự kiến đỏ lại xanh ngay: dừng và hỏi (test chưa chứng minh được lỗi).

## B. Ảnh chụp 360×740 (lưu ở `.screens/`, không commit)

Chạy `npm run build` rồi `npm run preview`, sau đó dùng script tạm `.screens/_shot-005.mjs` (theo mẫu `_shot-us2.mjs`; thư mục đã bị gitignore):

| # | Ảnh | Cảnh |
|---|---|---|
| 1 | `005-search-results.png` | `/search?q=gakusei` có kết quả, tiêu điểm bàn phím ở nút loa |
| 2 | `005-search-after-speak.png` | Sau khi bấm loa: vẫn `/search?q=gakusei` |
| 3 | `005-lesson-jump-light.png` | Trang bài sau khi bấm từ: hàng tô sáng giữa khung, sáng |
| 4 | `005-lesson-jump-dark.png` | Như trên, giao diện tối |
| 5 | `005-lesson-jump-last.png` | Từ cuối bài (mở rộng) tô sáng, không bị thanh dưới che |
| 6 | `005-lesson-jump-unknown.png` | `?word=khong-co` mở bình thường, không tô sáng |

## C. Chạy tay (`npm run dev`, http://localhost:5173, cửa sổ 360 px)

| # | Làm | Kỳ vọng |
|---|---|---|
| 1 | `/search`, gõ `gakusei`, bấm loa ở kết quả bất kỳ | Nghe đọc; địa chỉ, ô tìm kiếm, danh sách không đổi |
| 2 | Bấm loa liên tiếp ở 3 kết quả | Không chuyển trang, không lỗi ở console |
| 3 | Tab bằng bàn phím tới loa; nhấn Enter, rồi Space | Chỉ phát âm |
| 4 | Gõ `sato`: bấm thân hàng `佐藤` rồi Quay lại, rồi bấm hàng `砂糖` | Hai lần tới hai bài khác nhau (Bài 2 và Bài 14), đúng hàng được tô sáng; Quay lại về `sato` |
| 5 | Ở `/b/mnn1/13` mở tab Ngữ pháp; gõ `nodo ga kawakimasu` ở tìm kiếm, bấm kết quả | Mở Bài 13 ở tab Từ vựng, hàng "のどが かわきます" (từ mở rộng) giữa khung, có viền và nhãn "Từ vừa tìm" |
| 6 | F5 | Giống lần đầu |
| 7 | Sửa tay địa chỉ thành `?tab=vocab&word=khong-co` | Trang bài bình thường, không tô sáng |
| 8 | Bật "giảm chuyển động" của hệ điều hành, lặp mục 5 | Tới ngay, không cuộn mượt |

Hàng nhiều trường hợp để thử thủ công bộ lọc: đặt `editionFilterDefault: new` tạm trong `content/manifest.yaml` không bắt buộc (chỉ dùng thử, không commit); bài kiểm đơn vị đã bao các trường hợp ở bảng R-4 của `research.md`.
