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

### Đỏ trước khi sửa (T007)

Lệnh: `npx vitest run src/domain/mastery/lesson-scores.test.ts src/features/browse/BookPage.test.tsx src/features/weakness/WeaknessPage.lessons.test.tsx`, ngày 10/11/2026 20:55, khi `computeLessonScores` còn đặt khóa 0 cho bài chưa làm. Kết quả: **8 đỏ, 5 xanh** (13 test). Cả 8 đỏ là `AssertionError` đúng lý do (mọi bài đều có điểm, kể cả bài chưa làm), không phải lỗi import hay cú pháp. (Lần chạy đầu của hai file component đỏ vì `MissingAPIError: IndexedDB API missing`: mock `dexie-repo` chưa được áp do import `vi` bị đặt bí danh nên `vi.mock` không được đưa lên đầu file. Đó là lỗi test, đã sửa trước khi ghi nhận; bảng dưới là lần chạy sau khi sửa.)

| # | Test đỏ | Thông báo lỗi chính | Lý do |
|---|---|---|---|
| 1 | `lesson-scores.test.ts › chưa có dữ liệu nào: không bài nào có khóa (không phải 0)` | `expected 2 to be +0` (`result.size`) | Map có khóa 0 cho cả 2 bài chưa làm |
| 2 | `… › chỉ bài có mastery mới có khóa` | `expected true to be false` (`result.has(2)`) | Bài 2 chưa làm vẫn có khóa |
| 3 | `… › mastery của bookId khác không tạo khóa cho bài trùng số` | `expected 2 to be +0` | Mastery sách khác không làm Bài 1 có điểm, nhưng cả 2 bài vẫn có khóa 0 |
| 4 | `BookPage.test.tsx › bài chưa làm hiện màu trung tính; bài đã làm yếu hiện màu đỏ` | `expected 'flex aspect-square min-h-11 items-cen…' to contain 'border-slate-200'` | Bài 1 chưa làm hiện lớp đỏ của 0% thay vì lớp trung tính `heatmapClass(null)` |
| 5 | `BookPage.test.tsx › chưa có mastery nào: mọi ô trung tính, không ô nào đỏ` | `expected 'flex aspect-square min-h-11 items-cen…' not to contain 'border-danger'` | Khi chưa có mastery, mọi ô vẫn đỏ |
| 6 | `WeaknessPage.lessons.test.tsx › A: chỉ làm Bài 3 và Bài 5 → …` | `expected [ 'Minna — 1', 'Minna — 2', …(3) ] to deeply equal [ 'Minna — 3', 'Minna — 5' ]` | Bài chưa làm (0%) chiếm đầu danh sách "bài thấp nhất" |
| 7 | `… › B: chưa làm câu nào → …` | `expected <h2 …(1)></h2> to be null` | Vẫn hiện mục "Bài có độ thành thạo thấp nhất" với các bài 0% dù chưa làm câu nào |
| 8 | `… › C: Bài 3 làm toàn sai (0%) vẫn được liệt kê, chỉ mình Bài 3` | `expected [ 'Minna — 1', 'Minna — 2', …(3) ] to deeply equal [ 'Minna — 3' ]` | Danh sách lẫn các bài chưa làm |

Xanh ngay (đúng dự kiến, chốt chặn): bài đã làm toàn sai (score 0) vẫn có khóa giá trị 0; mastery của từ vựng mở rộng làm bài có khóa; test tính điểm sẵn có; **D** (chỉ mastery ngữ pháp/Kanji → trang không lỗi); **E** (từ yếu không còn trong nội dung → bỏ qua, không lỗi). Không có test dự kiến đỏ nào xanh ngay.

### Sau khi sửa (T009–T010)

- `src/domain/mastery/lesson-scores.ts`: `computeLessonScores` chỉ `result.set(...)` cho bài có mastery từ vựng; bài chưa làm không có khóa. Không sửa `formula.ts`, `BookPage.tsx`, `WeaknessPage.tsx`, `heatmap.ts` (hai trang tự đúng nhờ dữ liệu: `BookPage` đã dùng `?? null`, `WeaknessPage` chỉ liệt kê các khóa có trong Map). Chạy lại T007: **13/13 xanh**.

