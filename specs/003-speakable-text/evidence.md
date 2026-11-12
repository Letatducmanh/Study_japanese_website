# Evidence: speakable-text (spec 003)

Ghi lại trong lúc làm. Commit 1 điền các mục "Mốc trước", "Quyết định", "Story 1: …", "Thời gian vitest trước/sau", "Kiểm vùng cấm"; Commit 2 điền các mục "Story 2: …", "Ảnh", "Số liệu cuối".

## Mốc trước (T002)

Chạy `npx vitest run` ngày 2026-11-11 trên nhánh `003-speakable-text` (chưa sửa gì, trùng `staging` 2a5fc21):

| Chỉ số | Giá trị |
|---|---|
| Test file | 57 passed (57) |
| Test | 316 passed (316) |
| Thời gian vitest báo | 38,99 giây |
| Thời gian đồng hồ ngoài (`time`) | 44,8 giây |

## Quyết định (T004)

- **(a) Lần chạy pipeline riêng, timeout riêng.** Không dùng chung kết quả build với các test pipeline hiện có: dùng chung cần `globalSetup` (sửa `vite.config.ts`) và sửa hai test đang chạy. Không thêm `describe` vào `scripts/content/pipeline.test.ts`.
- **(b) File test nội dung ở `scripts/content/speakable-content.test.ts`.** Chiều phụ thuộc đúng (`scripts/` → `src/lib/`), cạnh `pipeline.test.ts`. Import `../../src/lib/speakable.ts` (có đuôi `.ts`) và `./pipeline.ts`; không dùng `@/`; `speakable.ts` không dùng kiểu hay API DOM.
- **Phép thử lint** (`eslint --stdin --stdin-filename scripts/content/speakable-content.test.ts` với dòng import `../../src/lib/speakable.ts`): sạch, không cần ngoại lệ ESLint.

## Story 1: kết quả ĐỎ

Lệnh (trước khi viết `speakable.ts` và sửa `tts.ts`, `SpeakButton.tsx`, `GrammarTab.tsx`):

```
npx vitest run src/lib/speakable.test.ts scripts/content/speakable-content.test.ts src/lib/tts.test.ts src/ui/jp/SpeakButton.test.tsx src/features/practice/modes/dictation/dictation.test.tsx
```

Kết quả: **2 suite không nạp được + 8 test đỏ**, đúng dự kiến.

| Nhóm | Kết quả ĐỎ | Lý do |
|---|---|---|
| `src/lib/speakable.test.ts` (toàn bộ) | suite FAIL | `Failed to resolve import "./speakable"` (chưa có file) |
| `scripts/content/speakable-content.test.ts` (toàn bộ) | suite FAIL | `Failed to resolve import "../../src/lib/speakable.ts"` |
| `src/lib/tts.test.ts` (4 test mới) | 4 đỏ | `speakJapanese('[お]土産')` đưa `'[お]土産'` thay vì `'土産'`; `'書きます → 書いて'` (sentence) còn nguyên `→`; `'晩 / 夜'` còn nguyên; chuỗi `'～'` vẫn gọi `cancel` và `speak` |
| `src/ui/jp/SpeakButton.test.tsx` (3 test mới) | 3 đỏ | chuỗi đọc chưa làm sạch (`[お]土産`, `行きます（lịch sự）→ 行く（thông thường）`, `晩 / 夜`) |
| `src/features/practice/modes/dictation/dictation.test.tsx` (test c) | 1 đỏ | `DictationComponent` đưa `'[お]みやげ'` thay vì `'みやげ'` |

## Story 1: test đặc trưng `[đặc trưng]` (xanh ngay)

Xanh trước và sau, không phải bằng chứng đỏ.

Chạy cùng lệnh ở trên, trước khi viết mã. Các test sau xanh ngay (đúng dự kiến, không phải lỗi):

