# FRONTEND.md — Hướng dẫn xây giao diện Web + App cho Claude Code

> **Vị trí trong repo:** `docs/FRONTEND.md`
> **Đọc file này trước MỌI việc có đụng tới giao diện** (màn hình, component, màu, chữ, layout, app native). Nó cao hơn thói quen mặc định của bạn, chỉ thấp hơn constitution và `docs/ARCHITECTURE.md`.
> **Người chủ dự án (Mạnh) chưa có kinh nghiệm frontend.** Vì vậy: tự quyết các chi tiết kỹ thuật theo file này; chỉ hỏi khi một lựa chọn làm thay đổi thứ người học nhìn thấy mà file này chưa quy định. Khi báo cáo, giải thích bằng lời thường và kèm ảnh chụp màn hình.

## Mục lục
1. Sản phẩm và người dùng
2. Một codebase cho web và app
3. Cấu trúc `src/`
4. Stack và quy ước code giao diện
5. Design system: "Tuyến tàu học tập"
6. Layout và điều hướng
7. Công thức từng màn hình
8. Thư viện component
9. Lớp platform (web ↔ app)
10. Chữ trên giao diện
11. Tiếp cận, chuyển động, hiệu năng
12. Danh sách KHÔNG làm
13. Quy trình làm một việc UI + Definition of Done
14. Prompt mẫu cho Mạnh

---

## 1. Sản phẩm và người dùng

- **Người dùng:** người Việt tự học tiếng Nhật N5 (sinh viên, người đi làm), học chủ yếu trên **điện thoại**, mỗi lần 5–15 phút, thường một tay.
- **Việc chính của giao diện:** cho người học **làm bài kiểm tra nhanh** và **thấy ngay mình yếu ở đâu**. Đọc nội dung là việc phụ.
- **Cảm giác cần có:** xanh dương, trẻ trung, có nhịp, có chút "Nhật" — **không** giống sách giáo khoa, **không** giống bảng điều khiển SaaS, **không** giống trang do AI tạo hàng loạt.
- **Nội dung thật để dựng giao diện:** luôn dùng dữ liệu thật từ `public/content/**` (VD: Bài 5 "Di chuyển, Phương tiện & Ngày tháng", từ 行きます, Kanji 外). Không dùng Lorem ipsum, không dùng từ tiếng Nhật bịa.

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
- Capacitor được thêm ở spec `014-native-app`. Trước đó, mọi code vẫn phải **sẵn sàng cho app**: không phụ thuộc hover, có safe-area (§6.4), API thiết bị đi qua `src/platform/` (§9).
- Phân biệt nền tảng **chỉ** bằng `platform.kind` (`'web' | 'native'`). Không rải `if (Capacitor...)` trong feature.

---

## 3. Cấu trúc `src/`

```
src/
├── main.tsx                     # điểm vào: import tokens.css, fonts, render <App/>
├── app/
│   ├── App.tsx                  # providers (theme, router, toast)
│   ├── router.tsx               # bảng route (§6.5), lazy() theo trang
│   ├── layouts/
│   │   ├── AppShell.tsx         # header + nội dung + TabBar (mobile) / SideRail (desktop)
│   │   └── FocusShell.tsx       # toàn màn hình cho lúc làm bài (không tab bar)
│   └── theme.ts                 # sáng/tối/theo hệ thống, lưu trong settings
├── features/                    # mỗi thư mục = một vùng tính năng, không import lẫn nhau
│   ├── home/        HomePage.tsx
│   ├── browse/      LevelPage, BookPage, LessonPage, KanjiPage, SearchPage, tabs/*
│   ├── practice/    SetupPage, RunPage, ResultPage, session-store.ts, modes/<id>/
│   ├── review/      ReviewPage
│   ├── weakness/    WeakPage, MistakesPage
│   ├── stats/       StatsPage
│   ├── auth/        LoginPage, RegisterPage, ForgotPage, AccountPage
│   └── settings/    SettingsPage
├── ui/                          # DESIGN SYSTEM — chỉ nhận props, không tự lấy dữ liệu
│   ├── tokens.css               # ⭐ nguồn duy nhất của màu, chữ, bo góc, bóng, chuyển động
│   ├── fonts.ts                 # import @fontsource/*
│   ├── primitives/              # Button, IconButton, Tabs, Sheet, Dialog, Toast, Switch,
│   │                            # SegmentedControl, ProgressBar, Badge, ListRow, EmptyState, Skeleton
│   ├── jp/                      # JpText, Ruby, KanaInput, SpeakButton, KanjiGlyph
│   ├── quiz/                    # QuestionShell, PromptCard, ChoiceGrid, ChoiceTile,
│   │                            # FeedbackBar, FlipCard, MatchBoard, ResultSummary
│   ├── signature/               # StationBadge, LessonLine, StationStamp, MasteryLegend
│   └── charts/                  # BarChart, SkillBars (SVG tự viết, không thư viện nặng)
├── domain/  data/  platform/  lib/  i18n/   # xem docs/ARCHITECTURE.md §4
└── data/hooks/                  # useManifest, useLesson, useMastery, useDueCount…
                                 # (hook React được đặt ở data/ để feature không import Dexie)
```

**Quy tắc tên:** file component `PascalCase.tsx`, file khác `kebab-case.ts`, test cạnh file `*.test.tsx`. Mỗi component một file, ≤ 200 dòng; dài hơn thì tách.

