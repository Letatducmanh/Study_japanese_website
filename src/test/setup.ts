import '@testing-library/jest-dom/vitest'

// jsdom không cài sẵn matchMedia — polyfill tối thiểu cho useTheme (src/lib/theme.ts).
if (typeof window !== 'undefined' && !window.matchMedia) {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList
}
