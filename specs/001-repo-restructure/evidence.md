# Bằng chứng nghiệm thu: repo-restructure (spec 001)

**Nhánh**: `001-repo-restructure` | **Mốc so sánh**: commit `dca3700`, đo ngày 2026-11-07 | **Trạng thái**: đang ghi dần. Mục chưa làm ghi rõ "chưa làm" kèm số task; T072 chỉ hoàn thành khi mọi mục đã có số liệu.

Đường dẫn ảnh tính từ gốc repo `Source code/Code/`. Thư mục `.screens/` đã gitignore, chỉ có trên máy của Mạnh.

## 1. Cổng FR-011 sau từng nhóm commit

Công cụ: `node specs/001-repo-restructure/verify-baseline.mjs`. Mọi nhóm: `npm test -- --testTimeout=30000` 220/220 test, 44/44 file; `npm run build` JS 608,42 kB (lệch 0,00 kB so với mốc), 1 cảnh báo chunk; `npm run content:validate` 0 lỗi, 568 cảnh báo; `npm run lint` mã thoát 0.

| Nhóm | Commit | File dời | File sửa import / chú thích | Kết quả cổng |
|---|---|---|---|---|
| G0 | `614b851` (mã), `ccea729` (mốc ở spec) | 0 | 0 | mốc |
| G1 | `05e93d8` | 14 | 4 | PASS |
| G2 | `25e03a1` | 3 | 14 | PASS |
| G3 | `f033241` | 11 | 8 | PASS |
| G4 | `bc81106` | 19 | 17 | PASS |
| G5 | `2e4a7cf` | 8 | 19 | PASS |
| G6 (tài liệu) | `545a77a` | 0 | 8 file tài liệu | PASS |
| G7 (ESLint) | `681e366` | 0 | 1 (`eslint.config.js`) | PASS |
| Cuối (G8) | (không commit mã) | | | PASS ở T061 |

### Hai cách chạy `npm test` (không cờ và có cờ)

| Thời điểm | Có cờ `--testTimeout=30000` | Mặc định (không cờ) |
|---|---|---|
| Mốc đầu ngày (`dca3700`) | (chưa đo) | 219/220: `pipeline.test.ts` quá hạn 5000 ms |
| G0, T007 | 220/220 | 220/220 |
| Cuối, T061 | 220/220 | 219/220: `pipeline.test.ts` quá hạn 5262 ms |

`npm run check` ở T061: xanh lần đầu (220/220, 568 cảnh báo, typecheck, lint). Test `pipeline.test.ts` chập chờn trên cùng mã nguồn: đây là ngoại lệ Q-1 (sửa ở spec `quality-gaps`).

## 2. e2e (`npm run test:e2e`, 6 file, 11 test)

Mốc (G0, T011) và cuối (T062) giống nhau: **10 đạt, 1 đỏ có sẵn.** Test đỏ: `browse.spec.ts` › "mở trang chủ → vào N5 → Minna no Nihongo 1 → Bài 1", đỏ từ commit `8746c15` (hero mới đổi heading trang chủ), ngoại lệ Q-2. Đạt: `browse.spec.ts` › "mở thẳng /b/mnn1/5 không bị 404", hai test 360×740 của `tests/e2e/repo-restructure.spec.ts`, và các file `content`, `practice-flashcard`, `practice-mcq`, `settings`.

## 3. Smoke (SC-001)

`node specs/001-repo-restructure/shoot.mjs smoke before|after [--dev]` → `.screens/001/smoke-before.json`, `.screens/001/smoke-after.json`.

- Trước: 21 route, sau: 21 route. Số ký tự trang và trạng thái từng route giống hệt (công cụ báo "Khớp smoke-before.json").
- 0 trang trắng, 0 `pageerror`, 0 `console.error` ở cả hai bản. Không có lỗi console có sẵn nào cần ghi làm mốc.
- `/styleguide`: bản dựng hiện trang 404; bản `npm run dev` hiện bình thường (1902 ký tự, không lỗi).

## 4. Progress (FR-002, SC-006)

Cùng profile `.screens/001/profile`, cùng cổng 4174, cơ sở IndexedDB `progress`:

| Bảng | Trước | Sau |
|---|---|---|
| `attempts` | 44 | 44 |
| `mastery` | 44 | 44 |
| `mistakes` | 6 | 6 |
| `outbox` | 94 | 94 |
| `settings` | 0 | 0 |
| `srsCards` | 0 | 0 |