**Khi nào tạo component mới trong `ui/`?** Khi nó được dùng ở ≥ 2 feature, hoặc là một phần của design system ở §8. Còn lại để trong thư mục feature.

---

## 4. Stack và quy ước code giao diện

| Việc | Dùng | Ghi chú |
|---|---|---|
| UI | React + TypeScript strict | Function component + hook. Không class component |
| Style | **Tailwind CSS v4**, token trong `@theme` | Chỉ dùng class sinh từ token (`bg-paper`, `text-ink`, `rounded-control`). Không `style={{color:'#...'}}`, không `bg-[#1B5CFF]` |
| Gộp class | `clsx` + `tailwind-merge` qua hàm `cn()` ở `lib/cn.ts` | |
| Biến thể component | `class-variance-authority` (cva) | VD: Button `variant: primary/secondary/ghost/danger`, `size: md/lg` |
| Điều hướng | React Router (data router), `lazy()` theo trang | |
| State phiên làm bài | Zustand (`features/practice/session-store.ts`) | Không dùng Zustand cho dữ liệu nội dung |
| Dữ liệu nội dung | hook `useLesson(bookId, n)` trong `data/hooks` | Trả về `{ status: 'loading' \| 'ready' \| 'error', data, retry }` |
| Dữ liệu tiến độ | hook `useMastery(...)` bọc `liveQuery` trong `data/hooks` | Tự cập nhật khi IndexedDB đổi |
| Hộp thoại, tab, menu | Radix UI Primitives (headless) **hoặc** tự viết đúng ARIA | Không dùng bộ UI có sẵn giao diện (MUI, Ant, shadcn mặc định) vì sẽ mất bản sắc |
| Icon | `lucide-react`, nét 2px, cỡ 20/24 | Icon riêng (ga, tem) vẽ SVG trong `ui/signature` |
| Font | `@fontsource/be-vietnam-pro`, `@fontsource/zen-maru-gothic` | Tự host để chạy offline trong PWA và app. Không dùng link Google Fonts |
| Kéo thả | `@dnd-kit` (chỉ spec 009) | Phải có cách dùng bàn phím |

**Mẫu một component đúng chuẩn:**

```tsx
// src/ui/primitives/Button.tsx
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/cn';

const button = cva(
  'inline-flex items-center justify-center gap-2 font-ui font-bold min-h-11 px-5 rounded-control ' +
  'transition-transform duration-fast active:translate-y-px focus-visible:outline-3 ' +
  'focus-visible:outline-offset-2 focus-visible:outline-ao disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-ao text-on-ao',
        secondary: 'bg-ao-tint text-ao-deep',
        ghost: 'text-ao-deep hover:bg-ao-tint',
        danger: 'bg-stop text-on-ao',
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

**Mẫu một trang đúng chuẩn** (lấy dữ liệu bằng hook, có đủ 3 trạng thái, chuỗi lấy từ `vi.ts`):

```tsx
export default function LessonPage() {
  const { bookId, lesson } = useParams();
  const q = useLesson(bookId!, Number(lesson));
  if (q.status === 'loading') return <LessonSkeleton />;
  if (q.status === 'error') return <EmptyState title={t.lesson.loadError} action={{ label: t.common.retry, onClick: q.retry }} />;
  return (/* ... */);
}
```

---

## 5. Design system: "Tuyến tàu học tập"

### 5.1 Ý tưởng

Mỗi giáo trình là **một tuyến tàu** như bản đồ tàu điện Tokyo; mỗi bài là **một ga**, có biển số ga kiểu Nhật (ô vuông bo góc chứa chữ cái tuyến + số ga): Minna no Nihongo 1 là tuyến **M** (M01…M25), Kanji Master N5 là tuyến **K** (K01…K15). Học xong một bài kiểm tra là **"đóng dấu ga"** (駅スタンプ — con dấu kỷ niệm ở các ga Nhật).

Ẩn dụ này có thật trong nội dung: bài học **là một chuỗi có thứ tự**, và độ thành thạo từng bài **là trạng thái của từng ga**. Nó cho người học cảm giác "đi tiếp", không phải "học sách".

**Chỉ một chỗ được phô diễn:** `LessonLine` (tuyến bài học) và `StationStamp` (dấu ga ở màn kết quả). Mọi thứ còn lại yên tĩnh, rõ ràng, nhiều khoảng trắng.

> Mở rộng nội dung: chữ cái và màu tuyến lấy từ `content/manifest.yaml` (thêm trường `line: { code: "M", color: "ao" }` vào mỗi book). Không viết cứng "M", "K" trong code.

### 5.2 Màu (token)

| Token | Sáng | Tối | Dùng cho |
|---|---|---|---|
| `paper` | `#F6F8FD` | `#0A1433` | nền trang (trắng ngả xanh, không phải kem) |
| `surface` | `#FFFFFF` | `#111E45` | khối nội dung, ô đáp án, sheet |
| `ink` | `#14224A` | `#E8EEFF` | chữ chính (mực xanh đậm, không dùng đen) |
| `ink-soft` | `#4A5A82` | `#A9B6DA` | chữ phụ, nhãn |
| `rule` | `#D9E1F2` | `#24356B` | đường kẻ trang trí (không dùng làm viền nút) |
| `edge` | `#7385B5` | `#5A6C9E` | viền ô bấm được (≥ 3:1 với nền) |
| `ao` (青) | `#1B5CFF` | `#7AA2FF` | **màu chính**: nút chính, tuyến M, liên kết |
| `ao-deep` | `#0B2E8A` | `#C9D8FF` | chữ trên nền `ao-tint`, tiêu đề nhấn |
| `ao-tint` | `#E6EEFF` | `#1A2B63` | nền nút phụ, ô được chọn |
| `on-ao` | `#FFFFFF` | `#0A1433` | chữ trên nền `ao`/`stop` |
| `sora` (空) | `#3EC5F2` | `#5ED3F7` | màu phụ trẻ trung: tuyến K, điểm nhấn nhỏ. **Chỉ đặt chữ `ink` trên nền `sora`, không dùng chữ trắng** |
| `go` | `#0B7A45` | `#3DD68C` | trả lời đúng (kèm ✓) |
| `go-tint` | `#E7F6EE` | `#0F3A2A` | nền thanh phản hồi đúng |
| `stop` | `#D42F3F` | `#FF7A85` | trả lời sai (kèm ✗) |
| `stop-tint` | `#FFF3F4` | `#3D1520` | nền thanh phản hồi sai |
| `caution` | `#F2A516` | `#F7BE4F` | từ sắp quên; chỉ đặt chữ `ink` trên nền này |

