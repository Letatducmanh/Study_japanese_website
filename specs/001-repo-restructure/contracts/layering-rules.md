# Contract: luật phụ thuộc giữa các lớp (ESLint)

**Feature**: `001-repo-restructure` (User Story 4, nhóm commit G7) | Nguồn: `docs/ARCHITECTURE.md` §4.2 (v2.1)

Hợp đồng ở đây là *hành vi bộ kiểm tra chung*: với mỗi cặp (file nguồn thuộc lớp A, import trỏ tới lớp B) trong bảng "cấm", `npm run lint` phải báo lỗi và chỉ rõ file, dòng. Cấu hình nằm ở `eslint.config.js`; không thêm plugin.

## Bảng lớp

| Lớp (đường dẫn) | Được import | KHÔNG được import |
|---|---|---|
| `src/domain/**` | `lib/` | `react`, `react-dom`, `react-router-dom`, `dexie`, `zustand`; `data/`, `features/`, `ui/`, `platform/`, `app/` |
| `src/data/**` | `domain/`, `lib/` | `features/`, `ui/`, `app/`; `react` (trừ `src/data/hooks/**`) |
| `src/ui/**` | `lib/`, `i18n/`, `platform/` | `features/`, `data/`, `domain/`, `app/` |
| `src/features/<A>/**` | `ui/`, `domain/`, `data/`, `platform/`, `lib/`, `i18n/` | `app/`; `features/<B>` với B ≠ A |
| `src/platform/**` | `lib/` | mọi lớp khác (khối này tồn tại sẵn, chưa có file) |
| `src/app/**` | mọi lớp | — |
| `src/lib/**`, `src/i18n/**` | — | (không có luật mới) |

Luật toàn cục (mọi file trong `src/`):

| Gói | Chỉ được import trong |
|---|---|
| `dexie` | `src/data/progress/dexie-repo.ts` (và file test cạnh nó nếu cần) |
| `@supabase/supabase-js` | `src/data/supabase-client.ts` |
| `@capacitor/*` | `src/platform/native/**` |

## Dạng cấu hình (phác thảo, không phải mã hoàn chỉnh)

```text
khối  files: src/domain/**   → paths:    react, react-dom, react-router-dom, dexie, zustand
                              patterns:  @/data/**, @/features/**, @/ui/**, @/platform/**, @/app/**
                                         **/data/**, **/features/**, **/ui/**, **/platform/**, **/app/**
khối  files: src/data/**     → patterns: @/features/**, @/ui/**, @/app/**  (+ dạng **/…/**)
                              paths:    react   — bỏ qua với files: src/data/hooks/**
khối  files: src/ui/**       → patterns: @/features/**, @/data/**, @/domain/**, @/app/**  (+ dạng **/…/**)
khối  files: src/features/** → patterns: @/app/**  (+ **/app/**)
khối  mỗi feature X (sinh từ danh sách thư mục src/features):
      files: src/features/X/** → patterns: @/features/<Y>/**  và  **/features/<Y>/**  cho mọi Y ≠ X
khối  files: src/platform/** → patterns: mọi lớp trừ lib
khối  toàn cục                → paths: dexie, @supabase/supabase-js ; patterns: @capacitor/*
                                 + khối ngoại lệ files: <đường dẫn được phép> → tắt gói tương ứng
```

Ghi chú cài đặt: dùng quy tắc `@typescript-eslint/no-restricted-imports` (của `typescript-eslint`, đã cài). Mẫu `**/data/**` bắt cả import tương đối đi qua một thư mục tên lớp. Các khối được đặt **trước** `eslintConfigPrettier` để thứ tự cấu hình không đổi.

## Ngoại lệ có tên (nợ kỹ thuật)

Mỗi mục là một khối `files:` liệt kê chính xác file, có bình luận ghi mã, lý do và nơi sửa (xem `plan.md` → Complexity Tracking). Chỉ tắt đúng luật bị vi phạm, không tắt cả khối.

| Mã | Files | Luật được nới |
|---|---|---|
| TD-1 | `src/domain/quiz/registry.ts` | `domain` import `react` (chỉ kiểu) |
| TD-2 | `src/features/weakness/WeaknessPage.tsx`, `src/features/weakness/MistakesPage.tsx` | `features/weakness` import `features/practice` |
| E-1 | `src/features/dev/**` | `features` import `app/` |

Quy tắc giữ nợ: thêm ngoại lệ mới cần ghi vào bảng này và vào `plan.md` của feature gây ra nó. Không thêm ngoại lệ bằng `// eslint-disable`.

## Ca kiểm (đầu vào → kết quả mong đợi)

Mỗi ca chạy bằng `npx eslint --stdin --stdin-filename <đường dẫn giả> < đoạn mã`. "Lỗi" = có thông báo `no-restricted-imports`. Ca 8–10 (hợp lệ) có dùng biến đã import để không dính `no-unused-vars`: chạy nguyên đoạn thì thoát mã 0. Ca 1–7 có thể kèm thêm lỗi `no-unused-vars`; chỉ thông báo `no-restricted-imports` được tính.

| # | `--stdin-filename` | Đoạn mã | Mong đợi |
|---|---|---|---|
| 1 | `src/domain/x.ts` | `import { useState } from 'react'` | **Lỗi** |
| 2 | `src/domain/x.ts` | `import { db } from '@/data/progress/dexie-repo'` | **Lỗi** |
| 3 | `src/data/x.ts` | `import { Button } from '@/ui/primitives'` | **Lỗi** |
| 4 | `src/ui/jp/x.tsx` | `import { vi } from '@/domain/types'` | **Lỗi** |
| 5 | `src/features/browse/x.tsx` | `import { s } from '@/features/practice/session-store'` | **Lỗi** |
| 6 | `src/features/browse/x.tsx` | `import { C } from '@/app/layouts/Container'` | **Lỗi** |
| 7 | `src/features/browse/x.tsx` | `import Dexie from 'dexie'` | **Lỗi** |
| 8 | `src/data/hooks/x.ts` | `import { useState } from 'react'; export const a = useState` | Không lỗi, thoát mã 0 |
| 9 | `src/features/browse/x.tsx` | `import { Button } from '@/ui/primitives'; export const a = Button` | Không lỗi, thoát mã 0 |
| 10 | `src/data/progress/dexie-repo.ts` | `import Dexie from 'dexie'; export const a = Dexie` | Không lỗi, thoát mã 0 |

Điều kiện đạt (SC-007): ca 1–7 đều báo lỗi, ca 8–10 không báo, và `npm run lint` trên toàn cây xanh với đúng ba ngoại lệ ở trên.
