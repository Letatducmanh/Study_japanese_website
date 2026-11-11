# Feature Specification: Phát âm đúng hơn và nút loa không đọc nhầm ngôn ngữ

**Feature Branch**: `003-speakable-text`

**Created**: 2026-11-11

**Status**: Draft

**Input**: User description: "Phát âm tiếng Nhật đúng hơn khi người học bấm nút loa, và nút loa không đọc nhầm ngôn ngữ. Chỉ chuỗi được ĐỌC thay đổi; chữ hiển thị trên màn hình, nội dung giáo trình và cách chấm điểm giữ nguyên."

## Bối cảnh

Giáo trình dùng nhiều ký hiệu ghi chú cho người học xem bằng mắt: `[ ]` (phần tùy chọn), `～` (chỗ trống), `（ ）` (chú thích), `…` (mở đầu câu đáp), `/` (cách viết khác), `→` (biến đổi). Hiện nay giọng đọc nhận nguyên chuỗi, nên các ký hiệu này có thể bị đọc lạ, ngắt giữa chừng hoặc bị bỏ qua. Ngoài ra ở hai dạng trắc nghiệm có đề là nghĩa tiếng Việt, nút loa bắt giọng Nhật đọc tiếng Việt, và ở dạng hỏi cách đọc Kanji, nút loa đọc ra luôn đáp án.

Số liệu từ lần điều tra (chỉ đọc) ngày 2026-11-11 trên nội dung hiện có: 2.378 chuỗi được đưa vào giọng đọc (từ vựng 1.295, chữ Kanji 134, từ ví dụ Kanji 657, câu ngữ pháp 292), trong đó 661 chuỗi có ký tự nghi vấn.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Nghe từ vựng không bị đọc ký hiệu ghi chú (Priority: P1)

Người học bấm nút loa cạnh một từ hoặc cụm từ có ký hiệu ghi chú (ví dụ "[お]土産", "～さん", "晩 / 夜") và nghe đúng phần cần đọc, không nghe tên ký hiệu, không bị ngắt giữa chừng.

**Why this priority**: Từ vựng là phần dùng nhiều nhất và có nhiều chuỗi bị ảnh hưởng nhất (khoảng 370 từ có ký tự nghi vấn). Đây cũng là nguồn của dạng chính tả nghe và trắc nghiệm nghe.

**Independent Test**: Với từng ví dụ ở bảng FR-002, đưa chuỗi gốc vào quy tắc làm sạch và so với chuỗi đọc mong muốn; sau đó bấm loa ở một từ bất kỳ có ký hiệu và nghe thử.

**Acceptance Scenarios**:

1. **Given** một từ có phần tùy chọn trong `[ ]` (ví dụ "[お]土産"), **When** người học bấm nút loa hoặc dạng bài tự đọc, **Then** giọng đọc chỉ đọc "土産".
2. **Given** một từ có `～` (ví dụ "～歳"), **When** đọc, **Then** giọng đọc đọc "歳" và không đọc ký hiệu `～`.
3. **Given** một từ có nhiều cách viết cách nhau bằng " / " (ví dụ "晩 / 夜"), **When** đọc, **Then** chỉ đọc cách viết đầu tiên "晩".
4. **Given** một từ không có ký hiệu nào cần bỏ (ví dụ "わたし", "食べます"), **When** đọc, **Then** chuỗi đọc y nguyên chuỗi gốc.

---

### User Story 2 - Nghe câu ví dụ ngữ pháp tự nhiên (Priority: P1)

Người học bấm nút loa ở câu ví dụ ngữ pháp (hội thoại hỏi–đáp, danh sách biến đổi động từ, câu có chú thích) và nghe một câu liền mạch, không đọc dấu `…`, `→`, `/`, và không đọc chú thích tiếng Việt trong ngoặc.

**Why this priority**: 292 câu ví dụ ngữ pháp đều có ít nhất một ký tự nghi vấn (dấu `…` ở 71 câu, `→` và `/` ở 20 câu, ngoặc tròn ở 3 câu). Chú thích tiếng Việt như "（lịch sự）" bị giọng Nhật đọc sai là lỗi dễ nhận thấy nhất.

