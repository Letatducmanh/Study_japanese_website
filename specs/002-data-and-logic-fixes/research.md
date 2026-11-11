# Research: data-and-logic-fixes

**Ngày**: 2026-11-07 · **Nhánh**: `002-data-and-logic-fixes` · Mỗi mục có đủ Quyết định, Lý do, Phương án đã loại.

Thư viện mới: **không thêm thư viện nào** (constitution: thêm thư viện phải ghi lý do ở đây; không có).

## R0. Baseline trước khi sửa (đo trên nhánh này, 2026-11-07)

| Lệnh | Kết quả |
|---|---|
| `npm test -- --testTimeout=30000` | 44 file, **220/220 đạt**, 34,5 giây |
| `npm run build` | thành công; JS chính 608 KB, **185,24 KB gzip** (ngưỡng hiến pháp 200 KB gzip), CSS 7,39 KB gzip |
| `npm run content:validate` | **0 lỗi, 568 cảnh báo**; mnn1: **1023 từ chính, 272 từ mở rộng**, 132 mẫu ngữ pháp; kanji-master-n5: 134 Kanji |
| `npm run lint` | sạch, 0 lỗi |
| `npm run content:build` | xong, 568 cảnh báo; bản JSON "trước" lưu ở thư mục tạm của phiên (xem quickstart §A) |

Điều kiện đạt sau cùng: test = 220 + số test mới (không test cũ nào đỏ ngoài các test cố ý đổi kỳ vọng ở R3, R5); số cảnh báo `content:validate` **không tăng so với 568**; JS gzip không vượt 200 KB; lint sạch.

Ghi chú: `pipeline.test.ts` chạy mặc định có thể bị quá hạn 5 giây (Q-1 của spec 001; lần chạy `npm run check` ngày 10/11/2026 vẫn xanh 220/220 trong 32 giây, nên không phải lúc nào cũng xảy ra). Baseline vẫn chạy với `--testTimeout=30000`. Spec này **sửa Q-1** ở task T002a: tăng timeout riêng cho `scripts/content/pipeline.test.ts`, không đổi cấu hình vitest chung, rồi chạy `npm run check` ba lần liên tiếp để chứng minh ổn định. Cổng kiểm tra dùng thẳng `npm run check`. Các test mới trong chính `pipeline.test.ts` dùng chung một lần chạy pipeline (R5).

## R1. Kanji: tách "Hán Việt (nghĩa)" bằng bộ đọc cân bằng ngoặc

**Xác minh**: lỗi còn nguyên. `parse-kanji.ts:160` dùng `/^(.+?)\s*\((.+)\)$/u`; với "HÀNH (đi; tiến hành) / HÀNG (hàng, dòng)" cho `hanViet="HÀNH"`, `meaning="đi; tiến hành) / HÀNG (hàng, dòng"`. Quét toàn bộ `kanji.md`: có **đúng 2 ô** có nhiều hơn một cặp ngoặc: **行** (dòng 147) và **長** ("TRƯỜNG (dài) / TRƯỞNG (người đứng đầu)", dòng 232). Không ô nào có ngoặc lồng hay ba cặp; không ô nào sai quy cách.

**Quyết định**: viết hàm thuần `splitHanVietMeaning(cell)` trong `scripts/content/parse-kanji.ts` (hoặc file riêng cùng thư mục):
1. Tách ô thành các đoạn bằng dấu `/` **ở độ sâu ngoặc 0**.
2. Mỗi đoạn phải có dạng `HÁN VIỆT (nghĩa)`: đọc bằng bộ đếm độ sâu ngoặc; phần nghĩa là nội dung giữa `(` đầu tiên ở độ sâu 0 và `)` khớp cặp ở cuối đoạn.
3. Ghép: `hanViet` = các cụm Hán Việt nối bằng `" / "`; `meaning` = các nghĩa nối bằng `" / "`.
4. Ngoặc không cân hoặc đoạn không đúng dạng → báo lỗi kèm số dòng (như hiện nay), không đoán.

Kết quả: 行 → `hanViet = "HÀNH / HÀNG"`, `meaning = "đi; tiến hành / hàng, dòng"`. Ô một cặp ngoặc cho kết quả **giống từng byte** hiện tại.

**Lý do**: giữ nguyên mô hình dữ liệu (`hanViet`, `meaning` là hai chuỗi), schema Zod và mọi chỗ hiển thị (`KanjiPage`, `KanjiCard`, `kanji-hanviet`) — không đổi giao diện (FR-025). Đây vẫn là hai dòng giao diện hiện có: dòng Hán Việt, dòng nghĩa.

