# FRONTEND.md — Hướng dẫn xây giao diện Web + App cho Claude Code (v2)

> **Vị trí trong repo:** `docs/FRONTEND.md` · **Phiên bản:** 2.0 (29/10/2026), thay hoàn toàn v1.
> **Đọc file này trước MỌI việc có đụng tới giao diện** (màn hình, component, màu, chữ, layout, app native). Thứ tự ưu tiên: constitution → `docs/ARCHITECTURE.md` → file này → `specs/NNN/plan.md`.
> **Nhận diện hình ảnh** của dự án đã được chọn trong `design/SPEC.md` ("Tuyến tàu" xanh dương + vàng biển báo + chú chó Shiba). v2 giữ nguyên nhận diện đó và bổ sung phần còn thiếu: cấu trúc code, quy trình, tiếp cận, web ↔ app, danh sách việc chuyển đổi. Khi `design/SPEC.md` và file này khác nhau ở màu/chữ/hình dạng, **file này là bản chuẩn** (nó đã gộp SPEC và đo lại tương phản).
> **Người chủ dự án (Mạnh) chưa có kinh nghiệm frontend.** Tự quyết các chi tiết kỹ thuật theo file này; chỉ hỏi khi một lựa chọn làm thay đổi thứ người học nhìn thấy mà file này chưa quy định. Khi báo cáo, giải thích bằng lời thường và kèm ảnh chụp màn hình.

## Mục lục
1. Sản phẩm và người dùng
2. Một codebase cho web và app
3. Cấu trúc `src/`
4. Stack và quy ước code giao diện
5. Design system: "Tuyến tàu"
6. Layout và điều hướng
7. Công thức từng màn hình (kèm ảnh tham chiếu)
8. Thư viện component và trạng thái hiện tại
9. Lớp platform (web ↔ app)
10. Chữ trên giao diện
11. Tiếp cận, chuyển động, hiệu năng
12. Danh sách KHÔNG làm
13. Chuyển 37 file cũ sang token (bảng đổi class)
14. Quy trình làm một việc UI + Definition of Done
15. Prompt mẫu cho Mạnh

---

## 1. Sản phẩm và người dùng

- **Người dùng:** người Việt tự học tiếng Nhật N5 (sinh viên, người đi làm), học chủ yếu trên **điện thoại**, mỗi lần 5–15 phút, thường một tay.
- **Việc chính của giao diện:** cho người học **làm bài kiểm tra nhanh** và **thấy ngay mình yếu ở đâu**. Đọc nội dung là việc phụ.
- **Cảm giác:** xanh dương, trẻ trung, năng động nhưng **không game hóa nặng, không ép chuỗi ngày** (SPEC §1). Không giống sách giáo khoa, không giống bảng điều khiển SaaS.
- **Nội dung thật:** luôn dựng giao diện bằng dữ liệu thật từ `public/content/**` (Bài 1 "Giới thiệu bản thân & Nghề nghiệp", 学生, 銀行員…). Không Lorem ipsum, không từ tiếng Nhật bịa.

---

## 2. Một codebase cho web và app

```
           src/ (React + TypeScript + Tailwind)
                       │
                  npm run build
                       │
                     dist/
          ┌────────────┴─────────────┐
     Vercel (web, PWA)        Capacitor (vỏ native)
   trình duyệt, cài lên      android/ → Google Play
   màn hình chính             ios/     → App Store (cần Mac)
```

- **Không** tạo dự án React Native, Expo, Flutter hay thư mục app riêng. Mọi màn hình viết **một lần** trong `src/`.
- Capacitor được thêm ở feature `native-app`. Trước đó mọi code vẫn phải **sẵn sàng cho app**: không phụ thuộc hover, có safe-area (§6.4), API thiết bị đi qua `src/platform/` (§9).
- Phân biệt nền tảng **chỉ** bằng `platform.kind` (`'web' | 'native'`). Không rải `if (Capacitor…)` trong feature.
- SPEC chia hai kiểu bố cục: **web** (≥ 1024px: thanh điều hướng trên, container 1200px) và **app** (< 768px: thanh tab dưới). Đó là hai điểm ngắt của cùng một giao diện, không phải hai bản code.

---

## 3. Cấu trúc `src/`

Đích đến của việc dọn cấu trúc (feature `repo-restructure` và `ui-kit-and-shell`). Hiện còn `src/components/` và `src/components/ui/`; sau khi chuyển, các thư mục đó không còn.

```
src/
├── main.tsx                     # import tokens.css, fonts, render <App/>
├── app/
│   ├── App.tsx   router.tsx     # route + lazy() theo trang (§6.5)
│   ├── layouts/  AppShell.tsx (TopBar + TabBar dưới 768px)   FocusShell.tsx (không TabBar)   Container.tsx
│   ├── theme.ts                 # sáng/tối/theo hệ thống
│   └── NotFound.tsx  ComingSoon.tsx
├── features/                    # mỗi thư mục = một vùng tính năng, không import lẫn nhau
│   ├── home/  browse/  practice/(+modes/<id>/)  review/  weakness/  stats/  auth/  settings/(+AboutPage)
├── ui/                          # DESIGN SYSTEM — chỉ nhận props, không tự lấy dữ liệu
│   ├── tokens.css               # ⭐ nguồn duy nhất của màu, chữ, bo góc, chuyển động
│   ├── fonts.ts                 # import @fontsource/*
│   ├── primitives/              # Button, IconButton, Chip, SegmentedControl, Switch, Card, ListRow,
│   │                            # EmptyState, Skeleton, Sheet, Dialog, Toast, ProgressBar
│   ├── jp/                      # JpText, Ruby, KanaInput, SpeakButton, KanjiGlyph
│   ├── quiz/                    # PracticeShell, ProgressLine, FeedbackSheet, OptionButton, ChoiceGrid,
│   │                            # FlipCard, MatchBoard, PromptBlock, ResultSummary
│   ├── signature/               # StationBadge, StationList, mascot/ (ShibaMascot, TrainPlatformScene, JapanMotifBackground)
│   └── charts/                  # BarChart, SkillBars (SVG tự viết)
├── domain/  data/(+hooks/)  platform/  lib/  i18n/    # xem docs/ARCHITECTURE.md §4
```

