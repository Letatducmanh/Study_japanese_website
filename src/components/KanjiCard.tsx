import { Link } from 'react-router-dom'
import type { KanjiItem } from '@/domain/types'

interface KanjiCardProps {
  item: KanjiItem
}

export function KanjiCard({ item }: KanjiCardProps) {
  return (
    <Link
      to={`/kanji/${encodeURIComponent(item.char)}`}
      className="flex min-h-11 flex-col items-center gap-0.5 rounded-lg border border-slate-200 bg-white p-3 text-center hover:border-primary-500 dark:border-slate-700 dark:bg-slate-800"
    >
      <span className="text-3xl leading-none">{item.char}</span>
      <span className="text-xs font-medium text-primary-700 dark:text-primary-500">
        {item.hanViet}
      </span>
      <span className="line-clamp-1 text-xs text-slate-500 dark:text-slate-400">
        {item.meaning}
      </span>
    </Link>
  )
}
