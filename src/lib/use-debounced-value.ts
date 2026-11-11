import { useEffect, useState } from 'react'

/**
 * Trả về `value` sau khi nó không đổi trong `delayMs` mili giây.
 * Giá trị ban đầu trả ngay; mỗi lần `value` đổi thì hẹn giờ lại (hủy hẹn giờ cũ và khi unmount).
 */
export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs)
    return () => clearTimeout(timer)
  }, [value, delayMs])

  return debounced
}