**Quy tắc tên:** file component `PascalCase.tsx`, file khác `kebab-case.ts`, test cạnh file `*.test.tsx`. Mỗi component một file, ≤ 200 dòng; dài hơn thì tách.
**Khi nào tạo component trong `ui/`?** Khi dùng ở ≥ 2 feature, hoặc là một phần của design system ở §8. Nếu không thì để trong thư mục feature.
**Không được** tự vẽ lại thứ đã có trong `ui/`. Audit ghi nút chính bị copy-paste ở ≥ 10 nơi: mọi nút phải dùng `<Button>`.

---

## 4. Stack và quy ước code giao diện

| Việc | Dùng | Ghi chú |
|---|---|---|
| UI | React 19 + TypeScript strict | Function component + hook |
| Style | **Tailwind CSS v4**, token trong `@theme` | Chỉ dùng class sinh từ token (`bg-surface`, `text-ink`, `border-border`, `rounded-control`). Không `style={{color:'#…'}}`, không `bg-[#…]`. **Không dùng tiền tố `dark:`**: token tự đổi theo class `.dark` |
| Gộp class, biến thể | `clsx` + `tailwind-merge` (`lib/cn.ts`), `class-variance-authority` | Cài ở feature `ui-kit-and-shell` |
| Điều hướng | React Router 7; chuyển sang data router + `lazy()` | |
| State phiên làm bài | Zustand (`features/practice/session-store.ts`) | Không dùng cho dữ liệu nội dung |
| Dữ liệu | hook trong `data/hooks` (`useLesson`, `useMastery`…), trả `{ status: 'loading'\|'ready'\|'error', data, retry }` | `use-async-data` chuyển vào đây |
| Hộp thoại, tab, menu | Radix UI Primitives (headless) **hoặc** tự viết đúng ARIA | Không dùng bộ UI có sẵn giao diện (MUI, Ant, Chakra, shadcn để nguyên) |
| Icon | **`lucide-react`** (đã cài), nét 2px, cỡ 22–24 | Không emoji làm icon. Icon riêng (ga, tàu) vẽ SVG trong `ui/signature` |
| Font | `@fontsource/be-vietnam-pro` (400, 500, 700) và `@fontsource/zen-kaku-gothic-new` (500, 700) | Tự host, chạy offline. **Bỏ** Google Fonts, Noto Sans JP, M PLUS Rounded 1c. Nếu tên gói không có trên npm thì báo Mạnh, không tự đổi font |
| Kéo thả | **Không cần.** Sắp xếp câu dùng "chạm để đặt" như `design/` | `@dnd-kit` chỉ thêm khi Mạnh yêu cầu |

**Mẫu component đúng chuẩn:**

```tsx
// src/ui/primitives/Button.tsx
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/cn';

const button = cva(
  'inline-flex items-center justify-center gap-2 font-bold min-h-11 px-5 rounded-control ' +
  'transition-colors duration-fast focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-line ' +
  'disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-yellow text-ink',                     // MỘT nút vàng mỗi màn hình: bước tiếp theo
        solid:   'bg-line text-white',                     // hành động chính trong thẻ / đáp án "Đúng"
        outline: 'bg-surface text-line border-2 border-line',
        wrong:   'bg-surface text-wrong border-2 border-wrong',
        ghost:   'text-deep hover:bg-tint',
      },
      size: { md: 'text-base', lg: 'text-lg min-h-14 w-full' },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
);

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof button>;
export function Button({ className, variant, size, ...rest }: Props) {
  return <button className={cn(button({ variant, size }), className)} {...rest} />;
}
```

**Mẫu trang đúng chuẩn** (đủ 3 trạng thái, chuỗi từ `vi.ts`):

```tsx
export default function LessonPage() {
  const { bookId, lesson } = useParams();
  const q = useLesson(bookId!, Number(lesson));
  if (q.status === 'loading') return <LessonSkeleton />;
  if (q.status === 'error') return <EmptyState title={t.lesson.loadError} action={{ label: t.common.retry, onClick: q.retry }} />;
  return (/* … */);
}
```

---

## 5. Design system: "Tuyến tàu"

### 5.1 Ý tưởng (từ SPEC §1)

Xanh dương làm chủ đạo, **vàng biển báo** làm điểm nhấn. Mỗi giáo trình là một tuyến tàu, mỗi bài là một **ga**: `StationBadge` vòng tròn có mã (`L01`…`L25`). Chú chó **Shiba** là nhân vật của app.

- **Mã ga** lấy từ `content/manifest.yaml` (thêm `line: { code: "L" }` cho mỗi book; MNN1 = `L`, Kanji Master = `K`). Không viết cứng "L" trong code.
- **Shiba** chỉ xuất hiện ở: trang chủ, tab Học (đầu trang), màn kết quả (vẫy tay), trạng thái rỗng. **Không** có trong màn đang làm bài. Không đặt lơ lửng ở góc: web đứng trên sân ga cạnh đoàn tàu, app ngồi trên mép thẻ chính (SPEC §5). Hoạt ảnh vẫy tay tắt khi `prefers-reduced-motion`.
- **Chỗ phô diễn duy nhất:** thẻ chính màu `deep` (ga hiện tại / kết quả) cùng Shiba. Các phần còn lại giữ yên và rõ.

### 5.2 Màu (token)

Giá trị sáng lấy từ SPEC §2. Cột "Đo" là tỉ lệ tương phản đã tính (29/10).

