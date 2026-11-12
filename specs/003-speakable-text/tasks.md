---

description: "Task list cho speakable-text"
---

# Tasks: speakable-text — phát âm đúng hơn, nút loa không đọc nhầm ngôn ngữ

**Input**: `specs/003-speakable-text/` (plan.md, spec.md, research.md, data-model.md, contracts/speakable-contract.md, quickstart.md)

**Tests**: BẮT BUỘC (Constitution IV, yêu cầu TDD của chủ dự án): mọi test được viết và chạy thấy ĐỎ trước khi viết mã; kết quả đỏ ghi vào `specs/003-speakable-text/evidence.md` và một dòng `RED:` ở thân commit.

**Test đặc trưng**: test dự kiến XANH ngay lúc chạy đỏ (bảo toàn hành vi cũ hoặc kiểm đầu-cuối nhờ commit trước). Tên test có nhãn `[đặc trưng]`; kết quả ghi ở mục riêng của `evidence.md`, không lẫn với test phải đỏ. Câu bắt buộc ở mục đó: "xanh trước và sau, không phải bằng chứng đỏ".

## Cách chia commit

Spec có 4 user story; chủ dự án chia công việc thành **hai commit**:

| Commit | Gồm | Phase |
|---|---|---|
| **Commit 1** ("Story 1") | `toSpeakable` + `kind` + test so khớp nội dung | Phase 3: US1, US2, US4 |
| **Commit 2** ("Story 2") | nút loa trắc nghiệm + e2e | Phase 4: US3, Phase 5 |

Nhãn `[US1][US2][US4]` ở task chung của Commit 1 (cổng, evidence, commit) nghĩa là việc phục vụ cả ba story đó. Mỗi commit gồm test + mã + `evidence.md`. Cổng trước mỗi commit: `npm run check` chạy thẳng (không chạy riêng lẻ từng phần) và `npm run build`. Chỉ `git add` theo đường dẫn file cụ thể; không `git add .` hay `-A`; không push. Không add `specs/003-speakable-text/.spec-context.json`, `.trace.jsonl`, `.gitignore` (file của Companion, giống spec 001, 002). Trước mỗi `git commit` chạy `git diff --cached --name-only` và đối chiếu đúng danh sách file dự kiến.

**Điểm dừng chờ duyệt**: sau mỗi commit có một task DỪNG (T024 sau Commit 1, T043 sau task cuối). Không sang bước sau, không merge, không tạo PR khi chưa có trả lời của chủ dự án.

**Dừng và hỏi chủ dự án khi**: test dự kiến ĐỎ mà xanh ngay; cách sửa buộc đụng vùng cấm (registry, session, grading, pipeline, nội dung) hoặc đụng ngoài `src/features/practice/modes/mcq/` ở Phase 4; lint hoặc typecheck đỏ vì luật lớp; cổng (`check` hoặc `build`) đỏ hai lần liên tiếp; một test e2e **khác** Q-2 đỏ.

## Format: `[ID] [P?] [Story] Mô tả kèm đường dẫn file`

`[P]` = chạy song song được (file khác nhau, không phụ thuộc task chưa xong). Đường dẫn tính từ gốc repo `D:\Projects\project japanese\Source code\Code` (chạy lệnh từ gốc repo).

---

## Phase 1: Setup

- [X] T001 Xác nhận `git branch --show-current` là `003-speakable-text`, `git rev-parse staging HEAD` cho hai mã giống nhau, và `git status --short` chỉ có các file chưa theo dõi đã biết (Companion, `docs/*.md` gốc, `Ảnh mobile/`, `specs/003-speakable-text/`) cùng `.specify/integrations/claude.manifest.json` đã sửa sẵn.
- [X] T002 Chạy `npx vitest run` một lần (chưa sửa gì) để lấy mốc "trước": tổng thời gian, số file, số test (mốc đã biết: 41 giây, 57 file, 316 test). Nếu lệch nhiều thì ghi con số thật.
- [X] T003 Tạo `specs/003-speakable-text/evidence.md` với các mục trống: "Mốc trước (T002)", "Story 1: kết quả ĐỎ", "Story 1: test đặc trưng `[đặc trưng]` (xanh ngay)", "Story 1: kết quả XANH và số liệu", "Thời gian vitest trước/sau", "Story 2: e2e mốc trước", "Story 2: kết quả ĐỎ", "Story 2: test đặc trưng `[đặc trưng]` (xanh ngay)", "Story 2: kết quả XANH", "Ảnh `mcq-kanji-reading`", "Kiểm vùng cấm", "Số liệu cuối". Hai mục "test đặc trưng" mở đầu bằng câu: "Xanh trước và sau, không phải bằng chứng đỏ." Điền mốc T002.
- [X] T004 Chốt hai quyết định và ghi vào `evidence.md`: (a) lần chạy pipeline **riêng** có timeout riêng (không dùng chung `globalSetup` vì phải sửa `vite.config.ts` và hai test đang chạy; không thêm `describe` vào `pipeline.test.ts`); (b) file test nội dung ở `scripts/content/speakable-content.test.ts` (chiều phụ thuộc đúng: `scripts/` → `src/lib/`; cạnh `pipeline.test.ts`), import `../../src/lib/speakable.ts` có đuôi `.ts` và `./pipeline.ts`, không dùng bí danh `@/`, `speakable.ts` không dùng kiểu hay API DOM (xem plan D-4). Chạy phép thử lint: `printf "import { toSpeakable } from '../../src/lib/speakable.ts'\nexport const x = toSpeakable\n" | npx eslint --stdin --stdin-filename scripts/content/speakable-content.test.ts`; nếu đỏ thì dừng và hỏi (không thêm ngoại lệ ESLint, không tự chuyển file).