**Thang độ thành thạo** (dùng cho ga trên tuyến, bản đồ điểm yếu): `m-none #C9D3EA` (chưa học) → `m-weak = stop` (< 40%) → `m-mid = caution` (40–69%) → `m-good = sora` (70–89%) → `m-done = ao` (≥ 90%). Luôn kèm **số %** hoặc biểu tượng; màu không bao giờ là tín hiệu duy nhất.

> Bảng này **thay** bảng màu ở *Ke_hoach_Website §7.3* (vẫn là xanh dương chủ đạo, nhưng chọn sắc riêng thay vì màu xanh mặc định của Tailwind).

### 5.3 Chữ

| Vai trò | Font | Cỡ / độ đậm |
|---|---|---|
| Giao diện tiếng Việt (mọi chữ Latin) | **Be Vietnam Pro** — thiết kế riêng cho dấu tiếng Việt | 400 thân bài, 600 nhãn, 800 tiêu đề |
| Chữ tiếng Nhật (kana, kanji) | **Zen Maru Gothic** (nét tròn, thân thiện), dự phòng `Noto Sans JP`, `Hiragino Sans` | 500 thân, 700 câu hỏi |

Thang cỡ chữ (px): `12 · 14 · 16 · 18 · 21 · 24 · 30 · 36 · 48` cho tiếng Việt; câu hỏi tiếng Nhật dùng riêng `jp-prompt` **56px** (điện thoại) / **72px** (máy tính), furigana 0.5em.

- Thân bài 16px, line-height 1.6; dòng chữ ≤ 70 ký tự (`max-w-prose`).
- Tiêu đề: Be Vietnam Pro 800, `letter-spacing: -0.01em`, line-height 1.2. Tiêu đề không tô màu riêng một chữ, không in nghiêng một cụm để "nhấn".
- Số điểm, số ga, đồng hồ: `font-variant-numeric: tabular-nums`.
- Text tiếng Nhật luôn bọc `<JpText>` (đặt `lang="ja"` + `font-jp`) để trình duyệt chọn đúng dạng chữ Hán Nhật.
- **Không** dùng chữ IN HOA cho nhãn, không giãn chữ (tracking) cho nhãn nhỏ, không dùng font monospace.

### 5.4 Khoảng cách, bo góc, bóng

- Lưới 4px. Khoảng đệm chuẩn trên điện thoại: 16px hai bên, 24px giữa các khối, 40px giữa các vùng lớn.
- **Bo góc theo cấp bậc** (không dùng một bán kính cho mọi thứ):
  - `badge` 6px — biển số ga, nhãn nhỏ
  - `control` 12px — nút, ô nhập, ô đáp án
  - `sheet` 24px — chỉ góc trên của bottom sheet, thanh phản hồi
  - `full` — chỉ cho chấm ga tròn và nút icon tròn
- **Bóng:** hầu như không dùng. Phân lớp bằng màu nền (`paper` → `surface`) và viền `edge`. Chỉ bottom sheet và thanh phản hồi có một bóng: `0 -8px 24px rgb(11 46 138 / 0.12)` (bóng ngả xanh).
- Không dùng gradient để trang trí. Ngoại lệ duy nhất: dải màu dọc của `LessonLine` khi hiển thị độ thành thạo.

### 5.5 Chuyển động

| Token | Giá trị | Dùng |
|---|---|---|
| `duration-fast` | 120ms | nhấn nút (dịch xuống 1px) |
| `duration-base` | 200ms | mở tab, đổi trạng thái ô đáp án |
| `duration-slow` | 320ms | sheet trượt lên, lật flashcard |
| `ease-out` | `cubic-bezier(0.22, 1, 0.36, 1)` | mặc định |