| Test | Kết quả trước khi sửa mã | Ý nghĩa |
|---|---|---|
| `dictation.test.tsx` › `[đặc trưng] grade() trả expected là item.kana thô và chấp nhận answers.kana` | XANH | chuỗi chấm hiện tại: `expected` là `item.kana` thô, `answers.kana` được chấp nhận |
| `dictation.test.tsx` › `[đặc trưng] kết quả grade() không đổi: chỉ tập answers.kana được chấp nhận` | XANH | tập đáp án chấp nhận không đổi |
| `SpeakButton.test.tsx` › `[đặc trưng] không đổi nhãn hay nội dung hiển thị` (3 giá trị `kind`) | XANH | nút chỉ có biểu tượng, `aria-label` và `title` bằng "Nghe phát âm" |
| `tts.test.ts`: 6 test cũ (hỗ trợ, giọng, rỗng, `lang`, giọng nữ) | XANH | hành vi cũ giữ nguyên |

## Story 1: kết quả XANH và số liệu

Sau khi viết `src/lib/speakable.ts` và sửa `tts.ts`, `SpeakButton.tsx`, `GrammarTab.tsx`:

- Nhóm test của Story 1 (5 file): **5 passed, 63 test xanh** (36 test của `speakable.test.ts`, 6 của `speakable-content.test.ts`, 10 của `tts.test.ts`, 8 của `SpeakButton.test.tsx`, 3 của `dictation.test.tsx`).
- Toàn bộ `npx vitest run`: **60 file, 371 test xanh** (mốc trước: 57 file, 316 test; thêm 3 file, 55 test) — ở các lần chạy lúc máy rảnh.
- Lint: `speakable.ts` bị `no-useless-escape` ở `[` trong lớp ký tự; đã sửa thành `[[［]`. `npx eslint .` sạch sau đó.
- Typecheck (`tsc -b`) xanh, gồm cả `scripts/content/speakable-content.test.ts` import `../../src/lib/speakable.ts` (biên dịch bằng `tsconfig.node.json`, không có DOM).

Số liệu từ `scripts/content/speakable-content.test.ts` (dòng `console.info`) và script tạm `.screens/verify-speakable.mts` (gọi hàm thật trên nội dung dựng từ pipeline):

| Phép đo | Kết quả | Kỳ vọng |
|---|---|---|
| Chuỗi được đọc | **2.378** (từ vựng 1.295, `kanji.char` 134, `kanji.example.word` 657, câu ngữ pháp 292) | 2.378 |
| Chuỗi đổi sau làm sạch | **271** (bằng bản nháp) | 271 |
| Chuỗi còn `[ ] ［ ］ ～ 〜 ~ （ ） ( ) / ／` hoặc rỗng | **0** | 0 |
| Danh sách ngoại lệ FR-012 | **rỗng** | rỗng |
| `toSpeakable(kana)` khớp `answers.kana[0]` | **1.295/1.295** | 1.295/1.295 |
| `toSpeakable(kanji)` khớp `answers.kanji[0]` | **960/960** | 960/960 |

**5 chuỗi khác bản nháp** (trong 661 mục có ký tự nghi vấn; bản cuối đúng hơn):

| Gốc | Bản nháp | Bản cuối |
|---|---|---|
| 日曜日 どこ[へ]も 行きませんでした。 | 日曜日 どこ も … | 日曜日 どこも … |
| いい [お]天気ですね。 | いい 天気ですね。 | いい天気ですね。 |
| 日本料理［の 中］で 何が … | 日本料理 で 何が … | 日本料理で 何が … |
| ここに 荷物を 置かないで ください。 → 荷物は … | …ください。、荷物は … | …ください。 荷物は … |
| 会社の 食堂で 昼ごはんを 食べます。 → 昼ごはんは … | …食べます。、昼ごはんは … | …食べます。 昼ごはんは … |

**11 chuỗi xem tay** (còn chữ Latin, `…` hoặc ký tự ngoài Nhật sau làm sạch). Kết quả: cả 11 đúng như spec mục (2), tức đọc như hiện nay hoặc chỉ bỏ `…` đơn / `[ ]`:

