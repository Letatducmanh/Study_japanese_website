import { BarChart3, BookOpen, Home, RotateCcw, Target } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { vi } from '@/i18n/vi'

const items = [
  { to: '/', label: vi.nav.home, Icon: Home, end: true },
  { to: '/n', label: vi.nav.learn, Icon: BookOpen, end: false },
  { to: '/review', label: vi.nav.review, Icon: RotateCcw, end: false },
  { to: '/weak', label: vi.nav.weak, Icon: Target, end: false },
  { to: '/stats', label: vi.nav.stats, Icon: BarChart3, end: false },
] as const

export function BottomNav() {
  return (
    <nav className="sticky bottom-0 z-10 flex border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 sm:hidden">
      {items.map(({ to, label, Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            `flex min-h-11 flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[11px] ${
              isActive
                ? 'text-primary-600'
                : 'text-slate-500 dark:text-slate-400'
            }`
          }
        >
          <Icon size={22} strokeWidth={2} aria-hidden="true" />
          {label}
        </NavLink>
      ))}
    </nav>
  )
}