Cổng G của story (10/11/2026, trước commit):

| Lệnh | Kết quả |
|---|---|
| `npm test -- --testTimeout=30000` | 47 file, **266/266 đạt** (255 + 11 mới) |
| `npm run build` | thành công, JS gzip **185,25 KB** |
| `npm run content:validate` | OK, **568 cảnh báo** (không tăng) |
| `npm run lint` | 0 lỗi |
| `npm run check` | **xanh** (exit 0), 266/266, 34,98 giây |

## US2

### Chuẩn bị giữ nguyên hành vi (T012–T014)

Tạo `src/features/weakness/review-modes.ts` (`REVIEW_MODE_IDS`, dùng chung cho `WeaknessPage` và `MistakesPage`, xóa hai bản sao), `src/features/practice/review-pools.ts` (bản giữ hành vi cũ: `ctxPool = targets`, chưa nối vào `PracticeRunPage`) và `src/features/weakness/review-plan.ts` (`planWeakReview` trả kiểu `WeakReviewPlan` **khai báo cục bộ**, bản **chép nguyên logic cũ** của `handlePracticeNow`; `WeaknessPage.handlePracticeNow` gọi hàm này). Chạy ngay `npm run lint`, `npx tsc -b` và toàn bộ `vitest` (288/288): sạch, hành vi không đổi, không phải thêm ngoại lệ ESLint (`review-plan.ts` không import `features/practice`).

### Chốt chặn T015: kiểm test bắt được lỗi id

Tạm đổi `'mcq-jp-vi'` thành `'mcq-jp-vi-x'` trong `review-modes.ts`, chạy `npx vitest run src/test/review-mode-ids.test.ts`: **ĐỎ** (2 test; `dạng bài "mcq-jp-vi-x" chưa đăng ký: expected false to be true`). **Đã hoàn nguyên** và kiểm bằng `cmp` với bản sao lưu: file giống hệt bản gốc; test xanh lại (2/2).

### Đỏ trước khi sửa (T022)

Lệnh: `npx vitest run src/test src/features/practice src/features/weakness`, ngày 10/11/2026 21:24, khi `buildReviewPools` còn `ctxPool = targets`, `PracticeRunPage` chưa dùng `buildReviewPools` và chỉ tải một bài, `planWeakReview` còn chép logic cũ. Kết quả: **11 đỏ, 73 xanh** (84 test). Cả 11 đỏ là `AssertionError`/`TestingLibraryElementError` đúng lý do (thiếu đáp án nhiễu, chỉ lấy một bài, không bỏ trùng, chỉ 20 bản ghi), không phải lỗi import hay cú pháp.

