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

Chạy ngày 2026-11-21 trên mã chưa sửa cho Story 2 (HEAD = `88aad6a`; chưa có `src/lib/lesson-url.ts`, `vocab-filters.ts`, chưa có prop/`id`/nhãn ở `VocabTab`, `LessonPage` chưa đọc `tab`/`word`).

**Đơn vị** — `npx vitest run src/lib/lesson-url.test.ts src/features/browse`:

| File | Kết quả | Lý do đỏ |
|---|---|---|
| `src/lib/lesson-url.test.ts` | **file không nạp được** (29 test chưa chạy: 6 `lessonUrl` + 7 `parseLessonJump` + 16 hai chiều) | `Failed to resolve import "./lesson-url"` (chưa có module) |
| `src/features/browse/vocab-filters.test.ts` | **file không nạp được** (8 test chưa chạy: 6 trường hợp phần × bản + ID lạ + chỉ nới chiều che) | `Failed to resolve import "./vocab-filters"` |
| `VocabTab.test.tsx` | 17 test: **8 ĐỎ**, 9 xanh | (a) hàng tô sáng chưa có (`expected [] to have a length of 1`); (b) từ trùng; (c) cuộn một lần, StrictMode, scrollToId vắng; (d) ID lạ (hàng chưa có `id`); (e) nới bộ lọc; (f) hàng chưa có `id` `vocab-<id>` |
| `LessonPage.jump.test.tsx` | 12 test (6 ca × 2 kiểu router): **8 ĐỎ**, 4 xanh | (a) `expected null not to be null` (chưa có hàng `vocab-w-ext`); (b) `Unable to find an element with the text: Bài này chưa có ngữ pháp.` (tham số `tab` bị bỏ qua); (e) như (b); (f) `expected "vi.fn()" to be called 1 times, but got 0 times`. Cả hai kiểu router (`MemoryRouter + Routes` và `createMemoryRouter + RouterProvider + lazy()`) đỏ giống nhau. |
| `SearchPage.test.tsx` | 16 test: **3 ĐỎ**, 13 xanh | (a) `expected [ '/b/mnn1/4', '/b/mnn1/4' ] to deeply equal [ Array(2) ]`; (b) `[ '/b/mnn1/2', '/b/mnn1/14' ]` thiếu `?tab=vocab&word=…`; (c) `expected '/b/mnn1/4' to be '/b/mnn1/4?tab=vocab&word=r-1'` |

Tổng: 19 test chạy được và ĐỎ, cộng 2 file (37 test) chưa nạp được vì thiếu module. Typecheck (`tsc -b`, nên cả `npm run build`) cũng đỏ ở giai đoạn này vì test tham chiếu module và prop chưa có; đúng như dự kiến, chỉ xanh sau khi viết mã.

**e2e 360×740** — `npx playwright test tests/e2e/search-jump.spec.ts --reporter=list` trên bản build của HEAD (`npm run build` ở bước này dừng ở `tsc -b` vì lý do trên, nên `dist/` còn là bản build Story 1, cũng là mã hiện tại): **9 ĐỎ**, 1 xanh. Chín ca đều đỏ ở cùng một chỗ: `kết quả của "<truy vấn>" phải có liên kết mang word=<id>`, `Expected: 1, Received: 0` (liên kết kết quả chưa mang `word=`):

| Ca | Truy vấn |
|---|---|
| từ đầu Bài 1 | `watashi` (`mnn1-l01-87a2e9c8`) |
| từ giữa Bài 13 | `keizai` (`mnn1-l13-34e1bf15`) |
| từ cuối Bài 13 (mở rộng) | `nodo ga kawakimasu` (`mnn1-l13-af449570`) |
| từ mở rộng đầu Bài 13 | `menyu` (`mnn1-l13-0ccab9cc`) |
| từ trùng 佐藤/砂糖 | `sato` (`mnn1-l02-b23ffe1b`) |
| đang ở tab Ngữ pháp rồi tìm | từ giữa Bài 13 |
| F5 | từ cuối Bài 13 |
| Quay lại | từ cuối Bài 13 |
| giảm chuyển động | từ cuối Bài 13 |

