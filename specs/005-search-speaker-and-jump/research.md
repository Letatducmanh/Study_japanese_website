# Research: search-speaker-and-jump

Số liệu đo trên mã hiện tại và nội dung đã dựng `public/content/mnn1/` (2026-11-20). Không có mục nào còn "cần làm rõ".

## R-1. Nút loa ở kết quả tìm kiếm: nguyên nhân và cách sửa

**Hiện trạng** ([SearchPage.tsx:70-74](../../src/features/browse/SearchPage.tsx)): `<Link>` bọc cả `<SpeakButton>` và phần chữ. `SpeakButton` là `<button>` nên bấm loa nổi bọt lên `<a>`, `Link` gọi điều hướng. Lồng `<button>` trong `<a>` còn sai chuẩn HTML (nội dung tương tác không được lồng trong `<a>`), nên Enter/Space ở loa cũng có thể kích hoạt liên kết tùy trình duyệt và trình đọc màn hình.

**Quyết định**: tách thành hai phần tử anh em trong cùng `<li>`:

```text
<li class="flex items-center gap-3">
  <SpeakButton text={r.kana} />        ← anh em, không nằm trong <a>
  <Link to={...} class="min-w-0 flex-1 ...">  ← chữ, romaji, nghĩa
</li>
```

**Lý do**: không còn đường nổi bọt nào từ nút sang liên kết, nên không cần `stopPropagation`/`preventDefault` (không dùng làm giải pháp, kể cả phụ). Bàn phím: Tab đi qua hai điểm dừng riêng; Enter/Space ở `<button>` chỉ phát âm.

**Giữ nguyên vùng chạm và khoảng cách**: nút vẫn 44×44 (lớp của `SpeakButton`, không sửa). Khoảng cách 12 px giữa nút và chữ trước đây là `gap-3` của `Link`; nay là `gap-3` của `<li>`. Khi nút tự ẩn (thiết bị không có giọng Nhật) `SpeakButton` trả `null`, `gap` của flex không tính phần tử vắng, nên bố cục hàng giống hiện nay. Hàng vẫn cao tối thiểu 44 px (`min-h-11` chuyển sang `Link`).

**Phương án loại**:

| Phương án | Vì sao loại |
|---|---|
| `onClick={e => { e.preventDefault(); e.stopPropagation() }}` trên nút | Theo yêu cầu: không là giải pháp duy nhất. Vẫn lồng `<button>` trong `<a>` (sai chuẩn, hỏng bàn phím/trình đọc màn hình). |
| Phủ liên kết lên cả hàng bằng pseudo-element (`::after`) và nâng nút lên | Phức tạp, dễ chồng vùng chạm ở 360 px; cần class mới. |
| Sửa `SpeakButton` để ngăn nổi bọt | `ui/jp/SpeakButton` dùng ở nơi khác (flashcard, trắc nghiệm, Kanji, danh sách từ); đụng ngoài phạm vi. |

**Các nơi khác có `SpeakButton` trong liên kết?** Đã kiểm `SpeakButton` ở 5 file: `VocabTab` (hàng không phải liên kết), `GrammarTab`, `KanjiPage`, `FlashcardComponent`, `McqComponent`. Chỉ `SearchPage` lồng nút trong `Link`. Kết quả tìm kiếm hiện chỉ có từ vựng, nên "mọi loại kết quả có loa" = từ vựng.

## R-2. Địa chỉ mang đích nhảy

**Quyết định**: query param trên địa chỉ trang bài: `/b/<bookId>/<lesson>?tab=vocab&word=<wordId>`.

- `word` là ID từ vựng nguyên văn (ví dụ `mnn1-l13-af449570`); ID chỉ gồm chữ thường, số, gạch ngang nên không cần mã hóa thêm, nhưng vẫn qua `URLSearchParams` để an toàn.
- `tab` chấp nhận `vocab | grammar | kanji`; giá trị khác bị bỏ qua. Có `word` mà không có `tab` thì hiểu là `vocab`.
- Một hàm thuần dựng và một hàm thuần đọc, đặt trong `src/lib/lesson-url.ts` (xem R-8).

**Lý do**:

| Yêu cầu | Query param đáp ứng thế nào |
|---|---|
| Sống qua F5 (FR-013) | Nằm trong URL, không mất khi tải lại. |
| Nút Quay lại (FR-014) | Mỗi lần bấm từ ở tìm kiếm là một mục lịch sử mới; Back về `/search?q=…` (SearchPage dùng `replace` khi đổi `q` nên không thừa mục). |
| Chạy với router hiện tại và data router | `useSearchParams` có ở cả `BrowserRouter` lẫn `createBrowserRouter`. Không phụ thuộc loader, `lazy()`, `useNavigation`. |
| Không đổi route hiện có | Không thêm route con; `/b/:bookId/:lesson` giữ nguyên. |
| Chia sẻ/đánh dấu trang | Địa chỉ đầy đủ mở lại đúng chỗ. |

**Phương án loại**:

| Phương án | Vì sao loại |
|---|---|
| Router state (`navigate(..., { state })`) | Mất khi F5 (yêu cầu nêu rõ). |
| Hash `#word-<id>` | Trình duyệt chỉ cuộn theo hash lúc điều hướng, khi phần tử chưa có (bài tải bất đồng bộ) thì không cuộn; data router xử lý hash khác `BrowserRouter`; không mang được `tab`. |
| Route con `/b/mnn1/13/vocab/<id>` | Thêm route, đụng bảng route mà `ui-kit-and-shell` sắp dựng lại; tăng rủi ro. |
| Lưu "từ cần nhảy" vào store/IndexedDB | Tạo trạng thái ngầm, không sống qua mở link mới, vi phạm tinh thần "địa chỉ đủ thông tin". |

## R-3. Tab: tham số thắng, không có thì giữ hành vi cũ

**Hiện trạng** ([LessonPage.tsx:62](../../src/features/browse/LessonPage.tsx)): `useState<Tab>('vocab')` trong `TextbookLesson`. Vì cùng một route phần tử, đi từ bài này sang bài khác (liên kết nội bộ) không dựng lại `TextbookLesson`, nên tab Ngữ pháp/Kanji có thể còn nguyên. Hành vi này giữ khi không có tham số.

**Quyết định**: tab khởi tạo từ tham số (`jump.tab ?? 'vocab'`), và khi tham số `tab`/`word` đổi trong lúc trang đang mở thì đặt lại tab theo tham số (mẫu "điều chỉnh state khi render" của React: so khóa `tab|word` với giá trị đã thấy, khác thì `setTab`). Không dùng `useEffect` để đồng bộ.

**Lý do**: tham số thắng khi có; người học bấm đổi tab thủ công vẫn đổi được (state cục bộ), không ghi ngược vào URL, nên Back/Forward không bị làm rối. Tô sáng bám vào `word` trong URL nên còn nguyên khi người học đổi sang tab khác rồi quay lại tab Từ vựng (đúng "giữ đến khi rời trang bài").

## R-4. Bộ lọc ở VocabTab: từng bộ lọc làm gì, và nới thế nào

Mã ([VocabTab.tsx:47-62](../../src/features/browse/VocabTab.tsx)): ba trạng thái `useState` cục bộ, **không lưu ở đâu cả** (không IndexedDB, không localStorage, không store). Đã grep `localStorage|sessionStorage` trong `src`: chỉ `lib/theme.ts` (chế độ sáng/tối). Nên "không ghi đè lựa chọn đã lưu" thỏa mặc nhiên: mọi thay đổi chỉ sống trong lần xem này và mất khi rời trang.

| Bộ lọc | Giá trị | Điều kiện một từ hiện | Giá trị khởi tạo |
|---|---|---|---|
| Phần (`sectionFilter`) | `all` / `main` / `extended` | `all`, hoặc `item.section` bằng giá trị | `all` |
| Bản (`editionFilter`) | `all` / `new` / `old` | `all`, hoặc từ không có `edition`, hoặc `item.edition` bằng giá trị (`matchesEdition`) | `editionFilterDefault` của sách (hiện `all` ở `content/manifest.yaml`) |
| Ẩn nghĩa (`showMeaning`) | bật/tắt | Không ẩn hàng, chỉ ẩn dòng nghĩa | bật |

**Không có phần thu gọn**: bản đầu của spec nhắc "phần thu gọn (ví dụ từ mở rộng)" (đã sửa thành "bộ lọc (phần chính/mở rộng, bản mới/cũ)"); trong mã, từ mở rộng chỉ là một nhóm có tiêu đề riêng và bị ẩn **chỉ** khi `sectionFilter = main`. Không có accordion nào. Hai bộ lọc là hai nguồn ẩn duy nhất.

