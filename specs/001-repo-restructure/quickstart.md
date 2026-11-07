# Quickstart: kiểm chứng feature `001-repo-restructure`

Tài liệu này là hướng dẫn *chạy kiểm chứng*, không phải hướng dẫn cài đặt. Chạy từ thư mục gốc repo (`Source code/Code`), trên nhánh `001-repo-restructure`.

## Điều kiện

- `npm ci` đã chạy; Chromium của Playwright đã cài (có sẵn trong `%LOCALAPPDATA%\ms-playwright`).
- Cây làm việc sạch trước khi bắt đầu một nhóm (`git status --short` rỗng).
- Nhóm G0 đã tạo `verify-baseline.mjs`, `shoot.mjs` và `tests/e2e/repo-restructure.spec.ts`, đã lấy mốc "trước" (test cả hai cách, build, validate, lint, e2e, 36 ảnh, smoke, progress).

## Mốc và cổng kiểm

- **Mốc so sánh**: bảng "Mốc so sánh" ở `spec.md` (User Story 1). Không chép lại ở đây.
- **Cổng kiểm** (bốn lệnh, cờ, kỳ vọng, quy tắc dừng): **chỉ định nghĩa ở `spec.md` FR-011**. Quickstart chỉ dẫn chiếu.

## 1. Cổng sau mỗi nhóm commit (G1–G7)

```bash
node specs/001-repo-restructure/verify-baseline.mjs
```

Công cụ chạy đúng bốn lệnh của FR-011 và in `PASS`/`FAIL`. Thêm `--also-default` để in kèm kết quả `npm test` chạy mặc định (chỉ để theo dõi chập chờn của `pipeline.test.ts`, không dùng làm điều kiện).

Nếu có `FAIL`: **dừng và báo Mạnh**; không sang nhóm sau. Sửa hoặc `git revert` nhóm vừa làm.

## 2. Kiểm tra vị trí file (User Story 2)

```bash
# gốc repo: chỉ CLAUDE.md và README.md là .md được commit
git ls-files '*.md' | grep -v '/'

# 43 hàng ánh xạ trong specs/001-repo-restructure/data-model.md: "Từ" không còn, "Đến" tồn tại
# (đọc từng hàng của bảng; hàng #2 là thư mục design/ -> docs/reference/design/)

# ba file loại trừ vẫn ở src/lib/
test -e src/lib/tts.ts -a -e src/lib/theme.ts -a -e src/lib/use-theme.ts && echo OK-loai-tru
```

Kết quả mong đợi: dòng đầu chỉ in `CLAUDE.md` và `README.md`; mọi hàng trong 43 hàng đạt cả hai điều kiện; `OK-loai-tru`.

Lịch sử (SC-008): chọn vài file dời, `git log --follow --oneline -- src/ui/jp/Ruby.tsx` phải thấy nhiều hơn một commit. Đếm tổng: `git diff --stat -M dca3700...HEAD` — số file "đổi tên" (`=>`) phải ≥ 95% trong 43 hàng.

## 3. Không còn tham chiếu cũ (User Story 3)

```bash
# tên cũ không còn trong mã
grep -rnE "@/components|lib/use-async-data|lib/format-duration|lib/heatmap|features/(kanji|search|about)/|KanjiDetailPage|from './index.css'" src

# link/đường dẫn cũ trong tài liệu đang dùng
grep -nE "docs/Ke_hoach_Website\.md|src/components|src/index\.css|design/(SPEC|AUDIT)|BACKLOG\.md" \
  README.md CLAUDE.md docs/ARCHITECTURE.md docs/FRONTEND.md docs/SPECKIT_ROADMAP.md src/*/README.md
```

Mong đợi: lệnh đầu không in gì; lệnh sau chỉ in những câu nói về *lịch sử/đã dời* (VD "dời từ gốc repo"), không còn đường dẫn cũ như một đường dẫn đang dùng. Không kiểm `docs/reference/**` (bản chụp lịch sử, SC-005).

Mở `README.md` và bấm từng link: link kế hoạch phải mở `docs/reference/Ke_hoach_Website.md`; link `CLAUDE.md` mở được; mục "Cấu trúc" khớp cây thư mục mới.

## 4. Luật phụ thuộc (User Story 4, sau G7)

```bash
npm run lint        # phải xanh

# 10 ca kiểm trong specs/001-repo-restructure/contracts/layering-rules.md
echo "import { useState } from 'react'" | npx eslint --stdin --stdin-filename src/domain/x.ts
echo "import { db } from '@/data/progress/dexie-repo'" | npx eslint --stdin --stdin-filename src/domain/x.ts
echo "import { Button } from '@/ui/primitives'" | npx eslint --stdin --stdin-filename src/data/x.ts
echo "import { vi } from '@/domain/types'" | npx eslint --stdin --stdin-filename src/ui/jp/x.tsx
echo "import { s } from '@/features/practice/session-store'" | npx eslint --stdin --stdin-filename src/features/browse/x.tsx
echo "import { C } from '@/app/layouts/Container'" | npx eslint --stdin --stdin-filename src/features/browse/x.tsx
echo "import Dexie from 'dexie'" | npx eslint --stdin --stdin-filename src/features/browse/x.tsx
```

Mong đợi: 7 lệnh trên đều in `no-restricted-imports` và thoát mã 1. Ba ca không-lỗi (8–10 trong hợp đồng) thoát mã 0.