---

## Phase 3: Commit 1 — Làm sạch chuỗi đọc (US1, US2, US4) 🎯 MVP

**Mục tiêu**: mọi nơi phát âm đọc chuỗi đã làm sạch; chữ hiển thị và cách chấm không đổi.

**Kiểm độc lập**: `npx vitest run src/lib scripts/content/speakable-content.test.ts src/ui/jp src/features/practice/modes/dictation` xanh; bấm loa ở Bài 14 tab Ngữ pháp trong app.

### Test trước (phải ĐỎ)

- [X] T005 [US1] Tạo `src/lib/speakable.test.ts` (import `toSpeakable` từ `./speakable`, chưa tồn tại). Mô tả `describe('toSpeakable — từ vựng (word)')` dùng `it.each` cho đúng các dòng `word` ở bảng [contracts/speakable-contract.md](contracts/speakable-contract.md) C-1: `どうぞ よろしく [お願いします]。`→`どうぞ よろしく。`; `[お]土産`→`土産`; `綺麗 [な]`→`綺麗`; `[～を] 見せて ください。`→`見せて ください。`; `きます [シャツを～]`→`きます`; `～さん`→`さん`; `こちらは ～さんです。`→`こちらは さんです。`; `～歳`→`歳`; `晩 / 夜`→`晩`; `[～は] ちょっと……。`→`ちょっと……。`; `[どうも] ありがとう [ございます]。`→`ありがとう。`; `～かい / ～がい`→`かい`.
- [X] T006 [US2] Trong `src/lib/speakable.test.ts` thêm `describe('toSpeakable — câu ngữ pháp (sentence)')` cho 4 ví dụ FR-004: `ミラーさんは アメリカ人ですか。 …はい、アメリカ人です。`→`ミラーさんは アメリカ人ですか。 はい、アメリカ人です。`; `書きます → 書いて / 飲みます → 飲んで / 待ちます → 待って`→`書きます、書いて、飲みます、飲んで、待ちます、待って`; `行きます（lịch sự）→ 行く（thông thường）`→`行きます、行く`; `わたしは てんぷらを（が） 食べたいです。`→`わたしは てんぷらを 食べたいです。`.
- [X] T007 [US1] Trong `src/lib/speakable.test.ts` thêm `describe('toSpeakable — các ca bản nháp từng làm sai')` với **sáu** `it` riêng, mỗi cái một ca, tên test nêu rõ ca:
  1. `いい [お]てんきですね。` (word) → `いいてんきですね。` (không để dấu cách thừa);
  2. `いい [お]天気ですね。` (word, dạng kanji của ca 1) → `いい天気ですね。`;
  3. `日曜日 どこ[へ]も 行きませんでした。` (sentence) → `日曜日 どこも 行きませんでした。`;
  4. `日本料理［の 中］で 何が いちばん おいしいですか。 …てんぷらが いちばん おいしいです。` (sentence) → `日本料理で 何が いちばん おいしいですか。 てんぷらが いちばん おいしいです。`;
  5. `ここに 荷物を 置かないで ください。 → 荷物は ここに 置かないで ください。` (sentence) → `ここに 荷物を 置かないで ください。 荷物は ここに 置かないで ください。` (không có `。、`);
  6. `会社の 食堂で 昼ごはんを 食べます。 → 昼ごはんは 会社の 食堂で 食べます。` (sentence) → `会社の 食堂で 昼ごはんを 食べます。 昼ごはんは 会社の 食堂で 食べます。`.
