# Bằng chứng: data-and-logic-fixes (002)

Ghi kết quả chạy thật của spec này. Mỗi bằng chứng ĐỎ ghi: lệnh đã chạy, ngày giờ, tên test đỏ, thông báo lỗi chính, lý do. Xem `tasks.md` (quy ước **ĐỎ**).

## Ngoại lệ tài liệu

Ngày 10/11/2026, Mạnh cho phép **một lần** sửa `docs/reference/Ke_hoach_Website.md` đúng hai chỗ; không sửa gì khác trong `docs/reference/**`:

- Dòng 322 (bảng quy ước nhóm từ): thêm một câu nói một bài có thể có nhiều bảng "Từ vựng mở rộng" (`### 2.`, `### 3.`, …), mỗi bảng một chủ đề. Lý do: T060 và T061 thêm bảng `### 3. Từ vựng mở rộng ★` ở Bài 6 và Bài 13; parser nhận mọi mục có chữ "mở rộng" nên không phải đổi định dạng, chỉ làm rõ tài liệu (Hiến pháp I).
- Dòng 691 (tiêu chí hoàn thành): "272 từ mở rộng" → "275 từ mở rộng". Dòng này đã ghi sẵn "1.020 từ chính" nên không có gì phải đổi ở phần đó (yêu cầu nêu "1.023 → 1.020" nhưng văn bản thực tế đã là 1.020).

Hai chỗ này đã sửa trong cây làm việc khi cập nhật tài liệu spec (chưa commit); sẽ vào commit của US5 (T066).

## Baseline

(T002 ghi kết quả bốn lệnh 1–4 của cổng G và ghi chú các file chưa commit ngoài phạm vi spec.)

Ngày 10/11/2026, nhánh `002-data-and-logic-fixes`, sau commit `b23576a` (T001). Bốn lệnh 1–4 của cổng G:

| Lệnh | Kết quả |
|---|---|
| `npm test -- --testTimeout=30000` | 44 file, **220/220 đạt**, 34,79 giây |
| `npm run build` | thành công, JS gzip **185,24 KB** |
| `npm run content:validate` | OK, **568 cảnh báo**; `mnn1: 1023 từ chính, 272 từ mở rộng, 132 mẫu ngữ pháp`; `kanji-master-n5: 134 Kanji` |
| `npm run lint` | 0 lỗi |

Khớp `research.md` R0.

Cây làm việc có file chưa commit **ngoài phạm vi spec** (không đưa vào commit nào của spec 002): extension companion (`.specify/extensions.yml`, `.specify/extensions/`, `.specify/events.py`, `.specify/integrations/claude.manifest.json` đã sửa, `.claude/settings.json`, `.claude/skills/speckit-companion-*`), `specs/001-repo-restructure/.spec-context.json`, `specs/002-data-and-logic-fixes/.spec-context.json` và `.gitignore` (do hook companion `before-step` tạo khi bắt đầu implement), `docs/Kanji_Master_N5.md`, `docs/Ke_hoach_Website.md`, `docs/MNN1_Ngu_Phap.md`, `docs/MNN1_Tu_Vung.md`, `Ảnh mobile/`. Riêng `docs/reference/Ke_hoach_Website.md` đã sửa trước (ngoại lệ tài liệu) và sẽ vào commit US5 (T066).

## Q-1

(T002a ghi ba lần chạy `npm run check` liên tiếp: ngày giờ, xanh/đỏ, số test, thời gian của `pipeline.test.ts`.)

Sửa: `scripts/content/pipeline.test.ts` thêm `vi.setConfig({ testTimeout: 30000, hookTimeout: 30000 })` (chỉ tác dụng trong file này; không đổi cấu hình vitest chung, `package.json`, hay test nào khác). Ba lần `npm run check` liên tiếp (cổng thẳng, không ngoại lệ), ngày 10/11/2026:

| Lần | Giờ bắt đầu | Kết quả | Số test | Thời gian vitest |
|---|---|---|---|---|
| 1 | 20:15:17 | **XANH** (exit 0), `content:validate` OK 568 cảnh báo | 220/220, 44 file | 31,86 giây |
| 2 | 20:16:20 | **XANH** (exit 0), 568 cảnh báo | 220/220, 44 file | 34,13 giây |
| 3 | 20:17:22 | **XANH** (exit 0), 568 cảnh báo | 220/220, 44 file | 67,97 giây (máy chậm hơn hẳn lần này, vẫn xanh) |

Thời gian riêng của `scripts/content/pipeline.test.ts` (`npx vitest run scripts/content/pipeline.test.ts --reporter=verbose`): test 1 = 1342 ms, test 2 = 1023 ms. Không có lần nào quá hạn; không cần ngoại lệ nào. Trước khi sửa, lần chạy `npm run check` ngày 10/11/2026 (32 giây) cũng xanh, nên Q-1 là lỗi chập chờn; bản sửa chỉ tăng biên an toàn từ 5 giây lên 30 giây cho file này.

## US1

## US2

## US3

## US4

## US5
