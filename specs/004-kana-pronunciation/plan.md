# Implementation Plan: kana-pronunciation — từ vựng được đọc theo cách đọc kana

**Branch**: `004-kana-pronunciation` (đã có và đang là nhánh hiện tại; tách từ `staging` đã có spec 003) | **Date**: 2026-11-12 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/004-kana-pronunciation/spec.md`

## Summary

Chỉ chuỗi được ĐỌC thay đổi. Bốn việc, mỗi việc một commit:

1. **Từ vựng ở danh sách, tìm kiếm, flashcard** (US1): truyền `item.kana` thay `item.kanji ?? item.kana` cho `SpeakButton`. `speakJapanese` vẫn gọi `toSpeakable(…, 'word')` bên trong (đã có từ spec 003), nên `～じん` → `じん`, `[お]はなみ` → `はなみ`, `～ふん / ～ぷん` → `ふん`.
2. **Chính tả nghe và trắc nghiệm** (US2): `dictation` đọc `q.item.kana` (chấm điểm không đổi). `mcq-listen-vi` đặt `promptAudio = item.kana`. `mcq-jp-vi` và `mcq-kanji-reading` thêm trường mới `promptSpeech` (chuỗi cho NÚT LOA ở đề; không đụng `promptAudio` nên không bật tự đọc); đề vẫn hiển thị chữ Hán. Chỉ sửa trong `src/features/practice/modes/mcq/` và `dictation/`.
3. **Trang Kanji** (US3): hai hàm thuần mới trong `src/lib/speakable.ts`: `exampleWordSpeech(reading)` (cách đầu tiên ở ", ") và `kanjiCharSpeech(on, kun)` (On đầu、Kun đầu; Kun đầu chỉ mở rộng thành dạng có đuôi khi nó là phần gốc của Kun khác; bỏ "・").
4. **Bảng sửa cách đọc cho câu** (US4): file dữ liệu `content/overrides/speech-corrections.json` (một mục: "あの 方" → "あの かた"); `toSpeakable(text, 'sentence', corrections)` áp bảng trước các quy tắc khác, khớp đúng chữ, một lượt; `speakJapanese` truyền bảng đã nạp. Thêm mục = thêm dữ liệu, không sửa mã.

Không sửa registry, session, grading, pipeline, nội dung `.md`, `schemaVersion`; không dời `lib/tts.ts`; không thêm thư viện.

Đầu vào đã đọc: `.screens/tts-compare.html` (kết quả nghe: nhóm A 45 từ có 6 "Kanji sai" là ～人, あの方, 何, 何時, 何分, この間, 39 "Cả hai ổn", 0 "Kana sai"; nhóm B 15/15 ổn; nhóm C 41/42 câu đúng, sai ở `mnn1-l01-g-31547a22#0`), `src/lib/speakable.ts` và `tts.ts` (spec 003), `modes/mcq/` (`promptSpeak`), dữ liệu thật trong `public/content/` (số liệu ở [research.md](research.md)).

## Technical Context

**Language/Version**: TypeScript strict (không `any`), React 19

**Primary Dependencies**: không thêm thư viện mới

**Storage**: N/A cho tiến độ. Một file dữ liệu tĩnh mới `content/overrides/speech-corrections.json` (nạp lúc build, vào bundle)

**Testing**: Vitest + Testing Library; test nội dung chạy `runContentPipeline` ra thư mục tạm (như `scripts/content/speakable-content.test.ts`); Playwright e2e viewport 360×740

**Target Platform**: web (Vercel) và app Capacitor sau này; Web Speech API có sẵn

**Project Type**: web app một codebase (`src/`)

**Performance Goals**: không đo được độ trễ (chuỗi ngắn, một bảng một mục); JS ban đầu tăng < 1 KB gzip, vẫn dưới ngân sách 200 KB (hiện 186,16 KB)

