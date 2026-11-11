# Bằng chứng: data-and-logic-fixes (002)

Ghi kết quả chạy thật của spec này. Mỗi bằng chứng ĐỎ ghi: lệnh đã chạy, ngày giờ, tên test đỏ, thông báo lỗi chính, lý do. Xem `tasks.md` (quy ước **ĐỎ**).

## Ngoại lệ tài liệu

Ngày 10/11/2026, Mạnh cho phép **một lần** sửa `docs/reference/Ke_hoach_Website.md` đúng hai chỗ; không sửa gì khác trong `docs/reference/**`:

- Dòng 322 (bảng quy ước nhóm từ): thêm một câu nói một bài có thể có nhiều bảng "Từ vựng mở rộng" (`### 2.`, `### 3.`, …), mỗi bảng một chủ đề. Lý do: T060 và T061 thêm bảng `### 3. Từ vựng mở rộng ★` ở Bài 6 và Bài 13; parser nhận mọi mục có chữ "mở rộng" nên không phải đổi định dạng, chỉ làm rõ tài liệu (Hiến pháp I).
- Dòng 691 (tiêu chí hoàn thành): "272 từ mở rộng" → "275 từ mở rộng". Dòng này đã ghi sẵn "1.020 từ chính" nên không có gì phải đổi ở phần đó (yêu cầu nêu "1.023 → 1.020" nhưng văn bản thực tế đã là 1.020).

Hai chỗ này đã sửa trong cây làm việc khi cập nhật tài liệu spec và được commit cùng commit của US5 (T066).

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

### Đỏ trước khi sửa (T036)

Lệnh: `npx vitest run scripts/content/parse-kanji.test.ts`, ngày 10/11/2026 20:23, với `splitHanVietMeaning` còn là **bản giữ hành vi cũ** (T034, regex một cặp ngoặc `/^(.+?)\s*\((.+)\)$/u`). Kết quả: **8 đỏ, 17 xanh** (25 test). Mọi test đỏ đều đỏ do `AssertionError` đúng lý do (regex cũ cắt sai ô nhiều cặp ngoặc hoặc không phát hiện ngoặc lệch), không phải lỗi import hay cú pháp.

| # | Test đỏ | Thông báo lỗi chính | Lý do |
|---|---|---|---|
| 1 | `splitHanVietMeaning — bảng ví dụ › hai cặp ngoặc: HÀNH (đi; tiến hành) / HÀNG (hàng, dòng)` | `expected { hanViet: 'HÀNH', …(1) } to deeply equal { hanViet: 'HÀNH / HÀNG', …(1) }` | Regex cũ: `(.+?)` lấy đoạn đầu, `(.+)` tham lam nuốt đến `)` cuối nên nghĩa thành `đi; tiến hành) / HÀNG (hàng, dòng` |
| 2 | `… hai cặp ngoặc: TRƯỜNG (dài) / TRƯỞNG (người đứng đầu)` | `expected { hanViet: 'TRƯỜNG', …(1) } to deeply equal { hanViet: 'TRƯỜNG / TRƯỞNG', …(1) }` | Như trên |
| 3 | `splitHanVietMeaning — lỗi trả null › ngoặc không cân (thừa ")")` | `expected { hanViet: 'A', meaning: 'x)' } to be null` | Regex cũ không phát hiện `)` thừa, trả giá trị cắt sai |
| 4 | `… › một đoạn không có ngoặc` (`HÀNH / HÀNG (y)`) | `expected { Object (hanViet, meaning) } to be null` | Regex cũ gộp `HÀNH / HÀNG` thành Hán Việt, không phát hiện đoạn thiếu ngoặc |
| 5 | `parseKanjiFile — 行 và 長 trên kanji.md thật › 行: hanViet "HÀNH / HÀNG", …` | `expected 'HÀNH' to be 'HÀNH / HÀNG'` | Dữ liệu thật của 行 bị cắt sai |
| 6 | `… › 長: hanViet "TRƯỜNG / TRƯỞNG", …` | `expected 'TRƯỜNG' to be 'TRƯỜNG / TRƯỞNG'` | Dữ liệu thật của 長 bị cắt sai |
| 7 | `… › khứ hồi: ghép lại từ hanViet và meaning ra đúng ô nguồn của mọi chữ` | `số cụm của 行: expected 1 to be 2` | Số cụm Hán Việt và nghĩa không đủ để ghép lại ô nguồn của 行 |
| 8 | `parseKanjiFile — ô nghĩa sai quy cách báo lỗi kèm số dòng › ngoặc không cân (thừa ")")` (`TỨ (bốn))`) | `expected false to be true` (`issues.hasErrors`) | Bản cũ không báo lỗi cho ngoặc thừa |

