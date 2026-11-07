import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi as vitestVi,
} from 'vitest'
import { SpeakButton } from './SpeakButton'

describe('SpeakButton', () => {
  const original = window.speechSynthesis
  let speak: ReturnType<typeof vitestVi.fn>

  beforeEach(() => {
    speak = vitestVi.fn()
    Object.defineProperty(window, 'speechSynthesis', {
      configurable: true,
      value: {
        speak,
        cancel: vitestVi.fn(),
        getVoices: vitestVi
          .fn()
          .mockReturnValue([{ lang: 'ja-JP' } as SpeechSynthesisVoice]),
        addEventListener: vitestVi.fn(),
        removeEventListener: vitestVi.fn(),
      },
    })
  })

  afterEach(() => {
    Object.defineProperty(window, 'speechSynthesis', {
      configurable: true,
      value: original,
    })
  })

  it('bấm nút gọi speak', async () => {
    render(<SpeakButton text="こんにちは" />)
    await userEvent.click(screen.getByRole('button'))
    expect(speak).toHaveBeenCalledOnce()
  })

  it('không có giọng tiếng Nhật thì không hiện nút', () => {
    Object.defineProperty(window, 'speechSynthesis', {
      configurable: true,
      value: {
        speak,
        cancel: vitestVi.fn(),
        getVoices: vitestVi.fn().mockReturnValue([]),
        addEventListener: vitestVi.fn(),
        removeEventListener: vitestVi.fn(),
      },
    })
    render(<SpeakButton text="こんにちは" />)
    expect(screen.queryByRole('button')).toBeNull()
  })
})