**Các trường hợp từ đích bị ẩn và cách nới** (chỉ nới chiều đang che, chiều kia giữ):

| # | Từ đích | Bộ lọc hiện tại gây ẩn | Nới |
|---|---|---|---|
| 1 | `section = extended` | Phần = `main` | Phần → `all` |
| 2 | `section = main` | Phần = `extended` | Phần → `all` |
| 3 | `edition = old` | Bản = `new` | Bản → `all` |
| 4 | `edition = new` | Bản = `old` | Bản → `all` |
| 5 | Cả hai chiều cùng che (ví dụ phần `main` + bản `new`, từ `extended` + `old`) | Cả hai | Cả hai → `all` |
| 6 | Không bị che | — | Giữ nguyên |

**Quyết định**: giá trị khởi tạo của hai bộ lọc tính một lần khi dựng `VocabTab` từ `{bộ lọc mặc định, từ đích}`: chiều nào che từ đích thì khởi tạo `all`, chiều không che thì khởi tạo như cũ. Hàm thuần `relaxFilters` để test riêng. `VocabTab` được dựng lại khi từ đích đổi (`key` theo `wordId`), để một lần xem mới luôn tính lại. Người học vẫn đổi bộ lọc bằng các nút như cũ (nút bộ lọc hiện đúng giá trị đang dùng nên thấy ngay vì sao từ hiện ra).

**Phương án loại**: ghim riêng hàng đích dù bộ lọc che (hàng hiện giữa danh sách mà nút lọc báo là ẩn: gây khó hiểu và sai với ý "hiện được").

## R-5. Hàng từ: id ổn định để cuộn

`VocabRow` thêm `id` phần tử `vocab-<item.id>` (ID từ đã duy nhất toàn nội dung: 1.295 ID khác nhau trên 1.295 từ, đã chứa số bài). Tìm hàng bằng `document.getElementById`.

**Từ trùng**: có 13 cặp kana trùng giữa các bài (ví dụ `さとう` ở bài 2 là 佐藤 `mnn1-l02-b23ffe1b` và ở bài 14 là 砂糖 `mnn1-l14-97deba9a`; `～ねん` ở bài 5 và bài 11). Tìm kiếm trả `id`, `bookId`, `lesson` của đúng từ, nên URL mang đúng bài và đúng ID; không so theo chữ ở bước nào (FR-011).

**ID không còn** (FR-012): `getElementById` trả `null` → không cuộn, không tô sáng, không ném lỗi. Trang bài vẫn dựng bình thường và tab theo tham số.

## R-6. Cuộn: tránh thanh trên và thanh dưới

**Hiện trạng**: cuộn là của cửa sổ (không có vùng cuộn con). TopBar `sticky top-0` cao 56 px (`h-14`) cộng viền; `BottomNav` `sticky bottom-0`, chỉ dưới 768 px (`md:hidden`).

**Quyết định**: `element.scrollIntoView({ block: 'center', behavior: 'instant' })` chạy một lần sau khi hàng đã vào cây DOM.

**Lý do**:

- Đưa hàng vào giữa khung nhìn thì hàng cách cả thanh trên lẫn thanh dưới xa hơn nhiều so với chiều cao thanh (56 px và khoảng 60 px so với khung 740 px), không cần biết chiều cao thanh nên không lệch khi 006 đổi kích thước thanh hay thêm safe-area.
- Hàng gần đầu tài liệu (đã nằm dưới tiêu đề, tab, bộ lọc nên ở dưới thanh trên) hoặc cuối tài liệu (phía dưới còn nút "Luyện tập bài này" và thanh dưới nằm ở vị trí tự nhiên) tự bị kẹp bởi giới hạn cuộn nhưng vẫn không bị che; e2e kiểm cụ thể (R-9).
- Phương án `scroll-margin` cần hằng số chiều cao thanh (mã màu/số px nằm trong component, trái FRONTEND §12.1 tinh thần token) và đoán sai khi thanh đổi; loại.

