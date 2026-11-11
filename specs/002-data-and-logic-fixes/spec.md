# Feature Specification: Sửa lỗi dữ liệu và logic (data-and-logic-fixes)

**Feature Branch**: `002-data-and-logic-fixes`

**Created**: 2026-11-07

**Status**: Draft

**Input**: User description: "Sửa các lỗi dữ liệu và logic mà người học nhìn thấy, không đổi giao diện: (1) chữ Kanji có nhiều cách đọc/nghĩa hiển thị sai Hán Việt, ví dụ 行 phải là "HÀNH (đi; tiến hành) / HÀNG (hàng, dòng)"; (2) tìm kiếm trả về quá nhiều kết quả không liên quan; (3) trang Điểm yếu đang xếp các bài chưa học lần nào là "yếu nhất" với 0%; (4) nút luyện ngay từ trang Điểm yếu và Sổ lỗi sai phải chạy đủ các dạng bài dự kiến, không âm thầm bỏ dạng; (5) ba mục không thuộc danh sách từ chính của giáo trình (DVD, おなかが すきます, のどが かわきます) nằm ở phần từ vựng mở rộng, và số liệu từ chính/mở rộng trong kiểm thử và tài liệu khớp với thực tế. Mỗi lỗi có test tái hiện lỗi trước khi sửa."

**Tài liệu gốc để đối chiếu**: `docs/ARCHITECTURE.md` §9.2 (phạm vi spec này), `docs/SPECKIT_ROADMAP.md` §2 (quyết định số 4) và §4.2, `docs/reference/design/AUDIT.md` §7 (bản 27/10, đã xác minh lại trên mã hiện tại ở mục Assumptions), `.specify/memory/constitution.md` nguyên tắc I, IV, V.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Trang Điểm yếu chỉ nêu những bài người học đã làm (Priority: P1)

Người học mở trang "Điểm yếu của tôi" sau vài buổi luyện. Mục "Bài có độ thành thạo thấp nhất" chỉ liệt kê những bài họ đã thực sự làm và còn kém. Bài chưa từng đụng tới không xuất hiện ở đó với "0% thuộc", vì như thế họ không biết mình yếu hay chỉ là chưa học.

**Why this priority**: Mục tiêu số một của sản phẩm là chỉ ra người học yếu ở đâu (constitution V). Hiện danh sách "yếu nhất" bị các bài chưa học chiếm chỗ nên thông tin sai lệch ngay trên màn hình quan trọng nhất.

**Independent Test**: Làm một vài câu ở Bài 3 (cố ý sai nhiều) rồi mở trang Điểm yếu. Bài 3 phải xuất hiện, và không có bài nào chưa làm câu nào xuất hiện trong mục "bài thấp nhất".

**Acceptance Scenarios**:

1. **Given** người học mới chỉ làm bài ở Bài 3 và Bài 5, **When** mở trang Điểm yếu, **Then** mục bài thấp nhất chỉ gồm Bài 3 và Bài 5 (xếp theo độ thành thạo tăng dần), không có bài nào khác.
2. **Given** người học chưa làm câu nào ở bất kỳ bài nào, **When** mở trang Điểm yếu, **Then** thấy thông báo chưa đủ dữ liệu như hiện nay, không thấy danh sách bài nào với 0%.
3. **Given** một bài mà người học đã làm nhưng tất cả đều sai (độ thành thạo 0%), **When** mở trang Điểm yếu, **Then** bài đó vẫn được liệt kê (đã làm và thật sự yếu), khác với bài chưa làm.
4. **Given** bản đồ màu theo bài ở trang giáo trình, **When** một bài chưa có lượt làm, **Then** bài đó hiện ở trạng thái "chưa có dữ liệu" (màu trung tính) thay vì màu đỏ 0% như hiện nay; đây là cùng một lỗi (bài chưa học bị coi là 0%), không phải thay đổi bố cục hay thiết kế.

