import { NavLink } from 'react-router-dom'
import { vi } from '@/i18n/vi'

const items = [
  { to: '/', label: vi.nav.home, icon: '🏠', end: true },
  { to: '/n', label: vi.nav.learn, icon: '📖', end: false },
  { to: '/review', label: vi.nav.review, icon: '🔁', end: false },
  { to: '/weak', label: vi.nav.weak, icon: '🎯', end: false },
  { to: '/stats', label: vi.nav.stats, icon: '📊', end: false },
] as const

export function BottomNav() {
  return (
    <nav className="sticky bottom-0 z-10 flex border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 sm:hidden">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) =>
            `flex min-h-11 flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[11px] ${
              isActive
                ? 'text-primary-600'
                : 'text-slate-500 dark:text-slate-400'
            }`
          }
        >
          <span className="text-lg" aria-hidden="true">
            {item.icon}
          </span>
          {item.label}
        </NavLink>
      ))}
    </nav>
  )
}
