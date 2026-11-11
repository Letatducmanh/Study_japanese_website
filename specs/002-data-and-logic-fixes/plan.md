# Implementation Plan: Sửa lỗi dữ liệu và logic (data-and-logic-fixes)

**Branch**: `002-data-and-logic-fixes` | **Date**: 2026-11-07 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-data-and-logic-fixes/spec.md`

## Summary

Sửa 5 lỗi người học nhìn thấy, **không đổi giao diện** (không đổi token, font, bố cục, chuỗi). Mỗi lỗi có test tái hiện đỏ trước khi sửa, một commit mỗi story. Cách tiếp cận (chi tiết, số đo và phương án đã loại ở [research.md](./research.md)):

1. **Kanji** — thay regex một cặp ngoặc trong `scripts/content/parse-kanji.ts` bằng bộ đọc cân bằng ngoặc. Chỉ 2 chữ đổi: 行 và 長.
2. **Tìm kiếm** — nguyên nhân chính đo được là MiniSearch ghép từ bằng HOẶC (156 kết quả cho "sinh vien"); sửa bằng AND, fuzzy theo độ dài từ, boost, ngưỡng tương đối, debounce.
3. **Điểm yếu** — `computeLessonScores` chỉ trả bài đã có lượt làm; sửa luôn màu đỏ sai của bài chưa học ở trang giáo trình.
4. **Luyện ngay / Ôn lại** — hai nguyên nhân đã khớp mã: `PracticeRunPage` không truyền `ctxPool` (mất đáp án nhiễu) và `WeaknessPage` chỉ lấy từ của một bài. Sửa ở phía gọi bằng `ctxPool` có sẵn của `buildSession`; **không đụng registry/session/grading**.
5. **Số liệu** — chuyển 3 hàng sang bảng mở rộng riêng của Bài 6 và Bài 13, ID giữ nguyên, 1.020 chính / 275 mở rộng, test và tài liệu khớp.
6. **Q-1 (kèm)** — tăng timeout riêng cho `scripts/content/pipeline.test.ts` (task T002a, commit riêng `fix(002)` trước các story) để `npm run check` ổn định; cổng kiểm tra dùng thẳng `npm run check`, không có ngoại lệ.

## Technical Context

**Language/Version**: TypeScript strict (~6.0.3), Node 24 (CI), React 19

**Primary Dependencies**: dùng sẵn có (MiniSearch 7, Zod 4, Zustand, Dexie, unified/remark cho pipeline). **Không thêm thư viện mới.**

**Storage**: IndexedDB (Dexie) qua `ProgressRepository` — không đổi lược đồ; `content/**/*.md` → `public/content/**/*.json` (sinh tự động)

**Testing**: Vitest 5 + Testing Library; test unit đặt cạnh file; test xuyên lớp đặt ở `src/test/`; Playwright e2e ở viewport 360×740 (Hiến pháp IV): **thêm 3 e2e mới** — `tests/e2e/weakness-practice.spec.ts` (Điểm yếu → Luyện ngay, và Sổ lỗi sai → Ôn lại), `tests/e2e/kanji.spec.ts` (`/kanji/行`), `tests/e2e/search.spec.ts` (tìm kiếm); chạy lại toàn bộ e2e hiện có (ngoại lệ đã biết Q-2: `browse.spec.ts` "mở trang chủ → …" đỏ từ commit `8746c15`, không sửa ở spec này)

**Target Platform**: web PWA (Vercel), sau này Capacitor; spec này không đổi nền tảng

**Project Type**: web app một codebase (Vite + React)

**Performance Goals**: JS ban đầu ≤ 200 KB gzip (baseline 185,24 KB, không được vượt); tìm kiếm không chặn gõ (debounce 250 ms)

**Constraints**: không đổi giao diện (FR-025); không sửa `domain/quiz/registry.ts`, `session.ts`, `grading.ts` (FR-026); `content:validate` không tăng quá 568 cảnh báo; mã định danh nội dung không đổi

**Scale/Scope**: 1.295 từ vựng, 134 Kanji, 25 bài; khoảng 11 file mã sửa/thêm (không tính test), khoảng 21 file test sửa/thêm (5 sửa, 13 unit/component mới, 3 e2e mới), 1 script công cụ (`compare-kanji-json.ts`), 1 file nội dung `.md`, 1 file tài liệu; thêm `evidence.md` ghi kết quả đỏ

## Constitution Check

*GATE: đạt trước Phase 0; đánh giá lại sau Phase 1 (bên dưới).*

| Nguyên tắc | Đánh giá | Ghi chú |
|---|---|---|
| I. Nội dung là dữ liệu | Đạt | Chỉ sửa `content/n5/mnn1/vocab.md` (bảng mở rộng mới) và parser; không viết cứng chữ Nhật/số bài trong code. Test dùng mã/số làm dữ liệu kỳ vọng được phép. `public/content/**` không sửa tay, không commit |
| II. Local-first | Đạt | Không đổi ghi dữ liệu; vẫn chỉ `dexie-repo.ts` import Dexie |
| III. Phân lớp & điểm cắm | Đạt, có điều kiện | Không sửa registry/session/grading. `review-plan.ts` (feature `weakness`) và `review-pools.ts` (feature `practice`) là hàm thuần. Ngoại lệ TD-2 của spec 001 chỉ áp cho `WeaknessPage.tsx` và `MistakesPage.tsx`, nên `review-plan.ts` **trả kiểu khai báo cục bộ** (tương thích cấu trúc với `PendingSessionConfig`) và không import từ `features/practice`; các test cần `usePracticeSessionStore` (`WeaknessPage.practice.test.tsx`, `MistakesPage.test.tsx`) và test so khớp id đặt ở `src/test/`. **Không thêm ngoại lệ ESLint**; chạy `npm run lint` ngay khi tạo các file này |
| IV. Test trước cho logic | Đạt | Mỗi lỗi: test được chạy và thấy đỏ trước khi viết mã sửa (FR-024), kết quả đỏ ghi vào `evidence.md`; mỗi story **một commit** gồm test và sửa, `npm run check` xanh trước commit (không commit test đỏ riêng). Parser, domain, tìm kiếm đều có unit test. 3 e2e mới ở 360×740: Điểm yếu → Luyện ngay, Kanji, tìm kiếm. Q-1 (`pipeline.test.ts` quá hạn 5 giây) **đã sửa ở spec 002** bằng T002a (timeout riêng cho file đó, ba lần `npm run check` liên tiếp xanh), nên cổng dùng thẳng `npm run check`, không có ngoại lệ |
| V. Điểm yếu là mục tiêu số một | Đạt | US1, US2 trực tiếp cải thiện phát hiện và luyện lại điểm yếu. Mã định danh không đổi (R5) |
| VI. Giao diện | Đạt | Không đổi giao diện; không thêm màu/chuỗi. Debounce không thêm chuỗi. Không động tới `tokens.css`, `vi.ts` |
| VII. Bảo mật & bản quyền | Đạt | Không động tới Supabase/khóa; không thêm nội dung chép nguyên văn mới (3 từ chỉ chuyển chỗ) |

**Kết quả cổng**: không có vi phạm; mục Complexity Tracking để trống.

**Đánh giá lại sau Phase 1**: các thiết kế ở `data-model.md` và `contracts/` không thêm lớp, thư viện, hay ngoại lệ ESLint. Đạt.

## Quyết định đã chốt (10/11/2026, theo `tasks.md`)

- **Q1 — Cách hiện 行: đã chốt.** Giữ nguyên mô hình dữ liệu và giao diện Kanji hiện có. 行 hiện hai dòng *"HÀNH / HÀNG"* và *"đi; tiến hành / hàng, dòng"* theo `contracts/hanviet-cell.md`; ghép lại theo thứ tự đúng nguyên văn nhưng không phải một chuỗi. Không đổi cách hiển thị. Chi tiết: research R1.
- **Q2 — Luyện ngay: đã chốt.** (a) Được sửa `PracticeRunPage` để tải đủ bài và truyền `ctxPool`; **không sửa** `registry.ts`, `session.ts`, `grading.ts`. (b) SC-003 là "tập từ của phiên gồm đủ các từ"; `buildSession` chọn ngẫu nhiên cặp (từ, dạng bài) nên **không đảm bảo mỗi từ ra đúng một lần** (đảm bảo phủ kín cần sửa `session.ts`, vùng cấm). Lợi kèm theo: "Làm lại câu sai" ở màn kết quả hết mất trắc nghiệm.

Hai thay đổi nhỏ cần biết (đã đưa vào spec): bài chưa làm ở trang giáo trình đổi từ đỏ sang trung tính (cùng lỗi US1); tên chủ đề hai bảng mở rộng mới ("Thiết bị giải trí", "Cảm giác đói và khát") do tôi đặt, Mạnh đổi tên được.

## Project Structure

### Documentation (this feature)

```text
specs/002-data-and-logic-fixes/
├── plan.md              # File này
├── research.md          # Baseline, xác minh từng lỗi, quyết định, phương án đã loại
├── data-model.md        # Thực thể và quy tắc dữ liệu bị ảnh hưởng
├── quickstart.md        # Cách tự kiểm tra từng lỗi
├── evidence.md          # Kết quả đỏ trước khi sửa của từng story (xem tasks.md)
├── contracts/
│   ├── hanviet-cell.md  # Hợp đồng tách ô Hán Việt (nghĩa)
│   ├── search.md        # Hợp đồng hành vi tìm kiếm
│   └── review-session.md# Hợp đồng phiên Luyện ngay / Ôn lại
├── checklists/requirements.md
└── tasks.md             # /speckit-tasks
```

### Source Code (repository root)

```text
content/n5/mnn1/vocab.md                          # SỬA: thêm "### 3. Từ vựng mở rộng ★" ở Bài 6, Bài 13; xóa 3 hàng khỏi bảng chính

scripts/content/
├── parse-kanji.ts                                # SỬA: bộ đọc cân bằng ngoặc (R1)
├── parse-kanji.test.ts                           # SỬA: test 行, 長, ngoặc lệch, khứ hồi, tương đương regex cũ
├── compare-kanji-json.ts                         # MỚI: script so sánh JSON Kanji trước/sau (chỉ 行, 長 được khác)
├── compare-kanji-json.test.ts                    # MỚI
├── parse-vocab.test.ts                           # SỬA: 272 → 275, 1020 chính
└── pipeline.test.ts                              # SỬA: tăng timeout riêng cho file (Q-1, T002a); số liệu riêng, kiểm ID 3 từ (dùng chung một lần chạy)

src/domain/mastery/
├── lesson-scores.ts                              # SỬA: chỉ bài có lượt làm (R3)
└── lesson-scores.test.ts                         # SỬA: kỳ vọng mới

src/features/browse/
├── BookPage.test.tsx                             # MỚI: bài chưa làm hiện trạng thái trung tính (BookPage.tsx không sửa)
├── SearchPage.tsx                                # SỬA: debounce lời gọi tìm kiếm
└── SearchPage.test.tsx                           # MỚI

src/features/practice/
├── review-pools.ts                               # MỚI: hàm thuần targets + ctxPool (R4)
├── review-pools.test.ts                          # MỚI
├── PracticeRunPage.tsx                           # SỬA tối thiểu: tải nhiều bài (luôn gồm bài của config), truyền ctxPool
├── PracticeRunPage.test.tsx                      # MỚI
└── PracticeResultPage.test.tsx                   # MỚI (PracticeResultPage.tsx không sửa)

src/features/weakness/
├── review-modes.ts                               # MỚI: REVIEW_MODE_IDS dùng chung
├── review-plan.ts                                # MỚI: hàm thuần chọn ≤ 20 từ yếu nhất, kiểu trả về khai báo cục bộ
├── review-plan.test.ts                           # MỚI
├── WeaknessPage.lessons.test.tsx                 # MỚI (US1)
├── WeaknessPage.tsx                              # SỬA: dùng review-plan, review-modes; lấy thêm bản ghi mastery khi bấm "Luyện ngay"
└── MistakesPage.tsx                              # SỬA: dùng review-modes

src/test/
├── review-mode-ids.test.ts                       # MỚI: so khớp id với registry thật
├── WeaknessPage.practice.test.tsx                # MỚI: cần usePracticeSessionStore nên đặt ở đây (không thêm ngoại lệ ESLint)
└── MistakesPage.test.tsx                         # MỚI: như trên

src/data/
├── search-index.ts                               # SỬA: cấu hình tìm kiếm (R2)
├── search-index.test.ts                          # SỬA: bộ truy vấn mẫu
└── search-index.real.test.ts                     # MỚI: 1.295 từ thật qua pipeline (một lần chạy pipeline riêng, timeout riêng)

src/lib/
├── use-debounced-value.ts                        # MỚI
└── use-debounced-value.test.ts                   # MỚI

tests/e2e/                                        # 360×740 (Hiến pháp IV)
├── weakness-practice.spec.ts                     # MỚI
├── kanji.spec.ts                                 # MỚI
└── search.spec.ts                                # MỚI

docs/reference/Ke_hoach_Website.md                # SỬA đúng hai chỗ (ngoại lệ tài liệu, đã làm, ghi ở evidence.md): dòng 691 (272 → 275), dòng 322 (một bài có thể có nhiều bảng mở rộng)
docs/SPECKIT_ROADMAP.md                           # SỬA khi xong (T072, sau khi Mạnh xác nhận Preview): đánh dấu spec 2; bỏ mục "tăng testTimeout" ở §4.6; ghi chú Q-1 đã sửa
specs/002-data-and-logic-fixes/evidence.md        # MỚI: kết quả đỏ của từng story
```

**Structure Decision**: giữ nguyên cây thư mục chuẩn (`docs/ARCHITECTURE.md` §8.1). Chỉ thêm hàm thuần cạnh nơi dùng (`features/practice`, `features/weakness`, `lib`), không tạo lớp hoặc thư mục mới ngoài `src/test/` đã có. Không động tới `src/ui/`, `src/i18n/`, `tokens.css` (giao diện không đổi).

## Complexity Tracking

Không có vi phạm hiến pháp cần biện minh.