---

### User Story 2 - "Luyện ngay" chạy đúng và đủ những gì nút hứa (Priority: P1)

Người học bấm "Luyện ngay 20 câu yếu nhất" ở trang Điểm yếu, hoặc "Ôn lại" một từ ở Sổ lỗi sai. Phiên luyện gồm đủ các dạng bài đã định cho nút đó (thẻ ghi nhớ và hai hướng trắc nghiệm Nhật → Nghĩa, Nghĩa → Nhật), và gồm đúng những từ mà nút nói tới, không âm thầm rơi bớt dạng bài hay bớt từ.

**Why this priority**: Đây là bước biến "biết mình yếu" thành "luyện lại chỗ yếu". Nếu nút chỉ chạy thẻ ghi nhớ, hoặc chỉ ôn từ của một bài trong khi nhãn nói "20 câu yếu nhất", người học bị đánh lừa và mục tiêu số một bị cụt.

**Independent Test**: Tạo vài từ yếu ở nhiều bài khác nhau, bấm "Luyện ngay": phiên chạy phải có thể ra cả thẻ ghi nhớ lẫn hai hướng trắc nghiệm, và các từ trong phiên lấy từ danh sách yếu nhất, không chỉ từ một bài.

**Acceptance Scenarios**:

1. **Given** Sổ lỗi sai có một từ, **When** bấm "Ôn lại" từ đó, **Then** phiên luyện vẫn có đủ đáp án nhiễu để dùng được cả hai hướng trắc nghiệm (không chỉ còn thẻ ghi nhớ).
2. **Given** có 12 từ yếu thuộc 3 bài khác nhau, **When** bấm "Luyện ngay 20 câu yếu nhất", **Then** tập từ của phiên gồm đủ 12 từ và phiên có 12 câu, không chỉ gồm các từ của bài đứng đầu.
3. **Given** một dạng bài trong danh sách dự kiến của nút không dùng được vì lý do nào đó, **When** phiên được tạo, **Then** người học không bị bỏ qua dạng đó trong im lặng: dạng thiếu phải có thể phát hiện được (test bắt được) thay vì biến mất.
4. **Given** phiên "Luyện ngay" kết thúc, **When** xem kết quả, **Then** các lượt trả lời vẫn được ghi vào tiến độ như mọi phiên luyện khác.

---

### User Story 3 - Hán Việt và nghĩa của Kanji hiển thị đúng (Priority: P1)

Người học mở trang chi tiết của một chữ Kanji có hai cụm Hán Việt, ví dụ 行. Họ thấy "HÀNH (đi; tiến hành) / HÀNG (hàng, dòng)" đúng như trong giáo trình, không bị mất dấu ngoặc hay nuốt chữ. Các câu hỏi Hán Việt trong luyện tập dùng đúng dữ liệu đó.

**Why this priority**: Nội dung sai trong sách học làm người học nhớ sai. Sai ở tầng dữ liệu nên ảnh hưởng mọi nơi hiện nội dung Kanji.

**Independent Test**: Dựng lại dữ liệu nội dung và mở Kanji 行: phần Hán Việt và phần nghĩa khớp nguyên văn với nguồn. So sánh dữ liệu Kanji trước và sau khi sửa: chỉ khác ở các chữ có nhiều hơn một cặp ngoặc trong ô nghĩa.

**Acceptance Scenarios**:

1. **Given** ô nghĩa của 行 là "HÀNH (đi; tiến hành) / HÀNG (hàng, dòng)", **When** nội dung được dựng, **Then** người học thấy đúng chuỗi đó, hai cụm Hán Việt đầy đủ, không có dấu ngoặc đóng hay mở thừa/thiếu.
2. **Given** một chữ Kanji chỉ có một cụm "HÁN VIỆT (nghĩa)", **When** nội dung được dựng, **Then** kết quả giống hệt trước khi sửa.
3. **Given** một ô nghĩa có ba cụm Hán Việt hoặc dấu ngoặc lồng nhau, **When** nội dung được dựng, **Then** hoặc hiển thị đúng nguyên văn, hoặc báo lỗi rõ kèm số dòng; không bao giờ hiển thị cắt sai.
4. **Given** một ô nghĩa sai quy cách (không có ngoặc), **When** nội dung được dựng, **Then** vẫn báo lỗi kèm số dòng như hiện nay.

