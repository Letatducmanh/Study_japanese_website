# Feature Specification: Tìm kiếm — nút loa chỉ phát âm, bấm từ nhảy tới đúng hàng (search-speaker-and-jump)

**Feature Branch**: `005-search-speaker-and-jump` (chưa tạo nhánh; hook `before_specify` chỉ ghi thời điểm bắt đầu, không tạo nhánh git)

**Created**: 2026-11-16

**Status**: Draft

**Input**: User description: "Trang tìm kiếm: sửa nút loa và thêm "nhảy tới đúng từ". Hai việc nhỏ, làm thành hai câu chuyện người dùng tách bạch (mỗi câu một commit). Câu chuyện 1 (ưu tiên cao): bấm loa ở kết quả tìm kiếm chỉ phát âm, trang vẫn ở nguyên. Câu chuyện 2: bấm vào một từ vựng ở kết quả thì mở trang bài chứa từ đó, ở tab Từ vựng, tự cuộn tới đúng hàng của từ và tô sáng hàng đó."

## Bối cảnh

Trang `/search` hiện chỉ tìm **từ vựng** (không có kết quả Kanji hay ngữ pháp). Mỗi kết quả là một hàng có nút loa ở đầu hàng, rồi chữ Nhật, romaji và nghĩa tiếng Việt. Quan sát trên mã hiện tại (2026-11-16):

- Nút loa nằm **bên trong** vùng bấm dẫn sang trang bài của cả hàng. Vì vậy bấm loa vừa phát âm vừa chuyển sang trang bài, và người học mất từ khóa, danh sách kết quả và vị trí cuộn. Việc nghi lỗi có từ trước spec 004 chưa kiểm chứng; spec này yêu cầu test tái hiện lỗi (đỏ) trước khi sửa.
- Bấm vào hàng chỉ mở đầu trang bài. Trang bài luôn mở ở tab Từ vựng khi mới vào, nhưng tab đang chọn được giữ trong bộ nhớ của trang, nên khi người học đi từ bài này sang bài khác mà trang không được dựng lại, tab cũ (Ngữ pháp, Kanji) có thể còn nguyên.
- Trang bài có bộ lọc (phần chính/mở rộng, bản mới/cũ) và nút ẩn/hiện nghĩa; một từ có thể đang bị bộ lọc ẩn đi.
- Phần đầu trang (thanh trên) và thanh dưới trên điện thoại dính cố định khi cuộn, có thể che hàng vừa cuộn tới.
- ID từ vựng ổn định và đã chứa số bài (mẫu `<sách>-l<bài>-<hash>`), nên cùng một chữ ở hai bài khác nhau có ID khác nhau.

Người học dùng tìm kiếm để tra nhanh một từ rồi nghe thử; mất danh sách khi chỉ muốn nghe là lỗi gây khó chịu nhất, nên câu chuyện loa đứng trước.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Bấm loa ở kết quả tìm kiếm chỉ phát âm (Priority: P1)

Người học gõ từ khóa, thấy danh sách kết quả, bấm nút loa của một kết quả để nghe và ở nguyên trang tìm kiếm: từ khóa, danh sách kết quả và vị trí cuộn không đổi. Người học có thể bấm loa liên tiếp ở nhiều kết quả để so sánh cách đọc.

**Why this priority**: Đây là lỗi làm hỏng việc tra từ: mỗi lần nghe thử, người học bị đẩy khỏi danh sách và phải gõ lại. Sửa nhỏ, giá trị rõ.

**Independent Test**: Mở `/search`, gõ một từ khóa ra nhiều kết quả, cuộn xuống vài hàng, bấm loa ở một hàng; xác nhận địa chỉ vẫn là `/search?q=...`, ô tìm kiếm và danh sách không đổi, vị trí cuộn không nhảy. Test này phải ĐỎ trên mã hiện tại.

**Acceptance Scenarios**:

1. **Given** trang tìm kiếm có từ khóa và danh sách kết quả, **When** người học bấm loa ở một kết quả, **Then** giọng đọc phát; trang vẫn là trang tìm kiếm; từ khóa, danh sách kết quả và vị trí cuộn không đổi.
2. **Given** danh sách có nhiều kết quả, **When** người học bấm loa lần lượt ở nhiều kết quả liên tiếp, **Then** mỗi lần đều chỉ phát âm, trang không chuyển và không có thông báo lỗi nào.
3. **Given** người học dùng bàn phím, **When** nhấn Tab, **Then** tiêu điểm đi tới nút loa (và tới phần bấm-để-mở-bài của từng hàng); **When** nhấn Enter hoặc Space ở nút loa, **Then** chỉ phát âm, không điều hướng.
4. **Given** người dùng trình đọc màn hình, **When** tiêu điểm vào nút loa, **Then** nút được đọc là nút phát âm bằng tiếng Việt, tách biệt với phần mở bài của hàng.
5. **Given** thiết bị không có giọng đọc tiếng Nhật, **When** mở trang tìm kiếm, **Then** nút loa vẫn tự ẩn như hiện nay (không đổi hành vi này) và hàng vẫn bấm để mở bài được.
6. **Given** mọi loại kết quả có nút loa, **When** bấm loa, **Then** hành vi như trên (hiện chỉ có từ vựng là loại kết quả có loa; xem FR-006).

---

### User Story 2 - Bấm một từ ở kết quả thì nhảy tới đúng hàng của từ trong trang bài (Priority: P2)

Người học bấm vào một từ vựng ở kết quả (ngoài nút loa) và đến trang bài chứa từ đó, ở tab Từ vựng, trang tự cuộn tới đúng hàng của từ và hàng đó được tô sáng bằng viền hoặc nhãn, nên người học thấy ngay từ mình vừa tìm trong bài, không phải tìm lại giữa vài chục hàng.

**Why this priority**: Giúp tra từ liền mạch, nhưng trang bài vẫn dùng được khi chưa có tính năng này, nên sau câu chuyện sửa lỗi loa.

**Independent Test**: Tìm một từ ở giữa hoặc cuối bài dài, bấm vào từ (không bấm loa); xác nhận ở trang bài đang là tab Từ vựng, hàng của từ nằm trọn trong khung nhìn, không bị thanh trên che, và có dấu hiệu tô sáng ngoài màu. Bấm Quay lại, trở về `/search` với từ khóa cũ.

**Acceptance Scenarios**:

1. **Given** kết quả tìm kiếm của một từ, **When** người học bấm vào phần thân của hàng (không phải nút loa), **Then** mở trang bài chứa từ đó, ở tab Từ vựng, cuộn tới hàng của từ; hàng nằm trọn trong khung nhìn, không bị thanh phía trên (hoặc thanh dưới) che.
2. **Given** trang đã nhảy tới từ, **When** nhìn hàng đó, **Then** hàng được tô sáng bằng viền hoặc nhãn chữ (không chỉ khác màu), tương phản đủ ở cả giao diện sáng và tối.
3. **Given** lần trước người học ở trang bài đó nhưng đang ở tab Ngữ pháp hoặc Kanji, **When** bấm từ từ kết quả tìm kiếm, **Then** trang bài mở ở tab Từ vựng.
4. **Given** từ đang bị ẩn bởi bộ lọc (phần chính/mở rộng, bản mới/cũ), kể cả từ thuộc phần từ mở rộng, **When** người học bấm từ đó từ tìm kiếm, **Then** từ vẫn hiện ra trong trang bài và được nhảy tới, tô sáng; người học vẫn đổi lại được bộ lọc sau đó.
5. **Given** hai từ có cùng cách đọc hoặc cùng chữ nằm ở hai bài khác nhau (hoặc hai hàng gần nhau), **When** người học bấm một trong hai, **Then** trang bài đúng của từ đó mở và đúng hàng của từ được bấm được tô sáng, không phải hàng của từ kia.
6. **Given** địa chỉ có thông tin nhảy nhưng từ không còn trong bài (ID cũ, ví dụ từ đã đổi), **When** mở địa chỉ đó, **Then** trang bài mở bình thường ở tab Từ vựng, không lỗi, không trang trắng, không có hàng nào bị tô sáng và không có thông báo lỗi dành cho người học.
7. **Given** trang đã nhảy tới từ, **When** người học tải lại trang (F5), **Then** kết quả giống lần đầu (cùng tab, cùng hàng được cuộn tới và tô sáng); địa chỉ trang chứa đủ thông tin để nhảy lại.
8. **Given** người học đã nhảy tới từ, **When** bấm nút Quay lại của trình duyệt, **Then** về `/search` với từ khóa cũ và danh sách kết quả cũ.
9. **Given** thiết bị bật chế độ giảm chuyển động, **When** trang cuộn tới hàng, **Then** cuộn tức thì, không cuộn mượt; tô sáng vẫn hiện bình thường.
10. **Given** kết quả hiển thị loại khác (nếu sau này có Kanji, ngữ pháp), **When** bấm, **Then** giữ cách mở hiện tại, không bị đổi bởi feature này.