**Independent Test**: Với từng ví dụ câu ở bảng FR-004, so chuỗi đọc với kết quả mong muốn; bấm loa ở một câu hội thoại và một câu danh sách để nghe thử.

**Acceptance Scenarios**:

1. **Given** câu hội thoại có phần đáp bắt đầu bằng `…` ("ミラーさんは アメリカ人ですか。 …はい、アメリカ人です。"), **When** đọc, **Then** dấu `…` không được đọc và hai vế vẫn có khoảng ngắt.
2. **Given** câu danh sách biến đổi ("書きます → 書いて / 飲みます → 飲んで / 待ちます → 待って"), **When** đọc, **Then** các mục được đọc nối nhau bằng dấu ngắt "、" và không đọc `→`, `/`.
3. **Given** câu có chú thích tiếng Việt trong ngoặc ("行きます（lịch sự）→ 行く（thông thường）"), **When** đọc, **Then** phần trong ngoặc không được đọc.

---

### User Story 3 - Nút loa trắc nghiệm không đọc nhầm hay lộ đáp án (Priority: P1)

Ở các dạng trắc nghiệm, nút loa chỉ hiện khi nó đọc đúng tiếng Nhật và không làm lộ đáp án.

**Why this priority**: Đọc tiếng Việt bằng giọng Nhật là lỗi rõ ràng. Lộ đáp án ở dạng hỏi cách đọc Kanji làm kết quả kiểm tra điểm yếu sai lệch (Constitution V: mục tiêu số một là phát hiện đúng điểm yếu).

**Independent Test**: Với từng dạng trắc nghiệm, dựng một câu hỏi và kiểm tra nút loa ở đề bài hiện hay không (bảng FR-007).

**Acceptance Scenarios**:

1. **Given** câu hỏi `mcq-vi-jp` hoặc `mcq-vi-kanji` (đề là nghĩa tiếng Việt), **When** hiển thị đề, **Then** không có nút loa ở đề.
2. **Given** câu hỏi `mcq-kanji-reading` chưa được trả lời, **When** hiển thị đề, **Then** không có nút loa.
3. **Given** câu hỏi `mcq-kanji-reading` sau khi người học đã chọn đáp án, **When** hiển thị phản hồi, **Then** nút loa xuất hiện và đọc chuỗi đã làm sạch.
4. **Given** câu hỏi `mcq-jp-vi`, `mcq-kana-kanji` hoặc `mcq-listen-vi`, **When** hiển thị, **Then** nút loa (hoặc nút nghe lại, tự đọc) hoạt động như trước.

---

### User Story 4 - Mọi thứ khác giữ nguyên (Priority: P2)

Chữ hiển thị trên màn hình, nội dung giáo trình, và cách chấm điểm không đổi. Các ký tự không nằm trong danh sách cần bỏ vẫn được đọc như hiện nay.

**Why this priority**: Đây là ràng buộc an toàn. Thay đổi chuỗi đọc không được làm đổi kết quả chấm hay chữ người học nhìn thấy, nhưng việc kiểm tra nó là bước cuối sau khi các câu chuyện trên chạy.

**Independent Test**: So sánh trước/sau: chữ hiển thị và đáp án chấm của chính tả nghe giống hệt; các chuỗi ở FR-005 đọc y nguyên.

**Acceptance Scenarios**:

1. **Given** một từ có `[ ]` hoặc `～` được hiển thị trên màn hình, **When** quy tắc làm sạch được áp dụng, **Then** chữ hiển thị vẫn đầy đủ ký hiệu như cũ.
2. **Given** một câu hỏi chính tả nghe, **When** người học gõ đáp án, **Then** tập đáp án được chấp nhận và kết quả đúng/sai giống hệt trước thay đổi.
3. **Given** chuỗi chứa `・`, `「」`, chữ Latin, chữ số, `……` cuối câu, dấu cách giữa từ hoặc `、。！？`, **When** đọc, **Then** chuỗi đọc y nguyên chuỗi gốc ở các ký tự đó.

---

### Edge Cases

