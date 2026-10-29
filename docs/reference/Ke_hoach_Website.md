# 🗾 KẾ HOẠCH XÂY DỰNG WEBSITE TỰ HỌC & KIỂM TRA TIẾNG NHẬT

> **Tên website:** **Tự học tiếng Nhật cùng Mạnh** — website tự học và kiểm tra kiến thức, giúp người học phát hiện phần mình đang yếu.  
> **Tên repo / link:** `tu-hoc-tieng-nhat-cung-manh` → `https://tu-hoc-tieng-nhat-cung-manh.vercel.app` (Vercel không cho dấu tiếng Việt và khoảng trắng; nếu tên đã có người dùng thì rút gọn, VD: `hoctiengnhat-manh`).  
> **Phiên bản kế hoạch:** v1.2 (21/10/2026) — đã cập nhật theo toàn bộ quyết định của bạn (xem mục 0).  
> **Nội dung ban đầu:** N5 = Minna no Nihongo 1 (Bài 1-25: từ vựng + ngữ pháp) + Kanji Master N5 (15 chương, 119 chữ + 15 chữ phụ lục).  
> **Mở rộng tương lai:** N4 (Minna no Nihongo 2, Kanji Master N4), N3, N2... **chỉ bằng cách thêm file Markdown**, không phải sửa code.

---

## MỤC LỤC

0. Các quyết định đã chốt
1. Tóm tắt nhanh
2. Mục tiêu & phạm vi
3. Tính năng chi tiết
4. Kiến trúc hệ thống (thiết kế để tự bảo trì & mở rộng)
5. Quy ước dữ liệu (Content Contract)
6. Mô hình dữ liệu & thuật toán
7. Giao diện & trải nghiệm
8. Kiểm thử, triển khai, vận hành
9. Quy trình thêm cấp độ mới (N4, N3, N2) & chuyển nội dung sang bản mới
10. **Trình tự lập trình cho Claude Code (15 phase)**
11. Rủi ro & cách giảm thiểu
12. Các điểm còn lại cần bạn quyết định & việc bạn cần tự làm
- Phụ lục A: File `CLAUDE.md` mẫu cho repo
- Phụ lục B: Template Markdown cho bài mới
- Phụ lục C: Ví dụ dữ liệu JSON sau khi build

---

## 0. CÁC QUYẾT ĐỊNH ĐÃ CHỐT

| # | Câu hỏi | Quyết định của bạn | Ảnh hưởng tới thiết kế |
|---|---|---|---|
| 1 | Phiên bản giáo trình | **Minna no Nihongo bản mới (第2版)** | Học theo bản mới, **nhưng giữ và hiện cả các từ ngoài bản mới** để học thêm (quyết định ngày 21/10). Cờ `Bản cũ` chỉ là nhãn thông tin, người dùng có thể tự lọc nếu muốn. Đối chiếu bản mới (mục 9.2) chỉ để xếp từ về đúng bài |
| 2 | Đăng nhập / đăng ký | **Đơn giản, không phức tạp** | Không bắt buộc đăng nhập: vào là học được ngay (chế độ khách, lưu trên máy). Đăng ký chỉ cần **email + mật khẩu** (tùy chọn nút "Đăng nhập bằng Google"), dùng **Supabase Auth** — không tự viết hệ thống mật khẩu. Đăng nhập để **đồng bộ tiến độ** giữa điện thoại và máy tính (Phase 11) |
| 3 | Triển khai | **Công khai trên Internet** | Deploy lên **Vercel** (miễn phí) ngay từ **Phase 3**, có địa chỉ cố định dạng `https://<tên>.vercel.app`. Mỗi lần code/nội dung mới được đẩy lên GitHub, website tự cập nhật — **không cần mở VS Code để chạy web** |
| 4 | Tên & màu | **"Tự học tiếng Nhật cùng Mạnh"**, màu chủ đạo **xanh dương** | Bảng màu ở mục 7.3; tên dùng cho tiêu đề trang, logo chữ, thẻ chia sẻ, file PWA |
| 5 | Âm thanh | **Giọng đọc máy** (Web Speech API) | Không cần chuẩn bị file audio; dạng Nghe tự ẩn trên thiết bị không có giọng tiếng Nhật |
| 6 | Đăng nhập Google | **Làm nếu đơn giản** | Đánh giá: phía code rất đơn giản (Supabase có sẵn, chỉ ~1 nút), phía thiết lập mất ~15 phút trên Google Cloud. → Phase 11 làm **email + mật khẩu trước**; nút Google viết sẵn nhưng **chỉ hiện khi bạn bật** (Phase 11, bước tùy chọn). Không bật thì website vẫn đầy đủ |
| 7 | Thứ tự dạng bài | **Để tôi sắp xếp** | Giữ thứ tự Phase 6 → 9 (lý do ở mục 10.3) |
| 8 | Chuẩn hóa bản mới | **Tôi gửi danh sách trước để bạn kiểm tra** | File `Danh_sach_doi_chieu_ban_moi.md`: phần A các từ nghi khác biệt cần kiểm tra trước, phần B toàn bộ từ theo bài (mục 9.2) |

---

## 1. TÓM TẮT NHANH

| Hạng mục | Đề xuất |
|---|---|
| Kiểu ứng dụng | Web app 1 trang (SPA), dùng được trên điện thoại và máy tính, cài như app (PWA), **chạy offline** |
| Công nghệ | Vite + React + TypeScript + Tailwind CSS · Zustand (state) · Dexie (IndexedDB lưu tiến độ) · ts-fsrs (lặp lại ngắt quãng) · WanaKana (gõ romaji → kana) · Zod (kiểm tra dữ liệu) |
| Nguồn nội dung | File `.md` do bạn soạn (đúng định dạng 3 file hiện tại) → script build chuyển thành JSON. Giáo trình chuẩn: **Minna no Nihongo bản mới** |
| Lưu tiến độ | **Chưa đăng nhập:** lưu trên trình duyệt (IndexedDB). **Đã đăng nhập:** đồng bộ lên Supabase (Postgres), học trên máy nào cũng tiếp tục được. Vẫn có xuất/nhập file sao lưu |
| Tài khoản | Đơn giản: email + mật khẩu (tùy chọn Google), quên mật khẩu qua email. Không đăng nhập vẫn dùng được đầy đủ |
| Truy cập | Website công khai trên **Vercel** (`https://<tên>.vercel.app`, có thể gắn tên miền riêng sau) |
| Chi phí | 0đ: Vercel gói Hobby + Supabase gói Free + GitHub (đủ cho một người/nhóm nhỏ dùng) |
| Điểm khác biệt | Theo dõi **độ thành thạo theo từng kỹ năng** (nghĩa, cách đọc, nhớ lại, nghe, viết) cho **từng từ**, tự tạo bài "Ôn điểm yếu" |
| Khả năng mở rộng | Thêm cấp độ = thêm thư mục + file md + 1 dòng khai báo trong `manifest.yaml`. Thêm dạng bài tập = thêm 1 module vào "registry" |

---

## 2. MỤC TIÊU & PHẠM VI

### 2.1 Mục tiêu
1. Học và kiểm tra **theo từng bài** (Bài 1, Bài 2... / Chương 1, 2...) hoặc **gộp nhiều bài**.
2. Nhiều dạng kiểm tra để kiểm tra một từ từ nhiều góc (nhận biết nghĩa, nhớ lại, đọc Kanji, nghe, gõ).
3. **Phát hiện điểm yếu**: website ghi lại từng câu trả lời, tính độ thành thạo, chỉ ra bài nào / từ nào / kỹ năng nào đang yếu và tạo bài ôn riêng.
4. **Tự bảo trì, dễ mở rộng**: nội dung tách khỏi code; thêm N4, N3, N2 không cần sửa logic.

### 2.2 Phạm vi

| Giai đoạn | Nội dung |
|---|---|
| **MVP (Phase 0-10)** | N5 đầy đủ (bản mới): duyệt bài, Flashcard, Trắc nghiệm 6 hướng, Gõ đáp án, Nghe, Ghép cặp, quiz ngữ pháp & Kanji, bài kiểm tra tổng hợp, theo dõi điểm yếu, sổ lỗi sai. **Website đã chạy công khai trên Vercel từ Phase 3** |
| **Bản 1.0 (Phase 11-13)** | **Tài khoản đơn giản + đồng bộ tiến độ**, Ôn tập hằng ngày (SRS), thống kê, PWA offline, hoàn thiện |
| **Sau 1.0 (Phase 14)** | Furigana tự động cho câu ví dụ, thứ tự nét Kanji, thi thử dạng JLPT, tên miền riêng, thêm N4 → N2 |

### 2.3 Ngoài phạm vi (giai đoạn đầu)
- Không làm trang quản trị soạn nội dung trên web (soạn bằng file md là đủ và an toàn hơn).
- Không làm mạng xã hội, xếp hạng giữa nhiều người.

---

## 3. TÍNH NĂNG CHI TIẾT

### 3.1 Cấu trúc học

```
Cấp độ (N5) ─┬─ Giáo trình "Minna no Nihongo 1" ─── Bài 1..25 ─┬─ Từ vựng (chính / mở rộng)
             │                                                └─ Ngữ pháp
             └─ Giáo trình "Kanji Master N5" ────── Chương 1..15 (+ Phụ lục) ── Kanji
```

Mỗi bài có trang **"Bài học"** gồm 3 tab: *Từ vựng* · *Ngữ pháp* · *Kanji liên quan* và thanh **"Độ thành thạo bài này: 72%"**.

### 3.2 Các dạng kiểm tra TỪ VỰNG (theo yêu cầu: từng bài một)

| # | Dạng | Mô tả | Kỹ năng ghi nhận |
|---|---|---|---|
| 1 | **Flashcard** | Lật thẻ. Chọn mặt trước: Kana / Kanji / Nghĩa. Tự đánh giá: *Quên · Khó · Nhớ · Dễ* (dữ liệu cho SRS). Phím tắt: Space lật, 1-4 đánh giá. Có nút 🔊 phát âm | `recognition` |
| 2 | **Trắc nghiệm 4 đáp án** | 6 hướng hỏi, chọn được 1 hướng hoặc trộn: ① Nhật → Nghĩa ② Nghĩa → Nhật ③ Kanji → Cách đọc ④ Kana → Kanji ⑤ Nghe → Nghĩa ⑥ Nghĩa → Kanji. Đáp án nhiễu "thông minh" (cùng bài, cùng từ loại, độ dài gần nhau) | `meaning`, `recall`, `reading`, `listening` |
| 3 | **Gõ đáp án** | Hiện nghĩa tiếng Việt → gõ tiếng Nhật. Gõ romaji tự đổi sang hiragana (WanaKana). Chấp nhận nhiều đáp án (`A / B`), bỏ qua phần trong `[ ]`, cho phép sai dấu nhỏ (ー, khoảng trắng) | `writing` |
| 4 | **Nghe & chọn** | Phát âm bằng giọng đọc tiếng Nhật của trình duyệt → chọn nghĩa hoặc chọn từ đúng | `listening` |
| 5 | **Chính tả nghe** | Nghe → gõ lại bằng kana | `listening` + `writing` |
| 6 | **Ghép cặp** | 6 cặp Nhật ↔ Việt, bấm ghép, tính giờ; sai thì cặp rung đỏ | `meaning` |
| 7 | **Đúng / Sai tốc độ** | 60 giây, mỗi câu hiện "từ = nghĩa?", bấm ✓ / ✗ | `meaning` |
| 8 | **Điền từ vào câu** | Lấy câu ví dụ trong file ngữ pháp có chứa từ đó, che từ đi, chọn từ đúng | `usage` |