---

### Edge Cases

- Người học bấm loa rồi ngay lập tức bấm loa ở kết quả khác khi giọng đang đọc: không chuyển trang, không báo lỗi; hành vi phát chồng/cắt tiếng giữ như hiện nay của bộ đọc (không đổi bộ đọc).
- Người học bấm vào mép giữa nút loa và vùng bấm mở bài: mỗi vị trí chỉ kích hoạt đúng một việc; vùng chạm của loa không nhỏ hơn hiện nay (44×44px).
- Từ nằm ở đầu trang bài (đã nằm sẵn trong khung nhìn): vẫn tô sáng; trang có thể cuộn nhẹ để căn giữa.
- Bài rất dài hoặc nội dung bài tải chậm: cuộn và tô sáng xảy ra sau khi hàng đã hiện ra, không cuộn vào chỗ trống.
- Bộ lọc nới ra để hiện từ ẩn: bộ lọc khác không liên quan tới từ giữ nguyên.
- Nút "ẩn nghĩa" đang bật khi nhảy tới: hàng vẫn được tô sáng và nhìn thấy; nghĩa giữ trạng thái người học đã chọn.
- Từ khóa tìm kiếm chứa ký tự đặc biệt, hoặc địa chỉ trang bài bị sửa tay (ID rác): trang bài mở bình thường, không lỗi.
- Người học đi từ bài này sang bài khác bằng các liên kết khác (không từ tìm kiếm): không có hàng nào bị tô sáng và hành vi mở trang bài không đổi.
- Giữ nguyên cái chớp "Không tìm thấy kết quả." sau thời gian chờ gõ (nợ đã ghi ở pages-migration); không sửa trong spec này.

## Requirements *(mandatory)*

### Functional Requirements

**Câu chuyện 1 — nút loa**

- **FR-001**: Ở mọi kết quả tìm kiếm có nút loa, bấm loa MUST chỉ phát âm: trang vẫn là trang tìm kiếm, từ khóa, danh sách kết quả và vị trí cuộn MUST không đổi, lịch sử trình duyệt MUST không thêm mục.
- **FR-002**: Bấm loa liên tiếp ở nhiều kết quả MUST không làm chuyển trang và MUST không phát sinh thông báo lỗi nào (kể cả lỗi trong bảng điều khiển trình duyệt).
- **FR-003**: Nút loa MUST dùng được bằng bàn phím: Tab tới được; Enter và Space chỉ phát âm, không điều hướng. Phần bấm-để-mở-bài của hàng MUST cũng tới được và kích hoạt được bằng bàn phím một cách riêng biệt.
- **FR-004**: Vùng chạm của nút loa MUST không nhỏ hơn hiện tại (ít nhất 44×44px); nút MUST có nhãn tiếng Việt đọc được cho trình đọc màn hình, lấy từ nơi chứa chuỗi giao diện chung.
- **FR-005**: Hành vi cách đọc (chuỗi được đọc, chọn giọng, ẩn nút khi không có giọng tiếng Nhật) MUST giữ nguyên; feature này không đổi bộ đọc, cách làm sạch chuỗi đọc hay bảng sửa cách đọc.
- **FR-006**: Hệ thống MUST có test tái hiện lỗi (đỏ trên mã hiện tại) trước khi sửa; báo cáo hoàn thành MUST nêu loại kết quả nào hiện có nút loa (hiện: chỉ từ vựng) và rằng sửa áp dụng cho mọi loại có loa.