**`behavior: 'instant'`**: `block: 'center'` mặc định theo `scroll-behavior` của CSS; app không đặt `scroll-behavior` (đã grep `src` và `index.html`), nhưng đặt `'instant'` rõ ràng để không phụ thuộc. Cuộn tức thì luôn thỏa FR-015 (giảm chuyển động) mà không cần rẽ nhánh `matchMedia`; đây là việc "đến đúng chỗ", không phải chuyển cảnh, nên không mất gì. Nếu chủ dự án muốn cuộn mượt cho người không bật giảm chuyển động thì thêm một nhánh `matchMedia('(prefers-reduced-motion: reduce)')` nhỏ; đã nêu ở báo cáo plan để chủ dự án quyết.

**Thời điểm**: `useEffect` trong `VocabTab` chạy khi `VocabTab` đã được dựng (dữ liệu bài đã tải, vì `TextbookLesson` chỉ dựng `VocabTab` sau `LoadingState`), nên hàng đã có trong DOM. Chỉ cuộn một lần mỗi lần xem: `VocabTab` bị gỡ khi người học sang tab khác và dựng lại khi quay về, nếu không chặn thì sẽ cuộn lại và giật người học khỏi chỗ họ đang đọc. `TextbookLesson` giữ một `useState` "đã cuộn tới từ nào" (không dùng `ref` đọc lúc render, tránh vướng luật `react-hooks`); `VocabTab` nhận `scrollToId` (bỏ trống khi đã cuộn) và gọi `onScrolled(id)` sau khi cuộn. Chi tiết ở `data-model.md`. `StrictMode` chạy effect hai lần ở dev: cuộn lặp lại vô hại.

## R-7. Tô sáng: viền + nhãn chữ, dùng token có sẵn

FRONTEND §12 cấm class màu mặc định Tailwind và màu là tín hiệu duy nhất. `VocabTab` hiện còn dùng class cũ (`slate-*`, `primary-*`, `amber-*`); việc chuyển token là của `pages-migration` nên không sửa các class cũ, **chỉ phần mới** dùng token:

