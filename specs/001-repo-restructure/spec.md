# Feature Specification: Sắp xếp lại cấu trúc repo (repo-restructure)

**Feature Branch**: `001-repo-restructure`

**Created**: 2026-10-29

**Status**: Draft

**Input**: User description: "Sắp xếp lại cấu trúc repo cho gọn và nhất quán để tôi và Claude Code luôn biết mỗi loại file nằm ở đâu, theo bảng phân loại trong docs/reference/audit-hien-trang.md (các nhóm "Dời" và "Xóa"). Website đang chạy trên Vercel phải hoạt động y như cũ: mọi trang mở được, không mất nội dung, không đổi giao diện. Không còn file .md lẻ ở gốc repo (trừ CLAUDE.md và README.md), không còn file bản sao hay build cũ. Link hỏng trong README.md được sửa. Ngoài phạm vi: đổi màu, đổi font, đổi giao diện, thêm layout làm bài, lazy loading."

**Tài liệu gốc để đối chiếu**: `docs/reference/audit-hien-trang.md` (§2: bảng phân loại), `docs/ARCHITECTURE.md` (§4.2 luật phụ thuộc, §8.1 cây thư mục, §8.2 "file này đặt ở đâu", §9.2 phạm vi feature này), `docs/FRONTEND.md` §3 (cấu trúc `src/`).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Người học thấy website y như cũ (Priority: P1)

Người học mở website sau khi repo được sắp xếp lại. Mọi trang họ từng dùng vẫn mở được và trông giống hệt: trang chủ, danh sách cấp độ, bài học, các dạng luyện tập, điểm yếu, sổ lỗi sai, tìm kiếm, cài đặt, giới thiệu. Tiến độ học đã lưu trên máy vẫn còn nguyên và vẫn dùng được.

**Why this priority**: Đây là ràng buộc cứng của cả feature. Dọn dẹp mà làm hỏng website đang chạy thì mất hết giá trị. Mọi việc dời file ở các story khác chỉ được chấp nhận khi story này vẫn đạt.

**Independent Test**: Chạy bản website đã sắp xếp lại, mở lần lượt từng đường dẫn hiện có và làm một phiên luyện tập ngắn. So với website trước khi dời: nội dung, bố cục, màu, chữ giống nhau; tiến độ cũ vẫn hiện.

**Acceptance Scenarios**:

1. **Given** website đã sắp xếp lại, **When** mở từng đường dẫn hiện có (trang chủ, `/n`, `/n/:level`, `/b/:bookId`, `/b/:bookId/:lesson`, `/practice/*`, `/weak`, `/mistakes`, `/kanji/:char`, `/search`, `/settings`, `/about`, các trang "Sắp có", trang không tồn tại), **Then** mỗi trang hiển thị đúng nội dung và đúng trạng thái như trước khi dời.
2. **Given** máy đã có tiến độ học lưu từ trước, **When** mở website đã sắp xếp lại, **Then** độ thành thạo, sổ lỗi sai và cài đặt cũ hiển thị đầy đủ, không phải học lại từ đầu.
3. **Given** trang `/b/mnn1/5` được mở thẳng bằng đường dẫn (không đi từ trang chủ), **When** tải trang, **Then** bài học hiện ra bình thường, không báo lỗi 404.
4. **Given** bản sắp xếp lại được đưa lên môi trường xem thử của Vercel, **When** mở trang chủ và một trang bài học trên điện thoại, **Then** cả hai hiển thị như bản đang chạy.
5. **Given** mốc so sánh ghi bên dưới (đo trước khi dời bất kỳ file nào), **When** chạy cổng kiểm định nghĩa ở FR-011 sau khi dời, **Then** mọi lệnh khớp mốc (định nghĩa chi tiết, cờ và quy tắc dừng chỉ nằm ở FR-011).
6. **Given** mọi đường dẫn hiện có của website, **When** chạy bước duyệt toàn bộ route (smoke) và bước đối chiếu tiến độ lưu trên máy (cùng một profile trình duyệt, cùng một cổng) trước và sau khi dời, **Then** không route nào trắng trang hay báo lỗi console, và số bản ghi của từng bảng tiến độ ở bản sau bằng bản trước.

**Mốc so sánh (baseline)** — đo ngày 2026-11-07 trên nhánh `001-repo-restructure` tại commit `dca3700`, cây làm việc sạch, chưa dời file nào:

| Lệnh | Kết quả mốc |
|---|---|
| `npm test` | Thoát mã 1. **219 pass / 220 test**; 43 pass / 44 file test. **1 test fail:** `scripts/content/pipeline.test.ts` › `runContentPipeline — dữ liệu N5 thật` › `không có lỗi, đếm đúng số lượng, và sinh được file JSON khi write:true` (lỗi `Test timed out in 5000ms`). Ghi chú: audit 29/10 cũng ghi 219/220 và đúng test này; chạy riêng file đó thì đạt (2/2), nên đây là lỗi quá hạn khi chạy cả bộ, không phải lỗi logic. |
| `npm run content:validate` | Thoát mã 0. **0 lỗi, 568 cảnh báo.** Số liệu: mnn1 1.023 từ chính, 272 từ mở rộng, 132 mẫu ngữ pháp; kanji-master-n5 134 Kanji. |
| `npm run build` | Thoát mã 0, **thành công** (2.152 module). Đầu ra: JS 608,42 kB (nén 185,23 kB), CSS 35,63 kB (nén 7,39 kB). Có sẵn 1 cảnh báo "chunk lớn hơn 500 kB" của công cụ dựng; không có cảnh báo hay lỗi nào khác. |

Các dòng sau được bổ sung ở nhóm G0, trước khi dời file đầu tiên (T007, T011): `npm test` chạy kèm cờ ở FR-011, `npm run lint`, `npm run test:e2e` (gồm file `tests/e2e/repo-restructure.spec.ts` ở 360×740), kết quả duyệt toàn bộ route (smoke) và số bản ghi từng bảng tiến độ (progress).

---

### User Story 2 - Mạnh và Claude Code biết mỗi loại file nằm ở đâu (Priority: P2)

Mạnh (hoặc Claude Code) cần tìm hoặc đặt một file: một nút bấm dùng chung, một trang, tài liệu cũ, ảnh thiết kế, việc tồn đọng. Với mỗi loại file chỉ có đúng một chỗ ở theo `docs/ARCHITECTURE.md` §8.1 và §8.2, nên không phải đoán hay tìm ở hai nơi.

**Why this priority**: Đây là lý do của feature (hết cảnh "file lộn xộn"). Nó đứng sau P1 vì chỉ có ý nghĩa khi website vẫn chạy đúng.

**Independent Test**: Lấy 43 hàng ánh xạ trong `specs/001-repo-restructure/data-model.md` (nhóm "Dời" của feature này, xem FR-004). Với mỗi hàng, kiểm tra file nằm ở vị trí mới và không còn ở vị trí cũ. Quét gốc repo: chỉ có đúng hai file `.md` được commit là `CLAUDE.md` và `README.md`.

**Acceptance Scenarios**:

1. **Given** repo sau khi sắp xếp lại, **When** liệt kê file `.md` được commit ở gốc repo, **Then** chỉ còn `CLAUDE.md` và `README.md`.
2. **Given** các file thuộc nhóm "Dời" (43 hàng trong `data-model.md`, xem FR-004), **When** đối chiếu từng file, **Then** nó có mặt ở vị trí mới theo `docs/ARCHITECTURE.md` §8.1 / `docs/FRONTEND.md` §3 và không còn bản ở vị trí cũ; ba file loại trừ (`lib/tts.ts`, `lib/theme.ts`, `lib/use-theme.ts`) vẫn nằm ở `src/lib/`.
3. **Given** thư mục `design/` và file `BACKLOG.md` ở gốc, **When** sắp xếp xong, **Then** chúng nằm dưới `docs/reference/` (kèm đủ 11 ảnh tham chiếu và hai tài liệu thiết kế) và nội dung không đổi.
4. **Given** mã giao diện dùng chung đang nằm trong `src/components/`, **When** sắp xếp xong, **Then** thư mục đó không còn; mỗi thành phần nằm ở nhóm tương ứng (nút/thẻ/khung chung, thành phần chữ Nhật, thành phần làm bài, thành phần nhận diện "Tuyến tàu" gồm chú chó Shiba) và các trang vẫn dùng chúng như cũ.
5. **Given** một người mới chỉ đọc `docs/ARCHITECTURE.md` §8.2, **When** hỏi "file loại X đặt ở đâu", **Then** câu trả lời trong tài liệu khớp với vị trí thật trong repo.