**Ghi chú trung thực về thiết kế test.** Lần chạy đầu có ba test dự kiến XANH (`[đặc trưng]`) lại ĐỎ vì chính test phụ thuộc thứ chưa có: `VocabTab` `[đặc trưng]` (f) gọi `queryByText(viText.lesson.jumpHighlightLabel)` khi khóa i18n chưa có; `LessonPage.jump` (c) và e2e "ID không còn trong bài" dùng `id` hàng mới để nhận biết hàng. Đó là lỗi của test, không phải mã, nên sửa test trước khi ghi bằng chứng: nhãn dùng hằng `'Từ vừa tìm'`, hàng nhận bằng romaji hiển thị hoặc `main ul li`. Ngược lại, (d) của `VocabTab` (ID lạ) vốn xanh ngay vì không tô sáng gì là hành vi cũ; để nó đỏ đúng lý do, thêm khẳng định "mọi hàng của bài vẫn có `id` `vocab-<id>`" (cũng đúng yêu cầu: ID lạ không làm hỏng việc dựng).

## Story 2: test đặc trưng `[đặc trưng]` (xanh ngay)

Xanh trước và sau, không phải bằng chứng đỏ.

Cùng lần chạy ở trên (mã chưa sửa), các test dưới đây **xanh ngay** như dự kiến (sau khi sửa thiết kế test như ghi chú ở mục ĐỎ):

- `VocabTab.test.tsx`: `[đặc trưng]` (e) không `highlightId`, bộ lọc bản `new` → từ bản cũ vẫn bị ẩn như trước; `[đặc trưng]` (f) không `highlightId` → không tô sáng, không nhãn, không cuộn, chữ hiển thị không đổi; `[đặc trưng]` (g) nút loa của hàng vẫn đọc kana. Cộng 6 test cũ (spec 004): xanh.
- `LessonPage.jump.test.tsx`, ở cả hai kiểu router: `[đặc trưng]` (c) không tham số → tab Từ vựng, không tô sáng, không cuộn; `[đặc trưng]` (d) `?word=khong-co` → trang dựng bình thường, không tô sáng, không cuộn, không `console.error`. (4 test: 2 ca × 2 router.)
- `SearchPage.test.tsx`: 13 test còn lại (debounce, chuỗi đọc spec 004, và các test bấm loa của Story 1).
- `search-jump.spec.ts`: `[đặc trưng]` ID không còn trong bài → trang bài mở bình thường (có tiêu đề bài, danh sách từ, không `aria-current`, không `pageerror`/`console.error`).

## Story 2: kết quả XANH

Chạy ngày 2026-11-21 sau khi viết mã Story 2 (T027–T032), sau khi tắt `vite` dev server của dự án (cổng 5173) và không còn `preview` nào (cổng 4173):

| Lệnh | Kết quả | Mốc trước (đỏ ở mục trên / sau Story 1) |
|---|---|---|
| `npx vitest run src/lib/lesson-url.test.ts src/features/browse/vocab-filters.test.ts` | 37/37 đạt (29 + 8) | 2 file không nạp được |
| `npx vitest run src/lib/lesson-url.test.ts src/features/browse` | 8 file, **93/93 đạt** | 19 đỏ + 2 file không nạp được |
| `npx vitest run` (toàn bộ) | **68/68 file đạt, 579/579 test đạt**, 62,75 giây (máy có tải; lần đo ở Story 1 là 34,08 giây khi rảnh) | 65 / 516 sau Story 1 (+63 test mới: 29 `lesson-url`, 8 `vocab-filters`, 11 `VocabTab`, 12 `LessonPage.jump`, 3 `SearchPage`) |
| `npm run build && npx playwright test --reporter=list` (toàn bộ) | **47 đạt, 1 đỏ**: chỉ Q-2 `browse.spec.ts` "mở trang chủ → …" | 37 đạt, 1 đỏ sau Story 1 (+10 ca `search-jump.spec.ts`: 9 đỏ→xanh, 1 `[đặc trưng]`) |

