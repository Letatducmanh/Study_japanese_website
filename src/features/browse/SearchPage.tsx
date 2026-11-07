import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { LoadingState } from '@/ui/primitives/LoadingState'
import { Ruby } from '@/ui/jp/Ruby'
import { SpeakButton } from '@/ui/jp/SpeakButton'
import { searchVocab } from '@/data/search-index'
import { vi } from '@/i18n/vi'
import { useAsyncData } from '@/data/hooks/use-async-data'

export function SearchPage() {
  const [params, setParams] = useSearchParams()
  const [query, setQuery] = useState(params.get('q') ?? '')

  useEffect(() => {
    setParams(query ? { q: query } : {}, { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query])

  const { data: results, loading } = useAsyncData(
    () => searchVocab(query),
    [query],
  )

  return (
    <div className="flex flex-col gap-3 py-4">
      <h1 className="text-lg font-bold text-primary-900 dark:text-slate-100">
        {vi.search.pageTitle}
      </h1>
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={vi.topbar.searchPlaceholder}
        autoFocus
        className="min-h-11 rounded-full border border-slate-200 bg-white px-4 text-base text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
      />

      {!query && (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {vi.search.hint}
        </p>
      )}

      {query && loading && <LoadingState />}

      {query && !loading && results && results.length === 0 && (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {vi.search.empty}
        </p>
      )}

      {query && !loading && results && results.length > 0 && (
        <>
          <p className="text-xs text-slate-400">
            {results.length} {vi.search.resultCountSuffix}
          </p>
          <ul className="flex flex-col divide-y divide-slate-100 dark:divide-slate-800">
            {results.map((r) => (
              <li key={r.id}>
                <Link
                  to={`/b/${r.bookId}/${r.lesson}`}
                  className="flex min-h-11 items-center gap-3 py-2"
                >
                  <SpeakButton text={r.kanji ?? r.kana} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2">
                      <Ruby
                        base={r.kanji ?? r.kana}
                        reading={r.kanji ? r.kana : undefined}
                      />
                      <span className="text-xs text-slate-400">{r.romaji}</span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      {r.meaning}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}