| Token | Sáng | Tối | Dùng cho | Đo (chữ/nền) |
|---|---|---|---|---|
| `bg` | `#F2F6FC` | `#08142B` | nền trang | |
| `surface` | `#FFFFFF` | `#101F3F` | thẻ, khung | |
| `ink` | `#0C1B38` | `#E9F0FF` | chữ chính | 15.75 trên `bg`, 17.08 trên `surface` |
| `muted` | `#4A5B78` | `#9CB0D0` | chữ phụ | 6.33 trên `bg`, 5.82 trên `tint` |
| `line` | `#1565E8` | `#5B9BFF` | **màu chính**: nút, liên kết, tuyến, đáp án đúng | 5.17 trên `surface`, 4.77 trên `bg`, chữ trắng trên `line` 5.17 |
| `deep` | `#0A2A66` | (xem `index.css`) | thẻ chính, biển ga, viền điểm hiện tại, chữ trên `tint` | 13.67 với chữ trắng; 11.59 trên `tint` |
| `yellow` | `#FFD21F` | giữ nguyên | CTA bước tiếp theo, ga hiện tại. **Chữ trên vàng dùng `ink`** (tối: `bg` tối) | 11.79 (sáng), 12.65 (tối) |
| `tint` | `#E3EDFD` | (xem `index.css`) | nền nhẹ, thẻ đã chọn / đúng | |
| `track` | `#C5D3EA` | (xem `index.css`) | đường ray, thanh tiến độ chưa đạt | |
| `border` | `#D7E1F2` | (xem `index.css`) | viền thẻ | |
| `border-strong` | `#B7C5DD` | (xem `index.css`) | viền nút/chip chưa chọn | **1.74 — chưa đạt 3:1** (xem lưu ý dưới) |
| `wrong` | `#C2410C` | (xem `index.css`) | sai, chưa đúng (cam đậm), chữ và viền | 5.18 trên `surface`, 4.68 trên `wrong-bg` |
| `wrong-bg` | `#FFF1E6` | (xem `index.css`) | nền khối sai | |
| `wrong-ink` | `#7C2D12` | (xem `index.css`) | chữ đậm trên nền sai | 8.47 trên `wrong-bg` |
| `shiba-*` | `#E8A456`, `#F2C498`, `#FFB0C4` | — | chỉ trong SVG chú chó | |

- Giá trị tối của `deep`, `tint`, `track`, `border`, `border-strong`, `wrong*` nằm trong `src/index.css` (đã suy ra và kiểm tra khi làm giai đoạn 1). **Không đổi nếu chưa cần**; nếu đổi thì đo lại và cập nhật bảng này.
- **Đúng = `line` + ✓, sai = `wrong` + ✗. Không dùng đỏ hay xanh lá** (SPEC §5: cặp xanh–cam dễ phân biệt hơn đỏ–xanh lá với người mù màu). Luôn có biểu tượng **và chữ**, màu không bao giờ là tín hiệu duy nhất.
- **Chữ `line` trên nền `tint` chỉ đạt 4.39:1** → trên `tint` dùng chữ `deep` hoặc `ink`. `line` chỉ dùng cho chữ trên `surface`/`bg`.
- **Điểm vàng** (ga hiện tại, chốt thanh tiến độ) gần như vô hình trên `bg` (1.34:1) nên **luôn có viền `deep` 3px**.
- **Lưu ý cần Mạnh duyệt:** `border-strong` (viền ô chưa chọn) chỉ đạt 1.74:1, thấp hơn mức 3:1 mà WCAG khuyến nghị cho đường viền nhận diện ô bấm. Chữ trong ô vẫn đọc được nên chưa vi phạm nặng. Nếu muốn đạt, đổi thành `#7A8DB0` (3.35 trên `surface`, 3.09 trên `bg`), viền sẽ đậm hơn một chút. Chưa đổi khi chưa có xác nhận.
- Không dùng lại `#0f172a` (slate-900) và `#2563eb` (xanh mặc định của Tailwind) ở bất cứ đâu, kể cả `<meta name="theme-color">` trong `index.html`.

### 5.3 Chữ

| Vai trò | Font | Độ đậm |
|---|---|---|
| Giao diện, tiếng Việt | **Be Vietnam Pro** (thiết kế cho dấu tiếng Việt) | 400, 500, 700 |
| Chữ Nhật | **Zen Kaku Gothic New** | 500, 700 |

Font stack: `'Be Vietnam Pro', 'Zen Kaku Gothic New', 'Noto Sans JP', system-ui, sans-serif` (Be Vietnam Pro đứng trước để đủ dấu tiếng Việt). Không dùng Inter, Roboto hay font hệ thống làm font giao diện.

Cỡ chữ (px): hero **56** (mobile **36**) · H2 **28** · tiêu đề thẻ **18** · thân **15–16** · phụ **13** · nhỏ nhất **12** (không dưới 11).
**Chữ Nhật là nhân vật chính:** kanji trên flashcard và câu hỏi **56**, kana mặt trước flashcard **34**, furigana **14**.

- Thân bài line-height 1.6, dòng ≤ 70 ký tự. Số điểm, số ga, đồng hồ: `font-variant-numeric: tabular-nums`.
- Chữ tiếng Nhật luôn bọc `<JpText>` (đặt `lang="ja"`) để trình duyệt chọn đúng dạng chữ Hán Nhật. Hiện mới có 2 chỗ trong `.tsx` đặt `lang="ja"`.
- Không dùng chữ IN HOA cho nhãn, không giãn chữ, không font monospace.

### 5.4 Hình dạng, khoảng cách

- **Bo góc theo cấp bậc:** nút `control` 12 · thẻ `card` 14 · khung lớn `panel` 16–20 · chip/pill `full`. Tên token trong `index.css` (`--radius-control`, `--radius-card`, `--radius-panel`); nếu chưa có thì thêm, không viết số px trong component.
- **Thang khoảng cách:** 4, 8, 12, 16, 20, 24, 32, 48. Mobile: 16 hai bên.
- Vùng chạm ≥ **44px**. Viền 1px (`border`); nhấn 2px (`line`).
- **Không đổ bóng, không gradient, không glassmorphism, không emoji làm icon.** Phân lớp bằng màu nền (`bg` → `surface`) và viền.

### 5.5 Chuyển động

