# SPECKIT_ROADMAP.md — Cài Spec Kit & lộ trình làm từng feature

> **Vị trí trong repo:** `docs/SPECKIT_ROADMAP.md`
> Dành cho Mạnh (người điều khiển) và Claude Code (người làm). Thiết kế hệ thống: `docs/ARCHITECTURE.md`. Luật bất biến: `.specify/memory/constitution.md`.

---

## Phần 1 — Cài Spec Kit (làm một lần)

### 1.1 Cài `uv` (trình cài công cụ Python)

Windows (PowerShell):
```powershell
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
```
macOS / Linux:
```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```
Đóng terminal, mở lại, kiểm tra: `uv --version`. Cần thêm **Python 3.11+** và **Git**.

### 1.2 Cài Specify CLI (chỉ lấy từ repo chính thức `github/spec-kit`)

```bash
uv tool install specify-cli --from git+https://github.com/github/spec-kit.git
specify version
```
Nâng cấp sau này: thêm `--force` vào lệnh cài.

### 1.3 Gắn Spec Kit vào repo hiện có

```bash
cd duong-dan/toi/repo-cua-ban
git checkout -b chore/speckit-setup        # làm trên nhánh riêng cho an toàn
git add -A && git commit -m "chore: snapshot truoc khi cai Spec Kit"
specify init --here --integration claude   # Windows thêm: --script ps
```
- Nếu CLI báo không nhận `--integration` (bản cũ) thì dùng `--ai claude`.
- Nếu hỏi "thư mục không trống, tiếp tục?" → chọn **yes**. Spec Kit chỉ thêm `.specify/` và `.claude/`, không xóa code.
- Kiểm tra: mở Claude Code trong repo, gõ `/speckit` → phải thấy danh sách lệnh. Tùy phiên bản, lệnh có dạng `/speckit-specify` (skill) hoặc `/speckit.specify` (command) — hai dạng làm cùng việc. Tài liệu này viết dạng gạch nối.

### 1.4 Đặt các file tài liệu vào đúng chỗ

| File bạn nhận | Đặt vào |
|---|---|
| `ARCHITECTURE.md` | `docs/ARCHITECTURE.md` |
| `FRONTEND.md` | `docs/FRONTEND.md` |
| `SPECKIT_ROADMAP.md` (file này) | `docs/SPECKIT_ROADMAP.md` |
| `constitution.md` | `docs/reference/constitution-draft.md` (dùng ở bước 2.2) |
| `CLAUDE.md` | gốc repo (thay file cũ) |
| `Ke_hoach_Website.md`, `Bao_cao_kiem_tra_du_lieu_N5.md` | `docs/reference/` |

---

## Phần 2 — Ba bước đầu (dọn dẹp dự án đang lộn xộn)

### 2.1 Kiểm kê hiện trạng (prompt thường, chưa dùng Spec Kit)

Dán vào Claude Code:
> Đọc `docs/ARCHITECTURE.md` (§8 cấu trúc thư mục, §9 bản đồ feature) và `docs/reference/Ke_hoach_Website.md` §10. Quét toàn bộ repo hiện tại, **chưa sửa gì**. Viết `docs/reference/audit-hien-trang.md` gồm: (1) cây thư mục hiện tại; (2) bảng mỗi file/thư mục → vị trí mới theo §8.1 hoặc "xóa vì trùng/rác" kèm lý do; (3) mỗi spec 002–014 đã làm được bao nhiêu % và còn thiếu gì; (4) thư viện đang cài so với stack trong constitution. Sau đó dừng lại chờ tôi đọc.

### 2.2 Tạo constitution

```
/speckit-constitution Dùng nội dung trong docs/reference/constitution-draft.md làm constitution của dự án. Giữ nguyên 7 nguyên tắc, các mục Additional Constraints, Development Workflow, Governance và version 1.0.0.
```
Kiểm tra `.specify/memory/constitution.md` có đủ 7 nguyên tắc.

### 2.3 Feature 001 — dọn cấu trúc repo