**Tùy chọn chung cho mọi dạng:** chọn bài (1 bài / khoảng bài / tự chọn), số câu (10/20/50/tất cả), *chỉ từ chính* hoặc *gồm từ mở rộng*, lọc phiên bản (mặc định *hiện tất cả*), *chỉ từ chưa thuộc*, bật/tắt romaji, trộn thứ tự.

**Sau mỗi phiên:** màn hình kết quả (điểm, thời gian, danh sách câu sai kèm đáp án đúng), nút **"Làm lại câu sai"**, nút **"Thêm vào sổ lỗi sai"** (tự động).

### 3.3 Các dạng kiểm tra đề xuất thêm

| # | Dạng | Dữ liệu dùng | Ghi chú kỹ thuật |
|---|---|---|---|
| 9 | **Chia động từ** | Động từ trong file từ vựng | Hỏi: 書きます → thể て / ない / た / từ điển. Engine chia động từ tự viết + bảng ngoại lệ |
| 10 | **Chọn trợ từ** | Câu ví dụ ngữ pháp | Câu MNN có khoảng trắng giữa các cụm → tách cụm, che trợ từ cuối cụm (は が を に へ で と も や から まで), cho chọn |
| 11 | **Sắp xếp câu** | Câu ví dụ ngữ pháp | Xáo trộn các cụm, kéo-thả về đúng thứ tự, kèm nghĩa tiếng Việt làm gợi ý |
| 12 | **Chọn mẫu ngữ pháp** | Ví dụ ngữ pháp | Che phần mẫu câu trong ví dụ (VD: ～ても いいですか), chọn đúng mẫu |
| 13 | **Hiểu nghĩa câu** | Ví dụ ngữ pháp | Hiện câu tiếng Nhật → chọn bản dịch đúng trong 4 bản |
| 14 | **Kanji: cách đọc** | Kanji Master | Hiện từ ví dụ (VD: 外国) → chọn cách đọc; tách riêng câu hỏi âm On / âm Kun |
| 15 | **Kanji: nghĩa Hán Việt** | Kanji Master | 外 → NGOẠI / NỘI / TRUNG / HẠ |
| 16 | **Kanji trong từ vựng** | Liên kết vocab ↔ kanji | Từ vựng MNN có chứa Kanji đã học → chọn Kanji đúng để viết từ (VD: がいこく → 外国 / 内国...) |
| 17 | **Bài kiểm tra tổng hợp của bài** | Tất cả | Trộn 20-30 câu từ nhiều dạng trên cho 1 bài, có điểm và xếp loại A/B/C |
| 18 | **Thi thử kiểu JLPT N5** *(sau 1.0)* | Tất cả | Theo dạng đề: Đọc Kanji (漢字読み), Viết Kanji (表記), Chọn từ theo ngữ cảnh (文脈規定), Câu đồng nghĩa (言い換え), Trợ từ (文法形式) |
| 19 | **Ôn điểm yếu** | Lịch sử làm bài | Tự tạo phiên từ những từ/kỹ năng có độ thành thạo thấp nhất |
| 20 | **Ôn tập hằng ngày (SRS)** | Lịch sử Flashcard | Thuật toán FSRS xếp lịch: từ sắp quên sẽ được ôn trước |

### 3.4 Ngữ pháp & Kanji (chế độ đọc)
- **Ngữ pháp:** mỗi bài hiển thị danh sách mẫu câu dạng thẻ có thể mở rộng: Ý nghĩa → Giải thích → Ví dụ (nút 🔊 cho câu tiếng Nhật, nút ẩn/hiện romaji và bản dịch để tự kiểm tra).
- **Kanji:** thẻ Kanji lớn, số nét, âm On/Kun, nghĩa Hán Việt, ví dụ theo nhóm, danh sách **"Từ vựng MNN có chứa chữ này"** (tự liên kết). Sau 1.0: hoạt ảnh thứ tự nét (dữ liệu KanjiVG).

### 3.5 Phát hiện điểm yếu (mục tiêu chính của dự án)
- Mỗi lần trả lời được lưu: *từ nào, kỹ năng nào, đúng/sai, thời gian trả lời*.
- **Độ thành thạo** được tính riêng cho từng cặp *(từ, kỹ năng)* → biết được "bạn hiểu nghĩa từ 外国 nhưng hay đọc sai".
- Trang **"Điểm yếu của tôi"**: Top từ yếu nhất · Bài có độ thành thạo thấp nhất · Kỹ năng yếu nhất (VD: "Cách đọc Kanji: 54%") · Nút "Luyện ngay 20 câu yếu nhất".
- **Sổ lỗi sai**: mọi câu trả lời sai được lưu, có thể lọc theo bài/dạng, ôn lại; từ được gỡ khỏi sổ khi trả lời đúng 3 lần liên tiếp.
- **Bản đồ nhiệt theo bài**: lưới Bài 1-25, màu từ đỏ (yếu) → xanh (thuộc).

### 3.6 Cài đặt người dùng
Hiện/ẩn romaji · Hiện/ẩn furigana · Lọc phiên bản giáo trình (**mặc định: hiện tất cả**, từ ngoài bản mới có nhãn nhỏ) · Gồm từ mở rộng · Tốc độ giọng đọc · Chế độ sáng/tối · Số câu mặc định · Xuất/nhập file sao lưu tiến độ · Xóa tiến độ.

### 3.7 Tài khoản (đơn giản)
- **Không bắt buộc:** người mới vào là học được ngay ở *chế độ khách*; tiến độ lưu trên máy đang dùng.
- **Đăng ký:** email + mật khẩu (≥ 8 ký tự) + tên hiển thị. Tùy chọn thêm nút **"Tiếp tục với Google"** (bật trong Supabase, không cần viết thêm code đăng nhập).
- **Đăng nhập / Đăng xuất / Quên mật khẩu** (gửi link đặt lại qua email). Không có vai trò quản trị, không có hồ sơ phức tạp.
- **Gộp tiến độ:** lần đầu đăng nhập trên một máy đã có tiến độ khách → hỏi *"Đưa tiến độ trên máy này vào tài khoản?"*.
- **Đồng bộ:** học offline vẫn được; khi có mạng, lượt trả lời mới tự đẩy lên tài khoản; mở trên máy khác sẽ tải về.
- **Trang Tài khoản:** đổi tên hiển thị, đổi mật khẩu, xuất dữ liệu, **xóa tài khoản và toàn bộ dữ liệu**.
- Mật khẩu do Supabase quản lý (mã hóa, giới hạn số lần thử); website không bao giờ lưu mật khẩu.

---

## 4. KIẾN TRÚC HỆ THỐNG

### 4.1 Sáu nguyên tắc thiết kế để "tự bảo trì & phát triển"

1. **Nội dung là dữ liệu (content-as-data):** toàn bộ từ vựng, ngữ pháp, Kanji nằm trong file `.md`. Code không chứa một từ tiếng Nhật nào của giáo trình.
2. **Khai báo bằng manifest:** cấp độ, giáo trình, bài học được khai báo trong `content/manifest.yaml`. Giao diện tự sinh menu từ manifest → thêm N4 không sửa giao diện.
3. **Kiểm tra dữ liệu tự động trước khi build:** mọi lỗi định dạng (thiếu cột, trùng từ, Kanji không khớp...) bị báo ngay kèm *số dòng*, build sẽ dừng nếu có lỗi nghiêm trọng.
4. **Dạng bài tập là plugin:** mỗi dạng (Flashcard, Trắc nghiệm...) là một module độc lập đăng ký vào `questionRegistry`. Thêm dạng mới không đụng code cũ.
5. **Tiến độ tách khỏi nội dung:** tiến độ lưu theo **ID ổn định** của từng mục, nên sửa nghĩa/ghi chú trong md không làm mất tiến độ.
6. **Lưu trên máy trước, đồng bộ sau (local-first + Repository pattern):** giao diện chỉ gọi `progressRepo`; dữ liệu luôn ghi vào IndexedDB trước (nhanh, chạy offline), lớp đồng bộ đẩy lên Supabase khi người dùng đã đăng nhập và có mạng.

### 4.2 Sơ đồ tổng quan

```mermaid
flowchart LR
  subgraph Soạn_nội_dung
    MD[content/**/*.md<br/>Từ vựng · Ngữ pháp · Kanji]
    MF[content/manifest.yaml]
    OV[content/overrides/*.yaml<br/>ngoại lệ từ loại, nhóm động từ]
  end
  subgraph Build_time [Build (Node script)]
    P[Parser<br/>remark + gfm] --> V[Validator<br/>Zod + luật nghiệp vụ]
    V --> E[Enricher<br/>từ loại · nhóm động từ · liên kết Kanji · đáp án]
    E --> J[(public/content/*.json)]
    V --> R[Báo cáo lỗi<br/>content-report.md]
  end
  subgraph Trình_duyệt [Ứng dụng web]
    L[Content Loader] --> UI[Giao diện React]
    UI --> Q[Quiz Engine<br/>question registry]
    Q --> S[Progress Service<br/>mastery · FSRS · weakness]
    S --> DB[(IndexedDB / Dexie)]
    DB <--> SY[Sync service<br/>outbox · pull khi đăng nhập]
    UI --> AU[Auth<br/>email + mật khẩu]
  end
  subgraph Đám_mây [Dịch vụ miễn phí]
    VC[Vercel<br/>hosting website công khai]
    SB[(Supabase<br/>Auth + Postgres + RLS)]
  end
  SY <--> SB
  AU <--> SB
  J -. deploy .-> VC
  MD --> P
  MF --> P
  OV --> E
  J --> L
```

### 4.3 Cấu trúc thư mục repo

```
tu-hoc-tieng-nhat-cung-manh/
├── CLAUDE.md                      # Hướng dẫn cho Claude Code (Phụ lục A)
├── content/                       # ⭐ NƠI DUY NHẤT BẠN CẦN SỬA KHI THÊM NỘI DUNG
│   ├── manifest.yaml              # Khai báo cấp độ, giáo trình, file nguồn
│   ├── n5/
│   │   ├── mnn1/
│   │   │   ├── vocab.md           # = MNN1_Tu_Vung.md
│   │   │   └── grammar.md         # = MNN1_Ngu_Phap.md
│   │   └── kanji-master-n5/
│   │       └── kanji.md           # = Kanji_Master_N5.md
│   ├── n4/ ...                    # (tương lai)
│   └── overrides/
│       ├── verb-groups.yaml       # Động từ nhóm II có đuôi i (見ます, 起きます...)
│       ├── pos.yaml               # Sửa từ loại khi đoán sai
│       └── id-aliases.yaml        # Giữ tiến độ khi đổi kana/kanji của một từ
├── scripts/content/               # Pipeline build nội dung
│   ├── parse-vocab.ts
│   ├── parse-grammar.ts
│   ├── parse-kanji.ts
│   ├── validate.ts
│   ├── enrich.ts
│   └── build.ts                   # npm run content:build
├── src/
│   ├── app/                       # Router, layout, providers
│   ├── domain/                    # Kiểu dữ liệu, logic thuần (không phụ thuộc React)
│   │   ├── types.ts
│   │   ├── conjugation/           # Engine chia động từ
│   │   ├── quiz/                  # Engine câu hỏi + registry + distractor
│   │   ├── srs/                   # Bọc ts-fsrs
│   │   └── mastery/               # Tính độ thành thạo, điểm yếu
│   ├── data/
│   │   ├── content-loader.ts      # Tải JSON nội dung (lazy theo bài)
│   │   ├── progress/              # Repository: dexie-repo.ts (lưu trên máy)
│   │   ├── sync/                  # sync-service.ts: outbox → Supabase, pull khi đăng nhập
│   │   └── supabase-client.ts     # Khởi tạo client từ biến môi trường
│   ├── features/                  # Mỗi tính năng 1 thư mục
│   │   ├── browse/                # Trang cấp độ, giáo trình, bài học
│   │   ├── practice/              # Trình chạy phiên luyện tập
│   │   │   └── modes/             # flashcard/, mcq/, typing/, listening/, matching/...
│   │   ├── review/                # SRS hằng ngày
│   │   ├── weakness/              # Điểm yếu + sổ lỗi sai
│   │   ├── stats/
│   │   ├── auth/                  # Đăng ký, đăng nhập, quên mật khẩu, trang tài khoản
│   │   └── settings/
│   ├── components/                # Nút, thẻ, ruby/furigana, thanh tiến độ...
│   └── lib/                       # tts.ts, kana.ts (WanaKana), rng.ts, normalize.ts
├── supabase/
│   └── migrations/                # SQL tạo bảng + chính sách bảo mật RLS (Phase 11)
├── vercel.json                    # Cấu hình SPA (mọi đường dẫn → index.html)
├── .env.example                   # VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
├── public/content/                # (sinh tự động) JSON — không sửa tay
├── tests/                         # Vitest (unit) + Playwright (e2e)
└── .github/workflows/ci.yml       # Kiểm tra nội dung + test + build + deploy
```