- [X] T008 [US4] Trong `src/lib/speakable.test.ts` thêm `describe('toSpeakable — giữ nguyên')` chứng minh đầu ra bằng đầu vào (`toBe(input)`) cho các dòng FR-005: `マイク・ミラー`, `寝る まえに、「お休みなさい」と 言います。` (sentence), `CD`, `Tシャツ`, `地下1階`, `もう 帰らないと……。`, `お名前は？`, `わたし`, `食べます`; thêm ca biên: chuỗi có hai dấu cách liền nhau mà không có ký hiệu cần bỏ vẫn trả về y nguyên; `〜` và `~` được bỏ như `～`; `……` đôi không bị bỏ ở `sentence`; chuỗi chỉ gồm `～` hoặc `[ ]` cho kết quả `''`; `kind` mặc định là `'word'` (gọi không truyền `kind` với `晩 / 夜` ra `晩`).
- [X] T009 [P] [US4] Tạo `scripts/content/speakable-content.test.ts` theo mẫu `scripts/content/pipeline.test.ts`: `import { runContentPipeline } from './pipeline.ts'` và `import { toSpeakable } from '../../src/lib/speakable.ts'`; `vi.setConfig({ testTimeout: 30000, hookTimeout: 30000 })`; `beforeAll` chạy `runContentPipeline({ contentDir: join(process.cwd(), 'content'), outDir: <thư mục tạm>, write: true })`, `afterAll` xóa thư mục tạm. Với mọi chuỗi được đọc (từ vựng `kanji ?? kana` kind `word`; `kanji.char` và `kanji.example.word` kind `word`; `grammar.examples[].jp` kind `sentence`): (a) khai báo `const EXCEPTIONS: Array<{ id: string; reason: string }> = []` và `expect(EXCEPTIONS).toEqual([])`; (b) `toSpeakable` không còn `[`, `]`, `［`, `］`, `～`, `〜`, `~`, `（`, `）`, `(`, `)`, `/`, `／` (trừ mục trong `EXCEPTIONS`) và không trả về chuỗi rỗng; (c) với mọi từ vựng `toSpeakable(kana,'word')` khớp `answers.kana[0]` và `toSpeakable(kanji,'word')` khớp `answers.kanji[0]` sau khi bỏ `～ 〜 ~` và gộp khoảng trắng ở hai phía, 0 chỗ lệch; (d) `console.info` một dòng tổng kết (tổng chuỗi, số chuỗi đổi, số khớp kana/kanji) để đưa vào `evidence.md`. Không khẳng định con số tuyệt đối (nội dung sẽ lớn thêm). **Không** thêm gì vào `pipeline.test.ts`.
- [X] T010 [P] [US1] Trong `src/lib/tts.test.ts` thêm test: `speakJapanese('[お]土産')` đưa `utterance.text === '土産'` cho giọng đọc; `speakJapanese('書きます → 書いて', { kind: 'sentence' })` đưa `'書きます、書いて'`; `speakJapanese('晩 / 夜')` mặc định `word` đưa `'晩'`; chuỗi chỉ gồm `～` thì **không** gọi `cancel` hay `speak`. Các test cũ (rỗng `'   '`, `lang='ja-JP'`, giọng nữ) giữ nguyên, không đổi tên.
- [X] T011 [P] [US1] Trong `src/ui/jp/SpeakButton.test.tsx` thêm test: bấm `<SpeakButton text="[お]土産" />` ra utterance `土産`; `<SpeakButton text="行きます（lịch sự）→ 行く（thông thường）" kind="sentence" />` ra `行きます、行く`; không truyền `kind` thì dùng `word`. Thêm khẳng định `[đặc trưng] SpeakButton không đổi nhãn hay nội dung hiển thị`: với `text` có ký hiệu (`[お]土産`) nút vẫn có tên truy cập `vi.common.speak` ("Nghe phát âm"), `aria-label` và `title` bằng `vi.common.speak`, và `button.textContent` rỗng (chỉ có biểu tượng, không hiện `text` ra màn hình), dù có hay không có prop `kind`.
- [X] T012 [P] [US4] Tạo `src/features/practice/modes/dictation/dictation.test.tsx`: (a) `[đặc trưng] grade() trả expected là item.kana thô và chấp nhận answers.kana` với một từ có `[ ]` (ví dụ `kana: '[お]みやげ'`, `answers.kana: ['みやげ']`); (b) `[đặc trưng] kết quả grade() không đổi` (gõ `みやげ` đúng, gõ chuỗi khác sai; chuỗi làm sạch không làm đúng thêm hay sai thêm đáp án nào); (c) render `DictationComponent` và kiểm utterance đưa cho `speechSynthesis.speak` là chuỗi đã làm sạch (`みやげ`), cả khi tự đọc lúc mount lẫn khi bấm "nghe lại". Mock `speechSynthesis` như `SpeakButton.test.tsx`.

### Thấy ĐỎ

- [X] T013 [US1][US2][US4] Chạy `npx vitest run src/lib/speakable.test.ts scripts/content/speakable-content.test.ts src/lib/tts.test.ts src/ui/jp/SpeakButton.test.tsx src/features/practice/modes/dictation/dictation.test.tsx`. **Dự kiến ĐỎ**: `speakable.test.ts` và `speakable-content.test.ts` (không tìm thấy `speakable.ts`), các test mới ở `tts.test.ts` và `SpeakButton.test.tsx` (chuỗi chưa làm sạch), test (c) của `dictation.test.tsx`. **Dự kiến XANH ngay (`[đặc trưng]`)**: test (a), (b) của `dictation.test.tsx`, khẳng định "không đổi nhãn" ở T011, và các test `tts` cũ. Ghi kết quả ĐỎ (tên test đỏ, thông báo lỗi ngắn) vào mục "Story 1: kết quả ĐỎ" và kết quả `[đặc trưng]` vào mục riêng "Story 1: test đặc trưng" của `evidence.md`. Nếu một test thuộc nhóm dự kiến ĐỎ mà xanh ngay thì **dừng và hỏi**.

### Mã

- [X] T014 [US1] Tạo `src/lib/speakable.ts`: export `type SpeakKind = 'word' | 'sentence'` và `toSpeakable(text: string, kind: SpeakKind = 'word'): string` đúng thứ tự quy tắc ở [research.md](research.md) R-1 và [contracts/speakable-contract.md](contracts/speakable-contract.md) C-1: (1) bỏ `\s*[\[［][^\]］]*[\]］]`; (2) bỏ `～ 〜 ~`; (3) `word`: có `/` hoặc `／` thì tách `\s*[\/／]\s*`, lấy mục đầu không rỗng; (4) `sentence`: bỏ `（..）` và `(..)`, đổi `…` đơn (`(?<!…)…(?!…)`) thành dấu cách, nếu có `→` `/` `／` thì tách `\s*(?:→|[\/／])\s*`, bỏ mục rỗng, nối bằng `、` (bằng một dấu cách nếu mục trước kết thúc bằng `。` `！` `？`); (5) nếu chuỗi sau các bước bằng đầu vào thì trả đầu vào; (6) ngược lại gộp `\s+` thành một dấu cách, bỏ khoảng trắng trước `、。！？`, trim. Đầu file ghi chú thích: "Chỉ dùng cho việc đọc (giọng đọc). KHÔNG dùng để chấm điểm, hiển thị hay lưu." Thuần TypeScript: không import gì, **không dùng kiểu hay API DOM** (`window`, `document`…), vì `scripts/content/speakable-content.test.ts` import file này và `tsconfig.node.json` chỉ có `lib: ["ES2023"]`.
- [X] T015 [US1] Sửa `src/lib/tts.ts`: thêm `kind?: SpeakKind` vào `SpeakOptions` (mặc định `'word'`); trong `speakJapanese` tính `const spoken = toSpeakable(text, options.kind ?? 'word')`, thoát sớm (không `cancel`, không `speak`) khi `!isTtsSupported()`, `!text.trim()` hoặc `!spoken.trim()`, rồi đưa `spoken` cho `SpeechSynthesisUtterance`. Giữ nguyên `lang`, `rate`, chọn giọng; không dời file.
- [X] T016 [P] [US1] Sửa `src/ui/jp/SpeakButton.tsx`: thêm prop `kind?: SpeakKind` (import kiểu từ `@/lib/speakable`), mặc định `'word'`, bấm gọi `speakJapanese(text, { kind })`. Không đổi nhãn, `title`, nội dung hiển thị.
- [X] T017 [P] [US2] Sửa `src/features/browse/GrammarTab.tsx` dòng 92: `<SpeakButton text={example.jp} kind="sentence" />`. Không sửa nơi gọi nào khác (10 nơi còn lại dùng mặc định).

