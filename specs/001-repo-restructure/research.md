# Research: Sắp xếp lại cấu trúc repo

**Feature**: `001-repo-restructure` | **Date**: 2026-11-07

Không còn mục `NEEDS CLARIFICATION` nào. Dưới đây là các quyết định đã chốt và lý do.

## R1. Cách dời file: `git mv` + sửa import tối thiểu

- **Decision**: Dùng `git mv` cho mọi lần dời/đổi tên. Chỉ sửa dòng `import`, đường dẫn trong chú thích và tài liệu. Không chạy Prettier hay bất kỳ công cụ định dạng hàng loạt.
- **Rationale**: Hầu hết file dời giữ nguyên nội dung (chỉ file *được import* mới bị sửa), nên Git ghi nhận là đổi tên và `git log --follow` còn truy vết được (SC-008). Định dạng hàng loạt sẽ làm lệch nội dung và phá nhận diện đổi tên.
- **Alternatives considered**: Xóa rồi tạo lại (mất lịch sử). Hai commit "chỉ dời" rồi "sửa import" (lịch sử tốt nhưng commit giữa chừng không build được, trái yêu cầu mỗi nhóm phải chạy build và test).
- **Chi tiết**: Thư mục `design/` có tên file tiếng Việt và dấu `·` (VD `App · Tab Học@1x.png`): dùng `git mv design docs/reference/design` cho cả thư mục để khỏi phải trích dẫn từng tên. Đặt `core.quotepath=false` khi xem `git status` để đọc được tên.

## R2. Nhóm commit và cổng kiểm tra sau mỗi nhóm

- **Decision**: 9 nhóm G0–G8 (xem `plan.md`). Sau mỗi nhóm G1–G7 chạy cổng kiểm **định nghĩa ở `spec.md` FR-011** (không nhắc lại số liệu ở đây). Công cụ `verify-baseline.mjs` làm việc so sánh.
- **Rationale**: Mỗi nhóm đủ nhỏ để hoàn tác bằng một lần `git revert` nếu lệch mốc; cần lệnh tự động để khỏi so bằng mắt. Chạy `npm test` kèm cờ `--testTimeout=30000` (chỉ ở dòng lệnh) loại bỏ lỗi chập chờn của `pipeline.test.ts` mà không sửa repo, nên mỗi commit đi qua cổng xanh đúng như nguyên tắc IV; G0 đo mốc cả hai cách (mặc định và kèm cờ) để thấy mức chập chờn. Nếu kèm cờ mà vẫn có test fail thì dừng và báo, không bỏ qua.
- **Mốc**: bảng "Mốc so sánh" ở `spec.md` (đo 2026-11-07 tại `dca3700`, bổ sung ở G0 bằng T007 và T011). `npm run lint` không có trong mốc ban đầu; `verify-baseline.mjs` đo ở G0 và ghi vào spec.
- **Alternatives considered**: Chỉ kiểm cuối (nếu lệch thì khó biết nhóm nào gây ra). Chạy cả `npm run check` mỗi nhóm (đã gồm `typecheck` trùng với `build`, và `npm test` mặc định có thể đỏ ngẫu nhiên; `npm run check` chỉ chạy ở G8 để ghi nhận). Sửa `testTimeout` trong repo (sửa test, ngoài phạm vi; thuộc `quality-gaps`).

## R3. Mô phỏng luật phụ thuộc §4.2 trên mã hiện tại

- **Method**: Viết script tạm (ngoài repo) phân tích mọi `import` của 164 file trong `src/` (alias `@/` và đường dẫn tương đối), ánh xạ từng file sang vị trí đích rồi áp bảng §4.2 (phiên bản v2.1: `ui/` được dùng `platform/`).
- **Result với bảng đích của audit**: 10 import vi phạm ở 10 file. 6 trong số đó **do chỗ đặt gây ra**:
  - `NotFound` vào `app/` → 4 trang `features/browse` (Book, Lesson, Level) và `KanjiDetailPage` import ngược `features → app`.
  - `ThemeToggle` vào `app/` → `features/settings/SettingsPage` import ngược.
  - `KanjiCard` vào `ui/jp/` → `ui → domain` (import kiểu từ `domain/types`).
