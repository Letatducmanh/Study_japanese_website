# Audit hiện trạng repo — 29/10/2026

> Chỉ đọc và ghi báo cáo này. Không file nào khác bị sửa, xóa hay di chuyển.
> Đối chiếu với: `.specify/memory/constitution.md` (v1.0.0), `docs/ARCHITECTURE.md` §4.2, §8, §9, `docs/FRONTEND.md`, `docs/SPECKIT_ROADMAP.md`, `docs/reference/Ke_hoach_Website.md` §10.
> Dùng làm đầu vào cho `/speckit-specify` của feature 001 (xem `docs/SPECKIT_ROADMAP.md` §2.3).

## 0. Tóm tắt (đọc phần này trước)

1. **Chức năng đã làm tới khoảng spec 010 (MVP).** Spec 002–010 đều chạy được, `content:validate`, `tsc`, `eslint` đều xanh. Spec 011–014 chưa có gì ngoài khung rỗng.
2. **Cấu trúc thư mục lệch §8.1 ở 3 chỗ chính:** chưa có `src/ui/` và `src/platform/`; mã giao diện dùng chung nằm ở `src/components/`; `design/` và `BACKLOG.md` nằm ở gốc repo mà §8.1 không có chỗ cho chúng.
3. **Giao diện hiện tại KHÔNG theo `docs/FRONTEND.md`.** Nó theo `design/SPEC.md` (vàng biển báo, ga mã `L01`, chú chó Shiba, font Zen Kaku Gothic New). FRONTEND.md quy định màu `ao`/`sora`, ga mã `M01`, font Zen Maru Gothic và không có linh vật. **Hai tài liệu mâu thuẫn nhau — cần Mạnh quyết** (mục 6). Mới trang chủ và khung ứng dụng dùng token mới; 32 file còn lại vẫn dùng `slate-*`/`primary-*` của Tailwind.
4. **Luật kiến trúc chưa được máy kiểm:** chưa có `no-restricted-imports` trong ESLint (§4.2), chưa có `src/ui/tokens.css`, chưa có `lazy()`, chưa có `docs/CONTENT_GUIDE.md` (constitution nguyên tắc I yêu cầu).
5. **Git sạch.** Không có file lạ chưa commit. File sinh tự động đang nằm trong `.gitignore` (mục 7).
6. **Điểm cần lưu ý nội dung:** số từ chính thực tế là **1.023**, tài liệu ghi **1.020**. Test không kiểm số này.

### Phạm vi và cách đo

- Đã đọc cấu trúc, `package.json`, cấu hình, mã nguồn, test, tài liệu; đã chạy `npm run content:validate`, `tsc -p tsconfig.app.json --noEmit`, `eslint .`, `vitest run`. Chưa chạy e2e Playwright và chưa mở trình duyệt, nên **phần giao diện chỉ được soát bằng đọc mã và quét chuỗi, chưa chụp ảnh**.
- Không chạy `content:build` (sẽ ghi vào `public/content`).
- Con số % ở mục 3 là **ước lượng** của tôi theo danh sách tiêu chí ghi dưới mỗi spec, làm tròn bội số của 5. Không phải kết quả nghiệm thu.
- Gốc repo Git là `Source code/Code/`. Thư mục cha `Source code/` chứa thêm `Docs/` và `Ảnh mobile/` **nằm ngoài Git** (mục 2.4).

---

## 1. Cây thư mục hiện tại

Chỉ liệt kê file do người/Spec Kit tạo. Bỏ `node_modules/`. `[gen]` = sinh tự động, đã gitignore.

```
Source code/                          ← thư mục cha, KHÔNG phải repo Git
├── Docs/                             ← 4 file .md nguồn gốc, ngoài Git
│   ├── Kanji_Master_N5.md  Ke_hoach_Website.md  MNN1_Ngu_Phap.md  MNN1_Tu_Vung.md
├── Ảnh mobile/                       ← 12 ảnh chụp màn hình 28/10, ngoài Git
└── Code/                             ← GỐC REPO GIT (nhánh main, 1f0b47e)
    ├── CLAUDE.md  README.md  BACKLOG.md
    ├── content-report.md             [gen] 102 KB, ghi đường dẫn tuyệt đối D:\...
    ├── .env.example  .gitignore  .prettierignore  .prettierrc.json
    ├── package.json  package-lock.json  index.html  vercel.json
    ├── vite.config.ts  tsconfig.json  tsconfig.app.json  tsconfig.node.json
    ├── eslint.config.js  playwright.config.ts
    ├── .github/workflows/ci.yml
    ├── .claude/skills/speckit-*/SKILL.md          (10 skill do Spec Kit cài)
    ├── .specify/{memory,templates,scripts,integrations,workflows}   (20 file)
    ├── docs/
    │   ├── ARCHITECTURE.md  FRONTEND.md  SPECKIT_ROADMAP.md
    │   └── reference/
    │       ├── Ke_hoach_Website.md  constitution-draft.md  audit-hien-trang.md (file này)
    ├── design/                       SPEC.md  AUDIT.md  + 11 ảnh .png (tên tiếng Việt, @1x/@2x)
    ├── content/
    │   ├── manifest.yaml
    │   ├── n5/mnn1/{vocab,grammar}.md   n5/kanji-master-n5/kanji.md
    │   └── overrides/{id-aliases,pos,verb-groups}.yaml
    ├── scripts/content/              20 file: parse-{vocab,grammar,kanji}, validate, validate-rules,
    │                                 enrich, ids, build, pipeline, overrides, errors, markdown-utils,
    │                                 raw-types, README + 6 file *.test.ts
    ├── src/                          182 file
    │   ├── main.tsx  App.tsx  App.test.tsx  index.css
    │   ├── app/          Layout, TopBar, BottomNav, nav-items, README
    │   ├── components/   Ruby, SpeakButton, KanjiCard, TextChoiceCard, BlankChoiceCard, ErrorState,
    │   │                 LoadingState, NotFound, ComingSoon, ThemeToggle
    │   │   ├── ui/       Button, LinkButton, Card, Chip, Container, EmptyState, SegmentedControl,
    │   │   │             StationBadge, Switch, button-styles, index
    │   │   └── mascot/   ShibaMascot, TrainPlatformScene, JapanMotifBackground
    │   ├── data/         content-loader, kanji-lookup, search-index, progress/{ProgressRepository,dexie-repo}, sync/(README)
    │   ├── domain/       types, schemas, conjugation/, mastery/, quiz/, srs/(README)
    │   ├── features/
    │   │   ├── about/ browse/ dev/ home/ kanji/ search/ settings/ weakness/   (có mã)
    │   │   ├── practice/   Setup/Run/Result + session-store + modes/ (16 dạng, 17 lần register)
    │   │   └── auth/ review/ stats/                                            (chỉ README)
    │   ├── i18n/vi.ts (333 dòng)
    │   ├── lib/          cn ✗ · kana, normalize, rng, format-duration, explanation-md, heatmap,
    │   │                 sfx, theme, use-theme, tts, use-async-data
    │   └── test/setup.ts
    ├── public/           favicon.svg, content/README.md (tracked)
    │                     content/**/*.json, manifest.json, id-aliases.json   [gen]
    │                     content-report.md                                   [gen, bản cũ 21/10]
    ├── tests/e2e/        5 file *.spec.ts + README
    ├── supabase/migrations/README.md
    ├── dist/  playwright-report/  test-results/                              [gen, cũ 21/10]
    └── (không có) specs/ · src/ui/ · src/platform/ · docs/CONTENT_GUIDE.md · tests/visual/ ·
                   capacitor.config.ts · .claude/settings.json
```

