# ARCHITECTURE.md — Thiết kế hệ thống "Tự học tiếng Nhật cùng Mạnh"

> **Vị trí trong repo:** `docs/ARCHITECTURE.md`
> **Vai trò trong Spec Kit:** đây là thiết kế **cấp hệ thống**, dùng chung cho mọi feature. Mỗi `specs/NNN-*/plan.md` do `/speckit-plan` tạo ra phải **tuân theo** file này và chỉ mô tả phần riêng của feature đó.
> **Nguồn chi tiết:** quy ước dữ liệu, thuật toán, danh sách màn hình vẫn nằm ở `docs/reference/Ke_hoach_Website.md` (mục 3, 5, 6, 7). File này không chép lại, chỉ tham chiếu theo số mục (VD: *KH §6.4*).
> **Phiên bản:** 2.0 (29/10/2026) — thay cho mục 4 của kế hoạch v1.2.

---

## Mục lục

1. Mục tiêu & thuộc tính chất lượng
2. Sơ đồ ngữ cảnh (C4 cấp 1)
3. Sơ đồ container (C4 cấp 2)
4. Kiến trúc frontend phân lớp (C4 cấp 3)
5. Luồng dữ liệu chính
6. Mô hình dữ liệu
7. Triển khai: web + app
8. Cấu trúc thư mục chuẩn (Spec Kit + mã nguồn)
9. Bản đồ feature (specs) & thứ tự làm
10. Quy trình Spec Kit áp dụng cho dự án
11. Quyết định kiến trúc (ADR)

---

## 1. Mục tiêu & thuộc tính chất lượng

**Sản phẩm:** website + app tự học và **tự kiểm tra** tiếng Nhật theo bài (N5 = Minna no Nihongo 1 bản mới + Kanji Master N5), mục tiêu chính là **chỉ ra người học đang yếu ở từ nào, bài nào, kỹ năng nào**.

| Thuộc tính | Yêu cầu đo được | Thiết kế đáp ứng |
|---|---|---|
| Dùng ngay, không cần tài khoản | Mở link là làm bài được trong < 3 giây trên 4G | Chế độ khách, dữ liệu trên máy (IndexedDB) |
| Chạy offline | Tắt mạng vẫn học, vẫn lưu tiến độ | PWA cache nội dung + local-first |
| Mở rộng nội dung không sửa code | Thêm N4 = thêm file `.md` + 1 khai báo manifest | Content-as-data + pipeline build |
| Một codebase cho web và app | Cùng một thư mục `src/` build ra web (Vercel) và app (Android/iOS) | Vite + React + Capacitor, lớp `platform/` |
| Đồng bộ nhiều thiết bị | Học trên điện thoại, mở máy tính thấy cùng tiến độ | Outbox + Supabase (RLS) |
| Chi phí 0đ | Vercel Hobby + Supabase Free + GitHub | Không có server tự viết |
| Dễ bảo trì bằng Claude Code | Mỗi thay đổi đi qua spec → plan → tasks → test | Spec Kit + constitution + `npm run check` |

---

## 2. Sơ đồ ngữ cảnh (C4 cấp 1)

Ai và hệ thống nào tương tác với sản phẩm.

```mermaid
flowchart TB
  learner["Người học<br/>(điện thoại / máy tính)"]
  author["Mạnh — người soạn nội dung<br/>(viết file .md)"]
  claude["Claude Code<br/>(lập trình theo Spec Kit)"]

  system["Tự học tiếng Nhật cùng Mạnh<br/>Web PWA + App Android/iOS"]

  github["GitHub<br/>mã nguồn + nội dung + CI"]
  vercel["Vercel<br/>hosting web công khai"]
  supabase["Supabase<br/>đăng nhập + lưu tiến độ"]
  tts["Giọng đọc của thiết bị<br/>(Web Speech / TTS native)"]
  stores["Google Play / App Store<br/>(giai đoạn sau)"]

  learner -->|"học, làm bài, xem điểm yếu"| system
  author -->|"đẩy file .md"| github
  claude -->|"code, test, commit"| github
  github -->|"tự build & deploy"| vercel
  vercel -->|"phục vụ web"| system
  system <-->|"đăng nhập, đồng bộ"| supabase
  system -->|"phát âm"| tts
  github -.->|"build app"| stores
  stores -.->|"cài app"| learner
```