- Chuyển động **chỉ để trả lời hành động** (bấm, lật, mở, đúng/sai). Không có hiệu ứng "hiện dần khi cuộn", không hover nhún mọi thẻ.
- **Khoảnh khắc duy nhất được dàn dựng:** `StationStamp` đóng xuống ở màn kết quả (scale 1.4 → 1, xoay −8°, 360ms, một lần) khi điểm ≥ 70%.
- Sai: ô đáp án rung ngang 2 lần (±4px, 240ms) + `platform.haptics.error()`. Đúng: `platform.haptics.success()`.
- Tôn trọng `prefers-reduced-motion`: tắt rung, lật, dấu ga chỉ hiện (không đóng xuống).

### 5.6 File `src/ui/tokens.css`

```css
@import "tailwindcss";
@custom-variant dark (&:where(.dark, .dark *));

@theme {
  /* màu */
  --color-paper: #F6F8FD;   --color-surface: #FFFFFF;
  --color-ink: #14224A;     --color-ink-soft: #4A5A82;
  --color-rule: #D9E1F2;    --color-edge: #7385B5;
  --color-ao: #1B5CFF;      --color-ao-deep: #0B2E8A;  --color-ao-tint: #E6EEFF;  --color-on-ao: #FFFFFF;
  --color-sora: #3EC5F2;
  --color-go: #0B7A45;      --color-go-tint: #E7F6EE;
  --color-stop: #D42F3F;    --color-stop-tint: #FFF3F4;
  --color-caution: #F2A516;
  --color-m-none: #C9D3EA;  --color-m-weak: var(--color-stop);  --color-m-mid: var(--color-caution);
  --color-m-good: var(--color-sora);  --color-m-done: var(--color-ao);

  /* chữ */
  --font-ui: "Be Vietnam Pro", system-ui, sans-serif;
  --font-jp: "Zen Maru Gothic", "Noto Sans JP", "Hiragino Sans", sans-serif;
  --text-jp-prompt: 3.5rem;  --text-jp-prompt--line-height: 1.2;

  /* bo góc */
  --radius-badge: 6px;  --radius-control: 12px;  --radius-sheet: 24px;

  /* chuyển động */
  --ease-out: cubic-bezier(0.22, 1, 0.36, 1);
  --duration-fast: 120ms;  --duration-base: 200ms;  --duration-slow: 320ms;
}

.dark {
  --color-paper: #0A1433;   --color-surface: #111E45;
  --color-ink: #E8EEFF;     --color-ink-soft: #A9B6DA;
  --color-rule: #24356B;    --color-edge: #5A6C9E;
  --color-ao: #7AA2FF;      --color-ao-deep: #C9D8FF;  --color-ao-tint: #1A2B63;  --color-on-ao: #0A1433;
  --color-sora: #5ED3F7;
  --color-go: #3DD68C;      --color-go-tint: #0F3A2A;
  --color-stop: #FF7A85;    --color-stop-tint: #3D1520;
  --color-caution: #F7BE4F; --color-m-none: #2A3A6E;
}

@layer base {
  html { background: var(--color-paper); color: var(--color-ink); font-family: var(--font-ui);
         -webkit-tap-highlight-color: transparent; }
  :lang(ja) { font-family: var(--font-jp); }
  @media (min-width: 1024px) { :root { --text-jp-prompt: 4.5rem; } }
}
```
(Nếu phiên bản Tailwind trong `package.json` khác v4, giữ nguyên **tên và giá trị token**, chỉ đổi cú pháp khai báo.)

---

## 6. Layout và điều hướng

### 6.1 Điểm ngắt

| Tên | Bề rộng | Bố cục |
|---|---|---|
| mặc định | 360–767px | 1 cột, `TabBar` dưới, nút chính ở vùng ngón cái |
| `md` | 768–1023px | 1 cột rộng hơn (max 640px giữa màn hình), vẫn `TabBar` |
| `lg` | ≥ 1024px | `SideRail` trái 240px + nội dung (đọc: max 720px; làm bài: 640px giữa) |

Thiết kế và kiểm tra ở **360px trước**, rồi 768, rồi 1280. Không có thanh cuộn ngang ở 360px.

### 6.2 AppShell (điện thoại)

```
┌──────────────────────────────────┐
│ Tiếng Nhật – Mạnh        🔍  ⚙   │  header 56px, nền paper, không bóng
├──────────────────────────────────┤
│                                  │
│          (nội dung trang)        │
│                                  │
├──────────────────────────────────┤
│  ⌂        ≡        ↻      ◎    ▤ │  TabBar 64px + safe-area-bottom
│ Trang chủ Học    Ôn tập Điểm yếu Thống kê
└──────────────────────────────────┘
```
Tab đang chọn: icon + chữ màu `ao`, có vạch 3px phía trên. Badge số đỏ trên "Ôn tập" khi có thẻ đến hạn.

### 6.3 FocusShell (khi làm bài) — ẩn TabBar để tập trung

```
┌──────────────────────────────────┐
│ ✕    ━━━━━━━━━━━━━━━░░░░░░  7/20  │  thoát (hỏi xác nhận) + tiến độ
│                                  │
│   (QuestionShell — §7.5)         │
│                                  │
└──────────────────────────────────┘
```

### 6.4 Sẵn sàng cho app (bắt buộc từ bây giờ)

