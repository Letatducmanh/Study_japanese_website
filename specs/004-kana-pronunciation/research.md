# Research: kana-pronunciation

Mọi số liệu dưới đây đo trên nội dung đã dựng (`public/content/**`, 2026-11-12) và mã hiện tại bằng script tạm ở `.screens/` (`analyze-004.mjs`, `verify-004.mts`; không commit).

## R-1. Kết quả nghe thử của chủ dự án (đầu vào)

Từ `.screens/tts-compare.html` (spec 003):

| Nhóm | Nội dung | Kết quả |
|---|---|---|
| A | 45 từ có kanji dễ bị đọc nhầm | 6 "Kanji sai" (～人, あの方, 何, 何時, 何分, この間); 39 "Cả hai ổn"; **0 "Kana sai"** |
| B | 15 từ kanji đơn giản | 15/15 "Cả hai ổn" |
| C | 42 câu ngữ pháp | 41 đọc đúng; sai: `mnn1-l01-g-31547a22#0` "あの 方は どなたですか。" |

Kết luận dùng cho thiết kế: đọc kana không bao giờ tệ hơn đọc kanji ở mẫu đã nghe (0 "Kana sai" trong 60 từ), và sửa được cả 6 từ sai. Câu ví dụ giữ đọc theo chữ.

## R-2. Từ vựng: chuỗi đọc = `toSpeakable(kana, 'word')`

Chạy hàm thật của spec 003 trên 1.295 từ:

| Số đo | Kết quả |
|---|---|
| Chuỗi đọc rỗng | 0 |
| Còn chữ Hán (`\p{Script=Han}`) | 0 |
| Còn ký tự cấm (`[ ] ～ （ ） /`) | 0 |
| Từ có kanji: chuỗi đọc đổi so với hiện nay (kanji → kana) | 955 / 960 |

Các ví dụ FR-002, kết quả thật:

| Từ | Kana | Đọc (mới) | Đọc hiện nay |
|---|---|---|---|
| ～人 (`mnn1-l01-1680e7d7`) | ～じん | じん | 人 |
| ～人 (`mnn1-l11-a7b192f6`) | ～にん | にん | 人 |
| 何時 (`mnn1-l04-8d706fe3`) | なんじ | なんじ | 何時 |
| 何 (`mnn1-l02-5d0b2ce7`) | なん | なん | 何 |
| 何 (`mnn1-l06-f62659ee`) | なに | なに | 何 |
| 何分 (`mnn1-l04-b7902991`) | なんぷん | なんぷん | 何分 |
| あの方 (`mnn1-l01-e5f3861d`) | あのかた | あのかた | あの方 |
| この間 (`mnn1-l20-bd7514c7`) | このあいだ | このあいだ | この間 |
| [お]花見 (`mnn1-l06-216e7837`) | [お]はなみ | はなみ | 花見 |
| ～分 (`mnn1-l04-0a80e5db`) | ～ふん / ～ぷん | ふん | 分 |

Ghi chú: `何` và `～人` mỗi từ có **hai** mục trong nội dung (なん/なに; じん/にん), nên test tra theo cặp (kanji, kana), không theo kanji một mình.

Ký tự không phải kana còn lại trong `kana` của từ vựng: `～ ？ 。 [ ] 、 … ！ / ２ ３` và chữ Latin `A C D M T V` (ví dụ "DVD", "ATM"). Quy tắc làm sạch của spec 003 xử lý các ký hiệu bị cấm; chữ Latin và dấu câu còn lại giữ nguyên như hiện nay (không thuộc phạm vi spec này).

**Quyết định:** truyền thẳng `item.kana`, để `speakJapanese` làm sạch. Không thêm hàm "chuỗi đọc của từ vựng" riêng, vì `toSpeakable(kana, 'word')` đã là toàn bộ quy tắc và test nội dung kiểm đúng nó. Phương án đã bỏ: hàm `vocabSpeech(item)` bọc lại (thêm một đường làm sạch thứ hai, trái FR-012).