| id | Gốc | Sau làm sạch |
|---|---|---|
| mnn1-l01-g-2a8c18b3#0 | ミラーさんは IMCの 社員です。 | không đổi (Latin) |
| mnn1-l02-0e119c07 | CD | không đổi (Latin) |
| mnn1-l03-g-edfa8ee6#2 | 会社は どちらですか。 …IMCです。 | 会社は どちらですか。 IMCです。 |
| mnn1-l06-20bdf436 | DVD | không đổi (Latin) |
| mnn1-l07-g-2469a6f0#0 | 「ありがとう」は … …「Thank you」です。 | bỏ `…`; còn 「Thank you」 (nợ nội dung) |
| mnn1-l07-g-2469a6f0#1 | 「Cảm ơn」は … …「ありがとう」です。 | bỏ `…`; còn 「Cảm ơn」 (nợ nội dung) |
| mnn1-l09-9b42dc20 | [～は] ちょっと……。 | ちょっと……。 (`……` giữ) |
| mnn1-l10-afad9dab | ATM | không đổi (Latin) |
| mnn1-l15-g-83a50111#2 | IMCは コンピューターソフトを 作って います。 | không đổi (Latin) |
| mnn1-l21-bf77411d | もう 帰らないと……。 | không đổi (`……` giữ) |
| mnn1-l22-08b89cdf | Tシャツ | không đổi (Latin) |

## Thời gian vitest trước/sau

Máy có tải nền thay đổi (VS Code và các tiến trình khác, 25–40% CPU), nên một lần đo đơn lẻ không đáng tin. Đã đo nhiều lần và đo đối chứng bằng worktree tạm ở `staging` (mã trước khi sửa, đã xóa sau khi đo):

| Lần đo | Mã | Test file | Test | Thời gian vitest | Ghi chú |
|---|---|---|---|---|---|
| mốc T002 (máy rảnh) | trước | 57 | 316 | **38,99 giây** (đồng hồ ngoài 44,8 giây) | xanh |
| 1 | sau | 60 | 371 | 64,71 giây | xanh |
| 2 | sau | 60 | 371 | 59,03 giây | xanh |
| 3 | sau | 60 | 371 | 113,18 giây | xanh (máy bận) |
| đối chứng B1 (máy bận) | trước (`staging`) | 57 | 316 | 109,30 giây | **5 test hết giờ 5 giây** |
| đối chứng B2 (máy bận) | trước (`staging`) | 57 | 316 | 101,77 giây | **5 test hết giờ 5 giây** |
| đối chứng A1 (máy bận) | sau | 60 | 371 | 109,09 giây | **cùng 5 test hết giờ** |
| `speakable-content.test.ts` chạy riêng | sau | 1 | 6 | 12,51 giây | chi phí của lần chạy pipeline thứ ba |

Nhận xét:
- Khi máy rảnh: 38,99 giây (trước) so với 59–65 giây (sau). Khi máy bận như nhau: 101–109 giây (trước) so với 109 giây (sau). Hai điều kiện máy khác nhau nên số **chưa kết luận chính xác** được chi phí; chi phí thêm chắc chắn nằm trong khoảng từ gần 0 (khi tải nền che lấp) tới vài chục giây (khi máy rảnh), mà phần cố định là một lần chạy pipeline (khoảng 12,5 giây chạy riêng) do file thứ ba này.
- Đã đo lại lúc máy rảnh: xem mục "Đo lại lúc máy rảnh" ngay dưới.
- **Phát hiện phụ ngoài phạm vi:** khi máy bận, đúng 5 test cũ đỏ vì hết giờ mặc định 5 giây, kể cả trên `staging` chưa sửa gì: `scripts/content/enrich.test.ts` ("外" có relatedVocabIds…), `parse-grammar.test.ts` (2 test), `parse-vocab.test.ts` (1 test), `src/features/weakness/WeaknessPage.lessons.test.tsx` (A). Đây là nợ về độ ổn định test dưới tải, không do spec này; ghi lại để xử lý ở `quality-gaps`.

### Đo lại lúc máy rảnh