### 4.4 Công nghệ & lý do chọn

| Thành phần | Lựa chọn | Lý do |
|---|---|---|
| Build & dev server | **Vite** | Nhanh, cấu hình ít, xuất web tĩnh |
| UI | **React + TypeScript (strict)** | Hệ sinh thái lớn, Claude Code viết tốt, kiểu dữ liệu chặt giúp ít lỗi khi mở rộng |
| CSS | **Tailwind CSS** | Nhanh, đồng nhất, dễ làm dark mode & responsive |
| Điều hướng | **React Router** | Chuẩn phổ biến |
| State | **Zustand** | Nhẹ, đơn giản cho trạng thái phiên luyện tập |
| Lưu trữ | **Dexie (IndexedDB)** | Lưu nhiều dữ liệu (hàng chục nghìn lượt trả lời), truy vấn theo chỉ mục, chạy offline |
| Lặp lại ngắt quãng | **ts-fsrs** | Thuật toán FSRS hiện đại (dùng trong Anki), có sẵn thư viện TypeScript |
| Gõ tiếng Nhật | **WanaKana** | Chuyển romaji → kana khi gõ, nhận diện kana/kanji |
| Parse Markdown | **unified + remark-parse + remark-gfm** | Đọc bảng Markdown chắc chắn hơn regex |
| Kiểm tra dữ liệu | **Zod** | Schema dùng chung cho build script và app |
| Tìm kiếm | **MiniSearch** | Tìm từ theo kana/kanji/romaji/nghĩa, chạy trong trình duyệt |
| Giọng đọc | **Web Speech API** (`speechSynthesis`, `ja-JP`) | Miễn phí, offline trên đa số thiết bị; thiết kế để sau thay bằng file audio |
| Test | **Vitest** + **Testing Library** + **Playwright** | Unit test cho parser/engine, e2e cho luồng chính |
| PWA | **vite-plugin-pwa** | Cài lên màn hình điện thoại, chạy offline |
| Tài khoản & đồng bộ | **Supabase** (Auth + Postgres + Row Level Security) | Có gói miễn phí; đăng ký/đăng nhập/quên mật khẩu/Google có sẵn, không phải tự viết backend; RLS đảm bảo mỗi người chỉ đọc được dữ liệu của mình |
| Hosting | **Vercel** (gói Hobby) | Miễn phí, tự build & deploy mỗi lần đẩy code lên GitHub, có HTTPS, có bản xem trước cho từng thay đổi |

---

## 5. QUY ƯỚC DỮ LIỆU (CONTENT CONTRACT)

> Đây là "hợp đồng" giữa người soạn nội dung (bạn) và code. Chỉ cần file md tuân theo quy ước này thì website tự hiểu. 3 file N5 v2.0 đã được chuẩn hóa đúng quy ước.

### 5.1 `content/manifest.yaml`

```yaml
schemaVersion: 1
levels:
  - id: N5
    title: "JLPT N5 — Sơ cấp"
    order: 5
    books:
      - id: mnn1                      # chữ thường, không dấu, duy nhất toàn hệ thống
        title: "Minna no Nihongo 1"
        type: textbook                # textbook = có vocab + grammar
        lessonLabel: "Bài"
        lessonRange: [1, 25]
        sources:
          vocab: n5/mnn1/vocab.md
          grammar: n5/mnn1/grammar.md
        editions: [old, new]          # cho bộ lọc "Bản cũ / Bản mới"
        defaultEdition: new           # ✅ giáo trình chính là bản mới
        editionFilterDefault: all     # ✅ vẫn hiện cả từ "Bản cũ" để học thêm
      - id: kanji-master-n5
        title: "Kanji Master N5"
        type: kanji
        lessonLabel: "Chương"
        sources:
          kanji: n5/kanji-master-n5/kanji.md
  # - id: N4 ... (thêm sau, xem mục 9)
```

### 5.2 File từ vựng (`vocab.md`)

| Quy tắc | Chi tiết |
|---|---|
| Tiêu đề bài | `## 📖 BÀI <số> — <tên bài>` (emoji tùy ý, bắt buộc có `BÀI <số>`) |
| Nhóm từ | `### 1. Từ vựng chính` → `section = main` · `### 2. Từ vựng mở rộng ★ — <chủ đề>` → `section = extended` (chữ "mở rộng" là dấu hiệu) |
| Bảng | Đúng 5 cột: `Kana | Kanji | Romaji | Nghĩa | Ghi chú`. Hàng tiêu đề + hàng `---` bắt buộc |
| Không có Kanji | Ghi `-` |
| Nhiều cách nói | `A / B` → đáp án chấp nhận cả A và B; hiển thị đầy đủ |
| Phần tùy chọn | `[ ... ]` (VD: `すいます [たばこを～]`) → khi chấm phần gõ, bỏ qua phần trong ngoặc |
| Tính từ な | Viết `[な]` sau từ → tự nhận là tính từ な |
| Cột Ghi chú | Tự do. Từ khóa đặc biệt: `Bản cũ`, `Bản mới` → gắn cờ phiên bản |
| Trích dẫn `>` | Là ghi chú hiển thị, không phải dữ liệu |

### 5.3 File ngữ pháp (`grammar.md`)

```markdown
## 📘 BÀI <số> — <tên bài>
### <thứ tự>. <Mẫu câu>            ← có thể kèm "*(bổ sung)*"
**Ý nghĩa:** <một dòng>
**Giải thích & Cách dùng:**
- <gạch đầu dòng, có thể lồng "  + ...">
**Ví dụ minh họa:**
- **Tiếng Nhật:** <câu>
  - **Romaji:** `<romaji>`
  - **Dịch nghĩa:** <bản dịch>
```
- Câu tiếng Nhật **giữ khoảng trắng giữa các cụm** như giáo trình (`わたしは マイク・ミラーです。`) — dạng "Chọn trợ từ" và "Sắp xếp câu" dựa vào khoảng trắng này.
- Hội thoại 2 lượt dùng `…` để tách câu hỏi và câu trả lời.

### 5.4 File Kanji (`kanji.md`)
- Tiêu đề chương: `## 🌸 CHƯƠNG <số>: <tên> (<n> chữ)` · Phụ lục: tiêu đề chứa `PHỤ LỤC`.
- Bảng 5 cột: `| **字**<br>(n nét) | âm Kun | âm On | NGHĨA HÁN VIỆT (nghĩa) | Ví dụ |`.
- Âm Kun dùng hiragana, okurigana tách bằng `・` (た・べる); âm On dùng katakana; nhiều âm cách nhau bằng `, `; không có thì `-`.
- Cột ví dụ: các nhóm `**• Âm Kun:**`, `**• Âm On:**`, `**• Đọc đặc biệt:**` cách nhau bằng `<br>`; mỗi ví dụ dạng `Từ (cách đọc): nghĩa`, các ví dụ cách nhau bằng ` / `. Trong ngoặc đọc nhiều cách thì dùng dấu phẩy: `十分 (じゅっぷん, じっぷん)`.

### 5.5 File ngoại lệ (`content/overrides/*.yaml`)

```yaml
# verb-groups.yaml — động từ đuôi i trước ます nhưng thuộc nhóm II
- { kana: みます, kanji: 見ます, group: 2 }
- { kana: おきます, kanji: 起きます, group: 2 }   # khác 置きます (nhóm I)
- { kana: かります, kanji: 借ります, group: 2 }
- { kana: あびます, kanji: 浴びます, group: 2 }
- { kana: おります, kanji: 降ります, group: 2 }
- { kana: できます, kanji: "-", group: 2 }
- { kana: います, kanji: "-", group: 2 }
- { kana: きます, kanji: 着ます, group: 2 }       # khác 来ます (nhóm III)
- { kana: たります, kanji: 足ります, group: 2 }
```

---

## 6. MÔ HÌNH DỮ LIỆU & THUẬT TOÁN

### 6.1 Kiểu dữ liệu (TypeScript — `src/domain/types.ts`)

```ts
export type LevelId = 'N5' | 'N4' | 'N3' | 'N2' | 'N1';
export type Edition = 'old' | 'new';
export type Pos = 'noun' | 'verb' | 'i-adj' | 'na-adj' | 'adverb' | 'expression' | 'counter' | 'affix' | 'other';
export type Skill = 'recognition' | 'meaning' | 'recall' | 'reading' | 'listening' | 'writing' | 'usage'
                  | 'particle' | 'grammar' | 'conjugation' | 'kanji-on' | 'kanji-kun' | 'kanji-meaning';

export interface VocabItem {
  id: string;                 // "mnn1-l05-3f9a12bc" (ổn định, xem 6.2)
  bookId: string; lesson: number;
  section: 'main' | 'extended'; sectionTitle?: string;
  kana: string; kanji: string | null; romaji: string; meaning: string; note?: string;
  edition?: Edition;          // từ cột Ghi chú
  pos: Pos; verbGroup?: 1 | 2 | 3;
  answers: { kana: string[]; kanji: string[]; meaning: string[] }; // đã chuẩn hóa để chấm
  kanjiChars: string[];       // ['外','国'] → liên kết sang KanjiItem
  homographKey: string;       // kana chuẩn hóa, để tránh lấy từ đồng âm làm đáp án nhiễu
}

export interface GrammarExample { jp: string; romaji: string; vi: string; chunks: string[] }
export interface GrammarPoint {
  id: string; bookId: string; lesson: number; order: number;
  title: string; meaning: string; explanationMd: string;
  examples: GrammarExample[]; supplemental: boolean;   // true nếu có "(bổ sung)"
}

export interface KanjiExample { kind: 'kun' | 'on' | 'special'; word: string; reading: string; meaning: string }
export interface KanjiItem {
  id: string;                 // "kanji-外" (toàn cục theo chữ)
  bookId: string; chapter: number | 'appendix';
  char: string; strokes: number; kun: string[]; on: string[];
  hanViet: string; meaning: string; examples: KanjiExample[];
  relatedVocabIds: string[];  // từ vựng MNN chứa chữ này (tạo lúc build)
}

export interface Attempt {    // một lượt trả lời
  id?: number; itemId: string; itemType: 'vocab' | 'grammar' | 'kanji';
  skill: Skill; mode: string; correct: boolean; responseMs: number;
  given?: string; expected?: string; sessionId: string; ts: number;
}
export interface Mastery { itemId: string; skill: Skill; score: number; attempts: number; streak: number; lastTs: number }
```