- Chuyển động **tối đa 250ms**. Token: `fast` 120 (nhấn nút), `base` 200 (đổi trạng thái ô, mở tab), `slow` 250 (bottom sheet trượt lên, lật flashcard). Easing `cubic-bezier(0.22, 1, 0.36, 1)`.
- Chỉ để **trả lời hành động** (bấm, lật, mở, đúng/sai). Không hiệu ứng hiện dần khi cuộn, không hover nhún mọi thẻ.
- Sai: ô đáp án rung ngang 2 lần (±4px, 240ms) + `platform.haptics.error()`; đúng: `haptics.success()`.
- **Âm thanh đúng/sai (`lib/sfx.ts`): giữ, mặc định TẮT**, có công tắc "Âm thanh đúng/sai" trong Cài đặt, lưu trong settings.
- Tôn trọng `prefers-reduced-motion`: tắt rung, lật, vẫy tay.

### 5.6 File token

Hiện nằm trong `src/index.css` (khối `@theme`, cùng token cũ `primary-*`, `success`, `danger`, `warning` còn dùng ở 31 file). Ở feature `ui-kit-and-shell` chuyển sang `src/ui/tokens.css` và **thêm token mới song song**; chỉ xóa `primary-*` khi toàn bộ 37 file đã chuyển xong (§13). Tên token theo bảng §5.2: `--color-bg`, `--color-surface`, `--color-ink`, `--color-muted`, `--color-line`, `--color-deep`, `--color-yellow`, `--color-tint`, `--color-track`, `--color-border`, `--color-border-strong`, `--color-wrong`, `--color-wrong-bg`, `--color-wrong-ink`. Đổi giao diện sáng/tối bằng class `.dark` đặt lại các biến này.

---

## 6. Layout và điều hướng

### 6.1 Điểm ngắt

| Bề rộng | Bố cục |
|---|---|
| < 768px (app) | 1 cột; thanh tab dưới 5 mục (Trang chủ, Học, Ôn tập, Điểm yếu, Thống kê); thiết kế ở 360–390px |
| 768–1023px | container 720px, lưới 3–4 cột, vẫn tab dưới |
| ≥ 1024px (web) | thanh trên: logo, 5 liên kết, tìm kiếm, đổi giao diện, cài đặt. Container tối đa 1200px, padding ngang 24px, căn giữa. Trang đọc dài (bài học, chi tiết Kanji) tối đa 880px |

Thiết kế và kiểm tra ở **360px trước**, rồi 390, 768, 1440. Không có thanh cuộn ngang ở 360px. Không để nội dung kéo giãn hết bề ngang hoặc dồn trái bỏ trống bên phải.

### 6.2 AppShell và FocusShell

- **AppShell:** TopBar (logo + tìm kiếm + cài đặt) + nội dung + TabBar dưới (chỉ < 768px). Tab đang chọn: icon + chữ `line`, vạch 3px phía trên.
- **FocusShell = `PracticeShell`** (SPEC §5): khi luyện tập **ẩn TopBar và TabBar**. Gồm nút ✕ 44px, `ProgressLine` (đường 6px màu `track`, phần đã qua `line`, điểm vàng bán kính 7 viền `deep` 3px) và bộ đếm "n/N". Hiện `Layout.tsx` vẫn hiện thanh trên và thanh dưới khi làm bài: đây là việc phải sửa.
- **Nhãn bộ đếm theo dạng bài:** dạng thường "n/N"; **Ghép cặp** hiện đồng hồ và "x/6 cặp"; **Đúng/Sai tốc độ** hiện "Còn lại / Điểm / Kỷ lục". Không in "Câu n/N" cho hai dạng này.

### 6.3 Phím tắt (giữ nguyên SPEC §7)

`Space` lật thẻ · `1–4` chọn đáp án · `Enter` tiếp tục hoặc kiểm tra · `←` / `→` cho Sai / Đúng ở dạng Đúng/Sai tốc độ · `Esc` thoát (có xác nhận) · `R` nghe lại. Đặt **một lớp phím tắt chung** trong `PracticeShell` thay vì mỗi mode tự `addEventListener`. Hiện gợi ý phím trên ≥ 1024px.

### 6.4 Sẵn sàng cho app (bắt buộc từ bây giờ)

- `index.html`: `viewport` có `viewport-fit=cover`; `theme-color` đổi sang `deep` hoặc `bg`, không dùng `#2563eb`.
- Header dùng `padding-top: env(safe-area-inset-top)`; TabBar và nút cố định đáy dùng `padding-bottom: max(12px, env(safe-area-inset-bottom))`.
- Dùng `min-h-dvh`, không dùng `min-h-screen`/`100vh`.
- Ô nhập chữ ≥ 16px (iOS tự phóng to nếu nhỏ hơn).
- Mọi thao tác làm được bằng chạm; hover chỉ là phần thêm (`@media (hover:hover)`).
- Nút quay lại của Android (feature `native-app`): đóng sheet/dialog trước rồi mới lùi trang; trong `PracticeShell` thì hỏi "Thoát bài đang làm?".
- Liên kết ra ngoài mở bằng `platform.openExternal(url)`.

### 6.5 Bảng route

Theo *Ke_hoach_Website §7.1* (đã có trong `App.tsx`). Phân layout: `/practice/run` và `/review` đang ôn dùng **FocusShell**; mọi trang khác dùng **AppShell**. Mọi trang `lazy()`. Trang chưa làm (`/review`, `/stats`, `/login`, `/register`, `/forgot-password`, `/account`) dùng `EmptyState` nói rõ tính năng gì sắp có.

---

## 7. Công thức từng màn hình

**Ảnh tham chiếu:** 11 ảnh trong `design/` (sau feature `repo-restructure`: `docs/reference/design/`; tên file thực tế là tên tiếng Việt kèm `@1x/@2x`, ví dụ `App · Tab Học@1x.png`; SPEC §6 ghi tên khác, không khớp). Bảng dưới gọi ảnh theo màn hình. Khi dựng một màn hình, **mở ảnh tương ứng trước** và đặt cạnh ảnh chụp thực tế để so (§14).