---

### User Story 3 - Hết file bản sao, build cũ và link hỏng (Priority: P2)

Repo không còn file trùng hay rác: bản sao báo cáo nội dung cũ, thư mục build cũ, báo cáo test cũ. Trong `README.md`, link tới kế hoạch trỏ đúng file và mục "Cấu trúc" mô tả đúng cây thư mục mới. README ở từng thư mục con vẫn đúng với vị trí mới của chúng.

**Why this priority**: Đây là phần "dọn" thấy ngay được, rủi ro thấp, và là điều kiện để cây thư mục sạch như `docs/ARCHITECTURE.md` mô tả.

**Independent Test**: Quét repo tìm các mục trong nhóm "Xóa" của audit; mở từng link trong `README.md` và trong README các thư mục con.

**Acceptance Scenarios**:

1. **Given** repo sau khi dọn, **When** tìm bản sao báo cáo nội dung ở `public/`, thư mục build cũ, báo cáo test cũ và kết quả test cũ, **Then** không còn mục nào trong nhóm "Xóa" của audit.
2. **Given** `README.md` ở gốc, **When** bấm từng link, **Then** link tới kế hoạch trỏ đến `docs/reference/Ke_hoach_Website.md` và không link nào hỏng.
3. **Given** bất kỳ tài liệu nào của dự án nhắc đường dẫn tới một file đã dời (README thư mục con, `docs/*.md`, `CLAUDE.md`; không gồm `docs/reference/**`), **When** đối chiếu với repo, **Then** đường dẫn đó tồn tại thật.
4. **Given** file `content-report.md` do lệnh dựng nội dung sinh ra ở gốc repo, **When** sắp xếp xong, **Then** nó vẫn không được commit và ngoại lệ này được ghi trong tài liệu kiến trúc.

---

### User Story 4 - Luật phụ thuộc giữa các lớp được máy kiểm tra (Priority: P3)

Quy tắc "lớp nào được dùng lớp nào" trong `docs/ARCHITECTURE.md` §4.2 không chỉ nằm trên giấy: nếu sau này ai đó viết mã vi phạm (VD: mã logic thuần dùng thư viện giao diện, hai vùng tính năng dùng lẫn nhau), bộ kiểm tra chung của dự án báo lỗi.

**Why this priority**: Giữ cho cấu trúc mới không bị phá lại, nhưng không ảnh hưởng người học nên đứng cuối. Phần này nằm trong phạm vi `repo-restructure` theo `docs/ARCHITECTURE.md` §9.2.

**Independent Test**: Cố ý thêm một dòng vi phạm (VD: logic thuần dùng giao diện) rồi chạy bộ kiểm tra chung; nó phải báo lỗi chỉ rõ file và dòng. Gỡ dòng đó thì bộ kiểm tra xanh.

**Acceptance Scenarios**:

1. **Given** mã nguồn sau khi sắp xếp lại, **When** chạy bộ kiểm tra chung, **Then** không có vi phạm luật phụ thuộc nào còn sót.
2. **Given** một thay đổi cố ý vi phạm luật phụ thuộc, **When** chạy bộ kiểm tra chung, **Then** nó báo lỗi và chỉ rõ chỗ vi phạm.
3. **Given** audit phát hiện một vi phạm đã có sẵn mà sửa nó cần viết lại logic, **When** gặp trường hợp này, **Then** vi phạm được ghi lại là ngoại lệ có chủ đích (kèm lý do), không viết lại logic trong feature này.

---

### Edge Cases

