/**
 * Âm thanh phản hồi đúng/sai — tạo bằng Web Audio API (không cần file audio ngoài,
 * vẫn chạy offline). Im lặng nếu trình duyệt không hỗ trợ `AudioContext`.
 */

type AudioContextCtor = typeof AudioContext

function getAudioContextCtor(): AudioContextCtor | null {
  if (typeof window === 'undefined') return null
  return (
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: AudioContextCtor })
      .webkitAudioContext ??
    null
  )
}

let sharedContext: AudioContext | null = null

function getContext(): AudioContext | null {
  const Ctor = getAudioContextCtor()
  if (!Ctor) return null
  if (!sharedContext || sharedContext.state === 'closed') {
    sharedContext = new Ctor()
  }
  if (sharedContext.state === 'suspended') {
    void sharedContext.resume()
  }
  return sharedContext
}

interface ToneStep {
  freq: number
  startOffset: number
  duration: number
}

function playTones(steps: ToneStep[], gainValue: number): void {
  const ctx = getContext()
  if (!ctx) return
  const now = ctx.currentTime
  for (const step of steps) {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(step.freq, now + step.startOffset)
    gain.gain.setValueAtTime(0, now + step.startOffset)
    gain.gain.linearRampToValueAtTime(
      gainValue,
      now + step.startOffset + 0.01,
    )
    gain.gain.exponentialRampToValueAtTime(
      0.001,
      now + step.startOffset + step.duration,
    )
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(now + step.startOffset)
    osc.stop(now + step.startOffset + step.duration + 0.02)
  }
}

/** Hai nốt đi lên vui tai — báo trả lời đúng. */
export function playCorrectSound(): void {
  playTones(
    [
      { freq: 784, startOffset: 0, duration: 0.11 },
      { freq: 1046, startOffset: 0.09, duration: 0.18 },
    ],
    0.15,
  )
}

/** Một nốt trầm ngắn — báo trả lời sai, không chói tai. */
export function playWrongSound(): void {
  playTones([{ freq: 220, startOffset: 0, duration: 0.22 }], 0.12)
}
