# Data Model: search-speaker-and-jump

Không có dữ liệu lưu trữ mới: không IndexedDB, không localStorage, không Supabase, không đổi `schemaVersion`, không đổi nội dung `.md` hay JSON dựng. Chỉ có một hợp đồng địa chỉ và vài trạng thái giao diện tạm.

## Đích nhảy (`LessonJump`) — nằm trong địa chỉ

| Trường | Kiểu | Nguồn | Quy tắc |
|---|---|---|---|
| `tab` | `'vocab' \| 'grammar' \| 'kanji'` hoặc vắng | query `tab` | Giá trị lạ → coi như vắng. Có `word` mà vắng `tab` → `vocab`. Vắng cả hai → hành vi cũ (giữ tab trong bộ nhớ trang). |
| `wordId` | chuỗi hoặc vắng | query `word` | Chuỗi không rỗng thì giữ nguyên, dùng làm khóa tra; không kiểm định dạng. Rỗng → vắng. |

Địa chỉ đầy đủ: `/b/<bookId>/<lesson>?tab=vocab&word=<wordId>`. Hợp đồng chi tiết: [contracts/lesson-jump-url.md](contracts/lesson-jump-url.md).

Hàm thuần ở `src/lib/lesson-url.ts`:

- `lessonUrl({ bookId, lesson, tab?, wordId? }): string` — dựng địa chỉ; chỉ thêm `word` khi có `wordId`, và khi có `wordId` thì luôn thêm `tab=vocab` nếu `tab` vắng.
- `parseLessonJump(params: URLSearchParams): { tab?: LessonTab; wordId?: string }` — đọc theo quy tắc bảng trên.
- `type LessonTab = 'vocab' | 'grammar' | 'kanji'` (thay cho `type Tab` cục bộ ở `LessonPage.tsx`).

## Kết quả tìm kiếm từ vựng (không đổi)

`VocabSearchResult` ở `src/data/search-index.ts`: `id`, `bookId`, `lesson`, `kana`, `kanji`, `romaji`, `meaning`, `score`. Đã đủ để dựng `lessonUrl({ bookId, lesson, wordId: id })`. Không sửa file này.

## Trạng thái giao diện tạm (không lưu)

| Trạng thái | Chủ | Khởi tạo | Đổi khi |
|---|---|---|---|
| `tab` | `TextbookLesson` | `jump.tab ?? 'vocab'` | Người học bấm tab; hoặc khóa `tab\|word` trong URL đổi (đặt lại theo URL, `jump.tab` có thì thắng) |
| `scrolledTo` | `TextbookLesson` | `null` | `VocabTab` gọi `onScrolled(wordId)` sau khi cuộn |
| `sectionFilter`, `editionFilter` | `VocabTab` | `relaxFilters(...)` (xem dưới) | Người học bấm bộ lọc |
| `showMeaning` | `VocabTab` | `true` | Người học bấm nút |

`VocabTab` được dựng với `key` theo `wordId` (hoặc hằng khi vắng) để mỗi lần xem mới tính lại bộ lọc khởi tạo; khi không có `wordId`, `key` không đổi nên hành vi cũ giữ nguyên.

### `relaxFilters` (hàm thuần, cùng file `VocabTab.tsx` hoặc file nhỏ trong `features/browse/`)

Vào: `item` (từ đích hoặc `undefined`), `defaults = { section: 'all', edition: editionFilterDefault }`. Ra: `{ section, edition }` khởi tạo.

| Điều kiện | Kết quả |
|---|---|
| `item` vắng (ID không còn) | `defaults` |
| `defaults.section ≠ 'all'` và `item.section ≠ defaults.section` | `section = 'all'` |
| `defaults.edition ≠ 'all'` và `item.edition` có giá trị khác `defaults.edition` | `edition = 'all'` |
| ngược lại | giữ `defaults` ở chiều đó |

(Bộ lọc `section` mặc định luôn là `all` ở mã hiện tại; hàm vẫn xử lý tổng quát để test hai chiều.)

### Props mới của `VocabTab`

| Prop | Kiểu | Ý nghĩa |
|---|---|---|
| `highlightId?` | `string` | ID từ cần tô sáng (từ `word` trong URL); vắng → không tô sáng |
| `scrollToId?` | `string` | ID từ cần cuộn tới; `TextbookLesson` bỏ trống sau khi đã cuộn |
| `onScrolled?` | `(id: string) => void` | Gọi sau khi `scrollIntoView` chạy với hàng có thật |

### Hàng từ (`VocabRow`)

- `id="vocab-<item.id>"` cho mọi hàng.
- Hàng được tô sáng: `aria-current="true"`, viền trái + nền `tint` + nhãn chữ `vi.lesson.jumpHighlightLabel`.

## Chuỗi giao diện mới (`src/i18n/vi.ts`, nhóm `lesson`)

| Khóa | Giá trị |
|---|---|
| `jumpHighlightLabel` | `Từ vừa tìm` |

Nhãn của nút loa dùng lại `vi.common.speak` (đã có); không thêm chuỗi cho câu chuyện 1.

## Chuyển trạng thái của một lần xem

```text
/search?q=… ──bấm thân hàng──▶ /b/<book>/<lesson>?tab=vocab&word=<id>
   │                                  │
   │                                  ├─ tải bài (LoadingState)
   │                                  ├─ VocabTab dựng: bộ lọc nới nếu che từ đích
   │                                  ├─ effect: hàng có thật? → cuộn center + (đã) tô sáng; onScrolled
   │                                  └─ hàng không có → không cuộn, không tô sáng, không lỗi
   ◀────────────── Quay lại ──────────┘   (F5: lặp lại từ "tải bài")
```
