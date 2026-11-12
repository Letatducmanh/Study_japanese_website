import { Volume2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { vi } from '@/i18n/vi'
import {
  hasJapaneseVoice,
  isTtsSupported,
  onVoicesChanged,
  speakJapanese,
} from '@/lib/tts'
import type { SpeakKind } from '@/lib/speakable'

interface SpeakButtonProps {
  text: string
  className?: string
  /** `sentence` cho câu ví dụ ngữ pháp; mặc định `word`. */
  kind?: SpeakKind
}

/** Nút phát âm tiếng Nhật; tự ẩn khi thiết bị không có giọng đọc tiếng Nhật. */
export function SpeakButton({ text, className, kind = 'word' }: SpeakButtonProps) {
  const [available, setAvailable] = useState(() => hasJapaneseVoice())

  useEffect(() => {
    if (!isTtsSupported()) return
    // Giọng đọc thường nạp bất đồng bộ sau lần render đầu — đồng bộ lại ngay khi effect chạy.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAvailable(hasJapaneseVoice())
    return onVoicesChanged(() => setAvailable(hasJapaneseVoice()))
  }, [])

  if (!isTtsSupported() || !available) return null

  return (
    <button
      type="button"
      onClick={() => speakJapanese(text, { kind })}
      aria-label={vi.common.speak}
      title={vi.common.speak}
      className={
        className ??
        'flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-ink hover:bg-tint'
      }
    >
      <Volume2 size={22} strokeWidth={2} aria-hidden="true" />
    </button>
  )
}