Cả 10 ca `search-jump.spec.ts` xanh ngay lần chạy đầu sau khi viết mã, gồm phép đo hình học: hàng nằm trọn trong khung nhìn, `row.top ≥ header.bottom`, `row.bottom ≤ nav.top`, `elementFromPoint` ở tâm hàng thuộc hàng, `aria-current="true"`, chữ `Từ vừa tìm`, viền trái ≥ 4 px, ở cả từ đầu Bài 1, từ giữa và cuối Bài 13 (từ mở rộng), 佐藤/砂糖, F5, Quay lại, ID lạ, giảm chuyển động. Không test e2e nào khác Q-2 đỏ.

**Cổng trước commit (T038)**, ngày 2026-11-21, sau khi tắt `vite` dev server (5173) và không còn `preview` nào (4173; cả hai cổng không ai nghe):

| Lần | Lệnh | Kết quả |
|---|---|---|
| 1 | `npm run check` | **ĐỎ ở lint**: `src/features/browse/LessonPage.jump.test.tsx:120:5 react-hooks/immutability` ("Modifying component props or hook arguments is not allowed", do `GrabNavigate` gán `target.current` trong effect). Không phải luật lớp (ARCHITECTURE §4.2), không phải nợ cũ: lỗi của test do tôi viết. |
| (sửa) | | Đổi `GrabNavigate` nhận callback `onReady(navigate)` thay vì gán vào prop; không `eslint-disable`, không sửa `eslint.config.js`. `npx eslint` và `tsc -b` sạch. |
| 2 | `npm run check` | **xanh**: `content:validate` OK (568 cảnh báo, như mốc), `tsc -b` sạch, `eslint .` sạch, vitest 68/68 file, 579/579 test, 36,93 giây |
| 2 | `npm run build` | thành công (`built in 822ms`) |
| 2 | `npx playwright test tests/e2e/search-jump.spec.ts tests/e2e/search.spec.ts` trên bản build cuối | 17/17 đạt |

Số lần `npm run check` trong Story 2: hai (một đỏ do lint trong test, một xanh); chưa có hai lần đỏ liên tiếp.

## Story 2: loại kết quả khác mở đi đâu

Kiểm ngày 2026-11-21 (T034), trước khi commit:

| # | Lệnh | Kết quả |
|---|---|---|
| a | `git diff -U0 -- . ':(exclude)specs' \| grep -E "^\+.*(eslint-disable\|useLocation\|useNavigation\|useBlocker\|localStorage\|sessionStorage)"` | rỗng |
| a' | cùng `grep` trên 6 file mới (chưa theo dõi nên `git diff` không thấy): `lesson-url.ts`, `lesson-url.test.ts`, `vocab-filters.ts`, `vocab-filters.test.ts`, `LessonPage.jump.test.tsx`, `search-jump.spec.ts` | rỗng |
| b | `git diff --stat -- src/ui/jp/SpeakButton.tsx src/lib/tts.ts src/lib/speakable.ts src/data/search-index.ts eslint.config.js package.json package-lock.json` | rỗng |
| c | dòng thêm của `VocabTab.tsx` (và cả `vocab-filters.ts`) khớp `#hex\|slate-\|primary-\|amber-\|dark:` | rỗng |

**Loại kết quả khác mở đi đâu (FR-016).** Trang `/search` chỉ có kết quả từ vựng, nên hiện **chưa có** loại Kanji hay ngữ pháp nào để giữ cách mở cũ. Kết quả từ vựng giờ mở `/b/<sách>/<bài>?tab=vocab&word=<id>`. Các liên kết khác tới trang bài giữ nguyên, mở `/b/<sách>/<bài>` không tham số (không có hàng tô sáng, FR-017): `KanjiPage.tsx` (từ liên quan), `HomePage.tsx` (tiếp tục học, thẻ chính), `WeaknessPage.tsx` (bài yếu), `BookPage.tsx` (danh sách bài).

## Story 2: ảnh chụp

Chụp ngày 2026-11-21 bằng `.screens/_shot-005-us2.mjs` (script tạm, `.screens/` đã gitignore, không commit) trên bản build qua `npm run preview` (đã tắt sau khi chụp), 360×740, `deviceScaleFactor: 2`. Từ lấy từ `public/content/mnn1/l01.json` và `l13.json`; mỗi ảnh là khung nhìn sau khi bấm từ ở kết quả tìm kiếm. Số đo `row` so với thanh (px, hệ toạ độ khung nhìn; thanh trên cao tới 57, thanh dưới bắt đầu ở 681):

