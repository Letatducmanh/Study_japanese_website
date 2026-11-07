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

---

### User Story 2 - Mạnh và Claude Code biết mỗi loại file nằm ở đâu (Priority: P2)

Mạnh (hoặc Claude Code) cần tìm hoặc đặt một file: một nút bấm dùng chung, một trang, tài liệu cũ, ảnh thiết kế, việc tồn đọng. Với mỗi loại file chỉ có đúng một chỗ ở theo `docs/ARCHITECTURE.md` §8.1 và §8.2, nên không phải đoán hay tìm ở hai nơi.

**Why this priority**: Đây là lý do của feature (hết cảnh "file lộn xộn"). Nó đứng sau P1 vì chỉ có ý nghĩa khi website vẫn chạy đúng.

**Independent Test**: Lấy bảng phân loại trong audit (§2, các hàng "Dời"). Với mỗi hàng, kiểm tra file nằm ở vị trí mới và không còn ở vị trí cũ. Quét gốc repo: chỉ có đúng hai file `.md` được commit là `CLAUDE.md` và `README.md`.

**Acceptance Scenarios**:

1. **Given** repo sau khi sắp xếp lại, **When** liệt kê file `.md` được commit ở gốc repo, **Then** chỉ còn `CLAUDE.md` và `README.md`.
2. **Given** các file thuộc nhóm "Dời" trong audit, **When** đối chiếu từng file, **Then** nó có mặt ở vị trí mới theo `docs/ARCHITECTURE.md` §8.1 / `docs/FRONTEND.md` §3 và không còn bản ở vị trí cũ.
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
3. **Given** bất kỳ tài liệu nào của dự án nhắc đường dẫn tới một file đã dời (README thư mục con, `docs/*`, `CLAUDE.md`), **When** đối chiếu với repo, **Then** đường dẫn đó tồn tại thật.
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
- **Mục chưa có quyết định** (`public/content/README.md`, `src/features/dev/StyleguidePage.tsx`, `src/lib/sfx.ts`, nhóm "Hỏi" trong audit) giữ nguyên chỗ cũ, không tự chọn thay Mạnh.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Website sau khi sắp xếp lại PHẢI hiển thị và hoạt động giống bản trước khi dời ở mọi đường dẫn hiện có, kể cả khi mở thẳng bằng đường dẫn.
- **FR-002**: Tiến độ học đã lưu trên máy (câu trả lời, độ thành thạo, sổ lỗi sai, cài đặt) PHẢI còn nguyên và dùng được; định dạng lưu và tên các tham số trên địa chỉ PHẢI không đổi.
- **FR-003**: Giao diện PHẢI không đổi: không đổi màu, font, bo góc, khoảng cách, bố cục, chữ hiển thị; không thêm hay bớt màn hình; không thêm khung làm bài riêng; không đổi cách tải trang.
- **FR-004**: Mọi file thuộc nhóm "Dời" trong `docs/reference/audit-hien-trang.md` §2 PHẢI được chuyển tới vị trí mới theo `docs/ARCHITECTURE.md` §8.1 và `docs/FRONTEND.md` §3, và không còn bản ở vị trí cũ. Tóm tắt các nhóm:

  | Nhóm | Từ | Đến |
  |---|---|---|
  | Tài liệu và việc tồn đọng | `BACKLOG.md`, `design/` (2 tài liệu + 11 ảnh) ở gốc | `docs/reference/BACKLOG.md`, `docs/reference/design/` |
  | Điểm vào ứng dụng, khung trang | `src/App.tsx` (+ test), `src/app/Layout`, `TopBar`, `BottomNav`, `src/components/ui/Container`, `ThemeToggle`, `lib/theme`, `lib/use-theme`, `NotFound`, `ComingSoon` | `src/app/` (khung trang trong `src/app/layouts/`, chủ đề sáng/tối trong `src/app/`) |
  | Bảng token và kiểu nền | `src/index.css` | `src/ui/tokens.css` (nội dung giữ nguyên) |
  | Thành phần dùng chung | `src/components/ui/*`, `ErrorState`, `LoadingState` | `src/ui/primitives/`; `StationBadge` → `src/ui/signature/` |
  | Thành phần chữ Nhật | `Ruby`, `SpeakButton`, `KanjiCard` | `src/ui/jp/` |
  | Thành phần làm bài | `TextChoiceCard`, `BlankChoiceCard` | `src/ui/quiz/` |
  | Nhận diện "Tuyến tàu" | `src/components/mascot/*`, `lib/heatmap` | `src/ui/signature/` (linh vật trong `src/ui/signature/mascot/`) |
  | Tiện ích dữ liệu | `lib/use-async-data` | `src/data/hooks/` |
  | Trang theo vùng tính năng | `features/kanji/KanjiDetailPage`, `features/search/SearchPage`, `features/about/AboutPage` | `features/browse/` (Kanji, Tìm kiếm), `features/settings/` (Giới thiệu) |
  | Đặt tên cho khớp | `lib/format-duration` | `lib/format` |