localStorage giữ khóa `theme`. Công cụ báo "Khớp progress-before.json". Dữ liệu tạo ở bản "trước" bằng một phiên Flashcard Bài 1 (quên 3 thẻ đầu) và một phiên trắc nghiệm Bài 5 (10 câu, sai 3 câu đầu).

## 5. Ảnh chụp trước/sau (SC-002)

36 ảnh = 6 trang (`/`, `/n`, `/b/mnn1`, `/b/mnn1/5`, `/weak`, `/settings`) × 3 cỡ (360×740, 768×1024, 1280×800) × sáng/tối. Ảnh "trước": `.screens/001/before/` (chụp hai lần ở T008, 36/36 giống hệt).

| Lần chụp | Thư mục | So với "trước" |
|---|---|---|
| "Sau" chính thức (T065) | `.screens/001/after/` | **35/36 giống hệt hash**, 1 ảnh khác |
| Chụp lại lần 1 | `.screens/001/after-2/` | **36/36 giống hệt** |
| Chụp lại lần 2 | `.screens/001/after-3/` | **36/36 giống hệt** |

Bản "sau" chính thức vẫn là `after/` (không thay bằng `after-2`).

**Ảnh khác hash duy nhất**: `b-mnn1-5-1280-light.png` (trang `/b/mnn1/5`, 1280×800, chế độ sáng).

- Cùng kích thước 1280×5643, lệch 1 byte tệp (376603 so với 376604).
- So từng điểm ảnh: **20 điểm ảnh khác**, mỗi kênh màu chênh tối đa 14/255.
- Vị trí: 4 cụm × 5 điểm ảnh, x 121–133, y 2461–2465, 2605–2609, 3685–3689, 4319–4323. Phóng 8 lần, đối chiếu hai ảnh: cả 4 cụm là ký tự "〜" (gạch sóng) ở đầu từ trong bảng từ vựng; chỉ khác viền khử răng cưa của chữ, không có khác biệt về phần tử, màu hay bố cục.
- **Nguyên nhân ngoài feature (bằng chứng):** chụp lại cả 36 ảnh hai lần nữa trên cùng bản dựng "sau" (`after-2`, `after-3`) cho 36/36 giống hệt "trước", gồm cả ảnh này. Mã không đổi giữa ba lần chụp mà kết quả khác nhau, nên khác biệt do phông dự phòng của ký tự CJK vẽ viền không ổn định ở thỉnh thoảng một lần chụp, không do mã.
- **Quyết định của Mạnh:** chấp nhận ảnh lệch này (xem mục 6).

## 6. Xác nhận của Mạnh (T066)

Mạnh đã xem 4 cặp ảnh 360px trước/sau: trang chủ sáng, trang chủ tối, `/b/mnn1/5` sáng, `/b/mnn1/5` tối (`.screens/001/before/` và `.screens/001/after/`, các tệp `home-360-light.png`, `home-360-dark.png`, `b-mnn1-5-360-light.png`, `b-mnn1-5-360-dark.png`): **giống nhau, không thấy khác biệt.** Mạnh cũng chấp nhận ảnh `b-mnn1-5-1280-light.png` lệch 20 điểm ảnh vì viền chữ "〜" (hai lần chụp lại đều khớp). SC-002 đạt.

## 7. Kiểm độc lập User Story 2 (T048, SC-004, SC-008)

- `git ls-files '*.md'` ở gốc repo: chỉ `CLAUDE.md`, `README.md`.
- 43/43 hàng của `data-model.md`: cột "Từ" không còn tồn tại, cột "Đến" tồn tại. Ba file loại trừ (`src/lib/tts.ts`, `src/lib/theme.ts`, `src/lib/use-theme.ts`) vẫn ở `src/lib/`.
- `git diff -M --name-status dca3700 HEAD`: cả 43 hàng được Git nhận là đổi tên (SC-008: 100%, không file nào thành xóa-và-thêm); 36 hàng đạt ≥ 95% tương đồng.
- 7 hàng dưới 95%, đều là file nhỏ có sửa dòng import hoặc tên export (bắt buộc theo task): `format-duration.test.ts` 90%, `App.tsx` 84%, `Layout.tsx` 88%, `TopBar.tsx` 94%, `KanjiDetailPage.tsx` 93%, `SearchPage.tsx` 92%, `components/ui/index.ts` 69%.
- `git log --follow` trên `src/ui/jp/Ruby.tsx` thấy 2 commit.
- Phần "nhóm Xóa còn tồn tại là 0" của SC-004: **chưa làm (T069)**.