### 6.2 Chiến lược ID ổn định
- **Từ vựng:** `<bookId>-l<bài 2 chữ số>-<hash8(kana + "|" + kanji)>`. Sửa nghĩa, romaji, ghi chú → ID **không đổi**, tiến độ giữ nguyên. Sửa kana/kanji → ID đổi; khai báo `id-aliases.yaml` (`cũ: mới`) để chuyển tiến độ.
- **Ngữ pháp:** `<bookId>-l<bài>-g-<hash8(tiêu đề đã bỏ "(bổ sung)")>`.
- **Kanji:** `kanji-<chữ>` (dùng chung giữa các sách, vì một chữ chỉ cần học một lần).
- Build sẽ **báo lỗi** nếu hai mục trong cùng bài trùng ID.

### 6.3 Pipeline build nội dung (`npm run content:build`)
1. Đọc `manifest.yaml`.
2. Parse từng file md thành cây (remark + gfm), lấy tiêu đề và bảng.
3. **Validate** (Zod + luật): đủ 5 cột · kana chỉ chứa kana/ký tự cho phép · có romaji · không trùng (kana, kanji) giữa các bài (trừ danh sách đồng âm cho phép) · số chữ Kanji mỗi chương khớp số ghi ở tiêu đề · ví dụ ngữ pháp đủ 3 dòng · cảnh báo nếu Kanji trong từ vựng không có trong cột Kana tương ứng...
4. **Enrich:**
   - Đoán **từ loại**: kết thúc `ます` → động từ; có `[な]` → tính từ な; Kanji kết thúc bằng `い` → tính từ い; bắt đầu bằng `～` → hậu tố/lượng từ; kết thúc `。`/`？` → mẫu câu giao tiếp; còn lại → danh từ; cuối cùng áp `pos.yaml`.
   - Xác định **nhóm động từ**: `します`/`～します`/`来ます` → III; âm trước ます thuộc cột え → II; cột い → I trừ khi có trong `verb-groups.yaml`.
   - Tạo `answers` (tách `/`, bỏ `[ ]`, chuẩn hóa), `kanjiChars`, `chunks` cho câu ví dụ, `relatedVocabIds` cho Kanji.
5. Xuất `public/content/manifest.json`, `public/content/<bookId>/index.json` (danh sách bài + số mục), `public/content/<bookId>/l<nn>.json` (nội dung từng bài) → app tải **lười** từng bài, nhẹ và nhanh.
6. Xuất `content-report.md` (số mục mỗi bài, cảnh báo) để bạn xem lại.

### 6.4 Engine câu hỏi (Quiz Engine)

```ts
export interface QuestionType<Q = unknown> {
  id: string;                          // 'mcq-jp-vi', 'typing', 'particle'...
  label: string;                       // tên hiển thị tiếng Việt
  itemType: 'vocab' | 'grammar' | 'kanji';
  skill: Skill;
  isEligible(item, ctx): boolean;      // VD: 'reading' chỉ áp dụng cho từ có Kanji
  generate(item, pool, rng): Q;        // tạo câu hỏi (có đáp án nhiễu)
  grade(q: Q, answer: unknown): { correct: boolean; expected: string };
  Component: React.FC<{ q: Q; onAnswer(a: unknown): void }>;
}
// questionRegistry.register(mcqJpVi); questionRegistry.register(typing); ...
```
- **Phiên luyện tập (Session):** nhận *phạm vi* (bài / nhiều bài / "điểm yếu" / "đến hạn ôn") + danh sách dạng câu hỏi + số câu → chọn mục, gọi `generate`, chạy tuần tự, ghi `Attempt` sau mỗi câu.
- **Thuật toán đáp án nhiễu:** lấy ứng viên cùng giáo trình, ưu tiên cùng bài hoặc ±2 bài, cùng từ loại, độ dài gần nhau; loại các từ có cùng `homographKey` hoặc cùng nghĩa (sau chuẩn hóa) với đáp án đúng; dùng RNG có seed để test lặp lại được. Trợ từ dễ nhầm hợp lệ (へ/に chỉ hướng) không được đưa làm đáp án nhiễu cho nhau.
- **Chấm dạng gõ:** chuẩn hóa (NFKC, bỏ khoảng trắng, dấu câu, `[ ]`, katakana ↔ hiragana khi hỏi cách đọc), so khớp với mọi phần tử trong `answers`.

### 6.5 Độ thành thạo & điểm yếu
- Sau mỗi lượt trả lời cho cặp (mục, kỹ năng):  
  `score_mới = score_cũ × 0.7 + (đúng ? 1 : 0) × 0.3` (bắt đầu từ 0); nếu trả lời đúng nhưng chậm hơn 8 giây thì chỉ tính 0.7 điểm.
- **Độ thành thạo một từ** = trung bình có trọng số các kỹ năng đã kiểm tra.  
  **Độ thành thạo một bài** = trung bình các từ *chính* trong bài (từ chưa làm lần nào tính 0).
- **Điểm yếu** = các cặp (mục, kỹ năng) có `attempts ≥ 2` và `score < 0.6`, hoặc sai ở lần gần nhất; sắp xếp theo `(1 − score) × hệ_số_thời_gian` (lỗi gần đây nặng hơn).
- **Sổ lỗi sai:** thêm khi trả lời sai; tự gỡ khi `streak ≥ 3` lần đúng liên tiếp.

### 6.6 Lặp lại ngắt quãng (SRS)
- Dùng **ts-fsrs**, mỗi từ vựng/Kanji có một thẻ (`card`). Flashcard dùng 4 nút đánh giá; các dạng khác quy đổi: sai → *Quên*, đúng chậm → *Khó*, đúng → *Nhớ*.
- Trang **Ôn tập hôm nay**: thẻ đến hạn + tối đa 10 thẻ mới/ngày (chỉnh được).

### 6.7 Lưu trữ (Dexie / IndexedDB)

| Bảng | Khóa / chỉ mục | Nội dung |
|---|---|---|
| `attempts` | `++id, itemId, skill, sessionId, ts` | Mọi lượt trả lời |
| `mastery` | `[itemId+skill], itemId, score, lastTs` | Độ thành thạo |
| `srsCards` | `itemId, due` | Trạng thái thẻ FSRS |
| `mistakes` | `itemId, addedTs` | Sổ lỗi sai |
| `sessions` | `++id, mode, startedAt` | Lịch sử phiên |
| `settings` | `key` | Cài đặt |

- Thêm bảng `outbox` (`++id, table, payload, createdAt`): hàng đợi các thay đổi chưa đẩy lên tài khoản.
- Có `schemaVersion` và hàm **migration** khi đổi cấu trúc.
- **Xuất/Nhập** toàn bộ tiến độ ra file `.json` (sao lưu, chuyển máy).

### 6.8 Tài khoản & đồng bộ (Supabase)

**Bảng trên Supabase** (mỗi bảng có `user_id uuid references auth.users`, bật **Row Level Security**: chỉ đọc/ghi khi `user_id = auth.uid()`):

| Bảng | Khóa chính | Cột chính |
|---|---|---|
| `profiles` | `id` (= user id) | `display_name`, `settings jsonb`, `created_at` |
| `attempts` | `id uuid` (tạo ở máy khách) | `item_id, item_type, skill, mode, correct, response_ms, session_id, ts` |
| `mastery` | `(user_id, item_id, skill)` | `score, attempts, streak, last_ts, updated_at` |
| `srs_cards` | `(user_id, item_id)` | `card jsonb, due, updated_at` |
| `mistakes` | `(user_id, item_id)` | `added_ts, removed_at` |

**Cách đồng bộ (đơn giản, đủ dùng cho 1 người nhiều thiết bị):**
1. Mọi thay đổi ghi vào IndexedDB trước + thêm vào `outbox`.
2. Khi đã đăng nhập và có mạng: đẩy `outbox` theo lô (attempts: chỉ thêm mới, dùng `id` uuid nên không bị trùng; mastery/srs/mistakes: `upsert`, bản có `updated_at` mới hơn thắng).
3. Khi đăng nhập hoặc mở app: tải về các bản ghi có `updated_at` mới hơn lần đồng bộ trước, ghi vào IndexedDB.
4. Lần đầu đăng nhập trên máy đã có tiến độ khách: hỏi người dùng có gộp không → nếu có, đẩy toàn bộ lên.
5. Đăng xuất: hỏi có xóa dữ liệu trên máy này không (máy dùng chung).

**Bảo mật:** chỉ dùng *anon key* (công khai được vì có RLS) trong website; **không** đưa *service role key* vào code. Biến môi trường đặt trong Vercel.

---

## 7. GIAO DIỆN & TRẢI NGHIỆM

### 7.1 Danh sách trang (routes)

| Đường dẫn | Trang | Nội dung chính |
|---|---|---|
| `/` | Trang chủ | Ôn tập hôm nay (số thẻ đến hạn) · Tiếp tục bài đang học · Điểm yếu nổi bật · Chuỗi ngày học |
| `/n/:level` | Cấp độ | Danh sách giáo trình của cấp độ, % thành thạo |
| `/b/:bookId` | Giáo trình | Lưới bài học kiểu bản đồ nhiệt (đỏ → xanh) |
| `/b/:bookId/:lesson` | Bài học | Tab Từ vựng / Ngữ pháp / Kanji · nút "Luyện tập bài này" |
| `/practice/setup` | Thiết lập phiên | Chọn phạm vi, dạng bài, số câu, bộ lọc |
| `/practice/run` | Làm bài | Thanh tiến độ, câu hỏi, phản hồi đúng/sai tức thì |
| `/practice/result/:sessionId` | Kết quả | Điểm, thời gian, danh sách câu sai, "Làm lại câu sai" |
| `/review` | Ôn tập SRS | Phiên flashcard các thẻ đến hạn |
| `/weak` | Điểm yếu | Top từ yếu, bài yếu, kỹ năng yếu, nút luyện ngay |
| `/mistakes` | Sổ lỗi sai | Lọc theo bài/dạng, ôn lại |
| `/kanji/:char` | Chi tiết Kanji | Âm, nghĩa, ví dụ, từ vựng liên quan |
| `/search?q=` | Tìm kiếm | Tìm theo kana / kanji / romaji / nghĩa |
| `/stats` | Thống kê | Biểu đồ số câu/ngày, độ chính xác theo kỹ năng |
| `/settings` | Cài đặt | Như mục 3.6 |
| `/login`, `/register`, `/forgot-password` | Tài khoản | Form đơn giản (mục 3.7) |
| `/account` | Tài khoản của tôi | Tên hiển thị, đổi mật khẩu, trạng thái đồng bộ, xuất dữ liệu, xóa tài khoản |
| `/about` | Giới thiệu | Nguồn tham khảo giáo trình, chính sách dữ liệu ngắn gọn (vì website công khai, có tài khoản) |

### 7.2 Nguyên tắc giao diện
- **Ưu tiên điện thoại** (thiết kế từ màn hình 360px), vùng bấm ≥ 44px, làm bài được bằng một tay.
- Font tiếng Nhật: *Noto Sans JP* (hoặc *M PLUS Rounded 1c* cho thân thiện); chữ Nhật trong câu hỏi cỡ lớn (≥ 32px).
- Furigana bằng thẻ `<ruby>` khi từ có cả Kanji và Kana.
- Phản hồi tức thì: xanh khi đúng, đỏ + hiện đáp án đúng khi sai; có rung nhẹ trên điện thoại.
- Phím tắt trên máy tính: `1-4` chọn đáp án, `Enter` tiếp, `Space` lật thẻ, `R` nghe lại.
- Chế độ sáng/tối; màu không phải tín hiệu duy nhất (kèm biểu tượng ✓ ✗) để hỗ trợ người mù màu.
- Giao diện tiếng Việt toàn bộ; chuỗi giao diện gom vào `src/i18n/vi.ts` để sau này thêm tiếng Anh dễ dàng.

