import { Link } from 'react-router-dom'
import { JapanMotifBackground } from '@/components/mascot/JapanMotifBackground'
import { ShibaMascot } from '@/components/mascot/ShibaMascot'
import { progressRepository } from '@/data/progress/dexie-repo'
import { vi } from '@/i18n/vi'
import { useAsyncData } from '@/lib/use-async-data'

export function HomePage() {
  const { data: weakList } = useAsyncData(
    () => progressRepository.listWeak(1),
    [],
  )
  const hasWeakData = (weakList?.length ?? 0) > 0

  return (
    <div className="flex flex-col gap-5 pb-6">
      <section className="relative overflow-hidden">
        <JapanMotifBackground className="pointer-events-none absolute inset-x-0 bottom-0 h-36 w-full text-primary-900 dark:text-primary-100" />

        <div className="relative flex flex-col items-center gap-5 px-4 pt-8 text-center sm:flex-row sm:items-center sm:text-left">
          <div className="flex flex-1 flex-col items-center gap-3 sm:items-start">
            <h1 className="font-display max-w-xs text-3xl leading-tight font-extrabold text-primary-900 dark:text-slate-100 sm:max-w-sm sm:text-4xl">
              {vi.home.heroTitle}
            </h1>
            <p className="max-w-xs text-sm text-slate-600 dark:text-slate-400 sm:max-w-sm">
              {vi.home.heroSubtitle}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <Link
                to="/n"
                className="flex min-h-11 items-center justify-center rounded-full bg-primary-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-primary-700"
              >
                {vi.home.browseCta}
              </Link>
              <Link
                to="/weak"
                className="flex min-h-11 items-center justify-center rounded-full border border-primary-600 px-6 py-2.5 text-sm font-medium text-primary-600 dark:text-primary-500"
              >
                {vi.home.weakCta}
              </Link>
            </div>
          </div>

          <div className="relative w-36 shrink-0 sm:w-44">
            <div className="absolute top-0 right-0 z-10 max-w-32 -translate-y-3 translate-x-1 rounded-2xl rounded-br-sm bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm dark:bg-slate-800 dark:text-slate-200">
              {vi.home.mascotSpeech}
            </div>
            <ShibaMascot className="w-full" />
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-3 px-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm dark:border-slate-700 dark:bg-slate-800">
          <p className="font-medium text-slate-800 dark:text-slate-100">
            {vi.home.reviewTitle}
          </p>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            {vi.home.reviewBody}
          </p>
        </div>

        <Link
          to="/weak"
          className="rounded-2xl border border-primary-200 bg-primary-50 p-4 text-sm hover:border-primary-500 dark:border-slate-700 dark:bg-slate-800"
        >
          <p className="font-medium text-primary-900 dark:text-slate-100">
            {vi.home.weakTitle}
          </p>
          <p className="mt-1 text-primary-700 dark:text-slate-400">
            {hasWeakData ? vi.home.weakBody : vi.home.weakBodyEmpty}
          </p>
        </Link>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm dark:border-slate-700 dark:bg-slate-800">
          <p className="font-medium text-slate-800 dark:text-slate-100">
            {vi.home.streakTitle}
          </p>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            {vi.home.streakBody}
          </p>
        </div>
      </section>
    </div>
  )
}
