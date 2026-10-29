# CLAUDE.md — Tự học tiếng Nhật cùng Mạnh

Website + app tự học và tự kiểm tra tiếng Nhật theo bài (N5 → N2). Mục tiêu số một: chỉ ra người học yếu ở từ nào, bài nào, kỹ năng nào.
Chủ dự án (Mạnh) chưa có kinh nghiệm frontend: giải thích bằng lời thường, gửi ảnh chụp màn hình khi làm giao diện.

## Đọc trước khi làm (theo thứ tự ưu tiên)
1. `.specify/memory/constitution.md` — luật bất biến. Mâu thuẫn thì dừng lại hỏi.
2. `docs/ARCHITECTURE.md` — sơ đồ hệ thống, luật phụ thuộc giữa các lớp (§4.2), cấu trúc thư mục (§8).
3. `docs/FRONTEND.md` — **bắt buộc** trước mọi việc giao diện (web và app).
4. `specs/NNN-*/` — spec, plan, tasks của feature đang làm.
5. `docs/SPECKIT_ROADMAP.md` — thứ tự feature, trạng thái.
6. `docs/reference/Ke_hoach_Website.md` — chi tiết quy ước nội dung (§5), thuật toán (§6), màn hình (§7).

## Cách làm việc
- Việc lớn hơn sửa lỗi nhỏ: đi theo Spec Kit `/speckit-specify` → `/speckit-clarify` → `/speckit-plan` → `/speckit-tasks` → `/speckit-analyze` → `/speckit-implement`.
- Sửa lỗi nhỏ (< 30 dòng, không đổi hành vi): làm thẳng, vẫn chạy `npm run check`.
- Không tạo file `.md` mới ở gốc repo; tài liệu đặt theo bảng `docs/ARCHITECTURE.md` §8.2.

## Lệnh
- `npm run dev` — chạy local (http://localhost:5173)
- `npm run content:build` — content/*.md → public/content/*.json + content-report.md
- `npm run check` — validate nội dung + typecheck + lint + unit test (phải xanh trước commit)
- `npm run test:e2e` — Playwright (viewport 360px)
- `npm run ui:shot -- <route>` — chụp màn hình 360/768/1280, sáng/tối vào `.screens/`
- Deploy: tự động qua Vercel khi merge `main`. App: `npx cap sync` (từ spec 014)

## Nhắc nhanh các luật hay quên
- Không viết cứng nội dung tiếng Nhật, "N5", số bài trong code. Không sửa `public/content/**`.
- Chỉ `src/data/progress/dexie-repo.ts` import Dexie; chỉ `src/platform/native/` import `@capacitor/*`.
- Giao diện chỉ dùng token trong `src/ui/tokens.css`; chuỗi tiếng Việt trong `src/i18n/vi.ts`; chữ Nhật có `lang="ja"`.
- Dạng bài mới = thư mục mới trong `src/features/practice/modes/` + `register`.
- Không service role key; mọi bảng Supabase bật RLS.

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->