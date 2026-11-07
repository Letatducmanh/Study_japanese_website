import { useMemo } from 'react'
import { KanjiCard } from './KanjiCard'
import { LoadingState } from '@/ui/primitives/LoadingState'
import { findKanjiBookIdForLevel, loadManifest } from '@/data/content-loader'
import { loadAllKanjiForBook } from '@/data/kanji-lookup'
import { vi } from '@/i18n/vi'
import { useAsyncData } from '@/data/hooks/use-async-data'
import type { VocabItem } from '@/domain/types'

interface KanjiRelatedTabProps {
  vocab: VocabItem[]
  levelId: string
}

export function KanjiRelatedTab({ vocab, levelId }: KanjiRelatedTabProps) {
  const kanjiChars = useMemo(
    () => new Set(vocab.flatMap((item) => item.kanjiChars)),
    [vocab],
  )

  const manifestState = useAsyncData(loadManifest, [])
  const kanjiBookId = manifestState.data
    ? findKanjiBookIdForLevel(manifestState.data, levelId)
    : undefined

  const kanjiState = useAsyncData(
    () =>
      kanjiBookId ? loadAllKanjiForBook(kanjiBookId) : Promise.resolve([]),
    [kanjiBookId],
  )

  if (manifestState.loading || kanjiState.loading) return <LoadingState />

  const related = (kanjiState.data ?? []).filter((k) => kanjiChars.has(k.char))

  if (related.length === 0) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">
        {vi.lesson.noKanjiRelated}
      </p>
    )
  }

  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
      {related.map((item) => (
        <KanjiCard key={item.id} item={item} />
      ))}
    </div>
  )
}
