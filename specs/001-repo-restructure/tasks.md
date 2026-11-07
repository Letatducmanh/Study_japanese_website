---

description: "Danh sách việc cho feature 001-repo-restructure"
---

# Tasks: Sắp xếp lại cấu trúc repo (repo-restructure)

**Input**: `specs/001-repo-restructure/` — `spec.md`, `plan.md`, `research.md`, `data-model.md`, `contracts/layering-rules.md`, `quickstart.md`

**Prerequisites**: nhánh `001-repo-restructure`, `npm ci` đã chạy, cây làm việc sạch trước mỗi nhóm commit.

**Tests**: Không thêm test logic (feature chỉ dời file). Có đúng **một file e2e mới giữ lại** (`tests/e2e/repo-restructure.spec.ts`, 360×740, theo nguyên tắc IV của constitution). "Kiểm chứng" còn lại là cổng FR-011, bước duyệt route (smoke), bước đối chiếu tiến độ (progress) và các lệnh trong `quickstart.md`.

**Organization**: Việc được nhóm theo user story, nhưng **thứ tự thực hiện bám các nhóm commit G0–G8 của `plan.md`**. User Story 1 (P1, "website y như cũ") là *ràng buộc*: nó được kiểm bằng một **cổng** sau mỗi nhóm (nhãn `[US1]`) và một lần ký nhận cuối (Phase 6).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: có thể chạy song song (khác file, không phụ thuộc việc chưa xong)
- **[Story]**: US1 = website như cũ · US2 = vị trí file · US3 = hết bản sao/link hỏng · US4 = luật ESLint
- Mọi đường dẫn tính từ gốc repo `Source code/Code/`.

## Quy tắc chung

- **Cổng kiểm** = định nghĩa **duy nhất** ở `spec.md` FR-011 (không nhắc lại số liệu ở đây). Công cụ: `node specs/001-repo-restructure/verify-baseline.mjs`. Trong tasks, "**Cổng**" nghĩa là chạy công cụ đó, phải `PASS`, rồi mới commit. **`FAIL` hoặc bất kỳ test nào fail khi chạy kèm cờ → DỪNG và báo Mạnh**, không sang nhóm sau.
- **Dời file:** dùng `git mv` (không xóa rồi tạo lại). **Không** chạy Prettier hay công cụ định dạng; **không** đổi kiểu xuống dòng; chỉ sửa dòng `import`, tên export khi bảng cho phép (`Layout → AppShell`, `KanjiDetailPage → KanjiPage`), và chú thích/đường dẫn trong tài liệu. Sau khi sửa import trong một nhóm, `npm run build` (đã gồm `tsc -b`) là bằng chứng chưa sót tham chiếu.
- **Tên commit (constitution, Development Workflow mục 4):** `feat(001): …` cho commit có mã hoặc cấu hình; `docs: …` cho commit chỉ có tài liệu. Không dùng `refactor(…)`, `chore(…)`. Thêm dòng đồng tác giả theo quy ước dự án.
- **Không đụng:** `src/lib/tts.ts`, `src/lib/sfx.ts`, `src/lib/theme.ts`, `src/lib/use-theme.ts`, `public/content/README.md`, dữ liệu trong `content/**/*.md`, `Source code/Docs/`, `Source code/Ảnh mobile/`, `playwright.config.ts`, cấu hình build/deploy, `package.json`, constitution.

---

## Phase 1: Setup (G0 — công cụ)

**Purpose**: Chuẩn bị công cụ đo trước khi dời bất kỳ file nào.