**Câu chuyện 2 — nhảy tới đúng từ**

- **FR-007**: Bấm phần thân của một kết quả từ vựng (ngoài nút loa) MUST mở trang bài chứa từ đó, ở tab Từ vựng, kể cả khi trước đó người học đang ở tab khác của bài đó.
- **FR-008**: Trang bài MUST cuộn tới đúng hàng của từ được bấm và hàng MUST nằm trọn trong khung nhìn, không bị thanh phía trên hoặc thanh dưới che.
- **FR-009**: Hàng của từ MUST được tô sáng bằng dấu hiệu không chỉ dựa vào màu (viền và/hoặc nhãn chữ tiếng Việt), theo Constitution VI; tương phản chữ ≥ 4.5:1 ở sáng và tối; dùng token giao diện sẵn có.
- **FR-010**: Nếu từ bị ẩn bởi bộ lọc (phần chính/mở rộng, bản mới/cũ), hệ thống MUST làm cho nó hiện ra rồi mới cuộn tới; chỉ nới bộ lọc ở mức cần để hiện từ, người học vẫn đổi lại bộ lọc được.
- **FR-011**: Việc xác định hàng MUST theo ID của từ, không theo chữ hay cách đọc, để từ trùng chữ/cách đọc (cùng bài hoặc khác bài) nhảy đúng hàng được bấm.
- **FR-012**: Nếu ID không còn trong bài (ID cũ hoặc địa chỉ bị sửa), trang bài MUST mở bình thường ở tab Từ vựng, không lỗi, không trang trắng, không tô sáng hàng nào, không thông báo lỗi cho người học.
- **FR-013**: Địa chỉ trang bài sau khi nhảy MUST chứa đủ thông tin để tải lại (F5) cho kết quả giống lần đầu: cùng bài, cùng tab, cùng hàng được cuộn tới và tô sáng.
- **FR-014**: Nút Quay lại của trình duyệt MUST đưa người học về `/search` với từ khóa cũ.
- **FR-015**: Khi người học bật giảm chuyển động (prefers-reduced-motion), việc cuộn tới hàng MUST là tức thì, không cuộn mượt.
- **FR-016**: Các loại kết quả khác ngoài từ vựng (Kanji, ngữ pháp, nếu có) MUST giữ cách mở hiện tại; báo cáo hoàn thành MUST nêu hiện chúng mở đi đâu (hiện: trang tìm kiếm chưa có loại kết quả nào ngoài từ vựng).
- **FR-017**: Việc mở trang bài không từ tìm kiếm (từ danh sách bài, từ sách) MUST giữ nguyên, không có hàng tô sáng.

**Ràng buộc chung**

- **FR-018**: Feature MUST không đổi: cách chấm điểm, nội dung giáo trình, phát âm (bộ đọc, bộ làm sạch chuỗi đọc, bảng sửa cách đọc), registry dạng bài, session, grading, pipeline nội dung, `schemaVersion`.
- **FR-019**: Feature MUST không sửa cái chớp "Không tìm thấy kết quả." sau thời gian chờ gõ và MUST không viết lại tab Học; chỉ thêm đúng phần cần để nhảy tới từ.
- **FR-020**: Mọi chuỗi giao diện mới (nhãn loa nếu đổi, nhãn tô sáng) MUST nằm ở nơi chứa chuỗi tiếng Việt chung; chữ Nhật có `lang="ja"`.
- **FR-021**: Hai câu chuyện MUST tách thành hai commit độc lập (câu chuyện 1 trước), mỗi commit tự đứng được và `npm run check` xanh.

### Key Entities