- **Chuỗi sau khi làm sạch rỗng** (ví dụ chuỗi chỉ gồm `～` hoặc chỉ gồm phần trong `[ ]`): không đọc gì, không báo lỗi.
- **Dấu `…` đơn và `……` đôi**: chỉ dấu `…` đơn mở đầu câu đáp bị bỏ; `……` đôi (ví dụ "[～は] ちょっと……。", "もう 帰らないと……。") giữ nguyên.
- **Dấu `→` nối hai câu hoàn chỉnh** (ví dụ "ここに 荷物を 置かないで ください。 → 荷物は ここに 置かないで ください。"): vế trước đã kết thúc bằng dấu câu, nên chỉ cần khoảng ngắt, không thêm "、" liền sau "。".
- **Nhiều cặp `[ ]` trong một chuỗi** (ví dụ "[どうも] ありがとう [ございます]。"): bỏ tất cả, kết quả "ありがとう。", không để thừa dấu cách trước dấu câu.
- **Dấu cách quanh chỗ bỏ**: sau khi bỏ ký hiệu, dấu cách thừa đầu/cuối chuỗi và trước 、。！？ được gọn lại; dấu cách giữa các từ còn lại giữ nguyên.
- **Ngoặc tròn có chữ Nhật bên trong** (ví dụ "てんぷらを（が）"): bỏ cả phần trong ngoặc như mọi ngoặc tròn khác.
- **Dạng "～" lệch ký tự** (`～`, `〜`, `~`): coi là cùng ký hiệu chỗ trống.
- **Câu có tiếng Anh hoặc tiếng Việt nằm trong 「」** (ví dụ "「Thank you」", "「Cảm ơn」" ở 2 câu ngữ pháp): không nằm trong phạm vi sửa nội dung; vẫn đọc như cũ. Hai câu này không chứa ký tự bị FR-012 cấm nên không cần ngoại lệ; chúng được ghi thành nợ nội dung ở `quality-gaps`.
- **Thiết bị không có giọng tiếng Nhật**: hành vi hiện tại giữ nguyên (nút loa tự ẩn).

## Requirements *(mandatory)*

### Functional Requirements

**Quy tắc làm sạch chuỗi đọc**

- **FR-001**: Hệ thống MUST áp dụng các quy tắc sau chỉ lên chuỗi được đưa cho giọng đọc, và không đổi chuỗi hiển thị, chuỗi lưu trong nội dung hay chuỗi dùng để chấm:
  - bỏ phần tùy chọn trong ngoặc vuông `[ ]`, gồm cả chữ bên trong;
  - bỏ ký hiệu chỗ trống `～` (và `〜`, `~`);
  - bỏ chú thích trong ngoặc tròn `（ ）`, gồm cả chữ bên trong;
  - bỏ dấu `…` đơn ở đầu câu đáp trong hội thoại hỏi–đáp (giữ khoảng ngắt giữa câu hỏi và câu đáp);
  - với từ có nhiều cách viết cách nhau bằng " / ": chỉ đọc cách viết đầu tiên;
  - với câu ngữ pháp là danh sách có `→` và `/`: đọc các mục nối nhau bằng dấu ngắt "、".
- **FR-002**: Với từ vựng, hệ thống MUST cho ra đúng các kết quả sau:

  | Chuỗi gốc | Chuỗi đọc |
  |---|---|
  | どうぞ よろしく [お願いします]。 | どうぞ よろしく。 |
  | [お]土産 | 土産 |
  | 綺麗 [な] | 綺麗 |
  | [～を] 見せて ください。 | 見せて ください。 |
  | きます [シャツを～] | きます |
  | ～さん | さん |
  | こちらは ～さんです。 | こちらは さんです。 |
  | ～歳 | 歳 |
  | 晩 / 夜 | 晩 |
  | [～は] ちょっと……。 | ちょっと……。 |

- **FR-003**: Hệ thống MUST xử lý chuỗi có nhiều cặp `[ ]` hoặc nhiều cách viết cùng lúc (ví dụ "[どうも] ありがとう [ございます]。", "～かい / ～がい") đúng theo các quy tắc ở FR-001, cho ra lần lượt "ありがとう。" và "かい" (không để thừa dấu cách trước dấu câu).
- **FR-004**: Với câu ví dụ ngữ pháp, hệ thống MUST cho ra đúng các kết quả sau:

  | Chuỗi gốc | Chuỗi đọc |
  |---|---|
  | ミラーさんは アメリカ人ですか。 …はい、アメリカ人です。 | ミラーさんは アメリカ人ですか。 はい、アメリカ人です。 |
  | 書きます → 書いて / 飲みます → 飲んで / 待ちます → 待って | 書きます、書いて、飲みます、飲んで、待ちます、待って |
  | 行きます（lịch sự）→ 行く（thông thường） | 行きます、行く |
  | わたしは てんぷらを（が） 食べたいです。 | わたしは てんぷらを 食べたいです。 |