Trước khi đo đã kiểm: không có tiến trình vite/vitest/playwright test nào chạy nền; các tiến trình `node` còn lại đều là máy chủ MCP của công cụ (pdf, mongodb, playwright-mcp, desktop-commander), không phải của phiên này nên không tắt. Máy có 12 luồng CPU.

`npm run check` chạy thẳng ba lần liên tiếp (mã sau thay đổi, 60 file, 371 test, đều xanh, exit 0):

| Lần | Thời gian vitest | Cả `npm run check` (đồng hồ ngoài) |
|---|---|---|
| 1 (nguội) | 35,85 giây | 90 giây |
| 2 | 31,94 giây | 52 giây |
| 3 | 34,84 giây | 54 giây |
| **Trung vị** | **34,84 giây** | **54 giây** |

So với mốc trước 38,99 giây: **không tăng** (trung vị thấp hơn 4,15 giây). `npm run build` xanh (JS 186,10 kB gzip, dưới ngân sách 200 kB).

Đối chiếu cùng lúc (vitest, có và không có file `speakable-content.test.ts`):

| | Lần 1 | Lần 2 |
|---|---|---|
| KHÔNG có `speakable-content.test.ts` (59 file) | 31,39 giây | 36,77 giây |
| CÓ `speakable-content.test.ts` (60 file) | 45,06 giây | 36,38 giây |

Chênh lệch nằm trong nhiễu đo (lần 1 có +13,7 giây, lần 2 lại thấp hơn 0,4 giây). **Kết luận: khi máy rảnh, lần chạy pipeline thứ ba không gây tăng thời gian đo được.**

Vì sao các lần trước thấy 59–65 giây (tăng 20–26 giây) trong khi lần chạy pipeline thứ ba chạy riêng chỉ 12,5 giây: hai nguyên nhân chồng nhau, không phải một.
1. **Tải nền của máy lúc đó (25–40% CPU, VS Code và các app khác).** Cùng lúc đó mã `staging` chưa sửa gì cũng chậm tới 102–109 giây và có 5 test hết giờ, tức phần lớn chênh lệch đến từ máy, không từ thay đổi.
2. **Tranh CPU thật nhưng nhỏ.** Vitest chạy các file song song trên các luồng; pipeline là việc CPU nặng một luồng (~12,5 giây chạy riêng, gồm cả nạp jsdom). Thêm ~10 giây CPU vào 12 luồng chỉ tăng thời gian chờ khoảng 1 giây nếu các luồng còn rảnh; khi các luồng đã đầy (máy bận, hoặc lúc nhiều file nặng cùng chạy) thì phần thêm này chiếm chỗ của file khác nên thời gian dài ra gần bằng phần việc thêm.

Phương án giảm tải (chỉ nêu, chưa áp dụng, không đổi thiết kế):

| Phương án | Tiết kiệm | Chi phí |
|---|---|---|
| Thêm dòng `// @vitest-environment node` đầu `speakable-content.test.ts` | bỏ nạp jsdom cho file này (jsdom chiếm ~72% thời gian môi trường của cả bộ test) | 1 dòng, chỉ file mới; không đổi hành vi. Các test `scripts/content/*.test.ts` cũ cũng nạp jsdom không cần thiết nhưng nằm ngoài phạm vi |
| `globalSetup` dựng nội dung một lần, ba file test dùng chung | bỏ 2 trong 3 lần chạy pipeline (~25 giây CPU) | sửa `vite.config.ts` và 2 test hiện có (`pipeline.test.ts`, `search-index.real.test.ts`) — đã bị loại ở T004 |
| Thêm `describe` vào `pipeline.test.ts` | bỏ 1 lần chạy (~12 giây CPU) | sửa file test trong vùng pipeline — bạn đã cấm |

## Nợ cho quality-gaps: 5 test dễ hết giờ 5 giây khi máy bận

Khi máy bận, đúng 5 test cũ đỏ vì hết giờ mặc định 5 giây (`Test timed out in 5000ms`) — đỏ cả trên `staging` chưa sửa gì (đo đối chứng B1, B2), nên không phải hồi quy của spec này. Khi máy rảnh cả 5 xanh (ba lần `npm run check` ở trên). Không tăng timeout và không sửa chúng trong spec này.