---

## 3. Sơ đồ container (C4 cấp 2)

Các khối chạy độc lập và dữ liệu đi giữa chúng.

```mermaid
flowchart LR
  subgraph repo["Repo GitHub"]
    md["content/**/*.md<br/>+ manifest.yaml + overrides/*.yaml"]
    pipe["Content pipeline (Node, build-time)<br/>parse → validate → enrich"]
    json[("public/content/**.json<br/>sinh tự động")]
    report["content-report.md"]
    md --> pipe --> json
    pipe --> report
  end

  subgraph client["Ứng dụng phía người dùng — một bundle React"]
    shell["App shell<br/>router, layout, theme"]
    feat["Features<br/>browse, practice, review, weakness, stats, auth"]
    domain["Domain (TS thuần)<br/>quiz engine, mastery, srs, conjugation"]
    data["Data<br/>content-loader, progress repo, sync"]
    plat["Platform adapters<br/>tts, haptics, storage, share"]
    idb[("IndexedDB / Dexie<br/>attempts, mastery, srsCards, mistakes, outbox")]
    shell --> feat --> domain
    feat --> data --> idb
    feat --> plat
    data --> domain
  end

  subgraph hosts["Nơi chạy bundle"]
    web["Trình duyệt / PWA<br/>(Vercel CDN)"]
    native["App Capacitor<br/>Android / iOS WebView"]
  end

  sb[("Supabase<br/>Auth + Postgres + RLS")]

  json -->|"tải lười theo bài"| data
  client --- web
  client --- native
  data <-->|"outbox đẩy lên / pull về"| sb
  feat <-->|"email + mật khẩu / Google"| sb
```

**Điểm mấu chốt:** web và app **không phải hai dự án**. Capacitor chỉ bọc cùng bundle `dist/` vào một vỏ native; khác biệt nền tảng (giọng đọc, rung, chia sẻ, deep link) được cô lập trong `src/platform/`.

---

## 4. Kiến trúc frontend phân lớp (C4 cấp 3)

### 4.1 Các lớp và chiều phụ thuộc

```mermaid
flowchart TB
  app["src/app<br/>router, providers, layouts"]
  features["src/features/*<br/>màn hình + hook theo tính năng"]
  ui["src/ui<br/>design system: primitives, jp, quiz, signature"]
  domain["src/domain<br/>logic thuần, không React"]
  data["src/data<br/>content, progress, sync, supabase"]
  platform["src/platform<br/>web/ và native/ implementations"]
  lib["src/lib + src/i18n<br/>tiện ích, chuỗi tiếng Việt"]

  app --> features
  app --> ui
  features --> ui
  features --> domain
  features --> data
  features --> platform
  data --> domain
  ui --> lib
  features --> lib
  domain --> lib
  data --> lib
  platform --> lib
```

### 4.2 Luật phụ thuộc (bắt buộc, kiểm bằng ESLint `no-restricted-imports`)

| Lớp | Được import | **Không** được import |
|---|---|---|
| `domain/` | `lib/` | React, Dexie, Supabase, `data/`, `features/`, `ui/`, `platform/` |
| `data/` | `domain/`, `lib/` | React component, `features/`, `ui/` |
| `ui/` | `lib/`, `i18n/` | `features/`, `data/`, `domain/` (chỉ nhận dữ liệu qua props) |
| `features/A` | `ui/`, `domain/`, `data/`, `platform/`, `lib/` | `features/B` (dùng chung thì đưa xuống `ui/` hoặc `domain/`) |
| `platform/` | `lib/` | mọi lớp khác; chỉ file trong `platform/native/` được import `@capacitor/*` |
| Ngoài `data/progress/dexie-repo.ts` | — | `dexie` |
| Ngoài `data/supabase-client.ts` | — | `@supabase/supabase-js` |

### 4.3 Hai "điểm cắm" để mở rộng