- [ ] T001 Commit các tài liệu của feature để cây sạch: `git add specs/001-repo-restructure` rồi commit `docs: plan, research, data-model, contracts, quickstart, tasks cho spec 001` (gồm `spec.md`, `plan.md`, `research.md`, `data-model.md`, `contracts/layering-rules.md`, `quickstart.md`, `tasks.md`, `checklists/requirements.md`)
- [ ] T002 Thêm dòng `/.screens/` vào `.gitignore` (nhóm "Test", cạnh `/test-results`) theo `docs/FRONTEND.md` §13.1
- [ ] T003 [P] Tạo `specs/001-repo-restructure/verify-baseline.mjs` (Node thuần, không thư viện): chạy lần lượt bốn lệnh của FR-011 — `npm test -- --testTimeout=30000`, `npm run build`, `npm run content:validate`, `npm run lint` — đọc kết quả và in bảng PASS/FAIL **với đúng ngưỡng ghi ở FR-011** (đọc ngưỡng từ đó, không tự đặt): test fail nào cũng là FAIL và in tên test; build in kích thước JS để so với mốc; validate so số cảnh báo; lint kiểm mã thoát. Tùy chọn `--also-default`: chạy thêm `npm test` mặc định và **chỉ in** kết quả (pass/fail của `pipeline.test.ts`) để theo dõi chập chờn, không dùng làm điều kiện. Hỗ trợ `--only test|build|validate|lint`. Thoát mã 1 nếu có FAIL
- [ ] T004 [P] Tạo `specs/001-repo-restructure/shoot.mjs` (dùng `@playwright/test` đã cài; tự chạy `npx vite preview --port 4174` từ `dist/`, **cùng một cổng 4174 cho mọi chế độ**). Các chế độ:
  - `shots before|after`: chụp **36 ảnh** = 6 trang (`/`, `/n`, `/b/mnn1`, `/b/mnn1/5`, `/weak`, `/settings`) × 3 cỡ (360×740, 768×1024, 1280×800) × 2 chế độ (sáng, tối: đặt `localStorage.theme` bằng `addInitScript`), với `reducedMotion: 'reduce'`, `animations: 'disabled'`, chờ `document.fonts.ready`, ghi vào `.screens/001/<before|after>/<trang>-<rộng>-<theme>.png`
  - `compare`: so SHA-256 từng cặp ảnh, in `N/36 giống hệt` và liệt kê ảnh khác; thoát mã 1 nếu có ảnh khác
  - `smoke before|after`: đọc bảng route từ file `App.tsx` (`src/App.tsx` ở bản trước, `src/app/App.tsx` ở bản sau) bằng cách lấy mọi thuộc tính `path=`; thay tham số mẫu (`:level`→`N5`, `:bookId`→`mnn1`, `:lesson`→`5`, `:char`→`外`, `:sessionId`→`khong-ton-tai`), thêm `/` và một đường dẫn không tồn tại (404), **bỏ `styleguide`**; mở từng route, chờ ổn định, kiểm trang không trắng (văn bản thân trang đủ dài) và **không** có `pageerror` hay `console.error`; ghi `.screens/001/smoke-<mode>.json`; ở `after` tự so với `before` (cùng số route, cùng kết quả) và thoát mã 1 nếu lệch
  - `smoke before|after --dev`: chạy `npm run dev` (cổng 5173), mở `/styleguide`, kiểm có nội dung và không lỗi console; kiểm thêm bản `vite preview` trả trang 404 cho `/styleguide` (trang chỉ có khi phát triển)
  - `progress before|after`: dùng **một profile trình duyệt giữ nguyên** (`chromium.launchPersistentContext` với thư mục `.screens/001/profile`) và **cổng 4174**. `before`: tạo vài bản ghi tiến độ và sổ lỗi sai bằng cách làm một phiên Flashcard Bài 1 (đánh giá "Quên" vài thẻ, như `tests/e2e/practice-flashcard.spec.ts`) và một phiên trắc nghiệm có trả lời sai vài câu, rồi **đếm số bản ghi từng bảng** của mọi cơ sở IndexedDB (dùng `indexedDB.databases()` và đếm từng object store), ghi `.screens/001/progress-before.json`. `after`: mở lại cùng profile ở bản đã dời, đếm lại, so với `before`; thoát mã 1 nếu bất kỳ bảng nào lệch số bản ghi hoặc mất bảng
- [ ] T005 [P] Tạo `tests/e2e/repo-restructure.spec.ts` (file **giữ lại**, không đổi `playwright.config.ts`): `test.use({ viewport: { width: 360, height: 740 } })`; hai test: (1) mở `/`, kiểm có nội dung chính (heading "Tự học tiếng Nhật cùng Mạnh" hiện; nếu heading khác ở 360px thì kiểm `main` có văn bản và liên kết "Bắt đầu học"); (2) mở `/b/mnn1/5`, kiểm không có "Không tìm thấy trang", "Luyện tập bài này" hiện và heading "Từ vựng chính" hiện. Cú pháp bám `tests/e2e/browse.spec.ts`. Test phải đạt trên cây chưa dời (chạy qua `npm run build` rồi `npm run test:e2e`, như ở T011)
- [ ] T006 Kiểm trình duyệt Playwright: chạy `npx playwright test --list` (hoặc `npx playwright install --dry-run chromium`); nếu báo thiếu trình duyệt thì chạy `npx playwright install chromium` rồi chạy lại để chắc chắn. Máy này đã có `chromium-1248` nên bước cài thường được bỏ qua. Ghi kết quả vào báo cáo G0

---

## Phase 2: Foundational (G0 — mốc, chặn mọi nhóm sau)

**Purpose**: Có mốc "trước" đo được. **Không dời file nào cho tới khi Phase này xong.**

**⚠️ CRITICAL**: Ảnh, smoke, progress và e2e "trước" phải lấy từ cây chưa dời.

- [ ] T007 Đo mốc `npm test` **cả hai cách** trên cây chưa dời: (a) `npm test` mặc định, (b) `npm test -- --testTimeout=30000`; chạy `node specs/001-repo-restructure/verify-baseline.mjs --also-default` cho bốn lệnh của cổng. Kỳ vọng cách (b) theo FR-011. Ghi **cả hai kết quả** vào bảng "Mốc so sánh" trong `spec.md` (User Story 1) cùng kết quả `npm run lint`. **Nếu cách (b) vẫn có test fail hoặc `lint` không xanh thì DỪNG và báo Mạnh** trước khi làm tiếp
- [ ] T008 `npm run build` rồi `node specs/001-repo-restructure/shoot.mjs shots before` hai lần liên tiếp (lần hai ghi vào thư mục tạm), so hai lần cho cùng hash để chắc 36 ảnh ổn định; nếu không ổn định, sửa `shoot.mjs` (thêm chờ, tắt hoạt ảnh) cho tới khi ổn định. Kết quả: 36 ảnh trong `.screens/001/before/`
- [ ] T009 `node specs/001-repo-restructure/shoot.mjs smoke before` rồi `node specs/001-repo-restructure/shoot.mjs smoke before --dev`: ghi số route duyệt được, danh sách route, kết quả `/styleguide` (dev) vào `.screens/001/smoke-before.json`; mọi route phải ổn. Nếu một route đã lỗi sẵn ở bản trước thì ghi lại làm mốc (không coi là hồi quy), và báo Mạnh
- [ ] T010 `node specs/001-repo-restructure/shoot.mjs progress before`: tạo dữ liệu tiến độ và sổ lỗi sai, ghi số bản ghi từng bảng vào `.screens/001/progress-before.json`. **Không xóa** thư mục profile `.screens/001/profile` cho tới khi T064 xong
- [ ] T011 `npm run build` (nếu `dist/` chưa mới) rồi `npm run test:e2e` trên cây chưa dời (6 file spec, gồm `repo-restructure.spec.ts`); ghi kết quả (số test, từng file spec) vào bảng "Mốc so sánh" của `spec.md`, kèm riêng hai test `browse.spec.ts` ("mở trang chủ → vào N5 → Minna no Nihongo 1 → Bài 1", "mở thẳng /b/mnn1/5 không bị 404") và hai test 360×740. Ghi thêm vào bảng: số route của smoke và số bản ghi của progress
- [ ] T012 Commit G0 (mã): `feat(001): công cụ kiểm, test e2e 360px` gồm `.gitignore`, `specs/001-repo-restructure/verify-baseline.mjs`, `specs/001-repo-restructure/shoot.mjs`, `tests/e2e/repo-restructure.spec.ts`
- [ ] T013 Commit G0 (tài liệu): `docs: ghi mốc so sánh vào spec 001` gồm `specs/001-repo-restructure/spec.md`

