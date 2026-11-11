# Quickstart: kiểm chứng speakable-text

Tiền đề: đang ở nhánh `003-speakable-text`; đã `npm install`.

## A. Cổng chất lượng (sau mỗi story)

```bash
npm run check     # content:validate + typecheck + lint + test, phải xanh
npm run build     # tsc -b && vite build, phải xanh
```

Kết quả mong đợi Story 1: các test mới (`src/lib/speakable.test.ts`, `scripts/content/speakable-content.test.ts`, `tts.test.ts`, `SpeakButton.test.tsx`, `dictation.test.tsx`) xanh. `speakable-content.test.ts` chạy pipeline ra thư mục tạm nên mất vài giây (timeout 30 s).

## B. Vòng đỏ → xanh (Constitution IV)

Trước khi viết mã, chạy riêng các file test mới và thấy ĐỎ, chép kết quả vào `evidence.md`:

```bash
npx vitest run src/lib/speakable.test.ts scripts/content/speakable-content.test.ts src/lib/tts.test.ts src/ui/jp/SpeakButton.test.tsx src/features/practice/modes/dictation/dictation.test.tsx
```

Story 2: thêm `src/features/practice/modes/mcq/McqComponent.test.tsx` và `mcq.test.ts`.

Nếu một test dự kiến đỏ mà xanh ngay thì dừng và hỏi.

## C. Kiểm tra theo spec

| Spec | Cách kiểm | Kết quả mong đợi |
|---|---|---|
| SC-001 | `npx vitest run src/lib/speakable.test.ts` | mọi ví dụ FR-002, FR-004 đúng |
| SC-002 | cùng file | mọi ví dụ FR-005 đọc y nguyên |
| SC-003 | `npx vitest run scripts/content/speakable-content.test.ts` | 2.378 chuỗi: 0 ký tự cấm; danh sách ngoại lệ rỗng |
| SC-004 | `npx vitest run src/features/practice/modes/dictation/dictation.test.tsx` | `grade()` và tập đáp án không đổi |
| SC-005 | không file hiển thị nào bị sửa: `git diff --stat staging -- src/ui src/features` chỉ liệt kê file ở plan | 0 thay đổi ở chuỗi hiển thị |
| SC-006 | `npx vitest run src/features/practice/modes/mcq` | 6 hướng đúng bảng hiện/ẩn |
| SC-007 | mở `.screens/tts-listen.html` bằng Chrome/Edge và nghe | do chủ dự án xác nhận |

## D. Kiểm tra vùng cấm (cuối mỗi story)

```bash
git diff staging --name-status | grep "scripts/content/speakable-content.test.ts"   # phải là A (thêm mới)
git diff staging --name-only | grep -vxF "scripts/content/speakable-content.test.ts" | grep -E "domain/quiz/(registry|grading)|session|scripts/content|^content/|^public/content" || echo "OK: không đụng vùng cấm"
```

Kết quả mong đợi: `OK: không đụng vùng cấm`.

## E. E2E (cuối Story 2)

```bash
npm run build && npm run test:e2e
```

Kết quả mong đợi: `speakable.spec.ts` xanh (bấm loa ở một ví dụ ngữ pháp hỏi–đáp ghi chuỗi đã làm sạch; ở `mcq-vi-jp` không có nút loa ở đề). Q-2 (`browse.spec.ts`) đỏ như trước, là nợ đã biết; không test e2e nào khác đỏ.

## F. Nghe thật

`npm run dev`, mở http://localhost:5173/b/mnn1/1 và bấm loa ở một từ có `[ ]`/`～`, rồi tab Ngữ pháp của Bài 14 (danh sách `→`). Nghe thấy chuỗi đọc như bảng ở [contracts/speakable-contract.md](contracts/speakable-contract.md). Cần máy có giọng tiếng Nhật.