1. `scripts/content/enrich.test.ts` › Tích hợp trên dữ liệu N5 thật › "外" có relatedVocabIds chứa 外国, 外国人
2. `scripts/content/parse-grammar.test.ts` › parseGrammarFile — content/n5/mnn1/grammar.md › đọc đúng 25 bài và 132 mẫu ngữ pháp, không lỗi
3. `scripts/content/parse-grammar.test.ts` › parseGrammarFile — content/n5/mnn1/grammar.md › mỗi mẫu ngữ pháp có ít nhất 1 ví dụ đủ 3 dòng (Nhật/Romaji/Dịch)
4. `scripts/content/parse-vocab.test.ts` › parseVocabFile — content/n5/mnn1/vocab.md › đọc đúng 25 bài, 1.020 từ chính và 275 từ mở rộng, không lỗi
5. `src/features/weakness/WeaknessPage.lessons.test.tsx` › WeaknessPage — mục "Bài có độ thành thạo thấp nhất" (US1) › A: chỉ làm Bài 3 và Bài 5 → đúng hai bài đó, điểm tăng dần

Hướng xử lý gợi ý cho `quality-gaps` (tương tự Q-1): đặt timeout riêng cho các file đọc nội dung thật, hoặc dựng nội dung một lần dùng chung.

## Dọn worktree tạm

Worktree đối chứng `wt-baseline-003` đã dọn: gỡ junction `node_modules` trước (thư mục thật còn nguyên, 263 mục), `git worktree remove --force`, `git worktree prune`; `git worktree list` chỉ còn một dòng, `.git/worktrees` không còn, không còn thư mục tạm cạnh repo, không tạo nhánh tạm (dùng `--detach`), không còn thư mục tạm `speakable-content-*`/`verify-speakable-*` trong thư mục tạm của hệ thống.

## Cổng trước Commit 1 (T022)

- `npm run check` chạy thẳng: **xanh** (exit 0) ở cả ba lần đo lúc máy rảnh (content:validate OK 568 cảnh báo cũ, `tsc -b`, `eslint .`, vitest 60 file / 371 test).
- `npm run build`: **xanh** (`tsc -b && vite build`; JS 610,53 kB, 186,10 kB gzip).
- Hai lần đỏ trước đó đều do lỗi lint của chính tôi, đã sửa: (1) `no-useless-escape` ở `[` trong `speakable.ts`; (2) script tạm `.screens/verify-speakable.ts` bị ESLint quét (đã đổi đuôi `.mts`, ngoài phạm vi lint).
- Kiểm FR-006 — chỉ `src/lib/tts.ts` dùng `speechSynthesis`/`SpeechSynthesisUtterance` ngoài file test:

```
grep -rnE "SpeechSynthesisUtterance|speechSynthesis" src --include=*.ts --include=*.tsx | grep -vE ".test.tsx?:" | grep -vE "^src/(lib/tts|test/setup).ts:"
```

  Kết quả: **rỗng (0 dòng)**. (`src/test/setup.ts` là polyfill của bộ test nên được loại như file test.)

## Story 2: e2e mốc trước

Trước khi sửa mã Commit 2 (`public/content/manifest.json` có sẵn; `npm run build` rồi `npx playwright test`, viewport mặc định của từng file, Chromium):

- **18 đạt, 1 đỏ** (1,4 phút, 19 test).
- Đỏ đúng một test, đúng như dự kiến (Q-2, nợ từ spec 001): `browse.spec.ts:3` "mở trang chủ → vào N5 → Minna no Nihongo 1 → Bài 1" (không thấy heading "Tự học tiếng Nhật cùng Mạnh").

## Story 2: kết quả ĐỎ

Chạy trước khi sửa mã (`types.ts`, `index.ts`, `McqComponent.tsx` chưa đổi):

`npx vitest run src/features/practice/modes/mcq` → **9 đỏ, 14 xanh** (23 test, 2 file):

