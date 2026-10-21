import { useMemo, useState } from 'react'
import { SpeakButton } from '@/components/SpeakButton'
import { Ruby } from '@/components/Ruby'
import { vi } from '@/i18n/vi'
import type { EditionFilter, VocabItem } from '@/domain/types'

type SectionFilter = 'all' | 'main' | 'extended'

interface VocabTabProps {
  vocab: VocabItem[]
  editionFilterDefault: EditionFilter
}

interface VocabGroup {
  key: string
  title: string
  items: VocabItem[]
}

function groupVocab(vocab: VocabItem[]): VocabGroup[] {
  const groups: VocabGroup[] = []
  for (const item of vocab) {
    const key =
      item.section === 'main' ? 'main' : `extended:${item.sectionTitle ?? ''}`
    const existing = groups.find((g) => g.key === key)
    if (existing) {
      existing.items.push(item)
      continue
    }
    groups.push({
      key,
      title:
        item.section === 'main'
          ? vi.lesson.vocabMainTitle
          : (item.sectionTitle ?? vi.lesson.vocabExtendedTitleFallback),
      items: [item],
    })
  }
  return groups
}

function matchesEdition(item: VocabItem, filter: EditionFilter): boolean {
  if (filter === 'all') return true
  return !item.edition || item.edition === filter
}

export function VocabTab({ vocab, editionFilterDefault }: VocabTabProps) {
  const [sectionFilter, setSectionFilter] = useState<SectionFilter>('all')
  const [editionFilter, setEditionFilter] =
    useState<EditionFilter>(editionFilterDefault)
  const [showMeaning, setShowMeaning] = useState(true)

  const filtered = useMemo(
    () =>
      vocab.filter(
        (item) =>
          (sectionFilter === 'all' || item.section === sectionFilter) &&
          matchesEdition(item, editionFilter),
      ),
    [vocab, sectionFilter, editionFilter],
  )
  const groups = useMemo(() => groupVocab(filtered), [filtered])

  if (vocab.length === 0) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">
        {vi.lesson.noVocab}
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        <FilterGroup
          value={sectionFilter}
          onChange={setSectionFilter}
          options={[
            { value: 'all', label: vi.lesson.filterSectionAll },
            { value: 'main', label: vi.lesson.filterSectionMain },
            { value: 'extended', label: vi.lesson.filterSectionExtended },
          ]}
        />
        <FilterGroup
          value={editionFilter}
          onChange={setEditionFilter}
          options={[
            { value: 'all', label: vi.lesson.filterSectionAll },
            { value: 'new', label: vi.lesson.filterEditionNew },
            { value: 'old', label: vi.lesson.filterEditionOld },
          ]}
        />
        <button
          type="button"
          onClick={() => setShowMeaning((s) => !s)}
          className="min-h-11 rounded-full border border-slate-200 px-3 text-xs font-medium text-slate-600 hover:border-primary-500 dark:border-slate-700 dark:text-slate-300"
        >
          {showMeaning ? vi.common.hideMeaning : vi.common.showMeaning}
        </button>
      </div>

      {groups.map((group) => (
        <div key={group.key} className="flex flex-col gap-2">
          <h3 className="text-sm font-semibold text-primary-700 dark:text-primary-500">
            {group.title}
          </h3>
          <ul className="flex flex-col divide-y divide-slate-100 dark:divide-slate-800">
            {group.items.map((item) => (
              <VocabRow key={item.id} item={item} showMeaning={showMeaning} />
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}

function VocabRow({
  item,
  showMeaning,
}: {
  item: VocabItem
  showMeaning: boolean
}) {
  const extraNote =
    item.note && item.note !== 'Bản cũ' && item.note !== 'Bản mới'
      ? item.note
      : null
  return (
    <li className="flex min-h-11 items-center gap-3 py-2">
      <SpeakButton text={item.kanji ?? item.kana} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-2">
          <span className="text-lg font-medium text-slate-900 dark:text-slate-100">
            <Ruby
              base={item.kanji ?? item.kana}
              reading={item.kanji ? item.kana : undefined}
            />
          </span>
          <span className="text-xs text-slate-400">{item.romaji}</span>
          {item.edition === 'old' && (
            <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[0.65rem] font-medium text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">
              {vi.lesson.filterEditionOld}
            </span>
          )}
        </div>
        {showMeaning && (
          <p className="text-sm text-slate-600 dark:text-slate-300">
            {item.meaning}
          </p>
        )}
        {extraNote && (
          <p className="text-xs italic text-slate-400">{extraNote}</p>
        )}
      </div>
    </li>
  )
}

function FilterGroup<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T
  onChange: (value: T) => void
  options: { value: T; label: string }[]
}) {
  return (
    <div className="flex overflow-hidden rounded-full border border-slate-200 dark:border-slate-700">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`min-h-11 px-3 text-xs font-medium ${
            value === opt.value
              ? 'bg-primary-600 text-white'
              : 'text-slate-600 hover:bg-primary-50 dark:text-slate-300 dark:hover:bg-slate-800'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