```
/speckit-specify Sắp xếp lại cấu trúc repo cho gọn và nhất quán để người mới (tôi) và Claude Code luôn biết mỗi loại file nằm ở đâu. Website hiện đang chạy trên Vercel phải hoạt động y như cũ sau khi sắp xếp: mọi trang mở được, không mất nội dung, không đổi giao diện. Không còn file .md lẻ ở gốc repo (trừ CLAUDE.md, README.md), không còn thư mục hay file bản sao/backup. Dựa trên bảng phân loại trong docs/reference/audit-hien-trang.md.
```
```
/speckit-plan Theo đúng cây thư mục docs/ARCHITECTURE.md §8.1 và luật phụ thuộc §4.2. Chỉ di chuyển/đổi tên file và sửa đường dẫn import, không viết lại logic. Thêm alias @/ → src/, thêm luật ESLint no-restricted-imports theo §4.2, thêm public/content vào .gitignore. Kiểm chứng bằng: npm run build thành công, npm run check xanh, e2e mở trang chủ và một trang bài học.
```
Rồi: `/speckit-tasks` → `/speckit-analyze` → `/speckit-implement`.

---

## Phần 3 — Lộ trình feature 002 → 014

Cách dùng mỗi mục: chạy lần lượt các lệnh, **đọc kết quả rồi mới sang lệnh tiếp**. Câu sau `/speckit-specify` nói CÁI GÌ (không nhắc công nghệ); câu sau `/speckit-plan` nói LÀM THẾ NÀO. Nếu audit (bước 2.1) cho thấy feature đã xong một phần, thêm vào cuối prompt specify: *"Phần đã có: … (theo audit). Spec này chỉ bổ sung phần còn thiếu."*

Ký hiệu trạng thái: ⬜ chưa làm · 🟨 đang làm · ✅ xong

### ⬜ 002 content-pipeline
```
/speckit-specify Biến ba file nội dung N5 (từ vựng, ngữ pháp Minna no Nihongo 1 và Kanji Master N5) thành dữ liệu website đọc được. Khi file soạn sai định dạng, tôi phải nhận được thông báo chỉ rõ file và số dòng, và website không được cập nhật bằng dữ liệu lỗi. Mỗi từ cần biết từ loại, nhóm động từ, các đáp án chấp nhận, chữ Kanji liên quan; mỗi Kanji biết các từ vựng có chứa nó. Số lượng phải khớp: 1.020 từ chính + 272 từ mở rộng, 132 mẫu ngữ pháp, 119 Kanji + 15 Kanji phụ lục. Động từ N5 phải chia đúng thể て, た, ない, từ điển.
```
```
/speckit-plan Làm theo docs/reference/Ke_hoach_Website.md §5, §6.1–6.3 và docs/ARCHITECTURE.md §5.1. Script Node/TS trong scripts/content, đọc bảng bằng unified + remark-parse + remark-gfm (không regex cho bảng), schema Zod dùng chung ở src/domain/schemas.ts, engine chia động từ thuần TS ở src/domain/conjugation. Viết test trước, dùng chính các file trong content/n5 làm dữ liệu test.
```

### ⬜ 003 app-shell
```
/speckit-specify Khung ứng dụng: người học mở website trên điện thoại thấy ngay danh sách cấp độ → giáo trình → bài, đi lại giữa các trang bằng thanh điều hướng dưới (điện thoại) hoặc cột bên (máy tính). Danh sách phải tự sinh từ khai báo nội dung, thêm cấp độ mới thì menu tự có. Mở thẳng một đường dẫn bài học không bị lỗi. Có chế độ sáng/tối, trang 404 thân thiện, trang giới thiệu nguồn giáo trình. Giao diện mang bản sắc "tuyến tàu học tập" màu xanh dương, trẻ trung, không giống sách giáo khoa.
```
```
/speckit-plan Theo docs/FRONTEND.md toàn bộ (đặc biệt §3 cấu trúc, §5 tokens, §6 layout, §8 component signature) và docs/ARCHITECTURE.md §4, §7. Tạo src/ui/tokens.css bằng Tailwind v4 @theme, các primitive trong src/ui/primitives, StationBadge + LessonLine trong src/ui/signature. React Router, content-loader tải lười, vercel.json rewrite SPA, GitHub Actions chạy npm run check + e2e viewport 360px. Thêm trường line: { code, color } cho mỗi book trong manifest (FRONTEND §5.1) và script npm run ui:shot (FRONTEND §13.1).
```

### ⬜ 004 content-browsing
```
/speckit-specify Người học đọc được toàn bộ nội dung một bài: từ vựng (lọc từ chính/mở rộng, ẩn nghĩa để tự kiểm tra, nghe phát âm), ngữ pháp (mở từng mẫu, ẩn/hiện romaji và bản dịch), Kanji liên quan; xem chi tiết từng chữ Kanji kèm các từ vựng có chứa chữ đó; tìm kiếm theo kana, kanji, romaji hoặc nghĩa tiếng Việt kể cả khi gõ không dấu.
```
```
/speckit-plan Theo KH §3.4, §7 và docs/FRONTEND.md §7 (recipe Lesson, Kanji). Component JpText, Ruby, SpeakButton trong src/ui/jp; TTS qua src/platform (bản web dùng speechSynthesis ja-JP). Tìm kiếm MiniSearch có bỏ dấu tiếng Việt.
```

