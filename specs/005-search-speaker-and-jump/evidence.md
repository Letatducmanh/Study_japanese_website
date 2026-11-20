# Evidence: search-speaker-and-jump

Bằng chứng theo Constitution IV: test viết trước, thấy ĐỎ trên mã cũ, rồi mới sửa mã. Mọi số liệu đo trên máy của chủ dự án (Windows 11), nhánh `005-search-speaker-and-jump`.

## Cơ chế xác định feature

| Cơ chế | Giá trị | Đạt? |
|---|---|---|
| `git branch --show-current` | `005-search-speaker-and-jump` | Đúng |
| `git merge-base HEAD staging` / `git rev-parse staging` | cùng `392f728bb66bce69e8c3eb07ed9443e75663039c` | Nhánh tách đúng từ `staging` |
| `git log --oneline staging..HEAD` | rỗng (chưa có commit nào) | Đúng |
| `.specify/feature.json` | `specs/005-search-speaker-and-jump` | Đúng |
| `SPECIFY_FEATURE`, `SPECIFY_FEATURE_DIRECTORY` | trống | Không ảnh hưởng |
| `git status --short` | chỉ file chưa theo dõi đã biết (Companion, `docs/*.md` gốc, `Ảnh mobile/`, `specs/005-search-speaker-and-jump/`) và hai file đã sửa sẵn `.specify/integrations/claude.manifest.json`, `specs/002-data-and-logic-fixes/tasks.md` | Đúng |
| Cổng 4173 và 5173 | không tiến trình nào nghe (kiểm bằng `netstat`) | Trống |

## Mốc trước

Đo ngày 2026-11-21 trên mã chưa sửa gì (cùng `staging` `392f728`).

| Mốc | Kết quả |
|---|---|
| `npx vitest run` lần 1 | 64/65 file đạt, 508/509 test đạt, 56,60 giây. Một test đỏ: `src/features/weakness/WeaknessPage.lessons.test.tsx` (`findByRole` quá hạn mặc định 1 giây khi máy có tải). Chạy riêng file đó: 5/5 đạt, 4,38 giây. Không phải 5 giây của `testTimeout`, đây là hạn của `findBy`. |
| `npx vitest run` lần 2 | **65/65 file đạt, 509/509 test đạt, 56,57 giây** (mốc dùng để so sau này) |
| `npm run build` | thành công (`built in 1.46s`; cảnh báo chunk > 500 kB có sẵn từ trước) |
| `npx playwright test --reporter=list` | **34 đạt, 1 đỏ**. Đỏ duy nhất: `tests/e2e/browse.spec.ts` "mở trang chủ → vào N5 → Minna no Nihongo 1 → Bài 1" (Q-2 của `quality-gaps`, đã biết từ trước, không do spec này) |

## Story 1: kết quả ĐỎ

Chạy ngày 2026-11-21 trên mã chưa sửa (`SearchPage.tsx` còn `SpeakButton` nằm trong `Link`).

**Đơn vị** — `npx vitest run src/features/browse/SearchPage.test.tsx`: 4 ĐỎ, 9 đạt.

| Test (describe "bấm loa không điều hướng (spec 005)") | Lỗi |
|---|---|
| (a) bấm loa ở kết quả đầu: địa chỉ, ô tìm kiếm không đổi, chỉ phát âm một lần | `expected '/b/mnn1/4' to be '/search?q=watashi'` |
| (b) nút loa không nằm trong thẻ `<a>`, anh em trong `<li>` | `expected <a …>…</a> to be null` (`button.closest('a')` khác `null`) |
| (c) bàn phím: Tab tới nút loa; Enter và Space chỉ phát âm | `expect(element).toHaveFocus()`: tiêu điểm rơi vào liên kết, không vào nút loa |
| (d) bấm loa liên tiếp ở năm kết quả | `expected '/b/mnn1/4' to be '/search?q=watashi'` |