---

### User Story 4 - Tìm kiếm trả về kết quả liên quan (Priority: P2)

Người học gõ một từ vào ô tìm kiếm (kana, Kanji, romaji, hoặc tiếng Việt có/không dấu) và thấy ngay những từ đúng ở đầu danh sách, không bị lẫn hàng chục từ chẳng liên quan.

**Why this priority**: Tìm kiếm là đường tắt để tra từ; kết quả nhiễu làm người học mất niềm tin vào công cụ, nhưng không làm sai tiến độ học nên xếp sau ba mục trên.

**Independent Test**: Gõ một bộ truy vấn mẫu (romaji, kana, Kanji, tiếng Việt có dấu, tiếng Việt không dấu); mỗi truy vấn phải đưa từ đúng lên đầu và không kèm kết quả không liên quan rõ ràng.

**Acceptance Scenarios**:

1. **Given** người học gõ "gakusei", **When** xem kết quả, **Then** 学生 (がくせい) đứng đầu và danh sách ngắn gọn, tập trung quanh từ đó.
2. **Given** người học gõ "nuoc ngoai" (không dấu), **When** xem kết quả, **Then** 外国 vẫn xuất hiện ở đầu (hành vi hiện có được giữ).
3. **Given** người học gõ một từ tiếng Việt có dấu như "sinh viên", **When** xem kết quả, **Then** các mục có nghĩa chứa cụm đó đứng trước; mục chỉ gần giống vì sai vài ký tự không chen lên trên.
4. **Given** người học gõ một chuỗi chẳng khớp từ nào, **When** xem kết quả, **Then** thấy thông báo "Không tìm thấy kết quả", không phải danh sách mờ nhạt vì khớp gần đúng quá lỏng.
5. **Given** người học đang gõ liên tục, **When** gõ từng ký tự, **Then** danh sách cập nhật mượt, không nháy kết quả lung tung theo từng phím.

---

### User Story 5 - Số liệu từ chính / từ mở rộng khớp thực tế (Priority: P2)

Giáo trình có 1.020 từ chính và 275 từ mở rộng. Ba mục hiện đang nằm nhầm ở phần từ chính (DVD ở Bài 6; おなかが すきます và のどが かわきます ở Bài 13) được chuyển sang từ mở rộng. Kiểm thử và mọi tài liệu ghi số này đều nói đúng 1.020 và 275.

**Why this priority**: Độ thành thạo của một bài tính theo số từ chính, nên ba từ thừa làm lệch phần trăm ở Bài 6 và Bài 13; ngoài ra tài liệu và test đang nói một đằng, dữ liệu một nẻo.

**Independent Test**: Dựng nội dung và đếm: 1.020 từ chính và 275 từ mở rộng toàn giáo trình, trong đó Bài 6 và Bài 13 mỗi bài có từ mở rộng tăng đúng số mục đã chuyển. Một test riêng kiểm số từ chính và một test riêng kiểm số từ mở rộng.

**Acceptance Scenarios**:

