# Tự học tiếng Nhật cùng Mạnh

Website tự học và kiểm tra tiếng Nhật (N5 → N2), giúp người học phát hiện phần mình đang yếu.

Kế hoạch đầy đủ: [`docs/Ke_hoach_Website.md`](./docs/Ke_hoach_Website.md). Quy tắc làm việc cho Claude Code: [`CLAUDE.md`](./CLAUDE.md).

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
- `src/` — mã nguồn ứng dụng (xem README trong từng thư mục con).
- `public/content/` — JSON sinh tự động, không sửa tay.
