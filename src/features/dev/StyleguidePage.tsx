import {
  BarChart3,
  BookOpen,
  Home,
  Moon,
  Mountain,
  RotateCcw,
  Search,
  Settings,
  Sun,
  Target,
  Volume2,
} from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { ShibaMascot } from '@/components/mascot/ShibaMascot'
import {
  Button,
  Card,
  Chip,
  EmptyState,
  SegmentedControl,
  StationBadge,
  Switch,
} from '@/components/ui'

const colorTokens: Array<{
  name: string
  cssVar: string
  usage: string
  darkNote?: string
}> = [
  { name: 'bg', cssVar: '--color-bg', usage: 'Nền trang' },
  { name: 'surface', cssVar: '--color-surface', usage: 'Thẻ, khung' },
  { name: 'ink', cssVar: '--color-ink', usage: 'Chữ chính' },
  { name: 'muted', cssVar: '--color-muted', usage: 'Chữ phụ' },
  { name: 'line', cssVar: '--color-line', usage: 'Nút, liên kết, tuyến' },
  {
    name: 'deep',
    cssVar: '--color-deep',
    usage: 'Biển ga, thẻ chính, viền điểm hiện tại',
    darkNote: 'Tối: tự suy ra #3E66B0 — tỉ lệ viền ~3.3:1 trên bg/surface.',
  },
  {
    name: 'yellow',
    cssVar: '--color-yellow',
    usage: 'CTA chính, điểm hiện tại',
  },
  {
    name: 'tint',
    cssVar: '--color-tint',
    usage: 'Nền nhẹ xanh, thẻ đã chọn/đúng',
    darkNote:
      'Tối: tự suy ra #1C2E57 — chữ ink trên tint đạt 11.6:1, line trên tint đạt 4.8:1.',
  },
  {
    name: 'track',
    cssVar: '--color-track',
    usage: 'Đường ray, thanh tiến độ chưa đạt',
    darkNote: 'Tối: tự suy ra #2A3C63, cùng mức subtlety với bản sáng.',
  },
  {
    name: 'border',
    cssVar: '--color-border',
    usage: 'Viền thẻ',
    darkNote:
      'Tối: tự suy ra #26334F, hairline — không phải chỉ dấu ranh giới duy nhất.',
  },
  {
    name: 'border-strong',
    cssVar: '--color-border-strong',
    usage: 'Viền nút chưa chọn',
    darkNote: 'Tối: tự suy ra #4C6190 — tỉ lệ ~2.7–3:1 trên surface/bg.',
  },
  {
    name: 'wrong',
    cssVar: '--color-wrong',
    usage: 'Sai, chưa đúng',
    darkNote: 'Tối: tự suy ra #FF8F5A — chữ đạt 7.2–8.2:1 trên bg/surface.',
  },
  {
    name: 'wrong-bg',
    cssVar: '--color-wrong-bg',
    usage: 'Nền khối sai',
    darkNote: 'Tối: tự suy ra #3A2013.',
  },
  {
    name: 'wrong-ink',
    cssVar: '--color-wrong-ink',
    usage: 'Chữ trên nền sai',
    darkNote: 'Tối: tự suy ra #FFD3B0 — đạt 10.9:1 trên wrong-bg.',
  },
]

const iconSamples = [
  { Icon: Home, label: 'Home' },
  { Icon: BookOpen, label: 'BookOpen' },
  { Icon: RotateCcw, label: 'RotateCcw' },
  { Icon: Target, label: 'Target' },
  { Icon: BarChart3, label: 'BarChart3' },
  { Icon: Search, label: 'Search' },
  { Icon: Settings, label: 'Settings' },
  { Icon: Sun, label: 'Sun' },
  { Icon: Moon, label: 'Moon' },
  { Icon: Volume2, label: 'Volume2' },
  { Icon: Mountain, label: 'Mountain (logo tạm)' },
]

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-lg font-bold text-ink">{title}</h2>
      {children}
    </section>
  )
}

/**
 * /styleguide — chỉ bật ở môi trường dev (xem App.tsx), dùng để duyệt token
 * và thành phần dùng chung trước khi áp lên các trang (Prompt 1, giai đoạn 1).
 */