- **Decision**: đặt theo §4.2 (thứ tự ưu tiên: ARCHITECTURE nằm trên audit trong `docs/reference/`): `NotFound`, `ThemeToggle` → `ui/primitives/`; `lib/theme.ts`, `lib/use-theme.ts` chưa dời (nếu dời vào `app/` thì `ThemeToggle` ở `ui/` phải import `app/`); `KanjiCard` → `features/browse/` (chỉ browse dùng, đúng quy tắc "≥ 2 feature mới vào `ui/`" ở `FRONTEND.md` §3 và audit §2.2 đã cho phép).
- **Result với bảng đích của plan**: còn 4 import ở 4 file (xem bảng dưới), đều là nợ có sẵn hoặc ngoại lệ dev:

| Mã | Import | Kiểu |
|---|---|---|
| TD-1 | `domain/quiz/registry.ts` → `react` | kiểu (`ComponentType`) |
| TD-2 | `features/weakness/{WeaknessPage,MistakesPage}.tsx` → `features/practice/session-store.ts` | giá trị (2 import) |
| E-1 | `features/dev/StyleguidePage.tsx` → `app/layouts/Container` | giá trị |

- **Không phát hiện**: import tương đối vượt lớp (0), `dexie` ngoài `dexie-repo.ts` (0), import Supabase/Capacitor (chưa cài).
- **Alternatives considered**: Giữ đúng bảng audit và ghi 10 mục nợ (nhiều nợ hơn, phần lớn tự gây ra). Cho phép `features → app` (sửa luật §4.2, trái thứ tự ưu tiên tài liệu).

## R4. Cách viết luật ESLint (User Story 4)

- **Decision**: Dùng `@typescript-eslint/no-restricted-imports` trong `eslint.config.js` (flat config), mỗi lớp một khối `files: ['src/<lớp>/**']`. Không thêm plugin mới. Chi tiết ở `contracts/layering-rules.md`.
  - Dùng bản của `typescript-eslint` (đã cài, `typescript-eslint` 8) vì có `allowTypeImports`; không cần vì ta không cho phép riêng import kiểu, nhưng giữ khả năng đó cho nợ về sau.
  - Mẫu `group` dùng cả dạng alias (`@/data/**`) lẫn dạng đường dẫn chứa tên lớp (`**/data/**`) để bắt cả import tương đối.
  - Luật theo từng feature được sinh từ `fs.readdirSync('src/features')` khi nạp cấu hình, nên thêm feature mới không phải sửa cấu hình.
  - Ngoại lệ có tên (TD-1, TD-2, E-1) là các khối `files:` liệt kê chính xác file, kèm bình luận lý do. Không dùng `eslint-disable` rải trong mã.
  - Luật toàn cục: `dexie` chỉ trong `src/data/progress/dexie-repo.ts`; `@supabase/supabase-js` chỉ trong `src/data/supabase-client.ts`; `@capacitor/*` chỉ trong `src/platform/native/**`.
  - `react` được phép trong `src/data/hooks/**` (hook React theo `FRONTEND.md` §3); bị cấm ở phần còn lại của `src/data/**` và ở `src/domain/**`.
- **Rationale**: `eslint-plugin-boundaries` hay `import/no-restricted-paths` mạnh hơn nhưng là phụ thuộc mới, trái FR-013 (không thêm thư viện). Luật hiện đủ cho bảng §4.2.
- **Cách kiểm**: không viết test logic mới. `quickstart.md` chạy `npx eslint --stdin --stdin-filename <đường dẫn giả>` với 6 đoạn vi phạm mẫu, mỗi đoạn phải báo lỗi (SC-007), rồi `npm run lint` toàn cây phải xanh.
- **Alternatives considered**: Test Vitest gọi API ESLint (thêm mã và có nguy cơ quá hạn 5 giây như `pipeline.test.ts`); tự viết script kiểm import (viết lại công cụ đã có).

## R5. So sánh ảnh chụp trước/sau