- **FR-005**: Hệ thống MUST giữ nguyên, đọc y như hiện nay, các thành phần sau; mỗi thành phần có ít nhất một ví dụ làm chuẩn:

  | Thành phần | Ví dụ giữ nguyên |
  |---|---|
  | Dấu chấm giữa `・` | マイク・ミラー |
  | Ngoặc kép Nhật `「 」` | 寝る まえに、「お休みなさい」と 言います。 |
  | Chữ Latin | CD, Tシャツ |
  | Chữ số | 地下1階 |
  | Dấu `……` cuối câu | もう 帰らないと……。 |
  | Dấu cách giữa từ | どうぞ よろしく (khoảng cách giữa hai từ còn nguyên) |
  | Dấu câu `、。！？` | お名前は？ |
  | Chuỗi không có ký hiệu cần bỏ | わたし, 食べます |

- **FR-006**: Quy tắc làm sạch MUST áp dụng cho mọi nơi phát âm trong ứng dụng, cả khi người học bấm nút loa lẫn khi dạng bài tự đọc: danh sách từ vựng, kết quả tìm kiếm, flashcard, chính tả nghe, trắc nghiệm (gồm tự đọc và nút nghe lại), trang Kanji (chữ và từ ví dụ), ví dụ ngữ pháp. Không có nơi nào được đọc chuỗi chưa qua quy tắc này.

**Nút loa không đọc nhầm ngôn ngữ**

- **FR-007**: Nút loa ở đề bài của từng dạng trắc nghiệm MUST hiện hoặc ẩn như sau:

  | Dạng | Đề bài | Nút loa ở đề |
  |---|---|---|
  | `mcq-jp-vi` | chữ Nhật | hiện (như cũ) |
  | `mcq-vi-jp` | nghĩa tiếng Việt | **ẩn** |
  | `mcq-kanji-reading` | chữ Kanji | **ẩn trước khi trả lời**, hiện sau khi trả lời |
  | `mcq-kana-kanji` | kana | hiện (như cũ) |
  | `mcq-listen-vi` | âm thanh (không có chữ) | như cũ: tự đọc và nút nghe lại |
  | `mcq-vi-kanji` | nghĩa tiếng Việt | **ẩn** |

- **FR-008**: Hệ thống MUST NOT đưa chuỗi tiếng Việt (nghĩa của từ) cho giọng tiếng Nhật đọc ở bất kỳ dạng bài nào.

**Bảo toàn**

- **FR-009**: Chuỗi dùng làm đáp án chấm của chính tả nghe, tập đáp án được chấp nhận và kết quả đúng/sai MUST giữ nguyên so với trước thay đổi. Việc làm sạch chuỗi đọc MUST NOT được dùng để chấm điểm.
- **FR-010**: Chữ hiển thị trên mọi màn hình (từ vựng, ngữ pháp, Kanji, đề và đáp án trắc nghiệm) và nội dung giáo trình MUST giữ nguyên.
- **FR-011**: Khi chuỗi đọc sau làm sạch rỗng, hệ thống MUST NOT phát âm thanh và MUST NOT báo lỗi.

**Kiểm tra trên toàn bộ nội dung**

- **FR-012**: Mọi từ vựng và mọi câu ví dụ ngữ pháp trong nội dung đã dựng sẵn MUST đi qua quy tắc làm sạch và không còn ký tự `[`, `]`, `～`, `（`, `）` hoặc " / " trong chuỗi đọc. Các ký tự bị cấm là đúng sáu loại này và các dạng tương đương (`［ ］`, `〜`, `~`, `( )`, `／`). Mục nào không đạt MUST nằm trong danh sách ngoại lệ, mỗi mục có lý do ghi rõ; danh sách ngoại lệ MUST được kiểm tra tự động để không phình ra âm thầm. Với nội dung hiện có, danh sách này rỗng.

