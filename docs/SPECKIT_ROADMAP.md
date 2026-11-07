# SPECKIT_ROADMAP.md — Lộ trình feature và prompt mẫu (v2)

> **Vị trí trong repo:** `docs/SPECKIT_ROADMAP.md` · **Phiên bản:** 2.0 (29/10/2026), viết lại theo `docs/reference/audit-hien-trang.md`.
> Dành cho Mạnh (người điều khiển) và Claude Code (người làm). Thiết kế hệ thống: `docs/ARCHITECTURE.md`. Giao diện: `docs/FRONTEND.md`. Luật bất biến: `.specify/memory/constitution.md`.
> **Khác v1:** code đã làm tới khoảng "Phase 10" (MVP), nên roadmap này **không tạo lại spec cho phần đã xong**. Chỉ có 10 spec cho phần còn thiếu, theo thứ tự ở §3.

---

## 1. Spec Kit: đã cài, cách dùng hằng ngày

Đã xong: Specify CLI, `.specify/`, `.claude/skills/speckit-*`, constitution v1.0.0.

- **Mở lại Claude Code** (thoát hẳn rồi mở lại trong thư mục repo) sau khi cài Spec Kit; nếu không, các lệnh `/speckit-*` có thể không xuất hiện. Gõ `/speckit` để kiểm tra. Tùy phiên bản, lệnh có dạng `/speckit-specify` hoặc `/speckit.specify`; hai dạng làm cùng một việc, tài liệu này viết dạng gạch nối.
- Nếu lệnh vẫn không có: dán nội dung prompt như một yêu cầu thường ("Làm theo skill speckit-specify với nội dung: …"), hoặc báo tôi phiên bản `specify version`.
- Cài lại trên máy khác: `uv tool install specify-cli --from git+https://github.com/github/spec-kit.git` rồi `specify init --here --integration claude` (bản cũ dùng `--ai claude`; Windows thêm `--script ps`). Chỉ cài từ repo `github/spec-kit`.

**Quy trình mỗi feature** (đọc kết quả từng bước rồi mới sang bước sau):
`/speckit-specify` (CÁI GÌ, không nêu công nghệ) → `/speckit-clarify` → `/speckit-plan` (LÀM THẾ NÀO) → `/speckit-tasks` → `/speckit-analyze` → `/speckit-implement`. Sau đó `npm run check`, xem bản Vercel Preview trên điện thoại, rồi mới merge.

---

## 2. Quyết định từ audit

| # | Việc | Quyết định | Trạng thái |
|---|---|---|---|
| 1 | Giao diện theo tài liệu nào | Giữ nhận diện trong `docs/reference/design/SPEC.md` (Tuyến tàu, vàng, ga `L01`, Shiba). `docs/FRONTEND.md` v2 là bản chuẩn | Chốt |
| 2 | Chú chó Shiba | Giữ; chỉ đặt ở trang chủ, tab Học, kết quả, trạng thái rỗng (FRONTEND §5.1) | Chốt |
| 3 | Âm thanh đúng/sai (`lib/sfx.ts`) | Giữ, **mặc định tắt**, có công tắc trong Cài đặt | Đề xuất, chờ Mạnh |
| 4 | Số từ chính 1.023 hay 1.020 | Đã xác định 3 hàng thừa: `DVD` (Bài 6), `おなかが すきます` và `のどが かわきます` (Bài 13). **Chuyển cả 3 sang từ vựng mở rộng**: từ chính 1.020, từ mở rộng 275 (làm ở `data-and-logic-fixes`). Nếu sau này đối chiếu sách in thấy `DVD` có trong Bài 6 bản mới thì chuyển lại | Chốt |
| 5 | `design/` và `BACKLOG.md` | Dời vào `docs/reference/` (làm ở `repo-restructure`) | Đề xuất |
| 6 | Hai thư mục ngoài Git | **Chưa xóa.** Nén lưu `Source code/Docs/`; giữ `Ảnh mobile/` đến khi `pages-migration` xong | Đề xuất |
| 7 | `ui/` có được dùng `platform/` | Có (ADR-009); đã sửa `ARCHITECTURE.md` §4.2 | Chốt |
| 8 | Trạng thái roadmap | File này | Chốt |
| 9 | Viền ô chưa chọn (`border-strong`) chỉ đạt 1.74:1 | Đề xuất đổi `#B7C5DD` → `#7A8DB0` (3.35:1). Chưa đổi khi chưa có xác nhận | Chờ Mạnh |
| 10 | Hiện % thành thạo và nhãn "Cần ôn" (dưới 40%) trên từng ga ở tab Học | Đề xuất; ảnh thiết kế chưa có, nhưng đây là mục tiêu chính của sản phẩm | Chờ Mạnh |