### 7.3 Nhận diện: tên & màu
- **Tên hiển thị:** "Tự học tiếng Nhật cùng Mạnh" (logo chữ; trên điện thoại rút gọn "Học tiếng Nhật cùng Mạnh"). Tên ngắn trong PWA: "Tiếng Nhật – Mạnh".
- **Màu chủ đạo xanh dương** (khai báo một lần trong cấu hình Tailwind dưới dạng token `primary`, không viết mã màu rải rác):

| Token | Màu | Dùng cho |
|---|---|---|
| `primary-50` | `#EFF6FF` | Nền nhạt, thẻ được chọn |
| `primary-100` | `#DBEAFE` | Nền nút phụ, viền nhạt |
| `primary-500` | `#3B82F6` | Biểu tượng, thanh tiến độ |
| `primary-600` | `#2563EB` | **Màu chính:** nút chính, liên kết, thanh trên |
| `primary-700` | `#1D4ED8` | Trạng thái nhấn/hover |
| `primary-900` | `#1E3A8A` | Tiêu đề, chữ đậm trên nền nhạt |
| `success` | `#16A34A` | Trả lời đúng (kèm ✓) |
| `danger` | `#DC2626` | Trả lời sai (kèm ✗) |
| `warning` | `#F59E0B` | Từ sắp quên, cảnh báo |

- Chế độ tối: nền `#0F172A`, màu chính sáng hơn (`#60A5FA`) để đủ tương phản.
- Bản đồ nhiệt theo bài: đỏ (yếu) → vàng → **xanh dương** (đã thuộc), để thống nhất với màu thương hiệu.

---

## 8. KIỂM THỬ, TRIỂN KHAI, VẬN HÀNH

### 8.1 Kiểm thử
| Loại | Công cụ | Phạm vi bắt buộc |
|---|---|---|
| Unit | Vitest | Parser 3 loại file (dùng chính file N5 làm dữ liệu test) · Validator · Engine chia động từ (toàn bộ bảng phụ lục ngữ pháp) · Distractor không trùng nghĩa · Chấm điểm dạng gõ · Công thức mastery |
| Component | Testing Library | Mỗi dạng câu hỏi: hiển thị, chọn đáp án, chấm |
| E2E | Playwright | Luồng: chọn Bài 1 → Trắc nghiệm 10 câu → xem kết quả → tiến độ được lưu sau khi tải lại trang |
| Nội dung | `npm run content:validate` | Chạy trong CI, chặn merge nếu lỗi |

### 8.2 Triển khai công khai (Vercel)
- **Một lần thiết lập (bạn làm, có hướng dẫn ở mục 12.2):** tạo repo GitHub → kết nối với Vercel (Import Project) → Vercel tự nhận Vite. Build command: `npm run content:build && npm run build`, thư mục xuất: `dist`.
- **Sau đó hoàn toàn tự động:** đẩy code/nội dung lên nhánh `main` → Vercel build và cập nhật website trong vài phút. Mỗi Pull Request có **link xem trước** riêng để kiểm tra trước khi đưa lên bản chính.
- `vercel.json` cấu hình chuyển mọi đường dẫn về `index.html` (để mở thẳng `/b/mnn1/5` không bị lỗi 404).
- Biến môi trường `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` khai báo trong Vercel → Settings → Environment Variables.
- Trong Supabase → Authentication → URL Configuration: thêm địa chỉ Vercel vào *Site URL* và *Redirect URLs* (để link xác nhận email / quên mật khẩu trỏ về đúng website).
- GitHub Actions chạy `npm run check` + e2e cho mỗi Pull Request; chỉ merge khi xanh.
- Website công khai nên có: thẻ meta (tiêu đề, mô tả, ảnh chia sẻ), favicon, trang 404 thân thiện, trang `/about`.

### 8.3 Lưu ý bản quyền (quan trọng vì website công khai)
- Danh sách từ vựng (từ + nghĩa) và giải thích ngữ pháp bằng lời của bạn là phần biên soạn lại, phù hợp đưa lên web học tập.
- **Câu ví dụ, hội thoại, bài đọc chép nguyên văn từ sách** có thể vi phạm bản quyền của nhà xuất bản khi công khai. Trước khi phát hành 1.0 nên rà soát và **viết lại câu ví dụ** (giữ đúng mẫu ngữ pháp, đổi nội dung) — có thể nhờ Claude làm hàng loạt.
- Trang `/about` ghi rõ: website là công cụ tự học, tham khảo giáo trình *Minna no Nihongo (3A Corporation)* và *Kanji Master N5 (三修社)*, khuyến khích người học mua sách gốc.
- Không đăng file scan/PDF/audio của sách.

---

## 9. QUY TRÌNH THÊM CẤP ĐỘ MỚI (N4, N3, N2)

### 9.1 Thêm cấp độ mới

> Ví dụ thêm **N4 = Minna no Nihongo 2 (Bài 26-50) + Kanji Master N4**.

1. Tạo thư mục `content/n4/mnn2/` và `content/n4/kanji-master-n4/`.
2. Soạn `vocab.md`, `grammar.md`, `kanji.md` theo **Phụ lục B** (có thể nhờ Claude chuyển đổi từ tài liệu sẵn có).
3. Thêm khai báo vào `content/manifest.yaml`:
   ```yaml
   - id: N4
     title: "JLPT N4 — Sơ trung cấp"
     order: 4
     books:
       - { id: mnn2, title: "Minna no Nihongo 2", type: textbook, lessonLabel: "Bài", lessonRange: [26, 50],
           sources: { vocab: n4/mnn2/vocab.md, grammar: n4/mnn2/grammar.md } }
       - { id: kanji-master-n4, title: "Kanji Master N4", type: kanji, lessonLabel: "Chương",
           sources: { kanji: n4/kanji-master-n4/kanji.md } }
   ```
4. Chạy `npm run content:build` → đọc `content-report.md`, sửa lỗi nếu có.
5. Thêm ngoại lệ động từ mới vào `overrides/verb-groups.yaml` nếu báo cáo cảnh báo.
6. Đẩy lên GitHub → website tự cập nhật, menu N4 tự xuất hiện. **Không sửa code.**

**Khi nào mới cần sửa code?** Chỉ khi thêm *loại nội dung mới* chưa có (VD: bài đọc hiểu, bài nghe có file audio, đề thi thử). Khi đó thêm 1 parser + 1 kiểu dữ liệu + các dạng câu hỏi mới vào registry — kiến trúc đã chừa sẵn chỗ.

### 9.2 Việc nội dung: chuyển file từ vựng sang chuẩn bản mới (làm trước Phase 1)
File `MNN1_Tu_Vung.md` v2.0 hiện là danh sách **hợp nhất bản cũ + bản mới**; mới chỉ có 14 từ được gắn cờ phiên bản. Vì bạn học **bản mới**, cần một lượt chuẩn hóa:
1. **Bạn** đối chiếu file `Danh_sach_doi_chieu_ban_moi.md` với sách bản mới: phần A (các từ nghi khác biệt) trước, phần B (toàn bộ từ theo bài) khi có thời gian. Ghi kết quả vào cột *Kết quả*: `✓` có trong bài này · `✗` không có trong sách · `→ Bài n` có nhưng ở bài khác · `+ từ...` sách có mà danh sách thiếu.
2. **Tôi** cập nhật `MNN1_Tu_Vung.md`: từ `✗` gắn nhãn `Bản cũ` (giữ lại và vẫn hiện để học thêm), từ `→ Bài n` chuyển về đúng bài, từ `+` được bổ sung.
3. Cập nhật câu ví dụ ngữ pháp dùng từ bản cũ (đã sửa テレホンカード ở Bài 2).
4. Chạy `npm run content:validate` (từ Phase 1) để kiểm tra lại định dạng.

Việc này **không cần code** và làm được ngay trong Claude chat song song với Phase 0.

---

## 10. TRÌNH TỰ LẬP TRÌNH CHO CLAUDE CODE

### 10.1 Cách làm việc với Claude Code
- Làm **đúng thứ tự từng phase**, mỗi phase một nhánh git / một lần commit lớn. Phase sau dựa trên phase trước.
- Đầu mỗi phase: dán **"Prompt gợi ý"** bên dưới vào Claude Code. Yêu cầu Claude Code **lập kế hoạch trước (plan mode)**, bạn duyệt rồi mới code.
- Cuối mỗi phase: chạy `npm run check` (= validate nội dung + typecheck + lint + test). Chỉ sang phase mới khi **tất cả tiêu chí hoàn thành** đều đạt.
- File `CLAUDE.md` (Phụ lục A) đặt ở gốc repo để Claude Code luôn nhớ quy ước.

### 10.2 Tổng quan các phase

| Phase | Nội dung | Kết quả nhìn thấy được | Độ lớn |
|---|---|---|---|
| 0 | Khởi tạo dự án, công cụ, CLAUDE.md, repo GitHub | Trang "Tự học tiếng Nhật cùng Mạnh" chạy được | S |
| 1 | Pipeline nội dung: parser + validator | `npm run content:build` sinh JSON cho N5, báo cáo lỗi | L |
| 2 | Enrich: từ loại, nhóm động từ, engine chia động từ, liên kết Kanji | JSON có `pos`, `verbGroup`, `relatedVocabIds`; test chia động từ đạt 100% | M |
| 3 | Khung ứng dụng + **deploy công khai lên Vercel** + CI | 🌐 **Website có link công khai**, điều hướng Cấp độ → Giáo trình → Bài | M |
| 4 | Trang duyệt nội dung: từ vựng, ngữ pháp, Kanji, tìm kiếm | Xem đầy đủ nội dung N5 trên web, có 🔊 phát âm | M |
| 5 | Lớp lưu tiến độ trên máy (Dexie + repository + outbox) | Lưu/đọc attempts, mastery; xuất/nhập file | M |
| 6 | Engine câu hỏi + Session runner + **Flashcard** | Học Flashcard Bài 1, lưu đánh giá | L |
| 7 | **Trắc nghiệm 6 hướng** + màn hình kết quả | Làm trắc nghiệm theo bài, xem câu sai | M |
| 8 | **Gõ đáp án, Nghe, Chính tả, Ghép cặp, Đúng/Sai, Điền từ** | Đủ 8 dạng từ vựng | L |
| 9 | Quiz **ngữ pháp & Kanji** (trợ từ, sắp xếp câu, chọn mẫu, chia động từ, đọc Kanji, Hán Việt) | Luyện ngữ pháp & Kanji theo bài | L |
| 10 | **Bài kiểm tra tổng hợp**, **Điểm yếu**, **Sổ lỗi sai**, bản đồ nhiệt | ✅ Hoàn thành MVP (đã online) | M |
| 11 | **Tài khoản đơn giản & đồng bộ** (Supabase Auth + Postgres + RLS) | Đăng ký/đăng nhập; học trên điện thoại, mở máy tính thấy cùng tiến độ | M |
| 12 | **Ôn tập SRS** hằng ngày (ts-fsrs) | Trang "Ôn tập hôm nay" | M |
| 13 | **Thống kê**, trang chủ, **PWA offline**, a11y, rà soát bản quyền, tối ưu | ✅ Phát hành bản 1.0 | M |
| 14 | *(Tùy chọn)* Furigana tự động, thứ tự nét, thi thử JLPT, tên miền riêng, N4 | Bản 1.x | L |

### 10.3 Vì sao thứ tự các dạng bài như vậy
1. **Flashcard (Phase 6)** trước: dễ làm nhất, dùng để học từ mới ngay, đồng thời "chạy thử" engine câu hỏi và lưu tiến độ.
2. **Trắc nghiệm (Phase 7)**: kiểm tra nhanh, chấm tự động — là nền cho phát hiện điểm yếu.
3. **Gõ, Nghe, Ghép cặp... (Phase 8)**: kiểm tra sâu hơn (nhớ lại, nghe) sau khi đã nhận biết được từ.
4. **Ngữ pháp & Kanji (Phase 9)**: cần engine chia động từ và dữ liệu câu ví dụ đã ổn định từ các phase trước.
5. **Bài tổng hợp & Điểm yếu (Phase 10)**: cần dữ liệu từ tất cả các dạng trên.