### Key Entities

- **Chuỗi đọc**: văn bản cuối cùng đưa cho giọng đọc; được suy ra từ chuỗi hiển thị của từ, chữ Kanji, từ ví dụ Kanji hoặc câu ví dụ ngữ pháp, qua quy tắc làm sạch. Không bao giờ được lưu ngược vào nội dung.
- **Loại chuỗi**: phân biệt "từ/cụm từ" và "câu ngữ pháp", vì dấu " / " có nghĩa khác nhau: là cách viết khác ở từ vựng, là danh sách ở câu ngữ pháp.
- **Chuỗi chấm**: danh sách đáp án chấp nhận của dạng gõ (chính tả nghe); tách biệt hoàn toàn với chuỗi đọc.
- **Danh sách ngoại lệ**: các chuỗi nội dung vẫn còn ký hiệu cấm của FR-012 sau làm sạch, mỗi mục kèm lý do (hiện rỗng).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% các ví dụ ở FR-002 và FR-004 (14 chuỗi) cho ra đúng chuỗi đọc mong muốn.
- **SC-002**: 100% các ví dụ chuẩn ở FR-005 đọc y nguyên chuỗi gốc.
- **SC-003**: Trên toàn bộ nội dung hiện có (1.295 từ và 292 câu ngữ pháp), 100% chuỗi đọc không còn `[`, `]`, `～`, `（`, `）` hay " / ", trừ các mục trong danh sách ngoại lệ có ghi lý do.
- **SC-004**: Ở dạng chính tả nghe, tập đáp án chấp nhận và kết quả chấm của mọi từ trong nội dung hiện có giống hệt trước thay đổi (0 khác biệt).
- **SC-005**: Chữ hiển thị trên màn hình Từ vựng, Ngữ pháp, Kanji, Tìm kiếm và trắc nghiệm không đổi (0 khác biệt so với trước).
- **SC-006**: Cả 6 dạng trắc nghiệm hiện hoặc ẩn nút loa đúng như bảng FR-007; không còn dạng nào đọc tiếng Việt bằng giọng Nhật.
- **SC-007**: Người học nghe thử ít nhất một mẫu cho mỗi nhóm ký hiệu (trang nghe thử có sẵn) và xác nhận nghe tự nhiên hơn bản gốc ở các nhóm ngoặc vuông, `～`, " / ", `…` và `→`.

## Assumptions

- Cách đọc mong muốn lấy theo các ví dụ trong yêu cầu của chủ dự án; không có chuẩn bên ngoài nào khác.
- `〜` và `~` được coi là cùng ký hiệu với `～`.
- Ở `mcq-kanji-reading`, nút loa chỉ ẩn trước khi trả lời; sau khi người học đã chọn đáp án thì nút hiện lại, vì lúc đó nghe không còn lộ đáp án.
- Nút loa ở đề bài là đối tượng của FR-007; nút loa ở flashcard không thuộc dạng trắc nghiệm nên không đổi hành vi hiện/ẩn, chỉ đổi chuỗi đọc theo FR-001.
- Khi hai vế của `→` đều là câu hoàn chỉnh, khoảng ngắt tự nhiên thay cho "、".
- Các chuỗi có ký hiệu mà yêu cầu liệt kê "giữ nguyên" (Latin, chữ số, `・`, `「」`, `……`) có thể được nghe là chưa tự nhiên trên một số giọng; việc đó nằm ngoài phạm vi và có thể xét ở một spec sau.
- 2 câu ngữ pháp có tiếng Anh/Việt trong 「」 sẽ được sửa ở việc sửa nội dung (ngoài phạm vi, nợ của `quality-gaps`); chúng không vi phạm FR-012 nên không nằm trong danh sách ngoại lệ.
- Việc dời vị trí file đọc sang lớp nền tảng sẽ làm ở spec sau; spec này không phụ thuộc vị trí file.

## Out of Scope

- Sửa nội dung giáo trình.
- Đổi giọng, tốc độ, ngữ điệu.
- Đọc bằng kana thay cho kanji.
- Ghi đè cách đọc từng từ.
- Giao diện mới; tải lười (lazy loading).
- Dời vị trí file đọc (làm ở spec sau).