---

## 2. Bảng phân loại: file/thư mục → vị trí mới theo §8.1

Ký hiệu: **Giữ** = đã đúng chỗ · **Dời** = đổi chỗ (không viết lại logic) · **Xóa** = trùng/rác · **Hỏi** = cần Mạnh quyết.

### 2.1 Gốc repo và cấu hình

| Hiện tại | Hành động | Vị trí mới / lý do |
|---|---|---|
| `CLAUDE.md` | Giữ | Đã là bản mới, khớp §8.1. Còn một khối `MANUAL ADDITIONS` rỗng. |
| `README.md` | Giữ + sửa | Link `docs/Ke_hoach_Website.md` **đã hỏng** (file đã chuyển sang `docs/reference/`). Mục "Cấu trúc" cũng cần cập nhật sau 001. |
| `BACKLOG.md` | Dời | `docs/reference/BACKLOG.md`. Là file `.md` lẻ ở gốc, §8.2 cấm. Có 3 mục còn hiệu lực (xem 3.3, 3.5). |
| `content-report.md` (gốc) | Giữ, ghi ngoại lệ | Sinh tự động, đã gitignore, `ARCHITECTURE.md` §3 coi là đầu ra của pipeline. **Không** đưa vào `public/` vì chứa đường dẫn `D:\...` và sẽ bị deploy. Cần ghi ngoại lệ vào §8.2 hoặc đổi nơi ghi. |
| `public/content-report.md` | Xóa | Bản sao cũ (21/10), lệch với bản gốc (28/10). Đã gitignore. |
| `.env.example` | Giữ | Đúng §8.1. Chỉ có biến Supabase, không có khóa nhạy cảm. |
| `.gitignore`, `.prettier*`, `eslint.config.js`, `tsconfig*.json`, `vite.config.ts`, `playwright.config.ts`, `vercel.json` | Giữ | Đúng §8.1. Việc cần sửa nội dung nằm ở mục 3 (alias đã có; thiếu luật ESLint §4.2; Playwright chưa đặt viewport 360×740). |
| `package.json` | Giữ + sửa | `"name": "code"` nên đổi theo tên dự án; thiếu script `ui:shot` (FRONTEND §13.1). |
| `index.html` | Giữ + sửa (spec 003) | Đang nạp Google Fonts (FRONTEND §4: phải tự host), `theme-color #2563eb` (màu bị cấm), thiếu `viewport-fit=cover`. |
| `.github/workflows/ci.yml` | Giữ + sửa | Chạy `check` + `content:build` + `build`; **chưa chạy e2e** như §7. |
| `.specify/`, `.claude/skills/` | Giữ | Spec Kit cài, đã commit. Chưa có `.claude/settings.json` (§8.1 liệt kê, không bắt buộc). |
| `docs/ARCHITECTURE.md`, `FRONTEND.md`, `SPECKIT_ROADMAP.md` | Giữ | Đúng §8.1. |
| `docs/reference/Ke_hoach_Website.md`, `constitution-draft.md` | Giữ | Đúng §8.1. Draft constitution đã được chép sang `.specify/memory/`; giữ làm tham chiếu. |
| `docs/CONTENT_GUIDE.md` | **Thiếu** | Constitution nguyên tắc I bắt buộc cập nhật cùng parser; hiện chưa tồn tại. |
| `docs/reference/Bao_cao_kiem_tra_du_lieu_N5.md` | **Thiếu** | §8.1 liệt kê, chưa có trong repo. Chỉ ghi nhận, không tự tạo. |
| `design/SPEC.md`, `design/AUDIT.md`, 11 ảnh `.png` | Hỏi (đề xuất dời) | §8.1 không có `design/`. Đề xuất `docs/reference/design/`. Bản chất là tài liệu giao diện **cũ hơn** `FRONTEND.md` và mâu thuẫn với nó (mục 6). Tên ảnh không khớp tên SPEC.md §6 đã liệt kê (`web-home.png`…). |
| `dist/` | Xóa được | Build cũ 21/10, đã gitignore. Tạo lại bằng `npm run build`. |
| `playwright-report/`, `test-results/` | Xóa được | Kết quả test cũ 21/10, đã gitignore. |
| `public/content/**/*.json`, `manifest.json`, `id-aliases.json` | Giữ | Sinh tự động, đã gitignore, đúng §8.1. |
| `public/content/README.md` | Hỏi | Là file duy nhất trong `public/content/` được commit. §8.1 nói thư mục này "không commit". Đề xuất gộp 1 dòng vào `scripts/content/README.md` rồi bỏ. |
| `public/favicon.svg` | Giữ | |
| `public/icons/`, `manifest.webmanifest` | **Thiếu** | Thuộc spec 013. |
| `supabase/migrations/README.md` | Giữ | Rỗng, chờ spec 011. |
| `tests/e2e/*` | Giữ | Đúng §8.1. Thiếu `tests/visual/shoot.ts` (FRONTEND §13.1). |
| `content/**` | Giữ | Khớp §8.1 từng đường dẫn. |
| `scripts/content/*` | Giữ | Có thêm `pipeline`, `validate-rules`, `overrides`, `errors`, `markdown-utils`, `raw-types`, `README` ngoài danh sách §8.1. Hợp lý; nên bổ sung vào §8.1 thay vì dời. |

