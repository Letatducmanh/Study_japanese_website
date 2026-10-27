import { ArrowRight, Calendar, RotateCcw, Target } from 'lucide-react'
import type { ComponentType, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ShibaMascot } from '@/components/mascot/ShibaMascot'
import { TrainPlatformScene } from '@/components/mascot/TrainPlatformScene'
import { Card, LinkButton } from '@/components/ui'
import { progressRepository } from '@/data/progress/dexie-repo'
import { loadContinueLesson } from '@/features/home/continue-lesson'
import { buildStationRail, loadHeroBook } from '@/features/home/hero-book'
import { vi } from '@/i18n/vi'
import { useAsyncData } from '@/lib/use-async-data'

const pad2 = (n: number) => String(n).padStart(2, '0')

export function HomePage() {
  const { data: weakList } = useAsyncData(
    () => progressRepository.listWeak(1),
    [],
  )
  const hasWeakData = (weakList?.length ?? 0) > 0
  const { data: continueLesson } = useAsyncData(loadContinueLesson, [])
  const { data: heroBook } = useAsyncData(loadHeroBook, [])

  const heroCtaLabel = continueLesson
    ? `${vi.home.continueCtaPrefix} ${continueLesson.lessonLabel} ${continueLesson.lesson}`
    : vi.home.browseCta
  const heroCtaHref = continueLesson
    ? `/b/${continueLesson.bookId}/${continueLesson.lesson}`
    : '/n'

  const stationRail = heroBook
    ? buildStationRail(heroBook.numberedLessons, heroBook.currentLessonNumber)
    : []

  return (
    <div className="flex flex-col gap-6 py-6">
      <div className="relative overflow-hidden rounded-[var(--radius-frame)] bg-deep px-6 py-8 text-white sm:px-10 sm:py-10">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-center">
          <div className="flex flex-col gap-3">
            {heroBook && (
              <span className="inline-flex w-fit items-center rounded-[var(--radius-pill)] border border-white/30 px-3 py-1 text-xs font-medium">
                {heroBook.levelId} · {heroBook.bookTitle} ·{' '}
                {heroBook.numberedLessons.length}{' '}
                {heroBook.lessonLabel.toLowerCase()}
              </span>
            )}
            <h1 className="max-w-md text-3xl leading-tight font-extrabold sm:text-4xl">
              {vi.home.heroTitle}
            </h1>
            <p className="max-w-md text-sm text-white/80">
              {vi.home.heroSubtitle}
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <LinkButton to={heroCtaHref} variant="primary">
                {heroCtaLabel}
                <ArrowRight size={18} strokeWidth={2} aria-hidden="true" />
              </LinkButton>
              <LinkButton to="/weak" variant="inverse">
                {vi.home.weakCta}
              </LinkButton>
            </div>

            {/* Hàng số liệu (số bài / số dạng luyện tập...) — để chỗ, nối dữ liệu thật ở giai đoạn sau. */}
            <div className="mt-2 grid grid-cols-3 gap-2">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="rounded-[var(--radius-btn)] border border-dashed border-white/30 p-2"
                >
                  <div className="mx-auto h-2 w-10 rounded-[var(--radius-pill)] bg-white/20" />
                </div>
              ))}
            </div>
          </div>

          <div className="relative flex flex-col gap-3">
            <div className="relative h-40">
              <TrainPlatformScene className="absolute inset-0 h-full w-full" />
              <div className="absolute bottom-0 left-2 w-24 sm:left-4 sm:w-28">
                <div className="relative">
                  <div className="absolute -top-14 left-1/2 w-max max-w-44 -translate-x-[35%] rounded-2xl bg-surface px-3 py-1.5 text-xs font-medium text-ink shadow-sm">
                    {vi.home.mascotSpeech}
                    <span
                      aria-hidden="true"
                      className="absolute -bottom-1 left-8 h-3 w-3 rotate-45 bg-surface"
                    />
                  </div>
                  <ShibaMascot className="w-full" />
                </div>
              </div>
            </div>

            {stationRail.length > 0 && (
              <div className="flex items-end justify-center gap-2 overflow-x-auto px-1 sm:gap-3">
                {stationRail.map((item, i) =>
                  item.ellipsis ? (
                    <span
                      key={`ellipsis-${i}`}
                      aria-hidden="true"
                      className="pb-2 text-white/50"
                    >
                      …
                    </span>
                  ) : (
                    <div
                      key={item.code}
                      className="flex flex-col items-center gap-1"
                    >
                      <span
                        className={`h-3 w-3 rounded-full border-2 ${
                          item.current
                            ? 'border-deep bg-yellow'
                            : 'border-white/60 bg-transparent'
                        }`}
                      />
                      <span className="text-[10px] text-white/70">
                        {item.code}
                      </span>
                    </div>
                  ),
                )}
              </div>
            )}

            {heroBook?.firstLesson && (
              <Link
                to={`/b/${heroBook.bookId}/${heroBook.firstLesson.lesson}`}
                className="flex items-center gap-3 rounded-[var(--radius-card)] border border-white/20 bg-white/10 p-3 transition-colors hover:bg-white/15"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-yellow text-xs font-bold">
                  L{pad2(heroBook.firstLesson.lesson)}
                </span>
                <span className="min-w-0">
                  <span className="block text-xs text-white/70">
                    {vi.home.firstStationLabel}
                  </span>
                  <span className="block truncate text-sm font-medium">
                    {heroBook.firstLesson.title}
                  </span>
                </span>
              </Link>
            )}
          </div>
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-lg font-bold text-ink">
          {vi.home.todayTitle}
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <TodayCard
            Icon={RotateCcw}
            title={vi.home.reviewTitle}
            body={vi.home.reviewBody}
            ctaLabel={vi.home.reviewCardCta}
            to="/review"
            preview={<ReviewPreview />}
          />
          <TodayCard
            Icon={Target}
            title={vi.home.weakTitle}
            body={hasWeakData ? vi.home.weakBody : vi.home.weakBodyEmpty}
            ctaLabel={vi.home.weakCardCta}
            to="/weak"
            preview={<BarsPreview />}
          />
          <TodayCard
            Icon={Calendar}
            title={vi.home.streakTitle}
            body={vi.home.streakBody}
            ctaLabel={vi.home.streakCardCta}
            to="/stats"
            preview={<StreakPreview />}
          />
        </div>
      </div>
    </div>
  )
}

