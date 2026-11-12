# Evidence: kana-pronunciation (spec 004)

Bằng chứng theo từng story: test đỏ trước khi sửa mã, test đặc trưng, kết quả xanh, số liệu. Ngày làm: 2026-11-12.

## Mốc trước

Nhánh `004-kana-pronunciation`, tách từ `staging` = `69fc5d8` (merge PR #3 của spec 003). `.specify/feature.json` trỏ `specs/004-kana-pronunciation`; `SPECIFY_FEATURE` trống. Mã của spec 003 có trong nhánh (`promptSpeak` ở `modes/mcq/types.ts`, `toSpeakable` ở `src/lib/speakable.ts`, `SpeakOptions.kind` ở `src/lib/tts.ts`).

| Số đo (chưa sửa mã) | Kết quả |
|---|---|
| `npx vitest run` | 61 file, 386 test, tất cả xanh; 52,88 giây (máy có tải nền) |
| `npm run build` + `npx playwright test` | 24 test: **23 đạt, 1 đỏ**. Đỏ duy nhất: Q-2 `tests/e2e/browse.spec.ts:3` "mở trang chủ → vào N5 → Minna no Nihongo 1 → Bài 1" (nợ từ spec 001) |
| `npm run content:validate` | OK, **568 cảnh báo** |
| Băm `public/content/**` (script tạm `.screens/hash-content.mjs`, bỏ `README.md`) | **45 file**, SHA-256 gộp `2deeab187c4f7f57777689b29fdb3ff5708a26a3dec30a02e6a4d99e6f8ca068` |

Ổn định của băm: chạy `npm run content:build` liên tiếp hai lần rồi băm → `2deeab18…`; chạy lần ba rồi băm lại → cùng giá trị, cùng 45 file. (Trước đó, phân tích ở bước analyze: hai lần `runContentPipeline` vào thư mục tạm cũng cho cùng băm, nội dung dựng không có trường thời gian.) Mốc này dùng cho T072.

`public/content/README.md` là file git theo dõi duy nhất ở đó nên bị bỏ khỏi băm.

## Cơ chế nạp JSON

(Áp dụng cho Story 4; chép từ `tasks.md`.)

- **Vite**: plugin `vite:json` có sẵn biến `.json` thành module ES; dùng **default import** (`import corrections from '../../content/overrides/speech-corrections.json'`). `npm run build` đưa file vào chunk chính. File nằm dưới gốc dự án nên dev server (`server.fs.strict`) cho phép đọc. Vitest dùng cùng bộ biến đổi. **Không sửa `vite.config.ts`.**
- **TypeScript** (6.0.3): `tsconfig.app.json` có `moduleResolution: "bundler"` nên `resolveJsonModule` bật mặc định; file JSON ngoài `include: ["src"]` vẫn được nạp khi có import. Thử ngày 2026-11-12: tạo tạm `content/overrides/__tmp.json` và `src/lib/__tmp.ts` import nó; `tsc -p tsconfig.app.json --noEmit` không lỗi; vitest import chạy được; đã xóa hai file tạm. **Không sửa `tsconfig.app.json`, `tsconfig.node.json`.**
- **`tsconfig.node.json`** (`module: nodenext`): không dính vì `speakable.ts` không import JSON (bảng truyền làm tham số) và test nội dung đọc file bằng `readFileSync` + `JSON.parse`.
- **Pipeline/validate không đụng**: `pipeline.ts` đọc đúng ba file yaml theo đường dẫn tường minh. Kiểm chứng bằng băm `public/content` và số cảnh báo `content:validate` (mốc ở trên) trước/sau (T072).

## Story 1: kết quả ĐỎ

Chạy trước khi sửa mã (`VocabTab.tsx`, `SearchPage.tsx`, `FlashcardComponent.tsx` chưa đổi):

`npx vitest run src/lib/speakable.test.ts src/features/browse src/features/practice/modes/flashcard scripts/content/speakable-content.test.ts` → **7 đỏ, 77 xanh** (84 test, 6 file; 3 file có đỏ).

| Test đỏ | Số | Thông báo ngắn |
|---|---|---|
| `VocabTab.test.tsx` — từ có kanji (`jin`, `nanji`, `hanami`, `fun`) | 4 | đọc `人`, `何時`, `花見`, `分` thay vì `じん`, `なんじ`, `はなみ`, `ふん` |
| `FlashcardComponent.test.tsx` — từ có kanji; từ có ký hiệu `～ふん / ～ぷん` | 2 | đọc `何分`, `分` thay vì `なんぷん`, `ふん` |
| `SearchPage.test.tsx` — kết quả có kanji (`何時`) | 1 | đọc `何時` thay vì `なんじ` |

`npm run build` rồi `npx playwright test tests/e2e/kana-speech.spec.ts` → **1 đỏ, 0 xanh**: ca "Từ vựng Bài 1: loa ở `～人` đọc `じん`": `__spoken` nhận `["人"]`.

Tổng bằng chứng ĐỎ: **8** (7 vitest + 1 e2e). Lý do đỏ đúng như dự kiến: ba nơi gọi còn truyền `kanji ?? kana`.

## Story 1: test đặc trưng `[đặc trưng]` (xanh ngay)

Xanh trước và sau, không phải bằng chứng đỏ.

- `src/lib/speakable.test.ts` (12): bảng FR-002 theo kana (`～じん`→`じん`, `～にん`, `なんじ`, `なん`, `なに`, `なんぷん`, `あのかた`, `このあいだ`, `[お]はなみ`→`はなみ`, `～ふん / ～ぷん`→`ふん`) và hai từ chỉ có kana đọc y như trước. Xanh ngay vì `toSpeakable(kana, 'word')` đã làm từ spec 003.
- `scripts/content/speakable-content.test.ts`, describe `kana-pronunciation (spec 004) › từ vựng` (12): mọi từ có chuỗi đọc không rỗng/không chữ Hán/không ký tự cấm; 10 cặp (kanji, kana) tra trong nội dung thật; dòng số liệu. Xanh ngay vì cùng lý do.
- `VocabTab.test.tsx` (2), `FlashcardComponent.test.tsx` (2), `SearchPage.test.tsx` (2): từ chỉ có kana đọc đúng kana; chữ hiển thị không đổi (`～人`, `何時`, `[お]花見`, `～分`; mặt thẻ vẫn kana, không hiện `何分`).

Tổng: 30 test xanh ngay. Không có test nào thuộc nhóm "dự kiến đỏ" mà xanh ngay.

## Story 1: kết quả XANH

Sau khi sửa ba dòng (`VocabTab.tsx:131`, `SearchPage.tsx:74`, `FlashcardComponent.tsx:104`, mỗi dòng `kanji ?? kana` → `kana`):

| Số đo | Trước (mốc) | Sau |
|---|---|---|
| Lệnh Story 1 (`speakable.test.ts`, `browse`, `flashcard`, `speakable-content.test.ts`) | 7 đỏ / 77 xanh | **84/84 xanh** |
| `npx vitest run` toàn bộ | 61 file, 386 test | **63 file, 423 test, tất cả xanh** (thêm 2 file `VocabTab.test.tsx`, `FlashcardComponent.test.tsx` và 37 test: 12 + 12 + 6 + 4 + 3) |
| `npm run build` + `npx playwright test` toàn bộ | 24 test: 23 đạt, 1 đỏ | **25 test: 24 đạt, 1 đỏ**; đỏ duy nhất vẫn là Q-2 `browse.spec.ts:3`; ca mới `kana-speech.spec.ts` xanh |
| `npm run check` (thẳng) | — | **xanh, exit 0**: `content:validate` OK 568 cảnh báo (bằng mốc), `tsc -b`, `eslint .`, vitest 63 file / 423 test |
| `npm run build` | — | **xanh**; JS 610,68 kB, **186,16 kB gzip** (dưới ngân sách 200 kB; mốc 186,16 kB) |

Dòng số liệu của test nội dung (chạy riêng với `--silent=false`):

```
[kana-speech] từ vựng: 1295/1295 có chuỗi đọc hợp lệ; có kanji: 960
```

Kiểm FR-012 và "không còn `kanji ?? kana` ở nơi giao cho Story 1":

```
grep -rnE "SpeechSynthesisUtterance|speechSynthesis" src --include=*.ts --include=*.tsx | grep -vE "\.test\.tsx?:" | grep -vE "^src/(lib/tts|test/setup)\.ts:"
```

Kết quả: **rỗng (0 dòng)**.

```
grep -rnE "kanji \?\? (item|r)\.kana" src/features/browse src/features/practice/modes/flashcard --include=*.tsx | grep -E "SpeakButton|speak"
```

Kết quả: **rỗng (0 dòng)**. (Các dòng `Ruby base={item.kanji ?? item.kana}` chỉ để hiển thị nên không bị tính; chữ hiển thị không đổi.)

SC-004: không đổi ở story này (chỉ đổi chuỗi truyền vào ở danh sách, tìm kiếm, flashcard; chính tả nghe chưa đụng); lập luận đầy đủ ở Story 2 và Story 4.

Ghi chú: `console.info` của test nội dung không hiện khi chạy `npx vitest run` mặc định, nhưng hiện khi thêm `--silent=false`.

## Story 2: kết quả ĐỎ

(Chưa làm.)

## Story 2: test đặc trưng `[đặc trưng]` (xanh ngay)

Xanh trước và sau, không phải bằng chứng đỏ.

(Chưa làm.)

## Story 2: kết quả XANH

(Chưa làm.)

## Story 3: kết quả ĐỎ

(Chưa làm.)

## Story 3: test đặc trưng `[đặc trưng]` (xanh ngay)

Xanh trước và sau, không phải bằng chứng đỏ.

(Chưa làm.)

## Story 3: kết quả XANH

(Chưa làm.)

## Story 4: kết quả ĐỎ

(Chưa làm.)

## Story 4: test đặc trưng `[đặc trưng]` (xanh ngay)

Xanh trước và sau, không phải bằng chứng đỏ.

(Chưa làm.)

## Story 4: kết quả XANH

(Chưa làm.)

## Kiểm vùng cấm

### Commit 1 (trước khi commit)

```
$ git diff --cached staging --name-only | grep -vxF "scripts/content/speakable-content.test.ts" | grep -E "domain/quiz/(registry|grading)|session|scripts/content|^content/|^public/content" || echo "OK: không đụng vùng cấm"
OK: không đụng vùng cấm

$ git diff --cached staging -U0 | grep -E "^[+-].*schemaVersion" || echo "OK: không đụng schemaVersion"
(thô: 8 dòng khớp, TẤT CẢ nằm trong tài liệu `specs/004-kana-pronunciation/*.md` là chữ "schemaVersion" trong lời văn và trong chính câu lệnh; xem lệnh loại trừ bên dưới)
$ git diff --cached staging --name-status | grep -E "^(R|D)" || echo OK
OK

$ git diff --cached staging --stat
 docs/SPECKIT_ROADMAP.md                            |  21 +-
 scripts/content/speakable-content.test.ts          |  63 ++++
 .../checklists/requirements.md                     |  37 +++
 .../contracts/speech-contract.md                   |  92 ++++++
 specs/004-kana-pronunciation/data-model.md         |  65 +++++
 specs/004-kana-pronunciation/evidence.md           | 151 ++++++++++
 specs/004-kana-pronunciation/plan.md               | 221 ++++++++++++++
 specs/004-kana-pronunciation/quickstart.md         |  67 +++++
 specs/004-kana-pronunciation/research.md           | 116 ++++++++
 specs/004-kana-pronunciation/spec.md               | 217 ++++++++++++++
 specs/004-kana-pronunciation/tasks.md              | 316 +++++++++++++++++++++
 src/features/browse/SearchPage.test.tsx            |  88 ++++++
 src/features/browse/SearchPage.tsx                 |   2 +-
 src/features/browse/VocabTab.test.tsx              | 119 ++++++++
 src/features/browse/VocabTab.tsx                   |   2 +-
 .../modes/flashcard/FlashcardComponent.test.tsx    |  90 ++++++
 .../modes/flashcard/FlashcardComponent.tsx         |   2 +-
 src/lib/speakable.test.ts                          |  23 ++
 tests/e2e/kana-speech.spec.ts                      |  48 ++++
 19 files changed, 1729 insertions(+), 11 deletions(-)
```

Lệnh `schemaVersion` bản thô khớp chữ "schemaVersion" trong các file tài liệu `specs/004-kana-pronunciation/` (spec, plan, data-model, tasks nói rằng feature KHÔNG đụng nó; lệnh này tự khớp vào chính câu lệnh được chép trong `tasks.md`). Đây là khớp dương tính giả của lệnh trong `tasks.md`, không phải thay đổi nào về schema. Chạy lại loại trừ thư mục tài liệu spec:

```
$ git diff --cached staging -U0 -- . ':(exclude)specs/004-kana-pronunciation' | grep -E "^[+-].*schemaVersion" || echo "OK: không đụng schemaVersion (ngoài tài liệu specs/004)"
OK: không đụng schemaVersion (ngoài tài liệu specs/004)
```

Kết luận: không file nào ở vùng cấm (registry, grading, session, pipeline, `content/**`, `public/content/**`), không có file bị xóa hay đổi tên (`src/lib/tts.ts` không đụng), không đổi `schemaVersion`. Chỉ `scripts/content/speakable-content.test.ts` (loại trừ đúng đường dẫn, đã có từ spec 003, chỉ thêm describe) nằm dưới `scripts/content/`. 19 file, đúng danh sách dự kiến.

Đề xuất cho các commit sau: lệnh `schemaVersion` trong `tasks.md` nên loại trừ `specs/004-kana-pronunciation` (như trên) để khỏi báo nhầm.

## Thời gian vitest trước/sau

Máy có tải nền (VS Code, các tiến trình khác), nên số đo đơn lẻ dao động nhiều (spec 003 ghi 34,84 giây lúc máy rảnh, 52–63 giây lúc có tải).

| Lần đo | Mã | Test file | Test | Thời gian vitest | Ghi chú |
|---|---|---|---|---|---|
| mốc (T002) | trước Story 1 | 61 | 386 | 52,88 giây | xanh |
| sau Story 1, lần 1 (`npx vitest run`) | sau | 63 | 423 | 62,54 giây | xanh |
| sau Story 1, lần 2 (trong `npm run check`) | sau | 63 | 423 | 52,19 giây | xanh |

Story 1 không thêm lần chạy pipeline nào (dùng chung `beforeAll` của `speakable-content.test.ts`).

## Số liệu cuối

(Chưa làm.)