| # | Test đỏ | Thông báo lỗi chính | Lý do |
|---|---|---|---|
| 1 | `review-pools.test.ts › (b) Ôn lại một từ: ctxPool đủ từ của bài, qua nhiều seed ra đủ 3 dạng` | `expected [ 'mnn1-l03-w1' ] to deeply equal ArrayContaining{…}` | `ctxPool` chỉ gồm chính từ cần ôn |
| 2 | `review-pools.test.ts › (c) từ yếu ở 3 bài: ctxPool chứa từ vựng của cả 3 bài` | `mnn1-l03-w2: expected false to be true` | như trên |
| 3 | `PracticeRunPage.test.tsx › (a) Ôn lại một từ: vẫn ra trắc nghiệm 4 lựa chọn …` | `Unable to find an element with the text: Câu 1/1` | không có đáp án nhiễu nên trắc nghiệm không đủ điều kiện, trang báo lỗi |
| 4 | `PracticeRunPage.test.tsx › (b) từ yếu ở Bài 3 và Bài 5: tải cả hai bài` | `Unable to find an element with the text: Câu 1/2` | chỉ tải bài của cấu hình, từ ở Bài 5 bị bỏ |
| 5 | `PracticeResultPage.test.tsx › (a) … bấm "Làm lại câu sai" vẫn ra câu trắc nghiệm` | `Unable to find an element with the text: Câu 1/1` | như #3 |
| 6 | `review-plan.test.ts › (a) 12 từ yếu ở 3 bài → đủ 12 mã …` | `expected 4 to be 12` | bản cũ chỉ lấy từ cùng bài với từ đầu |
| 7 | `review-plan.test.ts › (c) 25 từ yếu ở nhiều bài → tối đa 20 từ …` | `expected [ … ] to have a length of 20 but got 9` | như trên |
| 8 | `review-plan.test.ts › (e) một từ yếu ở nhiều kỹ năng chỉ tính một lần` | `expected [ 'mnn1-l03-w1', 'mnn1-l03-w1', …(2) ] to deeply equal [ … ]` | bản cũ trùng mã và đếm trùng |
| 9 | `src/test/WeaknessPage.practice.test.tsx › (b) 12 từ yếu ở 3 bài → …` | `expected [ 'mnn1-l03-w1', … ] to have a length of 12 but got 4` | bấm "Luyện ngay" chỉ tạo phiên một bài |
| 10 | `… › (c) 25 từ yếu ở nhiều bài → đúng 20 từ theo thứ hạng` | `expected [ … ] to deeply equal [ 'mnn1-l03-w1', 'mnn1-l05-w1', …(18) ]` | như trên |
| 11 | `… › (g) 30 từ, mỗi từ 2 kỹ năng, xen 10 mastery ngữ pháp → đúng 20 từ phân biệt …` | `expected [ 'mnn1-l03-w1', 'mnn1-l03-w1', …(4) ] to have a length of 20 but got 6` | `listWeak(20)` chỉ nhận 20 bản ghi (lẫn ngữ pháp) rồi lọc một bài, và trùng mã |

**Xanh ngay (đúng dự kiến, chốt chặn hoặc đặc tả):** `review-mode-ids.test.ts` (2); `review-pools.test.ts` (a) đặc tả nguyên nhân (một từ + `ctxPool` của chính nó chỉ ra thẻ ghi nhớ), (d) không có `onlyItemIds` giữ hành vi cũ, (e) `includeExtended: false`; `PracticeRunPage.test.tsx` (c) không có `onlyItemIds` vẫn ra trắc nghiệm và (d) chốt chặn ghi tiến độ cho đường chạy cũ; `PracticeResultPage.test.tsx` (b) chốt chặn hồi quy "Làm lại câu sai" sau câu ngữ pháp sai; `review-plan.test.ts` (b), (d), (f), (g), (h); `WeaknessPage.practice.test.tsx` (h) từ không còn trong nội dung bị bỏ qua và (i) không có từ yếu; `MistakesPage.test.tsx`. Không có test dự kiến đỏ nào xanh ngay.

*Ghi chú trung thực:* lần chạy đầu có 13 đỏ vì hai ca `review-plan.test.ts` (d) và (h) tôi viết bằng từ trải ra nhiều bài, nên đỏ với bản cũ dù ý định là chốt chặn. Đó là lỗi thiết kế test của tôi, không phải giả thuyết sai về mã; đã sửa cho dùng từ cùng một bài (giống tên ca "chốt chặn") rồi chạy lại ra 11 đỏ ở trên.

### Đỏ e2e (T023)

`npm run content:build; npm run build; npx playwright test tests/e2e/weakness-practice.spec.ts` (360×740) trên mã hiện tại: **1 đỏ, 1 xanh**.
- ĐỎ: `Điểm yếu → Luyện ngay: 9 từ yếu ở 3 bài thành phiên 9 câu` → `expect(locator).toBeVisible() failed … element(s) not found` cho `Câu 1/9` (phiên chỉ gồm từ của một bài: `Câu 1/3`).
- Xanh: `Sổ lỗi sai → Ôn lại một từ: phiên 1 câu chạy được` (đặc tả: phiên 1 câu vẫn dựng được, kể cả khi chỉ ra thẻ ghi nhớ).