- **Kết quả tìm kiếm từ vựng**: một từ khớp từ khóa; gồm ID từ, sách, số bài, cách đọc kana, chữ Hán (nếu có), romaji, nghĩa.
- **Đích nhảy**: thông tin cho biết trang bài nào, tab nào, từ nào cần cuộn tới và tô sáng; phải sống được qua tải lại trang và nút Quay lại.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Ở màn hình 360×740, 100% lần bấm loa (kể cả 5 lần liên tiếp ở 5 kết quả khác nhau) giữ địa chỉ ở `/search`, giữ từ khóa và số kết quả, và không có lỗi nào.
- **SC-002**: Test tái hiện lỗi loa đỏ trên mã trước khi sửa và xanh sau khi sửa (bằng chứng Constitution IV).
- **SC-003**: Với nút loa, Enter và Space cho 0 lần điều hướng; nút có nhãn đọc được và vùng chạm ≥ 44×44px.
- **SC-004**: Ở 360×740, sau khi bấm một từ ở kết quả, 100% trường hợp thử (từ đầu, giữa, cuối bài; từ mở rộng; từ bị bộ lọc ẩn; trước đó đang ở tab Ngữ pháp) có hàng của từ nằm trọn trong khung nhìn, không bị thanh trên che, đang tô sáng và tab Từ vựng đang mở.
- **SC-005**: Với cặp từ trùng chữ hoặc cách đọc, 100% lần bấm nhảy đúng hàng của từ được bấm.
- **SC-006**: Tải lại (F5) cho cùng kết quả như lần đầu; mở địa chỉ với ID không tồn tại cho trang bài bình thường, 0 lỗi, 0 trang trắng.
- **SC-007**: Bấm Quay lại từ trang bài về `/search` với đúng từ khóa cũ trong ô tìm kiếm.
- **SC-008**: Khi bật giảm chuyển động, 0 hoạt ảnh cuộn mượt; hàng vẫn được tô sáng.
- **SC-009**: Hàng tô sáng nhận ra được không dựa vào màu (có viền hoặc nhãn chữ), kiểm bằng ảnh chụp 360×740 ở giao diện sáng và tối lưu ở `.screens/`.
- **SC-010**: `npm run check` xanh, các test e2e hiện có (tìm kiếm, duyệt bài) vẫn xanh, và không có khác biệt ở các phần ở FR-018.
- **SC-011**: Người học (chủ dự án) xem ảnh chụp 360×740 và thử trên điện thoại, xác nhận hai việc: bấm loa không rời trang tìm kiếm; bấm từ nhảy đúng hàng được tô sáng.

## Assumptions

- Tìm kiếm hiện chỉ trả về từ vựng của sách giáo trình; Kanji và ngữ pháp chưa có kết quả riêng. Spec chỉ tuân theo FR-016 nếu sau này có.
- ID từ vựng đã duy nhất trong từng bài và đã chứa số bài; dùng ID là đủ để phân biệt từ trùng chữ giữa các bài.
- "Tô sáng" tồn tại cho tới khi người học rời trang bài hoặc chọn một hàng khác; không cần tự tắt sau một thời gian. (Giả định hợp lý; quyết định chi tiết ở plan.)
- Khi từ bị bộ lọc ẩn, nới bộ lọc về mức vừa đủ hiện từ (ví dụ về "Tất cả") là chấp nhận được; người học đổi lại được.
- Thanh trên và thanh dưới cố định là các phần có thể che hàng; chỗ chừa khi cuộn phải tính cả hai trên điện thoại.
- Thời gian chờ gõ và cái chớp "Không tìm thấy kết quả." giữ nguyên (nợ của pages-migration).
- Tab Học và bộ giao diện mới (ui-kit-and-shell) là việc của feature khác; feature này chạy được trên giao diện hiện tại và không chặn việc đó.
- Cách thể hiện cụ thể (đặt thông tin nhảy ở đâu trong địa chỉ, cách cuộn) thuộc `plan.md`, theo `docs/FRONTEND.md` và `docs/ARCHITECTURE.md`.

## Out of Scope

- Thêm loại kết quả Kanji hoặc ngữ pháp vào tìm kiếm.
- Đổi thuật toán tìm kiếm, xếp hạng, thời gian chờ gõ, cái chớp "Không tìm thấy kết quả.".
- Đổi bộ đọc, bộ làm sạch chuỗi đọc, bảng sửa cách đọc, nội dung, chấm điểm, registry, session, grading, pipeline, `schemaVersion`.
- Viết lại tab Học, trang bài hoặc bộ giao diện chung.
- Nhảy tới mục ở tab Ngữ pháp hoặc Kanji.
