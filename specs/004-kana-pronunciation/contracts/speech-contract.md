# Contract: chuỗi đọc (kana-pronunciation)

Mở rộng contract của spec 003 (`specs/003-speakable-text/contracts/speakable-contract.md`). Mọi quy tắc cũ của `toSpeakable` giữ nguyên.

## C-1. `toSpeakable` nhận bảng sửa (US4)

```ts
export interface SpeechCorrection { match: string; speak: string }

export function toSpeakable(
  text: string,
  kind: SpeakKind = 'word',
  corrections: readonly SpeechCorrection[] = [],
): string
```

- `corrections` chỉ có tác dụng khi `kind === 'sentence'`; với `'word'` bị bỏ qua.
- Áp trên chuỗi gốc, **trước** mọi quy tắc làm sạch khác, một lượt (mục dài trước; kết quả của mục này không khớp lại ở mục khác), khớp đúng chữ (phân biệt dấu cách), mọi vị trí.
- Mục có `match` rỗng bị bỏ qua. Không mục nào khớp: hành vi y như spec 003 (kể cả "trả về y nguyên khi không đổi").
- Hàm thuần; không import JSON; không DOM.

| Vào (sentence) | Bảng | Ra |
|---|---|---|
| `あの 方は どなたですか。 …ワット先生です。` | `[{あの 方 → あの かた}]` | `あの かたは どなたですか。 ワット先生です。` |
| `あの 方は どなたですか。` | `[]` | `あの 方は どなたですか。` |
| `あの方は…` (viết liền) | `[{あの 方 → あの かた}]` | không đổi |
| `４人です。` / `６月13日です。` | bảng thật | không đổi |
| chuỗi giả có hai mục chồng lên nhau | bảng thử trong test | một lượt, không áp chồng |

## C-2. `speakJapanese` truyền bảng đã nạp

`src/lib/tts.ts` nạp `content/overrides/speech-corrections.json` và gọi `toSpeakable(text, kind, kind === 'sentence' ? table.sentence : [])`. Chữ ký công khai (`speakJapanese(text, { rate, kind })`) không đổi; mọi nơi gọi hiện có không phải sửa để được áp bảng (`GrammarTab.tsx:92` không đổi mã).

## C-3. `exampleWordSpeech(reading: string): string` (US3)

Cách đọc đầu tiên của từ ví dụ. Tách ở ", " (cho phép khoảng trắng hai bên), lấy phần đầu không rỗng sau `trim`; không có phần nào thì trả về `''`.

| Vào | Ra |
|---|---|
| `ひとり` | `ひとり` |
| `じゅっぷん, じっぷん` | `じゅっぷん` |
| `なに, なん` | `なに` |
| rỗng hoặc chỉ ", " | rỗng |

## C-4. `kanjiCharSpeech(on: readonly string[], kun: readonly string[]): string` (US3)

1. `onFirst` = On đầu tiên (đã `trim`, nếu có).
2. `kunFirst` = Kun đầu tiên. Nếu `kunFirst` không chứa "・" **và** có Kun `k` trong danh sách bắt đầu bằng `kunFirst + "・"` thì dùng `k` đầu tiên khớp; ngược lại dùng `kunFirst`.
3. Bỏ mọi "・" ở cả hai.
4. Nối các phần không rỗng bằng "、". Không có âm nào thì rỗng.

| Chữ | on | kun | Ra |
|---|---|---|---|
| 一 | イチ, イツ | ひと, ひと・つ | `イチ、ひとつ` |
| 二 | ニ | ふた, ふた・つ | `ニ、ふたつ` |
| 白 | ハク, ビャク | しろ, しろ・い | `ハク、しろい` |
| 人 | ジン, ニン | ひと | `ジン、ひと` |
| 上 | ジョウ, ショウ | うえ, うわ, かみ, あ・げる, あ・がる, のぼ・る | `ジョウ、うえ` |
| 大 | ダイ, タイ | おお, おお・きい | `ダイ、おおきい` |
| 行 | コウ, ギョウ, アン | い・く, ゆ・く, おこな・う | `コウ、いく` |
| 食 | ショク, ジキ | た・べる, く・う | `ショク、たべる` |

Chữ thiếu âm: 畑 (không On) chỉ ra Kun đầu; 12 chữ không Kun (午, 毎, 週, 駅, 百, 万, 王, 校, 茶, 肉, 電, 気) chỉ ra On đầu; không có "、" thừa. Test lấy dữ liệu thật của 畑 và 午 từ nội dung dựng ra.

## C-5. Cách thêm một mục vào bảng (SC-008)

Thêm một đối tượng vào mảng `sentence` của `content/overrides/speech-corrections.json`: `match` = đúng chữ trong câu (kể cả dấu cách), `speak` = cách đọc thay, `note` = lý do. Không sửa mã. Test `speech-corrections` kiểm: không rỗng, không trùng, `speak` khác `match` và không chữ Hán, `match` khớp ít nhất một câu trong nội dung dựng ra.

## C-6. Trắc nghiệm: `promptSpeech`

`McqComponent` nút loa ở đề đọc `q.promptSpeech ?? q.promptAudio ?? q.promptText`. Điều kiện hiện nút vẫn do `promptSpeak` quyết định (spec 003); tự đọc vẫn chỉ do `promptAudio`. Bảng giá trị: `data-model.md`.

## C-7. Chấm điểm không đổi

- `dictationQuestionType.grade` không đổi: `gradeTyped(given, question.item.answers.kana)`; `expected` vẫn là `question.item.kana`.
- `answers.kana`, `answers.kanji` và `grade()` của mọi hướng trắc nghiệm không đổi. Kiểm: `git diff` không có hunk trong `grade`, và test đặc trưng (gõ `なんじ` đúng, `いつ` sai).

## C-8. Chỉ một đường đọc (FR-012)

Lệnh kiểm (như spec 003): chỉ `src/lib/tts.ts` được dùng `speechSynthesis`/`SpeechSynthesisUtterance` (ngoài file test và `src/test/setup.ts`):

```
grep -rnE "SpeechSynthesisUtterance|speechSynthesis" src --include=*.ts --include=*.tsx | grep -vE ".test.tsx?:" | grep -vE "^src/(lib/tts|test/setup).ts:"
```

Kết quả phải rỗng. Thêm một lệnh kiểm: sau Story 2 không còn nơi nào truyền `kanji ?? kana` cho `SpeakButton`/`speakJapanese` ở `src/features`:

```
grep -rnE "kanji \?\? (q\.item\.|item\.|r\.)?kana" src/features --include=*.tsx --include=*.ts | grep -E "Speak|speak"
```

phải rỗng (loại các dòng hiển thị `Ruby`, vì lệnh lọc theo "Speak").
