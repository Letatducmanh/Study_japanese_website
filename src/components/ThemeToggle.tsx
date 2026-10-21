import { vi } from '@/i18n/vi'
import { useTheme } from '@/lib/use-theme'

export function ThemeToggle() {
  const [theme, toggle] = useTheme()
  const label =
    theme === 'dark'
      ? vi.topbar.toggleThemeToLight
      : vi.topbar.toggleThemeToDark

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className="flex h-11 w-11 items-center justify-center rounded-full text-lg hover:bg-primary-50 dark:hover:bg-slate-800"
    >
      {theme === 'dark' ? '☀️' : '🌙'}
    </button>
  )
}