| Nhóm | Test đỏ | Số |
|---|---|---|
| T026 `mcq.test.ts` (chưa có `promptSpeak`, giá trị `undefined`) | cả sáu hướng | 6 |
| T027 `McqComponent.test.tsx` | `mcq-vi-jp` có nút loa; `mcq-vi-kanji` có nút loa; `mcq-kanji-reading` có nút loa trước khi chọn | 3 |

`npx playwright test tests/e2e/speakable.spec.ts` → **3 đỏ, 2 xanh** (5 test). Đỏ: `mcq-vi-jp`, `mcq-vi-kanji`, `mcq-kanji-reading` (cùng lý do: nút "Nghe phát âm" có mặt ở đề, `toHaveCount(0)` nhận 1).

Ghi chú khi viết e2e: `tts.ts` gán `utterance.voice = <giọng giả>`; Chrome ném TypeError với đối tượng không phải `SpeechSynthesisVoice` thật, nên `speak` không bao giờ được gọi và `window.__spoken` rỗng. Bản giả vì vậy phải giả cả lớp `SpeechSynthesisUtterance` (đã làm trong `tests/e2e/speakable.spec.ts`). Không phải lỗi của mã ứng dụng.

## Story 2: test đặc trưng `[đặc trưng]` (xanh ngay)

Xanh trước và sau, không phải bằng chứng đỏ.

- `McqComponent.test.tsx` xanh ngay (6): `mcq-jp-vi` có nút loa và đọc chữ của đề; `mcq-kana-kanji` có nút loa; `mcq-listen-vi` không có "Nghe phát âm", có "Nghe lại", tự đọc khi mở; `mcq-jp-vi` không tự đọc khi mở; chọn đáp án không đổi `grade()`; **E2** (câu dựng tay `promptText: '[お]土産'`, `promptSpeak: 'always'`: đề hiển thị thô `[お]土産`, bấm loa đưa `土産` cho giọng đọc).
- `speakable.spec.ts` xanh ngay (2): câu hỏi–đáp ngữ pháp được đọc thành `ミラーさんは アメリカ人ですか。 はい、アメリカ人です。`; `mcq-jp-vi` có nút loa ở đề (khẳng định "có mặt", chống xanh giả).
- **E2 xanh trước và sau, không phải bằng chứng đỏ.** `tasks.md` T029 ban đầu dự kiến E2 đỏ; thực tế xanh ngay vì Commit 1 đã làm sạch chuỗi đọc ở `tts.ts` và mã cũ luôn hiện nút loa. E2 khóa hành vi "chỉ chuỗi đọc bị làm sạch, chữ hiển thị giữ nguyên" và vẫn phải xanh sau khi sửa mã (T033). Chủ dự án đã chọn giữ E2 là `[đặc trưng]`.

## Story 2: kết quả XANH

Sau khi sửa `types.ts`, `index.ts`, `McqComponent.tsx` (T030–T032):

- `npx vitest run src/features/practice/modes/mcq`: **23/23 xanh** (trước: 9 đỏ). Gồm cả sáu test `[đặc trưng]`, trong đó E2 vẫn xanh sau khi sửa.
- `npx vitest run` toàn bộ: **61 file, 386 test, tất cả xanh** (trước Commit 2: 60 file, 371 test; thêm 1 file, 15 test).
- `git diff src/features/practice/modes/mcq/index.ts`: không có hunk nào trong `grade`, `isEligible`, `register`, `choiceOf`, `distractorField`.
- e2e toàn bộ (`npm run build && npx playwright test`): **23 đạt, 1 đỏ** (24 test; mốc trước 18 đạt, 1 đỏ, 19 test). Đỏ duy nhất vẫn là Q-2 `browse.spec.ts:3` "mở trang chủ → …". Thêm 5 test của `speakable.spec.ts` đều xanh: 3 test đỏ trước đó (`mcq-vi-jp`, `mcq-vi-kanji`, `mcq-kanji-reading`) và 2 `[đặc trưng]`.

