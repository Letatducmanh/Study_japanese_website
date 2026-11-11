# Implementation Plan: speakable-text — phát âm đúng hơn, nút loa không đọc nhầm ngôn ngữ

**Branch**: `003-speakable-text` | **Date**: 2026-11-11 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/003-speakable-text/spec.md`

## Summary

Chỉ chuỗi được ĐỌC thay đổi. Thêm một hàm thuần `toSpeakable(text, kind)` trong `src/lib/` (bỏ `[..]`, `～`, `（..）`, `…` đơn, chọn cách viết đầu ở `/`, nối danh sách `→` `/` bằng `、`) và để `speakJapanese` gọi hàm đó bên trong. Mọi nơi gọi tự được làm sạch; chỉ câu ví dụ ngữ pháp truyền `kind: 'sentence'`. Ở trắc nghiệm, thêm một trường vào câu hỏi để nút loa ở đề chỉ hiện khi đề là tiếng Nhật và không lộ đáp án. Không đụng registry, session, grading, pipeline nội dung, `stripBracket`, `schemaVersion`; không dời `lib/tts.ts`.

Đầu vào đã đọc: `.screens/tts-audit.md` và `.json` (2.378 chuỗi được đọc, 661 có ký tự nghi vấn), `.screens/speakable-proto.mjs` (bản nháp), `.screens/tts-listen.html`. Bản thiết kế cuối đã chạy thử ở `.screens/speakable-proto2.mjs` + `.screens/check-proto2.mjs` (số liệu ở [research.md](research.md) R-1).

## Technical Context

**Language/Version**: TypeScript strict (không `any`), React 19

**Primary Dependencies**: không thêm thư viện mới

**Storage**: N/A (không đổi dữ liệu, nội dung, `schemaVersion`)

**Testing**: Vitest + Testing Library (unit, component); Playwright e2e ở `tests/e2e/` (viewport 360×740)

**Target Platform**: web (Vercel) và app Capacitor sau này; giọng đọc là Web Speech API có sẵn

**Project Type**: web app một codebase (`src/`)

**Performance Goals**: `toSpeakable` chạy mỗi lần bấm loa trên một chuỗi ngắn (< 100 ký tự): không đo được độ trễ; không ảnh hưởng ngân sách JS (khoảng 1 KB)

**Constraints**: hàm thuần, không đọc DOM/`window`; không dùng để chấm điểm; mặc định `kind='word'`; chuỗi không bị đổi bởi quy tắc nào thì trả về y nguyên (kể cả dấu cách)

**Scale/Scope**: 11 nơi gọi (bảng dưới), 6 hướng trắc nghiệm, 2.378 chuỗi nội dung hiện có

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Nguyên tắc | Đánh giá |
|---|---|
| I. Nội dung là dữ liệu | PASS. Code không chứa từ giáo trình; `speakable.ts` chỉ chứa ký hiệu. Test có chuỗi Nhật làm ví dụ (như `tts.test.ts`, `mcq.test.ts` đang làm), nằm trong file test. Không sửa `public/content/**`, không sửa `.md` nguồn. |
| II. Local-first | PASS. Không đụng lưu trữ. |
| III. Phân lớp & điểm cắm | PASS. Chi tiết bên dưới: `lib/` thuần; `ui/jp/SpeakButton` chỉ import `lib/`; `features/browse` truyền prop; phần MCQ nằm trọn trong `features/practice/modes/mcq/`. Không sửa registry, session runner, `domain/quiz/grading.ts`. |
| IV. Test trước | PASS có điều kiện: mỗi story viết test, chạy thấy ĐỎ, ghi vào `evidence.md`, rồi mới viết mã. Có 1 e2e Playwright (xem Story 2). |
| V. Phát hiện điểm yếu | PASS, và cải thiện: bỏ nút loa lộ đáp án ở `mcq-kanji-reading` giúp kết quả `reading` phản ánh đúng. `Attempt` không đổi. |
| VI. Giao diện | PASS. Không thêm class màu, chuỗi giao diện hay token. Nút loa vẫn là `SpeakButton`. Ghi nhận: nút loa của `mcq-kanji-reading` hiện sau khi chọn đáp án làm đề dịch ngang 44 px; chấp nhận, xử lý ở `practice-ui-migration` (PromptBlock). |
| VII. Bảo mật & bản quyền | PASS. Không đổi. |

Post-design (sau Phase 1): vẫn PASS, không có vi phạm cần ghi vào Complexity Tracking, ngoại trừ chi tiết nhỏ ở cuối tài liệu.

**Điểm dừng và hỏi** (theo yêu cầu): test dự kiến đỏ mà xanh ngay; cách sửa buộc đụng vùng cấm hoặc đụng ngoài `modes/mcq/` ở Story 2; lint đỏ vì luật lớp; cổng đỏ hai lần liên tục.

## Các quyết định cần nêu rõ

### D-1. Trường hợp của `mcq-kanji-reading` (bổ sung 2 sau specify)

**Thuộc trường hợp "đã có sẵn trạng thái đã chọn".** `McqComponent.tsx:14` đã có `const [picked, setPicked] = useState<string | null>(null)`, và `picked !== null` đã dùng để hiện phản hồi và nút "Tiếp theo". Vì vậy làm đủ cả hai phần: ẩn nút loa ở đề trước khi chọn, hiện lại sau khi chọn đáp án. Không cần ghi nợ `FeedbackSheet` cho phần này.

### D-2. FR-012 kiểm những ký tự nào (bổ sung 3)

FR-012 chỉ cấm đúng sáu loại ký tự trong chuỗi đọc: `[`, `]`, `～`, `（`, `）` và " / " (cùng các dạng tương đương: `［ ］`, `〜`, `~`, `( )`, `／`). Hai câu "Thank you" và "Cảm ơn" chứa chữ Latin và 「」 nhưng không chứa ký tự nào trong sáu loại này, nên **không cần ngoại lệ**. Chúng ghi thành nợ nội dung ở `quality-gaps` (khối nợ trong ROADMAP). Danh sách ngoại lệ của test hiện **rỗng** và test khẳng định nó rỗng. Spec đã được sửa cho khớp.

### D-3. Quy tắc bỏ `[..]` (khác nhẹ so với mô tả ở prompt, kết quả theo đúng ví dụ)

Bỏ `[..]` bằng chuỗi rỗng, **kèm khoảng trắng đứng ngay trước nó** (`\s*[..]`). Lý do: nếu chỉ thay bằng chuỗi rỗng, "いい [お]てんきですね。" ra "いい てんきですね。" (còn dấu cách), còn kết quả mong muốn là "いいてんきですね。". Cách này khớp đúng `stripBracket` ở `scripts/content/enrich.ts:51` (cùng biểu thức `\s*\[..\]`), nên `toSpeakable` khớp `answers.*[0]` ở 1.295/1.295 từ và 960/960 chữ kanji, không cần "gộp khoảng trắng" để che lệch. Sau đó vẫn gộp khoảng trắng thừa, bỏ khoảng trắng trước `、。！？` và trim, nhưng chỉ khi có quy tắc đã đổi chuỗi.

### D-4. Nơi chạy test so khớp nội dung

`public/content/**/*.json` bị gitignore và `npm run check` chạy trước `content:build`, nên file JSON không có sẵn khi CI chạy. Test so khớp chạy `runContentPipeline` ra thư mục tạm (cùng cách `scripts/content/pipeline.test.ts` và `src/data/search-index.real.test.ts` đang làm), nên đọc cùng nội dung mà `content:build` sinh ra. Đây là lần chạy pipeline thứ ba trong bộ test.

- **Không dùng chung kết quả build với hai test pipeline hiện có.** Dùng chung cần `globalSetup` (sửa `vite.config.ts`) và sửa cả hai file test đang chạy (`scripts/content/pipeline.test.ts`, `src/data/search-index.real.test.ts`); đó không phải thay đổi nhỏ, và vitest cô lập từng file nên không chia sẻ biến giữa các file được. Giữ lần chạy riêng, có `vi.setConfig({ testTimeout: 30000, hookTimeout: 30000 })` như hai file kia (Q-1).
- **Chi phí được đo, không đoán:** ghi thời gian chạy toàn bộ `npx vitest run` trước và sau vào `evidence.md` (mốc hiện có: 41 giây, 57 file, 316 test).
- **Vị trí file: `scripts/content/speakable-content.test.ts`** (chốt sau `/speckit-analyze`), không đặt ở `src/lib/` hay `src/test/`.
  - Chiều phụ thuộc đúng: `scripts/` import `src/lib/` (`enrich.ts` đã import `src/domain`). Đặt ở `src/lib/` thì `lib` (test) → `scripts/pipeline` → `src/domain` → `lib`, tạo vòng ở mức test.
  - Cạnh `pipeline.test.ts`, cùng thư mục với mọi test pipeline; vitest chạy file này (cấu hình không có `include` riêng).
  - Import: `import { toSpeakable } from '../../src/lib/speakable.ts'` (có đuôi `.ts`, vì `tsconfig.node.json` dùng `module: nodenext`) và `import { runContentPipeline } from './pipeline.ts'`. Không dùng bí danh `@/`.
  - `src/lib/speakable.ts` phải thuần TypeScript, **không dùng kiểu hay API DOM** (`window`, `document`…), vì khi được import từ `scripts/` nó bị `tsconfig.node.json` biên dịch với `lib: ["ES2023"]` (không có DOM).
  - **Không** thêm `describe` vào `pipeline.test.ts` (file nằm trong vùng pipeline).
  - Không thêm ngoại lệ ESLint. Nếu lúc chạy thật lint hoặc typecheck đỏ vì file này thì dừng và hỏi.
  - File này là file **thêm mới** duy nhất được phép nằm dưới `scripts/content/`; bước kiểm vùng cấm loại trừ đúng đường dẫn này (không dùng ký tự đại diện), mọi file khác dưới `scripts/content/` vẫn bị cấm.

## Nơi gọi và giá trị `kind`

`speakJapanese(text, { kind })` mặc định `'word'`. `SpeakButton` nhận `kind?: 'word' | 'sentence'` (mặc định `'word'`) và chuyển xuống.

| # | Nơi gọi | Chuỗi | kind |
|---|---|---|---|
| 1 | [VocabTab.tsx:131](../../src/features/browse/VocabTab.tsx#L131) | `item.kanji ?? item.kana` | mặc định (word) |
| 2 | [SearchPage.tsx:74](../../src/features/browse/SearchPage.tsx#L74) | `r.kanji ?? r.kana` | mặc định |
| 3 | [FlashcardComponent.tsx:104](../../src/features/practice/modes/flashcard/FlashcardComponent.tsx#L104) | `item.kanji ?? item.kana` | mặc định |
| 4 | [DictationComponent.tsx:17](../../src/features/practice/modes/dictation/DictationComponent.tsx#L17) (tự đọc) | `q.item.kanji ?? q.item.kana` | mặc định |
| 5 | [DictationComponent.tsx:34](../../src/features/practice/modes/dictation/DictationComponent.tsx#L34) (nghe lại) | như trên | mặc định |
| 6 | [McqComponent.tsx:17](../../src/features/practice/modes/mcq/McqComponent.tsx#L17) (tự đọc) | `q.promptAudio` | mặc định |
| 7 | [McqComponent.tsx:39](../../src/features/practice/modes/mcq/McqComponent.tsx#L39) (nút loa ở đề) | `q.promptAudio ?? q.promptText` | mặc định (hiện theo `promptSpeak`, Story 2) |
| 8 | [McqComponent.tsx:48](../../src/features/practice/modes/mcq/McqComponent.tsx#L48) (nghe lại) | `q.promptAudio` | mặc định |
| 9 | [KanjiPage.tsx:58](../../src/features/browse/KanjiPage.tsx#L58) | `item.char` | mặc định |
| 10 | [KanjiPage.tsx:91](../../src/features/browse/KanjiPage.tsx#L91) | `example.word` | mặc định |
| 11 | [GrammarTab.tsx:92](../../src/features/browse/GrammarTab.tsx#L92) | `example.jp` | **`'sentence'`** (nơi duy nhất) |

Ngoài danh sách: [PracticeSetupPage.tsx:16](../../src/features/practice/PracticeSetupPage.tsx#L16) chỉ gọi `hasJapaneseVoice()`, không đọc gì. `ConjugationMcq` và các dạng khác không gọi giọng đọc.

Thay đổi ở các nơi gọi 1 đến 10 là **không có**: mặc định lo hết. Chỉ `GrammarTab.tsx` (một dòng) và `SpeakButton.tsx` (thêm prop) thay đổi ở phía giao diện.

## Hành vi nút loa ở trắc nghiệm (Story 2)

Thêm `promptSpeak: 'always' | 'after-answer' | 'never'` vào `McqQuestion` ([types.ts](../../src/features/practice/modes/mcq/types.ts)); `buildPrompt` ở [mcq/index.ts](../../src/features/practice/modes/mcq/index.ts) trả về trường này cho từng hướng và `generate` chép vào câu hỏi. `McqComponent` chỉ hiện `SpeakButton` ở đề theo trường này, không so khớp chuỗi. `grade()` không đổi.

| id | `promptText` | `promptAudio` | `promptSpeak` | Nút loa ở đề |
|---|---|---|---|---|
| `mcq-jp-vi` | Nhật | không | `always` | hiện |
| `mcq-vi-jp` | Việt | không | `never` | ẩn |
| `mcq-kanji-reading` | Nhật (kanji) | không | `after-answer` | ẩn trước khi chọn, hiện sau khi chọn |
| `mcq-kana-kanji` | Nhật (kana) | không | `always` | hiện |
| `mcq-listen-vi` | không | Nhật | `never` | không có nút loa ở đề; giữ nút "nghe lại" và tự đọc như cũ |
| `mcq-vi-kanji` | Việt | không | `never` | ẩn |

Tự đọc (`McqComponent.tsx:17`) và nút nghe lại (`:48`) chỉ phụ thuộc `promptAudio`, không đổi.

## Project Structure

### Documentation (this feature)

```text
specs/003-speakable-text/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── speakable-contract.md
├── checklists/requirements.md
├── evidence.md          # ghi trong lúc làm (đỏ → xanh, số liệu), commit cùng mỗi story
└── tasks.md             # /speckit-tasks
```

### Source Code (repository root)

```text
src/lib/
├── speakable.ts                 # MỚI (Story 1): toSpeakable(text, kind) — chỉ để đọc, KHÔNG để chấm
├── speakable.test.ts            # MỚI: mọi ví dụ (1), (2) của spec + ca biên
├── tts.ts                       # SỬA: speakJapanese gọi toSpeakable; SpeakOptions.kind
└── tts.test.ts                  # SỬA: thêm test chuỗi cuối cùng đưa cho giọng đọc
src/ui/jp/
├── SpeakButton.tsx              # SỬA: prop kind, chuyển xuống
└── SpeakButton.test.tsx         # SỬA: kind được chuyển; chuỗi đọc đã làm sạch
scripts/content/speakable-content.test.ts  # MỚI (Story 1): chạy pipeline ra thư mục tạm; FR-012; khớp answers.*[0]
src/features/browse/GrammarTab.tsx   # SỬA 1 dòng: kind="sentence"
src/features/practice/modes/dictation/dictation.test.tsx  # MỚI: chuỗi chấm không đổi; chuỗi đọc đã làm sạch
src/features/practice/modes/mcq/     # Story 2, chỉ trong thư mục này:
├── types.ts                     # SỬA: PromptSpeak, McqQuestion.promptSpeak
├── index.ts                     # SỬA: buildPrompt trả speak; generate chép; grade() KHÔNG đổi
├── McqComponent.tsx             # SỬA: hiện SpeakButton theo promptSpeak
├── mcq.test.ts                  # SỬA: mỗi hướng có promptSpeak đúng
└── McqComponent.test.tsx        # MỚI: hiện/ẩn nút loa theo từng hướng, trước/sau khi chọn
tests/e2e/speakable.spec.ts      # MỚI (Story 2): giả lập giọng, chuỗi đọc ở ngữ pháp và trắc nghiệm
docs/SPECKIT_ROADMAP.md          # SỬA: §3, khối nợ, §4.4
```

**Structure Decision**: giữ cấu trúc hiện tại. Không tạo thư mục mới; không dời `tts.ts`.

## Quy trình và phạm vi mỗi commit

Mỗi story một commit, `git add` theo đường dẫn cụ thể, không push. Trước mỗi commit: `npm run check` xanh và `npm run build` xanh, rồi `git diff --cached --name-only` và đối chiếu đúng danh sách file dự kiến (không file lạ, không file Companion). **Sau mỗi story có một điểm dừng: báo cáo và chờ chủ dự án duyệt, không merge, không tạo PR.** Test phải chạy và thấy ĐỎ trước khi viết mã; kết quả đỏ ghi vào `evidence.md` và một dòng ở thân commit. Thư mục spec có `.spec-context.json`, `.trace.jsonl`, `.gitignore` do Companion sinh; giống spec 001 và 002, **không** add các file này.

**Story 1 — `toSpeakable` + `kind` + test so khớp** (spec US1, US2, US4)
1. Viết `src/lib/speakable.test.ts` (ví dụ spec + ca biên), `scripts/content/speakable-content.test.ts`, test `tts`, `SpeakButton`, `dictation`; chạy, thấy đỏ (chưa có `speakable.ts`; `speakJapanese` chưa làm sạch). Test xanh ngay (bảo toàn hành vi cũ) mang nhãn `[đặc trưng]` trong tên và được ghi ở mục riêng của `evidence.md` ("xanh trước và sau, không phải bằng chứng đỏ").
2. Viết `speakable.ts`, sửa `tts.ts`, `SpeakButton.tsx`, `GrammarTab.tsx`; test xanh.
3. `evidence.md`: kết quả đỏ; số chuỗi đổi (271, bằng bản nháp) và 5 chuỗi khác bản nháp trong 661 mục (giải thích ở R-1); 11 chuỗi xem tay (R-1) với kết quả; khớp `answers.*[0]`: 1.295/1.295 và 960/960.
4. Docs: ROADMAP §3 thêm dòng `speakable-text` (trạng thái 🟨 ở Commit 1; ✅ chỉ khi chủ dự án merge) trước `ui-kit-and-shell`; khối nợ ghi trường `speak` (ghi đè cách đọc từng từ / đọc theo kana), trang nghe liên tục để đánh dấu từ đọc sai, hai câu "Thank you"/"Cảm ơn" (sửa nội dung ở `quality-gaps`).
5. Cổng: `npm run check` + `npm run build`; kèm bước `grep` xác nhận chỉ `src/lib/tts.ts` dùng `speechSynthesis`/`SpeechSynthesisUtterance` ngoài file test (FR-006).
6. Commit gồm file spec, plan, research, data-model, contracts, quickstart, checklist, tasks, evidence và `scripts/content/speakable-content.test.ts`.
7. **Điểm dừng 1**: báo cáo và liệt kê các trang để chủ dự án nghe trong app thật (SC-007); chờ duyệt rồi mới sang Story 2.

**Story 2 — nút loa trắc nghiệm** (spec US3)
0. Xác nhận `public/content/manifest.json` tồn tại (e2e đọc nội dung đã dựng; `npm run build` không chạy `content:build`); thiếu thì dừng và hỏi. Chạy toàn bộ e2e **trước khi sửa** (`npm run build && npm run test:e2e`) để có mốc; Q-2 (`browse.spec.ts` "mở trang chủ → …") đã biết là đỏ, chỉ ghi lại, không dừng.
1. Viết `McqComponent.test.tsx`, bổ sung `mcq.test.ts`, `tests/e2e/speakable.spec.ts` (đặt `test.use({ viewport: { width: 360, height: 740 } })` trong file vì `playwright.config.ts` chưa có project 360×740); chạy, thấy đỏ.
2. Sửa `types.ts`, `index.ts`, `McqComponent.tsx` (chỉ trong `modes/mcq/`); xanh. Nếu phải đụng file ngoài `modes/mcq/` thì dừng và hỏi.
3. Chụp ảnh `mcq-kanji-reading` ở 360×740 trước và sau khi chọn đáp án bằng script tạm `.screens/shot-mcq-kanji-reading.mjs` (không commit; `.screens/` đã gitignore) để chủ dự án xem đề có tràn hoặc xuống dòng khi nút loa hiện lại.
4. Chạy lại toàn bộ e2e sau khi sửa, ghi kết quả (Q-2 vẫn đỏ là nợ đã biết).
5. ROADMAP §4.4: ghi `PromptBlock` phải giữ hành vi "không hiện nút loa cho đề tiếng Việt; `mcq-kanji-reading` ẩn trước khi chọn"; ghi thêm điểm đề dịch ngang 44 px khi nút hiện lại.
6. `evidence.md` bổ sung phần Story 2 và số liệu cuối (2.378 chuỗi đọc, số chuỗi đổi, 1.295/1.295 và 960/960).
7. Kiểm vùng cấm: `git add` các file của Story 2 theo đường dẫn, chạy `git diff staging --stat` (thấy cả Story 1 đã commit lẫn Story 2 đang staged, vì `staging..HEAD` chưa có commit thứ hai), đối chiếu danh sách file dự kiến; mẫu cấm `scripts/content` chỉ loại trừ đúng đường dẫn `scripts/content/speakable-content.test.ts` (trạng thái `A`). Sau khi commit chạy lại `git diff staging..HEAD --stat` phải ra đúng danh sách đó.
8. Commit Story 2.
9. **Điểm dừng 2**: báo cáo cuối và chờ chủ dự án duyệt; không merge, không tạo PR.

## Complexity Tracking

| Ghi chú | Vì sao chấp nhận |
|---|---|
| `speakable.ts` và `enrich.ts` (`stripBracket`) là hai bản logic gần giống nhau | Không sửa `enrich.ts` theo yêu cầu; test so khớp `answers.*[0]` làm đỏ ngay nếu hai bản lệch. Dọn khi sau này đưa `stripBracket` xuống `lib/`. |