| Ảnh | Cảnh | Hàng (top–bottom) | Trong thanh? | Không bị che? |
|---|---|---|---|---|
| `.screens/005-us2-1-first.png` | từ đầu Bài 1 (`watashi`) | 318–390 | có | có |
| `.screens/005-us2-2-middle.png` | từ giữa Bài 13 (`keizai`) | 346–418 | có | có |
| `.screens/005-us2-3-last.png` | từ cuối Bài 13, từ mở rộng (`のどが かわきます`) | 498–608 | có | có |
| `.screens/005-us2-4-extended.png` | từ mở rộng đầu Bài 13 (`メニュー`) | 348–413 | có | có |
| `.screens/005-us2-5-sato-1.png` | 佐藤, Bài 2 (`/b/mnn1/2?tab=vocab&word=mnn1-l02-b23ffe1b`) | 343–415 | có | có |
| `.screens/005-us2-5-sato-2.png` | 砂糖, Bài 14, sau Quay lại rồi bấm hàng kia (`/b/mnn1/14?...mnn1-l14-97deba9a`) | 336–408 | có | có |
| `.screens/005-us2-6-reload.png` | F5 ở trang của ảnh 3 | 527–637 | có | có |
| `.screens/005-us2-7-back.png` | Quay lại từ ảnh 3: `/search?q=nodo+ga+kawakimasu`, ô tìm kiếm còn `nodo ga kawakimasu` | — | — | — |
| `.screens/005-us2-8-unknown.png` | ID lạ `?word=khong-co`: bài mở bình thường, 0 hàng `aria-current` | — | — | — |
| `.screens/005-us2-9-dark.png` | như ảnh 3, giao diện tối | 498–608 | có | có |
| `.screens/005-us2-10-other-tab.png` | mở Bài 13, bấm tab Ngữ pháp, rồi tìm từ giữa bằng ô tìm kiếm trên TopBar: tab Từ vựng mở | 334–406 | có | có |

Mọi ảnh có hàng tô sáng đều đo `aria-current="true"`, `border-left-width` 4px và chữ `Từ vừa tìm`. Ở ảnh 6 (F5) hàng nằm thấp hơn ảnh 3 khoảng 29 px (527 so với 498): sau F5 trình duyệt khôi phục vị trí cuộn cũ rồi mới tới lượt cuộn của trang; kết quả vẫn đúng hàng, tô sáng và trong khung nhìn.

Ca hàng bị bộ lọc che không chụp được ở nội dung thật (mặc định bộ lọc là "Tất cả"); đã bao bằng test đơn vị `vocab-filters.test.ts` (đủ 6 trường hợp phần × bản) và `VocabTab.test.tsx` (e).

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

### Commit 2 (`feat(005)`)

Chạy trên phần đã stage (15 file), cùng `ZONE` như Commit 1. Hai file mới ở `src/lib/` là ngoại lệ được loại bằng `grep -vxF` (nguyên dòng): `src/lib/lesson-url.ts`, `src/lib/lesson-url.test.ts`; chúng nằm ngoài `ZONE` (chỉ cấm `src/lib/tts` và `src/lib/speakable`) nên lệnh vẫn ra `OK` mà không cần loại.