## R-3. Trang Kanji: quy tắc Kun, đo trên dữ liệu thật

Dữ liệu: 134 chữ; ký tự lạ duy nhất trong `kun`/`on` là "・" (chỉ ở Kun); `example.reading` chỉ chứa kana, ", " (2 mục) và dấu cách; 657/657 ví dụ có `reading` không rỗng.

- Không có On: 畑 (1 chữ). Không có Kun: 午 毎 週 駅 百 万 王 校 茶 肉 電 気 (12 chữ). Không chữ nào thiếu cả hai.
- Ví dụ có hai cách đọc ngăn bằng ", ": `十分: じゅっぷん, じっぷん`; `何: なに, なん`.
- 11 chữ có Kun đầu tiên là phần gốc của một Kun khác (Kun khác bắt đầu bằng Kun đầu + "・"): 白 (しろ → しろ・い), 一 (ひと → ひと・つ), 二, 三 (み → み・つ), 四, 五, 六, 七, 八, 九, 大 (おお → おお・きい).

Kết quả quy tắc đã chốt (On đầu、Kun đầu, mở rộng khi Kun đầu là phần gốc, bỏ "・"):

| Chữ | On | Kun | Cách đọc |
|---|---|---|---|
| 一 | イチ, イツ | ひと, ひと・つ | イチ、ひとつ |
| 二 | ニ | ふた, ふた・つ | ニ、ふたつ |
| 白 | ハク, ビャク | しろ, しろ・い | ハク、しろい |
| 人 | ジン, ニン | ひと | ジン、ひと |
| 上 | ジョウ, ショウ | うえ, うわ, かみ, あ・げる, あ・がる, のぼ・る | ジョウ、うえ |
| 大 | ダイ, タイ | おお, おお・きい | ダイ、おおきい |
| 行 | コウ, ギョウ, アン | い・く, ゆ・く, おこな・う | コウ、いく |
| 食 | ショク, ジキ | た・べる, く・う | ショク、たべる |

Quy tắc "Kun đầu tiên ở dạng có đuôi" (giả định cũ trong spec) bị bỏ vì cho 上 → "あげる" (Kun đầu tiên có "・" trong danh sách là あ・げる; Kun thông dụng của 上 là うえ). Với 食 và 行 hai quy tắc cho cùng kết quả (たべる, いく). Quy tắc đã chốt chỉ đổi đúng 11 chữ ở trên.

Chữ thiếu âm: 畑 (không On) → chỉ Kun đầu; 12 chữ không Kun → chỉ On đầu; không có "、" thừa.

Phương án đã bỏ: đọc cả danh sách On và Kun (dài, ngoài phạm vi: "nhiều nút đọc cho chữ Kanji đơn"); đọc Kun đầu chưa mở rộng ("イチ、ひと", không khớp ví dụ của chủ dự án).

## R-4. Câu ví dụ: ứng viên cho bảng sửa

292 câu ngữ pháp (nguồn duy nhất của "câu"; vocab, Kanji, ví dụ Kanji là từ). Quét câu chứa 方, 何, この間, và 間 không đi với 時:

| Mẫu | Số câu | Ghi chú |
|---|---|---|
| 方 | 2 | `mnn1-l01-g-31547a22#0` "あの 方は…" (đã biết sai, sửa); `mnn1-l14-g-0ce92322#0` "読み方を" (nằm trong 42 câu đã nghe, đúng) |
| 何 | 17 | `何歳`, `何ですか`, `何の`, `何を`, `何も`, `何が`, `何か`, `何時`, `何人`, `何曜日`; bản nghe thử trước đó chỉ lấy `何時`/`何人`, nên phần còn lại **chưa nghe** |
| この間 | 0 | không có câu nào |
| 間 (không phải 時間) | 1 | `mnn1-l10-g-34cc5788#2` "花屋の 間に" (あいだ/ま) |