**Constraints**: hàm trong `speakable.ts` thuần, không DOM (file còn được `scripts/` import); chuỗi đọc không bao giờ lưu ngược vào nội dung hay dùng chấm điểm; mọi nơi đọc đi qua `speakJapanese`

**Scale/Scope**: 11 nơi gọi (bảng dưới), 1.295 từ vựng, 134 chữ Kanji, 657 từ ví dụ, 292 câu ngữ pháp

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Nguyên tắc | Đánh giá |
|---|---|
| I. Nội dung là dữ liệu | PASS có chú thích. Mã (`speakable.ts`, `tts.ts`, component) không chứa từ giáo trình; cụm sửa ("あの 方") nằm trong file dữ liệu `content/overrides/speech-corrections.json`, cùng chỗ với các file ghi đè khác (ARCHITECTURE §8.1: `content/overrides/`). Test chứa chuỗi Nhật làm ví dụ, như các test hiện có. Xem D-1. |
| II. Local-first | PASS. Không đụng lưu trữ; không gọi mạng thêm (bảng sửa nằm trong bundle). |
| III. Phân lớp & điểm cắm | PASS. `lib/` thuần; `ui/jp/SpeakButton` không đổi; `features/browse` chỉ đổi chuỗi truyền vào; phần trắc nghiệm nằm trọn trong `features/practice/modes/mcq/`, chính tả nghe trong `modes/dictation/`. Không sửa registry, session runner, `domain/quiz/grading.ts`. |
| IV. Test trước | PASS có điều kiện: mỗi story viết test, chạy thấy ĐỎ, ghi `evidence.md`, rồi mới sửa mã. Có e2e Playwright 360×740 (`tests/e2e/kana-speech.spec.ts`, thêm dần theo story). |
| V. Phát hiện điểm yếu | PASS, cải thiện: kỹ năng `listening` giờ phản ánh đúng khả năng nghe vì âm thanh là cách đọc đúng. `Attempt` không đổi. |
| VI. Giao diện | PASS. Không thêm class màu, chuỗi giao diện hay token; không đổi bố cục (nút loa vẫn là `SpeakButton`; `promptSpeech` không đổi hiển thị). |
| VII. Bảo mật & bản quyền | PASS. Không đổi. |

Post-design (sau Phase 1): vẫn PASS. D-1 (vị trí file dữ liệu) đã được chủ dự án xác nhận; không có vi phạm cần ghi vào Complexity Tracking.

**Điểm dừng và hỏi** (theo yêu cầu): test dự kiến đỏ mà xanh ngay; cách sửa buộc đụng vùng cấm hoặc đụng ngoài `modes/mcq/` cho phần trắc nghiệm; lint đỏ vì luật lớp; cổng đỏ hai lần liên tiếp. **Không thêm ngoại lệ ESLint** (không thêm khối `block(...)` hay chỉnh `eslint.config.js`) và **không dùng `eslint-disable`**: lint đỏ thì dừng và hỏi, không tự nới luật.

## Điều kiện trước khi làm (cơ chế xác định feature)

| Cơ chế | Giá trị hiện tại | Trỏ về 004? |
|---|---|---|
| `.specify/feature.json` | `specs/004-kana-pronunciation` | Đúng |
| Biến `SPECIFY_FEATURE`, `SPECIFY_FEATURE_DIRECTORY` | trống | Không ảnh hưởng |
| `setup-plan.ps1` (đọc `feature.json`) | `FEATURE_DIR` = `specs/004-kana-pronunciation` | Đúng |
| Tên nhánh git | `004-kana-pronunciation` (nhánh hiện tại) | Đúng |

Nhánh `004-kana-pronunciation` đã có và đang là nhánh hiện tại. Kho cục bộ `staging` là `69fc5d8` ("Merge pull request #3 from Letatducmanh/003-speakable-text", gồm `fcf422f` và `9a8527b`): spec 003 đã nằm trong `staging`, nên `promptSpeak` có trong `modes/mcq/types.ts`. Task T001 vẫn kiểm lại bằng nội dung mã (không dựa vào mã commit, vì merge kiểu squash làm đổi mã) và dừng hỏi nếu thiếu.