- **Decision**: Script Playwright tạm `specs/001-repo-restructure/shoot.mjs` (không thêm vào `package.json`) chụp các trang từ bản dựng `vite preview`, lưu ra `.screens/001/before` và `.screens/001/after` (thư mục `.screens/` thêm vào `.gitignore`, theo `FRONTEND.md` §13.1). So bằng SHA-256 của file PNG.
  - Trang: `/`, `/n`, `/b/mnn1`, `/b/mnn1/5`, `/weak`, `/settings`.
  - Cỡ: 360×740, 768×1024 và 1280×800 (đủ ba cỡ của SC-002). Chế độ: sáng và tối (đặt `localStorage.theme` trước khi mở). Tổng **36 ảnh** (6 trang × 3 cỡ × 2 chế độ).
  - Ổn định: `reducedMotion: 'reduce'` (tắt hoạt ảnh vẫy tay của linh vật), `animations: 'disabled'`, chờ `document.fonts.ready`, tiến độ trống (trình duyệt sạch).
  - Nếu hash khác: xem ảnh, ghi lại điểm khác; chỉ chấp nhận khác biệt do nguyên nhân ngoài feature (VD phông chữ tải từ Google lệch), có ghi chú.
- **Rationale**: Không cần thư viện so ảnh; "giống hệt byte" là tiêu chí chặt nhất và rẻ nhất. Phải chụp "trước" **từ bản dựng trước khi dời**, nên là việc của G0.
- **Alternatives considered**: `pixelmatch` (thêm thư viện); `toHaveScreenshot` của Playwright (tạo thư mục snapshot trong `tests/`, đụng cấu trúc test).
- **Mạnh xem ảnh**: SC-002 đòi Mạnh xác nhận. G8 liệt kê đường dẫn 4 cặp ảnh (trang chủ và `/b/mnn1/5`, 360px, sáng và tối) để Mạnh xem; chưa có xác nhận thì SC-002 chưa đạt.

## R5b. Duyệt toàn bộ route (smoke) và đối chiếu tiến độ (progress)

- **Decision**: Hai chế độ thêm vào cùng `shoot.mjs` (không thêm thư viện), chạy ở "trước" (G0) và "sau" (G8):
  - **smoke** (FR-001, SC-001): đọc `path=` trong bảng route của `App.tsx` (`src/App.tsx` ở bản trước, `src/app/App.tsx` ở bản sau), thay tham số mẫu, mở từng route, kiểm không trắng và không `pageerror`/`console.error`; `after` tự so với `before` (cùng số route, cùng kết quả). `/styleguide` chỉ có ở bản dev nên kiểm riêng bằng `npm run dev` (và kiểm bản preview trả 404).
  - **progress** (FR-002, SC-006): dùng `chromium.launchPersistentContext` với một thư mục profile cố định và **cùng cổng 4174** cho "trước" và "sau" (IndexedDB gắn với origin và profile). `before` làm một phiên Flashcard và một phiên trắc nghiệm trả lời sai để tạo bản ghi tiến độ và sổ lỗi sai, rồi đếm bản ghi từng object store của mọi IndexedDB; `after` đếm lại và so.
- **Rationale**: Ảnh chụp và e2e hiện có không chứng minh 100% route hay tiến độ cũ còn nguyên. Vercel Preview khác origin nên IndexedDB trống, không dùng được để kiểm tiến độ.
- **Alternatives considered**: Xuất/nhập file tiến độ qua trang Cài đặt (kiểm được định dạng nhưng không kiểm việc dữ liệu sống sót qua hai bản dựng); dựng profile mới mỗi lần (mất dữ liệu cần đối chiếu).

## R6. Mốc e2e và test 360×740

- **Decision**: G0 thêm `tests/e2e/repo-restructure.spec.ts` (giữ lại) rồi chạy `npm run test:e2e` trên cây chưa dời, ghi kết quả vào bảng mốc của spec. Sau đó chạy lại ở G5 và G8.
  - File mới dùng `test.use({ viewport: { width: 360, height: 740 } })`, mở `/` và `/b/mnn1/5`, kiểm có nội dung chính.
- **Rationale**: Constitution IV: mỗi feature có ít nhất một e2e ở viewport 360×740. Đặt viewport ở cấp file nên **không sửa** `playwright.config.ts` (Desktop Chrome, cổng 4173, `npm run preview`; cần `npm run build` trước). Test được thêm *trước khi dời file* để mốc phản ánh đúng bản trước.
- **Alternatives considered**: Sửa `playwright.config.ts` thêm project 360×740 (đổi cấu hình, thuộc `ui-kit-and-shell`); chỉ ghi ngoại lệ (không đáp ứng nguyên tắc IV); chạy e2e sau mỗi nhóm (chậm; chọn chạy ở G0, G5 và G8).

## R7. Phạm vi kiểm link và tài liệu bản chụp