Ghi chú trung thực: lần chạy đầu (a), (c), (d) đỏ vì hết 5 giây, do `userEvent` kẹt dưới `vi.useFakeTimers()` (lỗi của chính test, chưa phải bằng chứng đỏ). Sửa bằng `vi.useFakeTimers({ shouldAdvanceTime: true })` và đưa `LocationProbe` ra ngoài `Routes` để thông báo lỗi hiện đúng địa chỉ sai; bảng trên là lần chạy sau khi sửa test, trước khi sửa mã.

**e2e 360×740** — `npm run build && npx playwright test tests/e2e/search.spec.ts --reporter=list`: 3 ĐỎ, 4 đạt (4 test cũ). Cả ba ca đều **đã qua** điều kiện tiên quyết (≥ 5 kết quả với truy vấn `kimasu`, trang cuộn được, `scrollY > 0`; ca 1 và 2 còn có ≥ 5 nút loa nằm trọn trong khung nhìn) rồi mới đỏ ở bước bấm loa.

| Ca | Lỗi |
|---|---|
| ca 1: bấm loa ở một kết quả | `toHaveURL(/\/search\?q=kimasu$/)`, nhận `http://localhost:4173/b/mnn1/11` |
| ca 2: bấm loa liên tiếp ở năm kết quả | như trên, ngay ở lần bấm đầu tiên |
| ca 3: bàn phím | `getByRole('button', { name: 'Nghe phát âm' }).first()` `toBeFocused()`: nhận `inactive` (Tab rơi vào liên kết trước) |

## Story 1: test đặc trưng `[đặc trưng]` (xanh ngay)

Xanh trước và sau, không phải bằng chứng đỏ.

Cùng lần chạy ở trên (mã chưa sửa), các test dưới đây **xanh ngay** như dự kiến:

- `SearchPage.test.tsx` `[đặc trưng]` (e): liên kết của hàng vẫn có `href` bắt đầu `/b/mnn1/4` và chứa chữ hiển thị; (f) nút loa giữ class `h-11` và `w-11`; (g) kanji, romaji, nghĩa vẫn nằm trong hàng. Cùng 6 test cũ của file (debounce 3, chuỗi đọc spec 004 3): xanh.
- `search.spec.ts`: 4 test cũ (tìm `sinh vien`, `nhat ban`, một ký tự `a`, `gakusei` và không cuộn ngang) xanh.

## Story 1: kết quả XANH

Chạy ngày 2026-11-21 sau khi sửa `SearchPage.tsx` (T008).

| Lệnh | Kết quả | Mốc trước (T002/T003) |
|---|---|---|
| `npx vitest run src/features/browse/SearchPage.test.tsx` | 13/13 đạt (4 test đỏ ở trên nay xanh) | 9 đạt, 4 đỏ |
| `npm run build && npx playwright test tests/e2e/search.spec.ts --reporter=list` | 7/7 đạt (3 ca loa đỏ nay xanh) | 4 đạt, 3 đỏ |
| `npx vitest run` (toàn bộ) | **65/65 file đạt, 516/516 test đạt**, 34,08 giây | 65 / 509 (+7 test mới: 4 đỏ→xanh, 3 `[đặc trưng]`) |
| `npx playwright test --reporter=list` (toàn bộ) | **37 đạt, 1 đỏ**: chỉ Q-2 `browse.spec.ts` "mở trang chủ → …" | 34 đạt, 1 đỏ (+3 ca loa mới) |

Không test e2e nào khác Q-2 đỏ.

**Cổng trước commit (T014)**, chạy ngày 2026-11-21 sau khi tắt mọi `npm run dev`/`npm run preview` (không tiến trình nào nghe cổng 4173 và 5173):

