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
import { vi as viText } from '@/i18n/vi'
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

  function spokenText(): string {
    return (speak.mock.calls[0][0] as SpeechSynthesisUtterance).text
  }

  it('đọc chuỗi đã làm sạch: "[お]土産" → "土産"', async () => {
    render(<SpeakButton text="[お]土産" />)
    await userEvent.click(screen.getByRole('button'))
    expect(spokenText()).toBe('土産')
  })

  it('kind="sentence" được chuyển xuống: danh sách → nối bằng 、', async () => {
    render(
      <SpeakButton
        text="行きます（lịch sự）→ 行く（thông thường）"
        kind="sentence"
      />,
    )
    await userEvent.click(screen.getByRole('button'))
    expect(spokenText()).toBe('行きます、行く')
  })

  it('không truyền kind thì dùng word: "晩 / 夜" → "晩"', async () => {
    render(<SpeakButton text="晩 / 夜" />)
    await userEvent.click(screen.getByRole('button'))
    expect(spokenText()).toBe('晩')
  })

  it.each([undefined, 'word', 'sentence'] as const)(
    '[đặc trưng] không đổi nhãn hay nội dung hiển thị (kind=%s)',
    (kind) => {
      render(<SpeakButton text="[お]土産" kind={kind} />)
      const button = screen.getByRole('button', { name: viText.common.speak })
      expect(button).toHaveAttribute('aria-label', viText.common.speak)
      expect(button).toHaveAttribute('title', viText.common.speak)
      // Chỉ có biểu tượng: chuỗi đọc không bao giờ hiện ra màn hình.
      expect(button.textContent).toBe('')
    },
  )

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