| # | Lệnh | Kết quả |
|---|---|---|
| 1 | `git diff --cached staging --name-only \| grep -vxF "src/lib/lesson-url.ts" \| grep -vxF "src/lib/lesson-url.test.ts" \| grep -E "$ZONE"` | `OK: không đụng vùng cấm` |
| 2 | `git diff --cached --name-status \| grep -cE "^A[[:space:]]+src/lib/lesson-url(\.test)?\.ts$"` | `2` (đúng hai file mới ở `src/lib/`) |
| 3 | `git diff --cached -U0 -- . ':(exclude)specs/005-search-speaker-and-jump' \| grep -E "^[+-].*schemaVersion"` | **1 dòng khớp, là dương tính giả**: `+  schemaVersion: 1,` ở dòng 42 của `src/features/browse/LessonPage.jump.test.tsx`, giá trị mẫu của đối tượng `Manifest` giả trong test (kiểu `Manifest` bắt buộc trường này). Không đổi gì ở `schemaVersion` thật: `git diff --cached --name-only -- src/domain` rỗng; `src/domain/schemas.ts:157,250` và `src/domain/types.ts:160` không bị đụng. |
| 4 | `git diff --cached staging --name-status \| grep -E "^(R\|D)"` | `OK: không xóa/đổi tên file` |
| 5 | `git diff --cached -U0 -- . ':(exclude)specs/005-search-speaker-and-jump' \| grep -E "^\+.*(eslint-disable\|stopPropagation\|preventDefault)"` | `OK: không eslint-disable, không stopPropagation/preventDefault` |

Danh sách 15 file đã stage (`git diff --cached --stat`; số dòng của `evidence.md` và `tasks.md` còn tăng thêm đúng bằng phần ghi bằng chứng và dấu tick làm sau lệnh này, nên so sánh sau commit theo tên file và số dòng của 13 file còn lại):

```
 specs/005-search-speaker-and-jump/evidence.md | (tăng sau lệnh này)
 specs/005-search-speaker-and-jump/plan.md     |   2 +
 specs/005-search-speaker-and-jump/tasks.md    | (dấu tick, thêm sau lệnh này)
 src/features/browse/LessonPage.jump.test.tsx  | 275 ++++++++++++++++++++++++++
 src/features/browse/LessonPage.tsx            |  28 ++-
 src/features/browse/SearchPage.test.tsx       |  81 ++++++++
 src/features/browse/SearchPage.tsx            |   7 +-
 src/features/browse/VocabTab.test.tsx         | 226 +++++++++++++++++++++
 src/features/browse/VocabTab.tsx              |  70 ++++++-
 src/features/browse/vocab-filters.test.ts     |  93 +++++++++
 src/features/browse/vocab-filters.ts          |  32 +++
 src/i18n/vi.ts                                |   1 +
 src/lib/lesson-url.test.ts                    |  91 +++++++++
 src/lib/lesson-url.ts                         |  51 +++++
 tests/e2e/search-jump.spec.ts                 | 211 ++++++++++++++++++++
```

## Thời gian vitest trước/sau

| | Thời gian | File / test |
|---|---|---|
| Trước (T002, lần 2) | 56,57 giây | 65 / 509 |
| Sau Story 1 | 34,08 giây (máy rảnh hơn lúc đo mốc) | 65 / 516 |
| Sau Story 2 | 62,75 giây (máy có tải hơn lúc đo Story 1) | 68 / 579 |

## Số liệu cuối

| Mục | Giá trị |
|---|---|
| Commit 1 | `88aad6a` `fix(search): bấm loa ở kết quả tìm kiếm chỉ phát âm, không chuyển trang` (13 file) |
| Commit 2 | `feat(005): bấm từ ở tìm kiếm nhảy tới đúng hàng trong trang bài` (15 file) |
| vitest cuối | 68 file, 579 test đạt (mốc đầu: 65 file, 509 test; +70 test: 7 ở Story 1, 63 ở Story 2) |
| e2e cuối | 47 đạt, 1 đỏ (Q-2 `browse.spec.ts`, có sẵn từ trước, `quality-gaps`) (mốc đầu: 34 đạt, 1 đỏ; +13 ca: 3 loa, 10 nhảy tới từ) |
| `npm run check` | xanh (568 cảnh báo nội dung như mốc); `npm run build` xanh |
| Không đổi | `tts.ts`, `speakable.ts`, `SpeakButton`, `search-index.ts`, registry, session, grading, pipeline, `content/**`, `public/content/**`, `schemaVersion`, `eslint.config.js`, `package.json` (kiểm bằng `git diff --cached` ở từng commit) |
| Quyết định còn mở | cuộn tức thì luôn (`behavior: 'instant'`) hay thêm nhánh cuộn mượt khi không bật giảm chuyển động |
| Hàng bộ lọc che | không chụp được ở nội dung thật (mặc định bộ lọc "Tất cả"); bao bằng test đơn vị |
