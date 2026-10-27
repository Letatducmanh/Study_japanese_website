interface SegmentedControlOption<T extends string> {
  value: T
  label: string
}

interface SegmentedControlProps<T extends string> {
  options: ReadonlyArray<SegmentedControlOption<T>>
  value: T
  onChange: (value: T) => void
  'aria-label': string
}

/** SegmentedControl theo SPEC mục 5: một nhóm lựa chọn loại trừ nhau. */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  'aria-label': ariaLabel,
}: SegmentedControlProps<T>) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className="inline-flex rounded-[var(--radius-pill)] border border-border bg-bg p-1"
    >
      {options.map((option) => {
        const active = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(option.value)}
            className={`min-h-9 rounded-[var(--radius-pill)] px-4 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-line ${
              active ? 'bg-surface text-ink shadow-none' : 'text-muted'
            }`}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