- **Decision**: Kiểm link tại `README.md`, `CLAUDE.md`, README thư mục con, `docs/ARCHITECTURE.md`, `docs/FRONTEND.md`, `docs/SPECKIT_ROADMAP.md`. **Loại** `docs/reference/**` khỏi việc sửa nội dung: các file đó (`Ke_hoach_Website.md`, `audit-hien-trang.md`, `design/AUDIT.md`, `design/SPEC.md`, `constitution-draft.md`) là bản chụp theo ngày, có đường dẫn cũ nhắc trong chữ hoặc link tương đối.
- **Rationale**: Spec yêu cầu `design/` và `BACKLOG.md` dời mà "nội dung không đổi" (User Story 2, tình huống 3). Sửa link bên trong sẽ trái điều đó, và `ARCHITECTURE.md` ghi `Ke_hoach_Website.md` là "kế hoạch gốc, không sửa nữa".
- **Hệ quả**: SC-005 cần hiểu là "tài liệu đang dùng", không gồm bản chụp trong `docs/reference/`. Việc này đã nêu ở "Điểm lệch cần duyệt" của `plan.md`.

## R8. Dọn file build cũ

- **Decision**: Xóa `dist/`, `playwright-report/`, `test-results/`, `public/content-report.md` ở **bước cuối cùng (G8)**, sau khi đã chạy build và e2e xong. Các mục này đã gitignore nên không tạo commit.
- **Đã kiểm nơi ghi báo cáo (2026-11-07):** `scripts/content/pipeline.ts:378` gọi `writeReport(join(dirname(contentDir), 'content-report.md'), …)` với `contentDir = <gốc repo>/content`, nên báo cáo luôn nằm ở `<gốc repo>/content-report.md` (đúng ngoại lệ `docs/ARCHITECTURE.md` §8.2, đã gitignore). Script không ghi vào `public/`; `public/content-report.md` (21/10) là bản sao cũ còn sót. Kết luận: xóa bản trong `public/` là an toàn, **không sửa script**, **không có nợ** cần chuyển sang `data-and-logic-fixes`.
- **Rationale**: Build và e2e sinh lại `dist/`, `playwright-report/`, `test-results/`; xóa sớm thì sẽ xuất hiện lại. Không xóa `public/content/**` (JSON sinh tự động dùng cho `vite preview` và dev; do `content:build` tạo, không phải "build cũ"). Không xóa `node_modules/`.
- **Alternatives considered**: Xóa ngay ở G0 (sinh lại ngay ở lần build đầu tiên).

## R9. Những thứ cố ý không làm

- Không tách `router.tsx`, không thêm `lazy()`, không `FocusShell` (spec ngoài phạm vi; thuộc `ui-kit-and-shell`).
- Không dựng `src/platform/`, không dời `src/lib/tts.ts`; `SpeakButton` vẫn import `@/lib/tts`.
- Không đổi `src/lib/sfx.ts`, `StyleguidePage` (ngoài việc đổi import do dời), `public/content/README.md`.
- Không xóa token cũ `primary-*` hay sửa nội dung `tokens.css`.
- Không đổi tên `package.json` (`"name": "code"`) vì thuộc cấu hình ngoài phạm vi.

## R10. Rủi ro đã tính

| Rủi ro | Cách giảm |
|---|---|
| Tailwind không quét class ở thư mục mới | Tailwind v4 tự phát hiện nguồn trong dự án; cổng `build` + hash ảnh chụp ở G8 bắt được nếu mất style |
| `src/index.css` đổi chỗ làm hỏng import kiểu `./index.css` | Chỉ `main.tsx` import (1 chỗ); sửa cùng commit với G3 |
| Test dời mà không đi cùng file nguồn | Bảng `data-model.md` ghi cặp `Ruby`, `SpeakButton`, `heatmap`, `format-duration`, `App` cùng test; số file test (44) và số test (220) phải giữ nguyên |
| Nhóm giữa chừng làm `build` hỏng | Cổng sau mỗi nhóm; hỏng thì `git revert` nhóm đó, không đi tiếp |
| Đổi tên `Layout`/`KanjiDetailPage` làm sót tham chiếu | `tsc -b` (trong `build`) bắt; thêm `grep` các tên cũ ở G6 |
| CRLF/LF khi Git cảnh báo | Không đổi kiểu xuống dòng; không chạy công cụ định dạng |
| `.specify/feature.json` không commit | Là trạng thái máy; không ảnh hưởng nhánh |
