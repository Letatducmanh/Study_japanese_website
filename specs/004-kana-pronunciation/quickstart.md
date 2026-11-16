# Quickstart: kiểm tra kana-pronunciation

Điều kiện: đã có nhánh `004-kana-pronunciation` tách từ `staging` có spec 003 (`promptSpeak` trong `modes/mcq/types.ts`). Mọi lệnh chạy ở gốc repo.

## A. Tự động

```
npm run check      # content:validate + tsc -b + eslint + vitest (phải xanh)
npm run build
npx playwright test tests/e2e/kana-speech.spec.ts
```

`npm run test:e2e` chạy cả bộ; chỉ Q-2 (`browse.spec.ts` "mở trang chủ → …") được đỏ.

Test nội dung (`scripts/content/speakable-content.test.ts`) in một dòng `[kana-speech] …`: số từ có chuỗi đọc không rỗng/không Hán (1.295/1.295), số chữ Kanji và ví dụ (134 và 657), số mục bảng sửa và số câu bị đổi (1).

## B. Chạy tay trong app thật (`npm run dev`, http://localhost:5173)

Cần trình duyệt có giọng tiếng Nhật; bấm nút loa và nghe.

| # | Chỗ | Bấm loa ở | Nghe |
|---|---|---|---|
| 1 | `/b/mnn1/1`, tab Từ vựng | `～人` | じん |
| 2 | `/b/mnn1/11`, tab Từ vựng | `～人` | にん |
| 3 | `/b/mnn1/4`, tab Từ vựng | `何時`, `何分`, `～分` | なんじ, なんぷん, ふん |
| 4 | `/b/mnn1/2` và `/b/mnn1/6` | `何` | なん, なに |
| 5 | `/b/mnn1/1` | `あの方` | あのかた |
| 6 | `/b/mnn1/20` | `この間` | このあいだ |
| 7 | `/b/mnn1/6` | `[お]花見` | はなみ |
| 8 | `/search`, gõ `gakusei` | loa ở kết quả đầu | がくせい |
| 9 | `/practice/setup` Bài 1, Flashcard | loa trên thẻ có kanji | cách đọc kana |
| 10 | Chính tả nghe, Bài 4 | tự đọc và "Nghe lại" ở `何時` | なんじ (gõ `なんじ` đúng) |
| 11 | Trắc nghiệm "Nhật → Nghĩa" | loa ở đề kanji | kana; không tự đọc lúc mở |
| 12 | Trắc nghiệm "Nghe → Nghĩa" | tự đọc lúc mở, "Nghe lại" | kana |
| 13 | Trắc nghiệm "Kanji → Cách đọc" | ẩn trước khi chọn; loa sau khi chọn | kana |
| 14 | `/kanji/一` | loa chữ đơn; loa từ ví dụ `一人` | イチ、ひとつ; ひとり |
| 15 | `/kanji/行` và `/kanji/上` | loa chữ đơn | コウ、いく; ジョウ、うえ |
| 16 | Kanji có ví dụ `十分`, `何` | loa ví dụ | じゅっぷん; なに |
| 17 | `/b/mnn1/1`, tab Ngữ pháp, mở mục chứa "あの 方は…" | loa ở câu | あの かたは どなたですか |

Màn hình hiển thị vẫn là chữ Hán như cũ ở mọi chỗ trên.

## C. Nghe 20 câu ứng viên (sau Story 4)

Mở `.screens/tts-sentences-004.html` bằng trình duyệt, bấm "Đọc" từng câu, đánh dấu đúng/sai, bấm "Sao chép kết quả" rồi gửi lại. Câu nào sai thì thêm một mục vào bảng sửa (xem `contracts/speech-contract.md` C-5).

## D. Kiểm vùng cấm

Trước commit, so **phần đã staged** với `staging` (cùng lệnh với `tasks.md`, mục "Kiểm vùng cấm theo commit"). Commit 1–3 chỉ loại trừ ĐÚNG file test nội dung:

```
git diff --cached staging --name-only | grep -vxF "scripts/content/speakable-content.test.ts" | grep -E "domain/quiz/(registry|grading)|session|scripts/content|^content/|^public/content" || echo "OK: không đụng vùng cấm"
git diff --cached staging -U0 -- . ':(exclude)specs/004-kana-pronunciation' | grep -E "^[+-].*schemaVersion" || echo "OK: không đụng schemaVersion (ngoài tài liệu specs/004)"
git diff --cached staging --name-status | grep -E "^(R|D)" || echo OK
```

Commit 4 loại trừ ĐÚNG hai đường dẫn (không loại cả `content/**`) và kiểm thêm file JSON là `A` duy nhất dưới `content/`:

```
git diff --cached staging --name-only | grep -vxF "scripts/content/speakable-content.test.ts" | grep -vxF "content/overrides/speech-corrections.json" | grep -E "domain/quiz/(registry|grading)|session|scripts/content|^content/|^public/content" || echo "OK: không đụng vùng cấm"
git diff --cached staging --name-status | grep -E "^A[[:space:]]+content/overrides/speech-corrections.json$"
git diff --cached staging --name-only | grep -c "^content/"
```

Các lệnh `OK` phải ra `OK`; lệnh `A` ra đúng một dòng; lệnh đếm ra `1`. Sau commit: `git diff staging..HEAD --stat` phải lặp lại danh sách đã lưu từ `git diff --cached staging --stat`.

Bất biến nội dung dựng (Story 4): băm `public/content/**` (bỏ `README.md`) sau `npm run content:build` phải bằng mốc đã lập ở đầu (mốc chỉ ghi sau khi hai lần dựng liên tiếp cho cùng băm), trước và sau khi thêm `speech-corrections.json`.
