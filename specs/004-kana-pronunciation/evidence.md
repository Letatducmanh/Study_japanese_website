# Evidence: kana-pronunciation (spec 004)

Bằng chứng theo từng story: test đỏ trước khi sửa mã, test đặc trưng, kết quả xanh, số liệu. Ngày làm: 2026-11-12.

## Mốc trước

Nhánh `004-kana-pronunciation`, tách từ `staging` = `69fc5d8` (merge PR #3 của spec 003). `.specify/feature.json` trỏ `specs/004-kana-pronunciation`; `SPECIFY_FEATURE` trống. Mã của spec 003 có trong nhánh (`promptSpeak` ở `modes/mcq/types.ts`, `toSpeakable` ở `src/lib/speakable.ts`, `SpeakOptions.kind` ở `src/lib/tts.ts`).

| Số đo (chưa sửa mã) | Kết quả |
|---|---|
| `npx vitest run` | 61 file, 386 test, tất cả xanh; 52,88 giây (máy có tải nền) |
| `npm run build` + `npx playwright test` | 24 test: **23 đạt, 1 đỏ**. Đỏ duy nhất: Q-2 `tests/e2e/browse.spec.ts:3` "mở trang chủ → vào N5 → Minna no Nihongo 1 → Bài 1" (nợ từ spec 001) |
| `npm run content:validate` | OK, **568 cảnh báo** |
| Băm `public/content/**` (script tạm `.screens/hash-content.mjs`, bỏ `README.md`) | **45 file**, SHA-256 gộp `2deeab187c4f7f57777689b29fdb3ff5708a26a3dec30a02e6a4d99e6f8ca068` |

Ổn định của băm: chạy `npm run content:build` liên tiếp hai lần rồi băm → `2deeab18…`; chạy lần ba rồi băm lại → cùng giá trị, cùng 45 file. (Trước đó, phân tích ở bước analyze: hai lần `runContentPipeline` vào thư mục tạm cũng cho cùng băm, nội dung dựng không có trường thời gian.) Mốc này dùng cho T072.

`public/content/README.md` là file git theo dõi duy nhất ở đó nên bị bỏ khỏi băm.

## Cơ chế nạp JSON

(Áp dụng cho Story 4; chép từ `tasks.md`.)

- **Vite**: plugin `vite:json` có sẵn biến `.json` thành module ES; dùng **default import** (`import corrections from '../../content/overrides/speech-corrections.json'`). `npm run build` đưa file vào chunk chính. File nằm dưới gốc dự án nên dev server (`server.fs.strict`) cho phép đọc. Vitest dùng cùng bộ biến đổi. **Không sửa `vite.config.ts`.**
- **TypeScript** (6.0.3): `tsconfig.app.json` có `moduleResolution: "bundler"` nên `resolveJsonModule` bật mặc định; file JSON ngoài `include: ["src"]` vẫn được nạp khi có import. Thử ngày 2026-11-12: tạo tạm `content/overrides/__tmp.json` và `src/lib/__tmp.ts` import nó; `tsc -p tsconfig.app.json --noEmit` không lỗi; vitest import chạy được; đã xóa hai file tạm. **Không sửa `tsconfig.app.json`, `tsconfig.node.json`.**
- **`tsconfig.node.json`** (`module: nodenext`): không dính vì `speakable.ts` không import JSON (bảng truyền làm tham số) và test nội dung đọc file bằng `readFileSync` + `JSON.parse`.
- **Pipeline/validate không đụng**: `pipeline.ts` đọc đúng ba file yaml theo đường dẫn tường minh. Kiểm chứng bằng băm `public/content` và số cảnh báo `content:validate` (mốc ở trên) trước/sau (T072).

## Story 1: kết quả ĐỎ

Chạy trước khi sửa mã (`VocabTab.tsx`, `SearchPage.tsx`, `FlashcardComponent.tsx` chưa đổi):

`npx vitest run src/lib/speakable.test.ts src/features/browse src/features/practice/modes/flashcard scripts/content/speakable-content.test.ts` → **7 đỏ, 77 xanh** (84 test, 6 file; 3 file có đỏ).

| Test đỏ | Số | Thông báo ngắn |
|---|---|---|
| `VocabTab.test.tsx` — từ có kanji (`jin`, `nanji`, `hanami`, `fun`) | 4 | đọc `人`, `何時`, `花見`, `分` thay vì `じん`, `なんじ`, `はなみ`, `ふん` |
| `FlashcardComponent.test.tsx` — từ có kanji; từ có ký hiệu `～ふん / ～ぷん` | 2 | đọc `何分`, `分` thay vì `なんぷん`, `ふん` |
| `SearchPage.test.tsx` — kết quả có kanji (`何時`) | 1 | đọc `何時` thay vì `なんじ` |

`npm run build` rồi `npx playwright test tests/e2e/kana-speech.spec.ts` → **1 đỏ, 0 xanh**: ca "Từ vựng Bài 1: loa ở `～人` đọc `じん`": `__spoken` nhận `["人"]`.

Tổng bằng chứng ĐỎ: **8** (7 vitest + 1 e2e). Lý do đỏ đúng như dự kiến: ba nơi gọi còn truyền `kanji ?? kana`.

## Story 1: test đặc trưng `[đặc trưng]` (xanh ngay)

Xanh trước và sau, không phải bằng chứng đỏ.

- `src/lib/speakable.test.ts` (12): bảng FR-002 theo kana (`～じん`→`じん`, `～にん`, `なんじ`, `なん`, `なに`, `なんぷん`, `あのかた`, `このあいだ`, `[お]はなみ`→`はなみ`, `～ふん / ～ぷん`→`ふん`) và hai từ chỉ có kana đọc y như trước. Xanh ngay vì `toSpeakable(kana, 'word')` đã làm từ spec 003.
- `scripts/content/speakable-content.test.ts`, describe `kana-pronunciation (spec 004) › từ vựng` (12): mọi từ có chuỗi đọc không rỗng/không chữ Hán/không ký tự cấm; 10 cặp (kanji, kana) tra trong nội dung thật; dòng số liệu. Xanh ngay vì cùng lý do.
- `VocabTab.test.tsx` (2), `FlashcardComponent.test.tsx` (2), `SearchPage.test.tsx` (2): từ chỉ có kana đọc đúng kana; chữ hiển thị không đổi (`～人`, `何時`, `[お]花見`, `～分`; mặt thẻ vẫn kana, không hiện `何分`).

Tổng: 30 test xanh ngay. Không có test nào thuộc nhóm "dự kiến đỏ" mà xanh ngay.

## Story 1: kết quả XANH

Sau khi sửa ba dòng (`VocabTab.tsx:131`, `SearchPage.tsx:74`, `FlashcardComponent.tsx:104`, mỗi dòng `kanji ?? kana` → `kana`):

| Số đo | Trước (mốc) | Sau |
|---|---|---|
| Lệnh Story 1 (`speakable.test.ts`, `browse`, `flashcard`, `speakable-content.test.ts`) | 7 đỏ / 77 xanh | **84/84 xanh** |
| `npx vitest run` toàn bộ | 61 file, 386 test | **63 file, 423 test, tất cả xanh** (thêm 2 file `VocabTab.test.tsx`, `FlashcardComponent.test.tsx` và 37 test: 12 + 12 + 6 + 4 + 3) |
| `npm run build` + `npx playwright test` toàn bộ | 24 test: 23 đạt, 1 đỏ | **25 test: 24 đạt, 1 đỏ**; đỏ duy nhất vẫn là Q-2 `browse.spec.ts:3`; ca mới `kana-speech.spec.ts` xanh |
| `npm run check` (thẳng) | — | **xanh, exit 0**: `content:validate` OK 568 cảnh báo (bằng mốc), `tsc -b`, `eslint .`, vitest 63 file / 423 test |
| `npm run build` | — | **xanh**; JS 610,68 kB, **186,16 kB gzip** (dưới ngân sách 200 kB; mốc 186,16 kB) |

Dòng số liệu của test nội dung (chạy riêng với `--silent=false`):

```
[kana-speech] từ vựng: 1295/1295 có chuỗi đọc hợp lệ; có kanji: 960
```

Kiểm FR-012 và "không còn `kanji ?? kana` ở nơi giao cho Story 1":

```
grep -rnE "SpeechSynthesisUtterance|speechSynthesis" src --include=*.ts --include=*.tsx | grep -vE "\.test\.tsx?:" | grep -vE "^src/(lib/tts|test/setup)\.ts:"
```

Kết quả: **rỗng (0 dòng)**.

```
grep -rnE "kanji \?\? (item|r)\.kana" src/features/browse src/features/practice/modes/flashcard --include=*.tsx | grep -E "SpeakButton|speak"
```

Kết quả: **rỗng (0 dòng)**. (Các dòng `Ruby base={item.kanji ?? item.kana}` chỉ để hiển thị nên không bị tính; chữ hiển thị không đổi.)

SC-004: không đổi ở story này (chỉ đổi chuỗi truyền vào ở danh sách, tìm kiếm, flashcard; chính tả nghe chưa đụng); lập luận đầy đủ ở Story 2 và Story 4.

Ghi chú: `console.info` của test nội dung không hiện khi chạy `npx vitest run` mặc định, nhưng hiện khi thêm `--silent=false`.

## Story 2: kết quả ĐỎ

Chạy trước khi sửa mã (`types.ts`, `index.ts`, `McqComponent.tsx`, `DictationComponent.tsx` chưa đổi):

`npx vitest run src/features/practice/modes/mcq src/features/practice/modes/dictation` → **12 đỏ, 36 xanh** (48 test, 3 file, cả 3 file có đỏ).

| Test đỏ | Số | Thông báo ngắn |
|---|---|---|
| `dictation.test.tsx` — (a) tự đọc lúc mở, (b) "nghe lại" với `何時` / `なんじ` | 2 | đọc `何時` thay vì `なんじ` |
| `mcq.test.ts` — `promptSpeech` của `mcqJpVi`, `mcqKanjiReading` | 2 | `promptSpeech` là `undefined`, kỳ vọng `たべます` |
| `mcq.test.ts` — `mcqListenVi › promptAudio` (test cũ, **kỳ vọng sửa có chủ ý** `食べます` → `たべます`) và test mới `promptAudio là kana của từ` | 2 | `promptAudio` còn là `食べます` |
| `McqComponent.test.tsx` — **ba kỳ vọng cũ sửa có chủ ý** (xem dưới) | 3 | đọc `食べます` thay vì `たべます` |
| `McqComponent.test.tsx` — "Nghe lại" của `mcq-listen-vi` đọc kana | 1 | đọc `食べます` |
| `McqComponent.test.tsx` — câu dựng tay có `promptSpeech` (nút loa đọc `たべます`) | 1 | đọc `食べます` (bỏ qua `promptSpeech`) |
| `McqComponent.test.tsx` — `promptSpeech` thắng `promptAudio` | 1 | đọc `x` (lấy `promptAudio`) |

**Kỳ vọng cũ được sửa có chủ ý (không phải "test đỏ lại xanh"; đổi hành vi theo FR-005):**

1. `McqComponent.test.tsx` `mcq-kanji-reading … sau khi chọn đọc chữ kanji của đề`: `['食べます']` → `['たべます']`; đổi tên thành "… đọc kana của từ".
2. `McqComponent.test.tsx` `mcq-jp-vi có nút loa ở đề, đọc chữ của đề`: `['食べます']` → `['たべます']`; đổi tên thành "… đọc kana của từ" và bỏ nhãn `[đặc trưng]` (không còn bảo toàn hành vi cũ).
3. `McqComponent.test.tsx` `mcq-listen-vi: … tự đọc khi mở`: `['食べます']` → `['たべます']`; đổi tên thành "… tự đọc kana khi mở" và bỏ nhãn `[đặc trưng]`.
4. `mcq.test.ts` `mcqListenVi › không có promptText, chỉ có promptAudio để đọc`: `promptAudio` `食べます` → `たべます`.

Số khẳng định cũ đổi: 3 ở `McqComponent.test.tsx`, 1 ở `mcq.test.ts`.

`npm run build` **đỏ ở bước `tsc -b`** trước khi sửa mã: ba test mới dùng `promptSpeech`, chưa có trong `McqQuestion` (`TS2339`/`TS2353` ở `mcq.test.ts` và `McqComponent.test.tsx`). Đây là hệ quả đúng của TDD (kiểu chưa có), không phải lỗi môi trường; bước `vite build` không chạy nên `dist/` vẫn là bản build của Commit 1 (cùng hành vi mã trước Story 2), và e2e bên dưới chạy trên bản đó.

`npx playwright test tests/e2e/kana-speech.spec.ts` → **4 đỏ, 1 xanh** (ca Story 1 `～人` vẫn xanh):

| Ca e2e (bài 5) | Kết quả | Thông báo |
|---|---|---|
| Chính tả nghe: chuỗi tự đọc là kana | đỏ | `"去年" còn chữ Hán` |
| Nghe → Nghĩa: tự đọc lúc mở là kana | đỏ | `"新幹線" còn chữ Hán` |
| Nhật → Nghĩa: mở câu không tự đọc; nút loa đọc kana | đỏ | `"1日" còn chữ Hán` (phần "`__spoken` rỗng lúc mở" đã qua) |
| Kanji → Cách đọc: ẩn loa trước khi chọn; sau khi chọn đọc kana | đỏ | `"何年" còn chữ Hán` (phần "ẩn loa trước khi chọn" đã qua) |

Tổng bằng chứng ĐỎ Story 2: **16** (12 vitest + 4 e2e). Không có test nào thuộc nhóm dự kiến đỏ mà xanh ngay.

## Story 2: test đặc trưng `[đặc trưng]` (xanh ngay)

Xanh trước và sau, không phải bằng chứng đỏ.

Xanh trước và sau, không phải bằng chứng đỏ.

- `dictation.test.tsx` (7): (c) `grade()` không đổi cho `何時` / `なんじ` (gõ `なんじ` đúng, gõ `いつ` sai, `expected` là `item.kana`); (d) bảng 6 ca cố định khẳng định cả `correct` lẫn `expected` (`[お]みやげ`, `ぎゅうにゅう / ミルク`, `～じん`, `なんじ`, `[お]はなみ`, `～ふん / ～ぷん`; mỗi ca có các lần gõ đúng, gõ sai và gõ kanji → `false` như `tasks.md` T026 (d)). Cả 6 ca xanh ngay, kể cả mọi ca "gõ kanji → false", nên không có khẳng định nào phải dừng hỏi.
- `mcq.test.ts` (4): `promptSpeech` là `undefined` ở `mcq-kana-kanji`, `mcq-vi-jp`, `mcq-vi-kanji`, `mcq-listen-vi`.
- `McqComponent.test.tsx` (3): đề `mcq-jp-vi` vẫn hiển thị `食べます`; `mcq-jp-vi` không tự đọc khi mở; không có `promptSpeech` thì nút loa rơi về `promptText` (`食べます`).
- Các test cũ giữ nguyên và vẫn xanh: ba test `grade`/chính tả cũ ở `dictation.test.tsx`, mọi test `grade()` và `promptSpeak` ở `mcq.test.ts`, và ở `McqComponent.test.tsx`: `mcq-vi-jp`/`mcq-vi-kanji` không có loa, `mcq-kana-kanji` có loa, `mcq-jp-vi` không tự đọc, chọn đáp án không đổi `grade()`, ca E2 `[お]土産` → `土産`, `mcq-kanji-reading` ẩn loa trước khi chọn.
- e2e: hai khẳng định "`__spoken` rỗng lúc mở" (Nhật → Nghĩa) và "ẩn loa trước khi chọn" (Kanji → Cách đọc) đã qua trước khi ca đỏ ở khẳng định chữ Hán.

Tổng: 14 test vitest mới xanh ngay (7 + 4 + 3). Không có test nào thuộc nhóm "dự kiến đỏ" mà xanh ngay.

## Story 2: kết quả XANH

Sau khi sửa mã trong đúng hai thư mục `src/features/practice/modes/mcq/` (`types.ts`, `index.ts`, `McqComponent.tsx`) và `dictation/` (`DictationComponent.tsx`):

| Số đo | Trước | Sau |
|---|---|---|
| Lệnh Story 2 (`mcq`, `dictation`) | 12 đỏ / 36 xanh (48 test) | **48/48 xanh** |
| `npx vitest run` toàn bộ | 63 file, 423 test (mốc sau Commit 1) | **63 file, 445 test, tất cả xanh** (thêm 22 test: dictation 9, `mcq.test.ts` 7, `McqComponent.test.tsx` 6) |
| `npm run build` + `npx playwright test` toàn bộ | 25 test: 24 đạt, 1 đỏ (mốc sau Commit 1) | **29 test: 28 đạt, 1 đỏ**; đỏ duy nhất vẫn là Q-2 `browse.spec.ts:3`; 4 ca mới của `kana-speech.spec.ts` xanh |
| `npm run check` (thẳng) | — | **xanh, exit 0** ở lần thứ hai (xem ghi chú), `content:validate` OK **568 cảnh báo** (bằng mốc), `tsc -b`, `eslint .`, vitest 63 file / 445 test |
| `npm run build` | `tsc -b` đỏ trước khi sửa mã (thiếu `promptSpeech`) | **xanh**; JS 610,71 kB, **186,19 kB gzip** (dưới ngân sách 200 kB; Commit 1: 186,16 kB) |
| Băm `public/content` (45 file, bỏ `README.md`) | `2deeab18…ca068` | `2deeab187c4f7f57777689b29fdb3ff5708a26a3dec30a02e6a4d99e6f8ca068` (**giống hệt mốc**) |

**Ghi chú về `npm run check`:** lần chạy đầu đỏ 1 test (`WeaknessPage.lessons.test.tsx` › "A: chỉ làm Bài 3 và Bài 5 …", hết giờ mặc định 5 giây lúc máy bận). Đây là một trong 5 test cũ dễ hết giờ đã ghi ở `specs/003-speakable-text/evidence.md` (nợ ngoài phạm vi). Chạy riêng file đó: 5/5 xanh (4,10 giây). Chạy lại `npm run check` thẳng: xanh (exit 0). Không phải đỏ hai lần liên tiếp nên không dừng; không tăng timeout, không sửa test đó.

**Một test cũ phải đổi cách dựng (không đổi khẳng định):** `McqComponent.test.tsx` ca E2 `[đặc trưng] E2: đề hiển thị chữ thô "[お]土産" …` dựng câu bằng `{ ...mcqJpVi.generate(...), promptText: '[お]土産', … }`. Vì `generate` nay trả thêm `promptSpeech: 'たべます'`, câu dựng tay thừa hưởng trường này nên nút loa đọc `たべます`. Đã thêm `promptSpeech: undefined` vào phần dựng câu để mô tả đúng "câu không có `promptSpeech` rơi về `promptText`"; khẳng định (`['土産']`) giữ nguyên và xanh. Mã không sai: đây là hệ quả của việc câu thật nay có `promptSpeech`.

Kiểm bảo toàn và FR-012 (T037):

```
$ grep -rnE "SpeechSynthesisUtterance|speechSynthesis" src --include=*.ts --include=*.tsx | grep -vE "\.test\.tsx?:" | grep -vE "^src/(lib/tts|test/setup)\.ts:"
(rỗng, 0 dòng)

$ grep -rnE "kanji \?\? (q\.item\.|item\.|r\.)?kana" src/features --include=*.tsx --include=*.ts | grep -E "Speak|speak"
(rỗng, 0 dòng)

$ grep -n "audio:.*kanji" src/features/practice/modes/mcq/index.ts
(rỗng, 0 dòng)

$ git diff src/features/practice/modes/dictation/index.ts | wc -l
0

$ git diff -U0 src/features/practice/modes/mcq/index.ts | grep "^@@"
@@ -27,0 +28 @@ interface DirectionConfig {
@@ -68,0 +70 @@ function createMcqDirection(
@@ -97,0 +100 @@ export const mcqJpVi = createMcqDirection({
@@ -123,0 +127 @@ export const mcqKanjiReading = createMcqDirection({
@@ -145 +149 @@ export const mcqListenVi = createMcqDirection({
```

Hàm `grade` của `mcq/index.ts` nằm ở dòng 76–86; không hunk nào rơi vào đó (các hunk ở dòng 28, 70, 100, 127, 149). `git diff src/features/practice/modes/dictation/index.ts` rỗng (0 dòng): chấm điểm chính tả nghe không đổi. Chữ hiển thị: các test hiển thị ở `McqComponent.test.tsx` (đề `mcq-jp-vi` vẫn là `食べます`, câu dựng tay hiển thị `食べます`) xanh.

**Lập luận cấu trúc cho SC-004 (chấm điểm chính tả nghe không đổi cho mọi từ):**

1. `src/features/practice/modes/dictation/index.ts` không đổi (`git diff` rỗng), nên `grade`, `gradeTyped(given, question.item.answers.kana)` và `expected` (`item.kana`) không đổi.
2. `answers.*` do pipeline sinh; pipeline và nội dung không đổi (băm `public/content` giống hệt mốc, bảng trên; kiểm lại ở T072).
3. Không viết được test theo từng từ trong `scripts/` vì `src/domain/quiz/grading.ts` import `@/lib/kana` (bí danh `@/` không chạy dưới `tsconfig.node.json`).
4. Thay vào đó có bảng 6 ca cố định ở `dictation.test.tsx` (`[đặc trưng] (d)`), khẳng định cả `correct` lẫn `expected` (xanh trước và sau khi sửa mã).

## Story 3: kết quả ĐỎ

Chạy trước khi sửa mã (`speakable.ts` chưa có `exampleWordSpeech`/`kanjiCharSpeech`; `KanjiPage.tsx` chưa đổi):

`npx vitest run src/lib/speakable.test.ts src/features/browse/KanjiPage.test.tsx scripts/content/speakable-content.test.ts` → **40 đỏ, 68 xanh** (108 test, 3 file, cả 3 file có đỏ).

| Test đỏ | Số | Thông báo ngắn |
|---|---|---|
| `speakable.test.ts` — `exampleWordSpeech` (7 ca: `ひとり`, `じゅっぷん, じっぷん`, `なに, なん`, khoảng trắng quanh dấu phẩy, rỗng, `, `, ` , ,`) | 7 | `exampleWordSpeech is not a function` |
| `speakable.test.ts` — `kanjiCharSpeech` (tám chữ thật + không có Kun + không có On + cả hai rỗng + Kun đầu có đuôi riêng + không lấy "Kun đầu tiên có ・") | 13 | `kanjiCharSpeech is not a function` |
| `KanjiPage.test.tsx` — loa chữ đơn `一` (đọc `一` thay vì `イチ、ひとつ`); loa ví dụ `一人`, `十分`, `何` (đọc chữ thay vì `ひとり`, `じゅっぷん`, `なに`) | 4 | đọc chữ Hán |
| `speakable-content.test.ts › Kanji` — mọi chữ đơn, mọi ví dụ, tám chữ thật, 畑/午, ba ví dụ thật, đúng 11 chữ mở rộng, dòng số liệu | 16 | `is not a function` (hàm thiếu) |

`npm run build` **đỏ ở bước `tsc -b`** trước khi sửa mã: `TS2305` thiếu `exampleWordSpeech`/`kanjiCharSpeech` ở `speakable.test.ts` và `speakable-content.test.ts`. Hệ quả đúng của TDD; `vite build` không chạy nên `dist/` vẫn là bản của Commit 2 (cùng hành vi mã trước Story 3), và e2e bên dưới chạy trên bản đó.

`npx playwright test tests/e2e/kana-speech.spec.ts` → **5 đỏ, 5 xanh** (năm ca Story 1 và 2 vẫn xanh). Cả năm ca Kanji đỏ ở khẳng định chuỗi đọc (trang đã mở và nút loa đã bấm được):

| Ca e2e | Kết quả |
|---|---|
| `/kanji/一`: loa chữ đơn → `イチ、ひとつ`; ví dụ `一人` → `ひとり` | đỏ (đọc `一`) |
| `/kanji/十`: ví dụ `十分` → `じゅっぷん` | đỏ (đọc `十分`) |
| `/kanji/何`: ví dụ `何` → `なに` | đỏ (đọc `何`) |
| `/kanji/上`: loa chữ đơn → `ジョウ、うえ` | đỏ (đọc `上`) |
| `/kanji/行`: loa chữ đơn → `コウ、いく` | đỏ (đọc `行`) |

Tổng bằng chứng ĐỎ Story 3: **45** (40 vitest + 5 e2e). Không có test nào thuộc nhóm dự kiến đỏ mà xanh ngay.

Ghi chú về dựng test: lần đầu `KanjiPage.test.tsx` import `vi as vitestVi` nên `vi.mock` không được đưa lên đầu file và trang báo lỗi tải dữ liệu (cả 6 đỏ vì lý do sai). Đã đổi sang import `vi` trực tiếp (như `BookPage.test.tsx`) trước khi ghi bằng chứng ĐỎ ở trên; các số liệu trong bảng là của lần chạy sau khi sửa lỗi dựng test, trước khi sửa mã.

## Story 3: test đặc trưng `[đặc trưng]` (xanh ngay)

Xanh trước và sau, không phải bằng chứng đỏ.

Xanh trước và sau, không phải bằng chứng đỏ.

- `KanjiPage.test.tsx` (2): số nút loa không đổi (1 cho chữ đơn + 1 cho mỗi ví dụ = 4); chữ hiển thị không đổi (`一`, `一人`, `十分`, `何`, Kun `ひと、ひと・つ` còn dấu "・", On `イチ、イツ`).
- Các test cũ ở `speakable.test.ts` (toàn bộ `toSpeakable`, kể cả 12 ca kana của Story 1) và ở `speakable-content.test.ts` (kể cả toàn bộ phần từ vựng của spec 004) giữ nguyên và vẫn xanh.
- e2e: năm ca Story 1–2 vẫn xanh.

Tổng: 2 test vitest mới xanh ngay. Không có test nào thuộc nhóm "dự kiến đỏ" mà xanh ngay.

## Story 3: kết quả XANH

Sau khi sửa mã: `src/lib/speakable.ts` (thêm `exampleWordSpeech`, `kanjiCharSpeech`; vẫn thuần, không import) và `src/features/browse/KanjiPage.tsx` (hai nút loa: chữ đơn `kanjiCharSpeech(item.on, item.kun)`, ví dụ `exampleWordSpeech(example.reading)`; phần hiển thị không đổi).

| Số đo | Trước | Sau |
|---|---|---|
| Lệnh Story 3 (`speakable.test.ts`, `KanjiPage.test.tsx`, `speakable-content.test.ts`) | 40 đỏ / 68 xanh (108 test) | **108/108 xanh** |
| `npx vitest run` toàn bộ | 63 file, 445 test (mốc sau Commit 2) | **64 file, 487 test, tất cả xanh** (thêm 1 file `KanjiPage.test.tsx` và 42 test: `speakable.test.ts` 20, `KanjiPage.test.tsx` 6, `speakable-content.test.ts` 16) |
| `npm run build` + `npx playwright test` toàn bộ | 29 test: 28 đạt, 1 đỏ (mốc sau Commit 2) | **34 test: 33 đạt, 1 đỏ**; đỏ duy nhất vẫn là Q-2 `browse.spec.ts:3`; 5 ca Kanji mới của `kana-speech.spec.ts` xanh |
| `npm run build` | `tsc -b` đỏ trước khi sửa mã (thiếu hai hàm) | **xanh**; JS 610,97 kB, **186,30 kB gzip** (dưới ngân sách 200 kB; Commit 2: 186,19 kB) |

Dòng số liệu của test nội dung (chạy riêng với `--silent=false`):

```
[kana-speech] Kanji: 134 chữ, 657 ví dụ, 11 chữ mở rộng
```

Đúng kỳ vọng (134 chữ, 657 ví dụ, 11 chữ mở rộng = 白, 一 đến 九, 大). Tám chữ thật (一, 二, 白, 人, 上, 大, 行, 食) ra đúng `イチ、ひとつ`, `ニ、ふたつ`, `ハク、しろい`, `ジン、ひと`, `ジョウ、うえ` (không phải `あげる`), `ダイ、おおきい`, `コウ、いく`, `ショク、たべる`; 畑 chỉ Kun đầu, 午 chỉ `ゴ`; ví dụ `十分` → `じゅっぷん`, `何` → `なに`, `一人` → `ひとり`. Không khẳng định nào phải sửa cho khớp dữ liệu.

Kiểm bảo toàn và FR-012 (T054):

```
$ grep -rnE "SpeechSynthesisUtterance|speechSynthesis" src --include=*.ts --include=*.tsx | grep -vE "\.test\.tsx?:" | grep -vE "^src/(lib/tts|test/setup)\.ts:"
(rỗng, 0 dòng)

$ grep -rnE "kanji \?\? (q\.item\.|item\.|r\.)?kana" src/features --include=*.tsx --include=*.ts | grep -E "Speak|speak"
(rỗng, 0 dòng)

$ grep -rnE "SpeakButton text=\{(item\.char|example\.word)\}" src/features/browse
(rỗng, 0 dòng)
```

**Ghi chú về `npm run check` (ba lần, chạy thẳng):**

| Lần | Kết quả | Ghi chú |
|---|---|---|
| 1 | đỏ (exit 1) | 4 test hết giờ 5 giây (`parse-grammar`, `parse-vocab`, `enrich`, `WeaknessPage.lessons` A) khi máy bận |
| 2 | đỏ (exit 1) | 4 test hết giờ 5 giây (`parse-grammar` ×2, `enrich`, `WeaknessPage.lessons` A) khi máy bận |
| 3 | **xanh (exit 0)** | chạy một mình khi máy rảnh (đã tắt `npm run dev`, đóng trình duyệt, không chạy gì song song): `content:validate` OK 568 cảnh báo, `tsc -b`, `eslint .`, vitest 64 file / 487 test, 40,35 giây |

Cả hai lần đỏ chỉ do đúng nhóm 5 test cũ dễ hết giờ mặc định 5 giây (nợ đã ghi ở `specs/003-speakable-text/evidence.md`), không có test nào khác đỏ; `content:validate`, `tsc -b`, `eslint .` xanh cả hai lần. Chạy riêng 4 file đó: 25/25 xanh trong 10,5 giây. Chủ dự án chọn chạy lại khi máy rảnh; lần 3 xanh. Không sửa test cũ, không nâng timeout.

**SC-004:** không đổi ở story này (chỉ thêm hai hàm Kanji và đổi chuỗi ở trang Kanji); lập luận đầy đủ ở Story 2 và Story 4.

## Story 4: kết quả ĐỎ

Chạy trước khi sửa mã (`speakable.ts` chưa nhận tham số thứ ba; `tts.ts` chưa nạp bảng; file `content/overrides/speech-corrections.json` chưa có):

`npx vitest run src/lib scripts/content/speakable-content.test.ts src/features/browse/GrammarTab.test.tsx` → **11 đỏ, 146 xanh** (157 test, 10 file, 4 file có đỏ).

| Test đỏ | Số | Thông báo ngắn |
|---|---|---|
| `speakable.test.ts` — (a) câu `あの 方` → `あの かた`; (b) mục thử `AB` → `x` áp cho mọi câu chứa cụm; (c) một lượt không áp chồng; (d) mục dài khớp trước mục ngắn | 4 | tham số bảng bị bỏ qua, chuỗi không đổi |
| `speakable.test.ts` — (e2) mục `match` rỗng bị bỏ qua nhưng mục `AB` → `y` cạnh nó vẫn áp (**ca đỏ thật bổ sung, xem dưới**) | 1 | nhận `AB`, kỳ vọng `y` |
| `tts.test.ts` — câu `あの 方…` (kind `sentence`) đọc `あの かた…` theo bảng thật | 1 | đọc `あの 方…` |
| `GrammarTab.test.tsx` — loa ở ví dụ `あの 方…` | 1 | đọc `あの 方は…` |
| `speakable-content.test.ts › bảng sửa cách đọc` (FR-010; mỗi `match` khớp câu thật; câu đổi khi và chỉ khi chứa `match`; dòng số liệu) | 4 | `ENOENT` (chưa có file JSON) |

Đỏ do thiếu file JSON ở nhóm cuối là chủ ý: file chỉ được tạo sau khi thấy đỏ (T068), và `toSpeakable` có tham số bảng chỉ được viết sau (T069).

`npm run build` **đỏ ở bước `tsc -b`** trước khi sửa mã: `TS2554` (`Expected 1-2 arguments, but got 3`) ở `speakable.test.ts` (13 chỗ) và `speakable-content.test.ts` (3 chỗ). Hệ quả đúng của TDD; `vite build` không chạy nên `dist/` vẫn là bản của Commit 3, và e2e bên dưới chạy trên bản đó.

`npx playwright test tests/e2e/kana-speech.spec.ts` → **1 đỏ, 10 xanh**: ca `Ngữ pháp Bài 1: câu "あの 方" được đọc là "あの かた", chữ hiển thị không đổi` đỏ vì `__spoken` nhận `["あの 方は どなたですか。 ワット先生です。"]`.

Tổng bằng chứng ĐỎ Story 4: **12** (11 vitest + 1 e2e).

**Lệch có chủ ý so với `tasks.md` (T062 (e)):** bản đầu của `tasks.md` ghi (e) "mục có `match` rỗng bị bỏ qua" là dự kiến ĐỎ, nhưng khi chạy thật nó **xanh ngay**. Lý do: `toSpeakable` chưa nhận tham số thứ ba nên bảng toàn mục rỗng không đổi gì, khẳng định "không đổi chuỗi" đúng sẵn và chưa chứng minh được mã mới bỏ qua mục rỗng. Theo luật dừng và hỏi, đã dừng báo chủ dự án; chủ dự án chọn (ngày 2026-11-16): giữ (e) là `[đặc trưng]` (xanh trước và sau), sửa T062 trong `tasks.md`, và thêm ca (e2) đỏ thật `[{ match: '', speak: 'x' }, { match: 'AB', speak: 'y' }]` trên `AB` → `y`, thấy ĐỎ ở trên và sẽ XANH sau khi sửa mã.

## Story 4: test đặc trưng `[đặc trưng]` (xanh ngay)

Xanh trước và sau, không phải bằng chứng đỏ.

Xanh trước và sau, không phải bằng chứng đỏ.

- `speakable.test.ts` (7 ca, tính cả ba mục của `it.each` ở (i)): (e) mục `match` rỗng bị bỏ qua (**xanh ngay do lệch có chủ ý nói ở trên, không phải bằng chứng đỏ**); (f) bảng rỗng và không truyền bảng giống hệt nhau; (g) `あの方は…` viết liền không khớp mục `あの 方`; (h) kind `word` bỏ qua bảng; (i) `４人です。`, `６月13日です。`, `ミラーさんは アメリカ人ですか。` không đổi dù có bảng thử.
- `tts.test.ts` (2): cùng chuỗi `あの 方…` với kind mặc định `word` không đổi cụm; câu không chứa cụm đọc như trước.
- `GrammarTab.test.tsx` (2): ví dụ `ミラーさん…` đọc như trước; chữ hiển thị không đổi (còn `あの 方は`).
- e2e: mười ca Story 1–3 vẫn xanh.

Không có test nào khác thuộc nhóm "dự kiến đỏ" mà xanh ngay.

## Story 4: kết quả XANH

Sau khi sửa mã và thêm dữ liệu:

- `content/overrides/speech-corrections.json` (file DUY NHẤT thêm dưới `content/`): một mục `{ "match": "あの 方", "speak": "あの かた", "note": "…" }` (lý do bằng tiếng Việt).
- `src/lib/speakable.ts`: `SpeechCorrection`, tham số thứ ba `corrections` của `toSpeakable` (chỉ áp cho `sentence`, trước mọi quy tắc khác, một lượt bằng một biểu thức chính quy, mục dài trước, bỏ qua `match` rỗng); vẫn thuần, không import JSON.
- `src/lib/tts.ts` (tại chỗ, không dời): `import corrections from '../../content/overrides/speech-corrections.json'` (default import) và truyền `corrections.sentence` khi `kind === 'sentence'`.
- Không sửa `tsconfig.app.json`, `tsconfig.node.json`, `vite.config.ts`, pipeline, validate, `SpeakButton.tsx`, `GrammarTab.tsx`.

| Số đo | Trước | Sau |
|---|---|---|
| Lệnh Story 4 (`src/lib`, `speakable-content.test.ts`, `GrammarTab.test.tsx`) | 11 đỏ / 146 xanh (157 test) | **157/157 xanh** (cả ca (e2) đỏ thật đã xanh) |
| `npx vitest run` toàn bộ | 64 file, 487 test (mốc sau Commit 3) | **65 file, 509 test, tất cả xanh** (thêm 1 file `GrammarTab.test.tsx` và 22 test) |
| `npm run build` + `npx playwright test` toàn bộ | 34 test: 33 đạt, 1 đỏ (mốc sau Commit 3) | **35 test: 34 đạt, 1 đỏ**; đỏ duy nhất vẫn là Q-2 `browse.spec.ts:3`; ca `あの 方` mới xanh |
| `npm run check` (thẳng) | — | **xanh, exit 0 ngay lần đầu**: `content:validate` OK **568 cảnh báo**, `tsc -b`, `eslint .` (không đỏ vì luật lớp, không cần ngoại lệ), vitest 65 file / 509 test (37,02 giây) |
| `npm run build` | `tsc -b` đỏ trước khi sửa mã (`TS2554`) | **xanh**; JS 611,58 kB, **186,53 kB gzip** (dưới ngân sách 200 kB; mốc 186,16 kB) |

Dòng số liệu của test nội dung (chạy riêng với `--silent=false`):

```
[kana-speech] bảng sửa: 1 mục, 1/292 câu bị đổi
```

Câu bị đổi duy nhất: `mnn1-l01-g-31547a22#0` → `あの かたは どなたですか。 ワット先生です。`.

**T072: không đụng pipeline và nội dung (cơ chế nạp JSON với file thật):**

```
$ npm run content:validate
[content:validate] OK — 568 cảnh báo.            (mốc: 568)

$ npm run content:build
[content:build] Xong — 568 cảnh báo, xem content-report.md

$ node .screens/hash-content.mjs        (bỏ public/content/README.md)
{"files":45,"hash":"2deeab187c4f7f57777689b29fdb3ff5708a26a3dec30a02e6a4d99e6f8ca068"}
```

Số cảnh báo (568) và băm gộp 45 file `2deeab187c4f7f57777689b29fdb3ff5708a26a3dec30a02e6a4d99e6f8ca068` **giống hệt mốc** lập ở T004: file mới không ảnh hưởng nội dung dựng. Cơ chế nạp JSON: `npm run build` xanh và `tsc -b` xanh không sửa tsconfig, `vite.config.ts`; `eslint .` xanh.

**T073:** ba lệnh `grep` (FR-012 chỉ-`tts.ts`; `kanji ?? kana` cho giọng đọc; `SpeakButton text={item.char|example.word}`) đều **rỗng (0 dòng)**: mọi `speakJapanese`/`SpeakButton` ở `src/features` vẫn đi qua `src/lib/tts.ts`.

**T074:** trang nghe thử 20 câu dựng lại bằng **mã thật** (`toSpeakable(s.jp, 'sentence', bảng.sentence)`, bảng đọc bằng `readFileSync` + `JSON.parse` từ `content/overrides/speech-corrections.json`): `d:\Projects\project japanese\Source code\Code\.screens\tts-sentences-004.html` (20 câu; một câu bị bảng đổi: `mnn1-l01-g-31547a22#0`). `git status` không liệt kê file nào dưới `.screens/` (đã gitignore). Script tạm `.screens/make-sentences-004.mts` không commit.

**Lập luận cấu trúc cho SC-004 (chấm điểm chính tả nghe không đổi cho mọi từ, 1.295 từ):**

1. `src/features/practice/modes/dictation/index.ts` không đổi trong cả bốn commit (`git diff staging..HEAD -- src/features/practice/modes/dictation/index.ts` rỗng), nên `grade`, `gradeTyped(given, question.item.answers.kana)` và `expected` (`item.kana`) không đổi.
2. `answers.*` do pipeline sinh; pipeline và nội dung không đổi: băm `public/content` giữ nguyên (T072) và số cảnh báo giữ 568, cho cả 1.295 từ.
3. Không viết được test theo từng từ trong `scripts/` vì `src/domain/quiz/grading.ts` import `@/lib/kana` (bí danh `@/` không chạy dưới `tsconfig.node.json`).
4. Thay vào đó có bảng 6 ca cố định ở `dictation.test.tsx` (`[đặc trưng] (d)`), khẳng định cả `correct` lẫn `expected`.

**Ghi chú về `npm run check` ở Story 4:** chạy một lần, xanh ngay (máy rảnh: Mạnh đã tắt `npm run dev` và đóng trình duyệt), không có test cũ nào hết giờ.

## Kiểm vùng cấm

### Commit 1 (trước khi commit)

```
$ git diff --cached staging --name-only | grep -vxF "scripts/content/speakable-content.test.ts" | grep -E "domain/quiz/(registry|grading)|session|scripts/content|^content/|^public/content" || echo "OK: không đụng vùng cấm"
OK: không đụng vùng cấm

$ git diff --cached staging -U0 | grep -E "^[+-].*schemaVersion" || echo "OK: không đụng schemaVersion"
(thô: 8 dòng khớp, TẤT CẢ nằm trong tài liệu `specs/004-kana-pronunciation/*.md` là chữ "schemaVersion" trong lời văn và trong chính câu lệnh; xem lệnh loại trừ bên dưới)
$ git diff --cached staging --name-status | grep -E "^(R|D)" || echo OK
OK

$ git diff --cached staging --stat
 docs/SPECKIT_ROADMAP.md                            |  21 +-
 scripts/content/speakable-content.test.ts          |  63 ++++
 .../checklists/requirements.md                     |  37 +++
 .../contracts/speech-contract.md                   |  92 ++++++
 specs/004-kana-pronunciation/data-model.md         |  65 +++++
 specs/004-kana-pronunciation/evidence.md           | 151 ++++++++++
 specs/004-kana-pronunciation/plan.md               | 221 ++++++++++++++
 specs/004-kana-pronunciation/quickstart.md         |  67 +++++
 specs/004-kana-pronunciation/research.md           | 116 ++++++++
 specs/004-kana-pronunciation/spec.md               | 217 ++++++++++++++
 specs/004-kana-pronunciation/tasks.md              | 316 +++++++++++++++++++++
 src/features/browse/SearchPage.test.tsx            |  88 ++++++
 src/features/browse/SearchPage.tsx                 |   2 +-
 src/features/browse/VocabTab.test.tsx              | 119 ++++++++
 src/features/browse/VocabTab.tsx                   |   2 +-
 .../modes/flashcard/FlashcardComponent.test.tsx    |  90 ++++++
 .../modes/flashcard/FlashcardComponent.tsx         |   2 +-
 src/lib/speakable.test.ts                          |  23 ++
 tests/e2e/kana-speech.spec.ts                      |  48 ++++
 19 files changed, 1729 insertions(+), 11 deletions(-)
```

Lệnh `schemaVersion` bản thô khớp chữ "schemaVersion" trong các file tài liệu `specs/004-kana-pronunciation/` (spec, plan, data-model, tasks nói rằng feature KHÔNG đụng nó; lệnh này tự khớp vào chính câu lệnh được chép trong `tasks.md`). Đây là khớp dương tính giả của lệnh trong `tasks.md`, không phải thay đổi nào về schema. Chạy lại loại trừ thư mục tài liệu spec:

```
$ git diff --cached staging -U0 -- . ':(exclude)specs/004-kana-pronunciation' | grep -E "^[+-].*schemaVersion" || echo "OK: không đụng schemaVersion (ngoài tài liệu specs/004)"
OK: không đụng schemaVersion (ngoài tài liệu specs/004)
```

Kết luận: không file nào ở vùng cấm (registry, grading, session, pipeline, `content/**`, `public/content/**`), không có file bị xóa hay đổi tên (`src/lib/tts.ts` không đụng), không đổi `schemaVersion`. Chỉ `scripts/content/speakable-content.test.ts` (loại trừ đúng đường dẫn, đã có từ spec 003, chỉ thêm describe) nằm dưới `scripts/content/`. 19 file, đúng danh sách dự kiến.

Đề xuất cho các commit sau: lệnh `schemaVersion` trong `tasks.md` nên loại trừ `specs/004-kana-pronunciation` (như trên) để khỏi báo nhầm.

### Commit 2 (trước khi commit)

Lệnh `schemaVersion` đã sửa trong `tasks.md` (loại trừ `specs/004-kana-pronunciation`; sửa nằm trong chính Commit 2), so với `staging` nên gồm cả Commit 1 và Commit 2.

```
$ git diff --cached staging --name-only | grep -vxF "scripts/content/speakable-content.test.ts" | grep -E "domain/quiz/(registry|grading)|session|scripts/content|^content/|^public/content" || echo "OK: không đụng vùng cấm"
OK: không đụng vùng cấm

$ git diff --cached staging -U0 -- . ':(exclude)specs/004-kana-pronunciation' | grep -E "^[+-].*schemaVersion" || echo "OK: không đụng schemaVersion (ngoài tài liệu specs/004)"
OK: không đụng schemaVersion (ngoài tài liệu specs/004)

$ git diff --cached staging --name-status | grep -E "^(R|D)" || echo OK
OK

$ git diff --cached --name-only   (đúng 11 đường dẫn của T041)
docs/SPECKIT_ROADMAP.md
specs/004-kana-pronunciation/evidence.md
specs/004-kana-pronunciation/tasks.md
src/features/practice/modes/dictation/DictationComponent.tsx
src/features/practice/modes/dictation/dictation.test.tsx
src/features/practice/modes/mcq/McqComponent.test.tsx
src/features/practice/modes/mcq/McqComponent.tsx
src/features/practice/modes/mcq/index.ts
src/features/practice/modes/mcq/mcq.test.ts
src/features/practice/modes/mcq/types.ts
tests/e2e/kana-speech.spec.ts

$ git diff --cached staging --stat   (gồm cả Commit 1 đã commit và Commit 2 đang staged; so với `staging`)
 docs/SPECKIT_ROADMAP.md                            |  22 +-
 scripts/content/speakable-content.test.ts          |  63 ++++
 .../checklists/requirements.md                     |  37 +++
 .../contracts/speech-contract.md                   |  92 ++++++
 specs/004-kana-pronunciation/data-model.md         |  65 ++++
 specs/004-kana-pronunciation/evidence.md           | 340 +++++++++++++++++++++
 specs/004-kana-pronunciation/plan.md               | 221 ++++++++++++++
 specs/004-kana-pronunciation/quickstart.md         |  67 ++++
 specs/004-kana-pronunciation/research.md           | 116 +++++++
 specs/004-kana-pronunciation/spec.md               | 217 +++++++++++++
 specs/004-kana-pronunciation/tasks.md              | 316 +++++++++++++++++++
 src/features/browse/SearchPage.test.tsx            |  88 ++++++
 src/features/browse/SearchPage.tsx                 |   2 +-
 src/features/browse/VocabTab.test.tsx              | 119 ++++++++
 src/features/browse/VocabTab.tsx                   |   2 +-
 .../modes/dictation/DictationComponent.tsx         |   4 +-
 .../practice/modes/dictation/dictation.test.tsx    | 169 ++++++++++
 .../modes/flashcard/FlashcardComponent.test.tsx    |  90 ++++++
 .../modes/flashcard/FlashcardComponent.tsx         |   2 +-
 .../practice/modes/mcq/McqComponent.test.tsx       |  77 ++++-
 src/features/practice/modes/mcq/McqComponent.tsx   |   4 +-
 src/features/practice/modes/mcq/index.ts           |   6 +-
 src/features/practice/modes/mcq/mcq.test.ts        |  38 ++-
 src/features/practice/modes/mcq/types.ts           |  17 +-
 src/lib/speakable.test.ts                          |  23 ++
 tests/e2e/kana-speech.spec.ts                      | 136 +++++++++
 26 files changed, 2309 insertions(+), 24 deletions(-)
```

Kết luận: không file nào ở vùng cấm (registry, grading, session, pipeline, `content/**`, `public/content/**`), không file bị xóa hay đổi tên (`src/lib/tts.ts` không đụng), không đổi `schemaVersion`; `dictation/index.ts` không đổi, hàm `grade` của `mcq/index.ts` không đổi. Chỉ `scripts/content/speakable-content.test.ts` (đã có từ Commit 1) nằm dưới `scripts/content/`.

### Commit 3 (trước khi commit)

Lệnh `schemaVersion` đã sửa trong `tasks.md` (loại trừ `specs/004-kana-pronunciation`; sửa nằm trong chính Commit 2), so với `staging` nên gồm cả Commit 1, 2 và 3.

```
$ git diff --cached staging --name-only | grep -vxF "scripts/content/speakable-content.test.ts" | grep -E "domain/quiz/(registry|grading)|session|scripts/content|^content/|^public/content" || echo "OK: không đụng vùng cấm"
OK: không đụng vùng cấm

$ git diff --cached staging -U0 -- . ':(exclude)specs/004-kana-pronunciation' | grep -E "^[+-].*schemaVersion" || echo "OK: không đụng schemaVersion (ngoài tài liệu specs/004)"
OK: không đụng schemaVersion (ngoài tài liệu specs/004)

$ git diff --cached staging --name-status | grep -E "^(R|D)" || echo OK
OK

$ git diff --cached --name-only   (đúng 9 đường dẫn của T057)
scripts/content/speakable-content.test.ts
specs/004-kana-pronunciation/evidence.md
specs/004-kana-pronunciation/quickstart.md
specs/004-kana-pronunciation/tasks.md
src/features/browse/KanjiPage.test.tsx
src/features/browse/KanjiPage.tsx
src/lib/speakable.test.ts
src/lib/speakable.ts
tests/e2e/kana-speech.spec.ts

$ git diff --cached staging --stat   (gồm Commit 1 và 2 đã commit và Commit 3 đang staged; so với `staging`)
 docs/SPECKIT_ROADMAP.md                            |  22 +-
 scripts/content/speakable-content.test.ts          | 207 ++++++++-
 .../checklists/requirements.md                     |  37 ++
 .../contracts/speech-contract.md                   |  92 ++++
 specs/004-kana-pronunciation/data-model.md         |  65 +++
 specs/004-kana-pronunciation/evidence.md           | 471 +++++++++++++++++++++
 specs/004-kana-pronunciation/plan.md               | 221 ++++++++++
 specs/004-kana-pronunciation/quickstart.md         |  67 +++
 specs/004-kana-pronunciation/research.md           | 116 +++++
 specs/004-kana-pronunciation/spec.md               | 217 ++++++++++
 specs/004-kana-pronunciation/tasks.md              | 316 ++++++++++++++
 src/features/browse/KanjiPage.test.tsx             | 139 ++++++
 src/features/browse/KanjiPage.tsx                  |   5 +-
 src/features/browse/SearchPage.test.tsx            |  88 ++++
 src/features/browse/SearchPage.tsx                 |   2 +-
 src/features/browse/VocabTab.test.tsx              | 119 ++++++
 src/features/browse/VocabTab.tsx                   |   2 +-
 .../modes/dictation/DictationComponent.tsx         |   4 +-
 .../practice/modes/dictation/dictation.test.tsx    | 169 ++++++++
 .../modes/flashcard/FlashcardComponent.test.tsx    |  90 ++++
 .../modes/flashcard/FlashcardComponent.tsx         |   2 +-
 .../practice/modes/mcq/McqComponent.test.tsx       |  77 +++-
 src/features/practice/modes/mcq/McqComponent.tsx   |   4 +-
 src/features/practice/modes/mcq/index.ts           |   6 +-
 src/features/practice/modes/mcq/mcq.test.ts        |  38 +-
 src/features/practice/modes/mcq/types.ts           |  17 +-
 src/lib/speakable.test.ts                          |  84 +++-
 src/lib/speakable.ts                               |  36 ++
 tests/e2e/kana-speech.spec.ts                      | 184 ++++++++
 29 files changed, 2868 insertions(+), 29 deletions(-)
```

Kết luận: không file nào ở vùng cấm (registry, grading, session, pipeline, `content/**`, `public/content/**`), không file bị xóa hay đổi tên (`src/lib/tts.ts` không đụng), không đổi `schemaVersion`; `speakable.ts` vẫn thuần (không import). Lần chạy đầu lệnh `schemaVersion` báo `+  schemaVersion: 1,` trong fixture manifest của `KanjiPage.test.tsx` (chép từ `BookPage.test.tsx`); trường này không cần cho test (`loadManifest` đã được mock) nên đã xóa dòng đó, chạy lại ra `OK`. Chỉ `scripts/content/speakable-content.test.ts` (đã có từ Commit 1) nằm dưới `scripts/content/`.

### Commit 4 (trước khi commit)

Các lệnh "Commit 4" của `tasks.md` (loại trừ ĐÚNG hai đường dẫn bằng `grep -vxF`, không loại cả `content/**`), so với `staging` nên gồm cả bốn commit cộng dồn.

```
$ git diff --cached staging --name-only | grep -vxF "scripts/content/speakable-content.test.ts" | grep -vxF "content/overrides/speech-corrections.json" | grep -E "domain/quiz/(registry|grading)|session|scripts/content|^content/|^public/content" || echo "OK: không đụng vùng cấm"
OK: không đụng vùng cấm

$ git diff --cached staging --name-status | grep -E "^A[[:space:]]+content/overrides/speech-corrections.json$"
A	content/overrides/speech-corrections.json

$ git diff --cached staging --name-only | grep -c "^content/"
1

$ git diff --cached staging -U0 -- . ':(exclude)specs/004-kana-pronunciation' | grep -E "^[+-].*schemaVersion" || echo "OK: không đụng schemaVersion (ngoài tài liệu specs/004)"
OK: không đụng schemaVersion (ngoài tài liệu specs/004)

$ git diff --cached staging --name-status | grep -E "^(R|D)" || echo OK
OK

$ git diff --cached --name-only   (12 đường dẫn của T077 đã cập nhật: thêm docs/SPECKIT_ROADMAP.md theo yêu cầu của chủ dự án)
content/overrides/speech-corrections.json
docs/ARCHITECTURE.md
docs/SPECKIT_ROADMAP.md
scripts/content/speakable-content.test.ts
specs/004-kana-pronunciation/evidence.md
specs/004-kana-pronunciation/tasks.md
src/features/browse/GrammarTab.test.tsx
src/lib/speakable.test.ts
src/lib/speakable.ts
src/lib/tts.test.ts
src/lib/tts.ts
tests/e2e/kana-speech.spec.ts

$ git diff -U0 docs/ARCHITECTURE.md   (đúng một dòng - và một dòng +)
-│   └── overrides/{verb-groups,pos,id-aliases}.yaml
+│   └── overrides/{verb-groups,pos,id-aliases}.yaml  + speech-corrections.json   # speech-corrections.json do src/lib/tts.ts đọc trực tiếp, không qua pipeline

$ git diff --cached staging --stat   (bốn commit cộng dồn; so với `staging`)
 content/overrides/speech-corrections.json          |   9 +
 docs/ARCHITECTURE.md                               |   2 +-
 docs/SPECKIT_ROADMAP.md                            |  26 +-
 scripts/content/speakable-content.test.ts          | 282 ++++++++-
 .../checklists/requirements.md                     |  37 ++
 .../contracts/speech-contract.md                   |  92 +++
 specs/004-kana-pronunciation/data-model.md         |  65 +++
 specs/004-kana-pronunciation/evidence.md           | 638 +++++++++++++++++++++
 specs/004-kana-pronunciation/plan.md               | 221 +++++++
 specs/004-kana-pronunciation/quickstart.md         |  67 +++
 specs/004-kana-pronunciation/research.md           | 116 ++++
 specs/004-kana-pronunciation/spec.md               | 217 +++++++
 specs/004-kana-pronunciation/tasks.md              | 316 ++++++++++
 src/features/browse/GrammarTab.test.tsx            |  94 +++
 src/features/browse/KanjiPage.test.tsx             | 139 +++++
 src/features/browse/KanjiPage.tsx                  |   5 +-
 src/features/browse/SearchPage.test.tsx            |  88 +++
 src/features/browse/SearchPage.tsx                 |   2 +-
 src/features/browse/VocabTab.test.tsx              | 119 ++++
 src/features/browse/VocabTab.tsx                   |   2 +-
 .../modes/dictation/DictationComponent.tsx         |   4 +-
 .../practice/modes/dictation/dictation.test.tsx    | 169 ++++++
 .../modes/flashcard/FlashcardComponent.test.tsx    |  90 +++
 .../modes/flashcard/FlashcardComponent.tsx         |   2 +-
 .../practice/modes/mcq/McqComponent.test.tsx       |  77 ++-
 src/features/practice/modes/mcq/McqComponent.tsx   |   4 +-
 src/features/practice/modes/mcq/index.ts           |   6 +-
 src/features/practice/modes/mcq/mcq.test.ts        |  38 +-
 src/features/practice/modes/mcq/types.ts           |  17 +-
 src/lib/speakable.test.ts                          | 164 +++++-
 src/lib/speakable.ts                               |  86 ++-
 src/lib/tts.test.ts                                |  46 ++
 src/lib/tts.ts                                     |   8 +-
 tests/e2e/kana-speech.spec.ts                      | 207 +++++++
 34 files changed, 3422 insertions(+), 33 deletions(-)
```

Kết luận: không file nào ở vùng cấm (registry, grading, session, pipeline, validate, `public/content/**`); file thêm dưới `content/` đúng một (`content/overrides/speech-corrections.json`, trạng thái `A`); không file bị xóa hay đổi tên (`src/lib/tts.ts` sửa tại chỗ, không dời); không đổi `schemaVersion`; `tsconfig.app.json`, `tsconfig.node.json`, `vite.config.ts` không đổi; `dictation/index.ts` không đổi. Chỉ `scripts/content/speakable-content.test.ts` nằm dưới `scripts/content/`. `docs/SPECKIT_ROADMAP.md` (khối nợ) là file thứ 12, thêm theo yêu cầu của chủ dự án; `tasks.md` T077 đã cập nhật.

## Thời gian vitest trước/sau

Máy có tải nền (VS Code, các tiến trình khác), nên số đo đơn lẻ dao động nhiều (spec 003 ghi 34,84 giây lúc máy rảnh, 52–63 giây lúc có tải).

| Lần đo | Mã | Test file | Test | Thời gian vitest | Ghi chú |
|---|---|---|---|---|---|
| mốc (T002) | trước Story 1 | 61 | 386 | 52,88 giây | xanh |
| sau Story 1, lần 1 (`npx vitest run`) | sau | 63 | 423 | 62,54 giây | xanh |
| sau Story 1, lần 2 (trong `npm run check`) | sau | 63 | 423 | 52,19 giây | xanh |
| sau Story 4, lần 1 (`npx vitest run`) | sau | 65 | 509 | 43,92 giây | xanh |
| sau Story 4, lần 2 (trong `npm run check`) | sau | 65 | 509 | 37,02 giây | xanh (máy rảnh) |

Story 1 không thêm lần chạy pipeline nào (dùng chung `beforeAll` của `speakable-content.test.ts`).

## Số liệu cuối

| Số đo | Giá trị |
|---|---|
| Từ vựng có chuỗi đọc hợp lệ (không rỗng, không chữ Hán, không ký tự cấm) | **1.295/1.295** (960 từ có kanji) |
| Chữ Kanji đơn / từ ví dụ | **134 chữ, 657 ví dụ** |
| Chữ Kanji mở rộng thành dạng có đuôi | **11** (白, 一 đến 九, 大) |
| Bảng sửa cách đọc | **1 mục**, **1/292** câu bị đổi |
| Vitest | 63 file, 423 test (sau Commit 1) → 63 file, 445 test (Commit 2) → 64 file, 487 test (Commit 3) → **65 file, 509 test** (Commit 4); mốc đầu 61 file, 386 test |
| E2e | mốc 24 test (23 đạt, 1 đỏ Q-2) → **35 test (34 đạt, 1 đỏ Q-2)** |
| `content:validate` | 568 cảnh báo, bằng mốc |
| Băm `public/content` (45 file) | `2deeab187c4f7f57777689b29fdb3ff5708a26a3dec30a02e6a4d99e6f8ca068`, bằng mốc |
| JS gzip | 186,53 kB (mốc 186,16 kB; ngân sách 200 kB) |
| Bằng chứng ĐỎ trước khi sửa mã | Story 1: 8; Story 2: 16; Story 3: 45; Story 4: 12 |