**Trả lời các câu hỏi cuối `docs/reference/design/AUDIT.md`:**
1. Sau khi dựng bộ component, **chuyển luôn trang chủ và tab Học** để nhìn thấy kết quả thật (làm ở `ui-kit-and-shell`).
2. **Tách** sửa lỗi ra spec riêng: lỗi logic và dữ liệu làm trước (`data-and-logic-fixes`); lỗi phản hồi dạng gõ và nhãn bộ đếm làm cùng lúc với đổi giao diện luyện tập (`practice-ui-migration`) vì cần `FeedbackSheet`.
3. Sửa regex `parse-kanji.ts`: không rà tay toàn bộ. So sánh JSON Kanji **trước và sau** bằng script, chỉ các ô có 2 cặp ngoặc phải khác.
4. Màu tối: giữ các giá trị đã suy ra trong `src/ui/tokens.css`, không cần duyệt lại bảng.
5. Id `mcq-jp-vi`/`mcq-vi-jp`: kiểm tra lại trên mã hiện tại (audit 29/10 ghi 6 hướng đã đăng ký). Nếu đã có thì bỏ qua; nếu chưa thì sửa ở `data-and-logic-fixes`.

> **Lưu ý:** `docs/reference/design/AUDIT.md` là bản ngày 27/10, trước các thay đổi giai đoạn 1–2. Với mỗi lỗi trong đó, **xác minh lại trên mã hiện tại** trước khi sửa.

---

## 3. Hàng đợi spec

Ký hiệu: ⬜ chưa làm · 🟨 đang làm · ✅ xong. Số thư mục `specs/NNN` do Spec Kit tự cấp theo thứ tự tạo.

| Thứ tự | Spec | Trạng thái |
|---|---|---|
| 1 | repo-restructure | ⬜ |
| 2 | data-and-logic-fixes | ⬜ |
| 3 | ui-kit-and-shell | ⬜ |
| 4 | practice-ui-migration | ⬜ |
| 5 | pages-migration | ⬜ |
| 6 | quality-gaps | ⬜ |
| 7 | accounts-sync | ⬜ |
| 8 | srs-review | ⬜ |
| 9 | stats-pwa-release (✅ phát hành 1.0 khi xong) | ⬜ |
| 10 | native-app | ⬜ |

Đã có mã, không tạo spec mới: content-pipeline (90%), content-browsing (85%), local-progress (95%), quiz-engine-flashcard (90%), mcq-and-results (90%), vocab-modes (85%), grammar-kanji-quiz (75%), weakness-mistakes (80%). Phần còn thiếu của chúng nằm trong các spec trên (`ARCHITECTURE.md` §9.1).

---

## 4. Prompt từng spec

Mỗi spec có 2 prompt: `specify` (nói CÁI GÌ) và `plan` (nói LÀM THẾ NÀO). Dán đúng sau lệnh slash.