## Các quyết định cần nêu rõ

### D-1. Bảng sửa cách đọc: file dữ liệu ở đâu, nạp thế nào

**Chọn:** `content/overrides/speech-corrections.json`, nhập tĩnh vào `src/lib/tts.ts` (`import corrections from '../../content/overrides/speech-corrections.json'`), truyền vào `toSpeakable` làm tham số thứ ba. `speakable.ts` KHÔNG import file này (giữ nó thuần, không JSON; xem lý do `tsconfig.node.json` bên dưới).

```json
{
  "sentence": [
    { "match": "あの 方", "speak": "あの かた", "note": "…" }
  ]
}
```

Lý do:
- Ràng buộc "từ giáo trình không nằm trong mã" (Constitution I): cụm "あの 方" nằm trong JSON dữ liệu, không trong `.ts`.
- ARCHITECTURE §8.1 đã có `content/overrides/` cho dữ liệu ghi đè (`pos.yaml`, `verb-groups.yaml`, `id-aliases.yaml`). Đây là file cùng loại.
- Không đổi pipeline: `pipeline.ts` đọc đúng ba file yaml theo đường dẫn tường minh (`overrides/pos.yaml`, `verb-groups.yaml`, `id-aliases.yaml`), nên một file thứ tư ở đó không được đọc và không ảnh hưởng `public/content`. Phần chứng minh bằng thực nghiệm: băm toàn bộ `public/content/**` (bỏ `public/content/README.md`, file duy nhất git theo dõi ở đó) trước và sau khi thêm file, phải giống hệt (Story 4); mốc "trước" chỉ ghi sau khi hai lần `content:build` liên tiếp cho cùng băm (đã đo 2026-11-12: hai lần dựng vào thư mục tạm cho cùng băm, nội dung dựng không có trường thời gian).
- Không cần tải bất đồng bộ: hàm đọc phải đồng bộ (bấm loa gọi ngay). Nhập tĩnh đưa bảng vào bundle (khoảng vài chục byte mỗi mục).
- Chỉ nhập JSON ở `tts.ts`, không ở `speakable.ts`: `scripts/content/speakable-content.test.ts` import `speakable.ts` và bị `tsconfig.node.json` (`module: nodenext`) biên dịch; nhập JSON ở đó cần thuộc tính `with { type: 'json' }` và cấu hình thêm. Truyền bảng làm tham số còn cho test thêm mục thử mà không đụng file thật (SC-008).

**Phương án đã bỏ:**
- `src/lib/speech-corrections.json` hoặc `.ts`: dễ hơn (không đụng `content/`) nhưng đặt từ giáo trình trong cây mã.
- `content/overrides/*.yaml` qua pipeline sinh ra `public/content`: đúng mô hình nhưng phải sửa pipeline (cấm) và tải bất đồng bộ.
- Nhúng bảng vào `content/**/*.md`: phải đổi định dạng `.md` (parser + test + tài liệu).

**Đã được chủ dự án xác nhận** (bước tasks): vị trí `content/overrides/speech-corrections.json`. Đây là chỗ mới cho mã ứng dụng đọc trực tiếp `content/` (trước nay chỉ pipeline đọc); vì vậy Story 4 sửa đúng một dòng ở `docs/ARCHITECTURE.md` §8.1 để ghi nhận. Phương án dự phòng không còn cần: `src/lib/speech-corrections.json`. Bước kiểm vùng cấm của Commit 4 loại trừ đúng đường dẫn `content/overrides/speech-corrections.json` (so khớp nguyên dòng, không ký tự đại diện, không loại cả `content/**`).

### D-2. Quy tắc Kun (chủ dự án đã chốt)