### Sau khi sửa (T025–T030)

- `src/features/practice/review-pools.ts`: `buildReviewPools` theo R1–R3. Có `onlyItemIds` thì `targets` = từ cần ôn (+ ngữ pháp như cũ), `ctxPool` = toàn bộ từ vựng của các bài đã tải + ngữ pháp; không có `onlyItemIds` thì `targets` = `ctxPool` như cũ.
- `src/features/practice/PracticeRunPage.tsx` (sửa tối thiểu): tập bài cần tải = `(config.bookId, config.lesson)` **luôn có mặt** + các bài suy ra từ `onlyItemIds` qua `parseVocabItemId` (bài của cấu hình lỗi thì `ErrorState` như cũ; bài phụ không tải được thì bỏ qua); dựng `pools` bằng `buildReviewPools` và gọi `buildSession({ items: targets, ctxPool, … })` với tham số `ctxPool` **có sẵn** của `buildSession`. Luồng Bài kiểm tra tổng hợp, sách Kanji, `handleAnswer`, `setLastResult` giữ nguyên.
- `src/features/weakness/review-plan.ts`: `planWeakReview` theo P1–P7 (chỉ từ vựng, mỗi từ một lần, tối đa 20 từ phân biệt yếu nhất trước bất kể bài, mã không còn trong nội dung bị bỏ qua, bài/`lesson` của từ đầu, rỗng → `null`; kiểu trả về vẫn là `WeakReviewPlan` cục bộ). `WeaknessPage.handlePracticeNow` thành hàm bất đồng bộ: khi bấm lấy `listWeak(200)`, lọc mã từ vựng, bỏ trùng, `resolveVocabItems`, rồi `planWeakReview`; danh sách "Top từ yếu nhất" vẫn dùng `listWeak(20)`. `MistakesPage.handleReview` giữ cấu hình cũ.
- Chạy lại: `npx vitest run src/test src/features/practice src/features/weakness` **84/84 xanh** (T022 trước đó 11 đỏ); e2e `weakness-practice.spec.ts` (360×740): **2/2 xanh** (`Câu 1/9`); `npm run lint` và `npx tsc -b` sạch, **không thêm ngoại lệ ESLint**.
- **T028 (vùng cấm và giao diện)**: `git diff --stat a593f51 -- src/domain/quiz/registry.ts src/domain/quiz/session.ts src/domain/quiz/grading.ts src/ui src/i18n` → **rỗng** (kiểm trên cây làm việc, gồm cả các commit đã có). `git diff -U0 a593f51` lọc `className=|(^|[\s(>{])<[A-Za-z]` cho `PracticeRunPage.tsx`, `WeaknessPage.tsx`, `MistakesPage.tsx`, `SearchPage.tsx`, `BookPage.tsx`, `PracticeResultPage.tsx` → **0 dòng khớp ở cả sáu file**. Không phải sửa `registry.ts`, `session.ts`, `grading.ts` (constitution III).

**Thành phần thực tế của phiên "Luyện ngay"** (đo trên dữ liệu thật: 30 từ yếu xen kẽ Bài 3, 5, 8, mỗi từ yếu ở 2 kỹ năng = 60 bản ghi mastery, qua `planWeakReview` → `buildReviewPools` → `buildSession`):
- `planWeakReview`: **20 từ phân biệt**, `questionCount` 20, từ của cả 3 bài (l03, l05, l08); `targets` 20 từ, `ctxPool` 221 mục (toàn bộ từ vựng 3 bài).
- 8 seed (1–8): mỗi phiên **20 câu**, nhưng chỉ **14–16 từ phân biệt** (14, 14, 15, 14, 15, 15, 15, 16) vì `buildSession` chọn ngẫu nhiên cặp (từ, dạng bài) nên không bảo đảm mỗi từ ra đúng một lần (giới hạn đã chốt ở Q2/SC-003: "tập từ của phiên gồm đủ các từ"); phiên lấy từ cả 3 bài.
- Dạng bài mỗi phiên (flashcard / mcq-jp-vi / mcq-vi-jp): 6/8/6, 8/6/6, 5/7/8, 5/9/6, 4/10/6, 5/8/7, 6/5/9, 5/6/9. Qua 8 seed cả **3 dạng đều xuất hiện** trong mọi phiên.

