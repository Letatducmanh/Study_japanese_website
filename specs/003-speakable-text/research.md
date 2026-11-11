# Research: speakable-text

Không có `NEEDS CLARIFICATION` còn lại. Không thêm thư viện nào (Constitution: Additional Constraints).

## R-1. Bản làm sạch cuối so với bản nháp

**Decision**: `toSpeakable(text, kind)` theo thứ tự sau, trên chuỗi đầu vào:

1. Bỏ `[..]` và `［..］` (không lồng nhau), kèm khoảng trắng đứng ngay trước: `\s*[\[［][^\]］]*[\]］]` → rỗng.
2. Bỏ `～`, `〜`, `~`.
3. `kind = 'word'`: nếu có `/` hoặc `／`, tách theo `\s*[\/／]\s*`, lấy mục đầu tiên không rỗng.
4. `kind = 'sentence'`:
   - bỏ `（..）` và `(..)` (cả chữ bên trong);
   - đổi mỗi dấu `…` đơn (không đứng cạnh `…` khác) thành một dấu cách; `……` giữ nguyên;
   - nếu có `→` hoặc `/` hoặc `／`: tách theo `\s*(?:→|[\/／])\s*`, bỏ mục rỗng, nối các mục bằng `、`; nếu mục trước đã kết thúc bằng `。` `！` `？` thì nối bằng một dấu cách (tránh "。、").
5. Nếu sau các bước trên chuỗi không đổi so với đầu vào: trả về **y nguyên đầu vào** (kể cả dấu cách).
6. Ngược lại: gộp mọi chuỗi khoảng trắng thành một dấu cách, bỏ khoảng trắng đứng trước `、。！？`, trim.

**Số liệu** (chạy `.screens/check-proto2.mjs` trên nội dung dựng từ pipeline, ngày 2026-11-11):

| Phép đo | Kết quả |
|---|---|
| 27 ví dụ (spec (1), (2) và ca biên) | 27/27 đúng |
| Chuỗi được đọc | 2.378: từ vựng 1.295, `kanji.char` 134, `kanji.example.word` 657, `grammar.example.jp` 292 |
| Chuỗi đổi sau làm sạch | 271 (bằng bản nháp) |
| Chuỗi còn `[ ] ［ ］ ～ 〜 ~ （ ） ( ) / ／` sau làm sạch | 0 |
| Chuỗi thành rỗng | 0 |
| `toSpeakable(kana)` khớp `answers.kana[0]` (sau khi bỏ `～` và gộp khoảng trắng ở hai phía) | 1.295/1.295 |
| `toSpeakable(kanji)` khớp `answers.kanji[0]` | 960/960 |

Hai ghi chú về con số: (a) trong bản trước tôi nói "3.145 chuỗi được đọc"; con số đúng là **2.378**, spec đã sửa; (b) bản nháp lệch 1 từ so với `answers` (`いい [お]てんきですね。`, 1 kana + 1 kanji) vì để lại dấu cách; D-3 trong plan sửa lỗi này.

**5 chuỗi khác bản nháp trong 661 mục có ký tự nghi vấn** (đều là bản nháp sai, bản cuối đúng hơn):

| Chuỗi gốc | Bản nháp | Bản cuối |
|---|---|---|
| 日曜日 どこ[へ]も 行きませんでした。 | 日曜日 どこ も 行きませんでした。 | 日曜日 どこも 行きませんでした。 |
| いい [お]天気ですね。 | いい 天気ですね。 | いい天気ですね。 |
| 日本料理［の 中］で 何が … | 日本料理 で 何が … | 日本料理で 何が … |
| ここに 荷物を 置かないで ください。 → 荷物は … | …ください。、荷物は … | …ください。 荷物は … |
| 会社の 食堂で 昼ごはんを 食べます。 → 昼ごはんは … | …食べます。、昼ごはんは … | …食べます。 昼ごはんは … |

**11 chuỗi xem tay** (còn chữ Latin, `…` hoặc ký tự ngoài Nhật sau làm sạch). Theo spec mục (2) tất cả **giữ nguyên, đọc như hiện nay**; đây là kết quả mong đợi, không phải lỗi:

| id | Gốc | Sau làm sạch | Lý do giữ |
|---|---|---|---|
| mnn1-l01-g-2a8c18b3#0 | ミラーさんは IMCの 社員です。 | không đổi | chữ Latin (spec mục 2) |
| mnn1-l02-0e119c07 | CD | không đổi | chữ Latin |
| mnn1-l03-g-edfa8ee6#2 | 会社は どちらですか。 …IMCです。 | …ですか。 IMCです。 | bỏ `…` đơn; `IMC` là chữ Latin |
| mnn1-l06-20bdf436 | DVD | không đổi | chữ Latin |
| mnn1-l07-g-2469a6f0#0 | 「ありがとう」は … …「Thank you」です。 | bỏ `…`; còn 「Thank you」 | tiếng Anh trong câu; nợ nội dung |
| mnn1-l07-g-2469a6f0#1 | 「Cảm ơn」は … …「ありがとう」です。 | bỏ `…`; còn 「Cảm ơn」 | tiếng Việt trong câu; nợ nội dung |
| mnn1-l09-9b42dc20 | [～は] ちょっと……。 | ちょっと……。 | `……` giữ nguyên |
| mnn1-l10-afad9dab | ATM | không đổi | chữ Latin |
| mnn1-l15-g-83a50111#2 | IMCは コンピューターソフトを 作って います。 | không đổi | chữ Latin |
| mnn1-l21-bf77411d | もう 帰らないと……。 | không đổi | `……` giữ nguyên |
| mnn1-l22-08b89cdf | Tシャツ | không đổi | chữ Latin |

**Rationale**: các quy tắc là đúng bản thiết kế đã chốt cộng với bước 5 (bảo đảm "chuỗi không có ký hiệu nào cần bỏ đọc y nguyên", kể cả khi có dấu cách lạ) và quy tắc "。、" ở bước 4 (spec: Assumptions, `→` giữa hai câu hoàn chỉnh).

**Alternatives considered**:
- Thay `[..]` bằng chuỗi rỗng không kèm khoảng trắng trước: để lại "いい てんき" và lệch `answers`; bỏ.
- Đổi `…` thành "。" hoặc "、": thêm dấu câu mới làm đổi ngữ điệu so với cái người dùng đã nghe và chọn; bỏ.
- Gộp khoảng trắng luôn: có thể đổi chuỗi mà spec bảo đọc y nguyên; bỏ.

## R-2. Truyền `kind` từ nơi gọi tới `speakJapanese`

**Decision**: `SpeakOptions.kind?: 'word' | 'sentence'` (mặc định `'word'`); `SpeakButton` có prop `kind` cùng kiểu, mặc định `'word'`, chuyển xuống `speakJapanese`. Chỉ `GrammarTab` truyền `'sentence'`.

**Rationale**: dấu `/` có hai nghĩa (cách viết khác ở từ vựng; danh sách ở câu ngữ pháp), nên không thể suy ra từ chuỗi. Chỉ một nơi gọi là câu; mặc định 'word' giữ 10 nơi gọi còn lại không phải sửa. Rủi ro khi nơi gọi tương lai quên truyền `'sentence'`: câu bị rút còn vế đầu. Giảm thiểu bằng ghi chú tên và chú thích trong hợp đồng (contracts) và test ở `GrammarTab` (xem quickstart).

**Alternatives considered**:
- Suy ra `kind` từ chuỗi (có `→` thì là câu): mong manh, bỏ.
- Dùng `answers.kanji[0] ?? answers.kana[0]` do bước build sinh sẵn: phải đổi cả 6 nơi gọi và `SpeakButton` nhận item thay vì chuỗi; `～` vẫn còn; không áp dụng cho câu ngữ pháp. Bỏ.
- Thêm trường `speak` lúc build: đụng pipeline, kiểu dữ liệu, `schemaVersion`; ngoài phạm vi (ghi vào nợ).

## R-3. Lớp của `stripBracket` và việc dùng chung

