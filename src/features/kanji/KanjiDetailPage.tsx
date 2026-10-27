import { useParams, Link } from 'react-router-dom'
import { ErrorState } from '@/components/ErrorState'
import { LoadingState } from '@/components/LoadingState'
import { NotFound } from '@/components/NotFound'
import { Ruby } from '@/components/Ruby'
import { SpeakButton } from '@/components/SpeakButton'
import { loadManifest, resolveVocabItems } from '@/data/content-loader'
import { loadAllKanjiForBook } from '@/data/kanji-lookup'
import { vi } from '@/i18n/vi'
import { useAsyncData } from '@/lib/use-async-data'
import type { KanjiExample, KanjiItem } from '@/domain/types'

const KIND_LABEL: Record<KanjiExample['kind'], string> = {
  kun: vi.kanjiDetail.kindKun,
  on: vi.kanjiDetail.kindOn,
  special: vi.kanjiDetail.kindSpecial,
}

export function KanjiDetailPage() {
  const { char } = useParams<{ char: string }>()

  const manifestState = useAsyncData(loadManifest, [])
  const kanjiBookIds =
    manifestState.data?.levels
      .flatMap((l) => l.books)
      .filter((b) => b.type === 'kanji')
      .map((b) => b.id) ?? []

  const itemState = useAsyncData<KanjiItem | null>(async () => {
    if (!manifestState.data || !char) return null
    for (const bookId of kanjiBookIds) {
      const all = await loadAllKanjiForBook(bookId)
      const found = all.find((k) => k.char === char)
      if (found) return found
    }
    return null
  }, [char, manifestState.data])

  const relatedState = useAsyncData(
    () =>
      itemState.data
        ? resolveVocabItems(itemState.data.relatedVocabIds)
        : Promise.resolve([]),
    [itemState.data],
  )

  if (manifestState.loading || itemState.loading) return <LoadingState />
  if (manifestState.error || itemState.error) return <ErrorState />
  if (!itemState.data) return <NotFound />

  const item = itemState.data

  return (
    <div className="flex flex-col gap-4 py-4">
      <div className="flex items-center gap-4">
        <span className="text-6xl leading-none">{item.char}</span>
        <div className="flex flex-col gap-1">
          <SpeakButton text={item.char} />
          <p className="text-lg font-semibold text-primary-700 dark:text-primary-500">
            {item.hanViet}
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            {item.meaning}
          </p>
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
        <InfoItem
          label={vi.kanjiDetail.strokesLabel}
          value={String(item.strokes)}
        />
        <InfoItem
          label={vi.kanjiDetail.kunLabel}
          value={item.kun.join('、') || vi.kanjiDetail.none}
        />
        <InfoItem
          label={vi.kanjiDetail.onLabel}
          value={item.on.join('、') || vi.kanjiDetail.none}
        />
      </dl>

      {item.examples.length > 0 && (
        <section className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            {vi.kanjiDetail.examplesTitle}
          </h2>
          <ul className="flex flex-col divide-y divide-slate-100 dark:divide-slate-800">
            {item.examples.map((example, i) => (
              <li key={i} className="flex min-h-11 items-center gap-2 py-2">
                <SpeakButton text={example.word} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2">
                    <Ruby base={example.word} reading={example.reading} />
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[0.65rem] font-medium text-slate-500 dark:bg-slate-700 dark:text-slate-300">
                      {KIND_LABEL[example.kind]}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {example.meaning}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          {vi.kanjiDetail.relatedVocabTitle}
        </h2>
        {relatedState.loading ? (
          <LoadingState />
        ) : relatedState.data && relatedState.data.length > 0 ? (
          <ul className="flex flex-wrap gap-2">
            {relatedState.data.map((vocabItem) => (
              <li key={vocabItem.id}>
                <Link
                  to={`/b/${vocabItem.bookId}/${vocabItem.lesson}`}
                  className="flex min-h-11 items-center gap-1 rounded-full border border-slate-200 px-3 text-sm hover:border-primary-500 dark:border-slate-700"
                >
                  <Ruby
                    base={vocabItem.kanji ?? vocabItem.kana}
                    reading={vocabItem.kanji ? vocabItem.kana : undefined}
                  />
                  <span className="text-slate-400">— {vocabItem.meaning}</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {vi.kanjiDetail.noRelatedVocab}
          </p>
        )}
      </section>
    </div>
  )
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-50 p-2 dark:bg-slate-800">
      <dt className="text-xs text-slate-400">{label}</dt>
      <dd className="font-medium text-slate-800 dark:text-slate-100">
        {value}
      </dd>
    </div>
  )
}