## 5. Kiểm chứng cuối (G8 — User Story 1)

Thứ tự bắt buộc:

1. `npm run build` → thoát mã 0, kích thước JS không tăng so với mốc.
2. Cổng đầy đủ: `node specs/001-repo-restructure/verify-baseline.mjs --also-default` → `PASS`. Chạy thêm `npm run check` và ghi kết quả (có thể đỏ ngẫu nhiên vì Q-1; đỏ thì chạy lại một lần và ghi cả hai).
3. `npm run test:e2e` → cả 6 file giống mốc; hai test `browse.spec.ts` (mở trang chủ → N5 → Minna no Nihongo 1 → Bài 1; mở thẳng `/b/mnn1/5`) và hai test 360×740 của `repo-restructure.spec.ts` đạt.
4. Duyệt toàn bộ route (smoke), SC-001:
   ```bash
   node specs/001-repo-restructure/shoot.mjs smoke after
   node specs/001-repo-restructure/shoot.mjs smoke after --dev   # /styleguide bằng npm run dev
   ```
   Mong đợi: cùng số route với mốc, không route trắng hay lỗi console, `/styleguide` mở được ở bản dev và trả 404 ở bản preview.
5. Đối chiếu tiến độ (progress), FR-002 và SC-006:
   ```bash
   node specs/001-repo-restructure/shoot.mjs progress after
   ```
   Mở lại **cùng profile** `.screens/001/profile` và **cùng cổng 4174**; mong đợi số bản ghi từng bảng IndexedDB bằng `progress-before.json`. (Không thử trên Vercel Preview: khác origin nên IndexedDB trống.)
6. Ảnh chụp trước/sau (SC-002):
   ```bash
   node specs/001-repo-restructure/shoot.mjs shots after
   node specs/001-repo-restructure/shoot.mjs compare
   ```
   `compare` so SHA-256 của 36 ảnh (6 trang × 360/768/1280 × sáng/tối). Mong đợi `36/36 giống hệt`. Ảnh khác thì mở cả hai, ghi lại khác biệt; chỉ chấp nhận khi nguyên nhân ngoài feature (VD phông chữ tải từ mạng), có ghi chú.
7. **Mạnh xem ảnh** trước/sau của trang chủ và `/b/mnn1/5` ở 360px, sáng và tối (4 cặp) và xác nhận.
8. Sau khi Mạnh đồng ý: đẩy nhánh, tạo Pull Request; mở bản Vercel Preview trên điện thoại: trang chủ và `/b/mnn1/5` hiển thị như bản đang chạy (User Story 1, tình huống 4).
9. Dọn file build cũ (cục bộ, đã gitignore): xóa `dist/`, `playwright-report/`, `test-results/`, `public/content-report.md` (bản sao cũ; script ghi báo cáo ở gốc repo, xem `plan.md` "Báo cáo nội dung ở G8"). **Không xóa** `content-report.md` ở gốc repo. Sau đó `git status --short` phải rỗng.
10. Mở `README.md` lần cuối và xác nhận không còn link hỏng.

Điều kiện hoàn thành: mục 1–10 đều đạt; `spec.md` các mục SC-001 đến SC-009 đều có bằng chứng trong `evidence.md`.

## 6. Mười câu "file loại X đặt ở đâu" (SC-009)

Mạnh tự trả lời, chỉ nhìn cây thư mục repo và `docs/ARCHITECTURE.md` §8.1/§8.2 (không hỏi thêm). Đáp án nằm ngay dưới để đối chiếu **sau khi** trả lời.

1. Một nút bấm dùng chung cho nhiều màn hình đặt ở đâu?
2. Thành phần hiển thị chữ Nhật kèm furigana (`Ruby`) đặt ở đâu?
3. Trang "Điểm yếu" đặt ở đâu?
4. Hook tải dữ liệu bất đồng bộ (`use-async-data`) đặt ở đâu?
5. Danh sách việc tồn đọng (`BACKLOG.md`) đặt ở đâu?
6. Ảnh thiết kế tham chiếu giao diện đặt ở đâu?
7. Bảng màu, font, bo góc dùng chung (token) đặt ở đâu?
8. Hình chú chó Shiba (linh vật) đặt ở đâu?
9. Từ vựng của Minna no Nihongo 1 đặt ở đâu?
10. Ý tưởng một tính năng mới (CÁI GÌ và TẠI SAO) đặt ở đâu?

<details>
<summary>Đáp án</summary>

1. `src/ui/primitives/`
2. `src/ui/jp/`
3. `src/features/weakness/`
4. `src/data/hooks/`
5. `docs/reference/BACKLOG.md`
6. `docs/reference/design/`
7. `src/ui/tokens.css`
8. `src/ui/signature/mascot/`
9. `content/n5/mnn1/vocab.md`
10. `specs/NNN-ten/spec.md`

</details>

Ghi số câu đúng và câu nào phải đoán vào `evidence.md` (SC-009).

## Phục hồi khi hỏng

- Nhóm vừa làm lệch mốc: `git revert <commit nhóm>`, sửa nguyên nhân, làm lại.
- `.screens/001/before` hoặc profile `progress` bị mất: không dựng lại được từ nhánh đã dời; phải chụp lại từ commit `dca3700` (`git worktree add`, dựng và chụp) — tuyệt đối không chụp "trước" từ nhánh đã dời.
