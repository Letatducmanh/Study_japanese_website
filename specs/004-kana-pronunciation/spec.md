# Feature Specification: Từ vựng được đọc đúng cách đọc (kana pronunciation)

**Feature Branch**: `004-kana-pronunciation` (đã có; tách từ `staging` đã có spec 003, merge PR #3)

**Created**: 2026-11-12

**Status**: Draft

**Input**: User description: "Từ vựng được đọc đúng cách đọc khi người học bấm loa hoặc nghe trong bài tập. Hiện nay chữ Hán đứng một mình hay bị đọc sai: "～人" đọc thành "ひと" thay vì "じん", "何時" thành "いつ" thay vì "なんじ"... Chỉ chuỗi được ĐỌC thay đổi; chữ hiển thị, nội dung giáo trình và cách chấm điểm giữ nguyên."

## Bối cảnh

Giọng đọc có sẵn của trình duyệt phải tự đoán cách đọc của chữ Hán đứng một mình, và hay đoán sai: "～人" (hậu tố じん) bị đọc "ひと"; "何時" (なんじ) bị đọc "いつ"; "何", "何分", "あの方", "この間" cũng bị đọc nhầm. Mỗi từ vựng đã có sẵn cách đọc kana đúng trong nội dung. Cho giọng đọc nghe kana thay vì chữ Hán sẽ bỏ phần đoán đó.

Kết quả nghe thử ngày 2026-11-12 (trang so sánh trong thư mục công cụ tạm): câu ví dụ đọc theo chữ đúng 41/42 câu, nên câu ví dụ giữ cách đọc hiện tại; chỉ một cụm ("あの 方") cần sửa.

Số liệu nội dung hiện có: 1.295 từ vựng, tất cả đều có cách đọc kana không rỗng và không chứa chữ Hán; 657 từ ví dụ ở trang Kanji, tất cả đều có cách đọc kana đi kèm (2 mục có hai cách đọc cách nhau bằng ", "); 134 chữ Kanji đơn, mỗi chữ có ít nhất một âm On hoặc Kun.

Feature này xây trên `speakable-text` (spec 003): dùng lại các quy tắc làm sạch ký hiệu và hành vi nút loa trắc nghiệm của feature đó.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Nghe từ vựng đúng cách đọc ở danh sách, tìm kiếm, flashcard (Priority: P1)

Người học bấm nút loa cạnh một từ có chữ Hán (danh sách từ, kết quả tìm kiếm, flashcard) và nghe đúng cách đọc của từ đó, không nghe cách đọc do giọng đọc tự đoán từ chữ Hán.

**Why this priority**: Đây là lỗi người học gặp nhiều nhất và nghe ra ngay (người học nghe "ひと" trong khi từ là "じん" thì học sai). Các từ chỉ giờ, số lượng (何時, 何分, ～人, ～分) lại xuất hiện ở nhiều bài.

**Independent Test**: Với từng từ ở bảng FR-002, so cách đọc với kết quả mong muốn; mở Bài 1 và Bài 4, bấm loa ở "～人" và "何時" và nghe.

**Acceptance Scenarios**:

1. **Given** từ "～人" (kana "～じん"), **When** người học bấm loa, **Then** nghe "じん".
2. **Given** từ "何時" (kana "なんじ"), **When** bấm loa, **Then** nghe "なんじ".
3. **Given** từ có nhiều cách ghi như "～分" (kana "～ふん / ～ぷん"), **When** bấm loa, **Then** nghe "ふん" (cách đầu tiên).
4. **Given** từ chỉ có kana (không có chữ Hán), **When** bấm loa, **Then** nghe y như trước.
5. **Given** bất kỳ từ nào, **When** hiển thị trên màn hình, **Then** chữ hiển thị vẫn là chữ Hán như cũ (chỉ cách đọc đổi).

---

### User Story 2 - Chính tả nghe và trắc nghiệm có nghe dùng cách đọc kana (Priority: P1)

Ở chính tả nghe và các dạng trắc nghiệm có nghe, âm thanh người học nghe là cách đọc kana của từ; hành vi nút loa và tự đọc của từng dạng trắc nghiệm giữ như đã chốt ở `speakable-text`; cách chấm không đổi.

**Why this priority**: Đây là nơi âm thanh quyết định đúng sai. Nghe sai cách đọc làm bài kiểm tra "nghe" sai, và làm kết quả kỹ năng nghe của người học phản ánh sai điểm yếu.

**Independent Test**: Với từng dạng ở bảng FR-005, dựng một câu hỏi và kiểm chuỗi được đọc, nút loa và tự đọc; với chính tả nghe, kiểm tập đáp án và kết quả chấm không đổi.

**Acceptance Scenarios**:

1. **Given** câu chính tả nghe với từ "何時", **When** câu hỏi mở và khi bấm nghe lại, **Then** nghe "なんじ"; đáp án chấm vẫn là tập đáp án cũ (người học gõ "なんじ" vẫn đúng, gõ "いつ" vẫn sai).
2. **Given** câu hỏi `mcq-jp-vi` có đề chữ Hán, **When** câu hỏi mở, **Then** đề vẫn hiện chữ Hán, nút loa có mặt và đọc cách đọc kana khi bấm, và không tự đọc lúc mở.
3. **Given** câu hỏi `mcq-listen-vi`, **When** câu hỏi mở, **Then** tự đọc và nút "Nghe lại" đều phát cách đọc kana.
4. **Given** câu hỏi `mcq-kanji-reading` chưa chọn đáp án, **When** hiển thị đề, **Then** không có nút loa; **When** người học chọn một đáp án, **Then** nút loa hiện lại và đọc cách đọc kana của từ.
5. **Given** câu hỏi `mcq-vi-jp` hoặc `mcq-vi-kanji`, **When** hiển thị đề, **Then** vẫn không có nút loa ở đề.

---

### User Story 3 - Trang Kanji đọc đúng từ ví dụ và chữ đơn (Priority: P2)

Ở trang chi tiết Kanji, nút loa của từ ví dụ đọc theo cách đọc kana đi kèm ví dụ; nút loa của chữ đơn đọc âm On đầu tiên rồi âm Kun đầu tiên.

**Why this priority**: Ảnh hưởng ít người dùng hơn các màn hình luyện tập, nhưng chữ đơn là chỗ giọng đọc đoán sai nhiều nhất và đang bị bỏ ngỏ.

**Independent Test**: Với từng ví dụ ở bảng FR-006 và FR-007, so cách đọc với kết quả mong muốn.

**Acceptance Scenarios**:

1. **Given** từ ví dụ "一人" có cách đọc "ひとり", **When** bấm loa, **Then** nghe "ひとり".
2. **Given** từ ví dụ "十分" có hai cách đọc "じゅっぷん, じっぷん", **When** bấm loa, **Then** nghe "じゅっぷん" (cách đầu tiên).
3. **Given** từ ví dụ "何" có hai cách đọc "なに, なん", **When** bấm loa, **Then** nghe "なに".
4. **Given** chữ đơn "一" (On "イチ, イツ"; Kun "ひと, ひと・つ"), **When** bấm loa, **Then** nghe "イチ、ひとつ".
5. **Given** chữ đơn không có âm Kun (12 chữ) hoặc không có âm On (1 chữ), **When** bấm loa, **Then** nghe âm duy nhất có, không có dấu "、" thừa.

---

### User Story 4 - Câu ví dụ giữ cách đọc theo chữ, có bảng sửa cụm đọc sai (Priority: P2)

Câu ví dụ (ngữ pháp và các câu khác) vẫn được đọc theo chữ như hiện nay. Những cụm đã biết đọc sai được sửa bằng một bảng sửa cách đọc nằm trong dữ liệu, áp dụng cho mọi câu chứa cụm đó; thêm cụm mới chỉ cần thêm một mục vào bảng, không sửa mã. Ban đầu bảng chỉ có "あの 方" → "あの かた".

**Why this priority**: Giữ 41/42 câu đã đọc đúng, đồng thời có chỗ sửa nhanh khi nghe ra thêm cụm sai, không phải làm lại thiết kế.

**Independent Test**: Kiểm câu "あの 方は どなたですか。" ra "あの かたは どなたですか。", các câu khác không đổi, rồi thêm một mục thử vào bảng (trong test) và kiểm nó áp dụng cho mọi câu chứa cụm đó.

**Acceptance Scenarios**:

1. **Given** câu "あの 方は どなたですか。", **When** bấm loa, **Then** nghe "あの かたは どなたですか。".
2. **Given** câu khác có chữ Hán đã đọc đúng (ví dụ "ミラーさんは アメリカ人ですか。"), **When** bấm loa, **Then** nghe như hiện nay.
3. **Given** câu có chữ số kèm 人 hoặc 日 ("４人です", "６月13日です"), **When** bấm loa, **Then** nghe như hiện nay.
4. **Given** bảng có thêm một mục mới, **When** bấm loa ở mọi câu chứa cụm gốc của mục đó, **Then** cụm được đọc theo cách đọc mới ở tất cả các câu, và không câu nào khác bị đổi.

---

### Edge Cases

- **Từ có nhiều cách ghi hoặc nhiều cách đọc cách nhau bằng " / "** (ví dụ "ぎゅうにゅう / ミルク", "おっと / しゅじん"): đọc cách đầu tiên, giống quy tắc làm sạch đã có.
- **Từ có ký hiệu trong cách đọc kana** (ví dụ "[お]はなみ", "～ふん / ～ぷん", "いい [お]てんきですね。"): quy tắc làm sạch của `speakable-text` vẫn áp dụng lên chuỗi kana, ra "はなみ", "ふん", "いいてんきですね。".
- **Từ không có chữ Hán** (kana đã là chữ hiển thị): chuỗi đọc không đổi so với hiện nay.
- **Chữ Kanji đơn thiếu âm On hoặc âm Kun**: đọc âm có; không thêm "、" thừa.
- **Âm Kun có dấu "・" ngăn phần đuôi** (ví dụ "ひと・つ"): bỏ dấu "・" khi đọc ("ひとつ").
- **Cách đọc của từ ví dụ có hai cách cách nhau bằng ", "**: lấy cách đầu tiên.
- **Cụm trong bảng sửa không xuất hiện ở câu nào**: không có tác dụng và không báo lỗi khi đọc.
- **Cụm trong bảng sửa khớp theo đúng chữ trong nội dung**, kể cả dấu cách ("あの 方" có dấu cách; "あの方" viết liền không khớp mục này vì nó là từ vựng và đã đọc theo kana).
- **Chuỗi đọc sau xử lý rỗng**: không đọc gì, không báo lỗi (giữ như `speakable-text`).
- **Thiết bị không có giọng tiếng Nhật**: giữ như hiện nay (nút loa tự ẩn).

## Requirements *(mandatory)*

### Functional Requirements

**Từ vựng đọc theo kana**

- **FR-001**: Mọi nơi đọc một TỪ vựng (danh sách từ, kết quả tìm kiếm, flashcard, chính tả nghe, các dạng trắc nghiệm có nghe) MUST đọc theo cách đọc kana của từ, không đọc theo chữ Hán. Từ không có chữ Hán đọc y như hiện nay.
- **FR-002**: Với từ vựng, hệ thống MUST cho ra đúng các kết quả sau (quy tắc làm sạch ký hiệu của `speakable-text` vẫn áp dụng lên chuỗi kana):

  | Từ (chữ hiển thị) | Kana của từ | Cách đọc |
  |---|---|---|
  | ～人 | ～じん | じん |
  | 何時 | なんじ | なんじ |
  | 何 | なん | なん |
  | 何分 | なんぷん | なんぷん |
  | あの方 | あのかた | あのかた |
  | この間 | このあいだ | このあいだ |
  | [お]花見 | [お]はなみ | はなみ |
  | ～分 | ～ふん / ～ぷん | ふん |

- **FR-003**: Mọi từ vựng (1.295 từ trong nội dung hiện có) MUST có chuỗi đọc không rỗng và không chứa chữ Hán.

**Chính tả nghe và trắc nghiệm**

- **FR-004**: Ở chính tả nghe, chuỗi người học nghe MUST là cách đọc kana của từ (khi tự đọc lúc mở câu hỏi và khi bấm nghe lại). Đáp án chấm, tập đáp án được chấp nhận và kết quả đúng/sai MUST giữ nguyên.
- **FR-005**: Các dạng trắc nghiệm MUST hành xử như sau:

  | Dạng | Đề bài | Nút loa ở đề | Tự đọc khi mở câu hỏi | Chuỗi được đọc |
  |---|---|---|---|---|
  | `mcq-jp-vi` | chữ Hán (giữ nguyên) | có | không (giữ hành vi hiện tại) | cách đọc kana |
  | `mcq-listen-vi` | âm thanh | không có nút loa ở đề; có nút "Nghe lại" | có | cách đọc kana |
  | `mcq-kanji-reading` | chữ Hán | ẩn trước khi chọn đáp án; hiện lại sau khi chọn | không | cách đọc kana |
  | `mcq-kana-kanji` | kana | có (như hiện nay) | không | kana (như hiện nay) |
  | `mcq-vi-jp` | nghĩa tiếng Việt | không | không | (không đọc) |
  | `mcq-vi-kanji` | nghĩa tiếng Việt | không | không | (không đọc) |

**Trang Kanji**

- **FR-006**: Ở trang Kanji, từ ví dụ MUST được đọc theo cách đọc kana có sẵn của ví dụ; nếu cách đọc có nhiều cách ngăn cách bằng ", " thì MUST lấy cách đầu tiên. Kết quả:

  | Từ ví dụ | Cách đọc có sẵn | Cách đọc |
  |---|---|---|
  | 一人 | ひとり | ひとり |
  | 十分 | じゅっぷん, じっぷん | じゅっぷん |
  | 何 | なに, なん | なに |

- **FR-007**: Ở trang Kanji, chữ Kanji đơn MUST được đọc là âm On đầu tiên, rồi dấu "、", rồi âm Kun đầu tiên, bỏ dấu "・". Âm Kun được chọn là Kun đầu tiên; chỉ khi Kun đầu tiên đó là phần gốc của một Kun khác trong danh sách (Kun khác đó bắt đầu bằng Kun đầu tiên rồi "・") thì lấy Kun khác đó (dạng có đuôi, Kun khác đầu tiên khớp). Chữ thiếu On hoặc thiếu Kun MUST chỉ đọc âm có, không có "、" thừa. Kết quả:

  | Chữ | Âm On | Âm Kun | Cách đọc |
  |---|---|---|---|
  | 一 | イチ, イツ | ひと, ひと・つ | イチ、ひとつ |
  | 二 | ニ | ふた, ふた・つ | ニ、ふたつ |
  | 人 | ジン, ニン | ひと | ジン、ひと |
  | 白 | ハク, ビャク | しろ, しろ・い | ハク、しろい |
  | 上 | ジョウ, ショウ | うえ, うわ, かみ, あ・げる, あ・がる, のぼ・る | ジョウ、うえ |
  | 大 | ダイ, タイ | おお, おお・きい | ダイ、おおきい |
  | 行 | コウ, ギョウ, アン | い・く, ゆ・く, おこな・う | コウ、いく |
  | 食 | ショク, ジキ | た・べる, く・う | ショク、たべる |

**Câu ví dụ và bảng sửa cách đọc**

- **FR-008**: Câu ví dụ (ngữ pháp và các câu khác) MUST tiếp tục được đọc theo chữ như hiện nay, kể cả chữ số kèm 人/日 ("４人", "６月13日").
- **FR-009**: Hệ thống MUST có một bảng sửa cách đọc cho câu, nằm trong DỮ LIỆU (không viết cứng trong mã). Mỗi mục gồm cụm gốc (đúng như chữ trong nội dung, kể cả dấu cách) và cách đọc thay thế. Bảng áp dụng cho MỌI câu chứa cụm gốc; thêm mục mới chỉ cần thêm dữ liệu, không sửa mã. Ban đầu bảng chỉ có "あの 方" → "あの かた": câu "あの 方は どなたですか。" đọc "あの かたは どなたですか。".
- **FR-010**: Bảng sửa cách đọc MUST kiểm tra được tự động: mỗi mục có cụm gốc và cách đọc không rỗng, không trùng cụm gốc giữa các mục, và mỗi cụm gốc khớp ít nhất một câu trong nội dung hiện có.

**Bảo toàn**

- **FR-011**: Chữ hiển thị trên mọi màn hình, nội dung giáo trình và đáp án chấm (kể cả chính tả nghe) MUST giữ nguyên. Chỉ chuỗi được đưa cho giọng đọc thay đổi.
- **FR-012**: Mọi nơi gọi bộ đọc MUST đi qua cùng một đường làm sạch; không nơi nào đưa thẳng chuỗi chưa xử lý cho giọng đọc.

### Key Entities

- **Cách đọc của từ**: chuỗi kana đi kèm mỗi từ vựng (đã có sẵn trong nội dung); là nguồn của chuỗi đọc cho từ. Có thể chứa ký hiệu ghi chú hoặc nhiều cách ngăn bằng " / ".
- **Cách đọc của từ ví dụ Kanji**: chuỗi kana đi kèm mỗi từ ví dụ ở trang Kanji; có thể có hai cách ngăn bằng ", ".
- **Âm On / âm Kun của chữ Kanji**: các danh sách âm đi kèm mỗi chữ; âm Kun có thể chứa dấu "・" ngăn phần đuôi.
- **Mục sửa cách đọc**: cặp (cụm gốc trong câu, cách đọc thay thế); nằm trong dữ liệu, áp dụng cho mọi câu chứa cụm gốc.
- **Chuỗi đọc**: văn bản cuối cùng đưa cho giọng đọc; không bao giờ được lưu ngược vào nội dung hay dùng để chấm.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% các ví dụ ở FR-002 (8 từ), FR-006 (3 ví dụ), FR-007 (3 chữ) và US4 (câu "あの 方は どなたですか。") cho ra đúng cách đọc mong muốn.
- **SC-002**: Trên nội dung hiện có, 100% trong 1.295 từ vựng có chuỗi đọc không rỗng và không chứa chữ Hán.
- **SC-003**: Trên nội dung hiện có, 100% trong 657 từ ví dụ Kanji có chuỗi đọc không rỗng, không chứa chữ Hán và không chứa ", "; và 100% trong 134 chữ Kanji đơn có chuỗi đọc không rỗng.
- **SC-004**: Ở chính tả nghe, tập đáp án chấp nhận và kết quả chấm của mọi từ trong nội dung hiện có giống hệt trước thay đổi (0 khác biệt).
- **SC-005**: Chữ hiển thị trên các màn hình Từ vựng, Tìm kiếm, Flashcard, Kanji, Ngữ pháp và trắc nghiệm không đổi (0 khác biệt so với trước).
- **SC-006**: Cả 6 dạng trắc nghiệm có hành vi nút loa và tự đọc đúng bảng FR-005.
- **SC-007**: Trong 42 câu ví dụ đã nghe thử, 42/42 câu đọc đúng sau thay đổi (41 câu đã đúng giữ nguyên; câu "あの 方は…" được sửa).
- **SC-008**: Thêm một mục mới vào bảng sửa cách đọc áp dụng được cho mọi câu chứa cụm đó mà không phải sửa mã nào.
- **SC-009**: Người học (chủ dự án) nghe thử và xác nhận các từ ở FR-002 và các chữ Kanji ở FR-007 được đọc đúng trong ứng dụng thật.

## Assumptions

- Nguồn cách đọc của từ là trường kana đã có sẵn của từng từ vựng; nội dung giáo trình không phải sửa.
- Quy tắc làm sạch ký hiệu của `speakable-text` (bỏ `[..]`, `～`, chọn cách đầu ở " / "…) vẫn áp dụng lên chuỗi kana của từ.
- Feature này cần `speakable-text` hoàn chỉnh (kể cả hành vi nút loa trắc nghiệm ở commit thứ hai của feature đó) vì FR-005 xây trên hành vi đã chốt ở đó.
- **Quy tắc chọn âm Kun** (FR-007), chủ dự án đã chốt ở bước plan: lấy Kun đầu tiên; chỉ mở rộng thành dạng có đuôi (có "・") khi Kun đầu tiên là phần gốc của một Kun khác trong danh sách. Cho ra "一" → "イチ、ひとつ", "二" → "ニ、ふたつ", "白" → "ハク、しろい", nhưng "上" vẫn "ジョウ、うえ" (không thành "あげる"). Trên nội dung hiện có, đúng 11 chữ được mở rộng (白, 一 đến 九, 大). Quy tắc "Kun đầu tiên ở dạng có đuôi" đã bị bỏ.
- Chữ đơn chỉ có một nút loa (đọc On đầu rồi Kun đầu); nhiều nút đọc cho từng âm nằm ngoài phạm vi.
- Bảng sửa cách đọc chỉ áp dụng cho câu, không áp dụng cho từ vựng (từ vựng đã đọc theo kana).
- Cụm gốc trong bảng so khớp theo đúng chữ trong nội dung (phân biệt dấu cách); việc so khớp lỏng hơn không nằm trong phạm vi.
- Câu ví dụ vẫn đọc theo chữ nên cách đọc của chúng có thể còn sai ở cụm chưa nghe ra; mỗi lần nghe ra cụm sai chỉ cần thêm một mục vào bảng.

## Out of Scope

- Đổi giọng, tốc độ, ngữ điệu.
- Sửa nội dung giáo trình.
- Đọc câu bằng kana.
- Nhiều nút đọc cho chữ Kanji đơn.
- Dời vị trí file đọc (làm ở `ui-kit-and-shell`).
- Giao diện mới.
