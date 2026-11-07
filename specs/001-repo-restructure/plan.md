# Implementation Plan: Sắp xếp lại cấu trúc repo (repo-restructure)

**Branch**: `001-repo-restructure` | **Date**: 2026-11-07 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-repo-restructure/spec.md`

## Summary

Dời và đổi tên file theo `docs/ARCHITECTURE.md` §8.1 và `docs/FRONTEND.md` §3, sửa import và đường dẫn tham chiếu, thêm luật ESLint cho §4.2. **Không viết lại logic, không đổi giao diện.**

Cách làm (xem `research.md`):

1. Chỉ dùng `git mv` + sửa dòng `import`/đường dẫn. Mỗi file dời giữ nguyên nội dung, nên Git nhận ra là đổi tên.
2. Chia thành **9 nhóm commit nhỏ** (G0–G8). Sau mỗi nhóm chạy **cổng kiểm định nghĩa ở `spec.md` FR-011** và so với mốc trong spec. Lệch mốc thì **dừng và báo**, không sang nhóm sau.
3. Luật ESLint (User Story 4, P3) nằm ở **nhóm riêng G7**, đặt sau khi dời xong. Có thể bỏ G7 mà không ảnh hưởng P1, P2.
4. Quy mô: **41 file trong `src/` dời hoặc đổi tên** (kể cả test và `README.md`), thêm `BACKLOG.md` và thư mục `design/` (13 file); **26 file không dời nhưng phải sửa import**; 5 file dời có kèm sửa import.

**Bốn điểm lệch so với bảng audit (Mạnh đã duyệt 2026-11-07, xem mục "Điểm lệch đã duyệt"; spec FR-004 đã sửa khớp):** `NotFound` và `ThemeToggle` vào `src/ui/primitives/` thay vì `src/app/`; `lib/theme.ts` và `lib/use-theme.ts` chưa dời; `KanjiCard` vào `src/features/browse/` thay vì `src/ui/jp/`. Lý do: đặt theo bảng cũ sẽ tự tạo ra 6 vi phạm luật §4.2 mới (4 ở `NotFound`, 1 ở `ThemeToggle`, 1 ở `KanjiCard`) ngay sau khi dời.

## Technical Context

**Language/Version**: TypeScript ~6.0 (`strict`), React 19.3, Vite 8, Node 24 (CI)

**Primary Dependencies**: không thêm thư viện. ESLint 10 + `typescript-eslint` 8 (đã cài) cho luật `no-restricted-imports`

**Storage**: IndexedDB qua Dexie (không đổi, không đụng `dexie-repo.ts`); `public/content/**` sinh tự động (không đổi)

**Testing**: Vitest 5 (44 file, 220 test), Playwright 1.64 (5 file e2e có sẵn, thêm `tests/e2e/repo-restructure.spec.ts` ở G0 thành 6; `playwright.config.ts` không đổi); `npm run check` = `content:validate` + `typecheck` + `lint` + `test`. Cổng kiểm: xem `spec.md` FR-011

**Target Platform**: Web (Vercel); `src/` là mã dùng chung cho web và app sau này

**Project Type**: web-application, một dự án (single project) — không tách frontend/backend

**Performance Goals**: không đổi. Mốc build: JS 608,42 kB (nén 185,23 kB) — sau khi dời không được lớn hơn đáng kể

**Constraints**: không đổi hành vi, giao diện, route, tên tham số địa chỉ, định dạng lưu tiến độ, cấu hình build/deploy, phiên bản thư viện. Không dời `src/lib/tts.ts`. Không đụng `Source code/Docs/` và `Source code/Ảnh mobile/`

**Scale/Scope**: `src/` có 164 file; 41 file trong `src/` dời, 26 file sửa import; 5 file README/tài liệu "hiện trạng" cần cập nhật

## Constitution Check

*GATE: đạt trước Phase 0, đã kiểm lại sau Phase 1.*

| Nguyên tắc | Kết quả | Ghi chú |
|---|---|---|
| I. Nội dung là dữ liệu | **Đạt** | Không đụng `content/**/*.md` hay logic nội dung. Chỉ sửa 2 dòng **chú thích** trong `content/manifest.yaml` và `content/overrides/id-aliases.yaml` (trỏ `docs/Ke_hoach_Website.md` → `docs/reference/Ke_hoach_Website.md`). `public/content/**` không commit, không sửa |
| II. Local-first | **Đạt** | Không dời `dexie-repo.ts` hay `ProgressRepository`. Định dạng lưu và bảng IndexedDB không đổi |
| III. Kiến trúc phân lớp | **Đạt, có nợ ghi nhận** | Feature này *thực thi* nguyên tắc. 3 vi phạm có sẵn được ghi ở bảng Complexity Tracking, không sửa logic |
| IV. Test trước cho logic (NON-NEGOTIABLE) | **Đạt có điều kiện, có một ngoại lệ ghi nhận (Q-1)** | (a) Không thêm logic thuần; test dời cùng file nguồn, số test không giảm; luật ESLint kiểm bằng lệnh thử vi phạm trong `quickstart.md`. (b) *Mỗi feature có e2e ở 360×740*: thêm `tests/e2e/repo-restructure.spec.ts` (`test.use({ viewport: { width: 360, height: 740 } })`, mở `/` và `/b/mnn1/5`) ở G0 trước khi dời file; không sửa `playwright.config.ts`; file được giữ lại. (c) *`npm run check` xanh trước mọi commit*: cổng chạy `npm test` kèm cờ timeout ở dòng lệnh theo FR-011 (không sửa repo) nên mỗi commit đều qua cổng xanh; riêng chạy mặc định thì test `pipeline.test.ts` có thể quá hạn 5 giây, đã ghi ở Complexity Tracking Q-1 (CI trên Pull Request có thể đỏ ngẫu nhiên, khi đó chạy lại; sửa gốc ở spec `quality-gaps`) |
| V. Phát hiện điểm yếu | **Không liên quan** | Không đụng `Attempt`, `itemId`, ID nội dung |
| VI. Giao diện mobile-first | **Đạt** | `src/index.css` → `src/ui/tokens.css` nguyên nội dung (đúng đường dẫn nguyên tắc VI yêu cầu). Không thêm hex, không đổi chuỗi. Ảnh chụp trước/sau chứng minh không đổi giao diện |
| VII. Bảo mật & bản quyền | **Đạt** | Không đụng biến môi trường hay khóa. `.env.example` giữ nguyên |

Không có vi phạm cần chặn. Hai điểm lệch với nguyên tắc IV mà `/speckit-analyze` phát hiện (thiếu e2e 360×740; `npm run check` có thể đỏ ngẫu nhiên) đã được xử lý như ở hàng IV: thêm file e2e, và ghi ngoại lệ Q-1. Các ngoại lệ luật phụ thuộc (nguyên tắc III) và ngoại lệ Q-1 (nguyên tắc IV) nằm ở Complexity Tracking.

**Ràng buộc từ `CLAUDE.md` "Không được đụng"** (đã đối chiếu): dữ liệu bài học, thuật toán sinh câu hỏi / chấm điểm / SRS, cách lưu tiến độ, routes và query param, cấu hình build và deploy, phiên bản thư viện — đều không nằm trong danh sách dời.

## Project Structure

### Documentation (this feature)

```text
specs/001-repo-restructure/
├── spec.md
├── plan.md                    # file này
├── research.md                # quyết định và lý do (Phase 0)
├── data-model.md              # bảng ánh xạ cũ → mới (Phase 1)
├── quickstart.md              # cách kiểm chứng (Phase 1)
├── contracts/
│   └── layering-rules.md      # luật phụ thuộc §4.2 dưới dạng cấu hình ESLint (Phase 1)
├── checklists/requirements.md
├── tasks.md                   # do /speckit-tasks tạo
├── verify-baseline.mjs        # G0: chạy cổng kiểm FR-011 (công cụ tạm)
├── shoot.mjs                  # G0: ảnh chụp, smoke, progress (công cụ tạm)
└── evidence.md                # Phase 7: bằng chứng nghiệm thu SC-001…SC-009
```

### Source Code (repository root) — phần bị tác động

```text
docs/reference/
├── BACKLOG.md                       ← BACKLOG.md ở gốc
└── design/                          ← design/ ở gốc (SPEC.md, AUDIT.md, 11 ảnh)

src/
├── main.tsx                         # sửa 1 import (tokens.css, App)
├── app/
│   ├── App.tsx  App.test.tsx        ← src/App.tsx, src/App.test.tsx
│   ├── ComingSoon.tsx               ← components/ComingSoon.tsx
│   ├── nav-items.ts  README.md      # giữ
│   └── layouts/
│       ├── AppShell.tsx             ← app/Layout.tsx (đổi tên)
│       ├── TopBar.tsx  BottomNav.tsx
│       └── Container.tsx            ← components/ui/Container.tsx
├── ui/
│   ├── README.md                    ← components/README.md
│   ├── tokens.css                   ← src/index.css (nguyên nội dung)
│   ├── primitives/                  ← components/ui/* + ErrorState, LoadingState, NotFound, ThemeToggle
│   │   └── index.ts                 # bỏ Container và StationBadge khỏi danh sách export
│   ├── jp/                          ← Ruby(+test), SpeakButton(+test)
│   ├── quiz/                        ← TextChoiceCard, BlankChoiceCard
│   └── signature/
│       ├── StationBadge.tsx
│       ├── heatmap.ts  heatmap.test.ts   ← lib/heatmap*
│       └── mascot/                  ← components/mascot/* (3 file)
├── data/hooks/use-async-data.ts     ← lib/use-async-data.ts
├── lib/format.ts  format.test.ts    ← lib/format-duration*
└── features/
    ├── browse/KanjiPage.tsx         ← features/kanji/KanjiDetailPage.tsx
    ├── browse/SearchPage.tsx        ← features/search/SearchPage.tsx
    ├── browse/KanjiCard.tsx         ← components/KanjiCard.tsx
    └── settings/AboutPage.tsx       ← features/about/AboutPage.tsx

(Không còn: src/components/, design/, BACKLOG.md ở gốc, src/features/{kanji,search,about}/)
eslint.config.js                     # G7: thêm khối luật §4.2
.gitignore                           # G0: thêm .screens/
tests/e2e/repo-restructure.spec.ts   # G0: file mới, viewport 360×740, mở "/" và "/b/mnn1/5" (giữ lại)
```

Bảng đầy đủ từng file (43 hàng, kèm số file phải sửa import): `data-model.md`.

**Structure Decision**: web-application một dự án. Cây đích bám `docs/ARCHITECTURE.md` §8.1 và `docs/FRONTEND.md` §3; chỗ nào bảng audit mâu thuẫn với §4.2 thì §4.2 thắng (thứ tự ưu tiên: constitution → ARCHITECTURE → FRONTEND → plan → `docs/reference/*`).

## Nhóm commit và cổng kiểm tra

Mỗi nhóm = một commit (hoặc một vài commit nhỏ cùng chủ đề). **Tên commit theo constitution (Development Workflow mục 4):** `feat(001): …` cho commit có mã hoặc cấu hình (dời file, sửa import, công cụ, ESLint, file test), `docs: …` cho commit chỉ có tài liệu. Không dùng `refactor(…)` hay `chore(…)`.

**Cổng sau mỗi nhóm (G1–G7) và ở G8:** chạy đúng cổng kiểm **định nghĩa ở `spec.md` FR-011** (lệnh, cờ, kỳ vọng và quy tắc dừng đều nằm ở đó). Plan không nhắc lại số liệu để tránh lệch nhau. Công cụ: `specs/001-repo-restructure/verify-baseline.mjs` chạy bốn lệnh đó, in PASS/FAIL theo FR-011, và in thêm (không dùng làm điều kiện dừng) kết quả `npm test` chạy mặc định để theo dõi mức chập chờn.

| Nhóm | Mục đích | Nội dung | Ghi chú rủi ro |
|---|---|---|---|
| **G0** | Mốc và công cụ | Thêm `.screens/` vào `.gitignore`; thêm `verify-baseline.mjs` và `shoot.mjs` (chế độ ảnh chụp, `smoke`, `progress`); **thêm `tests/e2e/repo-restructure.spec.ts`** (360×740); **kiểm trình duyệt Playwright** (bước dưới); **đo mốc cả hai cách** (`npm test` mặc định và kèm cờ) rồi ghi cả hai vào spec; **chụp 36 ảnh "trước"** (6 trang × 3 cỡ × sáng/tối); chạy `smoke` và tạo dữ liệu `progress` ở bản "trước"; **chạy `npm run test:e2e` lấy mốc**; chưa dời file nào | Ảnh, smoke và progress phải lấy từ bản dựng trước khi dời; `progress` phải dùng cùng profile trình duyệt và cùng cổng cho "trước" và "sau" |
| **G1** | Tài liệu (P2, P3) | `git mv BACKLOG.md docs/reference/`; `git mv design docs/reference/design`; sửa link ở `README.md` (kế hoạch) và chú thích trong `manifest.yaml`, `id-aliases.yaml`, `continue-lesson.ts` (`BACKLOG.md`) | Không đụng logic. `design/` có tên file tiếng Việt và dấu `·`: dùng `git mv` cho cả thư mục |
| **G2** | Tiện ích | `lib/use-async-data.ts` → `data/hooks/` (**12 file** sửa import: 10 file không dời cộng `KanjiDetailPage` và `SearchPage`, còn ở chỗ cũ lúc G2); `lib/format-duration*` → `lib/format*` (1 file sửa import) | Thay đổi cơ học |
| **G3** | Khung ứng dụng | `App.tsx`, `App.test.tsx` → `app/`; `Layout` → `app/layouts/AppShell.tsx`; `TopBar`, `BottomNav`, `Container` → `app/layouts/`; `ComingSoon` → `app/`; `index.css` → `ui/tokens.css`; 3 trang: `kanji/KanjiDetailPage` → `browse/KanjiPage`, `search/SearchPage` → `browse/SearchPage`, `about/AboutPage` → `settings/AboutPage` | Đổi tên *file* và *tên export* cho `Layout → AppShell`, `KanjiDetailPage → KanjiPage`; `main.tsx` sửa import `tokens.css`. Barrel `components/ui/index.ts` bỏ export `Container`; `TopBar`, `AppShell`, `StyleguidePage` import `Container` trực tiếp |
| **G4** | `ui/primitives` + `ui/signature` | `components/ui/*` (trừ Container) → `ui/primitives/`, `StationBadge` → `ui/signature/`; `ErrorState`, `LoadingState`, `NotFound`, `ThemeToggle` → `ui/primitives/`; `lib/heatmap*` → `ui/signature/`; `components/mascot/*` → `ui/signature/mascot/` | Tệp barrel `index.ts` bỏ 2 export (Container, StationBadge) và các nơi dùng chúng đổi import trực tiếp |
| **G5** | `ui/jp`, `ui/quiz`, dọn | `Ruby`, `SpeakButton` (+test) → `ui/jp/`; `TextChoiceCard`, `BlankChoiceCard` → `ui/quiz/`; `KanjiCard` → `features/browse/`; `components/README.md` → `ui/README.md`; xóa thư mục `src/components/` rỗng | 7 file dùng `SpeakButton`, 9 file dùng `Ruby`: kiểm tra test `Ruby`, `SpeakButton` vẫn chạy |
| **G6** | Tài liệu theo cấu trúc mới | Cập nhật README thư mục con (`app`, `ui`, `data`, `lib`), `README.md` gốc (mục Cấu trúc), `docs/FRONTEND.md` §3 và §8 và `docs/ARCHITECTURE.md` (các dòng liệt kê bên dưới bảng này), đường dẫn `src/index.css` trong `docs/SPECKIT_ROADMAP.md` | Chỉ sửa chữ. **Không sửa** bản chụp lịch sử trong `docs/reference/`. Kết thúc G6 phải liệt kê từng dòng đã sửa (xem "Danh sách dòng G6") |
| **G7** | Luật phụ thuộc (P3) | Thêm khối `@typescript-eslint/no-restricted-imports` vào `eslint.config.js` theo `contracts/layering-rules.md`; ghi 3 mục nợ kỹ thuật | **Tách riêng, bỏ được**: không dời gì, chỉ thêm cấu hình |
| **G8** | Xác minh cuối | Chạy mọi mục "Kiểm chứng cuối" của `quickstart.md`: cổng FR-011, e2e, `smoke` sau (và `/styleguide` bằng `npm run dev`), `progress` sau (so số bản ghi từng bảng với "trước"), chụp 36 ảnh "sau" và so với "trước", **Mạnh xem ảnh trang chủ và `/b/mnn1/5` ở 360px sáng/tối**; xin Mạnh đồng ý rồi mới đẩy nhánh và tạo Pull Request; xóa file build cũ (cục bộ, đã gitignore); Mạnh trả lời 10 câu SC-009 | G8 xong mới được gọi là hoàn thành. Xóa `public/content-report.md` là bản sao cũ, đã kiểm nơi script ghi báo cáo (xem "Báo cáo nội dung ở G8") |

**Bước kiểm trình duyệt Playwright (đầu G0, trước khi lấy mốc e2e):** chạy `npx playwright install --dry-run chromium` hoặc `npx playwright test --list`; nếu báo thiếu trình duyệt thì chạy `npx playwright install chromium` rồi mới lấy mốc e2e. Máy hiện tại đã có `chromium-1248` và `chromium_headless_shell-1248` (đúng phiên bản Playwright 1.64.1 yêu cầu) nên bước cài thường được bỏ qua; ghi kết quả kiểm vào báo cáo G0.

**Báo cáo nội dung ở G8:** `scripts/content/pipeline.ts:378` ghi báo cáo bằng `writeReport(join(dirname(contentDir), 'content-report.md'), …)`; `contentDir` là `<gốc repo>/content` nên báo cáo nằm ở `<gốc repo>/content-report.md` (đã gitignore, đúng ngoại lệ ở `docs/ARCHITECTURE.md` §8.2). `build.ts` chỉ in dòng "xem content-report.md". Script **không** ghi vào `public/`, nên `public/content-report.md` (ngày 21/10) là bản sao cũ còn sót từ lần chạy trước, xóa an toàn ở G8. Không cần sửa script và **không có nợ nào** phải chuyển sang `data-and-logic-fixes`. Nếu lúc thực hiện G8 thấy `public/content-report.md` được sinh lại sau một lần `content:build`, dừng lại và báo Mạnh thay vì sửa script.

**Danh sách dòng G6 (đích sửa, theo hiện trạng 2026-11-07).** Khi xong, báo lại từng dòng đã sửa dưới dạng `file:dòng — trước → sau`.

| File | Dòng (hiện tại) | Nội dung cần đổi cho đúng vị trí mới |
|---|---|---|
| `docs/FRONTEND.md` §3 | 59 | "Hiện còn `src/components/` và `src/components/ui/`; sau khi chuyển, các thư mục đó không còn" → ghi đã chuyển ở `repo-restructure` |
| | 67 | `theme.ts` dưới `app/`: ghi `theme.ts` và `use-theme.ts` **tạm ở `lib/`**, vị trí cuối chốt ở `ui-kit-and-shell` |
| | 68 | `NotFound.tsx  ComingSoon.tsx` dưới `app/` → chỉ còn `ComingSoon.tsx`; `NotFound` chuyển sang `ui/primitives/` |
| | 70 | dòng `features/` liệt kê `browse/`: thêm `KanjiCard` nằm trong `browse/` |
| | 73–74 | danh sách `primitives/`: thêm `ErrorState`, `LoadingState`, `NotFound`, `ThemeToggle` |
| | 183, 223 | `src/index.css` → `src/ui/tokens.css` |
| `docs/FRONTEND.md` §8 | 298 | "Có = đã có trong `src/components/ui/` (sẽ chuyển vào `src/ui/`)" → đã ở `src/ui/` |
| | 303 | hàng `Chip, SegmentedControl, Switch, Card, EmptyState, Container`: `Container` đã ở `app/layouts/`; thêm `ErrorState`, `LoadingState`, `NotFound`, `ThemeToggle` (đã có, ở `primitives/`) |
| | 305 | hàng `jp`: `Ruby`, `SpeakButton` "Có (ở `components/`)" → ở `ui/jp/`; bỏ `KanjiCard` khỏi hàng này |
| | thêm | ghi `KanjiCard` ở `features/browse/` (vì chỉ vùng duyệt nội dung dùng; quy tắc "≥ 2 feature mới vào `ui/`") |
| | 310 | `mascot/*` "Có (ở `components/mascot/`)" → ở `ui/signature/mascot/` |
| `docs/ARCHITECTURE.md` | 432 | hàng `repo-restructure`: "dời `src/components/**` vào `src/ui/**` và `src/app/**`" → thêm `src/features/browse/` (KanjiCard) và ghi `lib/theme.ts`, `lib/use-theme.ts` chưa dời. Các dòng còn lại của file không nhắc `NotFound`, `ThemeToggle`, `KanjiCard`, `theme.ts` nên không đổi; kiểm lại bằng `grep` ở G6 |
| `docs/SPECKIT_ROADMAP.md` | các prompt nhắc `src/index.css` | → `src/ui/tokens.css` |
| `README.md`, `src/app/README.md`, `src/ui/README.md`, `src/data/README.md`, `src/lib/README.md` | — | mô tả theo cây mới; `src/lib/README.md` nói `theme.ts`, `use-theme.ts` còn ở đây |

Số dòng ở cột 2 theo bản hiện tại; sau khi sửa dòng trước có thể lệch vài dòng, nên tìm theo nội dung chứ không chỉ theo số.

**Thứ tự có chủ đích:** G3 (app) trước G4 (ui) vì `Container` rời `components/ui/` sang `app/layouts/` trước, nên barrel của `ui/primitives` ngay từ đầu không còn export `Container` (tránh `ui → app`). G6 (tài liệu) đứng sau mọi lần dời để sửa một lượt. G7 đứng sau cùng trong nhóm mã để chạy luật trên cây đã ổn định.

## Điểm lệch đã duyệt (so với bảng audit §2.2) — Mạnh duyệt 2026-11-07

Audit đặt từng file theo vai trò, nhưng không xét *ai dùng nó*. Khi đối chiếu với luật §4.2 (features không được import `app/`; `ui/` không được import `app/`, `domain/`), 4 mục sau phải đặt khác để khỏi tạo vi phạm mới:

| File | Bảng spec/audit | Plan | Lý do |
|---|---|---|---|
| `components/NotFound.tsx` | `src/app/` | `src/ui/primitives/NotFound.tsx` | 4 trang `features/browse` (Book, Lesson, Level) và `Kanji` dùng như một trạng thái "không tìm thấy"; `features → app` bị cấm |
| `components/ThemeToggle.tsx` | `src/app/` | `src/ui/primitives/ThemeToggle.tsx` | `features/settings/SettingsPage` dùng; cùng lý do |
| `lib/theme.ts`, `lib/use-theme.ts` | `src/app/theme.ts` | **chưa dời**, ở `src/lib/` | `ThemeToggle` ở `ui/` chỉ được import `lib/`. Chốt vị trí cuối thuộc `ui-kit-and-shell` |
| `components/KanjiCard.tsx` | `src/ui/jp/` | `src/features/browse/KanjiCard.tsx` | Chỉ 2 file `features/browse` dùng; `FRONTEND.md` §3 ("dùng ở ≥ 2 feature mới vào `ui/`"); import kiểu từ `domain/types` sẽ vi phạm `ui → domain`. Audit §2.2 ghi sẵn phương án này |

**Đã duyệt và đã áp dụng vào spec:** 3 hàng trong bảng FR-004 sửa khớp bốn điểm lệch trên. "Nhóm Dời" của feature được định nghĩa là đúng 43 hàng của `data-model.md`, trừ ba file chưa dời (`lib/tts.ts`, `lib/theme.ts`, `lib/use-theme.ts`); SC-004, User Story 2 và FR-014 dùng định nghĩa này.

**SC-005 (đã duyệt):** chỉ áp dụng cho tài liệu đang dùng. `docs/reference/design/AUDIT.md` và `docs/reference/audit-hien-trang.md` là bản chụp theo ngày, có link tương đối tới đường dẫn cũ, và spec yêu cầu nội dung không đổi khi dời. Plan kiểm link tại `README.md`, `CLAUDE.md`, README thư mục con, `docs/*.md` cấp trên cùng; **loại trừ** `docs/reference/**`.

## Complexity Tracking

Các ngoại lệ **đã có sẵn** trong mã, **không** sửa ở feature này (sửa cần đổi logic hoặc nằm ngoài phạm vi). TD-1, TD-2, E-1 là ngoại lệ luật phụ thuộc (nguyên tắc III), mỗi dòng là một khai báo có tên trong `eslint.config.js` (G7). Q-1 là ngoại lệ nguyên tắc IV.

| Mã | Vi phạm | File (số lượng) | Vì sao chưa sửa | Hướng sửa về sau |
|---|---|---|---|---|
| TD-1 | `domain/` import `react` (chỉ kiểu `ComponentType`) | `src/domain/quiz/registry.ts` (1 file) | Registry giữ thành phần React của từng dạng bài; đổi kiểu là đổi giao diện `QuestionType` mà 16 dạng bài dùng | `ui-kit-and-shell` / `practice-ui-migration`: tách kiểu thành phần ra khỏi `domain` |
| TD-2 | `features/weakness` import `features/practice` | `src/features/weakness/WeaknessPage.tsx`, `src/features/weakness/MistakesPage.tsx` (2 file) | Cả hai mở phiên luyện bằng `session-store`; đưa store xuống nơi dùng chung là đổi cấu trúc trạng thái | `practice-ui-migration`: chuyển `session-store` xuống chỗ dùng chung hoặc đưa hành động "bắt đầu phiên" ra |
| E-1 | `features/dev` import `app/` | `src/features/dev/StyleguidePage.tsx` (1 file) | Trang chỉ có khi phát triển, trình bày mọi thành phần, trong đó có `Container` ở `app/layouts/`; mục "Hỏi" chưa có quyết định | Xem lại khi quyết định số phận `StyleguidePage` |
| Q-1 | Nguyên tắc IV: `npm run check` PHẢI xanh trước mọi commit; CI chặn merge khi đỏ | `scripts/content/pipeline.test.ts` (1 test: `… sinh được file JSON khi write:true`) | Test quá hạn 5 giây khi chạy mặc định (cả bộ chạy song song); chạy riêng thì đạt. Sửa gốc (tăng `testTimeout`) là sửa test, nằm ngoài phạm vi feature này (FR-013). Cổng của feature chạy kèm `--testTimeout=30000` (cờ dòng lệnh) nên vẫn xanh; **CI trên Pull Request có thể đỏ ngẫu nhiên**, khi đó chạy lại | Spec `quality-gaps`: nâng `testTimeout` cho test này |

TD-1, TD-2, E-1 là **toàn bộ** vi phạm luật phụ thuộc mà mô phỏng trên mã hiện tại tìm thấy sau khi áp dụng bảng đích của plan (xem `research.md` mục R3): 4 import. Nếu giữ đúng bảng audit thì mô phỏng ra 10 import vi phạm: 4 ở trên cộng 6 do chọn nơi đặt.