**Checkpoint**: Mốc "trước" (test cả hai cách, build, validate, lint, e2e, 36 ảnh, smoke, progress) đã có. Bắt đầu dời file.

---

## Phase 3: User Story 2 — Mỗi loại file có một chỗ ở (Priority: P2, nhưng chạy trước vì là phần việc chính; G1–G5)

**Goal**: Dời và đổi tên 41 file trong `src/` cùng `BACKLOG.md` và `design/` theo `data-model.md` (43 hàng), không đổi logic hay giao diện.

**Independent Test**: `quickstart.md` mục 2 — gốc repo chỉ còn `CLAUDE.md`, `README.md` là `.md`; 43 hàng ánh xạ đúng; ba file loại trừ còn ở `src/lib/`; lịch sử file truy vết được.

> Các nhóm dưới đây **tuần tự G1 → G5**. Trong một nhóm, task đụng cùng file thì không song song.

### G1 — Tài liệu và link

- [ ] T014 [US2] `git mv BACKLOG.md docs/reference/BACKLOG.md`
- [ ] T015 [US2] `git mv design docs/reference/design` (cả thư mục: `SPEC.md`, `AUDIT.md`, 11 ảnh `.png`; đặt `git config core.quotepath false` để đọc được tên tiếng Việt khi xem `git status`). Không sửa nội dung bên trong
- [ ] T016 [US3] Sửa `README.md` dòng 5: link `./docs/Ke_hoach_Website.md` → `./docs/reference/Ke_hoach_Website.md`
- [ ] T017 [P] [US3] Sửa chú thích đường dẫn `docs/Ke_hoach_Website.md` → `docs/reference/Ke_hoach_Website.md` trong `content/manifest.yaml` (dòng 24) và `content/overrides/id-aliases.yaml` (dòng 2). Chỉ sửa chữ trong chú thích `#` (được phép theo FR-013), không đụng giá trị khai báo
- [ ] T018 [P] [US3] Sửa chú thích `BACKLOG.md` → `docs/reference/BACKLOG.md` trong `src/features/home/continue-lesson.ts` (dòng 15)
- [ ] T019 [US1] Cổng G1 → PASS; commit `docs: dời BACKLOG và design vào docs/reference, sửa link kế hoạch`

### G2 — Tiện ích

- [ ] T020 [US2] Tạo `src/data/hooks/` và `git mv src/lib/use-async-data.ts src/data/hooks/use-async-data.ts`
- [ ] T021 [US2] Đổi import `@/lib/use-async-data` → `@/data/hooks/use-async-data` ở **12 file**: `src/features/browse/BookPage.tsx`, `KanjiRelatedTab.tsx`, `LessonPage.tsx`, `LevelPage.tsx`, `LevelsPage.tsx`; `src/features/home/HomePage.tsx`; `src/features/practice/PracticeRunPage.tsx`, `PracticeSetupPage.tsx`; `src/features/weakness/MistakesPage.tsx`, `WeaknessPage.tsx`; `src/features/kanji/KanjiDetailPage.tsx`; `src/features/search/SearchPage.tsx` (hai file cuối còn ở chỗ cũ, sẽ dời ở G3)
- [ ] T022 [US2] `git mv src/lib/format-duration.ts src/lib/format.ts` và `git mv src/lib/format-duration.test.ts src/lib/format.test.ts`; sửa import trong `src/lib/format.test.ts` (`./format-duration` → `./format`) và trong `src/features/practice/PracticeResultPage.tsx` (`@/lib/format-duration` → `@/lib/format`)
- [ ] T023 [US1] Cổng G2 → PASS; commit `feat(001): use-async-data sang data/hooks, format-duration thành format`

### G3 — Khung ứng dụng