function TodayCard({
  Icon,
  title,
  body,
  ctaLabel,
  to,
  preview,
}: {
  Icon: ComponentType<{ size?: number; strokeWidth?: number }>
  title: string
  body: string
  ctaLabel: string
  to: string
  preview: ReactNode
}) {
  return (
    <Link to={to} className="block">
      <Card className="flex h-full flex-col gap-3 p-4 transition-colors hover:border-line">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-btn)] bg-tint text-line">
            <Icon size={20} strokeWidth={2} />
          </span>
          <p className="font-semibold text-ink">{title}</p>
        </div>
        <p className="text-sm text-muted">{body}</p>
        {preview}
        <p className="mt-auto flex items-center gap-1 text-sm font-medium text-line">
          {ctaLabel}
          <ArrowRight size={16} strokeWidth={2} aria-hidden="true" />
        </p>
      </Card>
    </Link>
  )
}

/** Xem trước cho "Ôn tập hôm nay": ba khung nét đứt thay cho thẻ ôn tập chưa có. */
function ReviewPreview() {
  return (
    <div aria-hidden="true" className="flex gap-2">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="h-12 flex-1 rounded-[var(--radius-btn)] border border-dashed border-border-strong"
        />
      ))}
    </div>
  )
}

/** Xem trước cho "Điểm yếu nổi bật": hai thanh mờ đại diện danh sách từ sẽ hiện. */
function BarsPreview() {
  return (
    <div aria-hidden="true" className="flex flex-col gap-2">
      <div className="h-2.5 w-full max-w-40 rounded-[var(--radius-pill)] bg-track opacity-60" />
      <div className="h-2.5 w-full max-w-28 rounded-[var(--radius-pill)] bg-track opacity-40" />
    </div>
  )
}

/** Xem trước cho "Chuỗi ngày học": năm vòng tròn ngày (Nay, +1…+4), chưa có dữ liệu thật. */
function StreakPreview() {
  return (
    <div aria-hidden="true" className="flex justify-between">
      {vi.home.streakDayLabels.map((label, i) => (
        <div key={label} className="flex flex-col items-center gap-1">
          <span
            className={`h-7 w-7 rounded-full border-2 ${
              i === 0 ? 'border-yellow' : 'border-border-strong'
            }`}
          />
          <span className="text-[10px] text-muted">{label}</span>
        </div>
      ))}
    </div>
  )
}