export function StyleguidePage() {
  const [segment, setSegment] = useState<'a' | 'b' | 'c'>('a')
  const [switchOn, setSwitchOn] = useState(false)
  const [chipOn, setChipOn] = useState(true)

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-10 bg-bg p-6 text-ink">
      <header>
        <h1 className="text-2xl font-bold">
          Styleguide — token &amp; thành phần dùng chung
        </h1>
        <p className="text-sm text-muted">
          Dùng <code>ThemeToggle</code> ở TopBar để xem bản sáng/tối. Trang này
          không vào production build thực tế (chỉ route khi
          import.meta.env.DEV).
        </p>
      </header>

      <Section title="Màu (SPEC mục 2)">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {colorTokens.map((token) => (
            <div
              key={token.name}
              className="flex items-center gap-3 rounded-[var(--radius-card)] border border-border bg-surface p-3"
            >
              <span
                className="h-11 w-11 shrink-0 rounded-[var(--radius-btn)] border border-border"
                style={{ background: `var(${token.cssVar})` }}
                aria-hidden="true"
              />
              <div className="min-w-0">
                <p className="font-mono text-sm font-semibold">{token.name}</p>
                <p className="text-xs text-muted">{token.usage}</p>
                {token.darkNote && (
                  <p className="text-xs text-muted">{token.darkNote}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Chữ (SPEC mục 3)">
        <div className="flex flex-col gap-2 rounded-[var(--radius-card)] border border-border bg-surface p-4">
          <p className="text-sm text-muted">
            Font stack: 'Be Vietnam Pro', 'Zen Kaku Gothic New', 'Noto Sans JP',
            system-ui, sans-serif.
          </p>
          <p className="text-[56px] leading-none font-bold">Hero 56</p>
          <p className="text-[28px] font-bold">H2 28</p>
          <p className="text-base">
            Thân 15–16: Dấu tiếng Việt — ặ ữ ộ ẩ ướ, giặt giũ, nhường nhịn.
          </p>
          <p className="text-[34px]" lang="ja">
            かな 34px — ひらがな カタカナ
          </p>
          <p className="text-[56px] leading-none" lang="ja">
            漢字 56px
          </p>
        </div>
      </Section>

      <Section title="Icon (SPEC mục 5 — Lucide, 22–24px, nét 2)">
        <div className="flex flex-wrap gap-4 rounded-[var(--radius-card)] border border-border bg-surface p-4">
          {iconSamples.map(({ Icon, label }) => (
            <div key={label} className="flex flex-col items-center gap-1">
              <Icon size={22} strokeWidth={2} aria-hidden="true" />
              <span className="text-xs text-muted">{label}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Button">
        <div className="flex flex-wrap gap-3">
          <Button variant="primary">Chính</Button>
          <Button variant="secondary">Phụ</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="primary" disabled>
            Đã khoá
          </Button>
        </div>
      </Section>

      <Section title="Chip toggle">
        <div className="flex gap-3">
          <Chip selected={chipOn} onClick={() => setChipOn((v) => !v)}>
            N5
          </Chip>
          <Chip selected={!chipOn} onClick={() => setChipOn((v) => !v)}>
            N4
          </Chip>
        </div>
      </Section>

      <Section title="SegmentedControl">
        <SegmentedControl
          aria-label="Ví dụ segmented control"
          value={segment}
          onChange={setSegment}
          options={[
            { value: 'a', label: 'Từ vựng' },
            { value: 'b', label: 'Ngữ pháp' },
            { value: 'c', label: 'Kanji' },
          ]}
        />
      </Section>

      <Section title="Switch">
        <Switch
          aria-label="Ví dụ switch"
          checked={switchOn}
          onChange={setSwitchOn}
        />
      </Section>

      <Section title="Card">
        <Card className="p-4">
          <p className="text-sm">Nội dung thẻ mẫu.</p>
        </Card>
      </Section>

      <Section title="StationBadge">
        <div className="flex gap-3">
          <StationBadge code="L01" state="done" />
          <StationBadge code="L02" state="current" />
          <StationBadge code="L03" state="upcoming" />
        </div>
      </Section>

      <Section title="EmptyState">
        <EmptyState
          title="Chưa có dữ liệu"
          description="Luyện vài bài rồi quay lại đây."
        />
      </Section>

      <Section title="Mascot">
        <ShibaMascot className="h-32 w-32" />
      </Section>
    </div>
  )
}