Nhờ deploy từ Phase 3, sau mỗi phase bạn có thể dùng ngay dạng bài mới trên website công khai.

---

### PHASE 0 — Khởi tạo dự án
**Mục tiêu:** Có bộ khung dự án chạy được, cấu hình chất lượng code ngay từ đầu.

**Việc cần làm**
1. Tạo dự án Vite + React + TypeScript (strict), cài Tailwind CSS, React Router, Zustand, Zod, Dexie, ts-fsrs, WanaKana, MiniSearch, Vitest, Testing Library, Playwright, ESLint, Prettier.
2. Tạo cấu trúc thư mục như mục 4.3 (các thư mục rỗng có `README.md` ngắn mô tả vai trò).
3. Copy 3 file md N5 vào `content/n5/...`, copy file kế hoạch này vào `docs/Ke_hoach_Website.md`, tạo `content/manifest.yaml` (mục 5.1).
4. Tạo `CLAUDE.md` (Phụ lục A).
5. Scripts trong `package.json`: `dev`, `build`, `preview`, `typecheck`, `lint`, `test`, `test:e2e`, `content:build`, `content:validate`, `check` (gộp validate + typecheck + lint + test).
6. Thiết lập alias `@/` → `src/`.
7. Khởi tạo git, tạo repo trên GitHub (bạn tạo repo trống, Claude Code đẩy code lên), thêm `.gitignore`, `.env.example`.

**Tiêu chí hoàn thành:** `npm run dev` hiện trang "Tự học tiếng Nhật cùng Mạnh" với màu xanh dương; `npm run check` chạy không lỗi; cấu trúc thư mục đúng mục 4.3.

**Prompt gợi ý:**
> Đọc file `docs/Ke_hoach_Website.md` (mục 4 và Phase 0). Khởi tạo dự án theo đúng công nghệ và cấu trúc thư mục đã nêu. Tạo `CLAUDE.md` theo Phụ lục A, `content/manifest.yaml` theo mục 5.1, copy 3 file md vào `content/n5/`. Chưa viết tính năng. Lập kế hoạch trước rồi chờ tôi duyệt.

---

### PHASE 1 — Pipeline nội dung (Parser + Validator)
**Mục tiêu:** Biến 3 file md thành JSON đúng schema; mọi lỗi định dạng được báo kèm số dòng.

**Việc cần làm**
1. `src/domain/types.ts` + `src/domain/schemas.ts`: định nghĩa kiểu và **Zod schema** (mục 6.1) — dùng chung cho script và app.
2. `scripts/content/parse-vocab.ts`: đọc tiêu đề `BÀI <n>`, nhóm `chính/mở rộng`, bảng 5 cột → `VocabItem` (chưa enrich).
3. `scripts/content/parse-grammar.ts`: tách bài → mẫu câu → ý nghĩa, giải thích (giữ markdown), ví dụ 3 dòng, cờ `(bổ sung)`.
4. `scripts/content/parse-kanji.ts`: tách chương, ô Kanji (chữ + số nét), âm Kun/On, Hán Việt, ví dụ theo nhóm (mục 5.4); nhận diện Phụ lục.
5. `scripts/content/validate.ts`: các luật ở mục 6.3 bước 3; phân mức **error** (dừng build) / **warning** (chỉ báo).
6. `scripts/content/ids.ts`: tạo ID ổn định (mục 6.2) + đọc `id-aliases.yaml`.
7. `scripts/content/build.ts`: chạy toàn bộ, ghi `public/content/**` và `content-report.md`.
8. Unit test dùng **chính 3 file N5**: đếm đúng 25 bài từ vựng, 25 bài ngữ pháp, 119 + 15 Kanji; test một số mục cụ thể (VD: Bài 3 có `じどうはんばいき`, Kanji `四` có 5 nét, `今` có ví dụ đọc đặc biệt `今日 (きょう)`).

**Tiêu chí hoàn thành:** build ra JSON cho N5 không có error; số lượng khớp: **1.020 từ chính + 272 từ mở rộng**, **132 mẫu ngữ pháp**, **119 Kanji + 15 phụ lục**; cố tình xóa 1 cột trong md → build báo lỗi đúng dòng.

**Prompt gợi ý:**
> Làm Phase 1 theo `docs/Ke_hoach_Website.md` (mục 5, 6.1-6.3). Dùng unified + remark-parse + remark-gfm để đọc bảng, không dùng regex cho bảng. Viết test trước cho parser với chính các file trong `content/n5`. Số lượng mục phải khớp tiêu chí hoàn thành của Phase 1.

---

### PHASE 2 — Làm giàu dữ liệu & Engine chia động từ
**Mục tiêu:** Dữ liệu đủ thông tin để sinh nhiều dạng câu hỏi.

**Việc cần làm**
1. `scripts/content/enrich.ts`: đoán `pos`, `verbGroup` (mục 6.3 bước 4) + áp `overrides/pos.yaml`, `overrides/verb-groups.yaml` (tạo sẵn danh sách mục 5.5).
2. Tạo `answers` (tách `/`, bỏ `[ ]`), `homographKey`, `kanjiChars`, `chunks` (tách câu ví dụ theo khoảng trắng), `relatedVocabIds` cho Kanji.
3. `src/domain/conjugation/`: hàm `toTe`, `toTa`, `toNai`, `toDictionary`, `toMasuStem` nhận động từ thể ます + nhóm. Xử lý ngoại lệ 行きます, あります, 来ます, します, danh từ + します, động từ có `[ ]`.
4. Test: toàn bộ bảng phụ lục trong `grammar.md` + mọi động từ trong `vocab.md` chia được không lỗi; in danh sách động từ không chắc chắn vào `content-report.md`.

**Tiêu chí hoàn thành:** 100% test chia động từ đạt; báo cáo liệt kê số từ theo từ loại; `外` có danh sách từ vựng liên quan (外国, 外国人...).

**Prompt gợi ý:**
> Làm Phase 2. Viết engine chia động từ thuần TypeScript trong `src/domain/conjugation`, có test đầy đủ với bảng phụ lục của `grammar.md`. Sau đó viết bước enrich trong pipeline. Không thêm thư viện NLP.

---

### PHASE 3 — Khung ứng dụng
**Mục tiêu:** Ứng dụng có điều hướng theo manifest, giao diện cơ bản, tải nội dung lười.

**Việc cần làm**
1. `src/data/content-loader.ts`: tải `manifest.json`, `index.json` của giáo trình, `l<nn>.json` theo bài; cache trong bộ nhớ; validate bằng Zod khi ở chế độ dev.
2. Router theo bảng mục 7.1 (các trang chưa làm hiển thị "Sắp có").
3. Layout: thanh trên (logo, tìm kiếm, cài đặt), thanh điều hướng dưới trên điện thoại (Trang chủ / Học / Ôn tập / Điểm yếu / Thống kê).
4. Theme sáng/tối, font Noto Sans JP, chuỗi giao diện trong `src/i18n/vi.ts`.
5. Trang Cấp độ → Giáo trình → Bài (danh sách) **sinh hoàn toàn từ manifest** (không hard-code N5).
6. **Deploy công khai:** thêm `vercel.json` (rewrite SPA), cấu hình build `npm run content:build && npm run build`; bạn kết nối repo với Vercel một lần (mục 12.2).
7. **CI:** GitHub Actions chạy `npm run check` + build cho mỗi Pull Request.
8. Thẻ meta, favicon, trang 404, trang `/about` (nội dung mục 8.3).

**Tiêu chí hoàn thành:** Mở link `https://<tên>.vercel.app` trên điện thoại thấy menu N5; mở thẳng `/b/mnn1/5` không bị 404; thêm thử một cấp độ giả trong manifest → menu tự xuất hiện; không có chuỗi tiếng Việt viết cứng trong component.

**Prompt gợi ý:**
> Làm Phase 3. Mọi danh sách cấp độ/giáo trình/bài phải đọc từ manifest JSON. Thiết kế mobile-first theo mục 7.2. Chuẩn bị deploy Vercel theo mục 8.2 (vercel.json, build command) và GitHub Actions. Thêm test e2e: mở trang chủ → vào N5 → Minna no Nihongo 1 → Bài 1. Cuối phase, liệt kê các bước tôi cần tự bấm trên Vercel.

---

### PHASE 4 — Trang duyệt nội dung
**Mục tiêu:** Đọc được toàn bộ nội dung N5 trên web.

**Việc cần làm**
1. Trang Bài học, 3 tab:
   - *Từ vựng:* bảng/thẻ có lọc *chính / mở rộng*, phiên bản (**mặc định hiện tất cả**, theo `editionFilterDefault` trong manifest; từ `Bản cũ` có nhãn nhỏ), ẩn/hiện nghĩa (tự kiểm tra), nút 🔊.
   - *Ngữ pháp:* thẻ mở rộng được; ví dụ có nút ẩn/hiện romaji & dịch; nhãn "bổ sung".
   - *Kanji liên quan:* Kanji có trong từ vựng bài này.
2. Trang Giáo trình Kanji theo chương; trang `/kanji/:char` chi tiết.
3. `src/lib/tts.ts`: bọc `speechSynthesis` (chọn giọng `ja-JP`, tốc độ theo cài đặt, báo khi thiết bị không có giọng Nhật).
4. Component `<Ruby>` hiển thị furigana cho từ có Kanji.
5. Tìm kiếm toàn cục bằng MiniSearch (kana, kanji, romaji, nghĩa).

**Tiêu chí hoàn thành:** Xem được 25 bài + 15 chương; tìm "がいこく" hoặc "nuoc ngoai" ra 外国; 🔊 đọc được trên Chrome/Android/iOS.

**Prompt gợi ý:**
> Làm Phase 4 theo mục 3.4 và 7 của kế hoạch. Tìm kiếm phải bỏ dấu tiếng Việt khi so khớp (gõ "nuoc ngoai" vẫn ra "nước ngoài").

---

### PHASE 5 — Lưu tiến độ
**Mục tiêu:** Có lớp lưu trữ ổn định, thay thế được về sau.

**Việc cần làm**
1. `src/data/progress/ProgressRepository.ts` (interface): `recordAttempt`, `getMastery`, `listWeak`, `getSrsCard`, `saveSrsCard`, `addMistake`, `exportAll`, `importAll`...
2. `dexie-repo.ts`: cài đặt bằng Dexie theo bảng mục 6.7, có `schemaVersion` + migration. Mọi hàm ghi đồng thời thêm bản ghi vào `outbox` (chuẩn bị cho đồng bộ ở Phase 11). ID attempt là `uuid` tạo ở máy khách.
3. `src/domain/mastery/`: công thức mục 6.5 (thuần, có test).
4. Trang Cài đặt: Xuất/Nhập file JSON, Xóa tiến độ (có xác nhận).

**Tiêu chí hoàn thành:** Test với `fake-indexeddb`; xuất → xóa → nhập lại → dữ liệu như cũ.

**Prompt gợi ý:**
> Làm Phase 5. Giao diện và engine chỉ được phụ thuộc vào interface `ProgressRepository`, không import Dexie trực tiếp ngoài `dexie-repo.ts`.

---

### PHASE 6 — Engine câu hỏi, Session runner & Flashcard
**Mục tiêu:** Có "động cơ" chung cho mọi dạng bài, dạng đầu tiên là Flashcard.