- `index.html`: `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">`.
- Header dùng `padding-top: env(safe-area-inset-top)`, TabBar và nút chính cố định dùng `padding-bottom: max(12px, env(safe-area-inset-bottom))`.
- Chiều cao màn hình dùng `min-h-dvh`, không dùng `100vh` (bàn phím trên điện thoại làm sai).
- Ô nhập chữ cỡ ≥ 16px (iOS tự phóng to nếu nhỏ hơn).
- Mọi thao tác phải làm được bằng chạm; hover chỉ là trang trí thêm (`@media (hover:hover)`).
- Nút quay lại của Android (spec 014): đóng sheet/dialog trước, rồi mới lùi trang; ở FocusShell thì hỏi "Thoát bài đang làm?".
- Liên kết ra ngoài mở bằng `platform.openExternal(url)`, không `window.open`.

### 6.5 Bảng route

Theo *Ke_hoach_Website §7.1*. Phân layout: `/practice/run`, `/review` (đang ôn) dùng **FocusShell**; mọi trang khác dùng **AppShell**. Mọi trang được `lazy()`; trang chưa làm hiển thị `EmptyState` "Tính năng này đang được làm" kèm nút về trang chủ.

---

## 7. Công thức từng màn hình

Mỗi công thức gồm: **việc chính** của màn hình, bố cục, và điều **không** làm. Sơ đồ là điện thoại 360px.

### 7.1 Trang chủ `/`
**Việc chính:** đưa người học vào bài ngay trong một lần bấm.
```
Hôm nay
18 thẻ cần ôn                      ← số lớn 36px, chữ ink
[        Ôn 18 thẻ        ]        ← Button lg primary

Đang đi tuyến M
 M03 ●━━ M04 ◐━━ M05 ○             ← LessonLine thu gọn: ga trước, ga hiện tại, ga sau
 Bài 4  Thời gian, Hoạt động…
[      Học tiếp Bài 4      ]       ← Button lg secondary

Bạn hay sai nhất
 外国   cách đọc      sai 3 lần ›   ← ListRow, chữ Nhật 24px
 行きます  nghĩa       sai 2 lần ›
 Xem tất cả điểm yếu
```
Không: lưới thẻ thống kê, lời chào dài, banner minh họa.

### 7.2 Giáo trình `/b/:bookId` — tuyến bài học (màn hình đặc trưng)
**Việc chính:** thấy toàn tuyến, ga nào yếu, chọn ga để vào.
```
Minna no Nihongo 1
Tuyến M, 25 ga

 ┃
 ●  M01  Giới thiệu bản thân        92%
 ┃
 ●  M02  Đồ vật & Văn phòng phẩm    81%
 ┃
 ◉  M03  Địa điểm & Mua sắm         34%   ← ga yếu: chấm đỏ + số %
 ┃
 ○  M04  Thời gian…                 —     ← chưa học: chấm rỗng
```
`LessonLine` dọc: vạch tuyến 6px màu tuyến; mỗi ga là `StationBadge` + tên bài + % căn phải (tabular). Trên `lg`: tuyến chạy **ngang** phía trên, danh sách bài bên dưới chia 2 cột.

### 7.3 Bài học `/b/:bookId/:lesson`
```
 [M05]  Di chuyển, Phương tiện & Ngày tháng
 Thành thạo 62%   ━━━━━━━━━━░░░░░

 ( Từ vựng | Ngữ pháp | Kanji )        ← SegmentedControl, dính đầu khi cuộn

 [Chỉ từ chính ⇄ Gồm mở rộng]  [Ẩn nghĩa]

 いきます  行きます        🔊
 đi
 ───────────────────────────
 あるいて  歩いて          🔊
 đi bộ            Không dùng で   ← ghi chú màu ink-soft
 ...
[    Luyện bài này    ]              ← nút cố định đáy màn hình
```
Từ có nhãn `Bản cũ`: `Badge` nhỏ viền `edge`, chữ "Bản cũ". Ngữ pháp: danh sách mẫu mở/đóng được (accordion), ví dụ có nút ẩn/hiện romaji và bản dịch.

### 7.4 Thiết lập phiên `/practice/setup`
**Việc chính:** bắt đầu được trong ≤ 2 lần chạm; mọi tùy chọn có giá trị mặc định hợp lý.
```
Luyện Bài 5
Dạng bài
 ◉ Trắc nghiệm   ○ Flashcard   ○ Gõ đáp án  …   ← danh sách tự sinh từ questionRegistry
Số câu       ( 10 | 20 | 50 | Tất cả )
▸ Tùy chọn thêm                                  ← mở ra: phạm vi bài, từ mở rộng, romaji…
[        Bắt đầu 20 câu        ]
```

### 7.5 Làm bài `/practice/run` (FocusShell)
```
 ✕   ━━━━━━━━━━━━━░░░░░░░  7/20

            外国                       ← PromptCard: JpText jp-prompt, giữa màn hình
      Chọn cách đọc đúng              ← chỉ dẫn 16px ink-soft

 ┌───────────────┐ ┌───────────────┐
 │ 1  がいこく    │ │ 2  そとくに    │   ← ChoiceGrid 2×2 (≥ 64px cao), số = phím tắt
 └───────────────┘ └───────────────┘
 ┌───────────────┐ ┌───────────────┐
 │ 3  がいごく    │ │ 4  かいこく    │
 └───────────────┘ └───────────────┘

╭──────────────────────────────────╮   ← FeedbackBar trượt lên sau khi chọn
│ ✓ Đúng                            │
│ 外国 (がいこく): nước ngoài   🔊   │
│ [          Câu tiếp          ]   │   ← Enter cũng được
╰──────────────────────────────────╯
```
- Sau khi chọn: ô đúng viền + nền `go-tint` + ✓; ô sai đã chọn viền `stop` + ✗ + rung; các ô khác mờ 50%.
- Đáp án dài (nghĩa tiếng Việt) → ChoiceGrid chuyển thành **1 cột 4 hàng**.
- Câu hỏi nghe: PromptCard là nút 🔊 lớn 96px, tự phát 1 lần, phím `R` nghe lại.
- Không: đồng hồ đếm ngược (trừ dạng "Đúng/Sai tốc độ"), âm thanh hiệu ứng, confetti.