### 4.1 repo-restructure ⬜
```
/speckit-specify Sắp xếp lại cấu trúc repo cho gọn và nhất quán để tôi và Claude Code luôn biết mỗi loại file nằm ở đâu, theo bảng phân loại trong docs/reference/audit-hien-trang.md (các nhóm "Dời" và "Xóa"). Website đang chạy trên Vercel phải hoạt động y như cũ: mọi trang mở được, không mất nội dung, không đổi giao diện. Không còn file .md lẻ ở gốc repo (trừ CLAUDE.md và README.md), không còn file bản sao hay build cũ. Link hỏng trong README.md được sửa. Ngoài phạm vi: đổi màu, đổi font, đổi giao diện, thêm layout làm bài, lazy loading.
```
```
/speckit-plan Theo docs/ARCHITECTURE.md §8.1 và luật phụ thuộc §4.2. Chỉ dời/đổi tên file và sửa import, không viết lại logic; dùng git mv để giữ lịch sử. Dời src/components/** vào src/ui/** và src/app/** theo bảng audit §2.2 (primitives, jp, quiz, signature, mascot vào src/ui/signature/mascot); dời design/ và BACKLOG.md vào docs/reference/; src/lib/use-async-data.ts vào src/data/hooks/. Thêm luật ESLint no-restricted-imports theo §4.2; nếu luật mới làm lint đỏ ở file hiện có thì sửa khi nhỏ, còn lớn thì ghi vào tasks như nợ kỹ thuật có số file cụ thể. Chưa dời lib/tts.ts (thuộc ui-kit-and-shell). Kiểm chứng: npm run build, npm run check, e2e mở trang chủ và /b/mnn1/5, và so sánh ảnh chụp trang chủ trước/sau (không đổi).
```

### 4.2 data-and-logic-fixes ⬜
```
/speckit-specify Sửa các lỗi dữ liệu và logic mà người học nhìn thấy, không đổi giao diện: (1) chữ Kanji có nhiều cách đọc/nghĩa hiển thị sai Hán Việt, ví dụ 行 phải là "HÀNH (đi; tiến hành) / HÀNG (hàng, dòng)"; (2) tìm kiếm trả về quá nhiều kết quả không liên quan; (3) trang Điểm yếu đang xếp các bài chưa học lần nào là "yếu nhất" với 0%; (4) nút luyện ngay từ trang Điểm yếu và Sổ lỗi sai phải chạy đủ các dạng bài dự kiến, không âm thầm bỏ dạng; (5) ba mục không thuộc danh sách từ chính của giáo trình (DVD, おなかが すきます, のどが かわきます) nằm ở phần từ vựng mở rộng, và số liệu từ chính/mở rộng trong kiểm thử và tài liệu khớp với thực tế. Mỗi lỗi có test tái hiện lỗi trước khi sửa.
```
```
/speckit-plan Xác minh từng lỗi trên mã hiện tại trước khi sửa (docs/reference/design/AUDIT.md là bản 27/10, có thể đã lỗi thời). Gợi ý nguyên nhân theo audit: (1) scripts/content/parse-kanji.ts dùng regex một cặp ngoặc cho ô có hai cặp ngoặc; viết lại bằng bộ đọc cân bằng ngoặc, rồi chạy content:build trước và sau và so sánh JSON Kanji: chỉ các ô có nhiều cặp ngoặc được khác. (2) src/data/search-index.ts: fuzzy 0.2 áp lên cả field meaning, không boost, không ngưỡng; ưu tiên kana/kanji/romaji, giới hạn fuzzy, thêm ngưỡng điểm và debounce ở SearchPage. (3) computeLessonScores/WeaknessPage: chỉ coi bài là ứng viên yếu khi có ít nhất 1 lượt làm. (4) WeaknessPage.REVIEW_MODE_IDS và MistakesPage.REVIEW_MODE_IDS: đối chiếu với id thật trong register-all.ts. (5) chuyển 3 hàng sang bảng từ vựng mở rộng của đúng bài (tạo bảng "### 2. Từ vựng mở rộng ★" theo mẫu Phụ lục B của Ke_hoach_Website nếu bài đó chưa có): DVD ở Bài 6; おなかが すきます và のどが かわきます ở Bài 13. ID từ vựng không đổi (hash kana|kanji, không chứa section) nên tiến độ đã lưu được giữ nguyên. Sau đó từ chính phải là 1.020 và từ mở rộng là 275: cập nhật scripts/content/pipeline.test.ts và mọi tài liệu ghi số từ chính/mở rộng, và thêm test kiểm số từ chính và số từ mở rộng riêng biệt. Không sửa registry, session, grading (constitution III).
```