Kịch bản thật ở 360×740 (bản dựng `npm run build`, trình duyệt): 9 từ yếu ở Bài 3/5/8 → nút "Luyện ngay 20 câu yếu nhất" → `Câu 1/9` (dạng 9 câu: mcq, mcq, flashcard, mcq, mcq, mcq, mcq, mcq, flashcard); trả lời sai thì màn kết quả có nút "Làm lại câu sai" và bấm vào vẫn chạy được (`Câu 1/8`). "Ôn lại" một từ ở Sổ lỗi sai: lần đầu đã ra **câu trắc nghiệm 4 lựa chọn** (không chỉ còn thẻ ghi nhớ).

Ảnh chụp (ngoài git, `.screens/` đã gitignore): `us2-weak-practice-now-360x740.png`, `us2-review-one-word-mcq-360x740.png`, `us2-result-retry-wrong-360x740.png`.

Cổng G của story (10/11/2026, trước commit):

| Lệnh | Kết quả |
|---|---|
| `npm test -- --testTimeout=30000` | 57 file, **315/315 đạt** (288 + 27 mới) |
| `npm run build` | thành công, JS gzip **185,77 KB** (≤ 200 KB) |
| `npm run content:validate` | OK, **568 cảnh báo** (không tăng) |
| `npm run lint` | 0 lỗi |
| `npm run check` | **xanh** (exit 0), 315/315, 44,21 giây |

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

### Đỏ trước khi sửa (T049)

Ngày 10/11/2026 21:00, khi `searchVocab` còn cấu hình cũ (`prefix: true, fuzzy: 0.2`, ghép bằng HOẶC) và `useDebouncedValue` còn là **bản stub trả ngay** (T043).

**Đo thật số kết quả trước khi giới hạn `limit`** (script thăm dò ngoài repo trên 1.295 từ thật, cấu hình hiện tại): `sinh vien` = **156**, `nhat ban` = **246**, `an` = 68, `xe` = 21, `zzzz` = 0. Test thấy 30 vì `searchVocab` cắt ở `limit` 30.

`npx vitest run src/data/search-index.test.ts src/data/search-index.real.test.ts src/lib/use-debounced-value.test.ts src/features/browse/SearchPage.test.tsx`: **11 đỏ, 14 xanh** (25 test). Mọi test đỏ là `AssertionError` đúng lý do:

| # | Test đỏ | Thông báo lỗi chính | Lý do |
|---|---|---|---|
| 1 | `search-index.test.ts › (a) "sinh viên" và "sinh vien" …` | `sinh viên: expected 6 to be less than or equal to 3` | HOẶC + fuzzy kéo thêm 教師, お勘定… |
| 2 | `… › (b) "nhat ban": 日本 hạng 1, tối đa 3 kết quả` | `expected 5 to be less than or equal to 3` | như trên |
| 3 | `… › (f) truy vấn vô nghĩa → rỗng; một ký tự ASCII → rỗng` | `expected [ { id: 'mnn1-l02-anata', …(7) } ] to deeply equal []` | `a` khớp tiền tố 1 ký tự |
| 4 | `… › (g) mọi kết quả có điểm ≥ 30% điểm của kết quả đầu` | `sinh vien → mnn1-l02-tanjoubi: expected 2.81 to be greater than or equal to 2.95` | chưa có ngưỡng điểm tương đối |
| 5 | `search-index.real.test.ts › "sinh vien": tối đa 3 kết quả, 学生 hạng 1` | `expected 30 to be less than or equal to 3` | 156 kết quả (bị cắt 30) |
| 6 | `… › "nhat ban": tối đa 3 kết quả, 日本 hạng 1` | `expected 30 to be less than or equal to 3` | 246 kết quả (bị cắt 30) |
| 7 | `… › truy vấn vô nghĩa hoặc một ký tự ASCII → rỗng` | `expected [ …(30) ] to deeply equal []` | `a` trả đủ 30 kết quả |
| 8 | `use-debounced-value.test.ts › đổi giá trị thì chưa đổi cho đến khi qua delayMs` | `expected 'b' to be 'a'` | stub trả ngay, không trễ |
| 9 | `… › đổi liên tiếp trong khoảng chờ chỉ lấy giá trị cuối, tính từ lần đổi cuối` | `expected 's' to be ''` | như trên |
| 10 | `… › hủy hẹn giờ khi unmount` | `expected 0 to be greater than 0` | stub không đặt/hủy hẹn giờ |
| 11 | `SearchPage.test.tsx › gõ liên tục từng ký tự không gọi tìm kiếm theo từng phím; chỉ gọi một lần sau 250 ms` | `expected [ [ 's' ], [ 'si' ], [ 'sin' ], …(6) ] to have a length of +0 but got 9` | gọi `searchVocab` theo từng phím |