**Đã chốt (Q1, 10/11/2026, theo tasks.md)**: ví dụ bắt buộc ghi 行 ra "HÀNH (đi; tiến hành) / HÀNG (hàng, dòng)". Với cách trên, màn hình hiện hai dòng *"HÀNH / HÀNG"* và *"đi; tiến hành / hàng, dòng"*; ghép lại theo thứ tự là đúng nguyên văn nhưng **không phải một chuỗi duy nhất**. Cách để hiện đúng một chuỗi nguyên văn mà không đổi giao diện: đặt cả chuỗi vào dòng `hanViet` — nhưng khi đó dòng nghĩa trùng lặp và câu hỏi `kanji-hanviet` dùng cả chuỗi dài làm đáp án. Đã chọn cách đầu và test thêm một ràng buộc khứ hồi (ghép lại đúng nguyên văn).

**Phương án đã loại**: (a) chỉ sửa regex thành lazy/greedy khác — vẫn hỏng với ngoặc lồng, không báo lỗi; (b) đổi schema sang mảng các cặp `{hanViet, meaning}` — đúng hơn về dữ liệu nhưng đổi kiểu dùng ở ≥ 5 chỗ và giao diện, ngoài phạm vi "không đổi giao diện"; (c) sửa tay `kanji.md` — vi phạm nguyên tắc I (nội dung là nguồn, code phải đọc đúng).

**Kiểm chứng dữ liệu**: lưu JSON Kanji trước/sau (R0), so sánh bằng script: từng file `kanji-master-n5/*.json` phải giống từng byte, **trừ** hai mục `kanji-行` và `kanji-長`; trong hai mục đó chỉ `hanViet` và `meaning` đổi, các trường khác (`id`, `strokes`, `examples`, `relatedVocabIds`…) giữ nguyên.

## R2. Tìm kiếm

**Xác minh bằng đo thật** (1295 từ, cấu hình hiện tại `prefix: true, fuzzy: 0.2`):

| Truy vấn | Số kết quả hiện tại | Nhận xét |
|---|---|---|
| `sinh vien` / `sinh viên` | **156** | 学生 đứng đầu, nhưng 155 mục còn lại không liên quan |
| `nhat ban` | **246** | 日本 đứng đầu |
| `nuoc ngoai` | 53 | 外国 đúng đầu, 52 mục nhiễu |
| `gakusei`, `がくせい`, `学生`, `sensei`, `nihon` | 1–4 | đã tốt |
| `an`, `ni`, `xe` | 68, 46, 21 | khớp tiền tố 2 ký tự |
| `zzzz` | 0 | đã tốt |

**Nguyên nhân chính**: MiniSearch mặc định ghép các từ trong truy vấn bằng **HOẶC** (`combineWith: 'OR'`), nên mỗi từ "sinh", "vien" tự kéo về hàng trăm mục. Thêm `fuzzy: 0.2` áp lên mọi trường làm nhiễu nặng hơn. (Audit 27/10 chỉ nêu fuzzy; đo thật cho thấy HOẶC là nguyên nhân lớn hơn.)

**Đã thử** (cùng dữ liệu): `combineWith: 'AND'` + `fuzzy: false` cho `sinh vien` → 1 kết quả, `nhat ban` → 3, vẫn đúng 学生/日本 đứng đầu. Thêm `fuzzy: 0.2` cho mọi từ lại làm `sinh vien` ra 3 (教師, お勘定 lẫn vào) và `nhat ban` ra 13 → fuzzy phải bị giới hạn theo độ dài từ.

**Quyết định** (cấu hình tìm kiếm trong `src/data/search-index.ts`):
1. `combineWith: 'AND'`: mọi từ trong truy vấn phải khớp.
2. `fuzzy`: hàm theo độ dài từ — từ dưới 5 ký tự: không fuzzy; từ ≥ 5: `0.15`. Không fuzzy cho CJK.
3. `prefix`: chỉ khi từ ≥ 2 ký tự (CJK: 1 ký tự vẫn tìm đúng, vì một chữ Hán là một từ).
4. `boost`: `kana: 3, kanji: 3, romaji: 2, meaning: 1`.
5. Truy vấn là **một ký tự ASCII** → trả mảng rỗng (spec: "chuỗi một ký tự không được trả danh sách dài vô nghĩa").
6. Ngưỡng điểm: loại kết quả có điểm < **30%** điểm của kết quả đầu. Giá trị 0,30 chỉ là điểm khởi đầu; chốt trong lúc cài đặt bằng bộ truy vấn mẫu của SC-005 (đo lại bằng cùng script thăm dò).
7. Giữ `limit` 30.
8. Debounce 250 ms ở `SearchPage` (hook `useDebouncedValue` trong `src/lib/`). URL `?q=` vẫn cập nhật theo chữ gõ tức thời; chỉ lời gọi tìm kiếm bị trễ.