1. **Dạng câu hỏi mới** = thư mục mới `src/features/practice/modes/<id>/` + `questionRegistry.register(...)` (*KH §6.4*). Session runner không sửa.
2. **Nền tảng mới / API thiết bị mới** = thêm interface trong `src/platform/types.ts` + hai bản cài `web/` và `native/`. Feature chỉ gọi `platform.tts.speak(...)`.

---

## 5. Luồng dữ liệu chính

### 5.1 Từ file Markdown tới màn hình

```mermaid
flowchart LR
  a["Mạnh sửa<br/>content/n5/mnn1/vocab.md"] --> b["git push"]
  b --> c["CI: npm run check<br/>(content:validate + typecheck + lint + test)"]
  c -->|"lỗi"| x["PR bị chặn<br/>báo số dòng lỗi"]
  c -->|"xanh"| d["Vercel: content:build + build"]
  d --> e["public/content/mnn1/l05.json"]
  e --> f["Người học mở Bài 5<br/>content-loader tải l05.json"]
  f --> g["PWA cache lại<br/>lần sau dùng offline"]
```

### 5.2 Trả lời một câu hỏi (luồng lõi phát hiện điểm yếu)

```mermaid
sequenceDiagram
  autonumber
  actor U as Người học
  participant V as QuestionView (features/practice)
  participant S as Session store (Zustand)
  participant Q as QuestionType (domain/quiz)
  participant M as Mastery (domain/mastery)
  participant R as ProgressRepository (data/progress)
  participant O as Outbox + SyncService (data/sync)

  U->>V: chọn đáp án / gõ / lật thẻ
  V->>S: submit(answer)
  S->>Q: grade(question, answer)
  Q-->>S: { correct, expected }
  S->>R: recordAttempt(attempt)
  R->>M: tính score mới (item, skill)
  M-->>R: mastery mới
  R->>R: ghi attempts + mastery + mistakes (IndexedDB)
  R->>O: thêm bản ghi vào outbox
  S-->>V: phản hồi đúng/sai + đáp án đúng
  V-->>U: màu + biểu tượng ✓/✗ + rung nhẹ
  Note over O: chỉ khi đã đăng nhập và có mạng
  O-)O: đẩy outbox theo lô lên Supabase
```

### 5.3 Trạng thái đồng bộ

```mermaid
stateDiagram-v2
  [*] --> Khach: mở app lần đầu
  Khach --> HoiGop: đăng nhập trên máy đã có tiến độ
  Khach --> DaDongBo: đăng nhập trên máy trống
  HoiGop --> DangDay: đồng ý gộp
  HoiGop --> DangKeo: không gộp
  DaDongBo --> CoThayDoi: có lượt trả lời mới
  CoThayDoi --> DangDay: có mạng
  CoThayDoi --> ChoMang: mất mạng
  ChoMang --> DangDay: có mạng lại
  DangDay --> DangKeo: đẩy xong
  DangKeo --> DaDongBo: pull theo updated_at xong
  DaDongBo --> Khach: đăng xuất
```

Nhãn hiển thị cho người dùng (trang Tài khoản): *Khach* → "Đang lưu trên máy này", *ChoMang* → "Chưa đồng bộ — sẽ tự gửi khi có mạng", *DaDongBo* → "Đã đồng bộ lúc 10:32".

---

## 6. Mô hình dữ liệu

### 6.1 Dữ liệu nội dung (chỉ đọc, sinh lúc build) — chi tiết kiểu ở *KH §6.1*

```mermaid
erDiagram
  LEVEL ||--o{ BOOK : "gồm"
  BOOK ||--o{ LESSON : "gồm"
  LESSON ||--o{ VOCAB_ITEM : "có"
  LESSON ||--o{ GRAMMAR_POINT : "có"
  GRAMMAR_POINT ||--o{ GRAMMAR_EXAMPLE : "có"
  BOOK ||--o{ KANJI_ITEM : "chương"
  KANJI_ITEM }o--o{ VOCAB_ITEM : "relatedVocabIds"

  LEVEL { string id "N5" }
  BOOK { string id "mnn1, kanji-master-n5" string type "textbook | kanji" }
  LESSON { int number "1..25" string title }
  VOCAB_ITEM { string id "mnn1-l05-hash8" string kana string kanji string meaning string pos string section }
  GRAMMAR_POINT { string id string title bool supplemental }
  GRAMMAR_EXAMPLE { string jp string vi string chunks }
  KANJI_ITEM { string id "kanji-外" int strokes string hanViet }
```