| # | Màn hình | Ảnh | Quy tắc chính |
|---|---|---|---|
| 1 | Trang chủ app (390px) | `App · Trang chủ` | TopBar (logo, tìm kiếm, cài đặt). Shiba cùng bong bóng "がんばって！ Cùng học nào!" phía trên thẻ chính. **Thẻ chính màu `deep`**: StationBadge, "Ga đầu tiên · Minna no Nihongo 1", tên bài, `ProgressLine` 7 chấm, nút vàng "Bắt đầu học". Mục "Hôm nay": 3 `ListRow` (Ôn tập hôm nay, Điểm yếu nổi bật, Chuỗi ngày học), mỗi hàng có ô icon `tint`. Mục "Luyện nhanh": chip cuộn ngang. Nội dung chưa có thì ghi rõ ("Chưa có thẻ cần ôn"), không để trống |
| 2 | Tab Học | `App · Tab Học` | Tiêu đề "Học" + "Minna no Nihongo 1 · 25 bài", nhãn N5 JLPT, Shiba. Tuyến dọc: vạch `track`, mỗi bài là `StationBadge` + thẻ. Ga đang học mở rộng thành thẻ lớn: nhãn vàng "Ga xuất phát", tên bài, 3 nút Từ vựng / Ngữ pháp / Kanji, nút `solid` "Luyện tập bài này". Bài khác thu gọn ("Bài 2 · Từ vựng · Ngữ pháp · Kanji"). Cuối: "còn 20 ga nữa tới L25". **Bổ sung mục tiêu chính của sản phẩm:** mỗi ga hiện **% thành thạo**; ga dưới 40% có nhãn "Cần ôn" màu `wrong` kèm số % (không chỉ đổi màu) |
| 3 | Thiết lập luyện tập | `Luyện tập · Thiết lập` | Hai công tắc đầu trang (Gồm từ vựng mở rộng, Bài kiểm tra tổng hợp). "Dạng bài" chia nhóm theo kỹ năng kèm số lượng (Nhớ từ · 6 dạng, Nghe · 2, Gõ và phản xạ · 3, Câu và ngữ pháp · 5), mỗi dạng là `Chip` bật/tắt (chọn = nền `line`, chữ trắng, có ✓; chưa chọn = nền trắng, viền `border-strong`; `aria-pressed`). "Số câu" là `SegmentedControl` 10/20/50/Tất cả. Cuối cố định: tóm tắt "2 dạng bài · 10 câu" + nút vàng "Bắt đầu luyện tập". **Danh sách và nhóm lấy từ `questionRegistry`** (thêm trường `group` vào `QuestionType`), không viết cứng |
| 4 | Flashcard | `Luyện tập · Flashcard` | `PracticeShell`. `SegmentedControl` Kana / Kanji / Nghĩa (chọn mặt trước). Thẻ: furigana 14, kanji 56, romaji, nghĩa màu `line`, nút loa góc trên phải; hai bên gợi ý thẻ trước/sau. Câu hỏi "Bạn nhớ từ này đến mức nào?" rồi 4 nút lưới 2×2 kèm khoảng cách ôn và phím: Quên (outline), Khó (outline), **Nhớ** (`solid`), **Dễ** (vàng). Nhãn đổi từ "Tốt" thành **"Nhớ"** cho khớp ảnh |
| 5 | Trắc nghiệm | `Luyện tập · Trắc nghiệm` | Câu hỏi có furigana + loa. `OptionButton` đánh số 1–4. Sau khi chọn: ô chọn sai nền `wrong-bg` + viền `wrong` + nhãn "Bạn chọn · chưa đúng" + ✗; đáp án đúng nền `tint` + viền `line` + nhãn "Đáp án đúng" + ✓; ô còn lại mờ. `FeedbackSheet` dưới đáy: ✗ "Chưa đúng" + giải thích ngắn (in đậm nghĩa đúng) + nút vàng "Tiếp theo" kèm gợi ý "Enter" |
| 6 | Gõ đáp án | `Luyện tập · Gõ đáp án` | Câu hỏi là nghĩa tiếng Việt cỡ lớn. Ô nhập đổi romaji sang kana (`KanaInput`), nút xóa ✕, "Gợi ý: chữ đầu là き", nút loa. **Sau khi bấm Kiểm tra hoặc Enter phải hiện `FeedbackSheet`** (đây là sửa lỗi "không phản hồi" của 3 dạng gõ): "Gần đúng, thiếu một chữ", hàng "Bạn gõ / Đáp án (教師)", chữ bị thiếu gạch chân màu `wrong`, dòng giải thích. Ô nhập đổi viền `wrong` + nền `wrong-bg` khi sai |
| 7 | Ghép cặp | `Luyện tập · Ghép cặp` | Đồng hồ dạng chip ở header ("0:27"), dòng hướng dẫn "Chạm từ tiếng Nhật, rồi chạm nghĩa của nó" + "2/6 cặp". Hai cột 6 hàng. 4 trạng thái: chưa chọn (trắng, viền `border-strong`), đang chọn (viền `line` 2px), khớp (nền `tint` + ✓, chữ `muted`), chưa khớp (`wrong-bg` + ✗ + rung). Dải thông báo "Chưa khớp: 学生 không phải "giáo viên". Thử lại nhé." Cuối trang có khung chú giải 4 trạng thái (SPEC §6) |
| 8 | Đúng/Sai tốc độ | `Luyện tập · Đúng-Sai tốc độ` | Ba ô số liệu: "Còn lại" (nền `deep`), "Điểm", "Kỷ lục"; thanh tiến độ; chip vàng "Chuỗi đúng ×3" + "✓ +10 vừa rồi đúng". Thẻ lớn: từ Nhật, dấu "=", nghĩa màu `line`, "Cặp này có đúng không?". Hai nút: **Sai** (`wrong`, ✗, "phím ←") và **Đúng** (`solid`, ✓, "phím →") |
| 9 | Sắp xếp câu | `Luyện tập · Sắp xếp câu` | Bản dịch tiếng Việt làm đề ("Tôi là sinh viên."). Khung chứa ô nét đứt; các từ ở dưới. **Chạm một từ để đưa lên dòng, chạm lại để gỡ xuống** (không cần kéo thả). Nút cuối bị khóa "Xếp đủ 3 từ để kiểm tra" cho đến khi đủ từ |
| 10 | Kết quả | `Luyện tập · Kết quả` | Nút ✕ + "Kết quả". **Thẻ `deep`** có Shiba vẫy tay trên mép: "Xong lượt luyện · Nhật → Nghĩa, Bài 1", "7/10 câu đúng", hai ô "Chính xác 70%" và "Thời gian 1:12". Mục "Câu cần ôn · 3 câu": mỗi câu một thẻ gồm từ, nhãn dạng bài, "✗ Bạn chọn", "✓ Đáp án". Cố định đáy: nút vàng "Làm lại 3 câu sai", nút `outline` phía dưới |
| 11 | Trang chủ web (1440px) | `Web · Trang chủ` | Thanh trên có 5 liên kết. Hero 2 cột: trái là nhãn N5, tiêu đề, đoạn mô tả, 2 nút, hàng số liệu; phải là thẻ có Shiba đứng trên sân ga cạnh đoàn tàu + tuyến 8 ga + hàng "Ga đầu tiên". Dưới: "Hôm nay của bạn" (3 thẻ có phần xem trước nét đứt), "Chọn cách luyện" (4 cột theo nhóm kỹ năng), "Tuyến Minna no Nihongo 1" (lưới 5×5 thẻ ga, `grid auto-fill minmax(200px,1fr)`), chân trang |