## Ảnh `mcq-kanji-reading`

Chụp bằng `.screens/shot-mcq-kanji-reading.mjs` (Playwright Chromium, 360×740, giả giọng `ja-JP`, `npm run preview` cổng 4173; script tạm, không commit). Từ lấy được: `24日`.

- Trước khi chọn: `.screens/mcq-kanji-reading-before.png`: 0 nút loa.
- Sau khi chọn: `.screens/mcq-kanji-reading-after.png`: 1 nút loa.

| Số đo | Trước | Sau |
|---|---|---|
| `document.documentElement.scrollWidth` | 360 | 360 |
| lề trái khối đề (px) | 145 | 171 |
| rộng khối đề (px) | 70 | 70 |
| cao khối đề (px) | 36 | 36 |
| cao cả hàng đề + nút (px) | 36 | 44 |

**Không tràn ngang** (360, không lớn hơn 360). Khi nút hiện lại, đề dịch sang phải **26 px** (không phải 44 px như `tasks.md` T043 ghi: hàng được căn giữa, nên chỉ dịch nửa của nút 44 px + khoảng cách 8 px) và hàng cao thêm 8 px (36 → 44). Đề không xuống dòng.

## Kiểm vùng cấm

Đầu ra nguyên văn (T040, trước khi commit Commit 2):

```
$ git diff staging --stat   (cây làm việc; thấy thêm 2 file CHƯA staged, xem ghi chú)
 .specify/integrations/claude.manifest.json         |   8 +-
 docs/SPECKIT_ROADMAP.md                            |  24 +-
 scripts/content/speakable-content.test.ts          | 175 ++++++++++++++
 specs/002-data-and-logic-fixes/tasks.md            |   2 +-
 .../003-speakable-text/checklists/requirements.md  |  36 +++
 .../contracts/speakable-contract.md                |  68 ++++++
 specs/003-speakable-text/data-model.md             |  44 ++++
 specs/003-speakable-text/evidence.md               | 259 +++++++++++++++++++++
 specs/003-speakable-text/plan.md                   | 189 +++++++++++++++
 specs/003-speakable-text/quickstart.md             |  57 +++++
 specs/003-speakable-text/research.md               | 105 +++++++++
 specs/003-speakable-text/spec.md                   | 212 +++++++++++++++++
 specs/003-speakable-text/tasks.md                  | 189 +++++++++++++++
 src/features/browse/GrammarTab.tsx                 |   2 +-
 .../practice/modes/dictation/dictation.test.tsx    |  93 ++++++++
 .../practice/modes/mcq/McqComponent.test.tsx       | 180 ++++++++++++++
 src/features/practice/modes/mcq/McqComponent.tsx   |   5 +-
 src/features/practice/modes/mcq/index.ts           |  18 +-
 src/features/practice/modes/mcq/mcq.test.ts        |  17 ++
 src/features/practice/modes/mcq/types.ts           |   9 +
 src/lib/speakable.test.ts                          | 131 +++++++++++
 src/lib/speakable.ts                               |  74 ++++++
 src/lib/tts.test.ts                                |  27 +++
 src/lib/tts.ts                                     |  13 +-
 src/ui/jp/SpeakButton.test.tsx                     |  40 ++++
 src/ui/jp/SpeakButton.tsx                          |   7 +-
 tests/e2e/speakable.spec.ts                        | 106 +++++++++
 27 files changed, 2068 insertions(+), 22 deletions(-)

$ git diff staging --name-status | grep "scripts/content/speakable-content.test.ts"
A	scripts/content/speakable-content.test.ts

$ git diff staging --name-only | grep -vxF ... | grep -E "domain/quiz/(registry|grading)|session|scripts/content|^content/|^public/content" || echo ...
OK: không đụng vùng cấm

$ git diff --cached staging --stat   (chỉ phần sẽ nằm trong HEAD sau Commit 2)
 docs/SPECKIT_ROADMAP.md                            |  24 +-
 scripts/content/speakable-content.test.ts          | 175 ++++++++++++++
 .../003-speakable-text/checklists/requirements.md  |  36 +++
 .../contracts/speakable-contract.md                |  68 ++++++
 specs/003-speakable-text/data-model.md             |  44 ++++
 specs/003-speakable-text/evidence.md               | 259 +++++++++++++++++++++
 specs/003-speakable-text/plan.md                   | 189 +++++++++++++++
 specs/003-speakable-text/quickstart.md             |  57 +++++
 specs/003-speakable-text/research.md               | 105 +++++++++
 specs/003-speakable-text/spec.md                   | 212 +++++++++++++++++
 specs/003-speakable-text/tasks.md                  | 189 +++++++++++++++
 src/features/browse/GrammarTab.tsx                 |   2 +-
 .../practice/modes/dictation/dictation.test.tsx    |  93 ++++++++
 .../practice/modes/mcq/McqComponent.test.tsx       | 180 ++++++++++++++
 src/features/practice/modes/mcq/McqComponent.tsx   |   5 +-
 src/features/practice/modes/mcq/index.ts           |  18 +-
 src/features/practice/modes/mcq/mcq.test.ts        |  17 ++
 src/features/practice/modes/mcq/types.ts           |   9 +
 src/lib/speakable.test.ts                          | 131 +++++++++++
 src/lib/speakable.ts                               |  74 ++++++
 src/lib/tts.test.ts                                |  27 +++
 src/lib/tts.ts                                     |  13 +-
 src/ui/jp/SpeakButton.test.tsx                     |  40 ++++
 src/ui/jp/SpeakButton.tsx                          |   7 +-
 tests/e2e/speakable.spec.ts                        | 106 +++++++++
 25 files changed, 2060 insertions(+), 20 deletions(-)
```