### 6.2 Dữ liệu tiến độ (ghi được) — IndexedDB và Supabase cùng hình dạng

```mermaid
erDiagram
  USER ||--o{ ATTEMPT : "trả lời"
  USER ||--o{ MASTERY : "có"
  USER ||--o{ SRS_CARD : "có"
  USER ||--o{ MISTAKE : "có"
  USER ||--|| PROFILE : "có"

  ATTEMPT { uuid id PK string item_id string skill string mode bool correct int response_ms bigint ts }
  MASTERY { string item_id PK string skill PK float score int attempts int streak bigint updated_at }
  SRS_CARD { string item_id PK json card bigint due bigint updated_at }
  MISTAKE { string item_id PK bigint added_ts bigint removed_at }
  PROFILE { uuid id PK string display_name json settings }
```

- Khóa nối giữa tiến độ và nội dung **chỉ là `item_id` ổn định** (*KH §6.2*). Sửa nghĩa trong `.md` không làm mất tiến độ.
- Ở máy: thêm bảng `outbox`, `sessions`, `settings` (*KH §6.7*). Trên Supabase mọi bảng có `user_id` + RLS `user_id = auth.uid()` (*KH §6.8*).

---

## 7. Triển khai: web + app

```mermaid
flowchart LR
  dev["Nhánh feature<br/>(Spec Kit tạo: 00N-ten-feature)"] --> pr["Pull Request"]
  pr --> ci["GitHub Actions<br/>check + e2e (Playwright, viewport 360px)"]
  ci --> preview["Vercel Preview URL<br/>xem thử trên điện thoại"]
  pr -->|"merge"| main["main"]
  main --> prod["Vercel Production<br/>study-japanese-website.vercel.app"]
  main -.->|"khi phát hành app"| cap["npx cap sync<br/>build Android Studio / Xcode"]
  cap -.-> play["Google Play (Android)"]
  cap -.-> ios["App Store (iOS, cần máy Mac)"]
```

| Mục tiêu | Lệnh | Ghi chú |
|---|---|---|
| Web dev | `npm run dev` | http://localhost:5173 |
| Web production | tự động khi merge `main` | Vercel chạy `npm run content:build && npm run build` |
| App Android | `npm run build && npx cap sync android && npx cap open android` | Cần Android Studio. Làm ở spec *Native app* |
| App iOS | `npm run build && npx cap sync ios && npx cap open ios` | Cần máy Mac + Xcode + tài khoản Apple Developer |

---

## 8. Cấu trúc thư mục chuẩn (Spec Kit + mã nguồn)

> Đây là phần sửa tình trạng "file lộn xộn". **Mỗi loại file chỉ có một chỗ ở.** Bảng 8.2 trả lời câu hỏi "file này đặt ở đâu?".

### 8.1 Cây thư mục