Xanh ngay (đúng dự kiến, chốt chặn hoặc đặc tả): `NGOẠI (ngoài)`, ngoặc lồng cân `A (x (y))`, dấu `/` trong ngoặc, các ca lỗi `A (x`, `A (x) / `, `A (x) y`, ô rỗng (bản cũ cũng không khớp regex nên đã báo lỗi), năm ca lỗi mức file còn lại, ô hợp lệ, **FR-011** (132 chữ khác 行/長 giống hệt regex cũ), 3 test sẵn có. Không có test dự kiến đỏ nào xanh ngay.

`scripts/content/compare-kanji-json.test.ts` (7 test) xanh ngay: đây là công cụ kiểm dữ liệu, không phải bản sửa lỗi.

### Sau khi sửa (T038–T041)

- `splitHanVietMeaning` viết lại bằng bộ đọc cân bằng ngoặc (tách đoạn bằng `/` ở độ sâu 0, nối bằng " / "). `npx vitest run scripts/content/parse-kanji.test.ts scripts/content/compare-kanji-json.test.ts`: **32/32 xanh**.
- **So sánh JSON Kanji (T039)**: `npm run content:build` rồi `npx tsx scripts/content/compare-kanji-json.ts <trước> <sau>` in `OK: chỉ kanji-行, kanji-長 khác` (mã thoát 0). 17 file JSON: **15 file giống từng byte**, 2 file khác (`ch09.json`, `ch15.json`, hai chương chứa 行 và 長). Trong hai file đó chỉ hai mục `kanji-行`, `kanji-長`, chỉ hai trường `hanViet` và `meaning` đổi:
  - `kanji-行`: `HÀNH / HÀNG` | `đi; tiến hành / hàng, dòng`
  - `kanji-長`: `TRƯỜNG / TRƯỞNG` | `dài / người đứng đầu`
  - 132 chữ còn lại giống từng byte.
- e2e `tests/e2e/kanji.spec.ts` (360×740, `npm run build` rồi `npx playwright test tests/e2e/kanji.spec.ts`): **2/2 xanh** (行 và 長 hiện đúng hai dòng, không còn dấu ngoặc lẻ ở dòng nghĩa, không cuộn ngang).

Cổng G của story (10/11/2026, trước commit):

| Lệnh | Kết quả |
|---|---|
| `npm test -- --testTimeout=30000` | 45 file, **249/249 đạt** (220 + 29 mới: 7 của `compare-kanji-json`, 22 của `parse-kanji`) |
| `npm run build` | thành công, JS gzip **185,24 KB** (không đổi) |
| `npm run content:validate` | OK, **568 cảnh báo** (không tăng), 134 Kanji |
| `npm run lint` | 0 lỗi |
| `npm run check` | **xanh** (exit 0), 249/249, 35,77 giây |

## US4

## US5

### Đỏ trước khi sửa (T058)

Lệnh: `npx vitest run scripts/content/pipeline.test.ts scripts/content/parse-vocab.test.ts --testTimeout=30000`, ngày 10/11/2026 20:40, khi `content/n5/mnn1/vocab.md` còn 1.023 từ chính / 272 từ mở rộng. Kết quả: **5 đỏ, 6 xanh** (11 test). Cả 5 đỏ là `AssertionError` đúng lý do (số liệu cũ, ba mục còn ở phần chính), không phải lỗi import hay cú pháp.

| # | Test đỏ | Thông báo lỗi chính | Lý do |
|---|---|---|---|
| 1 | `parse-vocab.test.ts › đọc đúng 25 bài, 1.020 từ chính và 275 từ mở rộng, không lỗi` | `expected [ { lesson: 1, …(9) }, …(1022) ] to have a length of 1020 but got 1023` | 1023 từ chính (3 mục thừa) |
| 2 | `pipeline.test.ts › số từ chính của giáo trình mnn1 là 1.020` | `expected 1023 to be 1020` | như trên |
| 3 | `pipeline.test.ts › số từ mở rộng của giáo trình mnn1 là 275` | `expected 272 to be 275` | ba mục chưa chuyển sang mở rộng |
| 4 | `pipeline.test.ts › Bài 6 có 51 từ chính + 10 từ mở rộng; Bài 13 có 38 + 11` | `expected [ 52, 9 ] to deeply equal [ 51, 10 ]` | Bài 6 còn 52/9; Bài 13 chưa chuyển |
| 5 | `pipeline.test.ts › ba từ chuyển sang mở rộng giữ nguyên mã định danh và ở phần extended` | `mnn1-l06-20bdf436 (Bài 6): expected 'main' to be 'extended'` | DVD (và hai mục Bài 13) còn ở `section: main` |

Xanh ngay (đúng dự kiến, chốt chặn): kiểm không lỗi và ID không trùng, 132 mẫu ngữ pháp, 134 Kanji tách 119 chương + 15 phụ lục, `write:false`, và hai test sẵn có của `parse-vocab.test.ts`. Không có test dự kiến đỏ nào xanh ngay.

### Sau khi sửa (T060–T065)