### Thấy XANH và đo

- [X] T018 [US1][US2][US4] Chạy lại lệnh ở T013, mọi test xanh. Chạy `npx vitest run` toàn bộ; ghi vào `evidence.md` thời gian, số file, số test **sau** và so với mốc T002 (mục "Thời gian vitest trước/sau"; nêu chi phí của lần chạy pipeline thứ ba). Typecheck (nằm trong `npm run check` ở T022) phải xanh với file test mới ở `scripts/`; nếu đỏ vì `speakable.ts` bị biên dịch bằng `tsconfig.node.json` thì dừng và hỏi.
- [X] T019 [US4] Tạo script tạm `.screens/verify-speakable.ts` (không commit) chạy bằng `npx tsx .screens/verify-speakable.ts` gọi hàm thật trong `src/lib/speakable.ts` trên nội dung dựng ở thư mục tạm; in: tổng chuỗi được đọc (kỳ vọng 2.378), số chuỗi đổi (kỳ vọng 271), 5 chuỗi khác bản nháp, 11 chuỗi xem tay với chuỗi trước/sau (R-1), số khớp `answers` (kỳ vọng 1.295/1.295 và 960/960), số chuỗi còn ký tự cấm (kỳ vọng 0). Ghi toàn bộ vào mục "Story 1: kết quả XANH và số liệu" của `evidence.md`. Nếu số khác kỳ vọng thì dừng và hỏi.

### Tài liệu

- [X] T020 [US1][US2][US4] Sửa `docs/SPECKIT_ROADMAP.md` §3: thêm một dòng vào bảng "Hàng đợi spec" **trước** dòng `ui-kit-and-shell`, tên đúng `speakable-text`, trạng thái **🟨** (chỉ đổi sang ✅ khi chủ dự án merge; không đổi trong feature này); dời số thứ tự các dòng sau cho liền. Dưới bảng, thêm khối `> **Nợ từ speakable-text (spec 003):**` gồm ba gạch đầu dòng: (1) trường `speak` ở nội dung để ghi đè cách đọc từng từ và đọc theo kana thay kanji; (2) trang nghe liên tục để chủ dự án đánh dấu từ đọc sai; (3) hai câu ngữ pháp có tiếng Anh/Việt trong câu Nhật ("Thank you" ở `mnn1-l07-g-2469a6f0#0`, "Cảm ơn" ở `mnn1-l07-g-2469a6f0#1`) để sửa nội dung ở `quality-gaps`.

### Cổng và commit 1

- [X] T021 [US1][US2][US4] Hoàn tất `evidence.md` phần Story 1: kết quả đỏ (T013), test đặc trưng, kết quả xanh và số liệu (T018, T019), thời gian vitest trước/sau, quyết định T004.
- [X] T022 [US1][US2][US4] Chạy cổng: `npm run check` (thẳng, không rút gọn), rồi `npm run build`. Phải xanh cả hai. Thêm bước kiểm FR-006: `grep -rnE "SpeechSynthesisUtterance|speechSynthesis" src --include=*.ts --include=*.tsx | grep -vE "\.test\.tsx?:" | grep -vE "^src/(lib/tts|test/setup)\.ts:"` — kết quả phải **rỗng** (chỉ `src/lib/tts.ts` dùng ngoài file test; `src/test/setup.ts` là polyfill của bộ test nên được loại như file test). Dán lệnh và kết quả vào `evidence.md`. Nếu đỏ: sửa và chạy lại; đỏ hai lần liên tiếp thì dừng và hỏi.
- [X] T023 [US1][US2][US4] Commit 1: `git add` đúng các đường dẫn sau: `src/lib/speakable.ts`, `src/lib/speakable.test.ts`, `scripts/content/speakable-content.test.ts`, `src/lib/tts.ts`, `src/lib/tts.test.ts`, `src/ui/jp/SpeakButton.tsx`, `src/ui/jp/SpeakButton.test.tsx`, `src/features/browse/GrammarTab.tsx`, `src/features/practice/modes/dictation/dictation.test.tsx`, `docs/SPECKIT_ROADMAP.md`, `specs/003-speakable-text/spec.md`, `plan.md`, `research.md`, `data-model.md`, `quickstart.md`, `tasks.md`, `evidence.md`, `contracts/speakable-contract.md`, `checklists/requirements.md`. Chạy `git diff --cached --name-only` và đối chiếu đúng 19 đường dẫn này (không thừa, không thiếu, không file Companion). Rồi `git commit`: tiêu đề `feat(003): làm sạch chuỗi đọc bằng toSpeakable, kind word/sentence`; thân có dòng `RED: <các test đã đỏ trước khi viết mã, kèm số test đỏ>` và kết thúc bằng dòng `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`. Không push.