```
tu-hoc-tieng-nhat-cung-manh/
├── CLAUDE.md                     # Ngắn: trỏ tới constitution + docs + lệnh. Không chứa thiết kế chi tiết
├── README.md                     # Cho con người: chạy dự án thế nào
│
├── .specify/                     # ⚙️ Spec Kit tạo — KHÔNG sửa tay trừ constitution
│   ├── memory/
│   │   └── constitution.md       # ⭐ Luật bất biến của dự án (/speckit-constitution)
│   ├── templates/                # mẫu spec/plan/tasks của Spec Kit
│   └── scripts/                  # script tạo nhánh, tạo thư mục spec
├── .claude/
│   ├── skills/speckit-*/         # (hoặc commands/) — lệnh /speckit-* do Spec Kit cài
│   └── settings.json
│
├── specs/                        # 📋 Mỗi feature một thư mục, đánh số theo thứ tự tạo
│   ├── 001-repo-restructure/
│   │   ├── spec.md               # CÁI GÌ & TẠI SAO (không có công nghệ)
│   │   ├── plan.md               # LÀM THẾ NÀO (tuân theo docs/ARCHITECTURE.md)
│   │   ├── research.md           # (tùy) so sánh lựa chọn
│   │   ├── data-model.md         # (tùy) kiểu dữ liệu riêng của feature
│   │   ├── contracts/            # (tùy) interface, schema
│   │   ├── quickstart.md         # cách tự kiểm tra feature
│   │   ├── checklists/           # (tùy) /speckit-checklist
│   │   └── tasks.md              # danh sách việc (/speckit-tasks)
│   ├── 002-content-pipeline/
│   └── ...
│
├── docs/                         # 📚 Tài liệu cấp hệ thống, dùng chung mọi feature
│   ├── ARCHITECTURE.md           # file này
│   ├── FRONTEND.md               # hướng dẫn xây giao diện web + app cho Claude Code
│   ├── CONTENT_GUIDE.md          # cách soạn file .md nội dung (= KH §5 + Phụ lục B)
│   ├── SPECKIT_ROADMAP.md        # thứ tự feature + prompt mẫu cho /speckit-*
│   └── reference/
│       ├── Ke_hoach_Website.md   # kế hoạch gốc v1.2 (tham chiếu, không sửa nữa)
│       └── Bao_cao_kiem_tra_du_lieu_N5.md
│
├── content/                      # ✍️ NƠI DUY NHẤT soạn nội dung học
│   ├── manifest.yaml
│   ├── n5/mnn1/{vocab,grammar}.md
│   ├── n5/kanji-master-n5/kanji.md
│   └── overrides/{verb-groups,pos,id-aliases}.yaml
│
├── scripts/content/              # pipeline build nội dung (Node/TS)
│   ├── parse-vocab.ts  parse-grammar.ts  parse-kanji.ts
│   ├── validate.ts  enrich.ts  ids.ts  build.ts
│
├── src/                          # 💻 Mã ứng dụng — chi tiết trong docs/FRONTEND.md §4
│   ├── app/        # router, providers, layouts
│   ├── features/   # browse, practice(+modes/), review, weakness, stats, auth, settings
│   ├── ui/         # design system: tokens.css, primitives/, jp/, quiz/, signature/
│   ├── domain/     # types, schemas, quiz/, mastery/, srs/, conjugation/
│   ├── data/       # content-loader, progress/, sync/, hooks/, supabase-client.ts
│   ├── platform/   # types.ts, web/, native/, index.ts
│   ├── lib/        # kana.ts, normalize.ts, rng.ts, format.ts
│   └── i18n/       # vi.ts
│
├── public/
│   ├── content/                  # 🤖 SINH TỰ ĐỘNG — không sửa tay, không commit (gitignore)
│   ├── icons/  manifest.webmanifest
├── tests/e2e/                    # Playwright (unit test đặt cạnh file: *.test.ts)
├── supabase/migrations/          # SQL + RLS
├── android/  ios/                # 📱 Capacitor tạo ở spec Native app — không sửa tay trừ cấu hình native
├── capacitor.config.ts
├── vercel.json  .env.example  package.json  vite.config.ts  tsconfig.json  eslint.config.js
└── .github/workflows/ci.yml
```

### 8.2 "File này đặt ở đâu?"

| Bạn có… | Đặt ở | Ai tạo |
|---|---|---|
| Luật áp dụng cho **mọi** feature (VD: không viết cứng N5) | `.specify/memory/constitution.md` | `/speckit-constitution` |
| Ý tưởng một tính năng mới | `specs/NNN-ten/spec.md` | `/speckit-specify` |
| Cách làm kỹ thuật của tính năng đó | `specs/NNN-ten/plan.md` | `/speckit-plan` |
| Danh sách việc cần code | `specs/NNN-ten/tasks.md` | `/speckit-tasks` |
| Thiết kế dùng chung (sơ đồ, lớp, thư mục) | `docs/ARCHITECTURE.md` | sửa tay / nhờ Claude |
| Quy tắc giao diện, màu, font, component | `docs/FRONTEND.md` | sửa tay / nhờ Claude |
| Từ vựng, ngữ pháp, Kanji | `content/<level>/<book>/*.md` | Mạnh |
| Tài liệu cũ, báo cáo, ghi chú một lần | `docs/reference/` | — |
| Ghi chú nháp, thử nghiệm | **không commit**, hoặc `docs/reference/notes/` | — |