Danh sách đầy đủ 20 câu đã dựng thành trang nghe `.screens/tts-sentences-004.html` (có nút "Đọc", đánh dấu đúng/sai, sao chép kết quả; câu `あの 方` có thêm nút "Đọc trước sửa"/"Đọc sau sửa"). Việc nghe để ở điểm dừng sau Story 4; kết quả quyết định có thêm mục vào bảng hay không. Plan **không** giả định câu nào khác sai: bảng chỉ có 1 mục cho tới khi chủ dự án nghe ra thêm.

Cụm "あの 方" xuất hiện đúng **1** câu trong 292 (`あの 方` có dấu cách); "あの方" viết liền không xuất hiện trong câu nào (là từ vựng).

## R-5. Nơi đặt bảng sửa cách đọc

| Phương án | Từ giáo trình ở đâu | Cần đổi pipeline | Đồng bộ | Chọn |
|---|---|---|---|---|
| `content/overrides/speech-corrections.json` nhập tĩnh | trong file dữ liệu | Không (pipeline đọc 3 file yaml theo đường dẫn tường minh) | Có | **Chọn** |
| `src/lib/speech-corrections.json` | trong cây `src/` | Không | Có | Dự phòng (D-1) |
| `content/overrides/*.yaml` qua pipeline → `public/content` | trong yaml | **Có** (cấm) | Không (tải bất đồng bộ) | Bỏ |
| Hằng số trong `speakable.ts` | **trong mã** (vi phạm Constitution I) | Không | Có | Bỏ |
| Trường `speak` trong `content/**/*.md` | trong `.md` | Có (parser, test, tài liệu) | Không | Bỏ (đã ghi nợ ở ROADMAP) |

Kiểm tra mã hiện có: `scripts/content/pipeline.ts` đọc `overrides/pos.yaml`, `verb-groups.yaml`, `id-aliases.yaml`; không quét thư mục, nên file thứ tư không ảnh hưởng. Chứng minh bằng thực nghiệm ở Story 4: băm `public/content/**` trước và sau.

`tsconfig.app.json` có `moduleResolution: "bundler"` (mặc định cho phép nhập JSON) và `include: ["src"]`; TypeScript vẫn nạp file JSON ngoài `include` khi được import. `tsconfig.node.json` (`module: nodenext`) không dùng tới vì `speakable.ts` không import JSON (D-1).

## R-6. Thiết kế một lượt cho bảng sửa

Áp bảng bằng một biểu thức chính quy ghép các `match` (escape ký tự đặc biệt, mục dài trước), thay theo bảng tra, trên chuỗi gốc trước các quy tắc khác. Hai lý do thứ tự "trước": (1) làm sạch sau đó gộp khoảng trắng, mất dấu cách của "あの 方"; (2) `match` luôn tính theo chữ trong nội dung như spec yêu cầu. Một lượt để mục A không khớp lại trong kết quả của mục B. Chi phí: không đo được (một bảng một mục, câu < 100 ký tự).

## R-7. Test hiện có bị ảnh hưởng

Tìm trong `*.test.ts(x)` và `tests/e2e`: `dictation.test.tsx` (3 test, đọc `speak.mock.calls`), `McqComponent.test.tsx`, `tts.test.ts`, `SpeakButton.test.tsx`, `speakable.spec.ts`. Chưa có test nào kiểm chuỗi đọc ở `VocabTab`, `SearchPage` (chỉ test debounce), `FlashcardComponent`, `KanjiPage`. Test sẽ phải thêm mới; test chính tả nghe hiện có cần cập nhật kỳ vọng chuỗi đọc (kanji → kana) ở Story 2, và đó là thay đổi hành vi có chủ ý (ghi rõ trong `evidence.md`, không phải test "đỏ lại xanh").

## R-8. Phương án nghe tại điểm dừng

- Điểm dừng 1: bảng mục trong ứng dụng thật (`npm run dev`), giọng của máy chủ dự án (đã dùng cho `tts-compare.html`).
- Sau Story 4: `.screens/tts-sentences-004.html` (20 câu), kết quả đúng/sai sao chép được.
