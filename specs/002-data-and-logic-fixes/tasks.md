---

description: "Danh sách task cho spec 002 data-and-logic-fixes"
---

# Tasks: Sửa lỗi dữ liệu và logic (data-and-logic-fixes)

**Input**: tài liệu trong `specs/002-data-and-logic-fixes/` — `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`

**Branch**: `002-data-and-logic-fixes`

**Quyết định đã chốt**: (Q1) Kanji giữ mô hình dữ liệu và giao diện hiện có; 行 hiện hai dòng "HÀNH / HÀNG" và "đi; tiến hành / hàng, dòng" theo `contracts/hanviet-cell.md`. (Q2) được sửa `PracticeRunPage` để truyền `ctxPool`; **không sửa** `src/domain/quiz/registry.ts`, `session.ts`, `grading.ts`; SC-003 = "tập từ của phiên gồm đủ các từ", không đảm bảo mỗi từ ra đúng một lần. (Q-1) đưa việc sửa Q-1 vào phạm vi spec này: T002a tăng timeout riêng cho `scripts/content/pipeline.test.ts` (FR-028).

## Quy ước dùng trong file này

- **Cổng G** = bốn lệnh (1–4) rồi `npm run check` (5), chạy theo thứ tự, cả năm phải thành công:
  1. `npm test -- --testTimeout=30000` (baseline 220 test; sau mỗi nhóm = 220 + số test thêm, không test nào đỏ ngoài các test cố ý đổi kỳ vọng nêu trong task)
  2. `npm run build` (JS gzip ≤ 200 KB; baseline 185,24 KB)
  3. `npm run content:validate` (0 lỗi, không quá 568 cảnh báo)
  4. `npm run lint` (0 lỗi)
  5. `npm run check` (content:validate + typecheck + lint + test; Hiến pháp IV: **phải xanh trước mọi commit**). Không có ngoại lệ cho bước này: Q-1 đã sửa ở T002a