| Lệnh | Kết quả |
|---|---|
| `npm run check` (thẳng, không rút gọn) | **xanh ngay lần đầu**: `content:validate` OK (568 cảnh báo, như mốc), `tsc -b` sạch, `eslint .` sạch, `vitest run` 65/65 file, 516/516 test, 33,96 giây. Không test cũ nào hết giờ lần này (một lần `WeaknessPage.lessons` quá hạn `findBy` đã xảy ra ở lần đo mốc đầu tiên, xem "Mốc trước"). |
| `npm run build` | thành công (`tsc -b && vite build`, 2158 module, `built in 850ms`) |

Số lần chạy `npm run check` trong Story 1: một (xanh). Không có lần đỏ nào phải ghi.

## Story 1: loại kết quả có nút loa

Kiểm ngày 2026-11-21 (T010), trước khi commit:

| # | Lệnh | Kết quả |
|---|---|---|
| a | `grep -nE "stopPropagation\|preventDefault\|onClick" src/features/browse/SearchPage.tsx` | rỗng |
| b | `git diff -U0 src/features/browse/SearchPage.tsx \| grep -E "eslint-disable"` | rỗng |
| c | `git diff --stat -- src/ui/jp/SpeakButton.tsx src/lib/tts.ts src/lib/speakable.ts` | rỗng |
| e | `git diff -U0 src/features/browse/SearchPage.tsx \| grep -E "^[+-].*(vi\.search\.empty\|pending\|SEARCH_DEBOUNCE_MS\|useDebouncedValue)"` | `OK: không đụng khối empty/pending/debounce` (tên thật trong mã: `SEARCH_DEBOUNCE_MS` dòng 12 và 23, `pending` dòng 27 và 56, `vi.search.empty` dòng 58) |

**Loại kết quả có nút loa (FR-006).** Trang `/search` chỉ có **một loại** kết quả: từ vựng (`searchVocab` ở `src/data/search-index.ts`); không có kết quả Kanji hay ngữ pháp. Loại đó có nút loa, và lỗi nằm ở đúng loại đó: nút loa lồng trong `Link`. Sửa áp dụng cho loại này. Các nơi khác có `SpeakButton` (kiểm bằng `grep -rn SpeakButton src --include=*.tsx`, đọc từng nơi): `VocabTab.tsx:131` (hàng `<li>`, không có liên kết), `GrammarTab.tsx:92`, `KanjiPage.tsx:59` và `:92` (liên kết `Link` của trang này ở dòng 120-129 là danh sách từ liên quan, không chứa `SpeakButton`), `FlashcardComponent.tsx:104`, `McqComponent.tsx:41`: không nơi nào nằm trong `<a>`/`Link`.

## Story 1: ảnh chụp

Chụp ngày 2026-11-21 bằng `.screens/_shot-005-us1.mjs` (script tạm, thư mục `.screens/` đã gitignore, không commit) trên bản build qua `npm run preview` (đã tắt sau khi chụp), 360×740, `deviceScaleFactor: 2`, giả giọng đọc tiếng Nhật. Truy vấn `kimasu` (16 kết quả).

| Ảnh | Cảnh |
|---|---|
| `.screens/005-us1-1-results-focus.png` | `/search?q=kimasu`, nhấn Tab từ ô tìm kiếm: viền focus ở nút loa của kết quả đầu |
| `.screens/005-us1-2-after-speak.png` | Đã cuộn xuống 300 px, bấm loa ở một kết quả: vẫn ở trang tìm kiếm, danh sách và vị trí cuộn không đổi (giao diện sáng) |
| `.screens/005-us1-3-dark.png` | Như ảnh 2, giao diện tối |

Số đo từ script (ảnh 2 sáng và ảnh 3 tối cho cùng kết quả):

```
TRƯỚC {"url":"http://localhost:4173/search?q=kimasu","scrollY":300}
SAU   {"url":"http://localhost:4173/search?q=kimasu","scrollY":300,"spoken":["いって きます。"]}
```

Bố cục hàng giữ như trước: nút loa 44×44, khoảng cách 12 px tới chữ, chiều cao hàng không đổi.

## Story 2: kết quả ĐỎ

