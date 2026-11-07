# src/ui

Giao diện dùng chung, chỉ nhận props, không tự lấy dữ liệu.

- `tokens.css` — nguồn của màu, chữ, bo góc (khối `@theme`, chế độ sáng/tối).
- `primitives/` — nút, thẻ, chip, công tắc, khung trạng thái (`ErrorState`, `LoadingState`, `NotFound`, `ThemeToggle`...); `index.ts` là barrel.
- `jp/` — thành phần chữ Nhật: `Ruby` (furigana), `SpeakButton` (đọc to).
- `quiz/` — thẻ đáp án dùng cho các dạng bài: `TextChoiceCard`, `BlankChoiceCard`.
- `signature/` — nhận diện "Tuyến tàu": `StationBadge`, `heatmap.ts` (thang màu thành thạo), `mascot/` (chú chó Shiba, cảnh sân ga, họa tiết Nhật).

Thành phần chỉ một vùng tính năng dùng thì để trong vùng đó (ví dụ `KanjiCard` ở `src/features/browse/`).