### 7.6 Kết quả `/practice/result/:id`
```
        ╭─────────╮
        │  M05    │      ← StationStamp: con dấu tròn màu tuyến, ngày, "Đã qua ga"
        │ 29.10   │        (chỉ khi ≥ 70%; dưới 70% hiện "Chưa qua ga. Làm lại 4 câu sai để qua ga.")
        ╰─────────╯
     16 / 20 đúng            ← 48px tabular
     Xếp loại B   4 phút 12 giây

Câu sai (4)
 行きます   bạn chọn: về   đúng: đi        ›
 ...
[   Làm lại 4 câu sai   ]
[   Về Bài 5            ]   ← ghost
```

### 7.7 Điểm yếu `/weak`
**Việc chính:** chỉ ra 1 việc nên làm tiếp.
```
Bạn đang yếu nhất ở
Cách đọc Kanji   54%          ← SkillBars: 1 hàng/kỹ năng, thanh ngang + %
Nghe             61%
Nghĩa            83%
[  Luyện 20 câu yếu nhất  ]

Ga yếu nhất: M03 34%  M11 41%  K07 45%     ← StationBadge bấm được
Từ yếu nhất (danh sách ListRow như trang chủ)
```

### 7.8 Chi tiết Kanji `/kanji/:char`
`KanjiGlyph` 120px trong ô vuông kẻ chữ thập mờ (như vở tập viết, màu `rule`), bên phải: số nét, Hán Việt (đậm), âm On (katakana), âm Kun (hiragana). Dưới: ví dụ chia nhóm Kun / On / Đọc đặc biệt; "Từ vựng có chữ này" là danh sách ListRow dẫn tới bài.

### 7.9 Trạng thái rỗng, lỗi, đang tải
- **Đang tải:** `Skeleton` đúng hình dạng nội dung, không spinner giữa màn hình (trừ < 300ms thì không hiện gì).
- **Rỗng:** một câu nói rõ chuyện gì + một nút làm việc tiếp theo. VD Sổ lỗi sai rỗng: "Chưa có câu sai nào. Làm một bài trắc nghiệm để bắt đầu." [Luyện Bài 1].
- **Lỗi:** nói cái gì hỏng + cách sửa. VD "Chưa tải được Bài 5. Kiểm tra kết nối rồi thử lại." [Thử lại]. Không xin lỗi, không "Đã có lỗi xảy ra".

---

## 8. Thư viện component

### 8.1 Primitives (`ui/primitives`)
Button, IconButton (≥ 44×44), Tabs/SegmentedControl, Sheet (bottom sheet trên điện thoại, dialog giữa màn hình trên `lg`), Dialog (xác nhận), Toast (đáy màn hình, trên TabBar, tự ẩn 4s), Switch, ProgressBar (cao 6px, bo full, màu `ao` trên `ao-tint`), Badge, ListRow (≥ 56px, toàn hàng bấm được), EmptyState, Skeleton.

### 8.2 Tiếng Nhật (`ui/jp`)
| Component | Props chính | Ghi chú |
|---|---|---|
| `JpText` | `children`, `size` | Luôn `lang="ja"` + `font-jp` |
| `Ruby` | `base`, `reading`, `show` | `<ruby>外国<rt>がいこく</rt></ruby>`; ẩn furigana theo cài đặt |
| `KanaInput` | `value`, `onChange`, `mode: 'hiragana' \| 'katakana'` | WanaKana `bind`; `autocapitalize="off"`, `autocorrect="off"`, `spellcheck=false`, `inputMode="text"`, cỡ ≥ 18px |
| `SpeakButton` | `text`, `rate` | Gọi `platform.tts.speak`; tự ẩn khi `isAvailable()` false |
| `KanjiGlyph` | `char`, `size` | Ô kẻ chữ thập, chữ `font-jp` 700 |

### 8.3 Làm bài (`ui/quiz`)
`QuestionShell` (khung: tiến độ, prompt, vùng trả lời, feedback) · `PromptCard` · `ChoiceGrid` + `ChoiceTile` (trạng thái: `idle | selected | correct | wrong | dimmed`) · `FeedbackBar` · `FlipCard` (lật 3D 320ms, có nút "Lật" cho trình đọc màn hình) · `MatchBoard` · `ResultSummary`.

Mọi dạng bài mới **phải** dựng từ các khối này; chỉ tạo khối mới khi tương tác thực sự khác (VD kéo thả câu).

