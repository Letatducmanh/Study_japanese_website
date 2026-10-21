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
- Alias import: `@/` → `src/`.