**Lý do**: sửa đúng nguyên nhân đo được; không thêm thư viện; hành vi tìm đúng kana/kanji/romaji giữ nguyên.

**Phương án đã loại**: bỏ MiniSearch viết bộ tìm tự làm (quá lớn, ngoài phạm vi); chỉ bỏ fuzzy (không giải quyết 156 kết quả).

**Rủi ro còn lại**: truy vấn hai ký tự như `an` (68 kết quả) là khớp tiền tố hợp lệ ở nhiều từ; ngưỡng tương đối + giới hạn 30 giữ danh sách gọn, không thể loại hẳn vì `xe` (→ 車) là truy vấn hợp lệ. Không nằm trong SC-005.

**Test**: dùng một tập từ mẫu nhỏ (khoảng 12 từ, có 学生/先生/外国/日本, từ nhiễu cố ý như 教師, お勘定) trong `search-index.test.ts`: truy vấn mẫu cho ra từ đúng ở top-3 (SC-005), truy vấn nhiễu cho ≤ 3 kết quả, `zzzz` → rỗng, một ký tự ASCII → rỗng, `nuoc ngoai` vẫn ra 外国.

## R3. Điểm yếu: bài chưa làm

**Xác minh**: `computeLessonScores` luôn đặt điểm cho mọi bài (0 nếu chưa làm); `WeaknessPage` sắp tăng dần rồi cắt 5, nên bài chưa làm thắng chỗ "yếu nhất". **Lan sang trang giáo trình**: `BookPage` dùng `lessonScores.get(n) ?? null`; vì map luôn có mọi bài nên bài chưa làm nhận 0 → `heatmapClass(0)` → **màu đỏ** thay vì màu "chưa có dữ liệu" (`score === null`). Spec đã chỉnh FR-004 cho đúng thực tế.

**Quyết định**: `computeLessonScores` (`src/domain/mastery/lesson-scores.ts`) chỉ đặt điểm cho bài **có ít nhất một bản ghi mastery của từ vựng thuộc bài đó** (từ chính hoặc mở rộng, tính theo mã từ). Bài khác không có khóa trong Map. `BookPage` không phải sửa (đã dùng `?? null`); `WeaknessPage` không phải sửa lọc (map chỉ chứa bài đã làm); khi map rỗng thì `weakestLessons.length === 0` và mục không hiển thị — trạng thái rỗng hợp lý, không lỗi.

**Test**: đổi test hiện có "bài chưa có dữ liệu nào trả về 0" thành "không có khóa"; thêm test: chỉ bài có mastery xuất hiện; bài đã làm toàn sai (điểm 0) **vẫn có** khóa với giá trị 0; mastery của sách khác không làm bài xuất hiện.

**Lý do**: một chỗ sửa ở domain cho cả hai màn hình; phép tính độ thành thạo (`lessonMasteryScore`) giữ nguyên.

**Phương án đã loại**: lọc riêng ở `WeaknessPage` (BookPage vẫn đỏ sai); trả `number | null` trong Map (kiểu thay đổi, ba chỗ gọi phải đổi).

## R4. "Luyện ngay" / "Ôn lại"

**Xác minh bằng đọc mã (cần test tái hiện, xem dưới)**:

- **Nguyên nhân A (đúng như giả thuyết)**: `PracticeRunPage` dựng `pool` = từ vựng đã lọc theo `onlyItemIds` + toàn bộ ngữ pháp bài, rồi gọi `buildSession({ items: pool, … })`; `ctxPool` không được truyền nên mặc định bằng `items`. Mọi dạng `mcq-*` có `isEligible` đòi ít nhất một đáp án nhiễu khác nghĩa/khác `homographKey` trong **vocab của ctx**. "Ôn lại" truyền đúng 1 từ → không có đáp án nhiễu → chỉ `flashcard` đủ điều kiện. Với "Luyện ngay", ctx chỉ là các từ yếu nên đáp án nhiễu nghèo và lệch (cùng chủ đề yếu). Cùng nguyên nhân làm "Làm lại câu sai" ở màn kết quả (cũng dùng `onlyItemIds`) mất trắc nghiệm.
- **Nguyên nhân B (đúng như giả thuyết)**: `WeaknessPage.handlePracticeNow` lấy `parsed` của từ đầu, rồi `sameLesson = topWords.filter(cùng bookId/lesson)`; `questionCount` và `onlyItemIds` chỉ theo `sameLesson`. Các từ yếu ở bài khác bị bỏ qua dù nút ghi "20 câu yếu nhất".
- **Giả thuyết cũ về id**: `REVIEW_MODE_IDS = ['flashcard','mcq-jp-vi','mcq-vi-jp']`. `modes/mcq/index.ts` đăng ký đủ `mcq-jp-vi` và `mcq-vi-jp` → **không còn là lỗi**. Vẫn thêm một test so khớp (R4-test-3) để lỗi kiểu này không tái diễn.

**Ràng buộc kiểm tra** (hiến pháp III, yêu cầu của Mạnh): không sửa `domain/quiz/registry.ts`, `session.ts`, `grading.ts`. `SessionConfig.ctxPool` **đã có sẵn** trong `buildSession` ("mục dùng làm bối cảnh cho isEligible/generate (đáp án nhiễu…)") nên phía gọi chỉ cần *truyền đủ ctxPool*; session không phải tự bù. Kết luận: **làm được mà không đụng vùng cấm**. Phần đụng tới là `PracticeRunPage` (nằm trong `features/practice`, không thuộc vùng cấm; Q2 đã chốt 10/11/2026 cho phép sửa).

**Quyết định**:
1. **Hàm thuần `buildReviewPools`** trong `src/features/practice/review-pools.ts`: nhận danh sách file bài đã tải, `onlyItemIds?`, `includeExtended` → trả `{ targets, ctxPool }`. `targets` là các mục cần luyện (từ vựng đã lọc theo `onlyItemIds` + ngữ pháp như cũ); `ctxPool` là *toàn bộ* từ vựng của các bài liên quan (theo `includeExtended`) + ngữ pháp. `PracticeRunPage` truyền `buildSession({ items: targets, ctxPool, … })`. Khi không có `onlyItemIds`, `ctxPool` bằng `targets` → hành vi cũ giữ nguyên.
2. **Nhiều bài**: `PracticeRunPage` tải tập bài = `(config.bookId, config.lesson)` **luôn có mặt**, gộp thêm các bài suy ra từ `onlyItemIds` (qua `parseVocabItemId`, `loadLesson` đã có cache). Gộp bài của `config` là bắt buộc: mã ngữ pháp hoặc Kanji (ví dụ "Làm lại câu sai" sau câu ngữ pháp sai) không giải ra bài qua `parseVocabItemId`, nếu không gộp thì tập bài rỗng và trang lỗi (hồi quy). Không có `onlyItemIds` thì chỉ một bài như cũ. `config.bookId/lesson` vẫn là bài của từ đầu tiên để nút "Luyện tiếp" ở màn kết quả hoạt động.
3. **Hàm thuần `planWeakReview`** trong `src/features/weakness/review-plan.ts`: từ danh sách mastery yếu đã xếp hạng + từ đã giải mã trả về một đối tượng cấu hình phiên với `onlyItemIds` = tối đa 20 từ yếu nhất **khác nhau** (bất kể bài), `questionCount` = số từ đó. Kiểu trả về **khai báo cục bộ** trong `review-plan.ts` (tương thích cấu trúc với `PendingSessionConfig` của `features/practice`) vì luật lớp chỉ miễn `features/weakness → features/practice` cho `WeaknessPage.tsx` và `MistakesPage.tsx`. **Nguồn dữ liệu**: `listWeak(20)` của trang trả 20 bản ghi mastery (cặp từ × kỹ năng, lẫn ngữ pháp/Kanji), sau khi lọc từ vựng và bỏ trùng có thể ít hơn 20 từ. Vì vậy khi bấm "Luyện ngay", `WeaknessPage.handlePracticeNow` lấy thêm bản ghi (`progressRepository.listWeak(200)`, giao diện `ProgressRepository` đã có tham số `limit`), giải mã từ qua `resolveVocabItems`, rồi gọi `planWeakReview` để chọn 20 từ phân biệt. Danh sách "Top từ yếu nhất" đang hiển thị **không đổi** (vẫn dùng `listWeak(20)`).
4. **`REVIEW_MODE_IDS` dùng chung**: chuyển hằng số ra `src/features/weakness/review-modes.ts` (hai trang cùng feature `weakness`, được phép), xóa hai bản sao.

