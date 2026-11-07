# Data Model: bảng ánh xạ vị trí

**Feature**: `001-repo-restructure`

Feature này không có dữ liệu người dùng. "Dữ liệu" ở đây là các thực thể đã nêu trong `spec.md` (Key Entities) và bảng ánh xạ cũ → mới dùng để thực hiện.

## Thực thể

| Thực thể | Trường | Quy tắc |
|---|---|---|
| **Vị trí đích** | `path`, `layer` (`app`, `ui`, `data`, `domain`, `features`, `lib`, `docs`) | Mỗi loại file có đúng một vị trí đích theo `docs/ARCHITECTURE.md` §8.1/§8.2 |
| **Dòng phân loại** | `from`, `action` (`Giữ`/`Dời`/`Xóa`/`Hỏi`), `to`, `reason` | Lấy từ `docs/reference/audit-hien-trang.md` §2; `Hỏi` giữ nguyên chỗ cũ (FR-014) |
| **Tham chiếu đường dẫn** | `file`, `specifier`, `resolvesTo` | Sau khi dời, `resolvesTo` phải tồn tại; kiểm bằng `tsc -b` (mã) và quét chữ (tài liệu) |
| **Luật phụ thuộc** | `fromLayer`, `mayImport[]`, `mustNotImport[]` | Bảng §4.2; cấu hình hóa ở `contracts/layering-rules.md` |
| **Nợ kỹ thuật / ngoại lệ** | `id`, `files[]`, `rule`, `reason`, `fixIn` | Ba mục TD-1, TD-2, E-1 ở `plan.md` |

## Bảng ánh xạ file (nhóm "Dời" của feature: 43 hàng)

**Đây là danh sách chuẩn của nhóm "Dời"** (`spec.md` FR-004): 43 hàng dưới đây — 41 file trong `src/`, cộng `BACKLOG.md` và thư mục `design/`. Ba file loại trừ, **không** nằm trong danh sách và vẫn ở `src/lib/` theo quyết định đã duyệt: `lib/tts.ts` (thuộc `ui-kit-and-shell`), `lib/theme.ts`, `lib/use-theme.ts` (vị trí cuối chốt ở `ui-kit-and-shell`). `quickstart.md` mục 2 và task T048 dùng đúng danh sách này.

Cột "Sửa import" là số file **khác** (không dời) phải sửa dòng `import` vì file này đổi chỗ. Nhóm = nhóm commit trong `plan.md`.

