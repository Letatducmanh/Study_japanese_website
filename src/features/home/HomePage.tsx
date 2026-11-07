import {
  ArrowRight,
  Calendar,
  ChevronRight,
  RotateCcw,
  Target,
} from 'lucide-react'
import type { ComponentType, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ShibaMascot } from '@/components/mascot/ShibaMascot'
import { TrainPlatformScene } from '@/components/mascot/TrainPlatformScene'
import { Card, LinkButton } from '@/components/ui'
import { progressRepository } from '@/data/progress/dexie-repo'
import { loadContinueLesson } from '@/features/home/continue-lesson'
import {
  buildStationRail,
  loadHeroBook,
  type HeroBook,
  type StationRailItem,
} from '@/features/home/hero-book'
import { vi } from '@/i18n/vi'
import { useAsyncData } from '@/data/hooks/use-async-data'

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

  const heroLesson =
    heroBook?.numberedLessons.find(
      (l) => l.lesson === heroBook.currentLessonNumber,
    ) ??
    heroBook?.firstLesson ??
    null

  return (
    <div className="flex flex-col gap-5 py-4 md:gap-6 md:py-6">
      <MobileHero
        heroBook={heroBook}
        heroLesson={heroLesson}
        stationRail={stationRail}
        hasProgress={continueLesson != null}
        ctaLabel={heroCtaLabel}
        ctaHref={heroCtaHref}
      />
      <DesktopHero
        heroBook={heroBook}
        stationRail={stationRail}
        ctaLabel={heroCtaLabel}
        ctaHref={heroCtaHref}
      />

      <div>
        <h2 className="mb-3 text-lg font-bold text-ink">
          {vi.home.todayTitle}
        </h2>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-3">
          <TodayCard
            Icon={RotateCcw}
            title={vi.home.reviewTitle}
            shortBody={vi.home.reviewShort}
            body={vi.home.reviewBody}
            ctaLabel={vi.home.reviewCardCta}
            to="/review"
            preview={<ReviewPreview />}
          />
          <TodayCard
            Icon={Target}
            title={vi.home.weakTitle}
            shortBody={
              hasWeakData ? vi.home.weakShortWithData : vi.home.weakShort
            }
            body={hasWeakData ? vi.home.weakBody : vi.home.weakBodyEmpty}
            ctaLabel={vi.home.weakCardCta}
            to="/weak"
            preview={<BarsPreview />}
          />
          <TodayCard
            Icon={Calendar}
            title={vi.home.streakTitle}
            shortBody={vi.home.streakShort}
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

/** Hero mobile (dưới 768px) theo app-home.png: gọn, chú chó ngồi trên mép thẻ, không dựng cảnh sân ga. */
function MobileHero({
  heroBook,
  heroLesson,
  stationRail,
  hasProgress,
  ctaLabel,
  ctaHref,
}: {
  heroBook: HeroBook | null
  heroLesson: { lesson: number; title: string } | null
  stationRail: StationRailItem[]
  hasProgress: boolean
  ctaLabel: string
  ctaHref: string
}) {
  const dots = stationRail.filter((item) => !item.ellipsis)
  return (
    <div className="relative pt-16 md:hidden">
      <div className="absolute top-3 right-24 z-10 w-max max-w-44 rounded-2xl bg-surface px-3 py-1.5 text-xs font-medium text-ink shadow-sm">
        {vi.home.mascotSpeech}
        <span
          aria-hidden="true"
          className="absolute -right-1 bottom-2 h-3 w-3 rotate-45 bg-surface"
        />
      </div>
      <ShibaMascot className="absolute top-0 right-4 z-10 w-[72px]" />

      <div className="flex flex-col gap-4 rounded-[var(--radius-frame)] bg-deep p-5 text-white">
        <div className="flex items-center gap-3">
          {heroLesson && (
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-[3px] border-line bg-white text-xs font-bold text-deep">
              L{pad2(heroLesson.lesson)}
            </span>
          )}
          {heroBook && (
            <p className="min-w-0 text-sm text-white/80">
              {hasProgress
                ? vi.home.currentStationLabel
                : vi.home.firstStationLabel}{' '}
              · {heroBook.bookTitle}
            </p>
          )}
        </div>

        <h1 className="text-2xl leading-tight font-extrabold">
          {heroLesson?.title ?? vi.home.heroTitle}
        </h1>

        {dots.length > 0 && (
          <div aria-hidden="true" className="relative flex justify-between">
            <span className="absolute inset-x-1 top-1/2 h-0.5 -translate-y-1/2 bg-white/30" />
            {dots.map((item) =>
              item.ellipsis ? null : (
                <span
                  key={item.code}
                  className={`relative h-3.5 w-3.5 rounded-full border-2 ${
                    item.current
                      ? 'border-white bg-yellow'
                      : 'border-white/70 bg-deep'
                  }`}
                />
              ),
            )}
          </div>
        )}

        <LinkButton
          to={ctaHref}
          variant="primary"
          className="h-14 w-full text-base"
        >
          {ctaLabel}
          <ArrowRight size={20} strokeWidth={2} aria-hidden="true" />
        </LinkButton>
        <Link
          to="/weak"
          className="flex min-h-11 items-center justify-center text-sm font-medium text-white/90 underline underline-offset-4"
        >
          {vi.home.weakCta}
        </Link>
      </div>
    </div>
  )
}

/** Hero desktop/tablet (từ 768px): hai cột, cảnh sân ga + đoàn tàu + dải ga + thẻ "Ga đầu tiên". */
function DesktopHero({
  heroBook,
  stationRail,
  ctaLabel,
  ctaHref,
}: {
  heroBook: HeroBook | null
  stationRail: StationRailItem[]
  ctaLabel: string
  ctaHref: string
}) {
  return (
    <div className="relative hidden overflow-hidden rounded-[var(--radius-frame)] bg-deep px-10 py-10 text-white md:block">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-center">
        <div className="flex flex-col gap-3">
          {heroBook && (
            <span className="inline-flex w-fit items-center gap-2 rounded-[var(--radius-pill)] border border-white/30 bg-deep py-1 pr-3 pl-1 text-xs font-medium">
              <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-white px-1.5 text-[11px] font-bold text-deep">
                {heroBook.levelId}
              </span>
              {heroBook.bookTitle} · {heroBook.numberedLessons.length}{' '}
              {heroBook.lessonLabel.toLowerCase()}
            </span>
          )}
          <h1 className="max-w-md text-4xl leading-tight font-extrabold">
            {vi.home.heroTitle}
          </h1>
          <p className="max-w-md text-sm text-white/80">
            {vi.home.heroSubtitle}
          </p>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <LinkButton to={ctaHref} variant="primary">
              {ctaLabel}
              <ArrowRight size={18} strokeWidth={2} aria-hidden="true" />
            </LinkButton>
            <LinkButton to="/weak" variant="inverse">
              {vi.home.weakCta}
            </LinkButton>
          </div>
        </div>

        <div className="relative flex flex-col gap-3">
          <div className="relative h-40">
            <TrainPlatformScene className="absolute inset-0 h-full w-full" />
            <div className="absolute bottom-0 left-4 w-28">
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
            <div className="flex items-end justify-center gap-3 overflow-x-auto px-1">
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
  )
}

function TodayCard({
  Icon,
  title,
  shortBody,
  body,
  ctaLabel,
  to,
  preview,
}: {
  Icon: ComponentType<{ size?: number; strokeWidth?: number }>
  title: string
  shortBody: string
  body: string
  ctaLabel: string
  to: string
  preview: ReactNode
}) {
  return (
    <Link to={to} className="block">
      <Card className="flex h-full items-center gap-3 p-3 transition-colors hover:border-line sm:flex-col sm:items-stretch sm:p-4">
        <div className="flex min-w-0 flex-1 items-center gap-3 sm:flex-none sm:gap-2">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-btn)] bg-tint text-line sm:h-9 sm:w-9">
            <Icon size={20} strokeWidth={2} />
          </span>
          <div className="min-w-0">
            <p className="font-semibold text-ink">{title}</p>
            <p className="truncate text-sm text-muted sm:hidden">{shortBody}</p>
          </div>
        </div>
        <ChevronRight
          size={20}
          strokeWidth={2}
          aria-hidden="true"
          className="shrink-0 text-line sm:hidden"
        />
        <p className="hidden text-sm text-muted sm:block">{body}</p>
        <div className="hidden sm:block">{preview}</div>
        <p className="mt-auto hidden items-center gap-1 text-sm font-medium text-line sm:flex">
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

/** Xem trước cho "Điểm yếu nổi bật": ba thanh mờ đại diện danh sách từ sẽ hiện. */
function BarsPreview() {
  return (
    <div aria-hidden="true" className="flex flex-col gap-2">
      <div className="h-2.5 w-full rounded-[var(--radius-pill)] bg-track opacity-70" />
      <div className="h-2.5 w-3/5 rounded-[var(--radius-pill)] bg-track opacity-50" />
      <div className="h-2.5 w-2/5 rounded-[var(--radius-pill)] bg-track opacity-30" />
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