### 8.4 Đặc trưng (`ui/signature`)
| Component | Mô tả |
|---|---|
| `StationBadge` | Ô vuông bo `badge`, viền 2.5px màu tuyến, nền `surface`; dòng trên chữ cái tuyến (12px, 700), dòng dưới số ga 2 chữ số (18px, 800, tabular). Cỡ `sm` 32px / `md` 44px. Có `aria-label="Bài 5, tuyến M"` |
| `LessonLine` | Tuyến dọc (điện thoại) / ngang (`lg`). Props: `stations[]` gồm `{ code, title, mastery \| null, href }`, `current`. Chấm ga tô theo thang §5.2; ga hiện tại có vòng ngoài nhấp nháy **một lần** khi vào trang |
| `StationStamp` | Con dấu tròn 120px, viền đôi màu tuyến, chữ: mã ga, ngày (dd.mm), "Đã qua ga". Xoay −8°, hơi "lem mực" (SVG filter nhẹ) |
| `MasteryLegend` | Chú thích 5 mức màu + nhãn chữ |

### 8.5 Biểu đồ (`ui/charts`)
SVG tự viết, không thêm thư viện biểu đồ. `BarChart` (số câu/ngày, 14 ngày, cột màu `ao`, ngày hôm nay màu `sora`), `SkillBars` (thanh ngang có số %). Mỗi biểu đồ có bảng dữ liệu ẩn cho trình đọc màn hình.

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

| API | `platform/web/` | `platform/native/` (spec 014) |
|---|---|---|
| tts | `speechSynthesis`, chọn voice `ja-JP` | `@capacitor-community/text-to-speech` (WebView Android thường **không** có giọng đọc) |
| haptics | `navigator.vibrate(10/20/[30,40,30])` nếu có | `@capacitor/haptics` |
| openExternal | `window.open(url, '_blank', 'noopener')` | `@capacitor/browser` |
| share | `navigator.share` nếu có, không thì chép link + Toast | `@capacitor/share` |
| onBack | `popstate` | `@capacitor/app` sự kiện `backButton` |

`src/platform/index.ts` chọn bản cài: trước spec 014 chỉ xuất `webPlatform`; từ spec 014 dùng `isNative()` trong `platform/native/detect.ts` và import động bản native. Feature chỉ viết `import { platform } from '@/platform'`.

---

## 10. Chữ trên giao diện

- Tất cả chuỗi nằm trong `src/i18n/vi.ts`, nhóm theo màn hình (`t.home.reviewCta`, `t.practice.correct`…).
- **Giọng:** như một người bạn học cùng: ngắn, rõ, xưng "bạn". Viết hoa đầu câu, không viết hoa mỗi chữ.
- **Nút nói đúng việc sẽ xảy ra,** giữ cùng một tên trong cả luồng:

| Không viết | Viết |
|---|---|
| Bắt đầu ngay! 🚀 | Bắt đầu 20 câu |
| Submit / Gửi | Kiểm tra |
| Tiếp tục hành trình học tập | Học tiếp Bài 4 |
| Đã có lỗi xảy ra | Chưa tải được Bài 5. Kiểm tra kết nối rồi thử lại. |
| Không có dữ liệu | Chưa có câu sai nào. Làm một bài trắc nghiệm để bắt đầu. |
| Chúc mừng bạn đã hoàn thành xuất sắc! | 16/20 đúng. Đã qua ga M05. |

- Thuật ngữ cố định: "bài" (không "chương" cho MNN; "chương" cho Kanji Master — lấy `lessonLabel` từ manifest), "từ chính / từ mở rộng", "độ thành thạo", "điểm yếu", "sổ lỗi sai", "ôn tập", "dạng bài".
- Không dùng emoji trong câu chữ giao diện (trừ 🔊 nếu chưa có icon).

---

## 11. Tiếp cận, chuyển động, hiệu năng

**Tiếp cận (a11y)**
- Tương phản: chữ ≥ 4.5:1, viền ô bấm ≥ 3:1 (bảng màu §5.2 đã kiểm). Không đặt chữ trắng trên `sora`/`caution`.
- Focus thấy rõ: `outline 3px ao, offset 2px` cho mọi phần tử bấm được (dùng `focus-visible`).
- Phím tắt khi làm bài: `1–4` chọn, `Enter` tiếp, `Space` lật thẻ, `R` nghe lại, `Esc` thoát (có xác nhận). Hiện gợi ý phím trên `lg`.
- Kết quả đúng/sai thông báo qua vùng `aria-live="polite"`.
- Hình ảnh/biểu tượng có ý nghĩa phải có `aria-label`; biểu tượng trang trí `aria-hidden`.

**Hiệu năng**
- JS tải lần đầu ≤ 200 KB gzip; mỗi trang `lazy()`; nội dung bài tải theo bài.
- Font: chỉ import các độ đậm dùng thật (Be Vietnam Pro 400/600/800, Zen Maru Gothic 500/700); `font-display: swap`.
- Danh sách > 100 hàng (tìm kiếm, toàn bộ từ vựng) phải ảo hóa hoặc phân trang.
- Không re-render cả ChoiceGrid mỗi tick đồng hồ: tách đồng hồ ra component riêng.

---

## 12. Danh sách KHÔNG làm

Đây là các dấu hiệu khiến giao diện "trông như AI làm" hoặc lệch bản sắc. Gặp là sửa.