(chưa làm)

## Story 2: test đặc trưng `[đặc trưng]` (xanh ngay)

Xanh trước và sau, không phải bằng chứng đỏ.

(chưa làm)

## Story 2: kết quả XANH

(chưa làm)

## Story 2: loại kết quả khác mở đi đâu

(chưa làm)

## Story 2: ảnh chụp

(chưa làm)

## Ghi chú SC-004

SC-004 được chứng minh bằng e2e (T025) cộng test đơn vị T023(e). Ca e2e "đang ở tab khác" đi qua TopBar nên `TextbookLesson` được dựng lại, ca đó qua được dù tham số có thắng tab đang giữ hay không; việc tham số thắng tab đang giữ chỉ được chứng minh ở T023(e), ở cả hai kiểu router.

## Kiểm vùng cấm

### Commit 1 (`fix(search)`)

Chạy trên phần đã stage (13 file), so với `staging`. `ZONE='^src/domain/|session|^scripts/|^content/|^public/content/|^src/lib/(tts|speakable)|^src/ui/jp/SpeakButton|^src/features/practice/|^src/data/search-index|^eslint\.config\.js$|^package(-lock)?\.json$'`

| # | Lệnh | Kết quả |
|---|---|---|
| 1 | `git diff --cached staging --name-only \| grep -E "$ZONE"` | `OK: không đụng vùng cấm` |
| 2 | `git diff --cached staging -U0 -- . ':(exclude)specs/005-search-speaker-and-jump' \| grep -E "^[+-].*schemaVersion"` | `OK: không đụng schemaVersion (ngoài tài liệu specs/005)` |
| 3 | `git diff --cached staging --name-status \| grep -E "^(R\|D)"` | `OK: không xóa/đổi tên file` |
| 4 | `git diff --cached -U0 -- . ':(exclude)specs/005-search-speaker-and-jump' \| grep -E "^\+.*(eslint-disable\|stopPropagation\|preventDefault)"` | `OK: không eslint-disable, không stopPropagation/preventDefault` |

Không có ngoại lệ đường dẫn nào trong vùng cấm ở Commit 1 (không cần `grep -vxF`). Danh sách 13 file đã stage (`git diff --cached staging --stat`; số dòng của `evidence.md` và `tasks.md` còn tăng thêm đúng bằng phần ghi bằng chứng và dấu tick làm sau lệnh này, nên so sánh sau commit theo tên file và số dòng của 11 file còn lại):

```
 docs/SPECKIT_ROADMAP.md                            |  22 ++-
 .../checklists/requirements.md                     |  36 ++++
 .../contracts/lesson-jump-url.md                   |  77 ++++++++
 specs/005-search-speaker-and-jump/data-model.md    |  79 ++++++++
 specs/005-search-speaker-and-jump/evidence.md      | (tăng sau lệnh này)
 specs/005-search-speaker-and-jump/plan.md          | 188 +++++++++++++++++++
 specs/005-search-speaker-and-jump/quickstart.md    |  59 ++++++
 specs/005-search-speaker-and-jump/research.md      | 163 +++++++++++++++++
 specs/005-search-speaker-and-jump/spec.md          | 151 +++++++++++++++
 specs/005-search-speaker-and-jump/tasks.md         | (tăng sau lệnh này)
 src/features/browse/SearchPage.test.tsx            | 177 +++++++++++++++++-
 src/features/browse/SearchPage.tsx                 |   7 +-
 tests/e2e/search.spec.ts                           | 178 ++++++++++++++++++
 13 files changed
```

## Thời gian vitest trước/sau

| | Thời gian | File / test |
|---|---|---|
| Trước (T002, lần 2) | 56,57 giây | 65 / 509 |
| Sau Story 1 | 34,08 giây (máy rảnh hơn lúc đo mốc) | 65 / 516 |
| Sau Story 2 | (chưa làm) | |

## Số liệu cuối

(chưa làm)
