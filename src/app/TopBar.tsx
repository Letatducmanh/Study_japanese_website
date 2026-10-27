import { Mountain, Search, Settings } from 'lucide-react'
import { Link, NavLink } from 'react-router-dom'
import { Container } from '@/components/ui'
import { ThemeToggle } from '@/components/ThemeToggle'
import { vi } from '@/i18n/vi'
import { navItems } from './nav-items'

const iconButtonClass =
  'flex h-11 w-11 items-center justify-center rounded-full text-ink hover:bg-tint'

/**
 * Thanh trên: logo + (từ 768px) nav 5 mục theo SPEC mục 7 + tìm kiếm/đổi giao diện/cài đặt.
 * Thanh tab dưới (BottomNav) đảm nhiệm điều hướng dưới 768px.
 */
export function TopBar() {
  return (
    <header className="sticky top-0 z-10 border-b border-border bg-surface">
      <Container className="flex h-14 items-center gap-2">
        <Link to="/" className="flex min-w-0 items-center gap-2">
          <Mountain
            size={22}
            strokeWidth={2}
            aria-hidden="true"
            className="shrink-0 text-line"
          />
          <span className="truncate text-sm font-bold text-ink lg:text-base">
            <span className="hidden lg:inline">{vi.appName}</span>
            <span className="lg:hidden">{vi.appNameShort}</span>
          </span>
        </Link>

        <nav className="ml-3 hidden items-center gap-0.5 md:flex lg:ml-6 lg:gap-1">
          {navItems.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `rounded-t-[var(--radius-btn)] border-b-[3px] px-2 py-2 text-xs font-medium whitespace-nowrap transition-colors lg:px-3 lg:text-sm ${
                  isActive
                    ? 'border-line text-ink font-semibold'
                    : 'border-transparent text-muted hover:text-ink'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <Link
            to="/search"
            aria-label={vi.topbar.searchPlaceholder}
            title={vi.topbar.searchPlaceholder}
            className={iconButtonClass}
          >
            <Search size={22} strokeWidth={2} aria-hidden="true" />
          </Link>
          <ThemeToggle />
          <Link
            to="/settings"
            aria-label={vi.topbar.settings}
            title={vi.topbar.settings}
            className={iconButtonClass}
          >
            <Settings size={22} strokeWidth={2} aria-hidden="true" />
          </Link>
        </div>
      </Container>
    </header>
  )
}