### ⬜ 005 local-progress
```
/speckit-specify Website ghi nhớ mọi câu trả lời và độ thành thạo của người học ngay trên máy, không cần tài khoản, kể cả khi tải lại trang hoặc mất mạng. Người học có thể xuất tiến độ ra file, nhập lại trên máy khác, và xóa toàn bộ tiến độ (có hỏi xác nhận).
```
```
/speckit-plan Theo KH §6.5, §6.7 và constitution nguyên tắc II. Interface ProgressRepository, cài đặt Dexie duy nhất ở src/data/progress/dexie-repo.ts, mọi ghi đều thêm outbox, ID attempt là uuid. Công thức mastery thuần ở src/domain/mastery có test. Test bằng fake-indexeddb.
```

### ⬜ 006 quiz-engine-flashcard
```
/speckit-specify Người học chọn phạm vi (một bài, nhiều bài), số câu và học bằng Flashcard: lật thẻ, chọn mặt trước (kana/kanji/nghĩa), tự đánh giá Quên/Khó/Nhớ/Dễ, nghe phát âm, dùng phím tắt trên máy tính. Kết quả được lưu để tính độ thành thạo. Sau này thêm dạng bài mới phải tự xuất hiện trong màn chọn mà không sửa phần chạy phiên.
```
```
/speckit-plan Theo KH §6.4 và docs/FRONTEND.md §7 (recipe Practice setup, Practice run). questionRegistry + session (RNG có seed) + distractors trong src/domain/quiz, store phiên bằng Zustand, mode flashcard trong src/features/practice/modes/flashcard. Viết test session và distractors trước.
```

### ⬜ 007 mcq-and-results
```
/speckit-specify Trắc nghiệm 4 đáp án với 6 hướng hỏi (Nhật→Nghĩa, Nghĩa→Nhật, Kanji→Cách đọc, Kana→Kanji, Nghe→Nghĩa, Nghĩa→Kanji), chọn một hướng hoặc trộn. Đáp án nhiễu hợp lý, không bao giờ có hai đáp án cùng nghĩa. Sau phiên có màn kết quả: điểm, thời gian, danh sách câu sai kèm đáp án đúng, nút làm lại câu sai; câu sai tự vào sổ lỗi sai.
```
```
/speckit-plan Mỗi hướng là một QuestionType riêng dùng chung component ChoiceGrid (docs/FRONTEND.md §8). Màn Result theo recipe §7. E2E: Bài 5, 10 câu, sai 2 → kết quả 8/10, làm lại đúng 2 câu.
```

### ⬜ 008 vocab-modes
```
/speckit-specify Thêm các dạng kiểm tra từ vựng: gõ đáp án (gõ romaji tự đổi sang hiragana), nghe và chọn, nghe rồi viết lại, ghép cặp có tính giờ, đúng/sai tốc độ 60 giây, điền từ vào câu ví dụ. Chấp nhận mọi cách viết đúng của một từ. Dạng nghe tự ẩn trên thiết bị không có giọng tiếng Nhật.
```
```
/speckit-plan Mỗi dạng một thư mục trong modes/, chấm theo KH §6.4. KanaInput dùng WanaKana (src/ui/jp). Kiểm tra giọng qua platform.tts.isAvailable().
```

### ⬜ 009 grammar-kanji-quiz
```
/speckit-specify Luyện ngữ pháp và Kanji theo bài: chọn trợ từ đúng trong câu, sắp xếp các cụm thành câu (kéo thả, dùng được trên cảm ứng), hiểu nghĩa câu, chọn mẫu ngữ pháp đúng, chia động từ; với Kanji: chọn cách đọc (On/Kun), chọn nghĩa Hán Việt, chọn Kanji đúng cho từ vựng.
```
```
/speckit-plan Theo KH §3.3 (dạng 9–16). Dùng chunks từ pipeline và engine conjugation. Kéo thả dùng @dnd-kit (ghi lý do trong research.md) có hỗ trợ bàn phím.
```

