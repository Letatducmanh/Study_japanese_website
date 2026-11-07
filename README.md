# Tự học tiếng Nhật cùng Mạnh

Website tự học và kiểm tra tiếng Nhật (N5 → N2), giúp người học phát hiện phần mình đang yếu.

Kế hoạch đầy đủ: [`docs/reference/Ke_hoach_Website.md`](./docs/reference/Ke_hoach_Website.md). Quy tắc làm việc cho Claude Code: [`CLAUDE.md`](./CLAUDE.md).

## Lệnh

```bash
npm install
npm run dev              # chạy local
npm run content:build    # md -> JSON trong public/content
npm run check            # validate nội dung + typecheck + lint + test
npm run test:e2e         # Playwright
```

## Cấu trúc

- `content/` — nội dung học (file `.md`) + `manifest.yaml`. Đây là nơi duy nhất cần sửa khi thêm bài/cấp độ mới.
- `scripts/content/` — pipeline build nội dung (md → JSON).
- `src/` — mã nguồn ứng dụng (xem README trong từng thư mục con), chia lớp theo `docs/ARCHITECTURE.md` §4.2:
  - `src/app/` — khung ứng dụng: router (`App.tsx`), `layouts/` (`AppShell`, `TopBar`, `BottomNav`, `Container`), trang "Sắp có".
  - `src/ui/` — giao diện dùng chung: `tokens.css` (màu, chữ), `primitives/`, `jp/` (chữ Nhật), `quiz/`, `signature/` (nhận diện "Tuyến tàu", chú chó Shiba).
  - `src/features/` — mỗi thư mục là một vùng tính năng (trang chủ, duyệt nội dung, luyện tập, điểm yếu, cài đặt...).
  - `src/domain/` — logic thuần (sinh câu hỏi, chấm điểm, độ thành thạo).
  - `src/data/` — tải nội dung, lưu tiến độ (Dexie), hook lấy dữ liệu (`hooks/`).
  - `src/lib/` — tiện ích thuần; `src/i18n/` — chuỗi tiếng Việt.
- `public/content/` — JSON sinh tự động, không sửa tay.
- `docs/` — tài liệu đang dùng (`ARCHITECTURE.md`, `FRONTEND.md`, `SPECKIT_ROADMAP.md`); `docs/reference/` — tài liệu tham chiếu và bản chụp theo ngày (kế hoạch gốc, thiết kế `design/`, `BACKLOG.md`, audit).
- `specs/` — spec của từng feature (Spec Kit).