Kun đầu tiên; chỉ khi Kun đó là phần gốc của một Kun khác trong danh sách (Kun khác bắt đầu bằng `<Kun đầu> + "・"`) thì lấy Kun khác đầu tiên khớp; bỏ mọi "・". Không dùng "Kun đầu tiên có ・" (sẽ làm 上 thành "あげる": Kun đầu tiên có "・" là あ・げる). Kết quả đo trên dữ liệu thật ([research.md](research.md) R-3): 一 → イチ、ひとつ; 二 → ニ、ふたつ; 白 → ハク、しろい; 人 → ジン、ひと; 上 → ジョウ、うえ; 大 → ダイ、おおきい; 行 → コウ、いく; 食 → ショク、たべる. Đúng 11 chữ bị mở rộng (白, 一 đến 九, 大). `spec.md` (FR-007, Assumptions) đã sửa cho khớp.

### D-3. Chuỗi đọc riêng cho trắc nghiệm: `promptSpeech`

`McqComponent` có hai chuỗi cạnh nhau: `promptAudio` (tự đọc lúc mở + nút "Nghe lại", dùng khi đề là âm thanh) và nút loa ở đề (`SpeakButton text={q.promptAudio ?? q.promptText}`, dòng 41). Với `mcq-jp-vi`, đặt `promptAudio = kana` sẽ bật tự đọc (sai hành vi đã chốt). Do đó thêm trường tùy chọn **`promptSpeech?: string`** cho `McqQuestion`; nút loa đọc `q.promptSpeech ?? q.promptAudio ?? q.promptText`. `buildPrompt` thêm `speech?: string`. `mcq-jp-vi` và `mcq-kanji-reading` đặt `speech: item.kana`. `mcq-kana-kanji` (đề là kana), `mcq-vi-jp`, `mcq-vi-kanji`, `mcq-listen-vi` không đặt `speech`. Chỉ đụng `types.ts`, `index.ts`, `McqComponent.tsx` trong `modes/mcq/`.

### D-4. Câu hỏi MCQ rút từ phiên cũ

`McqQuestion` được sinh lại mỗi lần (`generate`), không lưu. Trường mới tùy chọn nên câu dựng tay hoặc test cũ không có `promptSpeech` vẫn chạy (rơi về `promptAudio ?? promptText`).

### D-5. Nơi đặt hai hàm Kanji

`kanjiCharSpeech(on: readonly string[], kun: readonly string[])` và `exampleWordSpeech(reading: string)` nằm trong `src/lib/speakable.ts` (cùng chỗ với `toSpeakable`), nhận kiểu nguyên thủy, không import `domain/` (lớp `lib` không phụ thuộc `domain`). Kết quả vẫn đi qua `speakJapanese` nên được làm sạch như mọi chuỗi (FR-012). Không thêm giá trị `kind` mới.

### D-6. Test nội dung: thêm vào file hiện có, không thêm lần chạy pipeline thứ tư

`speakable-content.test.ts` đã chạy `runContentPipeline` ra thư mục tạm (≈12,5 giây CPU, trong bộ test có 5 test cũ dễ hết giờ khi máy bận). Thêm `describe` mới vào đúng file đó (dùng chung `beforeAll`) thay vì file mới, để không thêm lần chạy pipeline thứ tư. Đây là file thuộc spec 003, cùng thư mục `scripts/content/`; bước kiểm vùng cấm loại trừ đúng đường dẫn này. Nếu chủ dự án muốn file riêng thì chuyển thành `scripts/content/kana-speech-content.test.ts` với `vi.setConfig({ testTimeout: 30000, hookTimeout: 30000 })` và chấp nhận thêm khoảng 12 giây CPU.

### D-7. Quy tắc áp bảng sửa

