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

// jsdom không cài sẵn Web Speech API — polyfill tối thiểu cho src/lib/tts.ts.
if (typeof window !== 'undefined' && !window.SpeechSynthesisUtterance) {
  class FakeSpeechSynthesisUtterance {
    text: string
    lang = ''
    rate = 1
    voice: SpeechSynthesisVoice | null = null
    constructor(text: string) {
      this.text = text
    }
  }
  Object.defineProperty(window, 'SpeechSynthesisUtterance', {
    configurable: true,
    value: FakeSpeechSynthesisUtterance,
  })
}