### 2.2 `src/`

| Hiện tại | Hành động | Vị trí mới (§8.1 + FRONTEND §3) / lý do |
|---|---|---|
| `src/main.tsx` | Giữ | Thêm import `ui/tokens.css`, `ui/fonts.ts` khi làm spec 003. |
| `src/App.tsx` (+`App.test.tsx`) | Dời | `src/app/App.tsx`; tách bảng route ra `src/app/router.tsx` và bọc `lazy()` (hiện import tất cả trang, không `lazy`). |
| `src/index.css` | Dời | `src/ui/tokens.css`. Đang trộn token mới + token cũ `primary-*`, `success`, `danger`, `warning` và `body{background:#fff / #0f172a}`. |
| `src/app/Layout.tsx`, `TopBar.tsx`, `BottomNav.tsx` | Dời | `src/app/layouts/AppShell.tsx`. Chưa có `FocusShell`: khi làm bài vẫn hiện thanh trên và thanh dưới. |
| `src/app/nav-items.ts`, `README.md` | Giữ | |
| `src/components/ui/Button, LinkButton, Chip, SegmentedControl, Switch, EmptyState, Card` | Dời | `src/ui/primitives/`. |
| `src/components/ui/StationBadge.tsx` | Dời | `src/ui/signature/`. |
| `src/components/ui/Container.tsx` | Dời | `src/app/layouts/` (là bố cục, không phải primitive). |
| `src/components/Ruby.tsx`, `SpeakButton.tsx`, `KanjiCard.tsx` | Dời | `src/ui/jp/` (KanjiCard → `KanjiGlyph` hoặc `features/browse/` nếu chỉ một nơi dùng). |
| `src/components/TextChoiceCard.tsx`, `BlankChoiceCard.tsx` | Dời | `src/ui/quiz/` (nhóm `ChoiceGrid`). |
| `src/components/ErrorState.tsx`, `LoadingState.tsx`, `NotFound.tsx`, `ComingSoon.tsx` | Dời | `src/ui/primitives/` (`EmptyState`, `Skeleton`); `NotFound`/`ComingSoon` là trang → `src/app/`. |
| `src/components/ThemeToggle.tsx`, `src/lib/theme.ts`, `src/lib/use-theme.ts` | Dời | `src/app/theme.ts` + nút trong header. |
| `src/components/mascot/*` (3 file) | **Hỏi** | §8.1 và FRONTEND không có linh vật. Giữ thì cần chỗ ở (`src/ui/signature/mascot/`) và cập nhật FRONTEND; bỏ thì xóa. Xem mục 6. |
| `src/data/content-loader, kanji-lookup, search-index, progress/*, sync/` | Giữ | Đã khớp §8.1. Chưa có `data/hooks/` và `supabase-client.ts` (thuộc 005/011). |
| `src/lib/use-async-data.ts` | Dời | `src/data/hooks/` (FRONTEND §3: hook React đặt ở `data/`). |
| `src/lib/tts.ts` | Dời | `src/platform/web/tts.ts` + `src/platform/types.ts`, `index.ts`. Hiện `SpeakButton` và `PracticeSetupPage` gọi thẳng `@/lib/tts`. |
| `src/lib/heatmap.ts` | Dời | `src/ui/signature/` (thang màu thành thạo) hoặc `src/domain/mastery/`. |
| `src/lib/sfx.ts` | **Hỏi** | Phát âm thanh đúng/sai. FRONTEND §7.5 và §12 mục 7 cấm "âm thanh hiệu ứng". Đang dùng ở 3 nơi (`PracticeRunPage`, `matching`, `speed-truefalse`). |
| `src/lib/format-duration.ts` | Dời | `src/lib/format.ts` (đổi tên theo §8.1). |
| `src/lib/kana.ts, normalize.ts, rng.ts, explanation-md.ts` | Giữ | |
| `src/lib/cn.ts` | **Thiếu** | Cần khi cài `clsx` + `tailwind-merge` (mục 4). |
| `src/domain/*` | Giữ | Đã khớp: `conjugation`, `mastery`, `quiz`, `types`, `schemas`, `srs` (README). |
| `src/i18n/vi.ts` | Giữ | |
| `src/features/browse/*` | Giữ | Đã có `Level(s)Page, BookPage, LessonPage, VocabTab, GrammarTab, KanjiRelatedTab`. |
| `src/features/kanji/KanjiDetailPage.tsx` | Dời | `src/features/browse/KanjiPage.tsx` (FRONTEND §3). |
| `src/features/search/SearchPage.tsx` | Dời | `src/features/browse/SearchPage.tsx`. |
| `src/features/weakness/{WeaknessPage,MistakesPage}.tsx` | Giữ | Có thể đổi tên `WeakPage` cho khớp §3. |
| `src/features/practice/*` | Giữ | Đúng điểm cắm §4.3 (mỗi dạng một thư mục + `register`). Tên `PracticeSetupPage` → `SetupPage` (tùy). |
| `src/features/home/*`, `settings/`, `auth/`, `review/`, `stats/` | Giữ | `auth`, `review`, `stats` chỉ có README. |
| `src/features/about/AboutPage.tsx` | Hỏi | §3 của FRONTEND không có vùng `about`. Đề xuất `src/features/settings/AboutPage.tsx`. |
| `src/features/dev/StyleguidePage.tsx` | Hỏi | Route chỉ có khi `DEV`. Đề xuất giữ làm trang soát token; hoặc dời vào `src/ui/` khi có `ui/`. Chứa 22 mã hex viết thẳng (chủ ý, để hiển thị). |
| `src/test/setup.ts` | Giữ | |

### 2.3 Trùng / rác tổng hợp

