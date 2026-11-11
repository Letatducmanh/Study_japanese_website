import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useDebouncedValue } from './use-debounced-value'

describe('useDebouncedValue', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('giá trị ban đầu trả ngay', () => {
    const { result } = renderHook(() => useDebouncedValue('a', 250))
    expect(result.current).toBe('a')
  })

  it('đổi giá trị thì chưa đổi cho đến khi qua delayMs', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebouncedValue(value, 250),
      { initialProps: { value: 'a' } },
    )
    rerender({ value: 'b' })
    expect(result.current).toBe('a')

    act(() => {
      vi.advanceTimersByTime(249)
    })
    expect(result.current).toBe('a')

    act(() => {
      vi.advanceTimersByTime(1)
    })
    expect(result.current).toBe('b')
  })

  it('đổi liên tiếp trong khoảng chờ chỉ lấy giá trị cuối, tính từ lần đổi cuối', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebouncedValue(value, 250),
      { initialProps: { value: '' } },
    )
    for (const v of ['s', 'si', 'sin', 'sinh']) {
      rerender({ value: v })
      act(() => {
        vi.advanceTimersByTime(100) // chưa đủ 250 ms sau mỗi lần đổi
      })
      expect(result.current).toBe('')
    }

    act(() => {
      vi.advanceTimersByTime(149) // 249 ms kể từ lần đổi cuối
    })
    expect(result.current).toBe('')
    act(() => {
      vi.advanceTimersByTime(1)
    })
    expect(result.current).toBe('sinh')
  })

  it('hủy hẹn giờ khi unmount', () => {
    const clear = vi.spyOn(globalThis, 'clearTimeout')
    const { rerender, unmount } = renderHook(
      ({ value }) => useDebouncedValue(value, 250),
      { initialProps: { value: 'a' } },
    )
    rerender({ value: 'b' })
    const before = clear.mock.calls.length
    unmount()
    expect(clear.mock.calls.length).toBeGreaterThan(before)
    clear.mockRestore()
  })
})