### Điểm dừng 1

- [x] T024 [US1][US2][US4] **DỪNG, báo cáo, chờ chủ dự án duyệt. Không merge, không tạo PR, không bắt đầu Phase 4.** Báo cáo: mã Commit 1, kết quả `npm run check`/`build`, số liệu (2.378 / 271 / 1.295/1.295 / 960/960), thời gian vitest trước/sau. Đồng thời (SC-007) yêu cầu chủ dự án chạy `npm run dev` (http://localhost:5173, Chrome hoặc Edge có giọng tiếng Nhật) và nghe các mục dưới đây trong **app thật**, trả lời từng mục bằng: Đúng / Lạ nhưng chấp nhận được / Sai (kèm mô tả).

  | # | Trang | Bấm loa ở | Kỳ vọng nghe | Câu hỏi cần trả lời |
  |---|---|---|---|---|
  | 1 | `/b/mnn1/1`, tab "Từ vựng" | `どうぞ よろしく [お願いします]。` (`mnn1-l01-6d72b196`) | "どうぞ よろしく" rồi dừng, không đọc phần trong `[ ]` | Có nghe "お願いします" không? Có đọc tên ký hiệu không? |
  | 2 | `/b/mnn1/1`, tab "Từ vựng" | `～さん` (`mnn1-l01-8cf4c929`) và `こちらは ～さんです。` (`mnn1-l01-84013566`) | "さん"; "こちらは さんです" | Có nghe tên ký hiệu `～` không? "こちらは さんです" nghe chấp nhận được không, hay cụt quá? |
  | 3 | `/b/mnn1/1`, tab "Ngữ pháp" | ví dụ hỏi–đáp `ミラーさんは アメリカ人ですか。 …はい、アメリカ人です。` (`mnn1-l01-g-098b926a#0`) | hai vế liền mạch, có ngắt giữa hỏi và đáp, không đọc dấu `…` | Có đọc dấu `…` không? Khoảng ngắt giữa câu hỏi và câu đáp có tự nhiên không? |
  | 4 | `/b/mnn1/14`, tab "Ngữ pháp" | danh sách `書きます → 書いて / 飲みます → 飲んで / 待ちます → 待って` (`mnn1-l14-g-1ea0e8c5#0`) | "書きます、書いて、飲みます、…" ngắt đều | Có đọc `→` hay `/` không? Nhịp ngắt có dễ nghe không? |
  | 5 | `/b/mnn1/20`, tab "Ngữ pháp" | `行きます（lịch sự）→ 行く（thông thường）` (`mnn1-l20-g-c46be74b#0`) | "行きます、行く", không đọc chú thích tiếng Việt | Có nghe chữ tiếng Việt trong ngoặc không? |
  | 6 | `/b/mnn1/2` và `/b/mnn1/4`, tab "Từ vựng" | `[お]土産` (`mnn1-l02-c610a4ef`) và `晩 / 夜` (`mnn1-l04-341add8c`) | "土産"; chỉ "晩" | Có đọc "お" thừa hoặc đọc cả "夜" không? |
  | 7 | `/b/mnn1/1`, tab "Ngữ pháp" | `わたしは マイク・ミラーです。` (giữ nguyên) | đọc như trước khi sửa | Có khác trước không? |
  | 8 | `/b/mnn1/21`, tab "Từ vựng" | `もう 帰らないと……。` (`mnn1-l21-bf77411d`; giữ nguyên) | đọc như trước khi sửa | Có khác trước không? |
  | 9 | `/practice/setup` (Bài 1, chọn "Chính tả nghe") | từ nào đó có ký hiệu, nếu gặp | tự đọc đã làm sạch; gõ đáp án kana vẫn được chấm đúng | Gõ đúng có được tính đúng không? Có bị đòi gõ thêm phần trong `[ ]` không? |

  Câu hỏi chốt: "Duyệt Commit 1 để sang Story 2 (nút loa trắc nghiệm)? Có / Không (nêu mục cần sửa)". Chỉ tiếp tục T025 khi có trả lời "Có".

**Checkpoint**: sau T024, US1, US2, US4 chạy độc lập và có thể demo. Nút loa trắc nghiệm vẫn như cũ.

---

## Phase 4: Commit 2 — Nút loa trắc nghiệm (US3)

**Mục tiêu**: nút loa ở đề trắc nghiệm không đọc tiếng Việt và không lộ đáp án.

**Kiểm độc lập**: `npx vitest run src/features/practice/modes/mcq` xanh; `npm run build && npm run test:e2e` chỉ có Q-2 đỏ; xem ảnh `.screens/mcq-kanji-reading-*.png`.

**Phạm vi sửa mã**: chỉ trong `src/features/practice/modes/mcq/`. Nếu cần đụng file khác thì dừng và hỏi.

- [x] T025 [US3] Xác nhận `public/content/manifest.json` tồn tại (e2e đọc nội dung đã dựng; `npm run build` không chạy `content:build`); thiếu thì dừng và hỏi. Chạy toàn bộ e2e **trước khi sửa** (`npm run build && npm run test:e2e`), ghi kết quả (số đạt, số đỏ, tên test đỏ; kỳ vọng chỉ Q-2 `browse.spec.ts` "mở trang chủ → …" đỏ) vào mục "Story 2: e2e mốc trước" của `evidence.md`.

### Test trước (phải ĐỎ)

- [x] T026 [P] [US3] Trong `src/features/practice/modes/mcq/mcq.test.ts` thêm test: với `generate()` của từng hướng, `promptSpeak` là: `mcq-jp-vi` `'always'`; `mcq-vi-jp` `'never'`; `mcq-kanji-reading` `'after-answer'`; `mcq-kana-kanji` `'always'`; `mcq-listen-vi` `'never'`; `mcq-vi-kanji` `'never'`. Giữ nguyên các test `grade()` hiện có, không đổi tên.
- [x] T027 [P] [US3] Tạo `src/features/practice/modes/mcq/McqComponent.test.tsx` (mock `speechSynthesis` có giọng `ja-JP` như `SpeakButton.test.tsx` để `SpeakButton` không tự ẩn). Dựng câu hỏi bằng `generate()` của từng hướng. Kiểm theo `vi.common.speak` ("Nghe phát âm") và `vi.mcq.replay` ("Nghe lại"): `mcq-vi-jp` và `mcq-vi-kanji` **không** có nút "Nghe phát âm"; `mcq-kanji-reading` không có trước khi chọn đáp án và **có** sau khi bấm một lựa chọn (chuỗi đọc là chữ kanji của đề); `[đặc trưng]` `mcq-jp-vi` và `mcq-kana-kanji` có nút "Nghe phát âm" ở đề (như cũ); `[đặc trưng]` `mcq-listen-vi` không có nút "Nghe phát âm", có nút "Nghe lại", và `speak` được gọi khi mount với chuỗi đọc của `promptAudio` (như cũ). Thêm: `[đặc trưng] chọn đáp án không làm đổi kết quả grade()` (chọn đúng vẫn `correct: true`). Thêm khẳng định E2: với một câu hỏi dựng tay có `promptText: '[お]土産'` và `promptSpeak: 'always'`, đề vẫn hiển thị `promptText` **thô** (`container.textContent` chứa `[お]土産`), trong khi bấm nút loa đưa `土産` cho giọng đọc (chỉ chuỗi đọc bị làm sạch, chữ hiển thị giữ nguyên).
- [x] T028 [P] [US3] Tạo `tests/e2e/speakable.spec.ts` với `test.use({ viewport: { width: 360, height: 740 } })`. Dùng `page.addInitScript` thay `window.speechSynthesis` bằng bản giả có giọng `ja-JP` và ghi mọi chuỗi `speak` vào `window.__spoken`; bản giả **phải có đủ năm phương thức**: `speak`, `cancel`, `getVoices` (trả mảng chứa một giọng `{ lang: 'ja-JP', name: 'Giả' }`), `addEventListener`, `removeEventListener` (thiếu một cái thì `SpeakButton`/`tts.ts` lỗi). Không giả thì nút loa **không hiện** trong headless (Linux CI không có giọng Nhật; `SpeakButton` trả `null`). Ca 1 `[đặc trưng]` (xanh nhờ Commit 1): mở `/b/mnn1/1`, tab "Ngữ pháp", lọc thẻ ví dụ chứa văn bản `ミラーさんは アメリカ人ですか。` bằng `locator.filter({ hasText })`, bấm nút "Nghe phát âm" **trong thẻ đó** (không phải nút đầu tiên của trang) và kiểm `window.__spoken` có chuỗi `ミラーさんは アメリカ人ですか。 はい、アメリカ人です。`. Ca 2: vào `/b/mnn1/5` → "Luyện tập bài này" → bỏ "Flashcard", chọn "Nghĩa → Nhật" (theo mẫu `tests/e2e/practice-mcq.spec.ts`), bắt đầu, kiểm **không** có nút "Nghe phát âm" ở đề; thêm khẳng định "có mặt" (chống xanh giả): trong cùng ca (hoặc ca phụ) chọn "Nhật → Nghĩa" và kiểm **có** nút "Nghe phát âm" ở đề. Ca 3: như ca 2 nhưng chọn "Kanji → Cách đọc": không có nút "Nghe phát âm" trước khi chọn; sau khi bấm một lựa chọn thì có.

### Thấy ĐỎ

- [x] T029 [US3] Chạy `npx vitest run src/features/practice/modes/mcq` và `npm run build && npx playwright test tests/e2e/speakable.spec.ts`. **Dự kiến ĐỎ**: T026 (chưa có `promptSpeak`), các ca của T027 liên quan `mcq-vi-jp`, `mcq-vi-kanji`, `mcq-kanji-reading` trước khi chọn, ca 2 (phần "Nghĩa → Nhật") và ca 3 của T028. **Dự kiến XANH ngay (`[đặc trưng]`)**: khẳng định E2 (hiển thị thô/đọc sạch; Commit 1 đã làm sạch ở `tts.ts`, xanh trước và sau, không phải bằng chứng đỏ), các ca `mcq-jp-vi`, `mcq-kana-kanji`, `mcq-listen-vi` và "không đổi grade()" của T027, ca 1 của T028, phần "có mặt" ở "Nhật → Nghĩa". Ghi kết quả ĐỎ vào "Story 2: kết quả ĐỎ" và kết quả `[đặc trưng]` vào mục riêng "Story 2: test đặc trưng" của `evidence.md`. Test dự kiến ĐỎ mà xanh ngay thì dừng và hỏi.

### Mã (chỉ trong `src/features/practice/modes/mcq/`)

- [x] T030 [US3] Sửa `src/features/practice/modes/mcq/types.ts`: thêm `export type PromptSpeak = 'always' | 'after-answer' | 'never'` và trường **bắt buộc** `promptSpeak: PromptSpeak` vào `McqQuestion` (kèm chú thích: quyết định nút loa ở đề; không ảnh hưởng tự đọc và nút "nghe lại").
- [x] T031 [US3] Sửa `src/features/practice/modes/mcq/index.ts`: `DirectionConfig.buildPrompt` trả thêm `speak: PromptSpeak`; `generate` chép vào `promptSpeak`; giá trị: `mcqJpVi` `'always'`, `mcqViJp` `'never'`, `mcqKanjiReading` `'after-answer'`, `mcqKanaKanji` `'always'`, `mcqListenVi` `'never'`, `mcqViKanji` `'never'`. **Không sửa hàm `grade` (dòng 72–82), `isEligible`, `register`, `choiceOf`, `distractorField`.** Sau khi sửa, `git diff src/features/practice/modes/mcq/index.ts` không được có hunk nào nằm trong `grade`.
- [x] T032 [US3] Sửa `src/features/practice/modes/mcq/McqComponent.tsx`: ở khối `q.promptText ? ...` (dòng 37–43) chỉ render `SpeakButton` khi `q.promptSpeak === 'always' || (q.promptSpeak === 'after-answer' && picked !== null)`; vẫn dùng `text={q.promptAudio ?? q.promptText}`; không dùng so khớp chuỗi. Giữ nguyên `useEffect` tự đọc (dòng 16–19) và nút "nghe lại" (dòng 44–53); không đổi `promptText` hiển thị.

### Thấy XANH, e2e, ảnh

- [x] T033 [US3] Chạy lại lệnh ở T029, mọi test xanh. Chạy `npx vitest run` toàn bộ, tất cả xanh.
- [x] T034 [US3] Chạy toàn bộ e2e sau khi sửa (`npm run build && npm run test:e2e`), ghi vào `evidence.md` (mục "Story 2: kết quả XANH"): số đạt/đỏ, tên test đỏ, và so với mốc T025. Chỉ Q-2 (`browse.spec.ts` "mở trang chủ → …") được phép đỏ (nợ đã biết từ spec 001). Test e2e khác đỏ thêm thì dừng và hỏi.
- [x] T035 [US3] Tạo script tạm `.screens/shot-mcq-kanji-reading.mjs` (không commit; `.screens/` đã gitignore) dùng Playwright (`chromium`) với viewport 360×740 trên `http://localhost:4173` (`npm run preview` đã chạy; nếu chưa thì chạy nền), có `addInitScript` giả giọng `ja-JP` với đủ năm phương thức như T028 (headless không có giọng nên nút loa sẽ không hiện nếu thiếu). Luồng: `/b/mnn1/5` → "Luyện tập bài này" → bỏ "Flashcard", chọn "Kanji → Cách đọc" → bắt đầu. Chụp `.screens/mcq-kanji-reading-before.png` (chưa chọn đáp án) và sau khi bấm một lựa chọn chụp `.screens/mcq-kanji-reading-after.png`. In thêm: `document.documentElement.scrollWidth` so với 360 (tràn ngang), và chiều cao khối đề trước/sau (xuống dòng). Chạy script; ghi đường dẫn hai ảnh và các số đo vào mục "Ảnh `mcq-kanji-reading`" của `evidence.md`. Nếu có tràn ngang (`scrollWidth > 360`) thì dừng và báo chủ dự án kèm ảnh; nếu chỉ dịch ngang/xuống dòng nhẹ thì ghi nhận và tiếp tục. Gửi chủ dự án đường dẫn hai ảnh đầy đủ.

### Tài liệu

- [x] T036 [US3] Sửa `docs/SPECKIT_ROADMAP.md` §4.4 (practice-ui-migration): thêm vào đầu khối `/speckit-plan` (hoặc ngay sau đó thành một dòng `> **Giữ từ speakable-text (spec 003):**`) rằng `PromptBlock` phải giữ hành vi: không hiện nút loa cho đề tiếng Việt (`mcq-vi-jp`, `mcq-vi-kanji`); `mcq-kanji-reading` ẩn nút loa trước khi chọn đáp án và hiện lại sau khi chọn; đề dịch ngang 44 px khi nút hiện lại (xử lý khi làm `PromptBlock`).

---

## Phase 5: Kiểm cuối và Commit 2 (không có nhãn story)

- [x] T037 Hoàn tất `evidence.md` phần Story 2: kết quả đỏ (T029), test đặc trưng, xanh (T033, T034), ảnh (T035). Ghi **số liệu cuối** vào mục "Số liệu cuối": tổng chuỗi được đọc 2.378, số chuỗi đổi (271), khớp `answers.kana[0]` 1.295/1.295, khớp `answers.kanji[0]` 960/960, số chuỗi còn ký tự cấm 0, danh sách ngoại lệ rỗng, thời gian vitest trước/sau (từ T018).
- [x] T038 Chạy cổng cho Commit 2: `npm run check` (thẳng) rồi `npm run build`. Đỏ hai lần liên tiếp thì dừng và hỏi.
- [x] T039 `git add` đúng các file Commit 2: `src/features/practice/modes/mcq/types.ts`, `src/features/practice/modes/mcq/index.ts`, `src/features/practice/modes/mcq/McqComponent.tsx`, `src/features/practice/modes/mcq/mcq.test.ts`, `src/features/practice/modes/mcq/McqComponent.test.tsx`, `tests/e2e/speakable.spec.ts`, `docs/SPECKIT_ROADMAP.md`, `specs/003-speakable-text/tasks.md`, `specs/003-speakable-text/evidence.md`. (Chưa commit.)
- [x] T040 Kiểm vùng cấm: chạy `git diff staging --stat` (tại thời điểm này Commit 2 chưa tồn tại nên `staging..HEAD` chưa thấy nó; `git diff staging` thấy cả Commit 1 lẫn file đang staged). Danh sách file phải **đúng** các file dự kiến của hai commit (liệt kê ở T023 và T039). Chạy hai lệnh sau:
  - `git diff staging --name-status | grep "scripts/content/speakable-content.test.ts"` → phải ra dòng bắt đầu bằng `A` (thêm mới);
  - `git diff staging --name-only | grep -vxF "scripts/content/speakable-content.test.ts" | grep -E "domain/quiz/(registry|grading)|session|scripts/content|^content/|^public/content" || echo "OK: không đụng vùng cấm"` → phải ra `OK: không đụng vùng cấm`. Mẫu `scripts/content` chỉ loại trừ **đúng** đường dẫn `scripts/content/speakable-content.test.ts` (so khớp nguyên dòng, không ký tự đại diện); `enrich.ts`, `pipeline.ts`, `markdown-utils.ts` và mọi file khác dưới `scripts/content/` (kể cả các test khác, `pipeline.test.ts`) vẫn bị cấm.
  
  Không được có: `src/domain/quiz/registry.ts`, `src/domain/quiz/grading.ts`, session runner, `content/**`, `public/content/**`, schema hoặc `schemaVersion`, và `src/lib/tts.ts` không bị dời (chỉ sửa tại chỗ). Dán nguyên đầu ra vào mục "Kiểm vùng cấm" của `evidence.md`, rồi `git add specs/003-speakable-text/evidence.md` lại. Có file lạ thì dừng và hỏi.
- [x] T041 Commit 2: chạy `git diff --cached --name-only` và đối chiếu đúng danh sách ở T039 (không thừa, không thiếu, không file Companion). Rồi `git commit`: tiêu đề `feat(003): nút loa trắc nghiệm không đọc nhầm ngôn ngữ, không lộ đáp án`; thân có dòng `RED: <test đã đỏ trước khi sửa, kèm số lượng>` và kết thúc bằng dòng `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`. Không push.
- [x] T042 Xác nhận sau commit: chạy `git diff staging..HEAD --stat` (lệnh chủ dự án yêu cầu); danh sách phải giống đầu ra T040. Chạy `git status --short` chỉ còn các file chưa theo dõi đã biết.
- [ ] T043 **DỪNG, báo cáo, chờ chủ dự án duyệt. Không merge, không tạo PR.** Báo cáo: hai mã commit, đường dẫn hai ảnh `.screens/mcq-kanji-reading-before.png` và `-after.png` (đề có tràn ngang hay xuống dòng khi nút loa hiện lại, số đo ở T035), số liệu cuối (2.378 / 271 / 1.295/1.295 / 960/960), kết quả e2e (chỉ Q-2 đỏ), thời gian vitest trước/sau, đầu ra `git diff staging..HEAD --stat`. Câu hỏi cần trả lời: (1) ảnh `mcq-kanji-reading` có chấp nhận được không (nút loa hiện lại làm đề dịch ngang 44 px)? (2) Có duyệt để chủ dự án tự merge không?

---

## Phụ thuộc và thứ tự

- Phase 1 → Phase 3 → Commit 1 (T023) → **T024 (dừng, chờ duyệt)** → Phase 4 → Phase 5 → **T043 (dừng, chờ duyệt)**.
- Trong Phase 3: T005–T012 (viết test) → T013 (đỏ) → T014–T017 (mã) → T018–T019 (xanh, đo) → T020 → T021–T023.
- T005–T008 cùng một file nên làm tuần tự; T009, T010, T011, T012 là file riêng.
- T014 trước T015 (T015 import `toSpeakable`); T016 và T017 phụ thuộc kiểu `SpeakKind` và `speakJapanese` mới (sau T014, T015).
- Trong Phase 4: T025 trước mọi thay đổi mã; T026–T028 → T029 (đỏ) → T030 → T031 → T032 → T033–T036.
- T030 → T031 → T032 theo thứ tự (kiểu → dữ liệu → giao diện).
- Phase 5: T037 → T038 → T039 → T040 → T041 → T042 → T043.

## Cơ hội song song

- Phase 3 test: `T009`, `T010`, `T011`, `T012` chạy song song với nhau và với T005–T008.
- Phase 3 mã: sau T014 và T015, `T016` và `T017` song song.
- Phase 4 test: `T026`, `T027`, `T028` song song (ba file khác nhau).

## Chiến lược

- **MVP**: Commit 1 (US1 + US2 + US4) đã giải quyết phần lớn lỗi phát âm (661 chuỗi có ký tự nghi vấn, 271 chuỗi đổi) và dùng được ngay; chủ dự án nghe thử ở T024 trước khi làm tiếp.
- **Tăng dần**: Commit 2 (US3) độc lập về mã với Commit 1 (không dùng `toSpeakable`); đưa ra sau để có thể nghe kết quả Commit 1 trước.
- Mỗi commit tự đứng được: `npm run check` và `npm run build` xanh ở từng commit.