**Các dạng bài còn lại dùng chung khung** (SPEC §6): Nghe → Nghĩa, Điền từ, Chọn trợ từ, Hiểu nghĩa câu, Chọn mẫu ngữ pháp, Nghĩa → Nhật, Kanji → Cách đọc, Kana → Kanji, Nghĩa → Kanji dùng khung Trắc nghiệm; Chính tả nghe dùng khung Gõ đáp án kèm nút "Nghe lại".

**Màn hình chưa có ảnh** (Điểm yếu, Sổ lỗi sai, Chi tiết Kanji, Tìm kiếm, Cài đặt, Giới thiệu, Thống kê): dựng bằng đúng các khối ở §8 và phong cách của 11 ảnh trên. **Trước khi code, phác wireframe 390px + 1440px gửi Mạnh duyệt.**

**Khi chạm vào trang chủ web:** hàng số liệu "25 bài học · 16 dạng luyện tập · Có tiếng" nói về sản phẩm, không phải về người học. Nên ưu tiên số liệu của người học (ga hiện tại, thẻ cần ôn, ga yếu nhất). Việc này không bắt buộc và cần Mạnh đồng ý.

### Trạng thái rỗng, lỗi, đang tải
- **Đang tải:** `Skeleton` đúng hình dạng nội dung; dưới 300ms thì không hiện gì.
- **Rỗng:** một câu nói rõ chuyện gì + một nút làm việc tiếp theo, có thể kèm phần xem trước mờ nét đứt (SPEC §5). VD sổ lỗi sai rỗng: "Chưa có câu sai nào. Làm một bài trắc nghiệm để bắt đầu." [Luyện Bài 1].
- **Lỗi:** nói cái gì hỏng + cách sửa. VD "Chưa tải được Bài 5. Kiểm tra kết nối rồi thử lại." [Thử lại]. Không xin lỗi, không "Đã có lỗi xảy ra".

---

## 8. Thư viện component và trạng thái hiện tại

Cột "Trạng thái" lấy từ audit 29/10. **Có** = đã có trong `src/components/ui/` (sẽ chuyển vào `src/ui/`); **Mới** = chưa có.

| Nhóm | Component | Trạng thái | Ghi chú |
|---|---|---|---|
| primitives | `Button` (primary, solid, outline, wrong, ghost) | Có | Thêm biến thể `wrong`; bỏ nút copy-paste ở ≥ 10 nơi |
| | `Chip`, `SegmentedControl`, `Switch`, `Card`, `EmptyState`, `Container` | Có | `Container` → `app/layouts/` |
| | `IconButton` (≥ 44×44), `ListRow` (≥ 56px), `Skeleton`, `ProgressBar`, `Sheet`, `Dialog`, `Toast` | Mới | |
| jp | `Ruby`, `SpeakButton`, `KanjiCard` | Có (ở `components/`) | `SpeakButton` được phép dùng `platform.tts` |
| | `JpText`, `KanaInput`, `KanjiGlyph` | Mới | `KanaInput`: `autocapitalize="off"`, `autocorrect="off"`, `spellcheck=false`, cỡ ≥ 18px |
| quiz | `PracticeShell`, `ProgressLine`, `FeedbackSheet`, `OptionButton`, `PromptBlock`, `ChoiceGrid`, `FlipCard`, `MatchBoard`, `ResultSummary` | Mới | `TextChoiceCard` và `BlankChoiceCard` (10/16 dạng dùng) được thay bằng `OptionButton` + `FeedbackSheet`. Dạng bài mới **phải** dựng từ các khối này |
| signature | `StationBadge` | Có | Đang chỉ dùng trong trang styleguide; phải dùng ở Tab Học, trang chủ, lưới bài |
| | `StationList` (tuyến dọc/ngang, có % thành thạo) | Mới | Thay lưới ô vuông của `BookPage` |
| | `mascot/*` | Có (ở `components/mascot/`) | Quy tắc đặt Shiba ở §5.1 |
| charts | `BarChart`, `SkillBars` | Mới | SVG tự viết, có bảng dữ liệu ẩn cho trình đọc màn hình |

**`StationBadge` (SPEC §5):** vòng tròn 44px, viền 3–4px màu `line`, chữ mã ga. Bài đang học: nền vàng, viền `deep`. Bài đã học: đặc màu `line`. `aria-label="Bài 5, tuyến L"`.
**`FeedbackSheet`:** bottom sheet trên mobile, khối nội tuyến dưới nội dung trên desktop. Gồm ✓ (`line`) hoặc ✗ (`wrong`), tiêu đề, giải thích ngắn, nút vàng "Tiếp theo" + gợi ý Enter. Kết quả đúng/sai thông báo qua vùng `aria-live="polite"`.
**`OptionButton`:** 4 trạng thái (mặc định, chọn sai, đáp án đúng, mờ). Giao diện ở màn hình số 5.

---

## 9. Lớp platform (web ↔ app)

