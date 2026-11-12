# Hợp đồng nội bộ: speakable-text

Không có API ngoài. Đây là hợp đồng giữa các module trong `src/`. Test của feature kiểm đúng các điều dưới đây.

## C-1. `toSpeakable(text: string, kind?: SpeakKind): string` — `src/lib/speakable.ts`

- **Chỉ dùng cho việc đọc. KHÔNG dùng để chấm điểm, hiển thị hay lưu.** Ghi dòng này làm chú thích đầu hàm.
- Thuần, không phụ thuộc DOM, React, `window`. `kind` mặc định `'word'`.
- Quy tắc theo [research.md](../research.md) R-1, thứ tự cố định.
- Bất biến:
  1. chuỗi không chứa ký hiệu nào bị quy tắc xử lý → trả về **đúng chuỗi đầu vào** (kể cả khoảng trắng);
  2. kết quả không chứa `[ ] ［ ］ ～ 〜 ~` ; với `'sentence'` còn không chứa `（ ） ( ) → / ／`; với `'word'` không chứa `/ ／`;
  3. `……` (hai dấu liền) luôn được giữ; chỉ `…` đơn bị bỏ ở `'sentence'`;
  4. kết quả có thể là chuỗi rỗng (khi đầu vào chỉ gồm ký hiệu bị bỏ).

Bảng ví dụ bắt buộc có test (copy từ spec FR-002, FR-004, FR-005):

| kind | Vào | Ra |
|---|---|---|
| word | どうぞ よろしく [お願いします]。 | どうぞ よろしく。 |
| word | [お]土産 | 土産 |
| word | 綺麗 [な] | 綺麗 |
| word | [～を] 見せて ください。 | 見せて ください。 |
| word | きます [シャツを～] | きます |
| word | ～さん | さん |
| word | こちらは ～さんです。 | こちらは さんです。 |
| word | ～歳 | 歳 |
| word | 晩 / 夜 | 晩 |
| word | [～は] ちょっと……。 | ちょっと……。 |
| word | [どうも] ありがとう [ございます]。 | ありがとう。 |
| word | ～かい / ～がい | かい |
| word | いい [お]てんきですね。 | いいてんきですね。 |
| sentence | ミラーさんは アメリカ人ですか。 …はい、アメリカ人です。 | ミラーさんは アメリカ人ですか。 はい、アメリカ人です。 |
| sentence | 書きます → 書いて / 飲みます → 飲んで / 待ちます → 待って | 書きます、書いて、飲みます、飲んで、待ちます、待って |
| sentence | 行きます（lịch sự）→ 行く（thông thường） | 行きます、行く |
| sentence | わたしは てんぷらを（が） 食べたいです。 | わたしは てんぷらを 食べたいです。 |
| sentence | ここに 荷物を 置かないで ください。 → 荷物は ここに 置かないで ください。 | ここに 荷物を 置かないで ください。 荷物は ここに 置かないで ください。 |
| sentence | 会社の 食堂で 昼ごはんを 食べます。 → 昼ごはんは 会社の 食堂で 食べます。 | 会社の 食堂で 昼ごはんを 食べます。 昼ごはんは 会社の 食堂で 食べます。 |
| sentence | 日曜日 どこ[へ]も 行きませんでした。 | 日曜日 どこも 行きませんでした。 |
| sentence | 日本料理［の 中］で 何が いちばん おいしいですか。 …てんぷらが いちばん おいしいです。 | 日本料理で 何が いちばん おいしいですか。 てんぷらが いちばん おいしいです。 |
| word | いい [お]天気ですね。 | いい天気ですね。 |

Bảng "đọc y nguyên" (đầu ra bằng đầu vào): `マイク・ミラー`, `寝る まえに、「お休みなさい」と 言います。` (sentence), `CD`, `Tシャツ`, `地下1階`, `もう 帰らないと……。`, `お名前は？`, `わたし`, `食べます`.

## C-2. `speakJapanese(text, options?)` — `src/lib/tts.ts`

- `SpeakOptions` có thêm `kind?: SpeakKind` (mặc định `'word'`).
- Chuỗi đưa cho `SpeechSynthesisUtterance` là `toSpeakable(text, kind)`.
- Không làm gì (không `cancel`, không `speak`) khi chuỗi gốc rỗng **hoặc** chuỗi đã làm sạch rỗng (FR-011).
- Mọi thứ khác giữ nguyên: huỷ câu đang đọc, `lang='ja-JP'`, chọn giọng, tốc độ.

## C-3. `SpeakButton` — `src/ui/jp/SpeakButton.tsx`

- Props: `text`, `className?`, `kind?: SpeakKind` (mặc định `'word'`).
- Bấm → `speakJapanese(text, { kind })`. Hành vi tự ẩn khi không có giọng Nhật giữ nguyên.

## C-4. `McqQuestion.promptSpeak` — `src/features/practice/modes/mcq/types.ts` (Story 2)

- Trường bắt buộc kiểu `'always' | 'after-answer' | 'never'`, giá trị theo bảng ở [data-model.md](../data-model.md).
- `McqComponent` hiện `SpeakButton` ở đề khi và chỉ khi `promptText` có và (`promptSpeak === 'always'` hoặc (`promptSpeak === 'after-answer'` và đã chọn đáp án)).
- Tự đọc và nút "nghe lại" phụ thuộc `promptAudio`, không phụ thuộc `promptSpeak`.
- `grade()` không đổi; kết quả `{ correct, expected, given }` giống hệt.

## C-5. Bất biến toàn feature (FR-009, FR-010)

- Chuỗi hiển thị, chuỗi trong nội dung và `answers.*` không đổi.
- Tập đáp án chấp nhận và kết quả đúng/sai của chính tả nghe không đổi.
- Không file nào trong `src/domain/quiz/registry.ts`, `src/domain/quiz/grading.ts`, session runner, `scripts/content/**`, `public/content/**`, `content/**` bị sửa. Kiểm bằng `git diff --stat` trong quickstart.
