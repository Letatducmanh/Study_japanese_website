# Bằng chứng nghiệm thu: repo-restructure (spec 001)

**Nhánh**: `001-repo-restructure` | **Mốc so sánh**: commit `dca3700`, đo ngày 2026-11-07 | **Trạng thái**: đã đủ số liệu, chỉ còn SC-009 (mục 15) chờ Mạnh trả lời.

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
- Phần "nhóm Xóa còn tồn tại là 0" của SC-004: xem mục 12 (T069, T070).

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

## 11. Pull Request (T067) và Vercel Preview (T068)

- Mạnh đồng ý đẩy ngày 2026-11-07 theo cách: `main` cục bộ (`dca3700`) đẩy lên nhánh `staging`, **không** đẩy vào `origin/main`, vì 7 commit giao diện và tài liệu trên `main` cục bộ chưa được duyệt đưa lên `main`. Nhánh `001-repo-restructure` đẩy lên `origin`; Pull Request có base `staging`, compare `001-repo-restructure`, 16 commit (`git log origin/staging..001-repo-restructure`). Lần đẩy đầu bị GitHub từ chối (GH007, email riêng tư); sau khi Mạnh tắt tuỳ chọn chặn thì hai lệnh push thành công.
- CI (`.github/workflows/ci.yml`) chỉ chạy cho base `main`, nên không chạy cho PR vào `staging`; cổng đã chạy đủ cục bộ (mục 1). Không sửa workflow.
- **T068 đạt (Mạnh xác nhận):** mở Vercel Preview của nhánh trên điện thoại ổn: trang chủ, `/b/mnn1/5`, luyện 2–3 câu, chế độ sáng và tối; không trang trắng, không mất chữ. Đường dẫn: https://study-japanese-website-git-001-repo-restructure-le-tat-duc-manh.vercel.app/
- Cách so sánh: so với ứng dụng cục bộ ở `dca3700` (ảnh `.screens/001/before/`), **không** so với website production, vì production chưa có 7 commit giao diện và tài liệu của `main` cục bộ.
- Tiến độ học cũ không kiểm trên Preview (khác origin nên IndexedDB trống); đã kiểm bằng progress ở mục 4.

## 12. Dọn file build cũ và kiểm cây repo (T069 đến T071)

- Đã xóa cục bộ (đều gitignore, không tạo commit): `dist/`, `playwright-report/`, `test-results/`, `public/content-report.md` (bản cũ ngày 21/10). Giữ nguyên: `content-report.md` ở gốc repo (ngoại lệ ARCHITECTURE §8.2), `public/content/**`, `node_modules/`, `.screens/`.
- Quy tắc dừng của T069: sau khi xóa, chạy `npm run content:build` ("Xong, 568 cảnh báo, xem content-report.md"); `public/content-report.md` **không** sinh lại, báo cáo chỉ ghi ở `content-report.md` gốc. Không phải dừng, không sửa `scripts/content/pipeline.ts`.
- T070: `git status --short` rỗng; `find . -maxdepth 1 -name '*.md'` chỉ ra `CLAUDE.md`, `README.md`, `content-report.md` (đã gitignore); `git ls-files | grep -E '(^|/)(old|backup|new)/|-copy.|-v2.'` rỗng.
- T071: mọi link và đường dẫn trong `README.md` (kể cả `docs/reference/Ke_hoach_Website.md`, `CLAUDE.md`, các thư mục `src/*`) trỏ tới file/thư mục có thật (SC-005, 0 link hỏng).

## 13. Roadmap (T073)

`docs/SPECKIT_ROADMAP.md`: `repo-restructure` đổi ⬜ thành ✅ ở §3 và §4.1, ghi `lib/theme.ts`, `lib/use-theme.ts`, `lib/tts.ts` chưa dời (vị trí cuối ở `ui-kit-and-shell`) và Q-1, Q-2 chuyển cho `quality-gaps`.

## 14. Tóm tắt theo tiêu chí

| Tiêu chí | Bằng chứng ở mục | Trạng thái |
|---|---|---|
| SC-001 | 3 | đạt |
| SC-002 | 5, 6, 11 | đạt (ảnh lệch 20 điểm ảnh được Mạnh chấp nhận) |
| SC-003 | 1, 2 | đạt |
| SC-004 | 7, 12 | đạt |
| SC-005 | 10, 12 | đạt |
| SC-006 | 4 | đạt |
| SC-007 | 8 | đạt |
| SC-008 | 7 | đạt |
| SC-009 | 15 | chờ Mạnh trả lời |

## 15. SC-009: mười câu "file loại X đặt ở đâu"

Chờ Mạnh trả lời (T074). Kết quả (số câu đúng, câu nào phải đoán) ghi vào đây.

