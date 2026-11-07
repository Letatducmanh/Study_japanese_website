# src/data

`content-loader.ts` (tải JSON nội dung theo bài) + `supabase-client.ts` (khởi tạo client Supabase từ biến môi trường). Xem thêm `progress/` và `sync/`.

- `hooks/use-async-data.ts` — hook lấy dữ liệu bất đồng bộ (trả `data`, `loading`, `error`), dùng ở các trang.
