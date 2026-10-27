import { ArrowRight, Calendar, RotateCcw, Target } from 'lucide-react'
import type { ComponentType } from 'react'
import { Link } from 'react-router-dom'
import { JapanMotifBackground } from '@/components/mascot/JapanMotifBackground'
import { ShibaMascot } from '@/components/mascot/ShibaMascot'
import { Card, Container, EmptyState, LinkButton } from '@/components/ui'
import { progressRepository } from '@/data/progress/dexie-repo'
import { loadContinueLesson } from '@/features/home/continue-lesson'
import { vi } from '@/i18n/vi'
import { useAsyncData } from '@/lib/use-async-data'

export function HomePage() {
  const { data: weakList } = useAsyncData(
    () => progressRepository.listWeak(1),
    [],
  )
  const hasWeakData = (weakList?.length ?? 0) > 0
  const { data: continueLesson } = useAsyncData(loadContinueLesson, [])

  const heroCtaLabel = continueLesson
    ? `${vi.home.continueCtaPrefix} ${continueLesson.lessonLabel} ${continueLesson.lesson}`
    : vi.home.browseCta
  const heroCtaHref = continueLesson
    ? `/b/${continueLesson.bookId}/${continueLesson.lesson}`
    : '/n'

  return (
    <div className="flex flex-col gap-6 pb-8">
      <Container className="pt-6">
        <div className="relative overflow-hidden rounded-[var(--radius-frame)] bg-deep px-6 py-8 text-white sm:px-10 sm:py-10">
          <JapanMotifBackground className="pointer-events-none absolute inset-x-0 bottom-0 h-36 w-full text-white/10" />

          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center">
            <div className="flex flex-1 flex-col gap-3">
              <h1 className="max-w-sm text-3xl leading-tight font-extrabold sm:text-4xl">
                {vi.home.heroTitle}
              </h1>
              <p className="max-w-sm text-sm text-white/80">
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
            </div>

            <div className="relative w-28 shrink-0 self-end sm:w-40 sm:self-auto">
              <div className="absolute top-0 right-0 z-10 max-w-32 -translate-y-14 rounded-2xl rounded-br-sm bg-surface px-3 py-1.5 text-xs font-medium text-ink shadow-sm sm:-translate-y-16">
                {vi.home.mascotSpeech}
              </div>
              <ShibaMascot className="w-full" />
            </div>
          </div>
        </div>
      </Container>

      <Container>
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
          />
          <TodayCard
            Icon={Target}
            title={vi.home.weakTitle}
            body={hasWeakData ? vi.home.weakBody : vi.home.weakBodyEmpty}
            ctaLabel={vi.home.weakCardCta}
            to="/weak"
          />
          <TodayCard
            Icon={Calendar}
            title={vi.home.streakTitle}
            body={vi.home.streakBody}
            ctaLabel={vi.home.streakCardCta}
            to="/stats"
          />
        </div>
      </Container>
    </div>
  )
}

function TodayCard({
  Icon,
  title,
  body,
  ctaLabel,
  to,
}: {
  Icon: ComponentType<{ size?: number; strokeWidth?: number }>
  title: string
  body: string
  ctaLabel: string
  to: string
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
        <EmptyState variant="inline" />
        <p className="mt-auto flex items-center gap-1 text-sm font-medium text-line">
          {ctaLabel}
          <ArrowRight size={16} strokeWidth={2} aria-hidden="true" />
        </p>
      </Card>
    </Link>
  )
}