- Chỉ cho `kind === 'sentence'` (từ vựng đọc theo kana, không cần).
- Áp lên chuỗi gốc **trước** mọi quy tắc làm sạch khác (để khớp đúng chữ trong nội dung, kể cả dấu cách; làm sạch sau đó gộp khoảng trắng nên "あの 方" sẽ không còn khớp nếu áp sau).
- Một lượt, mọi mục cùng lúc (biểu thức chính quy ghép các `match` đã escape, mục dài đứng trước), nên mục này không khớp lại trong kết quả của mục kia.
- Bỏ qua mục có `match` rỗng. `match` khớp ở mọi vị trí trong câu (`replaceAll`).
- Không có mục khớp: chuỗi trả về y như trước (kể cả dấu cách).

## Nơi gọi

Từng nơi truyền chuỗi cho giọng đọc (đã đọc mã thật ngày 2026-11-12). "Sau" là chuỗi truyền vào `SpeakButton`/`speakJapanese`; `speakJapanese` tự gọi `toSpeakable`.

| # | File:dòng | Trước | Sau | Story |
|---|---|---|---|---|
| 1 | `src/features/browse/VocabTab.tsx:131` | `item.kanji ?? item.kana` | `item.kana` | US1 |
| 2 | `src/features/browse/SearchPage.tsx:74` | `r.kanji ?? r.kana` | `r.kana` | US1 |
| 3 | `src/features/practice/modes/flashcard/FlashcardComponent.tsx:104` | `item.kanji ?? item.kana` | `item.kana` | US1 |
| 4 | `src/features/practice/modes/dictation/DictationComponent.tsx:17` (tự đọc) | `q.item.kanji ?? q.item.kana` | `q.item.kana` | US2 |
| 5 | `src/features/practice/modes/dictation/DictationComponent.tsx:34` (nghe lại) | `q.item.kanji ?? q.item.kana` | `q.item.kana` | US2 |
| 6 | `src/features/practice/modes/mcq/index.ts:145` (`mcq-listen-vi`, `buildPrompt.audio`) | `item.kanji ?? item.kana` | `item.kana` (tự đọc `McqComponent.tsx:17` và "Nghe lại" `:51` tự theo) | US2 |
| 7 | `src/features/practice/modes/mcq/index.ts:95` (`mcq-jp-vi`, `buildPrompt`) | không có | thêm `speech: item.kana` | US2 |
| 8 | `src/features/practice/modes/mcq/index.ts:122` (`mcq-kanji-reading`, `buildPrompt`) | không có | thêm `speech: item.kana` | US2 |
| 9 | `src/features/practice/modes/mcq/McqComponent.tsx:41` (nút loa ở đề) | `q.promptAudio ?? q.promptText` | `q.promptSpeech ?? q.promptAudio ?? q.promptText` | US2 |
| 10 | `src/features/browse/KanjiPage.tsx:58` (chữ đơn) | `item.char` | `kanjiCharSpeech(item.on, item.kun)` | US3 |
| 11 | `src/features/browse/KanjiPage.tsx:91` (từ ví dụ) | `example.word` | `exampleWordSpeech(example.reading)` | US3 |
| 12 | `src/features/browse/GrammarTab.tsx:92` (câu) | `example.jp` + `kind="sentence"` | **không đổi mã**; bảng sửa áp trong `speakJapanese` | US4 |
| 13 | `src/lib/tts.ts:69` `speakJapanese` | `toSpeakable(text, kind)` | truyền thêm bảng sửa khi `kind === 'sentence'` | US4 |