### 4.3 ui-kit-and-shell ⬜
```
/speckit-specify Khung ứng dụng và bộ thành phần giao diện dùng chung theo bản thiết kế "Tuyến tàu" đã chọn. Người học dùng một giao diện thống nhất: cùng màu, cùng font (Be Vietnam Pro cho tiếng Việt, Zen Kaku Gothic New cho chữ Nhật), cùng kiểu nút, ô đáp án và khối phản hồi. Khi đang luyện tập thì ẩn thanh điều hướng, chỉ còn nút thoát, thanh tiến độ và bộ đếm. Trang chủ và tab Học khớp ảnh thiết kế. Giao diện đúng trên điện thoại có tai thỏ, không bị che. Chuyển trang không tải hết mã một lần. Chế độ sáng/tối vẫn đúng.
```
```
/speckit-plan Theo docs/FRONTEND.md toàn bộ, đặc biệt §3, §4, §5, §6, §8 và các ảnh tham chiếu trong docs/reference/design/. Token đã nằm ở src/ui/tokens.css (repo-restructure đã dời từ src/index.css, không đổi nội dung); thêm token mới song song và chưa xóa primary-* (còn dùng ở 31 file). Cài clsx, tailwind-merge, class-variance-authority, @fontsource/be-vietnam-pro, @fontsource/zen-kaku-gothic-new; bỏ Google Fonts khỏi index.html; sửa theme-color và viewport-fit=cover; min-h-dvh. Dựng trong src/ui: Button (primary, solid, outline, wrong, ghost), IconButton, ListRow, Skeleton, ProgressBar; quiz/PracticeShell, ProgressLine, FeedbackSheet, OptionButton, PromptBlock; signature/StationList (có % thành thạo, dựa trên thang ở FRONTEND §7 màn hình 2); jp/JpText (lang="ja"). FocusShell cho /practice/run. Router chuyển sang data router + lazy(). Tạo src/platform/ (types.ts, index.ts, web/) và chuyển lib/tts.ts vào đó. Script npm run ui:shot (Playwright, 390/768/1440, sáng/tối) và Playwright viewport 360×740. Chuyển trang chủ và tab Học sang bộ mới. Mỗi component có test. Thêm vào research.md lý do cho mỗi thư viện mới.
```

### 4.4 practice-ui-migration ⬜
```
/speckit-specify Chuyển toàn bộ 16 dạng luyện tập sang giao diện mới theo ảnh thiết kế. Khi người học gõ đáp án (gõ đáp án, chính tả nghe, chia động từ) và bấm Kiểm tra hoặc Enter thì phải thấy phản hồi đúng/sai kèm đáp án đúng và chỗ bị thiếu trước khi sang câu tiếp. Ghép cặp hiện đồng hồ và "x/6 cặp"; Đúng/Sai tốc độ hiện "Còn lại / Điểm / Kỷ lục"; không dạng nào hiện "Câu n/N" sai ngữ nghĩa. Phím tắt thống nhất: Space, 1–4, Enter, mũi tên trái/phải cho Sai/Đúng. Nhãn flashcard là Quên, Khó, Nhớ, Dễ kèm khoảng cách ôn. Sắp xếp câu giữ cách chạm để đặt.
```
```
/speckit-plan Theo docs/FRONTEND.md §6.2, §6.3, §7 (màn hình 3 đến 10), §8. Giữ nguyên giao diện { q, onAnswer } của QuestionType; không sửa registry, session, grading. Làm theo từng nhóm, mỗi nhóm một commit: (a) trắc nghiệm và các dạng dùng TextChoiceCard/BlankChoiceCard (10 dạng): thay bằng OptionButton + FeedbackSheet, xóa hai card cũ khi hết nơi dùng; (b) nhóm gõ đáp án (typing, dictation, conjugation-typing): thêm bước phản hồi bằng FeedbackSheet; (c) ghép cặp và đúng/sai tốc độ: nhãn riêng, và để PracticeRunPage hoặc một hook chung ghi Attempt thay vì mỗi component tự gọi progressRepository.recordAttempt; (d) flashcard; (e) màn thiết lập (nhóm dạng bài lấy từ registry, thêm trường group vào QuestionType) và màn kết quả. Lớp phím tắt chung đặt trong PracticeShell. Test e2e: gõ sai thấy FeedbackSheet; làm Ghép cặp không thấy "Câu 1/1". Chạy npm run ui:shot và so với ảnh tham chiếu sau mỗi nhóm.
```