**Không được có:** file `.md` lẻ ở gốc repo (ngoài `CLAUDE.md`, `README.md`), thư mục `old/`, `backup/`, `new/`, file `*-copy.tsx`, `*-v2.tsx`. Bản cũ đã có git lưu.

---

## 9. Bản đồ feature (specs) & thứ tự làm

Mỗi ô là **một lần chạy trọn quy trình Spec Kit** (specify → plan → tasks → implement). Số thứ tự do script Spec Kit tự cấp theo thứ tự bạn tạo; giữ đúng thứ tự dưới đây thì số sẽ khớp.

```mermaid
flowchart TB
  s001["001 repo-restructure<br/>dọn cấu trúc, giữ web chạy"]
  s002["002 content-pipeline<br/>parse + validate + enrich + chia động từ"]
  s003["003 app-shell<br/>router, layout, design tokens, deploy, CI"]
  s004["004 content-browsing<br/>bài học, ngữ pháp, Kanji, tìm kiếm, 🔊"]
  s005["005 local-progress<br/>Dexie repo, mastery, xuất/nhập"]
  s006["006 quiz-engine-flashcard<br/>registry, session, distractor, Flashcard"]
  s007["007 mcq-and-results<br/>trắc nghiệm 6 hướng, màn kết quả"]
  s008["008 vocab-modes<br/>gõ, nghe, chính tả, ghép cặp, đúng/sai, điền từ"]
  s009["009 grammar-kanji-quiz<br/>trợ từ, sắp xếp câu, chia động từ, Kanji"]
  s010["010 weakness-mistakes ✅ MVP<br/>bài tổng hợp, điểm yếu, sổ lỗi sai, bản đồ tuyến"]
  s011["011 accounts-sync<br/>Supabase Auth + outbox sync"]
  s012["012 srs-review<br/>ôn tập hằng ngày ts-fsrs"]
  s013["013 stats-pwa-release ✅ 1.0<br/>thống kê, PWA offline, a11y, bản quyền"]
  s014["014 native-app<br/>Capacitor Android/iOS, TTS native, deep link"]

  s001 --> s002 --> s003 --> s004
  s003 --> s005 --> s006 --> s007 --> s008 --> s009 --> s010
  s004 --> s006
  s010 --> s011 --> s012 --> s013 --> s014
```

| Spec | Ứng với Phase cũ (KH §10) | Dấu hiệu hoàn thành chính |
|---|---|---|
| 001 repo-restructure | — (mới) | Cây thư mục khớp §8.1, web trên Vercel vẫn chạy y như cũ |
| 002 content-pipeline | Phase 1 + 2 | 1.020 từ chính + 272 mở rộng, 132 mẫu ngữ pháp, 119 + 15 Kanji; test chia động từ 100% |
| 003 app-shell | Phase 0 (phần còn thiếu) + 3 | Menu sinh từ manifest; `/b/mnn1/5` mở thẳng không 404; tokens trong `ui/tokens.css` |
| 004 content-browsing | Phase 4 | Tìm "nuoc ngoai" ra 外国 |
| 005 local-progress | Phase 5 | Xuất → xóa → nhập lại → dữ liệu như cũ |
| 006 quiz-engine-flashcard | Phase 6 | Flashcard Bài 1, tải lại trang mastery > 0 |
| 007 mcq-and-results | Phase 7 | Sai 2/10 → "Làm lại câu sai" đúng 2 câu |
| 008 vocab-modes | Phase 8 | `gaikoku` → がいこく chấm đúng |
| 009 grammar-kanji-quiz | Phase 9 | Mỗi bài ngữ pháp sinh ≥ 5 câu trợ từ |
| 010 weakness-mistakes | Phase 10 | Sai nhiều Bài 3 → Bài 3 đỏ và đứng đầu điểm yếu |
| 011 accounts-sync | Phase 11 | Hai thiết bị cùng mastery; RLS chặn tài khoản khác |
| 012 srs-review | Phase 12 | Thẻ *Quên* quay lại sớm hơn thẻ *Dễ* |
| 013 stats-pwa-release | Phase 13 | Cài lên màn hình chính, offline vẫn học |
| 014 native-app | Phase 14 (một phần) | APK cài được, phát âm chạy trên Android |