| Mục | Kết luận |
|---|---|
| `docs/Ke_hoach_Website.md` (bản "trùng" Mạnh nhắc) | **Không còn trong repo.** Commit `1f0b47e` đã **đổi tên** nó thành `docs/reference/Ke_hoach_Website.md` (git ghi `R`, 0 dòng thay đổi). Không có hai bản trong `Code/`. |
| `Source code/Docs/Ke_hoach_Website.md` (ngoài Git) | **Trùng nội dung** với `docs/reference/Ke_hoach_Website.md`: 0 dòng khác khi bỏ ký tự xuống dòng. Chỉ khác kiểu xuống dòng (bản ngoài LF 79.860 byte, bản trong repo CRLF 80.965 byte). Chưa xóa. |
| 3 file nội dung trong `Source code/Docs/` | **Trùng nội dung** với `content/n5/**` (0 dòng khác sau khi bỏ CR; cùng 261 / 2.234 / 1.678 dòng). Bản trong `content/` là bản làm việc. |
| `content-report.md` gốc vs `public/content-report.md` | Hai bản **khác nhau** (28/10 so với 21/10); bản trong `public/` là cũ. |
| `README.md` mỗi thư mục con (22 file) | Mỗi file 1–3 dòng mô tả vai trò, theo Phase 0. Giữ; cập nhật khi dời thư mục. |

### 2.4 Hai thư mục ngoài Git (cần cẩn thận khi xóa)

| Thư mục | Nội dung | Đề xuất |
|---|---|---|
| `Source code/Docs/` | 4 file `.md` bản gốc (xem 2.3). | Là bản nguồn duy nhất **không có lịch sử Git**. Nội dung đã nằm trong repo nên xóa là an toàn về dữ liệu, nhưng nên nén lưu một bản trước. Mạnh quyết. |
| `Source code/Ảnh mobile/` | 12 ảnh chụp màn hình 28/10 (`01-trang-chu-sang.png` … `12-trang-chu-1440-sang.png`). | Ảnh kiểm tra giao diện, không phải tài liệu. Nếu cần giữ, dời vào `.screens/` (gitignore, FRONTEND §13.1); nếu không thì xóa. Mạnh quyết. |

---

## 3. Tiến độ từng spec 002–014

**Cách ước lượng:** mỗi spec có danh sách tiêu chí lấy từ prompt `/speckit-specify` trong `docs/SPECKIT_ROADMAP.md` và cột "Dấu hiệu hoàn thành" của `ARCHITECTURE.md` §9. % = tiêu chí đã có mã chạy được (có test hoặc đã đọc mã) / tổng tiêu chí, **chưa tính việc dời thư mục**. Vị trí file nằm ở mục 2 và là phần việc của feature 001.

| Spec | % chức năng | Việc còn thiếu (tóm tắt) |
|---|---|---|
| 001 repo-restructure | 0% | Chưa bắt đầu. Đây là việc kế tiếp (mục 8). |
| 002 content-pipeline | **90%** | Số từ chính; `CONTENT_GUIDE.md`; test số lượng chưa đủ |
| 003 app-shell | **50%** | Token, `ui/`, `FocusShell`, `lazy()`, font tự host, CI e2e |
| 004 content-browsing | **85%** | `ui/jp`, `platform.tts`, chạy thử trên iOS/Android |
| 005 local-progress | **95%** | Chỉ còn kiểm tra thủ công |
| 006 quiz-engine-flashcard | **90%** | Test cho flashcard; ẩn thanh dưới khi làm bài |
| 007 mcq-and-results | **90%** | Test e2e đủ 6 hướng |
| 008 vocab-modes | **85%** | Test cho `dictation`, `speed-truefalse`; ghi `Attempt` trong component |
| 009 grammar-kanji-quiz | **75%** | Sắp xếp câu mới là chạm-để-xếp, chưa kéo thả |
| 010 weakness-mistakes | **80%** | Sổ lỗi sai chưa lọc theo dạng; chưa có `LessonLine` |
| 011 accounts-sync | **5%** | Toàn bộ Supabase |
| 012 srs-review | **10%** | Domain SRS, trang Ôn tập |
| 013 stats-pwa-release | **10%** | Thống kê, PWA, a11y, code-split, viết lại ví dụ |
| 014 native-app | **0%** | Toàn bộ Capacitor |

### 3.1 Chi tiết 002–005

**002 content-pipeline — 90%**
- Có: `scripts/content/` đủ parse/validate/enrich/ids/build; Zod schema ở `src/domain/schemas.ts`; engine chia động từ `src/domain/conjugation/` (có test); mỗi từ có `pos`, `verbGroup`, `answers`, `kanjiChars`; mỗi Kanji có `relatedVocabIds` (ch04 chữ đầu có 5 từ); lỗi báo kèm file và số dòng; `content:validate` thoát mã 1 khi có lỗi (nên build Vercel dừng, không đưa dữ liệu lỗi lên).
- Số liệu thật (đếm từ `public/content`, khớp `content:validate`): từ chính **1.023**, từ mở rộng **272**, mẫu ngữ pháp **132**, Kanji **119 + 15**.
- Thiếu / cần quyết:
  - **Từ chính là 1.023, không phải 1.020** như `ROADMAP` và `ARCHITECTURE` §9. Cần xác nhận 3 từ thừa là do chủ ý bổ sung nội dung hay lỗi; rồi sửa con số trong tài liệu hoặc nội dung.
  - `scripts/content/pipeline.test.ts` chỉ kiểm 272, 132, 134; **không kiểm 1.020/1.023 và 119/15 riêng**. Một lần chạy toàn bộ `vitest` bị quá hạn 5 giây ở chính file này; chạy riêng thì qua (4,2 giây). Nên nâng `testTimeout` của test này.
  - `validate` trả **568 cảnh báo** (VD: tiêu đề bài ở `grammar.md` khác `vocab.md`; Kanji trong từ vựng chưa có trong Kanji Master). Chưa có lỗi.
  - Thiếu `docs/CONTENT_GUIDE.md`.

