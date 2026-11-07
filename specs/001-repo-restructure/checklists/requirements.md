# Specification Quality Checklist: Sắp xếp lại cấu trúc repo (repo-restructure)

**Purpose**: Validate specification completeness and quality before proceeding to planning
**Created**: 2026-10-29
**Feature**: [spec.md](../spec.md)

## Content Quality

- [x] No implementation details (languages, frameworks, APIs)
- [x] Focused on user value and business needs
- [x] Written for non-technical stakeholders
- [x] All mandatory sections completed

## Requirement Completeness

- [x] No [NEEDS CLARIFICATION] markers remain
- [x] Requirements are testable and unambiguous
- [x] Success criteria are measurable
- [x] Success criteria are technology-agnostic (no implementation details)
- [x] All acceptance scenarios are defined
- [x] Edge cases are identified
- [x] Scope is clearly bounded
- [x] Dependencies and assumptions identified

## Feature Readiness

- [x] All functional requirements have clear acceptance criteria
- [x] User scenarios cover primary flows
- [x] Feature meets measurable outcomes defined in Success Criteria
- [x] No implementation details leak into specification

## Notes

- Feature này có đối tượng là chính cấu trúc thư mục, nên đường dẫn file xuất hiện trong spec là **nội dung** của yêu cầu, không phải chi tiết cài đặt. Không nêu thư viện, framework hay cách viết mã.
- `npm run check` và `npm run test:e2e` được nhắc ở FR-011 và Assumptions vì đó là cổng chất lượng sẵn có do constitution (nguyên tắc IV) yêu cầu, không phải lựa chọn công nghệ mới.
- Không có [NEEDS CLARIFICATION]. Ba điểm có thể gây tranh luận đã chọn mặc định hợp lý và ghi ở Assumptions: (1) hai thư mục ngoài Git (`Source code/Docs/`, `Source code/Ảnh mobile/`) không đụng tới; (2) `lib/tts` chưa vào `platform/` vì cần dựng lớp mới; (3) luật phụ thuộc §4.2 nằm trong phạm vi theo `docs/ARCHITECTURE.md` §9.2 (User Story 4, P3).
- Kiểm tra đối chiếu: các mục "Dời"/"Xóa" trong FR-004 và FR-005 khớp `docs/reference/audit-hien-trang.md` §2; riêng "nhóm Dời" của feature được định nghĩa là 43 hàng của `data-model.md`, trừ ba file chưa dời (FR-004, FR-014).
- Chạy lại ngày 2026-11-07 sau khi sửa spec (phạm vi `.md` ở gốc repo; thêm mốc so sánh cho User Story 1): 12/12 đạt, vẫn 0 `[NEEDS CLARIFICATION]`, 0 placeholder.
- FR-006 và SC-004 chỉ giới hạn file `.md` ở gốc; file cấu hình công cụ và thư mục nguồn nằm ngoài yêu cầu này.
- Cổng kiểm được định nghĩa **một lần** ở FR-011 (lệnh, cờ `--testTimeout=30000`, kỳ vọng 220/220, 568 cảnh báo, quy tắc dừng); User Story 1 (tình huống 5), SC-003 và Assumptions chỉ dẫn chiếu. Tên test và lệnh `npm` xuất hiện trong tiêu chí là chủ ý theo yêu cầu của Mạnh, để mốc đo được; không phải chi tiết cài đặt của feature.
- Sau `/speckit-analyze` (2026-11-07, 14 phát hiện đã duyệt): thêm tình huống 6 (smoke và progress); định nghĩa "nhóm Dời" = 43 hàng của `data-model.md` trừ ba file chưa dời; FR-013 cho phép sửa chú thích yaml; SC-002 đủ ba cỡ (36 ảnh); SC-006 nêu rõ cùng profile và cùng cổng. Chạy lại checklist: 12/12 đạt, 0 `[NEEDS CLARIFICATION]`.
- Mốc `npm run test:e2e`, `npm run lint`, smoke và progress được lấy ở G0 (T007–T011) và ghi vào bảng mốc của `spec.md` trước khi dời file đầu tiên.
- Sẵn sàng cho `/speckit-implement` sau khi chạy lại `/speckit-analyze` và Mạnh đồng ý.