**Xanh ngay (đúng dự kiến, chốt chặn hoặc đặc tả):** (c) kana/kanji/romaji → 学生 hạng 1 và `sensei` → 先生; (d) `nuoc ngoai` → 外国 top 3; (e) gõ sai `gakusai` → 学生 top 3; (h) `limit`; (i) khớp đúng xếp trước khớp gần đúng; các test cũ; ở dữ liệu thật: `gakusei`, `がくせい`, `学生`, `sensei`, `nihon` → hạng 1 đúng từ, `nuoc ngoai` → 外国 top 3; hai test còn lại của `SearchPage.test.tsx` (ô nhập cập nhật tức thì, gợi ý hiện ngay khi xóa chữ); hai test đầu của `use-debounced-value.test.ts` (giá trị ban đầu).

**T044(j)** (khớp qua romaji xếp trước khớp qua nghĩa, kết quả chưa biết) **xanh ngay**: `gakusei` → 学生 hạng 1, 会話 (nghĩa chứa "gakusei") xếp sau. Ghi nhận là chốt chặn cho FR-014; không cần sửa `boost` riêng cho ca này (`boost` vẫn đặt theo hợp đồng S7 ở T051).

e2e `tests/e2e/search.spec.ts` (360×740; `npm run content:build; npm run build; npx playwright test tests/e2e/search.spec.ts`): **3 đỏ, 1 xanh**:
- `tìm "sinh vien": tối đa 3 kết quả …` → `Expected: <= 3, Received: 30`
- `tìm "nhat ban": tối đa 3 kết quả …` → `Expected: <= 3, Received: 30`
- `một ký tự "a" không ra danh sách kết quả` → `element(s) not found` (không có "Không tìm thấy kết quả." vì `a` đang ra 30 kết quả)
- xanh: `tìm "gakusei": mục đầu là 学生` và không cuộn ngang.

**T045:** sau khi viết `src/data/search-index.real.test.ts` (nằm ở `src/data`, import `scripts/content/pipeline`), `npm run build`, `npm run lint` và `npx tsc -b` đều **thành công**, nên không cần chuyển file sang `scripts/`.

### Sau khi sửa (T051–T054)