- **File dời nhưng còn nơi khác tham chiếu bằng đường dẫn cũ** (import trong mã, README thư mục con, `CLAUDE.md`, tài liệu trong `docs/`): mọi tham chiếu phải được cập nhật cùng lúc, nếu không trang hoặc bộ kiểm tra sẽ hỏng.
- **File test đi kèm** (`*.test.ts(x)`) phải dời cùng file nguồn của nó; không file test nào bị bỏ lại hoặc thành mồ côi.
- **Lịch sử thay đổi của file**: file dời (không xóa rồi tạo lại) để lịch sử của nó vẫn xem được.
- **File sinh tự động đã bị bỏ qua khi commit** (nội dung sinh ra, báo cáo test, thư mục build): xóa bản cũ trên máy không được làm đổi gì trong lịch sử repo; dựng lại các bản đó vẫn chạy được từ đầu.
- **Máy của người học**: dữ liệu tiến độ lưu trong trình duyệt không được đổi tên hay đổi định dạng; đường dẫn (route) và tên tham số trên địa chỉ (`bookId`, `lesson`) giữ nguyên để link người dùng đã lưu vẫn mở được.
- **Trang chỉ có khi phát triển** (`/styleguide`): vẫn mở được khi chạy bản phát triển, vẫn không có trong bản đưa lên mạng.
- **Hai thư mục nằm ngoài Git** (`Source code/Docs/`, `Source code/Ảnh mobile/`) không thuộc repo nên không bị feature này đụng tới.
- **Mục chưa có quyết định** (`public/content/README.md`, `src/features/dev/StyleguidePage.tsx`, `src/lib/sfx.ts`, nhóm "Hỏi" trong audit) và ba file chưa dời (`lib/tts.ts`, `lib/theme.ts`, `lib/use-theme.ts`) giữ nguyên chỗ cũ, không tự chọn thay Mạnh.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Website sau khi sắp xếp lại PHẢI hiển thị và hoạt động giống bản trước khi dời ở mọi đường dẫn hiện có, kể cả khi mở thẳng bằng đường dẫn.
- **FR-002**: Tiến độ học đã lưu trên máy (câu trả lời, độ thành thạo, sổ lỗi sai, cài đặt) PHẢI còn nguyên và dùng được; định dạng lưu và tên các tham số trên địa chỉ PHẢI không đổi.
- **FR-003**: Giao diện PHẢI không đổi: không đổi màu, font, bo góc, khoảng cách, bố cục, chữ hiển thị; không thêm hay bớt màn hình; không thêm khung làm bài riêng; không đổi cách tải trang.
- **FR-004**: Mọi file thuộc nhóm "Dời" PHẢI được chuyển tới vị trí mới theo `docs/ARCHITECTURE.md` §8.1 và `docs/FRONTEND.md` §3, và không còn bản ở vị trí cũ. **Nhóm "Dời" của feature này được định nghĩa là đúng 43 hàng trong bảng ánh xạ của `specs/001-repo-restructure/data-model.md`** (41 file trong `src/`, cộng `BACKLOG.md` và thư mục `design/`). Danh sách đó lấy từ `docs/reference/audit-hien-trang.md` §2 sau khi trừ **ba file loại trừ, chưa dời theo quyết định đã duyệt**: `src/lib/tts.ts` (thuộc `ui-kit-and-shell`), `src/lib/theme.ts` và `src/lib/use-theme.ts` (vị trí cuối chốt ở `ui-kit-and-shell`). Tóm tắt các nhóm:

  | Nhóm | Từ | Đến |
  |---|---|---|
  | Tài liệu và việc tồn đọng | `BACKLOG.md`, `design/` (2 tài liệu + 11 ảnh) ở gốc | `docs/reference/BACKLOG.md`, `docs/reference/design/` |
  | Điểm vào ứng dụng, khung trang | `src/App.tsx` (+ test), `src/app/Layout`, `TopBar`, `BottomNav`, `src/components/ui/Container`, `ComingSoon` | `src/app/` (khung trang trong `src/app/layouts/`) |
  | Bảng token và kiểu nền | `src/index.css` | `src/ui/tokens.css` (nội dung giữ nguyên) |
  | Thành phần dùng chung | `src/components/ui/*`, `ErrorState`, `LoadingState`, `NotFound`, `ThemeToggle` | `src/ui/primitives/`; `StationBadge` → `src/ui/signature/`. `lib/theme.ts` và `lib/use-theme.ts` là hai trong ba file loại trừ: **chưa dời**, tạm ở `src/lib/` |
  | Thành phần chữ Nhật | `Ruby`, `SpeakButton`, `KanjiCard` | `Ruby`, `SpeakButton` → `src/ui/jp/`; `KanjiCard` → `src/features/browse/` (chỉ vùng duyệt nội dung dùng) |
  | Thành phần làm bài | `TextChoiceCard`, `BlankChoiceCard` | `src/ui/quiz/` |
  | Nhận diện "Tuyến tàu" | `src/components/mascot/*`, `lib/heatmap` | `src/ui/signature/` (linh vật trong `src/ui/signature/mascot/`) |
  | Tiện ích dữ liệu | `lib/use-async-data` | `src/data/hooks/` |
  | Trang theo vùng tính năng | `features/kanji/KanjiDetailPage`, `features/search/SearchPage`, `features/about/AboutPage` | `features/browse/` (Kanji, Tìm kiếm), `features/settings/` (Giới thiệu) |
  | Đặt tên cho khớp | `lib/format-duration` | `lib/format` |