Prompt mẫu cho từng spec: xem `docs/SPECKIT_ROADMAP.md`.

---

## 10. Quy trình Spec Kit áp dụng cho dự án

```mermaid
flowchart LR
  c["/speckit-constitution<br/>làm 1 lần"] --> sp["/speckit-specify<br/>CÁI GÌ & TẠI SAO"]
  sp --> cl["/speckit-clarify<br/>(nên làm) hỏi chỗ mơ hồ"]
  cl --> pl["/speckit-plan<br/>LÀM THẾ NÀO"]
  pl --> ck["/speckit-checklist<br/>(tùy) kiểm chất lượng yêu cầu"]
  ck --> tk["/speckit-tasks<br/>chia việc"]
  tk --> an["/speckit-analyze<br/>soát mâu thuẫn spec↔plan↔tasks"]
  an --> im["/speckit-implement<br/>code theo tasks"]
  im --> gate{"npm run check<br/>+ quickstart.md đạt?"}
  gate -->|"chưa"| im
  gate -->|"đạt"| pr["PR → Vercel Preview → merge"]
  pr --> sp
```

**Cổng chất lượng (gate) giữa các bước — bạn là người duyệt:**

| Sau bước | Bạn kiểm tra | Nếu sai |
|---|---|---|
| specify | Đọc `spec.md`: có đúng điều bạn muốn? Không có tên thư viện/công nghệ? Có tiêu chí "xong" đo được? | Sửa bằng lời rồi chạy lại `/speckit-clarify` |
| plan | `plan.md` có mục "Constitution Check" đều đạt? Có dùng đúng lớp/thư mục ở §4, §8? | Nhắc: "plan phải tuân theo docs/ARCHITECTURE.md §4.2" |
| tasks | Task có đường dẫn file cụ thể? Có task viết test trước? | Chạy lại `/speckit-tasks` |
| implement | `npm run check` xanh, mở Preview trên điện thoại thử | Không merge |

---

## 11. Quyết định kiến trúc (ADR)

| # | Quyết định | Lý do | Hệ quả |
|---|---|---|---|
| ADR-001 | **Local-first**: IndexedDB là nguồn chính, Supabase chỉ để đồng bộ | Offline, nhanh, không bắt đăng nhập | Cần outbox + giải quyết xung đột "bản mới hơn thắng" |
| ADR-002 | **Content-as-data**: nội dung chỉ ở `content/*.md`, build ra JSON | Thêm N4 không sửa code; Mạnh tự soạn được | Phải có validator chặt + CI |
| ADR-003 | **Một codebase, Capacitor cho app** (không React Native) | Đã có web React + Vite chạy trên Vercel; người mới chỉ cần học một cách làm; IndexedDB/Tailwind dùng lại 100% | Cảm giác "native" kém RN một chút → bù bằng safe-area, haptics, chuyển trang mượt; TTS Android phải dùng plugin native |
| ADR-004 | **Supabase** cho Auth + Postgres + RLS | Miễn phí, có sẵn đăng ký/quên mật khẩu/Google | Gói Free tạm dừng khi lâu không dùng → app phải chạy được khi Supabase không phản hồi |
| ADR-005 | **Design tokens một chỗ** (`src/ui/tokens.css`, Tailwind v4 `@theme`) | Tránh mã màu rải rác, giữ nhận diện riêng | Mọi component chỉ dùng class token, không dùng mã hex trực tiếp |
| ADR-006 | **Spec Kit** cho mọi thay đổi lớn hơn sửa lỗi nhỏ | Người làm chưa có kinh nghiệm frontend → cần spec rõ trước khi code | Sửa lỗi nhỏ (< 30 dòng) được làm thẳng, nhưng vẫn phải `npm run check` |

Khi đổi một quyết định ở đây: thêm dòng ADR mới (không xóa dòng cũ), cập nhật constitution nếu quyết định đó là luật bất biến.
