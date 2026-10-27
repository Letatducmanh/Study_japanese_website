export type StationState = 'upcoming' | 'current' | 'done'

interface StationBadgeProps {
  code: string
  state: StationState
}

const stateClasses: Record<StationState, string> = {
  upcoming: 'border-line bg-surface text-line',
  current: 'border-deep bg-yellow text-ink-on-yellow',
  done: 'border-line bg-line text-white',
}

/** StationBadge theo SPEC mục 5: vòng tròn 44px mã ga L01–L25, 3 trạng thái tuyến tàu. */
export function StationBadge({ code, state }: StationBadgeProps) {
  return (
    <span
      className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-[3px] text-xs font-bold ${stateClasses[state]}`}
    >
      {code}
    </span>
  )
}