- **FR-005**: Mọi file thuộc nhóm "Xóa" trong audit PHẢI được xóa: bản sao báo cáo nội dung cũ trong `public/`, thư mục build cũ `dist/`, báo cáo test cũ `playwright-report/` và kết quả test cũ `test-results/`. Việc xóa chỉ trên bản đang có trên máy; các file này vốn đã được bỏ qua khi commit.
- **FR-006**: Không còn file `.md` lẻ ở gốc repo, trừ `CLAUDE.md` và `README.md`. Yêu cầu này chỉ áp dụng cho file `.md`: gốc repo vẫn giữ các file cấu hình công cụ bắt buộc (`package.json`, lock file, cấu hình vite/ts/eslint/playwright, `index.html`, `.gitignore`, `.specify/`, `.claude/`, `.github/`) cùng các thư mục nguồn hiện có. `content-report.md` do lệnh dựng nội dung sinh ở gốc là ngoại lệ đã có trong `docs/ARCHITECTURE.md` §8.2, không được commit.
- **FR-007**: Không còn thư mục hoặc file bản sao/backup (VD: `old/`, `backup/`, `new/`, `*-copy.*`, `*-v2.*`) trong repo.
- **FR-008**: Mọi tham chiếu đường dẫn tới file đã dời PHẢI được cập nhật: import trong mã, README ở thư mục con, `README.md` gốc, `CLAUDE.md`, và các tài liệu đang dùng trong `docs/` (không gồm `docs/reference/**`, xem SC-005). Không đường dẫn nào trong phạm vi đó trỏ tới nơi không tồn tại.
- **FR-009**: `README.md` gốc PHẢI có link tới kế hoạch trỏ đúng `docs/reference/Ke_hoach_Website.md`, và mục "Cấu trúc" PHẢI mô tả đúng cây thư mục mới.
- **FR-010**: File đi kèm nhau (mã nguồn và test của nó, README của thư mục) PHẢI được dời cùng nhau; lịch sử thay đổi của file đã dời PHẢI vẫn xem được.
- **FR-011** *(định nghĩa duy nhất của "cổng kiểm"; mọi tài liệu khác chỉ dẫn chiếu tới đây)*: Sau mỗi nhóm commit và ở bước xác minh cuối, chạy bốn lệnh và so với mốc ở User Story 1:
  1. `npm test -- --testTimeout=30000` (tức `vitest run` kèm cờ ở dòng lệnh; **không sửa repo**). Kỳ vọng **220/220 test pass, 44/44 file pass**.
  2. `npm run build`: thoát mã 0; chỉ 1 cảnh báo chunk lớn; JS không lớn hơn mốc 608,42 kB đáng kể.
  3. `npm run content:validate`: thoát mã 0, 0 lỗi, **đúng 568 cảnh báo**.
  4. `npm run lint`: thoát mã 0.

  **Quy tắc dừng:** bất kỳ test nào fail khi chạy kèm cờ (kể cả `pipeline.test.ts`), hoặc bất kỳ lệnh nào lệch mốc → **DỪNG và báo Mạnh**, không sang nhóm sau. Kết quả chạy mặc định (`npm test` không cờ) được ghi kèm cho biết mức chập chờn của test `pipeline.test.ts` (quá hạn 5 giây), nhưng không dùng làm điều kiện dừng.

  Ngoài bốn lệnh trên: không phát sinh lỗi kiểm kiểu; `npm run test:e2e` đạt, gồm file `tests/e2e/repo-restructure.spec.ts` (chạy ở viewport 360×740, mở `/` và `/b/mnn1/5`, kiểm có nội dung chính; file này được thêm ở G0 và giữ lại); duyệt toàn bộ route (smoke) và đối chiếu số bản ghi tiến độ (progress) giống mốc trước.