Ghi chú: `git diff staging` so **cây làm việc** với `staging`, nên thấy thêm hai file **chưa staged và không thuộc commit nào của spec 003**: `.specify/integrations/claude.manifest.json` (đã sửa từ trước khi làm spec 003, của Companion) và `specs/002-data-and-logic-fixes/tasks.md` (một dấu tick T071 `[ ]` → `[X]` do công cụ Companion ghi lúc 16:29; không phải do tôi và không đưa vào commit). Phần sẽ nằm trong `HEAD` là đầu ra `git diff --cached staging` ở cuối: không có hai file đó. `scripts/content/speakable-content.test.ts` là `A` (thêm mới); không có dòng nào chạm `domain/quiz/(registry|grading)`, `session`, `scripts/content/*` khác, `content/**`, `public/content/**`, schema hay `schemaVersion`; `src/lib/tts.ts` chỉ sửa tại chỗ (13 dòng), không dời.

## Số liệu cuối

| Mục | Số |
|---|---|
| Tổng chuỗi được đọc (vocab 1.295, `kanji.char` 134, `example.word` 657, ngữ pháp 292) | 2.378 |
| Số chuỗi đổi sau làm sạch | 271 |
| Khớp `answers.kana[0]` | 1.295/1.295 |
| Khớp `answers.kanji[0]` | 960/960 |
| Chuỗi còn ký tự cấm | 0 |
| Danh sách ngoại lệ | rỗng |
| Vitest toàn bộ trước Commit 1 (mốc T002) | 57 file, 316 test, 38,99 giây |
| Vitest sau Commit 1 (trung vị 3 lần, máy rảnh) | 60 file, 371 test, 34,84 giây |
| Vitest sau Commit 2 (`npm run check`, một lần đo, máy có tải nền) | 61 file, 386 test, 56,85 giây (cả `npm run check` 90,8 giây) |
| `npm run build` | xanh; JS 610,71 kB, 186,16 kB gzip (dưới ngân sách 200 kB) |

Lần đo 56,85 giây của Commit 2 là một lần đơn lẻ khi máy có tải nền (VS Code, e2e vừa chạy xong); như đã nêu ở mục thời gian, số đo đơn lẻ lúc máy bận không đáng tin và không so được với 34,84 giây lúc máy rảnh. Chưa đo lặp lại.
