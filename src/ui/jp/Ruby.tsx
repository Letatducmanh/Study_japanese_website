interface RubyProps {
  base: string
  reading?: string | null
  className?: string
}

/** Hiển thị furigana bằng thẻ `<ruby>`; nếu không có kanji thì chỉ in `base`. */
export function Ruby({ base, reading, className }: RubyProps) {
  if (!reading) {
    return <span className={className}>{base}</span>
  }
  return (
    <ruby className={className}>
      {base}
      <rt className="text-[0.55em] font-normal text-slate-500 dark:text-slate-400">
        {reading}
      </rt>
    </ruby>
  )
}