**Giới hạn đã chốt (Q2, 10/11/2026)**: `buildSession` chọn ngẫu nhiên `questionCount` cặp *(từ, dạng bài)* trong các cặp đủ điều kiện; với 12 từ và 12 câu, một từ có thể ra hai lần và một từ khác không ra. Việc đảm bảo "mỗi từ đúng một lần" cần sửa `session.ts` — vùng cấm. Plan giữ hành vi hiện tại về điểm này và chỉ bảo đảm *tập từ* của phiên là đủ (đã chỉnh SC-003/FR-007 trong spec). Nếu sau này muốn bảo đảm phủ kín, phải mở riêng một thay đổi trong `session.ts`.

**Test tái hiện (phải đỏ trước khi sửa)**:
- *R4-test-1 (nguyên nhân A, ca đơn từ)*: `buildReviewPools` cho 1 từ → `buildSession` với `[flashcard, mcq-jp-vi, mcq-vi-jp]` phải có thể ra cả ba dạng. Trước khi sửa hàm chưa tồn tại → bước 1 viết hàm *giữ nguyên hành vi cũ* (ctxPool = targets) để test chạy được và **đỏ**, bước 2 truyền đủ ctxPool → xanh. Kèm test đặc tả (đã xanh ngay) chứng minh cơ chế: `buildSession` với pool 1 từ chỉ ra `flashcard`.
- *R4-test-2 (nguyên nhân B)*: `planWeakReview` với 12 từ yếu ở 3 bài → `onlyItemIds` đủ 12; trước khi sửa, bước 1 chép nguyên logic cũ vào hàm → đỏ. Thêm ca page-level cho nguồn dữ liệu: mỗi từ có 2 kỹ năng và có thêm mastery ngữ pháp → phiên vẫn có 20 từ phân biệt (đỏ với `listWeak(20)`).
- *R4-test-5 (hồi quy "Làm lại câu sai" sau câu ngữ pháp sai)*: trang chạy vẫn dựng được câu hỏi khi `onlyItemIds` chỉ chứa mã ngữ pháp (xanh trước và sau sửa; chốt chặn cho việc luôn gộp bài của `config`).
- *R4-test-3 (đối chiếu id)*: nạp `register-all`, so mọi id trong `REVIEW_MODE_IDS` với `questionRegistry.list()`; đặt ở `src/test/` để không vướng luật cấm `features/weakness` import `features/practice` (xanh ngay, là chốt chặn hồi quy). Cùng lý do, `WeaknessPage.practice.test.tsx` và `MistakesPage.test.tsx` (cần `usePracticeSessionStore`) cũng đặt ở `src/test/`.
- *R4-test-4*: `planWeakReview` giới hạn tối đa 20 và bỏ qua mastery không phải từ vựng.

**Phương án đã loại**: sửa `isEligible` của `mcq` hoặc thêm đáp án nhiễu trong session (vùng cấm); giả lập thêm từ "đệm" vào `onlyItemIds` (làm sai nội dung phiên); đổi `questionCount` thành số cặp (từ × dạng) (quá dài, sai nhãn "20 câu").

## R5. Số liệu từ chính / mở rộng

**Xác minh**: đúng như audit: `DVD` (dòng 448, Bài 6 phần chính), `おなかが すきます` và `のどが かわきます` (dòng 984–985, Bài 13 phần chính). Cả Bài 6 và Bài 13 **đã có** bảng "### 2. Từ vựng mở rộng ★" (chủ đề "Món ăn Nhật Bản" và "Gọi món tại Nhà hàng"). ID từ vựng = `mnn1-lNN-hash8(kana|kanji)` không chứa phần nhóm (`scripts/content/ids.ts`), nên chuyển hàng không đổi ID. Giá trị hiện tại (lưu vào test làm chuẩn):

| Từ | ID |
|---|---|
| DVD | `mnn1-l06-20bdf436` |
| おなかが すきます | `mnn1-l13-cd7659ef` |
| のどが かわきます | `mnn1-l13-af449570` |

Bài 6: 52 chính + 9 mở rộng → 51 chính + 10 mở rộng; Bài 13: 40 chính + 9 mở rộng → 38 chính + 11 mở rộng. Tổng: 1023 → **1020** chính, 272 → **275** mở rộng.

