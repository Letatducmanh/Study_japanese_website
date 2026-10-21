import { useEffect, useState } from 'react'
import {
  applyTheme,
  resolveInitialTheme,
  storeTheme,
  type Theme,
} from './theme'

export function useTheme(): [Theme, () => void] {
  const [theme, setTheme] = useState<Theme>(() => resolveInitialTheme())

  useEffect(() => {
    applyTheme(theme)
    storeTheme(theme)
  }, [theme])

  const toggle = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))

  return [theme, toggle]
}