| # | Từ | Đến | Nhóm | Sửa import |
|---|---|---|---|---|
| 1 | `BACKLOG.md` | `docs/reference/BACKLOG.md` | G1 | 0 (1 chú thích trong `continue-lesson.ts`) |
| 2 | `design/` (SPEC.md, AUDIT.md, 11 ảnh) | `docs/reference/design/` | G1 | 0 |
| 3 | `src/lib/use-async-data.ts` | `src/data/hooks/use-async-data.ts` | G2 | 10 file không dời, cộng 2 trang còn ở chỗ cũ lúc G2 (`KanjiDetailPage`, `SearchPage`) = 12 |
| 4 | `src/lib/format-duration.ts` | `src/lib/format.ts` | G2 | 1 |
| 5 | `src/lib/format-duration.test.ts` | `src/lib/format.test.ts` | G2 | 0 |
| 6 | `src/App.tsx` | `src/app/App.tsx` | G3 | 1 (`main.tsx`) |
| 7 | `src/App.test.tsx` | `src/app/App.test.tsx` | G3 | 0 |
| 8 | `src/app/Layout.tsx` | `src/app/layouts/AppShell.tsx` | G3 | 0 (`App.tsx` đã tính ở #6) |
| 9 | `src/app/TopBar.tsx` | `src/app/layouts/TopBar.tsx` | G3 | 0 |
| 10 | `src/app/BottomNav.tsx` | `src/app/layouts/BottomNav.tsx` | G3 | 0 |
| 11 | `src/components/ui/Container.tsx` | `src/app/layouts/Container.tsx` | G3 | 0 (+ `StyleguidePage` đổi sang import trực tiếp) |
| 12 | `src/components/ComingSoon.tsx` | `src/app/ComingSoon.tsx` | G3 | 0 |
| 13 | `src/index.css` | `src/ui/tokens.css` | G3 | 1 (`main.tsx`) |
| 14 | `src/features/kanji/KanjiDetailPage.tsx` | `src/features/browse/KanjiPage.tsx` | G3 | 0 (+ đổi tên export) |
| 15 | `src/features/search/SearchPage.tsx` | `src/features/browse/SearchPage.tsx` | G3 | 0 |
| 16 | `src/features/about/AboutPage.tsx` | `src/features/settings/AboutPage.tsx` | G3 | 0 |
| 17 | `src/components/ui/Button.tsx` | `src/ui/primitives/Button.tsx` | G4 | 0 |
| 18 | `src/components/ui/button-styles.ts` | `src/ui/primitives/button-styles.ts` | G4 | 0 |
| 19 | `src/components/ui/Card.tsx` | `src/ui/primitives/Card.tsx` | G4 | 0 |
| 20 | `src/components/ui/Chip.tsx` | `src/ui/primitives/Chip.tsx` | G4 | 0 |
| 21 | `src/components/ui/EmptyState.tsx` | `src/ui/primitives/EmptyState.tsx` | G4 | 0 |
| 22 | `src/components/ui/LinkButton.tsx` | `src/ui/primitives/LinkButton.tsx` | G4 | 0 |
| 23 | `src/components/ui/SegmentedControl.tsx` | `src/ui/primitives/SegmentedControl.tsx` | G4 | 0 |
| 24 | `src/components/ui/Switch.tsx` | `src/ui/primitives/Switch.tsx` | G4 | 0 |
| 25 | `src/components/ui/index.ts` | `src/ui/primitives/index.ts` | G4 | 2 (`HomePage`, `StyleguidePage`) |
| 26 | `src/components/ui/StationBadge.tsx` | `src/ui/signature/StationBadge.tsx` | G4 | 0 (`StyleguidePage` đã tính ở #25) |
| 27 | `src/components/ErrorState.tsx` | `src/ui/primitives/ErrorState.tsx` | G4 | 8 |
| 28 | `src/components/LoadingState.tsx` | `src/ui/primitives/LoadingState.tsx` | G4 | 9 |
| 29 | `src/components/NotFound.tsx` | `src/ui/primitives/NotFound.tsx` | G4 | 3 (+ `App.tsx`, `KanjiPage.tsx` là file đã dời) |
| 30 | `src/components/ThemeToggle.tsx` | `src/ui/primitives/ThemeToggle.tsx` | G4 | 1 (`SettingsPage`; `TopBar` đã dời) |
| 31 | `src/lib/heatmap.ts` | `src/ui/signature/heatmap.ts` | G4 | 1 (`BookPage`) |
| 32 | `src/lib/heatmap.test.ts` | `src/ui/signature/heatmap.test.ts` | G4 | 0 |
| 33 | `src/components/mascot/ShibaMascot.tsx` | `src/ui/signature/mascot/ShibaMascot.tsx` | G4 | 2 (`HomePage`, `StyleguidePage`) |
| 34 | `src/components/mascot/TrainPlatformScene.tsx` | `src/ui/signature/mascot/TrainPlatformScene.tsx` | G4 | 1 (`HomePage`) |
| 35 | `src/components/mascot/JapanMotifBackground.tsx` | `src/ui/signature/mascot/JapanMotifBackground.tsx` | G4 | 0 |
| 36 | `src/components/Ruby.tsx` | `src/ui/jp/Ruby.tsx` | G5 | 6 |
| 37 | `src/components/Ruby.test.tsx` | `src/ui/jp/Ruby.test.tsx` | G5 | 0 |
| 38 | `src/components/SpeakButton.tsx` | `src/ui/jp/SpeakButton.tsx` | G5 | 4 |
| 39 | `src/components/SpeakButton.test.tsx` | `src/ui/jp/SpeakButton.test.tsx` | G5 | 0 |
| 40 | `src/components/TextChoiceCard.tsx` | `src/ui/quiz/TextChoiceCard.tsx` | G5 | 5 |
| 41 | `src/components/BlankChoiceCard.tsx` | `src/ui/quiz/BlankChoiceCard.tsx` | G5 | 3 |
| 42 | `src/components/KanjiCard.tsx` | `src/features/browse/KanjiCard.tsx` | G5 | 2 (cùng thư mục `browse/`) |
| 43 | `src/components/README.md` | `src/ui/README.md` | G5 | 0 (sửa nội dung ở G6) |

(Cách đếm: 41 hàng là file trong `src/` (#3–#43, kể cả `src/components/README.md`), cộng `BACKLOG.md` (#1) và thư mục `design/` (#2, gồm 13 file: 2 tài liệu + 11 ảnh).)

## File không dời nhưng phải sửa dòng import (26 file)

Nhóm theo nơi sửa. Mọi sửa đổi là thay đường dẫn trong dòng `import` (không đổi tên hàm, trừ `Layout → AppShell` và `KanjiDetailPage → KanjiPage` ở `App.tsx`).

| File | Import cần đổi |
|---|---|
| `src/main.tsx` | `./index.css` → `@/ui/tokens.css`; `./App.tsx` → `@/app/App` |
| `src/features/browse/BookPage.tsx` | `NotFound`, `ErrorState`, `LoadingState` → `@/ui/primitives/…`; `use-async-data` → `@/data/hooks/use-async-data`; `heatmap` → `@/ui/signature/heatmap` |
| `src/features/browse/GrammarTab.tsx` | `SpeakButton` → `@/ui/jp/SpeakButton` |
| `src/features/browse/KanjiRelatedTab.tsx` | `LoadingState`, `use-async-data`; `KanjiCard` → `./KanjiCard` |
| `src/features/browse/LessonPage.tsx` | `NotFound`, `ErrorState`, `LoadingState`, `use-async-data`; `KanjiCard` → `./KanjiCard` |
| `src/features/browse/LevelPage.tsx` | `NotFound`, `ErrorState`, `LoadingState`, `use-async-data` |
| `src/features/browse/LevelsPage.tsx` | `ErrorState`, `LoadingState`, `use-async-data` |
| `src/features/browse/VocabTab.tsx` | `Ruby`, `SpeakButton` |
| `src/features/dev/StyleguidePage.tsx` | `ShibaMascot`, barrel `ui` → `@/ui/primitives`, `Container` → `@/app/layouts/Container`, `StationBadge` → `@/ui/signature/StationBadge` |
| `src/features/home/HomePage.tsx` | `ShibaMascot`, `TrainPlatformScene`, `use-async-data`, barrel `ui` → `@/ui/primitives` |
| `src/features/practice/modes/conjugation-mcq/index.tsx` | `TextChoiceCard` |
| `src/features/practice/modes/fill-blank/FillBlankComponent.tsx` | `BlankChoiceCard` |
| `src/features/practice/modes/flashcard/FlashcardComponent.tsx` | `Ruby`, `SpeakButton` |
| `src/features/practice/modes/grammar-pattern/index.tsx` | `TextChoiceCard` |
| `src/features/practice/modes/kanji-hanviet/index.tsx` | `TextChoiceCard` |
| `src/features/practice/modes/kanji-in-vocab/KanjiInVocabComponent.tsx` | `BlankChoiceCard` |
| `src/features/practice/modes/kanji-reading/index.tsx` | `TextChoiceCard` |
| `src/features/practice/modes/mcq/McqComponent.tsx` | `Ruby`, `SpeakButton` |
| `src/features/practice/modes/particle/ParticleComponent.tsx` | `BlankChoiceCard` |
| `src/features/practice/modes/sentence-meaning/index.tsx` | `TextChoiceCard` |
| `src/features/practice/PracticeResultPage.tsx` | `Ruby`; `format-duration` → `@/lib/format` |
| `src/features/practice/PracticeRunPage.tsx` | `ErrorState`, `LoadingState`, `use-async-data` |
| `src/features/practice/PracticeSetupPage.tsx` | `ErrorState`, `LoadingState`, `use-async-data` |
| `src/features/settings/SettingsPage.tsx` | `ThemeToggle` → `@/ui/primitives/ThemeToggle` |
| `src/features/weakness/MistakesPage.tsx` | `ErrorState`, `LoadingState`, `Ruby`, `use-async-data` |
| `src/features/weakness/WeaknessPage.tsx` | `ErrorState`, `LoadingState`, `Ruby`, `use-async-data` |

Thêm 5 file dời nhưng có dòng import alias phải sửa: `src/app/App.tsx` (6 import, kể cả `AppShell`, `ComingSoon`, `NotFound`, 3 trang), `AppShell.tsx` (barrel → `Container`), `TopBar.tsx` (barrel → `Container`; `ThemeToggle`), `KanjiPage.tsx` (5 import), `SearchPage.tsx` (4 import).

## Tham chiếu chữ (không phải mã)

| File | Nội dung cần sửa | Nhóm |
|---|---|---|
| `README.md` | link kế hoạch `./docs/Ke_hoach_Website.md` → `./docs/reference/Ke_hoach_Website.md`; mục "Cấu trúc" | G1 (link), G6 (mục Cấu trúc) |
| `content/manifest.yaml` (dòng 24), `content/overrides/id-aliases.yaml` (dòng 2) | chú thích `docs/Ke_hoach_Website.md` → `docs/reference/…` | G1 |
| `src/features/home/continue-lesson.ts` (dòng 15) | chú thích `BACKLOG.md` → `docs/reference/BACKLOG.md` | G1 |
| `src/test/setup.ts` (dòng 3) | chú thích `src/lib/theme.ts` (không đổi vì chưa dời); dòng 18 `src/lib/tts.ts` (không đổi) | không cần |
| `src/app/README.md`, `src/ui/README.md` (mới), `src/data/README.md`, `src/lib/README.md` | mô tả vai trò thư mục theo cấu trúc mới | G6 |
| `docs/FRONTEND.md` | các câu "hiện còn `src/components/…`", "hiện nằm trong `src/index.css`", "Có = đã có trong `src/components/ui/`" | G6 |
| `docs/ARCHITECTURE.md` | không có câu nào mô tả hiện trạng cần đổi; kiểm lại ở G6 | G6 |
| `docs/SPECKIT_ROADMAP.md` | đường dẫn `src/index.css` trong prompt của feature kế tiếp → `src/ui/tokens.css` | G6 |

Bản chụp lịch sử trong `docs/reference/**` giữ nguyên nội dung (xem `research.md` R7).