**Decision**: giữ hai bản. `stripBracket` ở `scripts/content/enrich.ts:51` chạy lúc build bằng Node, không thuộc lớp nào của ARCHITECTURE §4.2, và `tsconfig.app.json` chỉ bao `src`. `src/lib/` không được import từ `scripts/` trong mã chạy; ngược lại `scripts/` đã import từ `src/domain`. Chuyển `stripBracket` xuống `lib/` sẽ đụng pipeline (ngoài phạm vi).

**Rủi ro lệch hai bản**: được chặn bằng `scripts/content/speakable-content.test.ts`: với mọi từ, `toSpeakable(kana)` khớp `answers.kana[0]` và `toSpeakable(kanji)` khớp `answers.kanji[0]` (bỏ `～`, gộp khoảng trắng ở hai phía). Hiện 0 lệch. Nếu ai đổi một bản, test đỏ ngay.

**Alternatives considered**: import `stripBracket` từ `scripts/` vào `src/lib/`: phá luật lớp và bundle; bỏ.

## R-4. Trường mô tả đề của MCQ (`promptSpeak`)

**Decision**: một trường ba giá trị `'always' | 'after-answer' | 'never'` trên `McqQuestion`, do `buildPrompt` quyết định cho từng hướng. Một trường đủ cho cả hai yêu cầu (ngôn ngữ của đề và thời điểm cho nghe); không cần thêm trường `promptLang`.

**Rationale**: spec chỉ cần quyết định hiện/ẩn và thời điểm; tách "ngôn ngữ" ra trường riêng sẽ cần quy tắc suy diễn thứ hai. Không so khớp chuỗi (kiểu `promptText === item.kana`) vì dễ sai khi nghĩa tiếng Việt trùng chữ kana.

**Trạng thái "đã chọn"**: có sẵn ở `McqComponent.tsx:14` (`picked`), nên `after-answer` dùng được ngay mà không thêm state mới (xem D-1).

**Alternatives considered**: truyền cờ qua `DirectionConfig` thay cho `buildPrompt` (cũng đúng, nhưng prompt đã là nơi định nghĩa đề); sửa ở `McqComponent` bằng điều kiện theo `q.item` (so khớp chuỗi): bỏ.

## R-5. Test chuỗi chấm của chính tả nghe

**Decision**: `dictation.test.tsx` kiểm ba điều: (a) `grade()` trả `expected` là `item.kana` thô và chấp nhận đúng tập `answers.kana`; (b) `grade()` cho kết quả như nhau dù chuỗi đọc là gì (gõ chuỗi làm sạch không làm đúng thêm; gõ `answers.kana[0]` vẫn đúng); (c) `DictationComponent` đưa chuỗi đã làm sạch cho giọng đọc. Code chấm (`gradeTyped`, `registry`) không bị sửa.

**Rationale**: chứng minh FR-009 bằng hành vi, không chỉ bằng "không sửa file".

## R-6. E2E (Constitution IV: mỗi feature có ít nhất một e2e 360×740)

**Decision**: `tests/e2e/speakable.spec.ts` giả lập `speechSynthesis` bằng `page.addInitScript` (ghi lại các chuỗi `speak`), mở một bài có ví dụ ngữ pháp dạng hỏi–đáp, bấm loa và kiểm chuỗi đã làm sạch; rồi vào một trắc nghiệm `vi → Nhật` và kiểm không có nút loa ở đề. Playwright chạy trên bản `preview` đã build, nên cần `npm run build` và nội dung dựng sẵn; Q-2 của spec 001 (`browse.spec.ts` "mở trang chủ → …") đã biết là đỏ: chạy toàn bộ e2e trước và sau khi sửa, ghi cả hai kết quả vào `evidence.md`, không sửa Q-2 trong feature này và không dừng vì nó. Nếu có test e2e **khác** đỏ thêm sau khi sửa thì dừng và hỏi. Viewport 360×740 đặt bằng `test.use` trong file spec (config hiện chỉ có Desktop Chrome).

**Alternatives considered**: bỏ e2e (vi phạm Constitution IV); thử trên giọng thật trong CI (không có giọng Nhật trong headless).