- [ ] T024 [US2] Tạo `src/app/layouts/`; `git mv src/App.tsx src/app/App.tsx` và `git mv src/App.test.tsx src/app/App.test.tsx` (`App.test.tsx` giữ `import … from './App'`)
- [ ] T025 [US2] `git mv src/app/Layout.tsx src/app/layouts/AppShell.tsx` (đổi tên export `Layout` → `AppShell`), `git mv src/app/TopBar.tsx src/app/layouts/TopBar.tsx`, `git mv src/app/BottomNav.tsx src/app/layouts/BottomNav.tsx`; trong `TopBar.tsx` và `BottomNav.tsx` đổi `./nav-items` → `../nav-items` (file `nav-items.ts` ở lại `src/app/`)
- [ ] T026 [US2] `git mv src/components/ui/Container.tsx src/app/layouts/Container.tsx`; xóa dòng `export { Container } from './Container'` trong `src/components/ui/index.ts`; đổi import `Container` thành `./Container` trong `src/app/layouts/AppShell.tsx` và `TopBar.tsx` (dòng `import { Container } from '@/components/ui'` bị thay hẳn, vì hai file này chỉ import `Container` từ barrel), và `@/app/layouts/Container` trong `src/features/dev/StyleguidePage.tsx`
- [ ] T027 [US2] `git mv src/components/ComingSoon.tsx src/app/ComingSoon.tsx`
- [ ] T028 [US2] `git mv src/index.css src/ui/tokens.css` (tạo `src/ui/` nếu chưa có; **không sửa nội dung**); trong `src/main.tsx` đổi `import './index.css'` → `import '@/ui/tokens.css'` và `import App from './App.tsx'` → `import App from '@/app/App'`
- [ ] T029 [US2] `git mv src/features/kanji/KanjiDetailPage.tsx src/features/browse/KanjiPage.tsx` (đổi tên export `KanjiDetailPage` → `KanjiPage`), `git mv src/features/search/SearchPage.tsx src/features/browse/SearchPage.tsx`, `git mv src/features/about/AboutPage.tsx src/features/settings/AboutPage.tsx`; xóa các thư mục `kanji/`, `search/`, `about/` đã rỗng
- [ ] T030 [US2] Sửa import trong `src/app/App.tsx`: `@/app/Layout` → `@/app/layouts/AppShell` (dùng `AppShell`), `@/components/ComingSoon` → `./ComingSoon`, `@/features/kanji/KanjiDetailPage` → `@/features/browse/KanjiPage`, `@/features/search/SearchPage` → `@/features/browse/SearchPage`, `@/features/about/AboutPage` → `@/features/settings/AboutPage`; giữ nguyên `@/components/NotFound` (dời ở G4); không đổi bảng route
- [ ] T031 [US1] Cổng G3 → PASS (đặc biệt `build` — bắt import sót); commit `feat(001): chuyển khung ứng dụng vào src/app, index.css thành ui/tokens.css, gom trang vào browse/settings`

### G4 — `ui/primitives` và `ui/signature`

- [ ] T032 [US2] Tạo `src/ui/primitives/`; `git mv` từ `src/components/ui/` sang `src/ui/primitives/`: `Button.tsx`, `button-styles.ts`, `Card.tsx`, `Chip.tsx`, `EmptyState.tsx`, `LinkButton.tsx`, `SegmentedControl.tsx`, `Switch.tsx`, `index.ts`
- [ ] T033 [US2] Tạo `src/ui/signature/`; `git mv src/components/ui/StationBadge.tsx src/ui/signature/StationBadge.tsx`; trong `src/ui/primitives/index.ts` xóa hai dòng `export { StationBadge } …` và `export type { StationState } …`; xóa thư mục `src/components/ui/` đã rỗng
- [ ] T034 [US2] `git mv` vào `src/ui/primitives/`: `src/components/ErrorState.tsx`, `LoadingState.tsx`, `NotFound.tsx`, `ThemeToggle.tsx` (giữ `ThemeToggle` import `@/lib/use-theme`; **không dời** `lib/theme.ts` và `lib/use-theme.ts`)
- [ ] T035 [US2] `git mv src/lib/heatmap.ts src/ui/signature/heatmap.ts` và `git mv src/lib/heatmap.test.ts src/ui/signature/heatmap.test.ts` (test giữ `./heatmap`)
- [ ] T036 [US2] Tạo `src/ui/signature/mascot/`; `git mv src/components/mascot/ShibaMascot.tsx`, `TrainPlatformScene.tsx`, `JapanMotifBackground.tsx` sang đó; xóa `src/components/mascot/` đã rỗng
- [ ] T037 [US2] Đổi import `@/components/ErrorState`, `LoadingState`, `NotFound` → `@/ui/primitives/ErrorState`, `LoadingState`, `NotFound` ở các file: `src/app/App.tsx` (NotFound); `src/features/browse/BookPage.tsx`, `KanjiRelatedTab.tsx` (LoadingState), `LessonPage.tsx`, `LevelPage.tsx`, `LevelsPage.tsx`, `KanjiPage.tsx`, `SearchPage.tsx` (LoadingState); `src/features/practice/PracticeRunPage.tsx`, `PracticeSetupPage.tsx`; `src/features/weakness/MistakesPage.tsx`, `WeaknessPage.tsx`
- [ ] T038 [US2] Đổi các import còn lại của nhóm G4: barrel `@/components/ui` → `@/ui/primitives` trong `src/features/home/HomePage.tsx` và `src/features/dev/StyleguidePage.tsx` (hai file barrel còn lại; `AppShell` và `TopBar` không còn import barrel từ T026); `@/components/ThemeToggle` → `@/ui/primitives/ThemeToggle` trong `src/app/layouts/TopBar.tsx` và `src/features/settings/SettingsPage.tsx`; `@/lib/heatmap` → `@/ui/signature/heatmap` trong `src/features/browse/BookPage.tsx`; `@/components/mascot/ShibaMascot` / `TrainPlatformScene` → `@/ui/signature/mascot/…` trong `HomePage.tsx` và `StyleguidePage.tsx`; `StationBadge` trong `StyleguidePage.tsx` đổi sang import trực tiếp `@/ui/signature/StationBadge` (và `StationState` nếu file có dùng)
- [ ] T039 [US1] Cổng G4 → PASS; commit `feat(001): tạo ui/primitives và ui/signature, dời mascot, heatmap`

