# Contract: địa chỉ nhảy tới từ (lesson-jump-url)

Hợp đồng giữa nơi dựng địa chỉ (`SearchPage`, và sau này các nơi khác) và nơi đọc (`LessonPage`). Cả hai dùng chung `src/lib/lesson-url.ts`, nên hai bên không thể lệch nhau.

## C-1. Địa chỉ

```text
/b/<bookId>/<lesson>?tab=<tab>&word=<wordId>
```

| Phần | Bắt buộc | Giá trị | Ghi chú |
|---|---|---|---|
| `<bookId>`, `<lesson>` | có | như route hiện có `/b/:bookId/:lesson` | Không đổi route. |
| `tab` | không | `vocab`, `grammar`, `kanji` | Giá trị khác → bỏ qua (như vắng). |
| `word` | không | ID từ vựng nguyên văn, ví dụ `mnn1-l13-af449570` | Không rỗng. Không kiểm định dạng; tra theo ID trong bài. |

Thứ tự tham số khi dựng: `tab` rồi `word`.

## C-2. `lessonUrl`

```ts
export type LessonTab = 'vocab' | 'grammar' | 'kanji'

export function lessonUrl(args: {
  bookId: string
  lesson: number | string
  tab?: LessonTab
  wordId?: string
}): string
```

| Vào | Ra |
|---|---|
| `{ bookId: 'mnn1', lesson: 13 }` | `/b/mnn1/13` (đúng như địa chỉ hiện nay) |
| `{ bookId: 'mnn1', lesson: 13, wordId: 'mnn1-l13-af449570' }` | `/b/mnn1/13?tab=vocab&word=mnn1-l13-af449570` |
| `{ bookId: 'mnn1', lesson: 13, tab: 'grammar' }` | `/b/mnn1/13?tab=grammar` |
| `{ bookId: 'mnn1', lesson: 13, tab: 'kanji', wordId: 'x' }` | `/b/mnn1/13?tab=kanji&word=x` |
| `wordId: ''` | như không có `wordId` |
| `wordId` có ký tự đặc biệt (`a b&c=d`) | được mã hóa, đọc ngược lại ra đúng chuỗi cũ |

## C-3. `parseLessonJump`

```ts
export function parseLessonJump(params: URLSearchParams): {
  tab?: LessonTab
  wordId?: string
}
```

| Địa chỉ | Ra |
|---|---|
| (không tham số) | `{}` |
| `?tab=grammar` | `{ tab: 'grammar' }` |
| `?tab=vocab&word=ABC` | `{ tab: 'vocab', wordId: 'ABC' }` |
| `?word=ABC` | `{ tab: 'vocab', wordId: 'ABC' }` (có `word` thì tab mặc định `vocab`) |
| `?tab=bậy&word=ABC` | `{ tab: 'vocab', wordId: 'ABC' }` |
| `?tab=bậy` | `{}` |
| `?word=` | `{}` |

Với mọi `args`, `parseLessonJump(new URL(lessonUrl(args), origin).searchParams)` trả đúng `tab` và `wordId` đã đưa vào (hai chiều khớp nhau; bảo đảm bằng test).

## C-4. Hành vi của trang bài theo địa chỉ

| Địa chỉ | Tab | Hàng tô sáng và cuộn |
|---|---|---|
| Không tham số | Giữ hành vi cũ (`vocab` khi mới mở; tab cũ nếu trang không dựng lại) | Không |
| `tab` có, không `word` | Theo `tab` | Không |
| `word` hợp lệ trong bài | `vocab` (hoặc theo `tab` nếu có) | Có: bộ lọc nới nếu che, cuộn `center` một lần, tô sáng bằng viền + nhãn chữ |
| `word` không có trong bài | Như trên | Không; không lỗi, không trang trắng |
| Tải lại (F5) | Như lần đầu | Như lần đầu |

## C-5. Bất biến

- Không dùng router state, không lưu trữ cục bộ, không cookie để mang đích nhảy.
- Chỉ đọc bằng `useSearchParams`; không đọc `useLocation().state`, không dùng `useNavigation`/`useBlocker`.
- Không route mới; `route path` giữ như bảng ở `src/app/App.tsx`.
- Địa chỉ không chứa dữ liệu cá nhân.