```ts
// src/platform/types.ts
export interface Platform {
  kind: 'web' | 'native';
  tts: {
    isAvailable(): Promise<boolean>;          // có giọng ja-JP không
    speak(text: string, opts?: { rate?: number }): Promise<void>;
    stop(): void;
  };
  haptics: { tap(): void; success(): void; error(): void };
  openExternal(url: string): Promise<void>;
  share(data: { title: string; text?: string; url: string }): Promise<void>;
  onBack(handler: () => boolean): () => void; // trả true = đã xử lý; trả hàm hủy đăng ký
}
```

| API | `platform/web/` | `platform/native/` |
|---|---|---|
| tts | `speechSynthesis`, chọn voice `ja-JP` (chuyển từ `lib/tts.ts`) | `@capacitor-community/text-to-speech` (WebView Android thường **không** có giọng đọc) |
| haptics | `navigator.vibrate(10 / 20 / [30,40,30])` nếu có | `@capacitor/haptics` |
| openExternal | `window.open(url, '_blank', 'noopener')` | `@capacitor/browser` |
| share | `navigator.share`, không thì chép link + Toast | `@capacitor/share` |
| onBack | `popstate` | `@capacitor/app`, sự kiện `backButton` |

`src/platform/index.ts` chọn bản cài: trước feature `native-app` chỉ xuất `webPlatform`. Feature và `ui/` chỉ viết `import { platform } from '@/platform'`; `ui/jp/SpeakButton` được phép làm vậy (xem `ARCHITECTURE.md` §4.2).

---

## 10. Chữ trên giao diện

- Mọi chuỗi nằm trong `src/i18n/vi.ts`, nhóm theo màn hình.
- **Giọng:** như một người bạn học cùng: ngắn, rõ, xưng "bạn". Viết hoa đầu câu, không viết hoa mỗi chữ.
- **Nút nói đúng việc sẽ xảy ra**, giữ cùng một tên trong cả luồng:

| Không viết | Viết |
|---|---|
| Bắt đầu ngay! 🚀 | Bắt đầu luyện tập |
| Submit / Gửi | Kiểm tra |
| Chúc mừng bạn đã hoàn thành xuất sắc! | Xong lượt luyện. 7/10 câu đúng. |
| Đã có lỗi xảy ra | Chưa tải được Bài 5. Kiểm tra kết nối rồi thử lại. |
| Không có dữ liệu | Chưa có câu sai nào. Làm một bài trắc nghiệm để bắt đầu. |
| Sai rồi! | Chưa đúng |

- Thuật ngữ cố định: "bài" (MNN) / "chương" (Kanji Master; lấy `lessonLabel` từ manifest), "ga", "từ chính / từ mở rộng", "độ thành thạo", "điểm yếu", "sổ lỗi sai", "ôn tập", "dạng bài".
- Dấu chấm giữa dùng để ngăn các mục ngắn cùng loại như trong ảnh ("Từ vựng · Ngữ pháp · Kanji", "Minna no Nihongo 1 · 25 bài"). Không dùng để nối cả câu.
- Không emoji trong giao diện; dùng icon Lucide.

---

## 11. Tiếp cận, chuyển động, hiệu năng

**Tiếp cận**
- Chữ thường tương phản ≥ 4.5:1 (bảng §5.2 đã đo). Viền ô bấm nên ≥ 3:1 (xem lưu ý `border-strong`).
- **Focus:** viền 2px màu `line`, cách 2px (`focus-visible`), cho mọi phần tử bấm được.
- `aria-label` cho nút chỉ có icon; icon trang trí `aria-hidden`. Chip bật/tắt dùng `aria-pressed`; công tắc dùng `role="switch"`.
- Đúng/sai có biểu tượng + chữ + `aria-live`.
- Tôn trọng `prefers-reduced-motion`.

**Hiệu năng**
- JS tải lần đầu ≤ 200 KB gzip; mỗi trang `lazy()`; nội dung bài tải theo bài (đã có).
- Font: chỉ import các độ đậm đã nêu; `font-display: swap`.
- Danh sách > 100 hàng (tìm kiếm, toàn bộ từ vựng) phải ảo hóa hoặc phân trang.
- Đồng hồ của dạng Đúng/Sai tốc độ và Ghép cặp tách thành component riêng, không làm re-render cả lưới đáp án mỗi nhịp.

---

## 12. Danh sách KHÔNG làm

1. Class màu mặc định của Tailwind (`slate-*`, `blue-*`, `red-*`, `green-*`, `amber-*`), `primary-*` cũ, mã hex viết trực tiếp trong component (trừ SVG linh vật và trang styleguide).
2. `#0f172a` và `#2563eb` ở bất cứ đâu, kể cả `theme-color`.
3. Đổ bóng, gradient, glassmorphism (`backdrop-blur`), emoji làm icon.
4. Inter, Roboto, font hệ thống làm font giao diện; font tiếng Nhật khác Zen Kaku Gothic New.
5. Đỏ hoặc xanh lá cho đúng/sai. Dùng `line` + ✓ và `wrong` + ✗, luôn kèm chữ.
6. Màu là tín hiệu duy nhất cho đúng/sai/mức thành thạo.
7. Shiba lơ lửng ở góc; Shiba trong màn đang làm bài.
8. Game hóa nặng, ép chuỗi ngày, confetti, hiệu ứng hiện dần khi cuộn, hover nhún mọi thẻ.
9. Nhiều hơn **một** nút vàng trên một màn hình.
10. Tự vẽ lại nút/thẻ/ô đáp án thay vì dùng `ui/`.
11. Chữ tiếng Nhật không có `lang="ja"`.
12. Chuỗi tiếng Việt viết thẳng trong JSX; "Lorem ipsum"; từ tiếng Nhật bịa.
13. Nhãn nhỏ IN HOA giãn chữ; font monospace cho nhãn.
14. Bộ đếm "Câu n/N" ở Ghép cặp và Đúng/Sai tốc độ.
15. Hiện TopBar/TabBar khi đang làm bài.
16. Tiền tố `dark:` kèm class màu (token tự đổi theo `.dark`).

---

## 13. Chuyển file cũ sang token (37 file)

