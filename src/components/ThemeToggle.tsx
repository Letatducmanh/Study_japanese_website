import { Moon, Sun } from 'lucide-react'
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
      className="flex h-11 w-11 items-center justify-center rounded-full text-ink hover:bg-tint"
    >
      {theme === 'dark' ? (
        <Sun size={22} strokeWidth={2} aria-hidden="true" />
      ) : (
        <Moon size={22} strokeWidth={2} aria-hidden="true" />
      )}
    </button>
  )
}