### ⬜ 010 weakness-mistakes — ✅ hoàn thành MVP
```
/speckit-specify Người học biết mình đang yếu ở đâu: trang điểm yếu (từ yếu nhất, bài yếu nhất, kỹ năng yếu nhất) với nút luyện ngay 20 câu yếu nhất; sổ lỗi sai lọc theo bài/dạng, từ tự rời sổ khi đúng 3 lần liên tiếp; bài kiểm tra tổng hợp của một bài (trộn nhiều dạng, xếp loại A/B/C); trên trang giáo trình mỗi bài hiện màu theo độ thành thạo.
```
```
/speckit-plan Theo KH §3.5, §6.5 và docs/FRONTEND.md §8 (LessonLine ở chế độ mastery map, recipe Weak). Session phạm vi "weak".
```

### ⬜ 011 accounts-sync
```
/speckit-specify Tài khoản đơn giản (email + mật khẩu, tùy chọn Google) để học trên điện thoại rồi mở máy tính thấy cùng tiến độ. Không đăng nhập vẫn dùng đầy đủ. Lần đầu đăng nhập trên máy đã có tiến độ thì hỏi có gộp không. Mất mạng vẫn học, có mạng lại tự đồng bộ. Có trang tài khoản: đổi tên, đổi mật khẩu, trạng thái đồng bộ, xuất dữ liệu, xóa tài khoản. Người này không bao giờ xem được dữ liệu của người khác.
```
```
/speckit-plan Theo KH §3.7, §6.8 và docs/ARCHITECTURE.md §5.3. Supabase Auth + migrations SQL + RLS, sync-service đẩy outbox theo lô và pull theo updated_at. Liệt kê các bước tôi phải tự bấm trên trang Supabase.
```

### ⬜ 012 srs-review
```
/speckit-specify Trang "Ôn tập hôm nay": hiện các thẻ đến hạn ôn và tối đa 10 thẻ mới mỗi ngày (chỉnh được); từ sắp quên được ôn trước; có chuỗi ngày học liên tiếp. Kết quả các dạng bài khác cũng ảnh hưởng lịch ôn.
```
```
/speckit-plan Theo KH §6.6, bọc ts-fsrs trong src/domain/srs, test với đồng hồ giả, đồng bộ qua bảng srs_cards.
```

### ⬜ 013 stats-pwa-release — ✅ phát hành 1.0
```
/speckit-specify Hoàn thiện bản 1.0: trang thống kê (số câu mỗi ngày, độ chính xác theo kỹ năng, tiến độ theo bài), trang chủ đầy đủ, cài được lên màn hình chính điện thoại và dùng offline, điều khiển được bằng bàn phím và trình đọc màn hình, rà soát và viết lại câu ví dụ chép nguyên văn từ sách.
```
```
/speckit-plan vite-plugin-pwa cache public/content, tách code theo trang, Lighthouse mobile ≥ 90, biểu đồ theo docs/FRONTEND.md §8.
```

### ⬜ 014 native-app
```
/speckit-specify Có app Android (và iOS khi có máy Mac) cài từ file/cửa hàng, dùng cùng nội dung và tài khoản với website. Phát âm tiếng Nhật chạy được trong app, có rung nhẹ khi trả lời, nút quay lại của Android hoạt động đúng, giao diện không bị tai thỏ/thanh trạng thái che, đăng nhập trong app quay về đúng app.
```
```
/speckit-plan Capacitor bọc dist/ (docs/ARCHITECTURE.md ADR-003, §7). Bản native trong src/platform/native: @capacitor-community/text-to-speech, @capacitor/haptics, @capacitor/app (nút back, deep link), @capacitor/status-bar. Safe-area theo docs/FRONTEND.md §6.4. Liệt kê các bước tôi cần làm trong Android Studio.
```

### Sau 014 (chưa xếp số)
Furigana tự động cho câu ví dụ · thứ tự nét Kanji (KanjiVG, ghi nguồn CC BY-SA) · thi thử JLPT N5 · tên miền riêng · thêm N4 (chỉ thêm nội dung — bài kiểm tra cho kiến trúc).

---

## Phần 4 — Câu lệnh nhanh khi kẹt

| Tình huống | Gõ vào Claude Code |
|---|---|
| Không biết đang ở bước nào | "Đọc specs/ và cho tôi biết feature nào đang dở, bước Spec Kit tiếp theo là gì" |
| Spec có chỗ mơ hồ | `/speckit-clarify` |
| Sợ plan/tasks lệch spec | `/speckit-analyze` |
| Giao diện trông "giống AI làm" | "Soát màn hình X theo docs/FRONTEND.md §12 (danh sách không làm) và §13, chụp ảnh 360px và 1280px, sửa từng điểm vi phạm" |
| Sửa lỗi nhỏ | Mô tả lỗi trực tiếp, không cần Spec Kit; nhắc "chạy npm run check trước khi commit" |
