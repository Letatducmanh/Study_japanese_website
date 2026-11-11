# Data Model: speakable-text

Không đổi dữ liệu lưu trữ, nội dung đã dựng, schema Zod, IndexedDB hay `schemaVersion`. Chỉ có hai kiểu mới trong mã, đều không được lưu.

## SpeakKind (`src/lib/speakable.ts`)

`'word' | 'sentence'`

| Giá trị | Dùng cho | Khác biệt |
|---|---|---|
| `word` (mặc định) | từ vựng, chữ Kanji, từ ví dụ Kanji | `/` là "cách viết khác": đọc cách viết đầu tiên |
| `sentence` | câu ví dụ ngữ pháp | `→` và `/` là danh sách: nối bằng `、`; bỏ `（..）`; bỏ `…` đơn |

## SpeakOptions (`src/lib/tts.ts`)

| Trường | Kiểu | Mặc định | Ghi chú |
|---|---|---|---|
| `rate` | `number` | 1 | không đổi |
| `kind` | `SpeakKind` | `'word'` | MỚI |

## PromptSpeak (`src/features/practice/modes/mcq/types.ts`, Story 2)

`'always' | 'after-answer' | 'never'`

`McqQuestion.promptSpeak: PromptSpeak` — MỚI, bắt buộc, do `buildPrompt` của từng hướng quyết định:

| Hướng | Giá trị |
|---|---|
| `mcq-jp-vi` | `always` |
| `mcq-vi-jp` | `never` |
| `mcq-kanji-reading` | `after-answer` |
| `mcq-kana-kanji` | `always` |
| `mcq-listen-vi` | `never` (đề là âm thanh; nút nghe lại và tự đọc theo `promptAudio`) |
| `mcq-vi-kanji` | `never` |

## Không đổi (để đối chiếu)

- `VocabItem` (`kana`, `kanji`, `meaning`, `answers.{kana,kanji,meaning}`), `KanjiItem`, `GrammarExample`: giữ nguyên; `toSpeakable` chỉ đọc chuỗi, không ghi ngược.
- `QuestionType.grade()` của mọi dạng, `gradeTyped`, `registry`, session: giữ nguyên.

## Ràng buộc

- `toSpeakable` là hàm thuần: cùng đầu vào cho cùng đầu ra; không đọc `window`; không đổi đầu vào.
- Chuỗi đã làm sạch chỉ đi vào `SpeechSynthesisUtterance`; không được truyền vào grading, `Attempt`, hiển thị hay lưu.
