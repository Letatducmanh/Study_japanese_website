# Tự học tiếng Nhật cùng Mạnh — Constitution

> Bản nháp để đưa vào `/speckit-constitution`. Sau khi chạy lệnh, nội dung chính thức nằm ở `.specify/memory/constitution.md`.
> Mọi `plan.md` phải có mục **Constitution Check** đối chiếu từng nguyên tắc dưới đây. Vi phạm phải ghi rõ ở bảng *Complexity Tracking* kèm lý do, nếu không thì plan bị loại.

## Core Principles

### I. Nội dung là dữ liệu (Content-as-Data)
- Từ vựng, ngữ pháp, Kanji CHỈ nằm trong `content/**/*.md`; cấp độ, giáo trình, bài học CHỈ khai báo trong `content/manifest.yaml`.
- Code KHÔNG được chứa từ tiếng Nhật của giáo trình, tên cấp độ ("N5"), số bài, số chương.
- `public/content/**` là file sinh tự động: không sửa tay, không commit.
- Đổi định dạng file `.md` phải cập nhật cùng lúc: parser + test + `docs/CONTENT_GUIDE.md`.
- *Lý do:* thêm N4, N3, N2 chỉ bằng cách thêm file, không sửa code.

### II. Local-first, không bắt đăng nhập
- App PHẢI dùng được đầy đủ khi chưa đăng nhập, khi mất mạng, và khi thiếu biến môi trường Supabase.
- Mọi ghi dữ liệu đi vào IndexedDB trước, rồi vào `outbox`; đồng bộ chỉ là lớp phía sau.
- UI và domain chỉ dùng interface `ProgressRepository`; chỉ `src/data/progress/dexie-repo.ts` được import Dexie.
- *Lý do:* người học mở link là học được ngay; tiến độ không mất khi mạng yếu.

### III. Kiến trúc phân lớp & điểm cắm
- Tuân theo luật phụ thuộc ở `docs/ARCHITECTURE.md` §4.2 (domain không import React; ui không import data; feature không import feature khác).
- Dạng câu hỏi mới = thư mục mới trong `src/features/practice/modes/` + `questionRegistry.register`. KHÔNG sửa session runner để thêm dạng.
- Khác biệt web/app CHỈ nằm trong `src/platform/`; chỉ `src/platform/native/` được import `@capacitor/*`.
- *Lý do:* thêm tính năng không làm vỡ tính năng cũ; web và app dùng chung một codebase.

### IV. Test trước cho logic (NON-NEGOTIABLE)
- Logic thuần (parser, validator, conjugation, quiz, distractor, mastery, srs, sync) PHẢI có unit test viết trước khi cài đặt, và test phải fail trước khi code.
- Mỗi feature có ít nhất một test e2e Playwright chạy ở viewport 360×740.
- `npm run check` (content:validate + typecheck + lint + test) PHẢI xanh trước mọi commit; CI chặn merge khi đỏ.
- TypeScript strict; cấm `any` (dùng `unknown` + Zod).

### V. Phát hiện điểm yếu là mục tiêu số một
- Mọi dạng bài PHẢI ghi `Attempt` gồm `itemId`, `skill`, `correct`, `responseMs`.
- ID nội dung ổn định theo `docs/reference/Ke_hoach_Website.md` §6.2; đổi cách sinh ID là thay đổi phá vỡ, bắt buộc có migration và `id-aliases.yaml`.
- Tính năng nào không giúp người học biết mình yếu ở đâu thì xếp sau tính năng giúp được.

### VI. Giao diện mobile-first, dễ tiếp cận, có bản sắc riêng
- Thiết kế từ màn hình 360px trước; vùng bấm ≥ 44×44px; làm bài được bằng một tay.
- Màu trạng thái luôn đi kèm biểu tượng (✓/✗) và chữ; tương phản chữ ≥ 4.5:1.
- Chỉ dùng design tokens trong `src/ui/tokens.css`; KHÔNG viết mã màu hex, font, bóng đổ trực tiếp trong component.
- Chuỗi giao diện tiếng Việt CHỈ nằm trong `src/i18n/vi.ts`.
- Text tiếng Nhật luôn có `lang="ja"`; furigana dùng `<ruby>`.
- Mọi việc giao diện PHẢI theo `docs/FRONTEND.md` (bao gồm danh sách "không làm").

### VII. Bảo mật & bản quyền
- Frontend chỉ dùng `VITE_SUPABASE_URL` và `VITE_SUPABASE_ANON_KEY`; tuyệt đối không có service role key trong repo.
- Mọi bảng Supabase bật RLS với điều kiện `user_id = auth.uid()` và có test RLS.
- Không đăng file scan, PDF, audio của sách; câu ví dụ chép nguyên văn phải được viết lại trước bản 1.0; ghi nguồn giáo trình ở trang `/about`.

## Additional Constraints

- **Stack cố định:** Vite + React + TypeScript strict + Tailwind CSS v4 + React Router + Zustand + Dexie + ts-fsrs + WanaKana + Zod + MiniSearch; Vitest + Testing Library + Playwright; Supabase; Vercel; Capacitor cho app. Thêm thư viện mới phải ghi lý do trong `research.md` của feature.
- **Giáo trình chuẩn:** Minna no Nihongo bản mới (第2版); từ có nhãn `Bản cũ` vẫn hiển thị mặc định (`editionFilterDefault: all`).
- **Chi phí:** chỉ dùng gói miễn phí (Vercel Hobby, Supabase Free, GitHub).
- **Hiệu năng:** Lighthouse mobile ≥ 90; JS ban đầu ≤ 200 KB gzip; nội dung tải lười theo bài.
- **Ngôn ngữ:** giao diện tiếng Việt; tài liệu spec/plan viết tiếng Việt; tên biến, hàm, file viết tiếng Anh.

## Development Workflow

1. Mọi thay đổi lớn hơn một sửa lỗi nhỏ (< 30 dòng, không đổi hành vi) đi qua: `/speckit-specify` → `/speckit-clarify` → `/speckit-plan` → `/speckit-tasks` → `/speckit-analyze` → `/speckit-implement`.
2. `spec.md` mô tả CÁI GÌ và TẠI SAO, không nêu công nghệ. `plan.md` mô tả LÀM THẾ NÀO và phải tham chiếu `docs/ARCHITECTURE.md` và (nếu có giao diện) `docs/FRONTEND.md`.
3. Mỗi feature một nhánh `NNN-ten-feature`, một Pull Request; xem bản Vercel Preview trên điện thoại trước khi merge.
4. Commit theo dạng `feat(NNN): ...`, `fix(scope): ...`, `content(n5): ...`, `docs: ...`.
5. Khi làm xong feature: đánh dấu hoàn thành trong `docs/SPECKIT_ROADMAP.md`.

## Governance

- Constitution này cao hơn mọi tài liệu khác trong repo. Khi `plan.md`, `tasks.md` hoặc yêu cầu trong chat mâu thuẫn với constitution, Claude Code phải dừng và hỏi lại.
- Sửa constitution: chạy lại `/speckit-constitution` với nội dung thay đổi; tăng version (MAJOR: bỏ/đổi nguyên tắc; MINOR: thêm nguyên tắc; PATCH: sửa câu chữ) và ghi ngày.
- Thứ tự ưu tiên tài liệu: constitution → `docs/ARCHITECTURE.md` → `docs/FRONTEND.md` → `specs/NNN/plan.md` → `docs/reference/*`.

**Version**: 1.0.0 | **Ratified**: 2026-10-29 | **Last Amended**: 2026-10-29
