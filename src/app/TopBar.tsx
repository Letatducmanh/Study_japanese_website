import { Link } from 'react-router-dom'
import { ThemeToggle } from '@/components/ThemeToggle'
import { vi } from '@/i18n/vi'

export function TopBar() {
  return (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-2 border-b border-slate-200 bg-white px-3 dark:border-slate-800 dark:bg-slate-900">
      <Link to="/" className="flex min-w-0 items-center gap-2">
        <span className="text-xl" aria-hidden="true">
          🗾
        </span>
        <span className="truncate text-sm font-bold text-primary-700 dark:text-primary-600 sm:text-base">
          <span className="hidden sm:inline">{vi.appName}</span>
          <span className="sm:hidden">{vi.appNameShort}</span>
        </span>
      </Link>

      <div className="ml-auto flex items-center gap-1">
        <Link
          to="/search"
          aria-label={vi.topbar.searchPlaceholder}
          title={vi.topbar.searchPlaceholder}
          className="flex h-11 w-11 items-center justify-center rounded-full text-lg hover:bg-primary-50 dark:hover:bg-slate-800"
        >
          🔍
        </Link>
        <ThemeToggle />
        <Link
          to="/settings"
          aria-label={vi.topbar.settings}
          title={vi.topbar.settings}
          className="flex h-11 w-11 items-center justify-center rounded-full text-lg hover:bg-primary-50 dark:hover:bg-slate-800"
        >
          ⚙️
        </Link>
      </div>
    </header>
  )
}