1. **Given** nội dung hiện có 1.023 từ chính và 272 từ mở rộng, **When** ba mục được chuyển, **Then** dựng nội dung ra 1.020 từ chính và 275 từ mở rộng.
2. **Given** người học đã có tiến độ ở DVD, おなかが すきます hoặc のどが かわきます, **When** nội dung được cập nhật, **Then** tiến độ đó vẫn còn nguyên và vẫn gắn đúng từ (mã định danh của từ không đổi).
3. **Given** học một bài chỉ với từ chính, **When** mở Bài 6 hoặc Bài 13, **Then** ba mục trên không còn trong danh sách từ chính nhưng vẫn xem được khi bật từ mở rộng.
4. **Given** các tài liệu của dự án nêu số từ chính / mở rộng, **When** soát lại, **Then** không còn tài liệu nào ghi 1.023 hoặc 272; mọi chỗ ghi số liệu này đều là 1.020 và 275 (hoặc nói rõ là số lịch sử).
5. **Given** bộ kiểm thử số lượng nội dung, **When** chạy, **Then** nó kiểm riêng số từ chính, số từ mở rộng, số mẫu ngữ pháp, số Kanji và Kanji phụ lục thay vì chỉ một số.

---

### Edge Cases

- Kanji có ô nghĩa với ba cụm Hán Việt, cụm có dấu chấm phẩy bên trong, hoặc dấu ngoặc lồng nhau: không được hiển thị cắt sai; nếu không đọc được thì báo lỗi kèm số dòng.
- Người học có mastery ở bài mà mọi từ đều chưa có điểm ở một kỹ năng khác: "đã làm" tính theo việc có ít nhất một lượt trả lời trong bài, không theo từng kỹ năng.
- Người học chỉ luyện Ngữ pháp hoặc Kanji, chưa luyện từ vựng bài nào: trang Điểm yếu vẫn hiển thị mục "bài thấp nhất" theo cách hiện có (rỗng nếu không có dữ liệu từ vựng), không báo lỗi.
- Phiên "Luyện ngay" chỉ có 1 từ yếu (hoặc 2–3 từ): vẫn dùng được đủ dạng bài dù ít từ để lấy đáp án nhiễu.
- Một từ yếu thuộc giáo trình không còn trong nội dung (đã xóa): bị bỏ qua, không làm phiên hỏng.
- Truy vấn rỗng, chỉ có khoảng trắng, hoặc chỉ một ký tự: không trả về danh sách dài vô nghĩa.
- Chuyển ba mục sang từ mở rộng khi người học đang tắt "gồm từ vựng mở rộng": từ đó không xuất hiện ở luyện tập bài; không coi là mất tiến độ.
- Bài 6 và Bài 13 giảm số từ chính (mẫu số của độ thành thạo bài): phần trăm thành thạo hai bài này có thể nhích nhẹ; chấp nhận được.

## Requirements *(mandatory)*

### Functional Requirements

**Điểm yếu (US1)**

- **FR-001**: Mục "Bài có độ thành thạo thấp nhất" trên trang Điểm yếu MUST chỉ gồm những bài mà người học đã có ít nhất một lượt trả lời; bài chưa có lượt nào MUST NOT xuất hiện ở đó.
- **FR-002**: Khi không có bài nào đủ điều kiện, trang MUST hiện thông báo chưa đủ dữ liệu như hiện nay, không hiện danh sách rỗng hay danh sách 0%.
- **FR-003**: Bài đã làm nhưng độ thành thạo 0% MUST vẫn được liệt kê.
- **FR-004**: Ở trang giáo trình, bài chưa có lượt làm MUST hiện trạng thái "chưa có dữ liệu" (màu trung tính đã có sẵn trong thiết kế), không còn hiện như bài 0%. Bài đã làm giữ nguyên màu theo độ thành thạo.

**Luyện ngay (US2)**