- Hàng đích: `border-l-4 border-line bg-tint` (viền trái dày 4 px là dấu hiệu hình dạng, nền `tint` nhẹ), thêm `aria-current="true"` cho người dùng trình đọc màn hình.
- Nhãn chữ cạnh từ: `Từ vừa tìm` (chuỗi mới `vi.lesson.jumpHighlightLabel`), chữ `text-ink` trên nền `tint`.
- Tương phản: `ink` (#0c1b38) trên `tint` (#e3edfd) khoảng 15:1; sáng và tối dùng token nên tự đổi theo `.dark` (không thêm tiền tố `dark:`).
- Không thêm token mới: `line`, `tint`, `ink` đã có trong `tokens.css`. Không đổ bóng, không hoạt ảnh (FRONTEND §12.3, §12.8).

Giữ tô sáng tới khi rời trang bài: tô sáng suy ra từ `word` trong URL nên không có bộ hẹn giờ; rời trang (hoặc mở bài khác không kèm `word`) là hết.

## R-8. Hàm dựng địa chỉ dùng chung: đặt ở `lib/`

`SearchPage` (dựng địa chỉ) và `LessonPage` (đọc địa chỉ) cùng nằm trong `features/browse/`, nên không vi phạm luật "feature không import feature". Tuy vậy một hàm dựng và một hàm đọc phải khớp nhau (hợp đồng địa chỉ), và `HomePage`/`WeaknessPage` (feature khác) cũng dựng địa chỉ `/b/...` bằng chuỗi riêng; để các feature khác dùng chung sau này mà không vi phạm §4.2, đặt ở `src/lib/lesson-url.ts`: hàm thuần, không React, không import lớp nào. `features/*` được import `lib/` (§4.2); `lib/` không có khối cấm riêng trong ESLint và file mới không import gì. Không sửa `eslint.config.js`. Không sửa các nơi dựng `/b/...` khác trong feature này (ngoài phạm vi), chỉ dùng hàm mới ở `SearchPage`.

Lint đỏ vì luật lớp thì dừng hỏi, không thêm ngoại lệ (đã ghi ở plan).

## R-9. Cách kiểm cuộn và tô sáng ở e2e 360×740

Không đo bằng pixel cứng. Kiểm bằng hình học thật của trang:

1. **Hàng nằm trong khung nhìn**: `row.boundingBox()` nằm trọn trong `[0, 740]` theo chiều dọc.
2. **Không bị thanh cố định che**: lấy `header.boundingBox().bottom` (TopBar) và `nav.boundingBox().top` (BottomNav; ở 360 px đang hiện), rồi khẳng định `row.top ≥ header.bottom` và `row.bottom ≤ nav.top`. Kiểm bổ sung bằng `document.elementFromPoint` ở tâm hàng: phần tử tìm được phải nằm trong hàng (`row.contains(el)`), chứng minh không có thanh nào chồng lên.
3. **Tô sáng không chỉ màu**: hàng có `aria-current="true"`, chứa chữ `Từ vừa tìm`, và `border-left-width` tính toán ≥ 4 px (đọc bằng `getComputedStyle`, không so mã màu).
4. **Trường hợp khó**: từ ở đầu bài (hàng đầu), giữa bài và cuối bài (bài 13 có 49 từ, từ cuối `のどが かわきます` là từ mở rộng); mỗi trường hợp chạy kiểm 1-3.
5. **Giảm chuyển động**: `page.emulateMedia({ reducedMotion: 'reduce' })` rồi kiểm vẫn tới đúng hàng ngay (không chờ cuộn) và có tô sáng.
6. **F5**: `page.reload()` trên trang bài, kiểm lại 1-3.
7. **Quay lại**: `page.goBack()` rồi kiểm địa chỉ `/search?q=…` và giá trị ô tìm kiếm.
8. **Loa**: sau khi giả giọng đọc (mẫu `kana-speech.spec.ts`), dùng truy vấn có nhiều kết quả (`kimasu`), khẳng định trước tiên trang cuộn được và đã cuộn xuống (`scrollY > 0`), bấm loa ở năm kết quả khác nhau, kiểm `page.url()` vẫn là `/search?q=…`, `scrollY` không đổi sau mỗi lần bấm, `__spoken` có đúng một chuỗi kana, và không có lỗi trong console.

## R-10. Rủi ro khi `ui-kit-and-shell` chuyển sang data router + `lazy()`

| Rủi ro | Mức | Cách giảm |
|---|---|---|
| `<ScrollRestoration>` (nếu thêm) cuộn về đầu sau điều hướng và đè cuộn của mình | Thấp | `ScrollRestoration` dùng `useLayoutEffect` khi đổi vị trí; cuộn của ta là `useEffect` sau khi `VocabTab` dựng (sau cả `LoadingState`), nên chạy sau. e2e mục 1-2 ở R-9 bắt được nếu thứ tự đổi. |
| `lazy()` + `Suspense`: trang bài dựng chậm hơn một nhịp | Thấp | Cuộn gắn vào lúc `VocabTab` dựng, không gắn vào lúc điều hướng. |
| Trang bài bị dựng lại (key đổi, layout mới) làm mất `ref` "đã cuộn" | Thấp | `ref` nằm trong `TextbookLesson`; dựng lại tức là lần xem mới, cuộn lại là đúng. |
| `loader` mới cho trang bài làm tên/chữ ký `useParams`/`useSearchParams` đổi | Rất thấp | Chỉ dùng `useSearchParams` và `useParams`, có sẵn ở cả hai kiểu router. Không dùng `useLocation().state`, `useNavigation`, `useBlocker`. |
| Tab Học mới thêm liên kết nhảy riêng | Không | Dùng cùng `lessonUrl()`; đã là hợp đồng chung. |
| `TopBar`/`BottomNav` đổi chiều cao hoặc thêm safe-area | Thấp | `block: 'center'` không phụ thuộc chiều cao thanh; e2e đo thanh thật nên bắt được lệch. |

**Phần kiểm "chạy với cả hai router"**: bài kiểm đơn vị của trang bài chạy `describe.each` hai kiểu: `MemoryRouter` + `Routes`, và `createMemoryRouter` + `RouterProvider` với route dùng `lazy()` (react-router-dom 7 có sẵn; không thêm thư viện). Cả hai phải ra cùng kết quả cho cùng URL (xem `quickstart.md`).

## R-11. Không thêm thư viện

Không thêm gì. Dùng `react-router-dom` (đã có), React, Testing Library, Playwright. Không cần `research` về thư viện mới theo Constitution (Stack cố định).
