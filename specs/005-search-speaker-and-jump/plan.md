# Implementation Plan: search-speaker-and-jump — loa chỉ phát âm, bấm từ nhảy tới đúng hàng

**Branch**: `005-search-speaker-and-jump` (**chưa tạo**; hiện đang ở `staging`, xem "Điều kiện trước khi làm") | **Date**: 2026-11-20 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/005-search-speaker-and-jump/spec.md`

## Summary

Hai câu chuyện, hai commit, không thêm thư viện, không đổi route.

1. **Loa (US1, commit `fix(search)`)**: ở `SearchPage`, đưa `SpeakButton` ra khỏi `Link`; hai phần tử là anh em trong cùng `<li>`. Không còn đường nổi bọt, nên không dùng `stopPropagation`/`preventDefault`. Nút giữ 44×44 và khoảng cách 12 px.
2. **Nhảy tới từ (US2, commit `feat(005)`)**: đích nhảy nằm trong địa chỉ: `/b/<bookId>/<lesson>?tab=vocab&word=<wordId>`. `SearchPage` dựng địa chỉ bằng hàm thuần mới ở `src/lib/lesson-url.ts`; trang bài đọc bằng `useSearchParams` (chạy giống nhau ở router hiện tại và data router). `LessonPage` cho tham số thắng tab đang giữ trong bộ nhớ; `VocabTab` nới bộ lọc đang che từ (chỉ trong lần xem này, không lưu), cuộn hàng vào giữa khung một lần, tô sáng bằng viền + nhãn chữ.

Lý do chọn địa chỉ và các phương án loại: [research.md](research.md) R-2. Không sửa registry, session, grading, pipeline, nội dung, `schemaVersion`, `tts.ts`, `speakable.ts`, `ui/jp/SpeakButton`; không dời tab Học.

Đầu vào đã đọc: `SearchPage.tsx`, `LessonPage.tsx`, `VocabTab.tsx`, `ui/jp/SpeakButton.tsx`, `app/layouts/{AppShell,TopBar,BottomNav}.tsx`, `app/App.tsx`, `eslint.config.js`, `ui/tokens.css`, tests hiện có (`SearchPage.test.tsx`, `VocabTab.test.tsx`, `tests/e2e/search.spec.ts`, `kana-speech.spec.ts`), nội dung `public/content/mnn1/` (số liệu ở research).

## Technical Context

**Language/Version**: TypeScript strict (không `any`), React 19, react-router-dom 7

**Primary Dependencies**: không thêm thư viện mới

**Storage**: N/A. Không IndexedDB, không localStorage. Bộ lọc của trang bài vốn chỉ là `useState` cục bộ (không lưu); việc nới bộ lọc không ghi gì

**Testing**: Vitest + Testing Library (`MemoryRouter`; thêm `createMemoryRouter` + `RouterProvider` với `lazy()` cho trang bài); Playwright 360×740 trên bản build (`npm run preview`)

**Target Platform**: web (Vercel), app Capacitor sau này; không dùng API riêng nền tảng

**Project Type**: web app một codebase (`src/`)

**Performance Goals**: không đo; `scrollIntoView` một lần, không vòng lặp; thêm < 1 KB JS

**Constraints**: hàm địa chỉ thuần trong `lib/` (không React); cuộn không phụ thuộc chiều cao thanh cố định; mọi chuỗi giao diện mới ở `i18n/vi.ts`; chỉ dùng token có sẵn (`line`, `tint`, `ink`); chữ Nhật có `lang="ja"` như hiện có

**Scale/Scope**: 1 trang tìm kiếm, 1 trang bài (tab Từ vựng), 1.295 từ vựng, 25 bài (bài dài nhất 77 từ)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Nguyên tắc | Đánh giá |
|---|---|
| I. Nội dung là dữ liệu | PASS. Không thêm từ giáo trình, tên cấp độ hay số bài vào mã. Test dùng ID/chuỗi mẫu. Không đụng `public/content/**`. |
| II. Local-first | PASS. Không gọi mạng thêm; không đụng IndexedDB/`ProgressRepository`. |
| III. Phân lớp & điểm cắm | PASS. Hàm địa chỉ ở `lib/` (thuần); `features/browse` chỉ import `lib/`, `ui/`, `data/`, `i18n/`; không có feature nào import feature khác; `ui/jp/SpeakButton` không đổi. Không đụng registry/session runner. |
| IV. Test trước | PASS có điều kiện: mỗi story viết test, chạy thấy ĐỎ trên mã cũ, ghi `evidence.md`, rồi mới sửa. Có e2e 360×740 cho cả hai story. `npm run check` xanh trước mỗi commit. |
| V. Phát hiện điểm yếu | PASS, không ảnh hưởng: `Attempt`, chấm điểm không đổi. Tra từ liền mạch hơn, không đổi dữ liệu học. |
| VI. Giao diện | PASS. Vùng chạm loa 44×44 giữ nguyên; tô sáng bằng viền + nhãn chữ (không chỉ màu), token có sẵn, tương phản ≥ 4.5:1 sáng và tối; chuỗi mới ở `vi.ts`; focus rõ (nút/liên kết có sẵn). Các class cũ (`slate-*`, `primary-*`) ở file đã có **không** sửa (việc của `pages-migration`); phần mới dùng token. |
| VII. Bảo mật & bản quyền | PASS. Địa chỉ chỉ chứa ID từ công khai; không dữ liệu cá nhân; không khóa. |

Post-design (sau Phase 1): vẫn PASS. Không có vi phạm; không có mục Complexity Tracking.

**Điểm dừng và hỏi**: test dự kiến đỏ mà xanh ngay; cách sửa buộc đụng vùng cấm (`tts.ts`, `speakable.ts`, `SpeakButton`, registry, session, grading, pipeline, `public/content`, `schemaVersion`); **lint đỏ vì luật lớp** (không thêm ngoại lệ ESLint, không sửa `eslint.config.js`, không `eslint-disable`); `npm run check` đỏ hai lần liên tiếp.

## Điều kiện trước khi làm

| Cơ chế | Giá trị hiện tại | Ghi chú |
|---|---|---|
| `.specify/feature.json` | `specs/005-search-speaker-and-jump` | Đúng |
| `setup-plan.ps1` | `BRANCH` báo `005-search-speaker-and-jump` | Lấy từ `feature.json`, không phải từ git |
| Nhánh git thật | `staging` | **Chưa có nhánh 005.** Task đầu tiên: tạo `005-search-speaker-and-jump` từ `staging` (Constitution: một feature một nhánh, một PR). Các file spec chưa theo dõi đi theo sang nhánh mới. |
| Thứ tự roadmap | `docs/SPECKIT_ROADMAP.md` dòng 77: làm **trước** `ui-kit-and-shell` | Đúng; feature này chạy được trên giao diện hiện tại |

## Project Structure

### Documentation (this feature)

```text
specs/005-search-speaker-and-jump/
├── spec.md
├── plan.md              # file này
├── research.md          # Phase 0: lý do địa chỉ, bộ lọc, cuộn, tô sáng, rủi ro router, cách kiểm e2e
├── data-model.md        # Phase 1: LessonJump, trạng thái tạm, relaxFilters, props mới
├── contracts/
│   └── lesson-jump-url.md   # Phase 1: hợp đồng địa chỉ + hàm dựng/đọc
├── quickstart.md        # Phase 1: lệnh kiểm, bảng "đỏ trước", ảnh chụp, chạy tay
├── checklists/requirements.md
├── evidence.md          # tạo khi làm: bằng chứng đỏ trước (Constitution IV)
└── tasks.md             # /speckit-tasks
```

### Source Code (repository root)

File sửa/thêm theo từng câu chuyện (nhóm theo commit):

```text
# Commit 1 — US1 loa (fix(search): ...)
src/features/browse/SearchPage.tsx          # SỬA: <li> flex; SpeakButton và Link là anh em; min-h-11 chuyển sang Link
src/features/browse/SearchPage.test.tsx     # SỬA: thêm describe "bấm loa không điều hướng" (MemoryRouter + Routes + LocationProbe)
tests/e2e/search.spec.ts                    # SỬA: thêm e2e bấm loa ở 360×740 (giả speechSynthesis theo kana-speech.spec.ts)
specs/005-search-speaker-and-jump/evidence.md   # THÊM: bằng chứng đỏ của US1

# Commit 2 — US2 nhảy tới từ (feat(005): ...)
src/lib/lesson-url.ts                       # THÊM: lessonUrl, parseLessonJump, type LessonTab (thuần)
src/lib/lesson-url.test.ts                  # THÊM: hai chiều khớp nhau, ID lạ, ký tự đặc biệt
src/features/browse/SearchPage.tsx          # SỬA: Link dùng lessonUrl({ bookId, lesson, wordId: r.id })
src/features/browse/LessonPage.tsx          # SỬA: useSearchParams + parseLessonJump; tab theo tham số; scrolledTo; key và props cho VocabTab; type Tab → LessonTab
src/features/browse/VocabTab.tsx            # SỬA: id hàng, props highlightId/scrollToId/onScrolled, relaxFilters, effect cuộn, tô sáng + nhãn
src/i18n/vi.ts                              # SỬA: lesson.jumpHighlightLabel = 'Từ vừa tìm'
src/features/browse/VocabTab.test.tsx       # SỬA: tô sáng, cuộn một lần, nới bộ lọc (6 trường hợp), từ trùng, ID lạ
src/features/browse/LessonPage.jump.test.tsx    # THÊM: describe.each [MemoryRouter, createMemoryRouter + lazy()]
src/features/browse/SearchPage.test.tsx     # SỬA: liên kết mang ?tab=vocab&word=<id>
tests/e2e/search-jump.spec.ts               # THÊM: e2e nhảy tới từ ở 360×740 (R-9)
specs/005-search-speaker-and-jump/evidence.md   # SỬA: thêm bằng chứng đỏ của US2
docs/SPECKIT_ROADMAP.md                     # SỬA khi xong: đánh dấu hoàn thành (Constitution, quy trình mục 5)
```

Không sửa: `eslint.config.js`, `src/ui/jp/SpeakButton.tsx`, `src/data/search-index.ts`, `src/lib/{tts,speakable}.ts`, `src/domain/**`, `scripts/**`, `content/**`, `public/content/**`, `src/app/**`, `KanjiPage`/`HomePage`/`WeaknessPage` (các nơi dựng `/b/...` khác giữ chuỗi cũ; ngoài phạm vi).

**Structure Decision**: giữ cấu trúc hiện có. Hàm địa chỉ ở `src/lib/` vì là hàm thuần dùng chung cho nhiều feature và `features/*` được import `lib/` (ARCHITECTURE §4.2); `SearchPage` và `LessonPage` cùng thuộc `features/browse/` nhưng đặt ở `lib/` để `HomePage`, `WeaknessPage`, tab Học mới (feature khác) dùng được mà không phải import feature khác. Không thêm khối ESLint.

## Thiết kế theo câu chuyện

### US1 — loa (chi tiết ở [research.md](research.md) R-1)

Cấu trúc kết quả sau khi sửa:

```text
<li class="flex items-center gap-3">
  <SpeakButton text={r.kana} />
  <Link to={...} class="flex min-h-11 min-w-0 flex-1 items-center py-2"> chữ + romaji + nghĩa </Link>
</li>
```

Giữ nguyên chuỗi truyền cho loa (`r.kana`), vùng chạm 44×44 (lớp của `SpeakButton`), khoảng cách 12 px, chiều cao hàng ≥ 44 px, và hành vi tự ẩn khi không có giọng Nhật.

Test (viết trước, phải đỏ):

- Đơn vị, `MemoryRouter` + `Routes` có `/search` (SearchPage + một `LocationProbe` in `pathname + search`) và `/b/:bookId/:lesson` (dấu hiệu "đã sang trang bài"): gõ từ khóa, bấm loa ở kết quả → `LocationProbe` vẫn `/search?q=…`, không thấy dấu hiệu trang bài, ô tìm kiếm vẫn giữ giá trị, `speak` gọi đúng một lần với chuỗi kana.
- Đơn vị: `button.closest('a')` là `null`; `Link` và `button` là hai anh em (cùng `parentElement`).
- Đơn vị bàn phím: `userEvent.tab()` đưa tiêu điểm tới nút loa; `{Enter}` rồi `{ }` (Space) → chỉ phát âm, địa chỉ không đổi.
- Đơn vị: bấm loa liên tiếp ở hai kết quả → không điều hướng, `speak` gọi hai lần, không có `console.error`.
- e2e 360×740 (`search.spec.ts`, giả `speechSynthesis` như `kana-speech.spec.ts`): gõ `kimasu` (16 kết quả khi đo bằng đúng tùy chọn của `searchVocab`; `gakusei` chỉ ra 1 kết quả nên không đủ để trang cuộn), khẳng định điều kiện tiên quyết (≥ 5 kết quả, `scrollHeight > clientHeight`, đã cuộn xuống nên `scrollY > 0`), ghi `scrollY`, bấm loa ở năm kết quả khác nhau → `page.url()` vẫn `/search?q=kimasu`, `scrollY` không đổi sau mỗi lần bấm, ô tìm kiếm còn `kimasu`, `__spoken` tăng đúng một chuỗi kana mỗi lần, không có lỗi console. Bấm tiếp loa ở kết quả khác → vẫn ở `/search`.

### US2 — nhảy tới từ (chi tiết ở research R-2…R-8, [data-model.md](data-model.md), [contracts/lesson-jump-url.md](contracts/lesson-jump-url.md))

Luồng:

1. `SearchPage`: `Link to={lessonUrl({ bookId, lesson, wordId: r.id })}` → `/b/<book>/<lesson>?tab=vocab&word=<id>`.
2. `TextbookLesson`: `useSearchParams` → `parseLessonJump`; `tab` khởi tạo `jump.tab ?? 'vocab'`; khóa `tab|word` đổi thì đặt lại tab theo tham số (không dùng effect). Không tham số → code cũ.
3. `VocabTab` (dựng với `key` theo `wordId`): `relaxFilters` tính bộ lọc khởi tạo; hàng có `id="vocab-<id>"`; hàng đích tô sáng (viền trái 4 px `border-line`, nền `bg-tint`, nhãn chữ `Từ vừa tìm`, `aria-current="true"`); `useEffect` cuộn `{ block: 'center', behavior: 'instant' }` nếu `scrollToId` có và hàng có thật, rồi `onScrolled(id)`.
4. ID không có trong bài: không cuộn, không tô sáng, không lỗi.

Bộ lọc: nới chiều che từ đích về `all` ngay từ giá trị khởi tạo, chỉ trong lần xem này (state cục bộ; không ghi gì ra ngoài vì bộ lọc vốn không được lưu). Bảng 6 trường hợp ở research R-4.

Test (viết trước, phải đỏ), mỗi cái nằm ở file đã nêu ở "Source Code":

- `lesson-url.test.ts`: bảng ví dụ ở contract C-2/C-3; hai chiều khớp nhau; `word` có ký tự đặc biệt; `tab` lạ.
- `VocabTab.test.tsx`: (a) có `highlightId` thì đúng một hàng có `aria-current` và chữ `Từ vừa tìm`; (b) từ trùng kana khác ID → chỉ hàng đúng được tô sáng; (c) `scrollIntoView` gọi một lần với `{ block: 'center', behavior: 'instant' }` trên đúng hàng, không gọi khi `scrollToId` vắng; (d) ID lạ → không gọi `scrollIntoView`, không `aria-current`, không ném lỗi; (e) nới bộ lọc đủ 6 trường hợp (phần × bản) và các nút bộ lọc hiện đúng giá trị sau khi nới; (f) không `highlightId` → giao diện y như hiện nay (đặc trưng).
- `LessonPage.jump.test.tsx` (`describe.each` hai kiểu router; mock `@/data/content-loader`): `?tab=vocab&word=<id>` → tab Từ vựng chọn, hàng tô sáng, `scrollIntoView` một lần; `?tab=grammar` → tab Ngữ pháp, không tô sáng; không tham số → Từ vựng, không tô sáng; ID lạ → trang dựng bình thường; đổi sang `?tab=vocab&word=<id>` khi đang ở Ngữ pháp → về Từ vựng; đổi tab bằng tay rồi quay lại Từ vựng → không cuộn lại.
- `SearchPage.test.tsx`: `href` của kết quả có `tab=vocab` và `word=<id>`; hai kết quả cùng kana khác ID có hai `href` khác nhau.
- e2e `search-jump.spec.ts` (360×740, bản build): xem R-9 và danh sách ở dưới.

**e2e nhảy tới từ (360×740)**, chạy bằng chính nội dung thật:

| Test | Việc làm | Kiểm |
|---|---|---|
| Từ giữa bài | Tìm một từ ở giữa bài dài, bấm thân hàng | URL có `tab=vocab&word=`; tab Từ vựng đang chọn; hàng nằm trọn khung nhìn, `row.top ≥ header.bottom`, `row.bottom ≤ nav.top`, `elementFromPoint` ở tâm hàng thuộc hàng; hàng có `aria-current`, chữ `Từ vừa tìm`, viền trái ≥ 4 px |
| Từ mở rộng cuối bài | Bài 13, `nodo ga kawakimasu` | Như trên (hàng cuối danh sách, kẹp bởi giới hạn cuộn) |
| Từ đầu bài | Từ đầu Bài 1 | Như trên |
| Từ trùng | `sato`: bấm `佐藤`, Quay lại, bấm `砂糖` | Hai lần tới Bài 2 và Bài 14, mỗi lần tô sáng đúng hàng của từ đã bấm |
| Đang ở tab khác | Mở `/b/mnn1/13`, chọn Ngữ pháp, rồi tìm và bấm một từ của Bài 13 | Tab Từ vựng đang chọn, hàng tô sáng |
| F5 | `page.reload()` | Như lần đầu |
| Quay lại | `page.goBack()` | `/search?q=…`, ô tìm kiếm đúng từ khóa, danh sách có lại |
| ID lạ | Mở `/b/mnn1/13?tab=vocab&word=khong-co` | Trang dựng, có tiêu đề bài, không `aria-current`, không lỗi console |
| Giảm chuyển động | `emulateMedia({ reducedMotion: 'reduce' })` rồi nhảy | Hàng vào khung ngay và tô sáng |

## Cam kết không đổi (kiểm tự động cuối mỗi commit)

- `git diff --name-only` của mỗi commit không chứa: `src/lib/tts.ts`, `src/lib/speakable.ts`, `src/ui/jp/SpeakButton.tsx`, `src/domain/**`, `src/features/practice/**`, `scripts/**`, `content/**`, `public/content/**`, `eslint.config.js`. (`src/lib/lesson-url.ts` là file mới được phép.)
- `schemaVersion` trong `src/domain/schemas.ts` không đổi.
- Không thêm `eslint-disable`, không thêm ngoại lệ ESLint; `package.json` không đổi.
- Cái chớp "Không tìm thấy kết quả." sau debounce và tab Học không đổi.

## Rủi ro và việc để ngỏ cho chủ dự án

| # | Mục | Mức | Ghi chú |
|---|---|---|---|
| R-A | Cuộn tức thì luôn (`behavior: 'instant'`) thay vì mượt khi không bật giảm chuyển động | Quyết định nhỏ | Thỏa FR-015 mà không rẽ nhánh. Muốn cuộn mượt cho người không bật giảm chuyển động thì thêm một nhánh `matchMedia`; báo để chủ dự án chọn |
| R-B | Rủi ro khi `ui-kit-and-shell` chuyển sang data router + `lazy()` | Thấp | Bảng đầy đủ ở research R-10; cách giảm: chỉ dùng `useSearchParams`, cuộn gắn vào lúc `VocabTab` dựng, e2e đo thanh thật; bài kiểm đơn vị chạy cả hai kiểu router |
| R-C | Class màu cũ (`slate-*`, `primary-*`) còn trong `VocabTab`/`SearchPage` | Đã biết | Không sửa trong feature này (việc của `pages-migration`); chỉ phần mới dùng token |
| R-D | Các nơi dựng `/b/...` khác (`KanjiPage`, `HomePage`, `WeaknessPage`) dùng chuỗi riêng | Đã biết | Không đổi; có thể chuyển sang `lessonUrl` ở feature sau |
| R-E | Từ trùng cùng bài (không có trong nội dung hiện tại: 1.295 ID duy nhất) | Rất thấp | Build đã báo lỗi nếu hai mục trong một bài trùng ID (KH §6.2) |

## Complexity Tracking

Không có vi phạm cần giải trình.