- **FR-005**: Phiên luyện mở từ nút "Luyện ngay" (Điểm yếu) và "Ôn lại" (Sổ lỗi sai) MUST có khả năng ra đủ các dạng bài mà nút đó khai báo: thẻ ghi nhớ, trắc nghiệm Nhật → Nghĩa, trắc nghiệm Nghĩa → Nhật.
- **FR-006**: Phiên luyện nói trên MUST có đủ đáp án nhiễu cho dạng trắc nghiệm kể cả khi chỉ có một hoặc vài từ cần ôn; số từ cần ôn ít không được làm dạng trắc nghiệm biến mất.
- **FR-007**: Nút "Luyện ngay 20 câu yếu nhất" MUST tạo phiên có tập từ gồm các từ yếu nhất theo xếp hạng, tối đa 20, kể cả khi chúng thuộc nhiều bài khác nhau; không được chỉ lấy từ của bài đứng đầu. Số câu của phiên bằng số từ trong tập đó. Bộ dựng phiên chọn ngẫu nhiên cặp (từ, dạng bài) nên không bảo đảm mọi từ đều xuất hiện đúng một lần (xem plan.md, mục Quyết định đã chốt).
- **FR-008**: Nếu một mã dạng bài trong danh sách của nút không tồn tại hoặc không dùng được, hệ thống MUST để lộ ra (test hoặc cảnh báo rõ), không lọc bỏ trong im lặng.
- **FR-009**: Các lượt trả lời trong phiên MUST được ghi vào tiến độ giống mọi phiên luyện khác (mã từ, kỹ năng, đúng/sai, thời gian trả lời).

**Kanji (US3)**

- **FR-010**: Khi dựng nội dung, ô "Hán Việt (nghĩa)" của Kanji MUST được tách đúng kể cả khi ô có nhiều hơn một cặp ngoặc; với 行 kết quả MUST khớp nguyên văn "HÀNH (đi; tiến hành) / HÀNG (hàng, dòng)".
- **FR-011**: Với mọi Kanji chỉ có một cặp ngoặc, kết quả sau khi sửa MUST giống hệt kết quả trước khi sửa. So sánh dữ liệu Kanji trước và sau MUST chỉ khác ở các chữ có nhiều cặp ngoặc.
- **FR-012**: Ô nghĩa không đọc được hoặc sai quy cách MUST tiếp tục báo lỗi kèm số dòng; không được tự suy đoán rồi hiển thị sai.
- **FR-013**: Mã định danh của Kanji MUST không đổi.

**Tìm kiếm (US4)**

- **FR-014**: Tìm kiếm MUST xếp khớp ở kana, Kanji và romaji lên trước khớp ở phần nghĩa tiếng Việt, và khớp đúng/đầu từ lên trước khớp gần đúng.
- **FR-015**: Khớp gần đúng (sai vài ký tự) MUST bị hạn chế để không làm tràn danh sách bằng các mục không liên quan, đặc biệt với truy vấn ngắn và với phần nghĩa dài.
- **FR-016**: Kết quả có độ liên quan quá thấp MUST bị loại bỏ; chuỗi chẳng khớp gì MUST cho ra "Không tìm thấy kết quả".
- **FR-017**: Tìm không dấu tiếng Việt (ví dụ "nuoc ngoai" → 外国) MUST tiếp tục hoạt động.
- **FR-018**: Ô tìm kiếm MUST không chạy lại tìm kiếm và đổi kết quả theo từng phím gõ dồn dập; kết quả chỉ cập nhật khi người học ngừng gõ trong chốc lát.

**Số liệu từ vựng (US5)**

- **FR-019**: DVD (Bài 6), おなかが すきます và のどが かわきます (Bài 13) MUST nằm trong từ vựng mở rộng của đúng bài, không nằm trong từ chính.
- **FR-020**: Sau khi chuyển, nội dung dựng ra MUST có đúng 1.020 từ chính và 275 từ mở rộng.
- **FR-021**: Mã định danh của ba từ này MUST không đổi để tiến độ cũ không mất.
- **FR-022**: Bộ kiểm thử nội dung MUST kiểm riêng số từ chính, số từ mở rộng, số mẫu ngữ pháp, số Kanji và số Kanji phụ lục, theo các giá trị thực tế.
- **FR-023**: Mọi tài liệu của dự án nêu số từ chính / mở rộng (kể cả `docs/ARCHITECTURE.md`, `docs/SPECKIT_ROADMAP.md`, `docs/reference/Ke_hoach_Website.md`, README của pipeline nếu có) MUST khớp 1.020 và 275.