### 4.5 pages-migration ⬜
```
/speckit-specify Các trang còn lại (duyệt bài học, chi tiết Kanji, tìm kiếm, điểm yếu, sổ lỗi sai, cài đặt, giới thiệu, 404, trạng thái "sắp có") cùng một giao diện với phần đã chuyển: cùng màu, font, icon và kiểu thẻ. Không còn emoji làm icon. Cài đặt có công tắc "Âm thanh đúng/sai", mặc định tắt. Chữ Nhật nào cũng hiển thị đúng dạng chữ Hán Nhật.
```
```
/speckit-plan Theo docs/FRONTEND.md §13 (bảng đổi class) theo thứ tự: duyệt nội dung (BookPage dùng StationList, LessonPage, KanjiPage, SearchPage) → điểm yếu, sổ lỗi sai → cài đặt, giới thiệu. Dùng JpText cho mọi chữ Nhật. Thay emoji bằng Lucide. Màn hình chưa có ảnh: phác wireframe 390 và 1440, chờ tôi duyệt trước khi code. Sau khi xong cả nhóm, quét repo: 0 class màu mặc định Tailwind, 0 hex trong component (trừ SVG linh vật và styleguide), 0 emoji; rồi mới xóa token primary-*, success, danger, warning khỏi tokens.css. Công tắc âm thanh lưu trong settings, lib/sfx.ts chỉ phát khi bật.
```

### 4.6 quality-gaps ⬜
```
/speckit-specify Hoàn thiện chất lượng trước khi làm tài khoản: mọi dạng luyện tập có kiểm thử; mỗi bài ngữ pháp sinh được ít nhất 5 câu chọn trợ từ; nút "Tiếp tục học" biết tiến độ từ vựng, ngữ pháp và Kanji; sổ lỗi sai lọc được theo dạng bài; có tài liệu hướng dẫn soạn file nội dung; kiểm thử chạy ổn định trên điện thoại cỡ 360px.
```
```
/speckit-plan Gồm: unit test cho flashcard, dictation, speed-truefalse; e2e đủ 6 hướng trắc nghiệm; test số lượng nội dung (từ chính, từ mở rộng, ngữ pháp, Kanji, Kanji phụ lục) theo con số đã chốt ở data-and-logic-fixes; test ≥ 5 câu trợ từ mỗi bài (xem danh sách trợ từ viết cứng ở modes/particle, chuyển vào dữ liệu nếu vi phạm constitution I); nút Tiếp tục đọc tiến độ ngữ pháp và Kanji; bộ lọc dạng bài ở Sổ lỗi sai; docs/CONTENT_GUIDE.md (= Ke_hoach_Website §5 + Phụ lục B); tăng testTimeout cho scripts/content/pipeline.test.ts; thêm bước e2e vào .github/workflows/ci.yml; xử lý các mục còn hiệu lực trong docs/reference/BACKLOG.md.
```