**Việc cần làm**
1. `src/domain/quiz/registry.ts`: interface `QuestionType` (mục 6.4) + `register/get/list`.
2. `src/domain/quiz/session.ts`: tạo phiên từ *phạm vi + dạng + số câu + bộ lọc*, chọn mục (ưu tiên mục chưa học/yếu nếu chọn), RNG có seed.
3. `src/domain/quiz/distractors.ts`: thuật toán mục 6.4 + test (không bao giờ có 2 đáp án trùng nghĩa / đồng âm).
4. Trang `/practice/setup` và `/practice/run` (dùng Zustand cho trạng thái phiên).
5. Dạng **Flashcard** (`features/practice/modes/flashcard`): lật thẻ (hiệu ứng), chọn mặt trước, 4 nút đánh giá, phím tắt, 🔊.
6. Ghi `Attempt` + cập nhật mastery sau mỗi thẻ.

**Tiêu chí hoàn thành:** Học Flashcard Bài 1 (34 thẻ) → tải lại trang → mastery Bài 1 > 0; thêm một dạng giả vào registry thì tự xuất hiện trong trang thiết lập.

**Prompt gợi ý:**
> Làm Phase 6. Đây là phần lõi — thiết kế registry và session sao cho các dạng bài sau chỉ cần thêm 1 thư mục trong `modes/` và gọi `register`. Viết test cho session và distractors trước.

---

### PHASE 7 — Trắc nghiệm & Màn hình kết quả
**Việc cần làm**
1. Dạng **Trắc nghiệm** với 6 hướng (mục 3.2) — mỗi hướng là một `QuestionType` riêng, dùng chung component.
2. Hướng "Kanji → Cách đọc" chỉ áp dụng cho từ có Kanji (`isEligible`).
3. Màn hình **Kết quả**: điểm, thời gian, danh sách câu sai (câu hỏi · bạn chọn · đáp án đúng), nút "Làm lại câu sai", "Luyện tiếp".
4. Câu sai tự thêm vào **Sổ lỗi sai**.

**Tiêu chí hoàn thành:** E2E: chọn Bài 5 → trắc nghiệm 10 câu "Nhật → Nghĩa" → cố tình sai 2 câu → kết quả 8/10, "Làm lại câu sai" có đúng 2 câu.

**Prompt gợi ý:**
> Làm Phase 7 theo mục 3.2 (dạng 2). Mỗi hướng hỏi là một QuestionType đăng ký riêng. Thêm test e2e như tiêu chí hoàn thành.

---

### PHASE 8 — Các dạng từ vựng còn lại
**Việc cần làm:** Thêm 5 dạng (mỗi dạng là một thư mục trong `modes/`):
1. **Gõ đáp án** — ô nhập dùng WanaKana (`bind` romaji → hiragana), chấm theo mục 6.4, cho xem gợi ý chữ đầu.
2. **Nghe & chọn** — phát TTS tự động, nút nghe lại; ẩn dạng này nếu thiết bị không có giọng Nhật.
3. **Chính tả nghe** — nghe → gõ kana.
4. **Ghép cặp** — lưới 6 cặp, tính giờ, ghi attempt cho từng cặp.
5. **Đúng / Sai tốc độ** — đồng hồ 60 giây, điểm kỷ lục lưu trong settings.
6. **Điền từ vào câu** — tìm câu ví dụ ngữ pháp chứa từ (theo kana hoặc kanji), chỉ bật khi tìm được câu.

**Tiêu chí hoàn thành:** Mỗi dạng có test component; gõ `gaikoku` → `がいこく` được chấm đúng; từ `ぎゅうにゅう / ミルク` chấp nhận cả hai.

---

### PHASE 9 — Quiz Ngữ pháp & Kanji
**Việc cần làm**
1. **Chọn trợ từ** — dùng `chunks`, che trợ từ cuối cụm; bảng nhóm trợ từ dễ nhầm hợp lệ để loại khỏi đáp án nhiễu.
2. **Sắp xếp câu** — kéo-thả (hỗ trợ cảm ứng), gợi ý bằng bản dịch.
3. **Hiểu nghĩa câu** — chọn bản dịch đúng.
4. **Chọn mẫu ngữ pháp** — che phần mẫu, đáp án nhiễu lấy từ mẫu cùng bài/bài lân cận.
5. **Chia động từ** — dùng engine Phase 2: hỏi thể て/た/ない/từ điển, dạng chọn và dạng gõ.
6. **Kanji: cách đọc (On/Kun)**, **Kanji: Hán Việt**, **Kanji trong từ vựng**.

**Tiêu chí hoàn thành:** Mỗi bài ngữ pháp sinh được ≥ 5 câu trợ từ; mọi động từ N5 tạo được câu chia động từ; Chương 1-15 tạo được quiz đọc Kanji.

---

### PHASE 10 — Bài kiểm tra tổng hợp & Điểm yếu (hoàn thành MVP)
**Việc cần làm**
1. **Bài kiểm tra tổng hợp của bài**: trộn 20-30 câu nhiều dạng (từ vựng 50% · ngữ pháp 30% · Kanji 20%, chỉnh được), xếp loại A ≥ 90% / B ≥ 70% / C.
2. Trang **Điểm yếu** (`/weak`) theo mục 3.5 + nút "Luyện 20 câu yếu nhất" (tạo session phạm vi `weak`).
3. Trang **Sổ lỗi sai** (`/mistakes`) với bộ lọc, tự gỡ khi đúng 3 lần liên tiếp.
4. **Bản đồ nhiệt** theo bài trên trang Giáo trình.

**Tiêu chí hoàn thành:** Sau khi cố tình sai các từ của Bài 3 nhiều lần, Bài 3 hiện màu đỏ và đứng đầu danh sách điểm yếu.

---

### PHASE 11 — Tài khoản đơn giản & Đồng bộ tiến độ
**Mục tiêu:** Đăng ký/đăng nhập đơn giản; học ở máy nào cũng thấy cùng tiến độ. Không đăng nhập vẫn dùng bình thường.

**Việc cần làm**
1. `supabase/migrations/0001_init.sql`: tạo bảng mục 6.8, bật RLS, chính sách `user_id = auth.uid()` cho select/insert/update/delete; trigger tạo `profiles` khi có user mới.
2. `src/data/supabase-client.ts`: khởi tạo từ `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`; nếu thiếu biến môi trường thì app chạy ở chế độ chỉ-khách (không lỗi).
3. `src/features/auth/`: trang Đăng ký (email, mật khẩu, tên hiển thị), Đăng nhập, Quên mật khẩu, Đặt lại mật khẩu; hiển thị lỗi tiếng Việt dễ hiểu.
3b. *(Tùy chọn, làm nếu bạn muốn)* nút **"Tiếp tục với Google"**: code chỉ cần gọi `signInWithOAuth({ provider: 'google' })`; nút chỉ hiện khi biến `VITE_ENABLE_GOOGLE_LOGIN=true`. Bạn tạo OAuth Client trên Google Cloud Console (~15 phút, Claude Code hướng dẫn từng bước) rồi bật biến này.
4. Header: nút "Đăng nhập" / ảnh đại diện + menu (Tài khoản, Đăng xuất). Trang `/account`: đổi tên, đổi mật khẩu, trạng thái đồng bộ ("Đã đồng bộ lúc 10:32"), xuất dữ liệu, xóa tài khoản.
5. `src/data/sync/sync-service.ts`: đẩy `outbox` theo lô, pull theo `updated_at`, xử lý mất mạng/thử lại, chạy khi đăng nhập, khi app mở lại, và định kỳ 1 phút khi đang học.
6. Luồng gộp tiến độ khách khi đăng nhập lần đầu; luồng đăng xuất (hỏi xóa dữ liệu trên máy).
7. Test: unit test sync với client giả; e2e với Supabase local (`supabase start`) hoặc dự án test: đăng ký → làm 10 câu → đăng nhập ở trình duyệt khác → thấy cùng mastery.

**Tiêu chí hoàn thành:** Đăng ký bằng email trên điện thoại, học Bài 1, mở website trên máy tính và đăng nhập → tiến độ Bài 1 giống hệt; tài khoản A không đọc được dữ liệu của tài khoản B (kiểm tra RLS); tắt mạng vẫn học được và tự đồng bộ khi có mạng lại.

**Prompt gợi ý:**
> Làm Phase 11 theo mục 3.7 và 6.8. Dùng Supabase Auth (email + mật khẩu, Google tùy chọn), không tự viết hệ thống mật khẩu. Giữ local-first: Dexie là nguồn chính, sync qua outbox. Chỉ dùng anon key, bật RLS cho mọi bảng. Liệt kê các bước tôi cần làm trên trang Supabase (tạo project, chạy migration, cấu hình URL, bật Google nếu muốn).

---

### PHASE 12 — Ôn tập hằng ngày (SRS)
**Việc cần làm:** Bọc ts-fsrs trong `src/domain/srs/` (mục 6.6); trang `/review`; giới hạn thẻ mới/ngày; quy đổi kết quả các dạng khác thành đánh giá FSRS; huy hiệu "chuỗi ngày học". Thẻ SRS đồng bộ qua bảng `srs_cards`.

**Tiêu chí hoàn thành:** Test với đồng hồ giả: thẻ đánh giá *Quên* xuất hiện lại sớm hơn thẻ *Dễ*; thẻ đến hạn giống nhau trên 2 thiết bị cùng tài khoản.

---

### PHASE 13 — Thống kê, PWA & Phát hành 1.0
**Việc cần làm**
1. **Thống kê:** biểu đồ số câu/ngày, độ chính xác theo kỹ năng, tiến độ theo bài; trang chủ đầy đủ mục 7.1.
2. **PWA:** vite-plugin-pwa, cache toàn bộ `public/content/**`, chạy offline, cài lên màn hình chính điện thoại.
3. **Hiệu năng:** tách code theo trang, Lighthouse ≥ 90 trên điện thoại.
4. **Truy cập:** điều khiển bằng bàn phím, nhãn ARIA, độ tương phản.
5. **Rà soát bản quyền** theo mục 8.3 (thay câu ví dụ chép nguyên văn nếu có).
6. `README.md` cho người dùng + `docs/CONTENT_GUIDE.md` (hướng dẫn soạn nội dung = mục 5 + Phụ lục B).

**Tiêu chí hoàn thành:** Cài được lên màn hình chính Android/iOS; tắt mạng vẫn học được; đẩy md lên GitHub → website công khai tự cập nhật.

---

### PHASE 14 — (Tùy chọn) Sau 1.0
- **Furigana tự động cho câu ví dụ:** dùng kuroshiro + kuromoji **lúc build** (không chạy trên trình duyệt), có file sửa tay khi máy đọc sai.
- **Thứ tự nét Kanji:** dữ liệu KanjiVG (giấy phép CC BY-SA 3.0 — phải ghi nguồn), hoạt ảnh SVG + chế độ tập viết.
- **Thi thử JLPT N5:** sinh đề theo mục 3.3 dạng 18, chấm điểm theo phần.
- **Tên miền riêng** (VD: `nihongocheck.com`) gắn vào Vercel.
- **Thêm N4** theo mục 9.1 (bài kiểm tra cho kiến trúc).

---

## 11. RỦI RO & CÁCH GIẢM THIỂU