- `content/n5/mnn1/vocab.md`: xóa hàng DVD khỏi "### 1. Từ vựng chính" của Bài 6 và thêm `### 3. Từ vựng mở rộng ★ — Thiết bị giải trí (娯楽)` (cùng dòng tiêu đề bảng 5 cột, hàng DVD giữ nguyên các cột); xóa hai hàng `おなかが すきます` và `のどが かわきます` khỏi từ vựng chính của Bài 13 và thêm `### 3. Từ vựng mở rộng ★ — Cảm giác đói và khát (空腹・のどの渇き)` chứa hai hàng đó (giữ nguyên cột Ghi chú). Không sửa parser (đã nhận mọi mục có chữ "mở rộng").
- Chạy lại T058: **11/11 xanh**. `npm run content:validate`: `mnn1: 1020 từ chính, 275 từ mở rộng, 132 mẫu ngữ pháp`, `kanji-master-n5: 134 Kanji`, `OK — 568 cảnh báo` (không tăng). Bài 6: 51 chính + 10 mở rộng; Bài 13: 38 chính + 11 mở rộng.
- **Mã định danh không đổi**: test xác nhận `mnn1-l06-20bdf436` (DVD), `mnn1-l13-cd7659ef` (おなかが すきます), `mnn1-l13-af449570` (のどが かわきます) có đúng một mục trong `l06.json`/`l13.json` với `section: 'extended'`, không trùng mã trong cả hai bài.
- **T062 (giao diện tab Từ vựng)**: `src/features/browse/VocabTab.tsx` nhóm theo `extended:${sectionTitle}` nên mỗi bảng mở rộng là một nhóm riêng (một `<h3>` mỗi nhóm). Xác nhận trên bản dựng thật ở 360×740 (`npm run content:build; npm run build; npm run preview`):
  - Bài 6, lọc Tất cả: nhóm `Từ vựng chính`, `Món ăn Nhật Bản (日本の食べ物)`, `Thiết bị giải trí (娯楽)`; lọc Mở rộng: 2 nhóm, 10 dòng.
  - Bài 13, lọc Tất cả: `Từ vựng chính`, `Gọi món tại Nhà hàng (レストランでの注文)`, `Cảm giác đói và khát (空腹・のどの渇き)`; lọc Mở rộng: 2 nhóm, 11 dòng.
  - Không cuộn ngang (`scrollWidth` = 360). **Hai bảng mở rộng của một bài không bị gộp thành một nhóm.**
  - Ảnh (ngoài git, `.screens/` đã gitignore): `.screens/us5-bai6-vocab-extended-360x740.png`, `.screens/us5-bai13-vocab-extended-360x740.png`, `.screens/us3-kanji-gyou-360x740.png` (`/kanji/行`), `.screens/us3-kanji-chou-360x740.png` (`/kanji/長`).
- **So sánh JSON Kanji chạy lại sau US5** (`compare-kanji-json.ts`): snapshot sau US3 so với sau US5 → `OK: không có khác biệt`, **17/17 file giống từng byte**, nên `relatedVocabIds` của Kanji không đổi. So với snapshot gốc trước US3 → `OK: chỉ kanji-行, kanji-長 khác`.
- **T064 (tài liệu)**: `git grep` các số 1.023, 1023, 272 (trừ `audit-hien-trang.md`, `specs/001-repo-restructure/spec.md`, `specs/002-…`) chỉ còn `docs/SPECKIT_ROADMAP.md:29`, là tiêu đề câu hỏi quyết định "Số từ chính 1.023 hay 1.020" (mô tả lịch sử, giữ). `docs/reference/Ke_hoach_Website.md` dòng 322 và 691 đã sửa theo ngoại lệ tài liệu và vào commit này; không sửa gì khác trong `docs/reference/**`. `docs/ARCHITECTURE.md` §9.2 và `docs/SPECKIT_ROADMAP.md` §2, §4.2 đã ghi 1.020/275 (giữ). Lưu ý ngoài phạm vi: file **chưa theo dõi** `docs/Ke_hoach_Website.md` (bản sao ở `docs/`, không phải `docs/reference/`) vẫn ghi 272; không sửa.
- `contracts/hanviet-cell.md` (kiểm theo yêu cầu bổ sung): đã có đủ ba hành vi từ chối, mục "Lỗi": ngoặc không cân (thiếu `)` hoặc thừa `)`, ví dụ `TỨ (bốn))`), đoạn không có ngoặc (ví dụ `HÀNH / HÀNG (y)`), đoạn rỗng và chữ thừa sau `)` cuối. Không cần sửa contract.

Cổng G của story (10/11/2026, trước commit):

| Lệnh | Kết quả |
|---|---|
| `npm test -- --testTimeout=30000` | 45 file, **255/255 đạt** (249 + 6 mới ở `pipeline.test.ts`) |
| `npm run build` | thành công, JS gzip **185,24 KB** (không đổi) |
| `npm run content:validate` | OK, **568 cảnh báo** (không tăng); **1020 từ chính, 275 từ mở rộng**, 132 mẫu ngữ pháp, 134 Kanji |
| `npm run lint` | 0 lỗi |
| `npm run check` | **xanh** (exit 0), 255/255, 35,42 giây |