**003 app-shell — 50%**
- Có: router theo manifest (`LevelsPage` đọc `loadManifest`); `/b/mnn1/5` mở thẳng (rewrite trong `vercel.json` + e2e); sáng/tối; trang 404; `/about` có ghi nguồn giáo trình; CI chạy `check` + `build`; thanh dưới + thanh trên; token mới trong `index.css`.
- Thiếu: `src/ui/tokens.css`; `src/ui/primitives|jp|quiz|signature` (mới có `components/ui/` với 10 file); `LessonLine`, `StationStamp`; trường `line: { code, color }` trong manifest (FRONTEND §5.1; `StationBadge` đã có nhưng chỉ được dùng trong `StyleguidePage` với `code="L01"`, chưa có trang nào hiển thị mã ga); `FocusShell`; `lazy()` theo trang; font tự host (`@fontsource`); `viewport-fit=cover`, safe-area, `min-h-dvh` (không có `safe-area`/`dvh` trong `src/`); script `ui:shot`; e2e viewport 360×740 (Playwright đang dùng Desktop Chrome); bước e2e trong CI.

**004 content-browsing — 85%**
- Có: bài học 3 tab Từ vựng / Ngữ pháp / Kanji; lọc từ chính–mở rộng và phiên bản; nút Hiện/Ẩn nghĩa; ngữ pháp mở từng mẫu, ẩn/hiện romaji và dịch; `/kanji/:char`; tìm kiếm MiniSearch có bỏ dấu (e2e "nuoc ngoai" → 外国); `SpeakButton` tự ẩn khi không có giọng Nhật.
- Thiếu: `JpText`; `lang="ja"` mới có ở 2 chỗ trong `.tsx` (FRONTEND §5.3 yêu cầu mọi chữ Nhật); TTS chưa qua `platform`; chưa xác nhận phát âm trên iOS/Android.

**005 local-progress — 95%**
- Có: interface `ProgressRepository` (16 phương thức); Dexie chỉ nằm trong `dexie-repo.ts` (đã kiểm: không file nào khác `import 'dexie'`); mọi ghi đều thêm `outbox`; `Attempt.id` là uuid sinh ở máy khách; mastery thuần ở `src/domain/mastery/` có test; xuất / nhập / xóa có xác nhận (e2e `settings.spec.ts`); test bằng `fake-indexeddb`.
- Thiếu: chỉ còn kiểm tra thủ công "xuất → xóa → nhập lại".

### 3.2 Chi tiết 006–010

**006 quiz-engine-flashcard — 90%**
- Có: `registry`, `session` (RNG có seed), `distractors`, `grading` trong `src/domain/quiz/` (đều có test); store Zustand; màn thiết lập tự sinh danh sách dạng bài từ registry; Flashcard chọn mặt trước, Quên/Khó/Tốt/Dễ, phím Space và 1–4; e2e "học hết Bài 1 → mastery > 0".
- Thiếu: `flashcard/` không có unit test; hỏi lại nội dung "Khó/Tốt" so với "Khó/Nhớ" của spec; chưa ẩn thanh điều hướng khi làm bài.

**007 mcq-and-results — 90%**
- Có: 6 hướng đã đăng ký (`mcq-jp-vi`, `mcq-vi-jp`, `mcq-kanji-reading`, `mcq-kana-kanji`, `mcq-listen-vi`, `mcq-vi-kanji`); màn kết quả; "Làm lại câu sai" (e2e: Bài 5, 10 câu, sai 2); câu sai vào sổ.
- Thiếu: chỉ e2e hướng Nhật→Nghĩa; chưa có e2e cho 5 hướng còn lại.

**008 vocab-modes — 85%**
- Có: `typing` (romaji→kana qua WanaKana ở `lib/kana.ts`), `dictation`, `matching` (tính giờ), `speed-truefalse`, `fill-blank`, nghe-chọn (`mcq-listen-vi`); dạng nghe tự ẩn khi thiếu giọng (`PracticeSetupPage.tsx:117`).
- Thiếu: `dictation/` và `speed-truefalse/` không có test; `matching` và `speed-truefalse` tự ghi `Attempt` trong component (xem `BACKLOG.md` mục 1); `KanaInput` chưa là component trong `ui/jp`.

**009 grammar-kanji-quiz — 75%**
- Có: `particle`, `sentence-order`, `sentence-meaning`, `grammar-pattern`, `conjugation-mcq`, `conjugation-typing`, `kanji-reading` (On/Kun), `kanji-hanviet`, `kanji-in-vocab` — đủ 9 dạng và đều có unit test.
- Thiếu: sắp xếp câu hiện là **chạm để đặt** (`onClick={() => place(id)}`), spec yêu cầu **kéo thả dùng được trên cảm ứng** và FRONTEND §4 chỉ định `@dnd-kit` (chưa cài, chưa ghi lý do trong `research.md`); "mỗi bài ngữ pháp sinh ≥ 5 câu trợ từ" chưa có test xác nhận; danh sách trợ từ viết cứng trong `modes/particle/index.ts` (11 trợ từ) — đáng xem lại với nguyên tắc I.

**010 weakness-mistakes — 80%**
- Có: trang Điểm yếu (từ yếu nhất, bài yếu nhất, kỹ năng yếu nhất, nút luyện ngay); sổ lỗi sai lọc theo bài; tự rời sổ sau 3 lần đúng liên tiếp (`dexie-repo.ts:94`); bài kiểm tra tổng hợp có xếp loại A/B/C (`isComprehensive`, `comprehensive.grade*`); `BookPage` tô màu mỗi bài theo mastery (`heatmapClass`).
- Thiếu: sổ lỗi sai chưa lọc **theo dạng** (chỉ theo bài); chưa có `LessonLine` / bản đồ tuyến (FRONTEND §7.2) — `BookPage` đang là lưới ô vuông; nút "Tiếp tục Bài N" chưa đọc tiến độ ngữ pháp / Kanji (`BACKLOG.md` mục 2); không có e2e cho trang Điểm yếu; thang màu và tên token thành thạo khác §5.2.

### 3.3 Chi tiết 011–014 và việc tồn đọng từ `BACKLOG.md`