## 8. Luật phụ thuộc ESLint (SC-007), 10 ca

`npm run lint` toàn cây: xanh. Ca 1 đến 7 báo `no-restricted-imports` và thoát mã 1; ca 8 đến 10 (đoạn có dùng biến) thoát mã 0.

| Ca | Tệp giả | Kết quả |
|---|---|---|
| 1 | `src/domain/x.ts` import `react` | lỗi |
| 2 | `src/domain/x.ts` import `@/data/progress/dexie-repo` | lỗi |
| 3 | `src/data/x.ts` import `@/ui/primitives` | lỗi |
| 4 | `src/ui/jp/x.tsx` import `@/domain/types` | lỗi |
| 5 | `src/features/browse/x.tsx` import `@/features/practice/session-store` | lỗi |
| 6 | `src/features/browse/x.tsx` import `@/app/layouts/Container` | lỗi |
| 7 | `src/features/browse/x.tsx` import `dexie` | lỗi |
| 8 | `src/data/hooks/x.ts` import `react` (có dùng) | không lỗi |
| 9 | `src/features/browse/x.tsx` import `@/ui/primitives` (có dùng) | không lỗi |
| 10 | `src/data/progress/dexie-repo.ts` import `dexie` (có dùng) | không lỗi |

Kiểm thêm: ba ngoại lệ có tên không báo ở đúng file, vẫn báo ở file khác cùng thư mục; import tương đối (`../../app/…`, `../data/…`) cũng báo lỗi.

## 9. Ngoại lệ ghi nhận (`plan.md` → Complexity Tracking)

| Mã | Nội dung | Chuyển cho |
|---|---|---|
| TD-1 | `src/domain/quiz/registry.ts` import `react` (chỉ kiểu) | `ui-kit-and-shell` / `practice-ui-migration` |
| TD-2 | `features/weakness` (`WeaknessPage.tsx`, `MistakesPage.tsx`) import `features/practice` | `practice-ui-migration` |
| E-1 | `src/features/dev/**` import `app/` | khi quyết định số phận `StyleguidePage` |
| Q-1 | `pipeline.test.ts` quá hạn 5 giây khi chạy mặc định (CI có thể đỏ ngẫu nhiên) | `quality-gaps` |
| Q-2 | test e2e `browse.spec.ts` "mở trang chủ → …" đỏ từ `8746c15` | `quality-gaps` |

## 10. Các dòng tài liệu đã sửa (T055)

Danh sách `file:dòng — trước → sau` ở báo cáo G6 (commit `545a77a`): `docs/FRONTEND.md` §3 (dòng 59, 67, 68, 70, 75, 183, 223) và §8 (dòng 298, 303, 306, 312); `docs/ARCHITECTURE.md:432`; `docs/SPECKIT_ROADMAP.md:41, 94`; `README.md`; bốn README trong `src/`. Thêm ngoài danh sách: các đường dẫn `design/…` thành `docs/reference/design/…` (FRONTEND 5, 103, 442, 466; ARCHITECTURE 485; ROADMAP 26, 37, 44, 86) và `(xem index.css)` thành `(xem tokens.css)` (FRONTEND 172 đến 180, 208). Không sửa gì trong `docs/reference/**`.

## 11. Chưa có bằng chứng (đang chờ)

| Mục | Task | Trạng thái |
|---|---|---|
| Đẩy nhánh và tạo Pull Request | T067 | chờ Mạnh đồng ý |
| Vercel Preview trên điện thoại | T068 | chưa làm. So với ứng dụng cục bộ ở `dca3700`, không so với website production (7 commit giao diện và tài liệu chưa duyệt đưa lên `main`; PR dùng base `staging`) |
| Xóa file build cũ, nhóm "Xóa" của SC-004 | T069 | chưa làm |
| `git status`, file bản sao | T070 | chưa làm |
| Kiểm link `README.md` lần cuối (SC-005) | T071 | chưa làm |
| Đánh dấu hoàn thành trong roadmap | T073 | chưa làm |
| 10 câu "file X đặt ở đâu" (SC-009) | T074 | chưa làm |
