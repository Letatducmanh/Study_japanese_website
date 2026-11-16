# Data Model: kana-pronunciation

Không có bảng, `schemaVersion` hay nội dung học nào đổi. Feature thêm một file dữ liệu tĩnh và một trường tùy chọn ở kiểu câu hỏi trắc nghiệm. Mọi "chuỗi đọc" bên dưới được tính lúc bấm loa, không lưu.

## Chuỗi đọc (Speech string) — dẫn xuất, không lưu

| Nguồn | Chuỗi truyền vào `speakJapanese` | Làm sạch (`toSpeakable`) |
|---|---|---|
| Từ vựng (`VocabItem.kana`) | `kana` | `kind='word'`: bỏ `[..]`, `～`, chọn cách đầu ở " / " |
| Từ ví dụ Kanji (`KanjiExample.reading`) | `exampleWordSpeech(reading)` | `kind='word'` (không đổi thêm) |
| Chữ Kanji đơn (`KanjiItem.on`, `.kun`) | `kanjiCharSpeech(on, kun)` | `kind='word'` (không đổi thêm) |
| Câu ngữ pháp (`GrammarExample.jp`) | `jp` (không đổi) | `kind='sentence'` + bảng sửa cách đọc |

Quy tắc nhất quán: chuỗi đọc không bao giờ ghi vào `answers.*`, `kana`, `kanji`, `Attempt` hay `public/content`.

## Mục sửa cách đọc (Speech correction)

Nằm trong `content/overrides/speech-corrections.json`.

| Trường | Kiểu | Ràng buộc |
|---|---|---|
| `match` | string | không rỗng; đúng như chữ trong nội dung (kể cả dấu cách); không trùng `match` của mục khác; khớp ít nhất 1 câu thật |
| `speak` | string | không rỗng; khác `match`; chỉ kana, dấu cách và dấu câu (không chữ Hán) |
| `note` | string (tùy chọn) | lý do/ngày nghe ra, cho người bảo trì; mã không đọc |

Hình dạng file:

```json
{
  "sentence": [
    { "match": "あの 方", "speak": "あの かた", "note": "…" }
  ]
}
```

Kiểu trong mã (`src/lib/speakable.ts`): `interface SpeechCorrection { match: string; speak: string }` (mã không dùng `note`). Khóa `sentence` dành chỗ cho bảng khác sau này; hiện chỉ có bảng cho câu (spec: bảng không áp cho từ vựng).

Quan hệ: nhiều mục (không giới hạn) → áp cho mọi câu chứa `match`. Không có trạng thái, không chuyển trạng thái.

## `McqQuestion` (trường mới, tùy chọn)

`src/features/practice/modes/mcq/types.ts`:

| Trường | Kiểu | Ý nghĩa |
|---|---|---|
| `promptSpeech` | `string \| undefined` | chuỗi cho NÚT LOA ở đề; nếu có thì ưu tiên hơn `promptAudio`/`promptText`. Không ảnh hưởng tự đọc lúc mở (chỉ `promptAudio` tự đọc) |

Giá trị theo hướng:

| Hướng | `promptText` (hiển thị) | `promptAudio` (tự đọc, "Nghe lại") | `promptSpeech` (nút loa ở đề) | `promptSpeak` (spec 003) |
|---|---|---|---|---|
| `mcq-jp-vi` | kanji ?? kana | — | `kana` | `always` |
| `mcq-kanji-reading` | kanji | — | `kana` | `after-answer` |
| `mcq-kana-kanji` | kana | — | — (rơi về `promptText` = kana) | `always` |
| `mcq-listen-vi` | — | `kana` (đổi) | — | `never` |
| `mcq-vi-jp` | nghĩa | — | — | `never` |
| `mcq-vi-kanji` | nghĩa | — | — | `never` |

`grade()` của mọi hướng không đổi; `McqChoice` không đổi.

## Dữ liệu đọc (không đổi)

- `VocabItem`: `kana: string`, `kanji: string | null`, `answers.kana`/`kanji` (chấm điểm giữ nguyên).
- `KanjiItem`: `on: string[]`, `kun: string[]` (Kun có thể chứa "・"), `examples: KanjiExample[]`.
- `KanjiExample`: `word`, `reading` (có thể "a, b"), `kind`, `meaning`.