- **FR-005**: Mọi file thuộc nhóm "Xóa" trong audit PHẢI được xóa: bản sao báo cáo nội dung cũ trong `public/`, thư mục build cũ `dist/`, báo cáo test cũ `playwright-report/` và kết quả test cũ `test-results/`. Việc xóa chỉ trên bản đang có trên máy; các file này vốn đã được bỏ qua khi commit.
- **FR-006**: Gốc repo PHẢI chỉ còn `CLAUDE.md` và `README.md` là file `.md` được commit. `content-report.md` do lệnh dựng nội dung sinh ở gốc là ngoại lệ đã có trong `docs/ARCHITECTURE.md` §8.2, không được commit.
- **FR-007**: Không còn thư mục hoặc file bản sao/backup (VD: `old/`, `backup/`, `new/`, `*-copy.*`, `*-v2.*`) trong repo.
- **FR-008**: Mọi tham chiếu đường dẫn tới file đã dời PHẢI được cập nhật: import trong mã, README ở thư mục con, `README.md` gốc, `CLAUDE.md`, và các tài liệu trong `docs/`. Không đường dẫn nào trỏ tới nơi không tồn tại.
- **FR-009**: `README.md` gốc PHẢI có link tới kế hoạch trỏ đúng `docs/reference/Ke_hoach_Website.md`, và mục "Cấu trúc" PHẢI mô tả đúng cây thư mục mới.
- **FR-010**: File đi kèm nhau (mã nguồn và test của nó, README của thư mục) PHẢI được dời cùng nhau; lịch sử thay đổi của file đã dời PHẢI vẫn xem được.
- **FR-011**: Lệnh kiểm tra tổng của dự án (`npm run check`: kiểm nội dung, kiểm kiểu, kiểm lỗi cú pháp/phong cách, test đơn vị), lệnh dựng bản đưa lên mạng và các test mở trang chủ, mở `/b/mnn1/5` PHẢI đạt sau khi dời.
- **FR-012**: Quy tắc phụ thuộc giữa các lớp theo `docs/ARCHITECTURE.md` §4.2 PHẢI được bộ kiểm tra chung của dự án kiểm tự động. Mọi vi phạm có sẵn mà chỉ sửa được bằng cách viết lại logic PHẢI được ghi là ngoại lệ có lý do, không sửa trong feature này.
- **FR-013**: Feature này PHẢI KHÔNG: đổi nội dung bài học (`content/**`), thuật toán sinh câu hỏi, chấm điểm, cách lưu tiến độ, cấu hình dựng và đưa lên mạng, phiên bản hay danh sách thư viện; PHẢI KHÔNG thêm tính năng hay thư viện mới.
- **FR-014**: Các mục thuộc nhóm "Hỏi" trong audit mà Mạnh chưa quyết (`public/content/README.md`, `StyleguidePage`, `lib/sfx`, `lib/tts`, hai thư mục ngoài Git) PHẢI giữ nguyên chỗ cũ và không bị xóa.

### Key Entities

- **Vị trí đích**: nơi một loại file thuộc về theo `docs/ARCHITECTURE.md` §8.1 / §8.2. Mỗi loại file có đúng một vị trí đích.
- **Bảng phân loại**: danh sách trong `docs/reference/audit-hien-trang.md` §2, mỗi hàng gồm file hiện tại, hành động (Giữ/Dời/Xóa/Hỏi) và vị trí đích hoặc lý do. Đây là nguồn quyết định cho feature này.
- **Tham chiếu đường dẫn**: mọi chỗ trong mã hoặc tài liệu nhắc đến vị trí của một file khác (import, link, README). Mỗi tham chiếu phải trỏ tới nơi tồn tại thật sau khi dời.
- **Luật phụ thuộc giữa các lớp**: bảng "lớp nào được dùng lớp nào" ở `docs/ARCHITECTURE.md` §4.2.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% đường dẫn hiện có của website (kể cả mở thẳng `/b/mnn1/5`) hiển thị đúng sau khi dời, không trang nào lỗi hay trắng.
- **SC-002**: So ảnh chụp các trang chính trước và sau khi dời ở ba cỡ màn hình (điện thoại, máy tính bảng, máy tính), cả sáng và tối: không có khác biệt nhìn thấy về bố cục, màu, chữ; Mạnh xem và xác nhận.
- **SC-003**: Không có test tự động nào đạt trước khi dời mà thất bại sau khi dời; lệnh kiểm tra tổng, lệnh dựng bản đưa lên mạng và test mở trang chủ, mở một trang bài học đều đạt.
- **SC-004**: Số file `.md` được commit ở gốc repo là đúng 2 (`CLAUDE.md`, `README.md`); số file nhóm "Dời" còn ở vị trí cũ là 0; số file nhóm "Xóa" còn tồn tại là 0.
- **SC-005**: 0 link hỏng trong `README.md` gốc, README các thư mục con và các tài liệu trong `docs/` trỏ tới file đã dời.
- **SC-006**: Tiến độ học đã lưu từ trước khi dời mở lại được 100% (cùng số bản ghi độ thành thạo và sổ lỗi sai) sau khi dời.
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
- Có thể kiểm bằng bộ kiểm tra hiện có (`npm run check`, `npm run test:e2e`) cộng thao tác mở trang và xem ảnh chụp; không cần công cụ mới. Các test đã biết có độ ổn định thấp (một test của pipeline quá hạn 5 giây khi chạy song song) không bị coi là hồi quy của feature này nếu chạy riêng thì đạt.
- Mục tiêu đưa lên Vercel xem thử (Preview) được dùng để Mạnh mở trên điện thoại trước khi gộp, theo quy trình trong constitution.