- **FR-012**: Quy tắc phụ thuộc giữa các lớp theo `docs/ARCHITECTURE.md` §4.2 PHẢI được bộ kiểm tra chung của dự án kiểm tự động. Mọi vi phạm có sẵn mà chỉ sửa được bằng cách viết lại logic PHẢI được ghi là ngoại lệ có lý do, không sửa trong feature này.
- **FR-013**: Feature này PHẢI KHÔNG: đổi dữ liệu bài học trong `content/**` (từ vựng, ngữ pháp, Kanji và các giá trị khai báo trong manifest, overrides); thuật toán sinh câu hỏi, chấm điểm, cách lưu tiến độ, cấu hình dựng và đưa lên mạng, phiên bản hay danh sách thư viện; PHẢI KHÔNG thêm tính năng hay thư viện mới. Chú thích (`#`) trong file cấu hình yaml của `content/**` được phép sửa để cập nhật đường dẫn tài liệu.
- **FR-014**: Các mục thuộc nhóm "Hỏi" trong audit mà Mạnh chưa quyết (`public/content/README.md`, `StyleguidePage`, `lib/sfx`, hai thư mục ngoài Git) và ba file loại trừ khỏi nhóm "Dời" (`lib/tts.ts`, `lib/theme.ts`, `lib/use-theme.ts`) PHẢI giữ nguyên chỗ cũ và không bị xóa.

### Key Entities

- **Vị trí đích**: nơi một loại file thuộc về theo `docs/ARCHITECTURE.md` §8.1 / §8.2. Mỗi loại file có đúng một vị trí đích.
- **Bảng phân loại**: danh sách trong `docs/reference/audit-hien-trang.md` §2, mỗi hàng gồm file hiện tại, hành động (Giữ/Dời/Xóa/Hỏi) và vị trí đích hoặc lý do. Đây là nguồn quyết định cho feature này.
- **Tham chiếu đường dẫn**: mọi chỗ trong mã hoặc tài liệu nhắc đến vị trí của một file khác (import, link, README). Mỗi tham chiếu phải trỏ tới nơi tồn tại thật sau khi dời.
- **Luật phụ thuộc giữa các lớp**: bảng "lớp nào được dùng lớp nào" ở `docs/ARCHITECTURE.md` §4.2.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% đường dẫn hiện có của website (mọi route trong bảng route của ứng dụng, kể cả mở thẳng `/b/mnn1/5`; riêng `/styleguide` kiểm ở bản phát triển) hiển thị đúng sau khi dời, không trang nào lỗi console hay trắng; số route duyệt được sau bằng số route duyệt được trước.
- **SC-002**: So ảnh chụp các trang chính trước và sau khi dời ở ba cỡ màn hình (điện thoại 360×740, máy tính bảng 768×1024, máy tính 1280×800), cả sáng và tối (36 ảnh: 6 trang × 3 cỡ × 2 chế độ): không có khác biệt nhìn thấy về bố cục, màu, chữ; Mạnh xem ảnh trước/sau của trang chủ và `/b/mnn1/5` ở 360px (sáng và tối) và xác nhận.
- **SC-003**: Cổng kiểm ở FR-011 đạt sau mỗi nhóm commit và ở bước cuối; không có test nào pass trước mà fail sau; các test e2e mở trang chủ, mở `/b/mnn1/5` và test 360×740 của feature đạt.
- **SC-004**: Không còn file `.md` lẻ ở gốc repo trừ `CLAUDE.md` và `README.md` (đúng 2 file `.md` được commit ở gốc; các file cấu hình công cụ không tính); số file thuộc 43 hàng nhóm "Dời" (`data-model.md`) còn ở vị trí cũ là 0 và ba file loại trừ (`lib/tts.ts`, `lib/theme.ts`, `lib/use-theme.ts`) vẫn ở `src/lib/`; số file nhóm "Xóa" còn tồn tại là 0.
- **SC-005**: 0 link hỏng trong `README.md` gốc, `CLAUDE.md`, README các thư mục con và các tài liệu đang dùng trong `docs/` (`docs/*.md`) trỏ tới file đã dời. Không áp dụng cho `docs/reference/**`: đó là bản chụp lịch sử theo ngày, giữ nguyên nội dung khi dời.
- **SC-006**: Tiến độ học đã lưu từ trước khi dời mở lại được 100% sau khi dời: trên cùng một profile trình duyệt và cùng một cổng, số bản ghi của từng bảng (câu trả lời, độ thành thạo, sổ lỗi sai và các bảng còn lại) ở bản sau bằng bản trước.
- **SC-007**: Bộ kiểm tra chung phát hiện được 100% vi phạm luật phụ thuộc trong một thay đổi thử nghiệm cố ý vi phạm; mã sau khi sắp xếp lại có 0 vi phạm chưa được ghi ngoại lệ.
- **SC-008**: Lịch sử thay đổi vẫn truy vết được cho ít nhất 95% file đã dời (Git nhận ra là đổi tên, không phải xóa rồi thêm mới).
- **SC-009**: Mạnh trả lời đúng "file loại X đặt ở đâu" cho 10 loại file bất kỳ lấy từ `docs/ARCHITECTURE.md` §8.2 mà chỉ cần nhìn cây thư mục repo, không cần hỏi thêm.