### 4.7 accounts-sync ⬜
```
/speckit-specify Tài khoản đơn giản (email + mật khẩu, tùy chọn Google) để học trên điện thoại rồi mở máy tính thấy cùng tiến độ. Không đăng nhập vẫn dùng đầy đủ. Lần đầu đăng nhập trên máy đã có tiến độ thì hỏi có gộp không. Mất mạng vẫn học, có mạng lại tự đồng bộ. Có trang tài khoản: đổi tên, đổi mật khẩu, trạng thái đồng bộ, xuất dữ liệu, xóa tài khoản. Người này không bao giờ xem được dữ liệu của người khác.
```
```
/speckit-plan Theo docs/reference/Ke_hoach_Website.md §3.7, §6.8 và docs/ARCHITECTURE.md §5.3. Supabase Auth + migrations SQL + RLS, data/supabase-client.ts (chạy ở chế độ khách khi thiếu biến môi trường), data/sync/sync-service.ts đẩy outbox theo lô và pull theo updated_at. Màn hình theo FRONTEND §7 (chưa có ảnh: phác wireframe trước). Liệt kê các bước tôi phải tự bấm trên trang Supabase.
```

### 4.8 srs-review ⬜
```
/speckit-specify Trang "Ôn tập hôm nay": hiện các thẻ đến hạn ôn và tối đa 10 thẻ mới mỗi ngày (chỉnh được); từ sắp quên được ôn trước; có chuỗi ngày học liên tiếp nhưng không ép buộc. Kết quả các dạng bài khác cũng ảnh hưởng lịch ôn.
```
```
/speckit-plan Theo Ke_hoach_Website §6.6, bọc ts-fsrs trong src/domain/srs, test với đồng hồ giả, đồng bộ qua bảng srs_cards. Dùng lại FlipCard và PracticeShell. Trang chủ dùng số thẻ đến hạn cho hàng "Ôn tập hôm nay".
```

### 4.9 stats-pwa-release ⬜ (✅ phát hành 1.0)
```
/speckit-specify Hoàn thiện bản 1.0: trang thống kê (số câu mỗi ngày, độ chính xác theo kỹ năng, tiến độ theo bài), trang chủ đầy đủ số liệu của người học, cài được lên màn hình chính điện thoại và dùng offline, điều khiển được bằng bàn phím và trình đọc màn hình, rà soát và viết lại câu ví dụ chép nguyên văn từ sách.
```
```
/speckit-plan vite-plugin-pwa cache public/content, tách code theo trang, Lighthouse mobile ≥ 90, BarChart và SkillBars theo docs/FRONTEND.md §8, public/icons và manifest.webmanifest, trang /about ghi nguồn giáo trình.
```

### 4.10 native-app ⬜
```
/speckit-specify Có app Android (và iOS khi có máy Mac) cài từ file hoặc cửa hàng, dùng cùng nội dung và tài khoản với website. Phát âm tiếng Nhật chạy được trong app, có rung nhẹ khi trả lời, nút quay lại của Android hoạt động đúng, giao diện không bị tai thỏ hay thanh trạng thái che, đăng nhập trong app quay về đúng app.
```
```
/speckit-plan Capacitor bọc dist/ (docs/ARCHITECTURE.md ADR-003, §7). Bản native trong src/platform/native: @capacitor-community/text-to-speech, @capacitor/haptics, @capacitor/app (nút back, deep link), @capacitor/status-bar, @capacitor/browser, @capacitor/share. Safe-area theo docs/FRONTEND.md §6.4. Liệt kê các bước tôi cần làm trong Android Studio.
```

---

## 5. Câu lệnh nhanh khi kẹt

| Tình huống | Gõ vào Claude Code |
|---|---|
| Không biết đang ở bước nào | "Đọc specs/ và cho tôi biết feature nào đang dở, bước Spec Kit tiếp theo là gì" |
| Spec có chỗ mơ hồ | `/speckit-clarify` |
| Sợ plan/tasks lệch spec | `/speckit-analyze` |
| Giao diện lệch bản thiết kế | "Soát màn hình X theo docs/FRONTEND.md §12 và §14.2, so với ảnh tham chiếu trong docs/reference/design/, chụp 390px và 1440px, sửa từng điểm lệch" |
| Sửa lỗi nhỏ (< 30 dòng) | Mô tả lỗi trực tiếp, không cần Spec Kit; nhắc "chạy npm run check trước khi commit" |
| Cập nhật trạng thái | Sau mỗi spec merge xong, đổi ⬜ thành ✅ ở §3 |