**Quyết định**:
1. Thêm **bảng riêng** cuối phần mở rộng của mỗi bài, vì tiêu đề bảng sẵn có sai chủ đề (DVD không phải món ăn Nhật):
   - Bài 6: `### 3. Từ vựng mở rộng ★ — Thiết bị giải trí (娯楽)` chứa DVD (hoặc tên tương đương do Mạnh đặt).
   - Bài 13: `### 3. Từ vựng mở rộng ★ — Cảm giác đói và khát (空腹・のどの渇き)` chứa hai mục.
   `parse-vocab.ts` đã nhận nhiều tiểu mục có chữ "mở rộng" (nhận diện theo tiêu đề) nên không cần sửa parser. Tên chủ đề do Mạnh có thể đổi.
2. Xóa ba hàng khỏi bảng chính.
3. Cập nhật test: `pipeline.test.ts` (272 → 275, thêm 1020), `parse-vocab.test.ts` (272 → 275; thay `toBeGreaterThan(1000)` bằng `toHaveLength(1020)`).
4. Thêm test: số từ chính 1020, mở rộng 275, ngữ pháp 132, Kanji 119, phụ lục 15 (đọc từ `summary` + JSON `kanji-master-n5`), dùng **chung một lần chạy pipeline** với test hiện có trong `pipeline.test.ts` (`beforeAll`) để không thêm thời gian. Riêng `src/data/search-index.real.test.ts` (R2) có **một lần chạy pipeline riêng** với timeout riêng: không đọc được `public/content` vì `npm run check` chạy trước `content:build` (CI cũng vậy) và thư mục đó bị gitignore; không chia sẻ kết quả giữa hai file test được vì mỗi file chạy cô lập, mà chia sẻ cần `globalSetup`, tức đổi cấu hình vitest chung.
5. Test ID: ba mã ở bảng trên phải có trong đầu ra và nằm ở `section: 'extended'` với đúng bài.
6. Tài liệu: sửa `docs/reference/Ke_hoach_Website.md:691` (272 → 275); `ARCHITECTURE.md` §9.2 và `SPECKIT_ROADMAP.md` đã ghi 1.020/275 (giữ). `docs/reference/audit-hien-trang.md` và `specs/001-repo-restructure/spec.md` là bản chụp theo ngày, ghi 1.023/272 đúng tại thời điểm đó → **không sửa**, ghi chú ở đây.
7. Kiểm UI: `VocabTab` phải hiện bảng mở rộng thứ hai đúng (nhóm theo `sectionTitle`); xác nhận khi cài đặt, không đổi giao diện.

**Phương án đã loại**: nhét ba hàng vào bảng "Món ăn Nhật Bản"/"Gọi món" (nhãn sai); sửa mã (vi phạm nguyên tắc V, mất tiến độ).

## R6. Thứ tự làm và commit

Mỗi story **một commit** gồm test và bản sửa (Hiến pháp IV: `npm run check` xanh trước mọi commit, nên không commit test đỏ riêng). Test vẫn phải được chạy và thấy ĐỎ trước khi viết mã sửa; kết quả đỏ (tên test, thông báo lỗi) ghi vào `evidence.md` và tóm tắt một dòng ở thân commit. Trước commit chạy `npm test -- --testTimeout=30000`, `npm run build`, `npm run content:validate`, `npm run lint` rồi `npm run check`:

0. `fix(002): tăng timeout riêng cho pipeline.test.ts (Q-1)` (T002a, trước mọi story)
1. `fix(content): tách đúng Hán Việt/nghĩa cho ô Kanji có nhiều cặp ngoặc (行, 長)` (R1, T042)
2. `content(n5): chuyển DVD, おなかが すきます, のどが かわきます sang từ mở rộng (1.020 chính, 275 mở rộng)` + test số liệu + docs (R5, T066)
3. `fix(weakness): bài chưa làm không bị tính yếu nhất, trang giáo trình hiện trung tính` (R3, T011)
4. `fix(weakness): Luyện ngay/Ôn lại đủ dạng bài, lấy 20 từ yếu nhất qua nhiều bài` (R4, T031)
5. `fix(search): ghép từ bằng AND, giới hạn fuzzy, ngưỡng điểm, debounce` (R2, T055)

Thứ tự này cho dữ liệu trước (1, 2) rồi logic (3, 4) rồi tìm kiếm (5, cần chỉnh số theo dữ liệu thật đã chốt).