**Chung**

- **FR-024**: Mỗi lỗi ở trên MUST có ít nhất một test tái hiện lỗi, được viết và xác nhận là đỏ trước khi sửa (constitution IV).
- **FR-025**: Feature MUST không đổi giao diện: không đổi màu, chữ, bố cục, nội dung chuỗi nhìn thấy trừ dữ liệu được sửa đúng.
- **FR-026**: Feature MUST không sửa registry (đăng ký dạng bài), session (bộ dựng phiên) và grading (chấm điểm) (constitution III). FR-005–FR-008 được thực hiện ở phía gọi (`PracticeRunPage`, `WeaknessPage`), truyền `ctxPool` có sẵn của bộ dựng phiên.
- **FR-027**: Cả bộ kiểm tra chung của dự án MUST xanh sau khi xong.
- **FR-028**: Test `scripts/content/pipeline.test.ts` MUST không bị quá hạn khi chạy trong `npm run check` (Q-1 của spec 001, đưa vào phạm vi spec này). Chỉ tăng timeout riêng cho file đó; không đổi cấu hình kiểm thử chung, không đổi test khác. Ba lần chạy `npm run check` liên tiếp đều xanh, kết quả ghi vào `evidence.md`.

### Key Entities

- **Kanji (chữ Hán)**: một chữ có số nét, âm Kun/On, một hoặc nhiều cụm "Hán Việt (nghĩa)", ví dụ minh họa; mã định danh gắn với chính chữ đó.
- **Từ vựng**: có mã định danh ổn định, thuộc một bài, nằm ở phần "chính" hoặc "mở rộng"; phần không ảnh hưởng mã định danh.
- **Độ thành thạo của bài**: trung bình điểm các từ chính trong bài; chỉ có ý nghĩa "yếu" khi bài đã có lượt làm.
- **Phiên "Luyện ngay"**: tập từ cần ôn cùng danh sách dạng bài dự kiến, tạo từ trang Điểm yếu hoặc Sổ lỗi sai.
- **Kết quả tìm kiếm**: một từ vựng khớp với truy vấn, kèm độ liên quan dùng để xếp thứ tự và lọc.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Với dữ liệu mẫu có tiến độ ở 2 bài, mục "bài thấp nhất" liệt kê đúng 2 bài đó và 0 bài chưa làm (trước khi sửa: liệt kê tối đa 5 bài, phần lớn là bài chưa làm).
- **SC-002**: Với 1 từ trong Sổ lỗi sai, qua nhiều seed, cả 3 dạng bài dự kiến (thẻ ghi nhớ, Nhật → Nghĩa, Nghĩa → Nhật) đều xuất hiện; trước khi sửa chỉ còn thẻ ghi nhớ.
- **SC-003**: Với 12 từ yếu thuộc 3 bài, tập từ của phiên "Luyện ngay" gồm đủ 12 từ và phiên có 12 câu (trước khi sửa: chỉ các từ của 1 bài).
- **SC-004**: 100% chữ Kanji có nhiều cặp ngoặc hiển thị đủ các cụm Hán Việt theo đúng nguyên văn nguồn; 0 chữ Kanji một cặp ngoặc thay đổi so với trước.
- **SC-005**: Với bộ truy vấn mẫu (ít nhất 8 truy vấn gồm romaji, kana, Kanji, tiếng Việt có dấu và không dấu), từ đúng đứng ở vị trí 1 hoặc nằm trong 3 kết quả đầu ở 100% truy vấn, và hai truy vấn "sinh vien" và "nhat ban" mỗi truy vấn trả tối đa 3 kết quả với từ đúng (学生 và 日本) xếp hạng 1 (hiện tại lần lượt 156 và 246 kết quả).
- **SC-006**: Một truy vấn vô nghĩa không trả về bất kỳ kết quả nào.
- **SC-007**: Nội dung dựng ra có đúng 1.020 từ chính và 275 từ mở rộng; không còn tài liệu nào ghi 1.023 hoặc 272 như số hiện hành.
- **SC-008**: Người học có tiến độ trước đó mở lại ứng dụng thấy 100% tiến độ của ba từ được chuyển còn nguyên.
- **SC-009**: Cả bộ kiểm tra chung của dự án xanh, và mỗi lỗi trong 5 lỗi có ít nhất một test từng đỏ trước khi sửa.