1. Nền kem/be, chữ serif lớn kiểu tạp chí, màu cam đất. Nền đen với một màu neon.
2. Chia mọi nội dung thành các thẻ giống hệt nhau, cùng bo góc, cùng bóng xám mờ; gradient làm nền trang trí.
3. Nhãn nhỏ IN HOA giãn chữ phía trên mỗi tiêu đề; chuỗi thông tin nối bằng dấu chấm giữa "A · B · C"; nhãn dạng "CHỮ — đoạn"; mũi tên "→" gắn vào chữ trên nút.
4. Tô màu hoặc in nghiêng riêng một từ trong tiêu đề để "nhấn".
5. Số thứ tự 01 / 02 / 03 cho thứ không phải trình tự. (Số ga M01–M25 là đúng vì bài học là trình tự.)
6. Hero lớn kiểu landing page với số liệu to + gradient ở trang chủ.
7. Hiệu ứng hiện dần khi cuộn, hover nhún, confetti, âm thanh chúc mừng.
8. Màu xanh mặc định của Tailwind (`blue-500/600`), xám mặc định (`gray-*`), mã hex viết trực tiếp.
9. Dùng thư viện UI có sẵn giao diện (MUI, Ant Design, Chakra, shadcn để nguyên mặc định).
10. Màu là tín hiệu duy nhất cho đúng/sai/mức thành thạo.
11. Chữ tiếng Nhật không có `lang="ja"` (sẽ hiện sai dạng chữ Hán kiểu Trung Quốc trên một số máy).
12. Trông như sách giáo khoa: bảng kẻ ô dày đặc, khung viền đen, tiêu đề "BÀI 5" in hoa giữa trang.
13. Chuỗi tiếng Việt viết thẳng trong JSX; "Lorem ipsum"; từ tiếng Nhật bịa.

---

## 13. Quy trình làm một việc UI + Definition of Done

### 13.1 Các bước Claude Code phải làm

1. Đọc `spec.md` / `plan.md` của feature, tìm công thức màn hình ở §7. Nếu màn hình chưa có công thức: phác ASCII wireframe 360px + 1280px theo phong cách §7, **gửi cho Mạnh duyệt trước khi code**.
2. Liệt kê component sẽ dùng từ §8; chỉ tạo mới khi thật cần, đặt đúng thư mục §3.
3. Dựng ở 360px trước bằng dữ liệu thật; xử lý đủ 3 trạng thái loading / rỗng / lỗi.
4. Mở rộng cho 768px và 1280px; kiểm chế độ tối.
5. **Chụp ảnh để tự xem:** chạy `npm run ui:shot -- <route>` (script Playwright `tests/visual/shoot.ts`, chụp 360×740, 768×1024, 1280×800, sáng + tối vào `.screens/`, thư mục này bị gitignore). Mở từng ảnh và tự soát theo §12 và checklist 13.2; sửa rồi chụp lại.
6. Chạy `npm run check` và e2e liên quan.
7. Báo cáo cho Mạnh: đã làm gì (lời thường), đường dẫn ảnh chụp 360px và 1280px, điểm nào cần Mạnh quyết định.

### 13.2 Definition of Done (giao diện)

- [ ] Khớp công thức §7 (hoặc wireframe đã được duyệt)
- [ ] Chỉ dùng token; không hex, không màu mặc định Tailwind, không font ngoài 2 font quy định
- [ ] 360px: không cuộn ngang, nút chính trong vùng ngón cái, vùng bấm ≥ 44px
- [ ] 1280px: nội dung không kéo giãn quá 720px, có phím tắt khi làm bài
- [ ] Chế độ tối đúng, tương phản đạt
- [ ] Đủ trạng thái loading / rỗng / lỗi với câu chữ theo §10
- [ ] Mọi chữ tiếng Nhật có `lang="ja"`; mọi chuỗi tiếng Việt nằm trong `vi.ts`
- [ ] Đúng/sai có biểu tượng + chữ, không chỉ màu; có `aria-live`
- [ ] Bàn phím đi được hết, focus thấy rõ
- [ ] `prefers-reduced-motion` được tôn trọng
- [ ] Safe-area và `min-h-dvh` (sẵn sàng cho app)
- [ ] Không vi phạm mục nào ở §12
- [ ] `npm run check` xanh, ảnh chụp đã đính kèm trong báo cáo

---

## 14. Prompt mẫu cho Mạnh

Dùng khi muốn sửa giao diện mà không chạy cả quy trình Spec Kit:

- **Sửa một màn hình:** "Màn hình Kết quả trên điện thoại bị chật, nút 'Làm lại câu sai' bị đẩy xuống dưới. Sửa theo docs/FRONTEND.md §7.6, chụp lại 360px và 1280px cho tôi xem."
- **Thấy giao diện 'giống AI':** "Soát trang chủ theo docs/FRONTEND.md §12 và §13.2, liệt kê từng điểm vi phạm, sửa hết rồi gửi ảnh trước/sau."
- **Màn hình mới chưa có công thức:** "Tôi muốn thêm trang X để làm Y. Phác wireframe 360px và 1280px theo phong cách docs/FRONTEND.md §7 trước, đừng code, chờ tôi duyệt."
- **Đổi màu/chữ:** "Đổi màu `sora` sang tông xanh ngọc hơn. Chỉ sửa src/ui/tokens.css, kiểm tra lại tương phản theo §11 và cập nhật bảng §5.2 trong docs/FRONTEND.md."
