export type Theme = 'light' | 'dark'

const STORAGE_KEY = 'theme'

function systemPrefersDark(): boolean {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

export function getStoredTheme(): Theme | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY)
    return value === 'light' || value === 'dark' ? value : null
  } catch {
    return null
  }
}

export function resolveInitialTheme(): Theme {
  return getStoredTheme() ?? (systemPrefersDark() ? 'dark' : 'light')
}

export function applyTheme(theme: Theme): void {
  document.documentElement.classList.toggle('dark', theme === 'dark')
}

export function storeTheme(theme: Theme): void {
  try {
    localStorage.setItem(STORAGE_KEY, theme)
  } catch {
    // Trình duyệt chặn localStorage (chế độ riêng tư...) — bỏ qua, không chặn trải nghiệm.
  }
}