- `src/data/search-index.ts` theo `contracts/search.md` S1–S10: `combineWith: 'AND'`; `fuzzy` theo độ dài từ (từ ≥ 5 ký tự không CJK: 0,15; còn lại không); `prefix` chỉ từ ≥ 2 ký tự (CJK: từ 1 ký tự); `boost` `{ kana: 3, kanji: 3, romaji: 2, meaning: 1 }`; một ký tự ASCII → `[]`; loại kết quả dưới 30% điểm kết quả đầu; giữ `limit` 30. Ngưỡng 0,30 **đạt SC-005 ngay, không phải chỉnh** (ghi vào `research.md` R2).
- `src/lib/use-debounced-value.ts` cài thật (`useEffect` + `setTimeout`, hủy khi đổi giá trị và khi unmount). `src/features/browse/SearchPage.tsx`: `searchVocab` nhận giá trị đã debounce 250 ms; ô rỗng dùng giá trị rỗng ngay (gợi ý hiện ngay); `?q=` và ô nhập vẫn cập nhật tức thời; trong lúc chờ không báo "Không tìm thấy" cho chuỗi gõ dở. Không đổi chữ, class, bố cục.
- Chạy lại bốn file vitest ở T049: **25/25 xanh**. e2e `tests/e2e/search.spec.ts` (360×740): **4/4 xanh**.
- Giao diện không đổi (T054): `git diff -U0 a593f51 -- src/features/browse/SearchPage.tsx` lọc bằng `Select-String 'className=|(^|[\s(>{])<[A-Za-z]'` → **0 dòng khớp** (chỉ thêm import, hằng số, hook và điều kiện `!pending`). `git diff --stat a593f51` cho `registry.ts`, `session.ts`, `grading.ts`, `src/ui`, `src/i18n` → rỗng.

**Số kết quả thực tế sau sửa** (đo trên 1.295 từ thật, trước khi cắt `limit`; trước đó trong ngoặc):
- `sinh vien` và `sinh viên`: **1** (学生) (156)
- `nhat ban`: **3** (日本 hạng 1, います [日本に～], 佐藤) (246)
- `nuoc ngoai`: 2 (外国 hạng 1) (53); `gakusei`: 1; `gakusai` (gõ sai một chữ): 1 (学生); `sensei`: 2; `nihon`: 3; `zzzz`: 0; `a`: 0
- Truy vấn ngắn hợp lệ vẫn ra danh sách gọn nhờ ngưỡng: `an` 28 (68), `xe` 18 (21), `ni` 44.

Cổng G của story (10/11/2026, trước commit):

| Lệnh | Kết quả |
|---|---|
| `npm test -- --testTimeout=30000` | 50 file, **288/288 đạt** (266 + 22 mới) |
| `npm run build` | thành công, JS gzip **185,50 KB** (≤ 200 KB) |
| `npm run content:validate` | OK, **568 cảnh báo** (không tăng) |
| `npm run lint` | 0 lỗi |
| `npm run check` | **xanh** (exit 0), 288/288, 33,42 giây |

Ảnh chụp 360×740 (ngoài git, `.screens/` đã gitignore): xem phần báo cáo cuối của lượt làm này.

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

## Phase 8 — kiểm tra cuối (T067–T070)

Ngày 11/11/2026, sau commit `078d59f`.

**Truy vấn một ký tự (kiểm trước Phase 8):** thêm test `một ký tự CJK (kanji, kana) vẫn tìm được` vào `src/data/search-index.real.test.ts` (xanh ngay). Trên 1.295 từ thật: `日` = 6 kết quả (日, 母の 日, 日記…), `学` = 2 (学校, 学生), `あ` = 41 (あ, あの方, あの人…); một ký tự ASCII `a` = 0 (đúng hợp đồng S2).

**T067** `npm run check` (thẳng, không ngoại lệ): **xanh**, 57 file, **316/316**, `content:validate` OK 568 cảnh báo, `mnn1: 1020 từ chính, 275 từ mở rộng, 132 mẫu ngữ pháp`.

**T068** toàn bộ e2e (`npm run content:build; npm run build; npx playwright test`, 360×740): **18/19 đạt, 1 đỏ** — đúng ngoại lệ đã biết Q-2: `browse.spec.ts › mở trang chủ → vào N5 → Minna no Nihongo 1 → Bài 1` (không tìm thấy heading `Tự học tiếng Nhật cùng Mạnh`, đỏ từ commit `8746c15`, không sửa ở spec này). Không e2e nào khác đỏ; ba spec mới `weakness-practice`, `kanji`, `search` đều xanh.