## Assumptions

- **Xác minh lại audit 27/10 trên mã hiện tại (6/11):**
  - Lỗi bài chưa học (US1) còn lan sang trang giáo trình: bài chưa làm hiện đỏ như bài 0% vì cùng một phép tính (đã chỉnh FR-004 cho đúng thực tế).
  - Lỗi Kanji (US3) và lỗi bài chưa học (US1) vẫn còn nguyên: ô nghĩa của 行 trong nguồn đúng, lỗi nằm ở bước tách chuỗi; bài chưa làm vẫn được tính 0% và chiếm đầu danh sách.
  - Lỗi tìm kiếm (US4) vẫn còn: khớp gần đúng lỏng áp lên cả phần nghĩa, không có ngưỡng, không trễ khi gõ.
  - Giả thuyết trong audit về mã dạng bài `mcq-jp-vi` / `mcq-vi-jp` không có trong danh sách đăng ký **không còn đúng**: cả hai đã được đăng ký. Nguyên nhân thật của US2 khác: ở phiên "Ôn lại" một từ, trắc nghiệm không có đủ từ làm đáp án nhiễu nên chỉ còn thẻ ghi nhớ; và nút "Luyện ngay 20 câu yếu nhất" chỉ lấy từ của một bài.
- Với "Luyện ngay 20 câu yếu nhất", mặc định lấy tối đa 20 từ yếu nhất theo xếp hạng hiện có, bất kể bài; phiên được ghi tiến độ dưới bài của từng từ. Cách đặt tên và giao diện nút giữ nguyên.
- "Đã làm" một bài nghĩa là có ít nhất một lượt trả lời trên một từ của bài đó, theo bản ghi tiến độ hiện có.
- Mức độ liên quan tối thiểu và cách xếp thứ tự của tìm kiếm là chi tiết kỹ thuật, được chốt ở bước lập kế hoạch dựa trên bộ truy vấn mẫu.
- Con số 1.020 và 275 là quyết định đã chốt ở `docs/SPECKIT_ROADMAP.md` (quyết định số 4). Nếu sau này đối chiếu sách in thấy DVD thuộc từ chính của Bài 6 bản mới thì chuyển lại bằng một thay đổi nhỏ riêng.
- Số mẫu ngữ pháp (132), Kanji (119) và Kanji phụ lục (15) được giữ nguyên; spec này chỉ thêm test kiểm riêng từng số.
- Ngoài phạm vi: đổi giao diện, thêm trang hoặc dạng bài mới, đổi cách sinh mã định danh, đồng bộ tài khoản, thay đổi công thức độ thành thạo, thêm bộ lọc theo dạng bài cho Sổ lỗi sai (thuộc `quality-gaps`).
- Q-1 (`pipeline.test.ts` quá hạn 5 giây khi chạy mặc định) **đã sửa ở spec 002** (FR-028), không còn chuyển cho `quality-gaps`. Q-2 (e2e `browse.spec.ts` đỏ từ commit `8746c15`) vẫn là ngoại lệ đã biết, không sửa ở spec này.
- Phụ thuộc: spec `001-repo-restructure` đã xong và đã gộp vào `main`.