| Spec | Hiện có | Chưa có |
|---|---|---|
| 011 accounts-sync (5%) | Bảng `outbox` trong Dexie, được ghi nhưng **không có nơi đọc**; `.env.example`; 4 route `/login`, `/register`, `/forgot-password`, `/account` trỏ `ComingSoon` | `@supabase/supabase-js`, `data/supabase-client.ts`, `data/sync/` (README), `supabase/migrations/*.sql`, RLS + test RLS, `features/auth` (README) |
| 012 srs-review (10%) | Bảng `srsCards` + 3 phương thức repo (`getSrsCard`, `saveSrsCard`, `listDueSrsCards`); thư viện `ts-fsrs` đã cài | `src/domain/srs/` (README), trang `/review` (đang `ComingSoon`), chuỗi ngày học; `ts-fsrs` không được import ở đâu trong `src/` ngoài `types.ts` |
| 013 stats-pwa-release (10%) | Trang `/about`; thư viện heatmap | Trang thống kê (`/stats` là `ComingSoon`), trang chủ đầy đủ (`BACKLOG.md` mục 3), `vite-plugin-pwa`, `manifest.webmanifest`, `public/icons`, code-split, Lighthouse, viết lại ví dụ chép nguyên văn |
| 014 native-app (0%) | — | `@capacitor/*`, `capacitor.config.ts`, `android/`, `ios/`, `src/platform/` |

**Việc tồn đọng đã ghi ở `BACKLOG.md`** (giữ lại khi dời file): (1) `MatchingComponent` và `SpeedTrueFalseComponent` tự gọi `recordAttempt`; (2) nút "Tiếp tục" không đọc tiến độ ngữ pháp / Kanji; (3) trang chủ còn thiếu thanh số liệu, lưới "Chọn cách luyện", dải 25 ga.

### 3.4 Chất lượng kiểm thử hiện có

| Kiểm tra | Kết quả (29/10) |
|---|---|
| `npm run content:validate` | Xanh, 0 lỗi, 568 cảnh báo |
| `tsc -p tsconfig.app.json --noEmit` | Xanh (mã thoát 0) |
| `eslint .` | Xanh (mã thoát 0) |
| `vitest run` | 219 / 220 đạt. 1 test quá hạn 5 giây khi chạy song song; chạy riêng đạt (2/2) |
| Số file test | 44 file `*.test.ts(x)`, 5 file e2e |
| Dạng bài chưa có unit test | `flashcard`, `dictation`, `speed-truefalse` |
| E2E | Chưa chạy trong audit. Có 5 spec: duyệt, nội dung, flashcard, trắc nghiệm, cài đặt |

---

## 4. Thư viện đang cài so với stack trong constitution

Nguồn: `Additional Constraints → Stack cố định` của constitution, bổ sung bởi `docs/FRONTEND.md` §4. Phiên bản lấy từ `node_modules`.

### 4.1 Stack constitution

| Thành phần | Trạng thái | Phiên bản | Ghi chú |
|---|---|---|---|
| Vite | Có | 8.3.4 | |
| React | Có | 19.3.1 | |
| TypeScript strict | Có | ~6.0.3 | `"strict": true`; ESLint cấm `no-explicit-any` |
| Tailwind CSS v4 | Có | 4.3.3 | Qua `@tailwindcss/vite` |
| React Router | Có | 7.18.4 | Chưa dùng data router (`BrowserRouter` + `<Routes>`); FRONTEND §4 muốn data router + `lazy()` |
| Zustand | Có | 5.0.15 | Chỉ dùng ở `session-store.ts` (đúng quy định) |
| Dexie | Có | 4.4.6 | Chỉ ở `dexie-repo.ts` |
| ts-fsrs | Có, **chưa dùng** | 5.4.2 | Chờ spec 012 |
| WanaKana | Có | 5.3.1 | Dùng ở `lib/kana.ts` |
| Zod | Có | 4.6.7 | |
| MiniSearch | Có | 7.2.0 | `data/search-index.ts` |
| Vitest | Có | 5.0.5 | |
| Testing Library | Có | react 16.3.3, jest-dom 7.0.1, user-event 14.6.8 | |
| Playwright | Có | 1.64.1 | Chưa đặt viewport 360×740 |
| **Supabase** | **Không** | — | `@supabase/supabase-js` chưa cài (spec 011) |
| Vercel | Có | cấu hình | `vercel.json` đúng |
| **Capacitor** | **Không** | — | Spec 014 |

### 4.2 Thư viện FRONTEND.md yêu cầu nhưng chưa cài

| Thư viện | Dùng cho | Spec |
|---|---|---|
| `clsx`, `tailwind-merge` | hàm `cn()` (`lib/cn.ts`) | 003 |
| `class-variance-authority` | biến thể `Button` | 003 |
| `@fontsource/be-vietnam-pro`, `@fontsource/zen-maru-gothic` | font tự host (hiện nạp từ Google Fonts) | 003 |
| `@dnd-kit/*` | kéo thả sắp xếp câu | 009 |
| `vite-plugin-pwa` | PWA offline | 013 |
| `@capacitor/*`, `@capacitor-community/text-to-speech` | app native | 014 |
| Radix UI Primitives (tùy chọn) | Dialog, Sheet, Tabs | 003 |

`lucide-react` (1.62.0) **đã cài** và đang dùng cho icon.

### 4.3 Có cài nhưng không nằm trong danh sách stack

Toàn bộ là công cụ phát triển, đều có lý do trong kế hoạch:

| Thư viện | Lý do |
|---|---|
| `js-yaml`, `@types/js-yaml` | Đọc `manifest.yaml` và `overrides/*.yaml` |
| `unified`, `remark-parse`, `remark-gfm`, `mdast-util-to-string` | Đọc bảng markdown (spec 002) |
| `tsx` | Chạy script TypeScript |
| `jsdom`, `fake-indexeddb` | Môi trường test |
| `@vitest/ui` | Giao diện xem test; **không dùng trong script nào** — có thể bỏ |
| `eslint`, `typescript-eslint`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`, `eslint-config-prettier`, `globals`, `@eslint/js`, `prettier` | Lint / định dạng |

Theo constitution: "Thêm thư viện mới phải ghi lý do trong `research.md` của feature". Hiện chưa có `specs/` nên chưa có chỗ ghi; nên bổ sung lý do cho nhóm 4.3 vào `research.md` của feature 001 hoặc 002.

---

## 5. Kiểm tra luật kiến trúc (§4.2) và constitution

| Luật | Kết quả |
|---|---|
| Chỉ `dexie-repo.ts` import `dexie` | **Đạt** (grep 0 vi phạm) |
| Chỉ `platform/native/` import `@capacitor/*` | Chưa áp dụng (chưa có Capacitor) |
| Chỉ `data/supabase-client.ts` import `@supabase/supabase-js` | Chưa áp dụng |
| ESLint `no-restricted-imports` theo §4.2 | **Chưa có** trong `eslint.config.js` |
| `domain/` không import React | Chưa có luật máy kiểm; cần soát khi thêm luật |
| Không `any` | Đạt (`no-explicit-any: error`, eslint xanh) |
| Alias `@/` → `src/` | Có (`vite.config.ts`, `tsconfig.app.json`) |
| `public/content` không commit | **Đạt** (chỉ `README.md` được commit — xem mục 2.1) |
| Chuỗi tiếng Việt chỉ ở `vi.ts` | **Gần đạt:** quét còn 7 file có chữ có dấu ngoài `vi.ts`, hầu hết là chú thích hoặc thông báo lỗi nội bộ (`content-loader.ts:37`, `VocabTab.tsx:126` so sánh với nhãn `'Bản cũ'`) |
| Không từ tiếng Nhật giáo trình trong code | Có ngoại lệ hợp lý: bảng chia động từ (`conjugate.ts`), giọng đọc (`tts.ts`), `grading.ts`; riêng danh sách trợ từ ở `modes/particle/index.ts` nên xem lại |
| Chữ Nhật có `lang="ja"` | **Chưa đạt:** chỉ 2 chỗ trong `.tsx` |
| Màu / bóng / font chỉ qua token | **Chưa đạt:** xem mục 6 |
| `CONTENT_GUIDE.md` đi kèm parser | **Thiếu file** |
| E2E 360×740 cho mỗi feature | **Chưa đạt:** Playwright dùng Desktop Chrome |
| Mỗi plan có Constitution Check | Chưa có plan nào |

---

## 6. Giao diện hiện tại so với `docs/FRONTEND.md`

### 6.1 Hai tài liệu thiết kế đang mâu thuẫn

`design/SPEC.md` (cũ, 27/10, đang được code theo) và `docs/FRONTEND.md` (mới, 29/10, nằm trên SPEC.md trong thứ tự ưu tiên):

| Mục | `design/SPEC.md` — **code đang theo** | `docs/FRONTEND.md` |
|---|---|---|
| Màu chính | `line #1565E8`, nhấn vàng `#FFD21F` | `ao #1B5CFF`, phụ `sora #3EC5F2`, không có vàng |
| Nền | `bg #F2F6FC` / tối `#08142B` | `paper #F6F8FD` / tối `#0A1433` |
| Đúng / sai | Đúng = xanh `line`, **sai = cam** `#C2410C`, "không dùng đỏ/xanh lá" | Đúng = `go` xanh lá + ✓, **sai = `stop` đỏ** + ✗ |
| Mã ga | `L01`–`L25` (vòng tròn 44px) | `M01`–`M25` / `K01`–`K15`, ô vuông bo 6px, lấy từ `manifest.yaml` |
| Font tiếng Nhật | Zen Kaku Gothic New | Zen Maru Gothic |
| Linh vật | Chú chó Shiba, sân ga, đoàn tàu | Không có; nhắc "chỉ một chỗ được phô diễn" là `LessonLine` + `StationStamp` |
| Trang chủ | Hero + sân ga + 3 thẻ "Hôm nay của bạn" | Số lớn "N thẻ cần ôn", nút chính, tuyến thu gọn; FRONTEND §12 mục 6 cấm "hero lớn kiểu landing" |
| Bo góc | 12 / 14 / 20 / pill | 6 / 12 / 24 / full |
| Phím tắt Enter | Có | Có |
| Cỡ mobile thiết kế | 390px | 360px |

**Hệ quả:** nếu làm theo FRONTEND.md thì phần giao diện đã làm ở "Prompt 1 – giai đoạn 1–2" (`HomePage`, `TopBar`, `BottomNav`, `components/ui/*`, `components/mascot/*`) phải làm lại. Chưa nên bắt tay vào spec 003 khi chưa chọn.

### 6.2 Vi phạm từng điều trong FRONTEND.md §12 và §13.2

Dựa trên đọc mã và quét chuỗi; **chưa chụp ảnh**.

| Điều khoản | Hiện trạng |
|---|---|
| §4 / §13.2 — chỉ dùng token, không hex, không màu mặc định Tailwind | **Vi phạm.** 32 file `.tsx` dùng lớp `slate-*`/`red-*`/`amber-*` (nhiều nhất: `text-slate-400` ×56, `text-slate-100` ×43, `border-slate-700` ×34); 31 file dùng `primary-NNN` (#3b82f6, #2563eb — đúng màu bị cấm); `index.css` còn `body{background:#fff}` và `.dark body{background:#0f172a}` (nền bị cấm trong `design/SPEC.md` và CLAUDE.md cũ). Hex viết thẳng trong code: 22 chỗ, thuộc `ShibaMascot.tsx` và `StyleguidePage.tsx`. |
| §4 — Font tự host, không Google Fonts | **Vi phạm.** `index.html` nạp Google Fonts (Be Vietnam Pro, Zen Kaku Gothic New, Noto Sans JP). |
| §5.3 — Font tiếng Nhật Zen Maru Gothic | **Lệch.** Đang Zen Kaku Gothic New. |
| §5.2 — màu đúng/sai | **Lệch.** Dùng cam `wrong` thay vì đỏ `stop`; `success`/`danger` cũ vẫn còn trong `@theme`. |
| §5.4 — bóng, gradient | Còn 4 chỗ `shadow-*`/`gradient`/`backdrop-blur`. |
| §5.5 / §12.7 — không âm thanh hiệu ứng | **Vi phạm.** `lib/sfx.ts` phát tiếng đúng/sai ở 3 nơi. |
| §10 — không emoji | **Vi phạm nhẹ.** 🔊 ở `DictationComponent` và `McqComponent`; ✓/✗ ở `SpeedTrueFalseComponent`. FRONTEND cho phép 🔊 khi chưa có icon; icon Lucide đã cài nên có thể thay. |
| §6.3 — `FocusShell`, ẩn TabBar khi làm bài | **Chưa có.** `Layout.tsx` luôn hiện `TopBar` + `BottomNav`. |
| §6.4 — `viewport-fit=cover`, safe-area, `min-h-dvh` | **Chưa có.** `Layout` dùng `min-h-screen`. |
| §6.1 — `SideRail` ≥ 1024px | **Chưa có.** Desktop dùng thanh trên. |
| §3 — `lazy()` theo trang | **Chưa có.** `App.tsx` import tĩnh 15 trang. |
| §8.4 — `LessonLine`, `StationStamp`, `MasteryLegend` | **Chưa có.** `BookPage` là lưới ô; kết quả không có dấu ga. |
| §8.1 — `Sheet`, `Dialog`, `Toast`, `Badge`, `ListRow`, `Skeleton`, `ProgressBar`, `IconButton` | **Chưa có** (mới có Button, Chip, Card, Switch, SegmentedControl, EmptyState, StationBadge, Container). |
| §8.3 — `QuestionShell`, `ChoiceGrid`, `FeedbackBar`, `FlipCard`, `MatchBoard` | **Chưa có.** 16 dạng bài tự vẽ khung; `design/AUDIT.md` ghi nút chính bị copy-paste ở ≥ 10 nơi. |
| §5.3 / §13.2 — `lang="ja"` | **Chưa đạt.** 2 chỗ trong `.tsx`; chưa có `JpText`. |
| §10 — chuỗi trong `vi.ts` | Đạt về cơ bản (mục 5). |
| §11 — tương phản, focus 3px, `aria-live`, `prefers-reduced-motion` | Chưa kiểm bằng công cụ. Có `prefers-reduced-motion` cho hoạt ảnh vẫy tay; focus-visible chưa xác nhận. |

### 6.3 Phần đã tiệm cận FRONTEND.md

- Có dùng Lucide, ba trạng thái loading / rỗng / lỗi (`LoadingState`, `EmptyState`, `ErrorState`), vùng bấm `min-h-11` (44px). Nhãn nút trang chủ dùng "Tiếp tục …" (`vi.home.continueCtaPrefix`), FRONTEND §10 muốn "Học tiếp Bài 4" — lệch nhẹ.
- Chuyển sáng / tối bằng class `.dark` đúng với `@custom-variant` của FRONTEND §5.6.
- Cấu trúc `features/practice/modes/<id>/` đúng điểm cắm §4.3.

---

## 7. Trạng thái Git và Spec Kit

**Git**
- Nhánh `main`, commit mới nhất `1f0b47e chore: them Spec Kit, constitution va tai lieu thiet ke`. `git status` rỗng: **không có file lạ chưa commit**.
- File bị bỏ qua (đúng ý): `content-report.md`, `public/content-report.md`, `public/content/**/*.json`, `dist/`, `playwright-report/`, `test-results/`, `node_modules/`.
- Còn nhánh `origin/main`; không có nhánh `NNN-ten-feature` nào.

**Spec Kit**
- Đã cài và commit: `.specify/` (20 file: templates, script PowerShell, workflow) và 10 skill `.claude/skills/speckit-*`.
- Constitution **v1.0.0** đã điền (`.specify/memory/constitution.md`, ratified 2026-10-29), 7 nguyên tắc I–VII, không còn placeholder.
- **Chưa chạy lần nào:** không có thư mục `specs/`, không có `spec.md`/`plan.md`/`tasks.md`. `SPECKIT_ROADMAP.md` đánh dấu mọi feature 002–014 là ⬜ "chưa làm" dù phần lớn code đã có. Cần cập nhật trạng thái theo mục 3 (nên dùng lời nhắc "Phần đã có: … (theo audit)" của roadmap).
- Lệnh `/speckit-constitution` gõ trong phiên này không chạy (không có lệnh với tên đó trong danh sách lệnh), nên constitution được chép tay từ draft.
- `.specify/scripts/powershell/create-new-feature.ps1` sẽ tạo nhánh `NNN-ten-feature`; số thứ tự sẽ bắt đầu từ 001 nếu `specs/` trống — khớp ý đồ `ARCHITECTURE.md` §9.

---

## 8. Việc cần Mạnh quyết trước khi chạy feature 001

1. **Giao diện theo tài liệu nào?** `design/SPEC.md` (vàng + `L01` + Shiba, đang chạy) hay `docs/FRONTEND.md` (`ao`/`sora` + `M01`, không linh vật)? Quyết định này quyết định có làm lại trang chủ và `components/ui/*` hay không. Nếu giữ SPEC.md thì cần sửa FRONTEND.md cho khớp.
2. **Linh vật Shiba** (3 file `components/mascot/`): giữ (cần chỗ trong §8.1) hay bỏ?
3. **Âm thanh đúng / sai** (`lib/sfx.ts`): FRONTEND cấm. Bỏ hay xin ngoại lệ?
4. **Số từ chính 1.023 hay 1.020?** Sửa tài liệu hay sửa nội dung.
5. **`design/` và `BACKLOG.md`**: đồng ý dời vào `docs/reference/` không?
6. **Hai thư mục ngoài Git** (`Source code/Docs/`, `Source code/Ảnh mobile/`): xóa, nén lưu, hay giữ?
7. **Mâu thuẫn nhỏ trong tài liệu:** `ARCHITECTURE.md` §4.2 cấm `ui/` import `platform/`, nhưng `FRONTEND.md` §8.2 nói `SpeakButton` "gọi `platform.tts.speak`". Cần chọn: truyền hành vi nói qua props, hay cho phép `ui/jp` import `platform/`.
8. **Cập nhật `SPECKIT_ROADMAP.md`:** đánh 🟨/✅ cho 002–010 theo mục 3 hay giữ ⬜ và ghi "Phần đã có" trong từng prompt?

### Gợi ý nội dung `/speckit-specify` cho 001 (nếu Mạnh đồng ý các mục trên)

Phạm vi chỉ gồm: dời file theo mục 2 (nhóm **Dời** và **Xóa**), đổi import, thêm luật ESLint §4.2, sửa link README, cập nhật `.gitignore` nếu cần. **Không** gồm: đổi token màu, đổi font, dựng `FocusShell`, `lazy()` (để cho spec 003). Kiểm chứng: `npm run build` thành công, `npm run check` xanh, e2e mở trang chủ và `/b/mnn1/5`.