Audit: 37 file `.tsx` dùng class màu mặc định, 31 file dùng `primary-*`. Làm **theo từng nhóm trang**, mỗi lần xong một nhóm thì chạy `npm run check` và chụp ảnh. **Thêm token mới song song, chưa xóa `primary-*` cho đến khi nhóm cuối xong.**

| Class cũ | Class mới |
|---|---|
| `text-slate-900/800` + `dark:text-slate-100` | `text-ink` |
| `text-slate-600/500/400` (+ biến thể dark) | `text-muted` |
| `bg-white` + `dark:bg-slate-800/900` | `bg-surface` |
| `bg-slate-50/100`, nền `body` (`#fff`, `#0f172a`) | `bg-bg` |
| `border-slate-200/300/700` | `border-border` (hoặc `border-border-strong` cho ô bấm) |
| `bg-primary-600/700`, `text-primary-600`, `border-primary-600` | `bg-line` / `text-line` / `border-line` |
| nút chính "bước tiếp theo" (`bg-primary-600 … text-white`) | `<Button variant="primary">` (vàng) hoặc `variant="solid"` |
| `red-*`, `danger` (`SettingsPage`: `bg-red-50`, `dark:bg-red-950/*`) | `wrong`, `wrong-bg`, `wrong-ink` |
| `green-*`, `success` cho "đúng" | `line` + ✓ |
| `amber-*`, `warning`, `sun-*` | `yellow` (chỉ CTA/ga hiện tại) hoặc `wrong` nếu là cảnh báo |
| `shadow-*`, `bg-gradient-*`, `backdrop-blur` | bỏ; phân lớp bằng nền và viền |
| `min-h-screen` | `min-h-dvh` |
| emoji 🏠📖🔁🎯📊🗾🔍⚙️🔊, ký tự ✓ ✗ làm icon | Lucide: `Home`, `BookOpen`, `RefreshCw`, `Target`, `BarChart3`, `Search`, `Settings`, `Volume2`, `Check`, `X` |

Thứ tự đề xuất: (1) khung và trang chủ (đã làm một phần), (2) 16 dạng luyện tập, (3) trang duyệt nội dung (bài học, Kanji, tìm kiếm), (4) điểm yếu, sổ lỗi sai, cài đặt, giới thiệu.

---

## 14. Quy trình làm một việc UI + Definition of Done

### 14.1 Các bước Claude Code phải làm

1. Đọc `spec.md` / `plan.md` của feature, tìm màn hình ở §7. Nếu chưa có ảnh: phác ASCII wireframe 390px + 1440px, **gửi Mạnh duyệt trước khi code**.
2. Liệt kê component sẽ dùng từ §8; chỉ tạo mới khi thật cần, đặt đúng thư mục §3.
3. Dựng ở 360–390px trước bằng dữ liệu thật; xử lý đủ 3 trạng thái loading / rỗng / lỗi.
4. Mở rộng cho 768px và 1440px; kiểm tra chế độ tối.
5. **Chụp ảnh để tự xem:** `npm run ui:shot -- <route>` (script Playwright `tests/visual/shoot.ts`; chụp 390×844, 768×1024, 1440×900, sáng + tối, lưu vào `.screens/` đã gitignore). Mở ảnh chụp **cạnh ảnh tham chiếu trong `design/`**, soát từng điểm lệch và §12, sửa rồi chụp lại.
6. Chạy `npm run check` và e2e liên quan (viewport 360×740).
7. Báo cáo cho Mạnh: đã làm gì (lời thường), đường dẫn ảnh chụp, điểm nào cần Mạnh quyết.

### 14.2 Definition of Done (giao diện)

- [ ] Khớp ảnh tham chiếu ở §7 (hoặc wireframe đã được duyệt)
- [ ] Chỉ dùng token; không hex, không class màu mặc định Tailwind, không `dark:` cho màu; đúng 2 font quy định
- [ ] 360px: không cuộn ngang, nút chính trong vùng ngón cái, vùng bấm ≥ 44px
- [ ] 1440px: nội dung không kéo giãn quá giới hạn container; có phím tắt khi làm bài
- [ ] Chế độ tối đúng và đạt tương phản
- [ ] Đủ trạng thái loading / rỗng / lỗi, chữ theo §10
- [ ] Mọi chữ Nhật có `lang="ja"`; mọi chuỗi Việt nằm trong `vi.ts`
- [ ] Đúng/sai có biểu tượng + chữ + `aria-live`
- [ ] Bàn phím đi được hết, focus thấy rõ; `prefers-reduced-motion` được tôn trọng
- [ ] `min-h-dvh` và safe-area (sẵn sàng cho app)
- [ ] Khi làm bài: không hiện TopBar/TabBar; bộ đếm đúng nhãn theo dạng bài
- [ ] Không vi phạm mục nào ở §12; không dùng lại component tự vẽ thay cho `ui/`
- [ ] `npm run check` xanh, ảnh chụp đã đính kèm báo cáo

---

## 15. Prompt mẫu cho Mạnh

- **Sửa một màn hình:** "Màn hình Kết quả trên điện thoại bị chật, nút 'Làm lại câu sai' bị đẩy xuống dưới. Sửa theo docs/FRONTEND.md §7 (màn hình số 10), so với ảnh `Luyện tập · Kết quả` trong design/, chụp lại 390px và 1440px cho tôi xem."
- **Thấy giao diện lệch bản thiết kế:** "Soát trang chủ theo docs/FRONTEND.md §12 và §14.2, so với ảnh `App · Trang chủ`. Liệt kê từng điểm lệch, sửa hết rồi gửi ảnh trước và sau."
- **Màn hình mới chưa có ảnh:** "Tôi muốn thêm trang X để làm Y. Phác wireframe 390px và 1440px theo phong cách docs/FRONTEND.md §7 trước, đừng code, chờ tôi duyệt."
- **Đổi màu hoặc chữ:** "Đổi `yellow` sang tông ấm hơn. Chỉ sửa token trong src/ui/tokens.css, đo lại tương phản theo §5.2 và cập nhật bảng ở docs/FRONTEND.md."