| Rủi ro | Ảnh hưởng | Cách giảm thiểu |
|---|---|---|
| File md mới soạn sai định dạng | Build lỗi, thiếu dữ liệu | Validator báo lỗi kèm số dòng; template Phụ lục B; CI chặn |
| Sửa kana/kanji làm mất tiến độ | Mất lịch sử học | ID theo hash + `id-aliases.yaml` |
| Đoán sai từ loại / nhóm động từ | Câu hỏi chia động từ sai | File overrides + báo cáo "không chắc chắn" + test |
| Thiết bị không có giọng đọc tiếng Nhật | Dạng Nghe không dùng được | Tự phát hiện và ẩn dạng Nghe, hướng dẫn cài giọng; sau này hỗ trợ file audio |
| Dữ liệu lưu trên trình duyệt bị xóa | Mất tiến độ (chế độ khách) | Gợi ý đăng nhập để lưu lên tài khoản; xuất/nhập JSON |
| Lộ dữ liệu người dùng | Người khác đọc tiến độ/email | Bật RLS cho mọi bảng, chỉ dùng anon key, có test RLS ở Phase 11; không lưu dữ liệu nhạy cảm ngoài email |
| Gói miễn phí Supabase tạm dừng dự án khi lâu không có truy cập | Đăng nhập/đồng bộ tạm không chạy (website và chế độ khách vẫn chạy) | Vào trang Supabase bật lại; app hiển thị thông báo "Đồng bộ tạm gián đoạn" thay vì lỗi |
| Spam đăng ký tài khoản | Tài khoản rác | Bật xác nhận email trong Supabase; có thể thêm CAPTCHA của Supabase nếu cần |
| Từ xếp chưa đúng bài theo bản mới | Học bài 4 nhưng từ lại nằm ở bài 12 | Đối chiếu mục 9.2; từ ngoài bản mới vẫn giữ để học thêm |
| Bản quyền nội dung giáo trình | Rủi ro pháp lý vì website công khai | Viết lại câu ví dụ chép nguyên văn, ghi nguồn ở `/about`, không đăng scan/audio của sách (mục 8.3) |

---

## 12. CÁC ĐIỂM CÒN LẠI CẦN BẠN QUYẾT ĐỊNH & VIỆC BẠN CẦN TỰ LÀM

### 12.1 Đã chốt
- ✅ Giáo trình: **Minna no Nihongo bản mới** · ✅ Tài khoản: **đơn giản** (email + mật khẩu, Google tùy chọn) · ✅ Website: **công khai trên Vercel**.

### 12.2 Việc bạn cần tự làm (Claude Code không làm thay được vì cần tài khoản của bạn)

| Khi nào | Việc | Thời gian |
|---|---|---|
| Phase 0 | Tạo tài khoản **GitHub**, tạo repo trống tên `tu-hoc-tieng-nhat-cung-manh`, cho Claude Code quyền đẩy code | 10 phút |
| Phase 3 | Tạo tài khoản **Vercel** bằng GitHub → *Add New Project* → chọn repo → Deploy. Nhận link `https://<tên>.vercel.app` | 10 phút |
| Phase 11 | Tạo tài khoản **Supabase** → *New project* (chọn vùng Singapore cho gần Việt Nam) → chạy file migration (Claude Code hướng dẫn) → copy *Project URL* và *anon key* vào Vercel → Environment Variables → thêm link Vercel vào *Auth → URL Configuration* | 20 phút |
| Phase 11 (tùy chọn) | Bật đăng nhập Google: tạo OAuth Client trên Google Cloud Console, dán vào Supabase → Auth → Providers → Google | 15 phút |

### 12.3 Các lựa chọn khác
✅ Đã chốt toàn bộ (xem mục 0). Nếu khi làm phát sinh lựa chọn mới, Claude Code sẽ hỏi lại ở đầu phase tương ứng.

---

## PHỤ LỤC A — File `CLAUDE.md` mẫu (đặt ở gốc repo)

````markdown
# CLAUDE.md — Tự học tiếng Nhật cùng Mạnh

## Dự án
Website tự học & kiểm tra tiếng Nhật theo bài (N5 → N2). Kế hoạch đầy đủ: `docs/Ke_hoach_Website.md`.
Làm theo đúng thứ tự Phase trong mục 10 của kế hoạch. Luôn lập kế hoạch và chờ duyệt trước khi code một phase mới.

## Lệnh
- `npm run dev` — chạy local
- `npm run content:build` — md → JSON (public/content), sinh content-report.md
- `npm run check` — validate nội dung + typecheck + lint + unit test (phải xanh trước khi commit)
- `npm run test:e2e` — Playwright
- Deploy: tự động qua Vercel khi merge vào `main` (không deploy tay)

## Quy tắc bất biến
1. KHÔNG viết cứng nội dung tiếng Nhật, tên cấp độ (N5...), số bài trong code. Mọi thứ đọc từ manifest/JSON.
2. KHÔNG sửa tay `public/content/**` (file sinh tự động).
3. Nội dung chỉ nằm trong `content/**`. Định dạng md theo mục 5 của kế hoạch — nếu cần đổi định dạng, cập nhật parser + test + `docs/CONTENT_GUIDE.md` cùng lúc.
4. Dạng bài tập mới = thư mục mới trong `src/features/practice/modes/<tên>/` + `questionRegistry.register(...)`. Không sửa session runner để thêm dạng.
5. UI/engine chỉ dùng interface `ProgressRepository`; không import Dexie ngoài `src/data/progress/dexie-repo.ts`.
6. Logic thuần (parser, conjugation, quiz, mastery, srs) nằm trong `src/domain` hoặc `scripts/`, không import React, luôn có unit test.
7. Chuỗi giao diện tiếng Việt đặt trong `src/i18n/vi.ts`.
8. ID nội dung theo mục 6.2; thay đổi cách sinh ID là thay đổi phá vỡ → phải có migration.
9. TypeScript strict, không dùng `any` (dùng `unknown` + Zod).
10. Mobile-first; vùng bấm ≥ 44px; mọi màu trạng thái đi kèm biểu tượng.
11. Không commit bí mật: chỉ dùng `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` qua biến môi trường; tuyệt đối không dùng service role key trong code frontend. Mọi bảng Supabase phải bật RLS.
12. App phải chạy được khi không có biến môi trường Supabase (chế độ khách) và khi mất mạng.
13. Giáo trình chính là Minna no Nihongo **bản mới**, nhưng mặc định hiện cả từ có nhãn `Bản cũ` (`editionFilterDefault: all`).

## Quy ước code
- Tên file: kebab-case; component: PascalCase; hàm thuần: camelCase.
- Test đặt cạnh file: `*.test.ts(x)`; e2e trong `tests/e2e`.
- Commit theo dạng: `feat(phase-6): flashcard mode`, `fix(parser): ...`, `content(n5): ...`.
````

---

## PHỤ LỤC B — Template Markdown cho bài mới

### B.1 `vocab.md`

```markdown
# 📚 <TÊN GIÁO TRÌNH> — TỪ VỰNG

> Giáo trình: ... · Phiên bản: ... · Cấu trúc bảng: 5 cột Kana | Kanji | Romaji | Nghĩa | Ghi chú

---

## 📖 BÀI 26 — <Tên bài>

### 1. Từ vựng chính

| Tiếng Nhật (Kana) | Hán tự (Kanji) | Cách đọc (Romaji) | Nghĩa tiếng Việt | Ghi chú |
|---|---|---|---|---|
| みます [しんぶんを～] | 見ます [新聞を～] | mimasu [shinbun o ~] | xem, kiểm tra | |
| いそがしい | 忙しい | isogashii | bận | |
| たいへん [な] | 大変 [な] | taihen [na] | vất vả | |

### 2. Từ vựng mở rộng ★ — <Chủ đề>

| Tiếng Nhật (Kana) | Hán tự (Kanji) | Cách đọc (Romaji) | Nghĩa tiếng Việt | Ghi chú |
|---|---|---|---|---|
| ... | ... | ... | ... | |
```

### B.2 `grammar.md`

````markdown
## 📘 BÀI 26 — <Tên bài>

### 1. V-る／V-ない／A-い／A-な な／N な + んです
**Ý nghĩa:** (giải thích lý do, hỏi thông tin)

**Giải thích & Cách dùng:**
- ...
  + ...

**Ví dụ minh họa:**
- **Tiếng Nhật:** どうして 遅れたんですか。 …バスが 来なかったんです。
  - **Romaji:** `Dōshite okureta n desu ka. ...Basu ga konakatta n desu.`
  - **Dịch nghĩa:** Sao bạn đến muộn vậy? …Vì xe buýt không đến.
````

### B.3 `kanji.md`

```markdown
## 🌸 CHƯƠNG 1: <tên chương> (2 chữ)

| Chữ Kanji | Âm Kun (Kunyomi) | Âm On (Onyomi) | Nghĩa Hán Việt & Ý nghĩa | Ví dụ |
|:---:|---|---|---|---|
| **会**<br>(6 nét) | あ・う | カイ, エ | HỘI (gặp; hội) | **• Âm Kun:** 会う (あう): gặp<br>**• Âm On:** 会社 (かいしゃ): công ty / 会議 (かいぎ): cuộc họp |
| **今**<br>(4 nét) | いま | コン, キン | KIM (bây giờ) | **• Âm Kun:** 今 (いま): bây giờ<br>**• Âm On:** 今月 (こんげつ): tháng này<br>**• Đọc đặc biệt:** 今日 (きょう): hôm nay |
```

---

## PHỤ LỤC C — Ví dụ dữ liệu JSON sau khi build

`public/content/mnn1/l05.json` (rút gọn):

```json
{
  "bookId": "mnn1",
  "lesson": 5,
  "title": "Di chuyển, Phương tiện & Ngày tháng",
  "vocab": [
    {
      "id": "mnn1-l05-7c1e09ab",
      "section": "main",
      "kana": "いきます",
      "kanji": "行きます",
      "romaji": "ikimasu",
      "meaning": "đi",
      "pos": "verb",
      "verbGroup": 1,
      "answers": { "kana": ["いきます"], "kanji": ["行きます"], "meaning": ["đi"] },
      "kanjiChars": ["行"],
      "homographKey": "いきます"
    },
    {
      "id": "mnn1-l05-a9d3f021",
      "section": "main",
      "kana": "あるいて",
      "kanji": "歩いて",
      "romaji": "aruite",
      "meaning": "đi bộ",
      "note": "Không dùng で",
      "pos": "other",
      "answers": { "kana": ["あるいて"], "kanji": ["歩いて"], "meaning": ["đi bộ"] },
      "kanjiChars": ["歩"],
      "homographKey": "あるいて"
    }
  ],
  "grammar": [
    {
      "id": "mnn1-l05-g-4b2e8c10",
      "order": 3,
      "title": "N (phương tiện) で 行きます / 来ます / 帰ります",
      "meaning": "Đi / Đến / Về bằng [phương tiện]",
      "supplemental": false,
      "examples": [
        {
          "jp": "電車で 行きます。",
          "romaji": "Densha de ikimasu.",
          "vi": "Tôi đi bằng tàu điện.",
          "chunks": ["電車で", "行きます。"]
        }
      ]
    }
  ]
}
```

`public/content/kanji-master-n5/ch09.json` (rút gọn):

```json
{
  "bookId": "kanji-master-n5",
  "chapter": 9,
  "kanji": [
    {
      "id": "kanji-行",
      "char": "行",
      "strokes": 6,
      "kun": ["い・く", "ゆ・く", "おこな・う"],
      "on": ["コウ", "ギョウ", "アン"],
      "hanViet": "HÀNH / HÀNG",
      "examples": [
        { "kind": "kun", "word": "行く", "reading": "いく", "meaning": "đi" },
        { "kind": "on", "word": "銀行", "reading": "ぎんこう", "meaning": "ngân hàng" }
      ],
      "relatedVocabIds": ["mnn1-l04-...", "mnn1-l05-7c1e09ab", "mnn1-l09-..."]
    }
  ]
}
```

---

> ✅ **Bước tiếp theo:** (1) Kiểm tra file `Danh_sach_doi_chieu_ban_moi.md` với sách bản mới (bắt đầu từ phần A). (2) Tôi cập nhật `MNN1_Tu_Vung.md` theo kết quả bạn gửi. (3) Bắt đầu **Phase 0** với Claude Code.