**T069** ràng buộc toàn nhánh (`git diff a593f51..HEAD`, trước commit docs cuối): 46 file đổi — `src/features` 14, `specs/002-data-and-logic-fixes` 11, `scripts/content` 6, `src/test` 3, `tests/e2e` 3, `src/data` 3, `src/lib` 2, `src/domain` 2, `content/n5` 1, `docs/reference` 1.
- `registry.ts`, `session.ts`, `grading.ts`, `src/ui`, `src/i18n`: **không có thay đổi**.
- `docs/reference/**`: chỉ `Ke_hoach_Website.md`, 2 dòng thêm/2 dòng bớt (dòng 322 và dòng 691 theo ngoại lệ tài liệu).
- File trang (`PracticeRunPage`, `PracticeResultPage`, `PracticeSetupPage`, `WeaknessPage`, `MistakesPage`, `SearchPage`, `BookPage`): **0 dòng** `className=`/JSX mới. `BookPage.tsx` không đổi dòng nào (trạng thái trung tính đến từ dữ liệu của `computeLessonScores`). Chỉ bốn file `.tsx` không phải test đổi trong `src/features`: `SearchPage`, `PracticeRunPage`, `MistakesPage`, `WeaknessPage`, đều chỉ đổi logic.
- Không có file nào trong `.claude`, `.specify`; không có `public/content` hay `content-report.md` được thêm.

**T070** chạy tay quickstart A–F (bản dựng thật, trình duyệt 360×740):
- **A**: `compare-kanji-json.ts` (snapshot gốc so với bản dựng hiện tại) → `OK: chỉ kanji-行, kanji-長 khác`; đúng hai file khác là **`ch09.json` và `ch15.json`** (không phải `ch04.json` như quickstart cũ ghi; đã sửa §A), 15/17 file giống từng byte. `/kanji/行` hiện `HÀNH / HÀNG` và `đi; tiến hành / hàng, dòng` (e2e `kanji.spec.ts` xanh).
- **B**: `content:validate` 1020/275; test pipeline xanh; tab Từ vựng Bài 6 và Bài 13 hiện hai nhóm mở rộng riêng (đã chụp ở US5). **B4**: seed mastery cho DVD, おなかが すきます, のどが かわきます rồi mở `/weak` → cả ba vẫn có mặt ở "Top từ yếu nhất" (tiến độ gắn đúng từ nhờ mã không đổi).
- **C**: `sinh vien` → 1 kết quả (学生), `nhat ban` → 3 (日本 hạng 1), `a` → không ra danh sách, `gakusei` → 学生 đầu tiên. *Quan sát:* khi gõ nhanh `sinh vien` từ ô rỗng, danh sách không nháy theo từng phím, nhưng có **một lần chớp rất ngắn** dòng "Không tìm thấy kết quả." ngay khi debounce xong, trước khi kết quả về (chuỗi trạng thái ghi được: `0 → 0/trống → 0 → 1`). Lý do: `useAsyncData` chỉ bật `loading` ở effect sau lần render có giá trị đã debounce nên một frame còn `results = []`. Hiện tượng này đã có từ trước spec (xảy ra ở mỗi lần gõ phím đầu tiên); debounce làm nó chỉ còn một lần. Chưa sửa (ngoài phạm vi T067–T070), ghi để Mạnh quyết định.
- **D1**: trình duyệt mới → `/weak` hiện thông báo chưa đủ dữ liệu, không có mục bài thấp nhất; `/b/mnn1` → 0 ô đỏ, 25/25 ô trung tính. **D2**: làm thật một phiên 10 câu ở Bài 3, trả lời sai hết (0/10) → `/weak` mục "bài thấp nhất" chỉ có `Minna no Nihongo 1 — 3`; `/b/mnn1` Bài 3 màu đỏ, 24 ô còn lại trung tính.
- **E**: Luyện ngay (9 từ yếu ở Bài 3/5/8 → `Câu 1/9`, đã chụp ở US2); `/mistakes` có 10 nút "Ôn lại" sau phiên sai, bấm một nút → `Câu 1/1` là **trắc nghiệm 4 lựa chọn**; "Làm lại câu sai" chạy được (US2).
- **F**: bằng chứng đỏ của từng story nằm ở các mục `## US1`–`## US5` ở trên và dòng `Đỏ trước khi sửa:` ở thân commit.
