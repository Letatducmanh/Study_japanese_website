import { NavLink } from 'react-router-dom'
import { navItems } from './nav-items'

/** Thanh tab dưới — chỉ hiện dưới 768px (SPEC mục 7); từ 768px dùng nav trong TopBar. */
export function BottomNav() {
  return (
    <nav className="sticky bottom-0 z-10 flex border-t border-border bg-surface md:hidden">
      {navItems.map(({ to, label, Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            `flex min-h-11 flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[11px] ${
              isActive ? 'text-line' : 'text-muted'
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