- **ĐỎ** = chạy lệnh test và **phải thấy test thất bại vì đúng lý do của lỗi** (không phải lỗi import hay cú pháp). Ghi tên test đỏ và thông báo lỗi chính vào `specs/002-data-and-logic-fixes/evidence.md` (mục của story đó). Nếu test dự kiến đỏ lại xanh ngay thì dừng: giả thuyết sai, báo Mạnh trước khi sửa (trừ test được ghi rõ là "xanh, chốt chặn" hoặc "chưa biết").
- **Mỗi story MỘT commit** (Hiến pháp IV: `npm run check` xanh trước mọi commit, nên **không commit test đỏ riêng**): commit gồm test, bản sửa và `evidence.md`; thân commit có một dòng tóm tắt `Đỏ trước khi sửa: <tên test> — <lý do>`. Stub/refactor giữ-hành-vi (T034, T043, …) nằm chung commit của story. Không `git push` trước khi cổng G của story xanh.
- Đường dẫn tương đối từ gốc repo `D:\Projects\project japanese\Source code\Code`. Lệnh PowerShell.
- Q-2 (e2e `tests/e2e/browse.spec.ts` "mở trang chủ → …" đỏ từ commit `8746c15`) là ngoại lệ đã biết, **không sửa ở spec này**. Q-1 (`pipeline.test.ts` quá hạn 5 giây) **đã sửa ở spec 002** (T002a), không còn là ngoại lệ. Trong `pipeline.test.ts` chỉ dùng chung một lần chạy pipeline như plan R5 đã ghi.
- **Lint ngay**: mọi test mới tuân theo luật lớp ở `eslint.config.js`; khi tạo file mới trong `src/features/<X>/` chạy `npm run lint` ngay sau khi viết (`features/<X>` không import `features/<Y>`; ngoại lệ TD-2 chỉ cho `WeaknessPage.tsx` và `MistakesPage.tsx`). Test xuyên feature (cần `usePracticeSessionStore` ở `features/practice`) đặt ở `src/test/`. **Không thêm ngoại lệ ESLint.**
- **Kiểm giao diện không đổi** (T028, T054, T069): sau `git diff -U0`, lọc bằng `Select-String '^[+-]' | Select-String 'className=|(^|[\s(>{])<[A-Za-z]'` (chỉ thẻ JSX và `className=`, không khớp kiểu generic như `Promise<Foo>`). Nếu vẫn khớp oan (ví dụ phép so sánh `a < b` đầu dòng), đọc tay các dòng khớp, ghi từng dòng và kết luận vào `evidence.md`; dòng nào thật sự là JSX/className mới thì hoàn nguyên.
- **Gốc so sánh git**: dùng `a593f51` (đầu nhánh, merge PR #1), không dùng `main` cục bộ (`dca3700`, tụt 19 commit so với nhánh).

## Phase 1: Setup

- [X] T001 Xác nhận đang ở nhánh `002-data-and-logic-fixes` (`git branch --show-current`), rồi commit tài liệu spec chỉ bằng đường dẫn cụ thể: `git add specs/002-data-and-logic-fixes/spec.md specs/002-data-and-logic-fixes/plan.md specs/002-data-and-logic-fixes/research.md specs/002-data-and-logic-fixes/tasks.md specs/002-data-and-logic-fixes/evidence.md specs/002-data-and-logic-fixes/data-model.md specs/002-data-and-logic-fixes/quickstart.md specs/002-data-and-logic-fixes/contracts specs/002-data-and-logic-fixes/checklists`, commit `docs(002): spec, plan, research, contracts, tasks`. **Không dùng `git add -A` hay `git add .`; không đụng** `.specify/extensions.yml`, `.specify/integrations/claude.manifest.json`, `.claude/settings.json`, `.claude/skills/speckit-companion-*` và mọi file khác ngoài `specs/002-data-and-logic-fixes/`
- [X] T002 Chạy bốn lệnh 1–4 của Cổng G và so với `research.md` R0 (220/220 test, 568 cảnh báo, 1023 chính + 272 mở rộng, JS 185,24 KB gzip, lint sạch); chép kết quả vào `evidence.md` mục `## Baseline`. **Ghi rõ: cây làm việc có file chưa commit ngoài phạm vi spec** (extension companion: `.specify/extensions.yml`, `.specify/integrations/claude.manifest.json`, `.claude/settings.json`, `.claude/skills/speckit-companion-*`, `specs/001-repo-restructure/.spec-context.json`); chúng không thuộc spec 002 và không được đưa vào commit nào của spec này. Ngoại lệ tài liệu `docs/reference/Ke_hoach_Website.md` (hai chỗ đã sửa trước) cũng chưa commit, sẽ vào commit T066. Nếu số liệu khác baseline: dừng, báo Mạnh
- [X] T002a Sửa Q-1 (FR-028), **chỉ** trong `scripts/content/pipeline.test.ts`: thêm `vi` vào import từ `vitest` và ngay dưới các import gọi `vi.setConfig({ testTimeout: 30000, hookTimeout: 30000 })` (thay đổi nhỏ nhất, chỉ tác dụng trong file này). Không đổi `vitest.config`/`vite.config`/`package.json`, không đổi test hay kỳ vọng nào khác (số liệu 1020/275 đổi sau ở T056). Nếu Vitest 5 không nhận `vi.setConfig` thì truyền `{ timeout: 30000 }` cho hai lệnh `it` của chính file đó. Rồi chạy `npm run check` **ba lần liên tiếp** (ba lệnh riêng, không dùng vòng lặp che kết quả), ghi **cả ba kết quả** vào `evidence.md` mục `## Q-1`: ngày giờ, xanh/đỏ, số test, thời gian của `scripts/content/pipeline.test.ts`. Cả ba phải xanh; nếu có lần đỏ thì dừng và báo Mạnh. Commit riêng ngay sau đó: `git add scripts/content/pipeline.test.ts specs/002-data-and-logic-fixes/evidence.md`, thông điệp `fix(002): tăng timeout riêng cho pipeline.test.ts (Q-1)`
- [X] T003 Tạo thư mục tạm ngoài repo cho snapshot: `New-Item -ItemType Directory -Force "$env:TEMP\spec002"`. Mở `specs/002-data-and-logic-fixes/evidence.md` (đã có sẵn, kèm mục `## Ngoại lệ tài liệu`) và kiểm có đủ các mục `## Baseline`, `## Q-1`, `## US1`, `## US2`, `## US3`, `## US4`, `## US5`; thiếu mục nào thì thêm. Mỗi lần ghi bằng chứng đỏ ghi: lệnh đã chạy, ngày giờ, tên test đỏ, thông báo lỗi chính, lý do

**Phase 2 (Foundational)**: không có. Các story độc lập, không có tiền đề chung.

---

## Phase 3: User Story 1 — Điểm yếu chỉ nêu bài đã làm (Priority: P1)

**Goal**: bài chưa có lượt làm không bị tính 0% / "yếu nhất" ở trang Điểm yếu và không hiện màu đỏ ở trang giáo trình.

**Independent Test**: có mastery ở Bài 3 và Bài 5 → `/weak` chỉ liệt kê hai bài đó; `/b/mnn1` chỉ hai ô đó có màu theo điểm, các ô khác trung tính; không có mastery → trạng thái rỗng, không lỗi. (`quickstart.md` §D)

### Test tái hiện lỗi (viết trước, phải ĐỎ)

- [X] T004 [US1] Sửa `src/domain/mastery/lesson-scores.test.ts`: (a) đổi test "bài chưa có dữ liệu nào trả về 0" thành kỳ vọng `result.size === 0` và `result.has(1) === false`; (b) thêm test chỉ bài có mastery mới có khóa (mastery ở Bài 1, `lessons` có Bài 1–2 → `has(1)` true, `has(2)` false); (c) bài đã làm toàn sai (`score: 0`) vẫn có khóa với giá trị 0; (d) mastery của `bookId` khác không tạo khóa; (e) mastery của từ vựng mở rộng (itemId cùng dạng `mnn1-l02-…`) cũng làm bài có khóa
- [X] T005 [P] [US1] Tạo `src/features/browse/BookPage.test.tsx` (Testing Library, `MemoryRouter` tại `/b/mnn1`, mock `@/data/content-loader` cho `loadManifest`/`loadBookIndex` với 5 bài, mock `@/data/progress/dexie-repo` cho `listAllMastery`): chỉ có mastery điểm thấp ở Bài 3 → liên kết Bài 3 có class chứa `border-danger`; Bài 1 chưa làm có đúng các class của `heatmapClass(null)` (import từ `@/ui/signature/heatmap`, so sánh với kết quả hàm, không viết cứng chuỗi class) và **không** chứa `border-danger`; không thêm token hay thành phần giao diện mới
- [X] T006 [P] [US1] Tạo `src/features/weakness/WeaknessPage.lessons.test.tsx` (mock `@/data/content-loader`: `loadManifest`, `loadBookIndex`, `resolveVocabItems`; mock `@/data/progress/dexie-repo`: `listWeak`, `listAllMastery`): ca A — mastery ở Bài 3 và Bài 5 → mục `vi.weak.weakLessonsTitle` có đúng 2 liên kết, đúng thứ tự điểm tăng dần, không có bài khác; ca B — không có mastery → không có mục bài thấp nhất và không báo lỗi (hiện `vi.weak.empty`); ca C — Bài 3 làm toàn sai → vẫn được liệt kê với `0% thuộc`; ca D (xanh, chốt chặn) — `listWeak` và `listAllMastery` chỉ có mastery ngữ pháp/Kanji (itemId dạng `…-g-…` hoặc `kanji-…`) → trang không lỗi, hiện `vi.weak.empty`, không có mục bài thấp nhất; ca E (xanh, chốt chặn) — `listWeak` trả mã từ vựng mà `resolveVocabItems` không tìm thấy (từ không còn trong nội dung) → trang không lỗi và từ đó không xuất hiện
- [X] T007 [US1] **Chạy và phải thấy ĐỎ**: `npx vitest run src/domain/mastery/lesson-scores.test.ts src/features/browse/BookPage.test.tsx src/features/weakness/WeaknessPage.lessons.test.tsx`. Lý do đỏ mong đợi: Map có khóa 0 cho bài chưa làm. Ghi tên test đỏ và thông báo lỗi chính vào mục `## US1` của `evidence.md`
- [X] T008 [US1] Rà `evidence.md` mục `## US1`: mỗi test đỏ có tên, thông báo lỗi chính và lý do. **Không commit lúc này** (một commit duy nhất của story ở T011)

### Sửa

- [X] T009 [US1] Sửa `src/domain/mastery/lesson-scores.ts` theo `data-model.md`: `computeLessonScores` chỉ `result.set(...)` cho bài có trong `itemAveragesByLesson` (có ít nhất một mastery từ vựng của bài đó); cập nhật chú thích đầu hàm; **không** sửa `formula.ts`, `BookPage.tsx` (đã dùng `?? null`), `WeaknessPage.tsx` (map chỉ còn bài đã làm), `heatmap.ts`. Chạy lại T007: phải XANH. Nếu `BookPage.test.tsx` hoặc `WeaknessPage.lessons.test.tsx` còn đỏ thì sửa tối thiểu nơi gây đỏ, không thêm token hay thành phần giao diện

### Cổng kiểm tra

- [X] T010 [US1] Cổng G: `npm test -- --testTimeout=30000`, `npm run build`, `npm run content:validate`, `npm run lint`, rồi `npm run check` (Hiến pháp IV). Kỳ vọng: 220 + test mới, 568 cảnh báo
- [X] T011 [US1] Commit duy nhất của story: `fix(weakness): bài chưa làm không bị tính yếu nhất, trang giáo trình hiện trung tính` — gồm các file test, `lesson-scores.ts`, `evidence.md`; thân commit có dòng `Đỏ trước khi sửa: lesson-scores.test.ts, BookPage.test.tsx, WeaknessPage.lessons.test.tsx — Map có khóa 0 cho bài chưa làm`

**Checkpoint**: US1 đạt độc lập — trang Điểm yếu và trang giáo trình đúng.

---

## Phase 4: User Story 2 — "Luyện ngay" / "Ôn lại" chạy đủ dạng, đủ từ (Priority: P1)

**Goal**: "Ôn lại" một từ vẫn ra trắc nghiệm; "Làm lại câu sai" không mất trắc nghiệm; "Luyện ngay 20 câu yếu nhất" lấy tối đa 20 từ yếu nhất qua nhiều bài; `REVIEW_MODE_IDS` khớp registry thật. Không sửa `registry.ts`, `session.ts`, `grading.ts`.

**Independent Test**: 12 từ yếu ở 3 bài → bấm "Luyện ngay" ra `Câu 1/12` (trước: số từ của một bài); "Ôn lại" 1 từ có thể ra trắc nghiệm 4 lựa chọn. (`quickstart.md` §E, `contracts/review-session.md`)

### Chuẩn bị giữ nguyên hành vi (refactor, test cũ vẫn xanh)

- [X] T012 [US2] Tạo `src/features/weakness/review-modes.ts` xuất `REVIEW_MODE_IDS = ['flashcard', 'mcq-jp-vi', 'mcq-vi-jp']`; sửa `src/features/weakness/WeaknessPage.tsx` và `src/features/weakness/MistakesPage.tsx` import từ file này và xóa hai hằng cục bộ. Không đổi hành vi
- [X] T013 [US2] Tạo `src/features/practice/review-pools.ts` xuất `buildReviewPools({ lessonFiles, onlyItemIds, includeExtended })` trả `{ targets, ctxPool }` theo `contracts/review-session.md` nhưng **bản giữ hành vi cũ**: `ctxPool = targets` (từ vựng lọc theo `onlyItemIds` + toàn bộ ngữ pháp, giống `pool` hiện ở `PracticeRunPage.tsx`). Chưa nối vào `PracticeRunPage`. Chạy `npm run lint` ngay sau khi viết
- [X] T014 [US2] Tạo `src/features/weakness/review-plan.ts` xuất `planWeakReview(weak: Mastery[], resolvedVocab: VocabItem[])` trả `WeakReviewPlan | null`, trong đó `WeakReviewPlan` là **kiểu khai báo cục bộ trong chính file này** (các trường `bookId`, `lesson`, `questionTypeIds`, `questionCount`, `includeExtended`, `onlyItemIds`; tương thích cấu trúc với `PendingSessionConfig`) — **không import bất cứ thứ gì từ `@/features/practice`**. Bản đầu **chép nguyên logic hiện ở `WeaknessPage.handlePracticeNow`** (lọc từ vựng, chỉ lấy từ cùng bài với từ đầu, không bỏ trùng); nối `handlePracticeNow` gọi hàm này và truyền kết quả cho `setPendingConfig` (tương thích cấu trúc). Không đổi hành vi. **Chạy `npm run lint` ngay sau khi viết**; nếu lint báo import chéo feature thì sửa file chứ không thêm ngoại lệ ESLint

### Test (viết trước)

- [X] T015 [P] [US2] Tạo `src/test/review-mode-ids.test.ts`: `import '@/features/practice/modes/register-all'`, rồi mọi id trong `REVIEW_MODE_IDS` (import từ `@/features/weakness/review-modes`) phải có trong `questionRegistry.list()`; thêm kiểm `MistakesPage` và `WeaknessPage` dùng cùng mảng (đọc qua `PendingSessionConfig.questionTypeIds` ở T019/T020). Test này **xanh ngay** (chốt chặn hồi quy). Kiểm chốt chặn có tác dụng: tạm đổi `'mcq-jp-vi'` thành `'mcq-jp-vi-x'` trong `review-modes.ts`, chạy `npx vitest run src/test/review-mode-ids.test.ts` phải ĐỎ, rồi hoàn nguyên
- [X] T016 [P] [US2] Tạo `src/features/practice/review-pools.test.ts` với fixture ≥ 8 từ vựng (khác nghĩa, khác `homographKey`) ở 3 bài: (a) đặc tả nguyên nhân A, xanh ngay: `buildSession({ items: [một từ], questionTypes: [flashcard, mcq-jp-vi, mcq-vi-jp] (lấy từ registry sau register-all), questionCount: 10, seed })` chỉ ra `flashcard`; (b) **ĐỎ**: `buildReviewPools` với `onlyItemIds` = 1 từ thì `ctxPool` chứa toàn bộ từ vựng bài và qua nhiều seed (vòng 20 seed) tập `questionType.id` của `buildSession({ items: targets, ctxPool, … })` gồm đủ `flashcard`, `mcq-jp-vi`, `mcq-vi-jp`; (c) **ĐỎ**: `onlyItemIds` ở 3 bài → `ctxPool` chứa từ vựng của cả 3 bài; (d) xanh: không có `onlyItemIds` → `targets` và `ctxPool` cùng nội dung như hành vi cũ; (e) `includeExtended: false` loại từ mở rộng khỏi `ctxPool`
- [X] T017 [P] [US2] Tạo `src/features/practice/PracticeRunPage.test.tsx` (Testing Library, `MemoryRouter`, `import '@/features/practice/modes/register-all'`, mock `@/data/content-loader` cho `loadManifest`/`loadLesson`, mock `@/data/progress/dexie-repo` cho `recordAttempt`, đặt `usePracticeSessionStore.setState({ pendingConfig })`): (a) **ĐỎ** — Ôn lại một từ: cấu hình `questionTypeIds: ['mcq-jp-vi']`, `questionCount: 1`, `onlyItemIds: [một id]`, bài có ≥ 8 từ → trang hiện câu hỏi trắc nghiệm với 4 nút lựa chọn, không hiện `ErrorState`; sau khi chọn đáp án và bấm "Tiếp theo", `recordAttempt` được gọi với `expect.objectContaining({ itemId: <id>, skill: 'meaning', mode: 'mcq-jp-vi', correct: <boolean> })` (FR-009); (b) **ĐỎ** — `onlyItemIds` gồm từ ở Bài 3 và Bài 5 → `loadLesson` được gọi cho cả hai bài; (c) xanh — không có `onlyItemIds` với `questionTypeIds: ['mcq-jp-vi']` vẫn ra trắc nghiệm như cũ; (d) xanh — ở ca (c) trả lời một câu thì `recordAttempt` được gọi với `expect.objectContaining({ itemId, skill: 'meaning', mode: 'mcq-jp-vi', correct })` (chốt chặn FR-009 cho đường chạy cũ)
- [X] T018 [P] [US2] Tạo `src/features/practice/PracticeResultPage.test.tsx` (`MemoryRouter` với hai route `/practice/result/:sessionId` và `/practice/run`, đặt `lastResult` có 1 câu sai thuộc dạng `mcq-jp-vi` lấy từ registry): bấm "Làm lại câu sai" → điều hướng sang `/practice/run` và trang chạy hiện câu trắc nghiệm có lựa chọn (không `ErrorState`). (a) **ĐỎ** trước khi sửa `PracticeRunPage`; (b) xanh, chốt chặn hồi quy "Làm lại câu sai sau câu ngữ pháp sai": `lastResult` có 1 câu sai thuộc dạng ngữ pháp có sẵn trong registry (ví dụ `grammar-pattern`, fixture ≥ 4 mẫu ngữ pháp trong bài), `onlyItemIds` chỉ chứa mã ngữ pháp → bấm "Làm lại câu sai" thì trang chạy vẫn hiện câu hỏi (không `ErrorState`), cả trước lẫn sau khi sửa `PracticeRunPage` (bảo đảm T026 luôn gộp bài của `config`)
- [X] T019 [P] [US2] Tạo `src/features/weakness/review-plan.test.ts` (không import `features/practice`) và `src/test/WeaknessPage.practice.test.tsx` (đặt ở `src/test/` vì cần `usePracticeSessionStore`; mock `@/data/content-loader` và `@/data/progress/dexie-repo` như T006, `listWeak` mock dạng `vi.fn((limit = 20) => rows.slice(0, limit))`). Với bản chép logic cũ ở T014, trạng thái dự kiến: (a) **ĐỎ** — 12 mastery yếu của từ ở Bài 3, 5, 8 → `planWeakReview` trả `onlyItemIds` đủ 12 mã khác nhau, `questionCount: 12`, `questionTypeIds` = `REVIEW_MODE_IDS`, `includeExtended: true`; (b) **ĐỎ** — trang: bấm "Luyện ngay 20 câu yếu nhất" thì `usePracticeSessionStore.getState().pendingConfig.onlyItemIds` có 12 mã và `navigate('/practice/run')` được gọi; (c) **ĐỎ** — 25 mastery yếu của 25 từ ở nhiều bài → tối đa 20 mã theo thứ hạng (bản cũ chỉ lấy từ cùng bài với từ đầu nên < 20); (d) **XANH** (chốt chặn) — mastery ngữ pháp/Kanji bị bỏ qua; (e) **ĐỎ** — một từ yếu ở nhiều kỹ năng chỉ tính một lần (bản cũ trùng mã và đếm trùng); (f) **XANH** (chốt chặn) — danh sách rỗng → `null`; (g) **ĐỎ**, page-level cho nguồn dữ liệu — 30 từ, mỗi từ 2 kỹ năng, thêm 10 mastery ngữ pháp xếp lẫn trong thứ hạng; bấm "Luyện ngay" thì `onlyItemIds` có đúng 20 mã phân biệt (đỏ với `listWeak(20)` vì chỉ nhận 20 bản ghi, tức khoảng 10 từ), danh sách "Top từ yếu nhất" hiển thị vẫn lấy từ `listWeak(20)` (không đổi); (h) **XANH** (chốt chặn, E1) — vài mã từ yếu mà `resolveVocabItems` không tìm thấy (từ không còn trong nội dung) bị bỏ qua, phiên chỉ gồm các từ còn lại, không lỗi
- [X] T020 [P] [US2] Tạo `src/test/MistakesPage.test.tsx` (đặt ở `src/test/` vì cần `usePracticeSessionStore`; xanh, đặc tả): bấm "Ôn lại" một từ → `pendingConfig` có `onlyItemIds: [mã từ]`, `questionCount: 1`, `questionTypeIds` bằng `REVIEW_MODE_IDS`
- [X] T021 [US2] Tạo e2e `tests/e2e/weakness-practice.spec.ts` với `test.use({ viewport: { width: 360, height: 740 } })`: (a) gieo mastery yếu vào IndexedDB: mở `/` để Dexie tạo CSDL `progress`, lấy 3 từ mỗi bài từ `request.get('/content/mnn1/l03.json')`, `l05.json`, `l08.json`, rồi `page.evaluate` ghi thẳng vào object store `mastery` (`{ itemId, skill: 'meaning', score: 0.2, attempts: 3, streak: 0, lastTs: Date.now() }`); (b) mở `/weak`, bấm "Luyện ngay 20 câu yếu nhất", mong đợi URL `/practice/run` và nhãn `Câu 1/9`; (c) không có cuộn ngang (`document.scrollingElement.scrollWidth <= 360`); (d) gieo 1 mastery và `mistakes` rồi vào `/mistakes`, bấm "Ôn lại" → `Câu 1/1`

### Chạy ĐỎ

- [X] T022 [US2] Chạy `npx vitest run src/test src/features/practice src/features/weakness`. **Phải thấy ĐỎ** ở: T016(b)(c), T017(a)(b), T018(a), T019(a)(b)(c)(e)(g). **XANH (chốt chặn/đặc tả)** ở: T015, T016(a)(d)(e), T017(c)(d), T018(b), T019(d)(f)(h), T020. Lý do đỏ: `ctxPool` bằng `targets` nên không có đáp án nhiễu; `planWeakReview` bản cũ chỉ lấy một bài, không bỏ trùng; `listWeak(20)` chỉ cho 20 bản ghi. Ghi tên test và thông báo lỗi chính vào mục `## US2` của `evidence.md`
- [X] T023 [US2] Dựng bản hiện tại và chạy e2e: `npm run content:build; npm run build; npx playwright test tests/e2e/weakness-practice.spec.ts`. **Phải thấy ĐỎ** ở (b) (nhãn `Câu 1/3`, không phải `Câu 1/9`). Ghi vào mục `## US2` của `evidence.md`
- [X] T024 [US2] Rà `evidence.md` mục `## US2`: mỗi test đỏ ở T022, T023 có tên, thông báo lỗi chính và lý do. **Không commit lúc này** (một commit duy nhất của story ở T031, gồm cả các thay đổi giữ-hành-vi của T012–T014)

### Sửa

- [X] T025 [US2] Sửa `src/features/practice/review-pools.ts` theo `contracts/review-session.md` R1–R3: có `onlyItemIds` thì `targets` = từ vựng khớp mã (+ ngữ pháp như cũ), `ctxPool` = toàn bộ từ vựng của mọi bài đã tải (lọc `includeExtended`) + ngữ pháp; không có `onlyItemIds` thì `targets` = `ctxPool` như cũ
- [X] T026 [US2] Sửa `src/features/practice/PracticeRunPage.tsx` ở mức tối thiểu: (a) tập bài cần tải = `(config.bookId, config.lesson)` **luôn có mặt**, gộp thêm các bài suy ra từ `config.onlyItemIds` bằng `parseVocabItemId` + `loadLesson` (đã có cache); mã không giải ra bài (ngữ pháp, Kanji) thì bỏ qua mã đó, bài phụ không tải được thì bỏ qua bài đó, riêng bài của `config` lỗi thì giữ hành vi cũ (`ErrorState`); không có `onlyItemIds` thì chỉ tải bài của `config` như cũ; (b) dựng `pool` bằng `buildReviewPools`; (c) gọi `buildSession({ items: targets, ctxPool, questionTypes, questionCount, seed })`. Giữ nguyên luồng Bài kiểm tra tổng hợp, sách Kanji, `handleAnswer`, `setLastResult`, chữ và giao diện. Chạy `npm run lint` ngay sau khi sửa
- [X] T027 [US2] Sửa `src/features/weakness/review-plan.ts` theo `contracts/review-session.md` P1–P6 (chỉ từ vựng, mỗi từ một lần, tối đa 20 từ yếu nhất bất kể bài, `bookId`/`lesson` của từ đầu tiên, rỗng → `null`; kiểu trả về vẫn là `WeakReviewPlan` cục bộ). Sửa `WeaknessPage.handlePracticeNow` thành hàm bất đồng bộ: khi bấm, `progressRepository.listWeak(200)` lấy thêm bản ghi (đã xếp hạng yếu nhất trước), lọc mã từ vựng và bỏ trùng, `resolveVocabItems` giải mã, rồi gọi `planWeakReview`; **không đổi** `listWeak(20)`/`WEAK_LIMIT` dùng cho danh sách "Top từ yếu nhất" và không còn lọc `sameLesson`. `MistakesPage.handleReview` giữ cấu hình hiện tại. Chạy `npm run lint` ngay sau khi sửa
- [X] T028 [US2] Kiểm tra vùng cấm và giao diện: (a) `git diff --stat a593f51..HEAD -- src/domain/quiz/registry.ts src/domain/quiz/session.ts src/domain/quiz/grading.ts src/ui src/i18n` phải rỗng; (b) `git diff -U0 a593f51..HEAD -- src/features/practice/PracticeRunPage.tsx src/features/weakness/WeaknessPage.tsx src/features/weakness/MistakesPage.tsx | Select-String '^[+-]' | Select-String 'className=|(^|[\s(>{])<[A-Za-z]'` không được có dòng nào (không thêm/đổi className hay JSX). Nếu không rỗng: hoàn nguyên phần đó; nếu không thể sửa mà không đụng vùng cấm thì dừng và báo Mạnh
- [X] T029 [US2] Chạy lại `npx vitest run src/test/review-mode-ids.test.ts src/features/practice src/features/weakness`: phải XANH toàn bộ. Dựng lại và chạy lại e2e: `npm run content:build; npm run build; npx playwright test tests/e2e/weakness-practice.spec.ts` phải XANH

### Cổng kiểm tra

- [X] T030 [US2] Cổng G: `npm test -- --testTimeout=30000`, `npm run build`, `npm run content:validate`, `npm run lint`, rồi `npm run check` (Hiến pháp IV)
- [X] T031 [US2] Commit duy nhất của story: `fix(weakness): Luyện ngay/Ôn lại đủ dạng bài, lấy 20 từ yếu nhất qua nhiều bài` — gồm `review-modes.ts`, `review-pools.ts`, `review-plan.ts`, `PracticeRunPage.tsx`, `WeaknessPage.tsx`, `MistakesPage.tsx`, các file test, `tests/e2e/weakness-practice.spec.ts`, `evidence.md`; thân commit có dòng `Đỏ trước khi sửa: review-pools.test, PracticeRunPage.test, PracticeResultPage.test, review-plan/WeaknessPage.practice.test, e2e weakness-practice — ctxPool = targets, chỉ lấy một bài, chỉ 20 bản ghi`

**Checkpoint**: US2 đạt độc lập, kể cả "Làm lại câu sai" ở màn kết quả.

---

## Phase 5: User Story 3 — Hán Việt và nghĩa của Kanji hiển thị đúng (Priority: P1)

**Goal**: ô "Hán Việt (nghĩa)" có nhiều cặp ngoặc được tách đúng theo `contracts/hanviet-cell.md`; chỉ 行 và 長 đổi; mã định danh không đổi; không đổi giao diện.

**Independent Test**: `/kanji/行` hiện "HÀNH / HÀNG" và "đi; tiến hành / hàng, dòng"; JSON Kanji trước/sau chỉ khác ở `kanji-行` và `kanji-長` (hai trường `hanViet`, `meaning`). (`quickstart.md` §A)

**Lưu ý thứ tự**: giữ thứ tự US3 → US5: bước so sánh JSON (T039) chạy khi `vocab.md` chưa đổi (trước Phase 7). Tác động của việc chuyển 3 từ lên `relatedVocabIds` của Kanji **gần như không xảy ra**: `渇` không có trong `kanji.md`, còn DVD và `おなかが すきます` không chứa chữ Hán, nên không từ nào trong ba từ được liên kết với Kanji. Đây là ràng buộc phòng ngừa chứ không phải rủi ro đã thấy. Nếu làm Phase 7 trước thì chụp lại snapshot "trước" ở T032 từ commit ngay trước khi sửa parser, để hai snapshot cùng một trạng thái `vocab.md`.

### Chuẩn bị

- [X] T032 [US3] Chụp JSON Kanji **trước khi sửa parser**: `npm run content:build; Remove-Item -Recurse -Force "$env:TEMP\spec002\kanji-before" -ErrorAction SilentlyContinue; Copy-Item public/content/kanji-master-n5 "$env:TEMP\spec002\kanji-before" -Recurse`. Đếm được 17 file (`ch01..ch15`, `appendix`, `index`)
- [X] T033 [P] [US3] Tạo `scripts/content/compare-kanji-json.test.ts` rồi `scripts/content/compare-kanji-json.ts` (chạy bằng `npx tsx scripts/content/compare-kanji-json.ts <thư-mục-trước> <thư-mục-sau>`): đọc từng file `.json` ở hai thư mục; file giống từng byte thì bỏ qua; file khác thì so từng mục Kanji theo `id`, chỉ cho phép `id` ∈ {`kanji-行`, `kanji-長`} và chỉ khác ở `hanViet`, `meaning`; mọi khác biệt khác (file thiếu/thừa, mục khác, trường khác) → in rõ và thoát mã 1; hợp lệ → in `OK: chỉ kanji-行, kanji-長 khác` và thoát mã 0. Test dùng thư mục tạm: ca giống hệt (OK), ca chỉ 行 đổi hai trường (OK), ca đổi `strokes` của 行 (mã 1), ca đổi chữ khác (mã 1), ca thiếu file (mã 1)

### Test tái hiện lỗi (viết trước, phải ĐỎ)

- [X] T034 [US3] Trong `scripts/content/parse-kanji.ts` xuất hàm `splitHanVietMeaning(cell: string): { hanViet: string; meaning: string } | null` **bản giữ hành vi cũ** (đúng regex `/^(.+?)\s*\((.+)\)$/u` hiện có, `null` khi không khớp) và để `parseKanjiFile` gọi hàm này. Không đổi hành vi; nằm chung commit của story (T042)
- [X] T035 [US3] Sửa `scripts/content/parse-kanji.test.ts`, thêm: (a) bảng ví dụ của hợp đồng — `NGOẠI (ngoài)` → (`NGOẠI`, `ngoài`) (xanh), `HÀNH (đi; tiến hành) / HÀNG (hàng, dòng)` → (`HÀNH / HÀNG`, `đi; tiến hành / hàng, dòng`) (**ĐỎ**), `TRƯỜNG (dài) / TRƯỞNG (người đứng đầu)` → (`TRƯỜNG / TRƯỞNG`, `dài / người đứng đầu`) (**ĐỎ**); (b) **ĐỎ** — `parseKanjiFile` trên `kanji.md` thật: 行 có `hanViet === 'HÀNH / HÀNG'` và `meaning === 'đi; tiến hành / hàng, dòng'`, 長 tương tự; (c) lỗi (đều phải báo lỗi kèm số dòng, không trả giá trị cắt sai): ngoặc không cân, đoạn không có ngoặc, đoạn rỗng sau `/`, chữ thừa sau `)` cuối; ngoặc lồng cân `A (x (y))` → meaning `x (y)`; (d) xanh, chốt chặn FR-011 — với mọi dòng của `kanji.md` trừ 行 và 長, kết quả mới bằng kết quả của regex cũ (chép nguyên regex cũ vào test làm tham chiếu); (e) khứ hồi — ghép lại từ `hanViet` và `meaning` ra đúng ô nguồn cho mọi dòng
- [X] T036 [US3] **Chạy và phải thấy ĐỎ**: `npx vitest run scripts/content/parse-kanji.test.ts`. Đỏ mong đợi ở (a) hai ca nhiều cặp, (b), (c) các ca lỗi (bản cũ không báo lỗi ngoặc lệch), (e) cho 行/長. Ghi tên test đỏ và thông báo lỗi chính vào mục `## US3` của `evidence.md`
- [X] T037 [US3] Rà `evidence.md` mục `## US3`: mỗi test đỏ ở T036 có tên, thông báo lỗi chính và lý do. **Không commit lúc này**; `scripts/content/compare-kanji-json.ts` và test của nó nằm chung commit của story ở T042

### Sửa

- [X] T038 [US3] Viết lại `splitHanVietMeaning` trong `scripts/content/parse-kanji.ts` bằng bộ đọc cân bằng ngoặc theo `contracts/hanviet-cell.md`: tách đoạn bằng `/` ở độ sâu 0, mỗi đoạn `HÁN VIỆT (nghĩa)`, nối bằng `" / "`, lỗi → `parseKanjiFile` báo `issues.error` kèm số dòng như thông báo hiện tại. Không đổi schema, kiểu `KanjiItem`, `enrich.ts`, hay `src/`
- [X] T039 [US3] Chạy `npx vitest run scripts/content/parse-kanji.test.ts`: phải XANH. Rồi so sánh dữ liệu: `npm run content:build; Remove-Item -Recurse -Force "$env:TEMP\spec002\kanji-after" -ErrorAction SilentlyContinue; Copy-Item public/content/kanji-master-n5 "$env:TEMP\spec002\kanji-after" -Recurse; npx tsx scripts/content/compare-kanji-json.ts "$env:TEMP\spec002\kanji-before" "$env:TEMP\spec002\kanji-after"` phải in `OK: chỉ kanji-行, kanji-長 khác` (mã 0); 132 chữ còn lại giống từng byte
- [X] T040 [P] [US3] Tạo `tests/e2e/kanji.spec.ts` (viewport 360×740): `page.goto('/kanji/' + encodeURIComponent('行'))` hiện "HÀNH / HÀNG" và "đi; tiến hành / hàng, dòng", và không có ")" lẻ ở dòng nghĩa. Dựng `npm run build` rồi `npx playwright test tests/e2e/kanji.spec.ts`: XANH

### Cổng kiểm tra

- [X] T041 [US3] Cổng G: `npm test -- --testTimeout=30000`, `npm run build`, `npm run content:validate`, `npm run lint`, rồi `npm run check` (Hiến pháp IV). `content:validate` vẫn 134 Kanji, không thêm cảnh báo
- [X] T042 [US3] Commit duy nhất của story: `fix(content): tách đúng Hán Việt/nghĩa cho ô Kanji có nhiều cặp ngoặc (行, 長)` — gồm `parse-kanji.ts`, `parse-kanji.test.ts`, `compare-kanji-json.ts` + test, `tests/e2e/kanji.spec.ts`, `evidence.md`; thân commit có dòng `Đỏ trước khi sửa: parse-kanji.test.ts (行, 長, ngoặc lệch) — regex một cặp ngoặc cắt sai ô có hai cặp`

**Checkpoint**: US3 đạt độc lập.

---

## Phase 6: User Story 4 — Tìm kiếm trả về kết quả liên quan (Priority: P2)

**Goal**: theo `contracts/search.md` S1–S10 và debounce 250 ms; "sinh vien" và "nhat ban" trả ít kết quả (≤ 3), từ đúng trong 3 kết quả đầu.

**Independent Test**: bộ truy vấn mẫu của hợp đồng, trên tập từ mẫu và trên 1.295 từ thật. (`quickstart.md` §C)

### Chuẩn bị

- [X] T043 [US4] Tạo `src/lib/use-debounced-value.ts` xuất `useDebouncedValue<T>(value: T, delayMs: number): T` **bản stub trả ngay `value`** (chưa trễ) để test chạy được (nằm chung commit của story, T055)

### Test tái hiện lỗi (viết trước, phải ĐỎ)

- [X] T044 [US4] Sửa `src/data/search-index.test.ts`: mở rộng fixture lên ≥ 14 từ (học sinh 学生 `がくせい` / `gakusei` / "sinh viên", 先生 `せんせい` / "giáo viên", 外国 / "nước ngoài", 日本 `にほん` / "Nhật Bản", 日本語, và từ nhiễu cố ý: 教師 `きょうし` "giáo viên", お勘定 `おかんじょう` "thanh toán", 社員 "nhân viên công ty", 誕生日 "ngày sinh nhật", 学校 "trường học", v.v.), giữ các test cũ. Thêm: (a) có dấu và không dấu — `sinh viên` và `sinh vien` → 学生 hạng 1, tối đa 3 kết quả, không chứa 教師 và お勘定 (**ĐỎ**: OR + fuzzy kéo thêm); (b) `nhat ban` → 日本 hạng 1, tối đa 3 kết quả (**ĐỎ**); (c) kana `がくせい`, kanji `学生`, romaji `gakusei` → 学生 hạng 1 (xanh); `sensei` → 先生 hạng 1; (d) `nuoc ngoai` → 外国 trong top 3 (xanh, giữ hành vi); (e) gõ sai một chữ — `gakusai` → 学生 trong top 3 (xanh nếu fuzzy từ ≥ 5 ký tự hoạt động); (f) `zzzz` → `[]`; một ký tự ASCII `a` → `[]` (**ĐỎ**); `'   '` → `[]` không dựng chỉ mục (xanh, test cũ); (g) mọi kết quả có `score ≥ 0.3 × score` của kết quả đầu (**ĐỎ**); (h) tham số `limit` được tôn trọng; (i) **xanh, chốt chặn** — khớp đúng xếp trước khớp gần đúng: thêm vào fixture một từ có romaji cách `sensei` một ký tự (ví dụ `sensai`), truy vấn `sensei` → 先生 hạng 1 và từ gần đúng (nếu xuất hiện) xếp sau; (j) **kết quả chưa biết** — khớp qua romaji/kana xếp trước khớp qua nghĩa: thêm từ B có nghĩa chứa đúng chuỗi truy vấn (ví dụ nghĩa "cách gọi gakusei trong hội thoại") và dùng từ A là 学生 có romaji `gakusei`; truy vấn `gakusei` → A xếp trước B. Nếu (j) xanh ngay thì ghi vào `evidence.md` là chốt chặn cho FR-014 (không dừng); nếu đỏ thì được sửa bằng `boost` ở T051
- [X] T045 [P] [US4] Tạo `src/data/search-index.real.test.ts`: đây là lần chạy pipeline **riêng** (thứ hai trong toàn bộ bộ test, lần đầu ở `pipeline.test.ts`): không đọc được JSON đã dựng vì `npm run check` chạy trước `content:build` (CI cũng vậy) và `public/content` bị gitignore, và không chia sẻ kết quả với `pipeline.test.ts` được vì mỗi file test chạy cô lập (chia sẻ cần `globalSetup`, tức đổi cấu hình vitest chung). Vì vậy đặt timeout riêng cho file này: `vi.setConfig({ testTimeout: 30000, hookTimeout: 30000 })` ở đầu file (**không** đổi cấu hình chung); chạy pipeline **đúng một lần** trong `beforeAll`, không chạy lại trong từng test, gọi `runContentPipeline({ contentDir: 'content', outDir: <thư mục tạm>, write: true })` từ `scripts/content/pipeline.ts`, mock `@/data/content-loader` (`loadManifest`, `loadBookIndex`, `loadLesson`) đọc JSON từ thư mục tạm, rồi trên 1.295 từ thật: `searchVocab('sinh vien')` và `searchVocab('nhat ban')` mỗi truy vấn ≤ 3 kết quả và 学生 / 日本 là hạng 1 (**ĐỎ**: hiện 156 và 246 kết quả); `gakusei`, `がくせい`, `学生`, `sensei`, `nihon` → hạng 1 đúng từ (xanh); `nuoc ngoai` → 外国 trong top 3; `zzzz` và `a` → `[]`. Dọn thư mục tạm trong `afterAll`. **Ngay sau khi viết, chạy `npm run build` và `npm run lint`** (file test trong `src/data` import `scripts/content/pipeline.ts`, có thể gây lỗi `tsc -b` do `tsconfig.app.json` chỉ `include: ["src"]`, hoặc lỗi luật lớp); nếu lỗi thì chuyển test này sang `scripts/content/search-index.real.test.ts` (vitest vẫn chạy thư mục `scripts/`)
- [X] T046 [P] [US4] Tạo `src/lib/use-debounced-value.test.ts` (`renderHook` + `vi.useFakeTimers()`): giá trị ban đầu trả ngay; đổi giá trị thì chưa đổi cho đến khi qua `delayMs`; đổi liên tiếp nhiều lần trong khoảng chờ thì chỉ lấy giá trị cuối sau `delayMs` kể từ lần đổi cuối; huỷ hẹn giờ khi unmount. **ĐỎ** với stub T043
- [X] T047 [P] [US4] Tạo `src/features/browse/SearchPage.test.tsx` (`MemoryRouter`, mock `@/data/search-index` với `searchVocab: vi.fn()`, `vi.useFakeTimers()`, `userEvent` với `advanceTimers`): gõ lần lượt từng ký tự `sinh vien` thì `searchVocab` **không** bị gọi theo từng phím và được gọi đúng một lần với `'sinh vien'` sau 250 ms; URL `?q=` cập nhật ngay theo chữ gõ; xóa hết chữ thì hiện gợi ý `vi.search.hint` ngay không chờ. **ĐỎ** trước khi sửa
- [X] T048 [US4] Tạo `tests/e2e/search.spec.ts` (viewport 360×740): mở `/search`, `pressSequentially('sinh vien', { delay: 40 })` → tối đa 3 mục trong danh sách và mục đầu chứa 学生; `a` → không có mục kết quả; `gakusei` → mục đầu là 学生; không cuộn ngang (`scrollWidth <= 360`)

### Chạy ĐỎ

- [X] T049 [US4] Chạy `npx vitest run src/data/search-index.test.ts src/data/search-index.real.test.ts src/lib/use-debounced-value.test.ts src/features/browse/SearchPage.test.tsx`: **phải ĐỎ** ở T044(a)(b)(f-một-ký-tự)(g), T045 (156 và 246 kết quả), T046, T047. Rồi `npm run content:build; npm run build; npx playwright test tests/e2e/search.spec.ts`: **ĐỎ** ở "sinh vien". Ghi tên test đỏ và thông báo lỗi chính vào mục `## US4` của `evidence.md`
- [X] T050 [US4] Rà `evidence.md` mục `## US4`: mỗi test đỏ ở T049 có tên, thông báo lỗi chính (kể cả con số 156 và 246) và lý do. **Không commit lúc này** (một commit duy nhất của story ở T055)

### Sửa

- [X] T051 [US4] Sửa `src/data/search-index.ts` theo `contracts/search.md` S1–S10: `combineWith: 'AND'`, `fuzzy` theo độ dài từ (từ ≥ 5 ký tự không CJK: `0.15`; còn lại không fuzzy), `prefix` chỉ từ ≥ 2 ký tự (CJK: từ 1 ký tự), `boost` `{ kana: 3, kanji: 3, romaji: 2, meaning: 1 }`, một ký tự ASCII → `[]`, loại kết quả dưới 30% điểm kết quả đầu, giữ `limit` 30. Chỉnh hệ số ngưỡng (khởi điểm 0,30) bằng T044/T045 cho đến khi đạt SC-005; ghi giá trị cuối vào `research.md` R2. Giữ chữ ký `searchVocab` và `VocabSearchResult`
- [X] T052 [US4] Cài `src/lib/use-debounced-value.ts` thật (`useEffect` + `setTimeout`, dọn khi unmount). Sửa `src/features/browse/SearchPage.tsx`: `useAsyncData(() => searchVocab(debouncedQuery), [debouncedQuery])` với `debouncedQuery = useDebouncedValue(query, 250)`; truy vấn rỗng dùng giá trị rỗng ngay (không chờ) để hiện gợi ý; `?q=` vẫn theo `query` tức thời. **Không** đổi chữ, class, bố cục
- [X] T053 [US4] Chạy lại bốn file vitest ở T049: phải XANH. Dựng lại `npm run content:build; npm run build; npx playwright test tests/e2e/search.spec.ts`: XANH

### Cổng kiểm tra

- [X] T054 [US4] Cổng G: `npm test -- --testTimeout=30000`, `npm run build`, `npm run content:validate`, `npm run lint`, rồi `npm run check` (Hiến pháp IV). Bundle gzip không vượt 200 KB. Kiểm giao diện không đổi: `git diff -U0 a593f51..HEAD -- src/features/browse/SearchPage.tsx | Select-String '^[+-]' | Select-String 'className=|(^|[\s(>{])<[A-Za-z]'` không được có dòng nào
- [X] T055 [US4] Commit duy nhất của story: `fix(search): ghép từ bằng AND, giới hạn fuzzy, ngưỡng điểm, debounce` — gồm `search-index.ts`, `use-debounced-value.ts`, `SearchPage.tsx`, các file test, `tests/e2e/search.spec.ts`, `research.md` (giá trị ngưỡng cuối), `evidence.md`; thân commit có dòng `Đỏ trước khi sửa: search-index.test/real.test, use-debounced-value.test, SearchPage.test, e2e search — 156 và 246 kết quả cho "sinh vien" và "nhat ban"`

**Checkpoint**: US4 đạt độc lập.

---

## Phase 7: User Story 5 — Số liệu từ chính / mở rộng khớp thực tế (Priority: P2)

**Goal**: DVD (Bài 6), おなかが すきます và のどが かわきます (Bài 13) nằm ở từ vựng mở rộng, ID giữ nguyên; 1.020 từ chính, 275 từ mở rộng; test và tài liệu khớp.

**Independent Test**: `npm run content:validate` in `mnn1: 1020 từ chính, 275 từ mở rộng`; ba ID còn nguyên và nằm ở `section: extended`. (`quickstart.md` §B)

### Test tái hiện lỗi (viết trước, phải ĐỎ)

- [X] T056 [US5] Sửa `scripts/content/pipeline.test.ts`: gom lần chạy `runContentPipeline({ write: true })` vào `beforeAll` dùng chung (không thêm lần chạy nào **trong file này**; giữ test `write:false`; giữ nguyên timeout đã đặt ở T002a), rồi kiểm riêng: từ chính `=== 1020` (**ĐỎ**, hiện 1023), từ mở rộng `=== 275` (**ĐỎ**, hiện 272), ngữ pháp `=== 132`, Kanji `=== 134` và tách 119 chương + 15 phụ lục đọc từ `kanji-master-n5/index.json` hoặc `appendix.json`; Bài 6 có 51 chính + 10 mở rộng và Bài 13 có 38 chính + 11 mở rộng đọc từ `mnn1/index.json` (**ĐỎ**); ID của ba từ **không đổi** so với bảng ở `data-model.md` — `mnn1-l06-20bdf436` (DVD), `mnn1-l13-cd7659ef` (おなかが すきます), `mnn1-l13-af449570` (のどが かわきます) — có mặt trong `l06.json`/`l13.json` với `section === 'extended'` (**ĐỎ** ở phần `extended`) và không còn trong nhóm `main`; không trùng ID trong cả hai bài. Không đổi lại timeout của T002a
- [X] T057 [P] [US5] Sửa `scripts/content/parse-vocab.test.ts`: đổi tên test thành "đọc đúng 25 bài, 1.020 từ chính và 275 từ mở rộng, không lỗi", thay `toBeGreaterThan(1000)` bằng `toHaveLength(1020)` (**ĐỎ**) và `toHaveLength(272)` bằng `toHaveLength(275)` (**ĐỎ**)
- [X] T058 [US5] **Chạy và phải thấy ĐỎ**: `npx vitest run scripts/content/pipeline.test.ts scripts/content/parse-vocab.test.ts --testTimeout=30000`. Lý do: dữ liệu đang 1023/272 và ba mục còn ở `main`. Ghi tên test đỏ và thông báo lỗi chính vào mục `## US5` của `evidence.md`
- [X] T059 [US5] Rà `evidence.md` mục `## US5`: mỗi test đỏ ở T058 có tên, thông báo lỗi chính (1023 so với 1020, 272 so với 275) và lý do. **Không commit lúc này** (một commit duy nhất của story ở T066)

### Sửa nội dung

- [X] T060 [US5] Sửa `content/n5/mnn1/vocab.md` Bài 6: xóa hàng `| DVD | - | dībuidī | đĩa DVD | |` khỏi "### 1. Từ vựng chính"; ngay sau bảng "### 2. Từ vựng mở rộng ★ — Món ăn Nhật Bản (日本の食べ物)" (trước dòng `---` kết thúc Bài 6) thêm tiểu mục `### 3. Từ vựng mở rộng ★ — Thiết bị giải trí (娯楽)` với dòng tiêu đề bảng 5 cột đúng mẫu hiện có (`| Tiếng Nhật (Kana) | Hán tự (Kanji) | Cách đọc (Romaji) | Nghĩa tiếng Việt | Ghi chú |` và dòng `|---|---|---|---|---|`) và hàng DVD giữ nguyên nội dung các cột
- [X] T061 [US5] Sửa `content/n5/mnn1/vocab.md` Bài 13: xóa hai hàng `おなかが すきます` và `のどが かわきます` khỏi "### 1. Từ vựng chính" (giữ nguyên các hàng `おなかが すきました。`, `おなかが いっぱいです。`, `のどが かわきました。`); sau bảng "### 2. Từ vựng mở rộng ★ — Gọi món tại Nhà hàng (レストランでの注文)" thêm `### 3. Từ vựng mở rộng ★ — Cảm giác đói và khát (空腹・のどの渇き)` với cùng dòng tiêu đề bảng và hai hàng đã chuyển, giữ nguyên các cột kể cả cột Ghi chú. Chủ đề do Mạnh đặt tên lại được. **Không sửa mã định danh** (ID tính từ kana + kanji)
- [X] T062 [US5] Đọc `src/features/browse/VocabTab.tsx` (đã xác minh: nhóm mở rộng theo `sectionTitle`) và xác nhận hai bảng mở rộng của cùng một bài hiện thành hai nhóm riêng; chạy `npm run content:build` (để `public/content` có dữ liệu mới, không phải bản 1023/272 cũ), rồi `npm run dev`, mở Bài 6 và Bài 13, bật lọc "Mở rộng", ghi nhận bằng ảnh chụp 360 px. Nếu giao diện gộp sai thì **dừng và báo Mạnh** (không sửa giao diện ở spec này)
- [X] T063 [US5] Chạy lại T058 phải XANH, rồi `npm run content:validate`: dòng cuối phải là `mnn1: 1020 từ chính, 275 từ mở rộng, 132 mẫu ngữ pháp` và `OK — 568 cảnh báo` (không tăng)

### Sửa tài liệu

- [X] T064 [P] [US5] Tìm số liệu cũ trong tài liệu: `git grep -n -E "1\.023|\b1023\b|\b272\b" -- . ':!package-lock.json' ':!docs/reference/audit-hien-trang.md' ':!specs/001-repo-restructure/spec.md' ':!specs/002-data-and-logic-fixes'`. Với mỗi kết quả: sửa thành 1.020 / 275 nếu là số hiện hành, giữ nếu là mô tả lịch sử. `docs/reference/Ke_hoach_Website.md` dòng 691 (272 → 275) và dòng 322 (câu "một bài có thể có nhiều bảng Từ vựng mở rộng") **đã sửa trước** theo ngoại lệ tài liệu (ghi ở `evidence.md`, mục `## Ngoại lệ tài liệu`); ở đây chỉ xác nhận bằng grep. **Ngoại lệ chỉ đúng hai chỗ đó: không sửa gì khác trong `docs/reference/**`**; nếu grep còn thấy số hiện hành sai ở file khác trong `docs/reference/**` thì ghi vào `evidence.md` và hỏi Mạnh, không tự sửa. Ngoài `docs/reference/**`, kiểm `docs/ARCHITECTURE.md` §9.2 và `docs/SPECKIT_ROADMAP.md` §2, §4.2 (đã ghi 1.020/275, giữ). Không sửa `docs/reference/audit-hien-trang.md` và `specs/001-repo-restructure/spec.md` (bản chụp theo ngày). Chạy lại grep: không còn kết quả số hiện hành sai

### Cổng kiểm tra

- [X] T065 [US5] Cổng G: `npm test -- --testTimeout=30000`, `npm run build`, `npm run content:validate`, `npm run lint`, rồi `npm run check` (Hiến pháp IV)
- [X] T066 [US5] Commit duy nhất của story: `content(n5): chuyển DVD, おなかが すきます, のどが かわきます sang từ mở rộng (1.020 chính, 275 mở rộng)` — gồm `vocab.md`, `pipeline.test.ts`, `parse-vocab.test.ts`, các tài liệu đã sửa ở T064 (`docs/reference/Ke_hoach_Website.md`…), `evidence.md`; thân commit có dòng `Đỏ trước khi sửa: pipeline.test.ts, parse-vocab.test.ts — dữ liệu 1023/272, ba mục còn ở phần chính`

**Checkpoint**: US5 đạt độc lập.

---

## Phase 8: Polish và kiểm tra cuối

- [X] T067 Chạy `npm run check` (content:validate + typecheck + lint + test). Phải xanh, không có ngoại lệ. Nếu `scripts/content/pipeline.test.ts` hoặc `src/data/search-index.real.test.ts` quá hạn thì không bỏ qua: điều tra (T045 thêm một lần chạy pipeline riêng) và sửa timeout của file đó. Ghi kết quả vào `evidence.md`
- [X] T068 Chạy toàn bộ e2e: `npm run content:build; npm run build; npx playwright test`. Mong đợi: các spec mới (`weakness-practice`, `kanji`, `search`) và `practice-*`, `settings`, `content`, `repo-restructure` XANH; **ngoại lệ đã biết (Q-2)**: `tests/e2e/browse.spec.ts` "mở trang chủ → …" ĐỎ từ commit `8746c15`, không sửa. Mọi test đỏ khác phải xử lý
- [X] T069 Kiểm ràng buộc trên toàn nhánh: (a) `git diff --stat a593f51..HEAD -- src/domain/quiz/registry.ts src/domain/quiz/session.ts src/domain/quiz/grading.ts src/ui src/i18n` phải rỗng (không đụng registry/session/grading, không thêm token/chuỗi/thành phần giao diện); (b) `git diff -U0 a593f51..HEAD -- src/features/practice/PracticeRunPage.tsx src/features/weakness/WeaknessPage.tsx src/features/weakness/MistakesPage.tsx src/features/browse/SearchPage.tsx src/features/browse/BookPage.tsx | Select-String '^[+-]' | Select-String 'className=|(^|[\s(>{])<[A-Za-z]'` không được có dòng nào; ngoại lệ duy nhất là thay đổi trung tính của FR-004 ở trang giáo trình, mà `BookPage.tsx` dự kiến **không đổi dòng nào** (màu trung tính đến từ dữ liệu của `computeLessonScores`); nếu `BookPage.tsx` có diff thì ghi lý do vào `evidence.md`. (c) `git status --short` không có file `public/content` hay `content-report.md` được thêm (gitignore), và không có file companion nào trong các commit của spec (`git diff --stat a593f51..HEAD -- .claude .specify` rỗng)
- [X] T070 Chạy tay các kịch bản A–F trong `quickstart.md`; so kết quả đo với `research.md` R0 (số test tăng, 568 cảnh báo, 1020/275, JS gzip ≤ 200 KB) và R2 (`sinh vien` từ 156 xuống ≤ 3)
- [ ] T071 (Mạnh) Sau khi T067–T070 xong: Mạnh quyết định push nhánh `002-data-and-logic-fixes` (Claude không tự `git push`) để Vercel dựng bản Preview; mở Preview trên điện thoại và kiểm `/weak`, `/mistakes`, `/b/mnn1`, `/search`, `/kanji/行`, Bài 6 và Bài 13; báo kết quả cho Claude
- [ ] T072 **Chỉ sau khi Mạnh xác nhận Preview ở T071**: (a) đặt `**Status**: Done` trong `specs/002-data-and-logic-fixes/spec.md`; (b) đánh dấu ✅ cho spec 2 ở `docs/SPECKIT_ROADMAP.md` §3; (c) bỏ mục "tăng testTimeout cho scripts/content/pipeline.test.ts" khỏi lệnh `/speckit-plan` của §4.6 `quality-gaps`, và sửa ghi chú dòng 75 thành "Q-1 đã sửa ở spec 002; Q-2 chuyển cho `quality-gaps`"; (d) commit `docs(002): hoàn thành data-and-logic-fixes`; rồi Mạnh push và mở Pull Request từ `002-data-and-logic-fixes` vào `main`. Không tự đánh dấu hoàn thành trước khi Mạnh xác nhận

---

## Dependencies & Execution Order

- **Phase 1** trước hết, trong đó T002a (sửa Q-1) phải xong và commit trước mọi story vì cổng G dùng thẳng `npm run check`. **Phase 2** không có.
- Các story **độc lập** về mã: US1 (domain + 2 trang), US2 (practice + weakness), US3 (parser), US4 (search), US5 (nội dung + test pipeline). Chúng không sửa chung file. Ràng buộc thứ tự: so sánh JSON Kanji (T039) chạy khi `vocab.md` chưa đổi (trước US5), hoặc chụp lại snapshot ở T032 từ commit ngay trước khi sửa parser. Lưu ý: tác động tới `relatedVocabIds` gần như không xảy ra với 3 từ này (xem ghi chú Phase 5); ràng buộc là phòng ngừa.
- US1 → US2: US2 dùng `WeaknessPage.tsx` mà US1 không sửa; hai story không xung đột. Test của hai story đặt ở file khác nhau (`WeaknessPage.lessons.test.tsx` và `WeaknessPage.practice.test.tsx`).
- Thứ tự ưu tiên theo spec: US1 → US2 → US3 (P1), rồi US4 → US5 (P2). **Thứ tự khuyến nghị theo plan R6 (dữ liệu trước)**: US3 → US5 → US1 → US2 → US4. Cả hai thứ tự đều hợp lệ nếu giữ ràng buộc ở trên.
- Trong mỗi story: viết test → chạy và thấy ĐỎ (ghi vào `evidence.md`) → sửa → cổng G + `npm run check` → **một commit** của story. Không sửa mã trước khi đã thấy ĐỎ; không commit test đỏ riêng.
- **Phase 8** sau khi cả 5 story xanh.

## Parallel Opportunities

- **US1**: T005 và T006 (hai file test khác nhau) chạy song song sau T004.
- **US2**: T015, T016, T017, T018, T019, T020 là sáu file test khác nhau, song song sau T012–T014; T021 (e2e) song song với chúng.
- **US3**: T033 (script so sánh) song song với T034–T036; T040 (e2e) song song với T041 sau T039.
- **US4**: T045, T046, T047 song song với T044 sau T043; T048 song song.
- **US5**: T056 và T057 là hai file khác nhau, song song; T064 (tài liệu) song song với T062–T063.
- Giữa các story: US3, US4, US5 có thể do ba người/phiên khác nhau làm đồng thời nếu mỗi story một commit riêng và không rebase chồng file.

## Implementation Strategy

- **MVP**: US1 + US2 (hai story P1 liên quan trực tiếp đến mục tiêu số một: phát hiện và luyện lại điểm yếu), hoặc US3 nếu ưu tiên sửa dữ liệu sai. Mỗi story gộp độc lập vào nhánh vẫn cho sản phẩm dùng được.
- **Tăng dần**: hoàn thành từng story đến commit duy nhất của nó rồi mới sang story kế; không để hai story cùng ở trạng thái đỏ.
- **Dừng và hỏi Mạnh khi**: một test dự kiến ĐỎ lại XANH ngay (giả thuyết sai); sửa US2 buộc phải đụng `registry.ts`/`session.ts`/`grading.ts`; giao diện `VocabTab` gộp sai hai bảng mở rộng (T062); bước so sánh Kanji (T039) báo thêm chữ khác ngoài 行 và 長; T002a có lần `npm run check` đỏ trong ba lần chạy liên tiếp.
