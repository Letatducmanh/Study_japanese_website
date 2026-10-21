import { vi } from '@/i18n/vi'

export function AboutPage() {
  return (
    <div className="flex flex-col gap-6 p-4">
      <h1 className="text-lg font-bold text-primary-900 dark:text-slate-100">
        {vi.about.pageTitle}
      </h1>
      <p className="text-sm text-slate-600 dark:text-slate-300">
        {vi.about.intro}
      </p>

      <section className="flex flex-col gap-1">
        <h2 className="text-sm font-semibold text-primary-900 dark:text-slate-100">
          {vi.about.sourcesTitle}
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          {vi.about.sourcesBody}
        </p>
      </section>

      <section className="flex flex-col gap-1">
        <h2 className="text-sm font-semibold text-primary-900 dark:text-slate-100">
          {vi.about.dataPolicyTitle}
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          {vi.about.dataPolicyBody}
        </p>
      </section>
    </div>
  )
}