### G5 — `ui/jp`, `ui/quiz`, dọn `src/components`

- [ ] T040 [US2] Tạo `src/ui/jp/`; `git mv src/components/Ruby.tsx`, `Ruby.test.tsx`, `SpeakButton.tsx`, `SpeakButton.test.tsx` sang đó (`SpeakButton` vẫn import `@/lib/tts`; test giữ `./Ruby`, `./SpeakButton`)
- [ ] T041 [US2] Tạo `src/ui/quiz/`; `git mv src/components/TextChoiceCard.tsx src/ui/quiz/TextChoiceCard.tsx` và `BlankChoiceCard.tsx` tương tự
- [ ] T042 [US2] `git mv src/components/KanjiCard.tsx src/features/browse/KanjiCard.tsx`; trong `src/features/browse/KanjiRelatedTab.tsx` và `LessonPage.tsx` đổi `@/components/KanjiCard` → `./KanjiCard`
- [ ] T043 [US2] Đổi import `@/components/Ruby` → `@/ui/jp/Ruby` và `@/components/SpeakButton` → `@/ui/jp/SpeakButton` ở: `src/features/browse/VocabTab.tsx`, `GrammarTab.tsx`, `KanjiPage.tsx`, `SearchPage.tsx`; `src/features/practice/modes/flashcard/FlashcardComponent.tsx`, `modes/mcq/McqComponent.tsx`, `src/features/practice/PracticeResultPage.tsx` (Ruby); `src/features/weakness/MistakesPage.tsx`, `WeaknessPage.tsx` (Ruby)
- [ ] T044 [US2] Đổi import `@/components/TextChoiceCard` → `@/ui/quiz/TextChoiceCard` ở `src/features/practice/modes/conjugation-mcq/index.tsx`, `grammar-pattern/index.tsx`, `kanji-hanviet/index.tsx`, `kanji-reading/index.tsx`, `sentence-meaning/index.tsx`; và `@/components/BlankChoiceCard` → `@/ui/quiz/BlankChoiceCard` ở `src/features/practice/modes/fill-blank/FillBlankComponent.tsx`, `kanji-in-vocab/KanjiInVocabComponent.tsx`, `particle/ParticleComponent.tsx`
- [ ] T045 [US2] `git mv src/components/README.md src/ui/README.md` (chưa sửa nội dung; sửa ở G6); xác nhận `src/components/` chỉ còn rỗng rồi xóa thư mục; `grep -rn "@/components" src` phải không in gì
- [ ] T046 [US1] Chạy `npm run build` rồi `npm run test:e2e`; kết quả phải khớp mốc e2e ghi ở T011 (đặc biệt `browse.spec.ts` và `repo-restructure.spec.ts`)
- [ ] T047 [US1] Cổng G5 → PASS; commit `feat(001): tạo ui/jp và ui/quiz, KanjiCard vào browse, bỏ src/components`
- [ ] T048 [US2] Kiểm độc lập User Story 2 theo `quickstart.md` mục 2: (a) `git ls-files '*.md' | grep -v '/'` chỉ in `CLAUDE.md`, `README.md`; (b) với **từng một trong 43 hàng** của bảng ánh xạ trong `data-model.md`: cột "Từ" không còn tồn tại (`test ! -e`) và cột "Đến" tồn tại (`test -e`; hàng #2 là thư mục `design/` → `docs/reference/design/`); (c) ba file loại trừ vẫn ở đúng chỗ: `test -e src/lib/tts.ts -a -e src/lib/theme.ts -a -e src/lib/use-theme.ts`; (d) `git log --follow --oneline -- src/ui/jp/Ruby.tsx` thấy > 1 commit; (e) `git diff --stat -M dca3700...HEAD`: tỉ lệ đổi tên ≥ 95% trên 43 hàng. Nếu có file bị Git coi là xóa-và-thêm, ghi lại vào báo cáo

**Checkpoint**: Mọi file nhóm "Dời" (43 hàng) đã ở vị trí mới; website vẫn khớp mốc. User Story 2 kiểm được độc lập.

---

## Phase 4: User Story 3 — Hết link hỏng và tài liệu đúng vị trí mới (Priority: P2; G6)

**Goal**: README, README thư mục con và tài liệu đang dùng mô tả đúng cây mới; không còn đường dẫn cũ.

**Independent Test**: `quickstart.md` mục 3 — hai lệnh `grep` không còn đường dẫn cũ; mở `README.md`, bấm từng link không hỏng.

- [ ] T049 [US3] Sửa mục "Cấu trúc" trong `README.md` theo cây mới (`content/`, `scripts/content/`, `src/app|ui|features|domain|data|lib|i18n`, `docs/` và `docs/reference/`, `specs/`); giữ nguyên các mục khác
- [ ] T050 [P] [US3] Cập nhật README thư mục con: `src/app/README.md` (App, `layouts/`, ComingSoon, nav-items), `src/ui/README.md` (nội dung mới: `tokens.css`, `primitives/`, `jp/`, `quiz/`, `signature/` kèm `mascot/`), `src/data/README.md` (thêm `hooks/use-async-data.ts`), `src/lib/README.md` (ghi `theme.ts` và `use-theme.ts` còn ở đây tạm thời, vị trí cuối chốt ở `ui-kit-and-shell`; `tts.ts`, `sfx.ts`, `format.ts`)
- [ ] T051 [US3] Sửa `docs/FRONTEND.md` theo bảng "Danh sách dòng G6" trong `plan.md`: §3 (dòng 59, 67, 68, 70, 73–74), dòng 183 và 223 (`src/index.css` → `src/ui/tokens.css`), §8 (dòng 298, 303, 305, 310 và thêm ghi chú `KanjiCard` ở `features/browse/`). Tìm theo nội dung, không chỉ theo số dòng
- [ ] T052 [US3] Sửa `docs/ARCHITECTURE.md` hàng `repo-restructure` (dòng 432): thêm `src/features/browse/` (KanjiCard) và ghi `lib/theme.ts`, `lib/use-theme.ts` chưa dời; chạy `grep -nE "NotFound|ThemeToggle|KanjiCard|use-theme" docs/ARCHITECTURE.md` để xác nhận không còn dòng nào khác cần sửa
- [ ] T053 [P] [US3] Sửa `docs/SPECKIT_ROADMAP.md`: mọi `src/index.css` trong prompt của feature kế tiếp → `src/ui/tokens.css`; không sửa phần mô tả đã xong
- [ ] T054 [US3] Kiểm độc lập User Story 3 theo `quickstart.md` mục 3: chạy hai lệnh `grep` (tên cũ trong `src`; đường dẫn cũ trong `README.md`, `CLAUDE.md`, `docs/ARCHITECTURE.md`, `docs/FRONTEND.md`, `docs/SPECKIT_ROADMAP.md`, `src/*/README.md`), mong đợi không còn đường dẫn cũ dùng như đường dẫn hiện hành (các câu nói "dời từ …" được phép); loại `docs/reference/**`. Mở `README.md` và xác nhận từng link mở được
- [ ] T055 [US1] Cổng G6 → PASS; commit `docs: cập nhật README và tài liệu theo cấu trúc mới`. Trong báo cáo hoàn thành G6 **liệt kê từng dòng đã sửa** theo dạng `file:dòng — trước → sau` cho `docs/FRONTEND.md`, `docs/ARCHITECTURE.md`, `docs/SPECKIT_ROADMAP.md` và các README

**Checkpoint**: Tài liệu đang dùng khớp cây mới; User Story 3 kiểm được độc lập (phần xóa file build cũ nằm ở Phase 7).

---

## Phase 5: User Story 4 — Luật phụ thuộc giữa các lớp được máy kiểm tra (Priority: P3; G7)

**Goal**: `npm run lint` báo lỗi khi mã vi phạm bảng §4.2.

**Independent Test**: `quickstart.md` mục 4 — 7 ca vi phạm báo lỗi, 3 ca hợp lệ không báo, `npm run lint` toàn cây xanh.

> **Phase này tách riêng và bỏ được**: bỏ cả Phase 5 thì Phase 3, 4, 6, 7 vẫn hoàn thành đầy đủ User Story 1, 2, 3. Chỉ User Story 4 (SC-007) chưa đạt.

- [ ] T056 [US4] Sửa `eslint.config.js`: thêm các khối `@typescript-eslint/no-restricted-imports` theo `specs/001-repo-restructure/contracts/layering-rules.md` — luật cho `src/domain/**`, `src/data/**` (cho phép `react` trong `src/data/hooks/**`), `src/ui/**`, `src/features/**` (cấm `app/`) và luật theo từng feature sinh từ `fs.readdirSync('src/features')`, `src/platform/**`, luật toàn cục cho `dexie`, `@supabase/supabase-js`, `@capacitor/*` kèm ngoại lệ đường dẫn được phép; thêm ba khối ngoại lệ có tên và bình luận lý do: TD-1 (`src/domain/quiz/registry.ts`), TD-2 (`src/features/weakness/WeaknessPage.tsx`, `MistakesPage.tsx`), E-1 (`src/features/dev/**`). Đặt các khối trước `eslintConfigPrettier`. Không thêm plugin, không dùng `// eslint-disable`
- [ ] T057 [US4] Chạy `npm run lint`; kỳ vọng xanh. Nếu đỏ ở file **ngoài** ba ngoại lệ: sửa khi nhỏ (một dòng `import` đổi đường dẫn); nếu lớn (cần đổi logic hoặc cấu trúc) thì ghi một mục TD mới vào bảng "Complexity Tracking" của `plan.md` và `contracts/layering-rules.md` với **số file và tên file cụ thể**, rồi thêm ngoại lệ có tên tương ứng — không viết lại logic
- [ ] T058 [US4] Chạy 10 ca kiểm trong `contracts/layering-rules.md` bằng `echo "<mã>" | npx eslint --stdin --stdin-filename <đường dẫn giả>`: ca 1–7 phải báo `no-restricted-imports` và thoát mã 1; ca 8–10 thoát mã 0. Ghi kết quả từng ca vào báo cáo
- [ ] T059 [US1] Cổng G7 → PASS (đặc biệt `lint`); commit `feat(001): thêm luật ESLint phụ thuộc giữa các lớp (§4.2)`

**Checkpoint**: User Story 4 kiểm được độc lập; ba ngoại lệ có tên là toàn bộ nợ về luật phụ thuộc.

---

## Phase 6: User Story 1 — Ký nhận "website y như cũ" (Priority: P1; G8)

**Goal**: Chứng minh website sau khi dời giống bản trước, ở mức người dùng thấy và ở mức dữ liệu.

**Independent Test**: `quickstart.md` mục 5.

- [ ] T060 [US1] `npm run build`: thoát mã 0; kích thước JS không lớn hơn mốc 608,42 kB đáng kể; chỉ 1 cảnh báo chunk lớn
- [ ] T061 [US1] Chạy cổng đầy đủ: `node specs/001-repo-restructure/verify-baseline.mjs --also-default` → PASS theo FR-011 (kết quả mặc định chỉ để ghi). Chạy thêm `npm run check` và ghi kết quả (có thể đỏ ngẫu nhiên vì Q-1; nếu đỏ thì chạy lại một lần và ghi cả hai)
- [ ] T062 [US1] `npm run test:e2e`: toàn bộ 6 file giống mốc T011; hai test `browse.spec.ts` và hai test 360×740 của `repo-restructure.spec.ts` đạt
- [ ] T063 [US1] `npm run build && node specs/001-repo-restructure/shoot.mjs smoke after` rồi `node specs/001-repo-restructure/shoot.mjs smoke after --dev`: cùng số route với mốc T009, không route nào trắng hay lỗi console, `/styleguide` (dev) mở được và bản preview trả 404 cho nó. Lệch mốc → dừng và báo
- [ ] T064 [US1] `node specs/001-repo-restructure/shoot.mjs progress after`: mở lại **cùng profile** `.screens/001/profile` và **cùng cổng 4174**, đếm số bản ghi từng bảng IndexedDB, so với `progress-before.json`; kỳ vọng mọi bảng bằng nhau (kiểm FR-002, SC-006). Lệch hoặc mất bảng → dừng và báo
- [ ] T065 [US1] `node specs/001-repo-restructure/shoot.mjs shots after && node specs/001-repo-restructure/shoot.mjs compare`: kỳ vọng `36/36 giống hệt`. Ảnh khác thì mở cả hai ảnh, ghi lại khác biệt; chỉ chấp nhận khi nguyên nhân nằm ngoài feature (VD phông chữ tải từ mạng) và có ghi chú
- [ ] T066 [US1] **Nhờ Mạnh xem ảnh trước/sau** của trang chủ (`/`) và `/b/mnn1/5` ở 360px, cả sáng và tối (4 cặp trong `.screens/001/before/` và `.screens/001/after/`; liệt kê đường dẫn tuyệt đối từng cặp) và xác nhận không khác. Ghi câu trả lời của Mạnh vào báo cáo. Chưa có xác nhận thì SC-002 chưa đạt
- [ ] T067 [US1] **Hỏi Mạnh đồng ý trước, rồi mới** đẩy nhánh `git push -u origin 001-repo-restructure` và tạo Pull Request (`gh pr create`, quy trình constitution mục 3: mỗi feature một PR). **Không tự đẩy.** Mô tả PR ngắn: tóm tắt, kết quả cổng, đường dẫn `evidence.md`, các ngoại lệ TD-1/TD-2/E-1/Q-1
- [ ] T068 [US1] Sau khi có Vercel Preview của nhánh, nhờ Mạnh mở trên điện thoại trang chủ và `/b/mnn1/5` và xác nhận hiển thị như bản đang chạy (User Story 1, tình huống 4). **Không** dùng Preview để kiểm tiến độ cũ (khác origin nên IndexedDB trống; việc đó đã kiểm ở T064). Nếu chưa có Preview, ghi rõ "chưa kiểm" thay vì bỏ qua

**Checkpoint**: User Story 1 có bằng chứng (lệnh, route, tiến độ, ảnh, Preview).

---

## Phase 7: Polish & Cross-Cutting (kết thúc feature)

**Purpose**: Dọn file build cũ, ghi bằng chứng, đóng feature.

- [ ] T069 Đọc `plan.md` mục "Báo cáo nội dung ở G8" rồi xóa file build cũ **cục bộ** (đã gitignore, không tạo commit): `dist/`, `playwright-report/`, `test-results/`, `public/content-report.md`. **Không xóa** `content-report.md` ở gốc repo (ngoại lệ §8.2), `public/content/**`, `node_modules/`, `.screens/`. Nếu `public/content-report.md` xuất hiện lại sau một lần `content:build`, dừng và báo Mạnh (không sửa `scripts/content/pipeline.ts`)
- [ ] T070 Chạy `git status --short` (phải rỗng) và `find . -maxdepth 1 -name '*.md'` trong repo (chỉ `CLAUDE.md`, `README.md`, kèm `content-report.md` đã gitignore); xác nhận không còn thư mục/file bản sao bằng `git ls-files | grep -E '(^|/)(old|backup|new)/|-copy\.|-v2\.'` (kỳ vọng rỗng)
- [ ] T071 Mở lại `README.md` lần cuối và xác nhận không còn link hỏng (SC-005)
- [ ] T072 Tạo `specs/001-repo-restructure/evidence.md`: bảng SC-001 … SC-009 với bằng chứng từng tiêu chí (lệnh đã chạy, kết quả, đường dẫn ảnh, kết quả smoke và progress, kết quả Preview của T068, xác nhận của Mạnh ở T066, các dòng đã sửa ở T055, bốn ngoại lệ TD-1/TD-2/E-1/Q-1, 10 ca ESLint, kết quả cả hai cách chạy `npm test`)
- [ ] T073 Đánh dấu hoàn thành `repo-restructure` trong `docs/SPECKIT_ROADMAP.md` (quy tắc Development Workflow mục 5): đổi ⬜/🟨 của feature này thành ✅, ghi `lib/theme.ts`, `lib/use-theme.ts`, `lib/tts.ts` chưa dời (vị trí cuối ở `ui-kit-and-shell`) và ghi Q-1 chuyển cho `quality-gaps`
- [ ] T074 Gửi Mạnh **10 câu "file loại X đặt ở đâu"** ở `quickstart.md` mục 6 (kèm đáp án để Mạnh tự đối chiếu sau khi trả lời) để Mạnh tự trả lời, ghi kết quả vào `evidence.md` (SC-009). Rồi commit cuối `docs: bằng chứng nghiệm thu và cập nhật roadmap cho spec 001` và nhờ Mạnh duyệt Pull Request trước khi gộp vào `main`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 Setup** (T001–T006): không phụ thuộc. T003, T004, T005 song song; T006 sau cùng cho tới T005 (cần trình duyệt để chạy thử).
- **Phase 2 Foundational** (T007–T013): phụ thuộc Phase 1; **chặn mọi nhóm dời file**. Thứ tự T007 → T008 → T009 → T010 → T011 → T012 → T013.
- **Phase 3 US2** (G1–G5, T014–T048): phụ thuộc Phase 2. G1 → G2 → G3 → G4 → G5 tuần tự; mỗi nhóm kết thúc bằng cổng `[US1]` rồi commit.
- **Phase 4 US3** (G6, T049–T055): phụ thuộc Phase 3.
- **Phase 5 US4** (G7, T056–T059): phụ thuộc Phase 3; **không phụ thuộc Phase 4**, bỏ được.
- **Phase 6 US1** (T060–T068): phụ thuộc Phase 3 và 4 (và Phase 5 nếu làm). T067 (đẩy nhánh) cần Mạnh đồng ý; T068 cần T067.
- **Phase 7 Polish** (T069–T074): phụ thuộc Phase 6 (T068 có thể "chưa kiểm" nếu chưa có Preview).

### User Story Dependencies

- **US1 (P1)**: ràng buộc xuyên suốt. Cổng sau mỗi nhóm + ký nhận ở Phase 6. Không có việc dời file riêng của US1.
- **US2 (P2)**: chạy trước US3 và US4.
- **US3 (P2)**: phần link README (T016–T018) làm sớm ở G1; phần tài liệu theo cây mới (G6) sau US2; phần xóa file build cũ ở Phase 7.
- **US4 (P3)**: độc lập sau US2; có thể bỏ.

### Within Each Group

- `git mv` trước, sửa import sau, `build` để bắt sót, cổng, rồi commit.
- Task cùng sửa một file (`App.tsx`, `StyleguidePage.tsx`, `BookPage.tsx`, `TopBar.tsx`, `HomePage.tsx`) không chạy song song.

### Parallel Opportunities

- T003, T004, T005 (ba file độc lập).
- T017 và T018 (khác file, chỉ sửa chú thích).
- T050 và T053 (README và `SPECKIT_ROADMAP.md`).
- Còn lại tuần tự vì mỗi nhóm phải qua cổng trước khi sang nhóm kế.

### Parallel Example: Phase 1

```text
Task: "Tạo specs/001-repo-restructure/verify-baseline.mjs"   (T003)
Task: "Tạo specs/001-repo-restructure/shoot.mjs"             (T004)
Task: "Tạo tests/e2e/repo-restructure.spec.ts"               (T005)
```

---

## Implementation Strategy

### Bước an toàn đầu tiên

1. Phase 1 → Phase 2: có mốc (T001–T013).
2. G1 (T014–T019): chỉ dời tài liệu và sửa link — rủi ro thấp, thấy kết quả ngay.
3. **Dừng và kiểm** nếu muốn: website chưa đổi gì ngoài tài liệu.

### Giao từng bước

1. G2 → G3 → G4 → G5, mỗi nhóm một commit đã qua cổng. Hỏng nhóm nào thì `git revert` đúng commit đó.
2. G6 (tài liệu), rồi Phase 6 (ký nhận), rồi Phase 7 (dọn).
3. G7 (ESLint) làm cuối hoặc để sau; không chặn việc gộp P1–P3.

### Nếu muốn bỏ User Story 4

Bỏ Phase 5 (T056–T059). Cập nhật `spec.md` (SC-007 chuyển sang "chưa làm") và `docs/SPECKIT_ROADMAP.md`; các phase còn lại không đổi.

---

## Notes

- Ngoại lệ có tên: **TD-1** `src/domain/quiz/registry.ts` (1 file); **TD-2** `src/features/weakness/WeaknessPage.tsx`, `MistakesPage.tsx` (2 file); **E-1** `src/features/dev/**` (miễn dev); **Q-1** `scripts/content/pipeline.test.ts` quá hạn khi chạy mặc định (chuyển cho `quality-gaps`). Chi tiết ở `plan.md` → Complexity Tracking.
- Không có test logic mới. Nếu bất kỳ task nào buộc phải đổi logic để làm xong, **dừng** và báo Mạnh — nằm ngoài phạm vi (FR-013).
- Bảng "Danh sách dòng G6" trong `plan.md` là nguồn cho T051–T053.
- Việc xin phép: T067 (đẩy nhánh, tạo PR) và T066/T068/T074 (cần Mạnh xem hoặc trả lời) là các điểm chờ người.