## Assumptions

- Feature này là bước đầu (`docs/ARCHITECTURE.md` §9.2): chỉ **dời, đổi tên, xóa** và sửa tham chiếu; mọi logic, giao diện, dữ liệu giữ nguyên. Việc đổi token, font, `FocusShell`, tải lười, tách bảng route và dựng lớp `platform/` thuộc các feature sau (`ui-kit-and-shell` trở đi).
- Các quyết định đã chốt trong `docs/ARCHITECTURE.md` v2.1 được áp dụng: giữ nhận diện "Tuyến tàu" cùng chú chó Shiba (ADR-007), nên linh vật được dời vào `src/ui/signature/mascot/` chứ không xóa; `ui/` được phép dùng `platform/` (§4.2); `content-report.md` ở gốc là ngoại lệ được phép (§8.2).
- `src/index.css` chỉ đổi chỗ thành `src/ui/tokens.css` và giữ nguyên toàn bộ nội dung (kể cả token cũ `primary-*` và nền cũ); việc dọn các token này thuộc `pages-migration`.
- `lib/tts` chưa chuyển sang `src/platform/` vì cần dựng lớp `platform/` mới (không phải chỉ dời); việc này thuộc `ui-kit-and-shell`. `lib/sfx`, `StyleguidePage`, `public/content/README.md` là các mục "Hỏi" chưa có quyết định nên giữ nguyên.
- Tên file/hàm/component đổi chỉ khi bảng phân loại ghi rõ (VD `Layout` → `AppShell`); không đổi tên chỉ cho đẹp.
- Hai thư mục `Source code/Docs/` và `Source code/Ảnh mobile/` nằm ngoài Git, xóa là không hoàn tác được qua Git, nên feature này không đụng tới; Mạnh tự quyết sau.
- Các đường dẫn website, tên tham số trên địa chỉ và cách lưu tiến độ trên máy đã được ràng buộc "không đổi" trong `CLAUDE.md` và constitution (nguyên tắc II, III).
- Kiểm bằng bộ lệnh sẵn có ở cổng FR-011, cộng ba công cụ tạm đặt trong `specs/001-repo-restructure/` (`verify-baseline.mjs`, `shoot.mjs` gồm các chế độ ảnh chụp, smoke, progress) và một file e2e giữ lại `tests/e2e/repo-restructure.spec.ts` (đáp ứng nguyên tắc IV: mỗi feature có e2e ở 360×740). Không đổi `playwright.config.ts`, không thêm thư viện.
- Test `pipeline.test.ts` quá hạn 5 giây khi chạy mặc định là lỗi chập chờn có sẵn. Cờ `--testTimeout=30000` ở FR-011 chỉ là cách chạy, không sửa repo và không sửa test. `npm run check` và CI trên Pull Request có thể đỏ ngẫu nhiên vì lỗi này; khi đó chạy lại. Sửa gốc thuộc spec `quality-gaps` (xem `plan.md`, Complexity Tracking, mục Q-1).
- Tiến độ học lưu trong IndexedDB theo từng origin, nên chỉ đối chiếu được trên cùng một profile trình duyệt và cùng một cổng (bản `vite preview` cục bộ); không đối chiếu trên Vercel Preview vì khác origin.
- Mục tiêu đưa lên Vercel xem thử (Preview) được dùng để Mạnh mở trên điện thoại trước khi gộp, theo quy trình trong constitution.