Không đổi: `mcq-kana-kanji` (đề là kana), `mcq-vi-jp`, `mcq-vi-kanji` (không có nút loa), `McqComponent.tsx:51` (nút "Nghe lại" đọc `promptAudio`, chỉ đổi dữ liệu #6).

## Project Structure

### Documentation (this feature)

```text
specs/004-kana-pronunciation/
├── spec.md
├── plan.md              # file này
├── research.md          # số liệu thật, quy tắc Kun, ứng viên câu, phương án đã bỏ
├── data-model.md        # chuỗi đọc, bảng sửa, trường promptSpeech
├── quickstart.md        # cách tự kiểm tra
├── contracts/
│   └── speech-contract.md
├── checklists/requirements.md
├── evidence.md          # (tạo khi làm; /speckit-implement)
└── tasks.md             # (/speckit-tasks, chưa tạo)
```

### Source Code (repository root)

```text
content/overrides/
└── speech-corrections.json            # MỚI (Story 4): bảng sửa cách đọc cho câu

scripts/content/
└── speakable-content.test.ts          # SỬA: thêm describe cho từ vựng, Kanji, bảng sửa (D-6)

src/lib/
├── speakable.ts                       # SỬA: toSpeakable nhận bảng sửa; thêm kanjiCharSpeech, exampleWordSpeech
├── speakable.test.ts                  # SỬA: test các ví dụ FR-002/006/007, bảng sửa
├── tts.ts                             # SỬA (tại chỗ, không dời): truyền bảng sửa
└── tts.test.ts                        # SỬA

src/features/browse/
├── VocabTab.tsx                       # SỬA 1 dòng (#1)
├── SearchPage.tsx                     # SỬA 1 dòng (#2)
├── KanjiPage.tsx                      # SỬA 2 dòng (#10, #11)
└── *.test.tsx                         # MỚI/SỬA: VocabTab.test.tsx, SearchPage.test.tsx, KanjiPage.test.tsx

src/features/practice/modes/
├── flashcard/FlashcardComponent.tsx   # SỬA 1 dòng (#3); + FlashcardComponent.test.tsx (mới)
├── dictation/DictationComponent.tsx   # SỬA 2 dòng (#4, #5); dictation.test.tsx SỬA
└── mcq/{types.ts,index.ts,McqComponent.tsx}  # SỬA (D-3); mcq.test.ts, McqComponent.test.tsx SỬA

tests/e2e/kana-speech.spec.ts          # MỚI, thêm dần theo story (360×740)
docs/SPECKIT_ROADMAP.md                # SỬA: §3, khối nợ, §4.4
```

**Structure Decision**: không thêm thư mục hay lớp mới; mọi sửa nằm ở `lib/`, `features/browse/`, `features/practice/modes/{flashcard,dictation,mcq}/`, một file dữ liệu dưới `content/overrides/`. Không đụng `src/domain/quiz/{registry,session,grading}`, `scripts/content/` ngoài file test hiện có, `public/content/**`, `schemaVersion`.

## Kế hoạch kiểm theo story

Quy trình như spec 003: mỗi story một commit gồm test + mã + `evidence.md`; test chạy thấy ĐỎ trước khi sửa (test `[đặc trưng]` dự kiến xanh ngay, ghi riêng); `npm run check` thẳng rồi `npm run build` trước mỗi commit; `git diff --cached --name-only` đối chiếu danh sách; `git add` theo đường dẫn cụ thể; không push; có điểm dừng sau mỗi story.

| Story / commit | Test viết trước (dự kiến ĐỎ) | `[đặc trưng]` (xanh ngay) | Mã |
|---|---|---|---|
| **1. US1** từ vựng ở danh sách/tìm kiếm/flashcard | `VocabTab`, `SearchPage`, `Flashcard`: bấm loa ở `～人` → giọng nhận `じん`; `何時` → `なんじ`; `[お]花見` → `はなみ`; `～分` → `ふん`. Test nội dung: 1.295/1.295 từ có chuỗi đọc không rỗng, không chữ Hán, không ký tự cấm; bảng ví dụ FR-002 khớp (tra theo cặp kanji+kana trong nội dung thật). e2e: Bài 1 tab Từ vựng bấm loa `～人` → `__spoken` có `じん` | từ chỉ có kana đọc y như trước; chữ hiển thị không đổi | #1, #2, #3 |
| **2. US2** chính tả nghe + trắc nghiệm | `dictation`: tự đọc và nghe lại nhận kana; `mcq-listen-vi`: `promptAudio` là kana (tự đọc + "Nghe lại" đọc kana); `mcq-jp-vi`: nút loa đọc kana, đề hiện chữ Hán, không tự đọc; `mcq-kanji-reading`: ẩn trước khi chọn, sau khi chọn đọc kana | chấm điểm chính tả nghe không đổi (`answers.kana`, gõ `なんじ` đúng, `いつ` sai); `mcq-kana-kanji`, `vi-jp`, `vi-kanji` như spec 003; `grade()` mọi hướng không đổi | #4–#9 |
| **3. US3** trang Kanji | `kanjiCharSpeech`/`exampleWordSpeech` unit (一 イチ、ひとつ; 二; 白; 人; 上; 大; 行; 食; thiếu On/Kun; `十分` → じゅっぷん; `何` → なに); `KanjiPage`: nút loa chữ đơn và từ ví dụ; test nội dung: 134 chữ và 657 ví dụ có chuỗi không rỗng/không Hán/không ", " | nút loa hiện như cũ; chữ hiển thị không đổi | #10, #11, hai hàm mới |
| **4. US4** bảng sửa câu | `toSpeakable('あの 方は どなたですか。','sentence', bảng)` → `あの かたは…`; bảng rỗng → không đổi; mục thử thêm áp cho mọi câu chứa cụm; `あの方` (viết liền) không khớp; một lượt không chồng; test bảng thật (FR-010: không rỗng, không trùng, mỗi cụm khớp ≥ 1 câu thật); 292 câu: chỉ câu chứa cụm đổi; `GrammarTab` nhận `かた`; e2e câu `あの 方…` | `４人`, `６月13日`, `ミラーさんは アメリカ人ですか。` đọc như trước | file JSON, `speakable.ts`, `tts.ts` |

Mọi story: chữ hiển thị không đổi; bước kiểm vùng cấm bằng `git diff staging..HEAD --stat`.

**Điểm dừng 1 (sau Story 1)**: bảng mục để chủ dự án nghe thử trong app thật (`npm run dev`): `～人` (Bài 1 và Bài 11, `じん`/`にん`), `何時` (Bài 4), `何分` (Bài 4), `何` (Bài 2 `なん`, Bài 6 `なに`), `あの方` (Bài 1), `この間` (Bài 20), `[お]花見` (Bài 6), `～分` (Bài 4), flashcard một từ có kanji, kết quả tìm kiếm `gakusei`. **Điểm dừng sau Story 4** có trang nghe `.screens/tts-sentences-004.html` (20 câu ứng viên chứa 方, 何, 間; xem research R-4) để xác nhận SC-007 và quyết định có thêm mục vào bảng không.

## Tài liệu cập nhật

- `docs/SPECKIT_ROADMAP.md` §3: thêm dòng `kana-pronunciation` (🟨) ngay sau `speakable-text`, đánh số lại các dòng sau; ✅ chỉ khi chủ dự án merge.
- Khối nợ ở §3: thêm "Trang nghe liên tục cho toàn bộ câu ví dụ (292 câu) để chủ dự án đánh dấu câu đọc sai; hiện mới nghe thử 42 câu và 20 câu ứng viên."
- §4.4: thêm dòng `> **Giữ từ kana-pronunciation (spec 004):**` rằng chuỗi đọc của nút loa `mcq-jp-vi` và `mcq-kanji-reading` là kana (trường `promptSpeech`), `PromptBlock` phải giữ.
- Không có `docs/CONTENT_GUIDE.md` trong repo; ghi cách thêm mục vào bảng sửa ở `contracts/speech-contract.md` (C-5) và `quickstart.md`.

## Complexity Tracking

Không có vi phạm cần biện minh. Một điều ghi nhận (không phải vi phạm): file dữ liệu mới dưới `content/overrides/` là chỗ đầu tiên mã ứng dụng đọc trực tiếp `content/` (D-1, đã được chủ dự án xác nhận; `docs/ARCHITECTURE.md` §8.1 được sửa một dòng ở Story 4).
