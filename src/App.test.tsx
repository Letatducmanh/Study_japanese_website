import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('App', () => {
  it('hiển thị tên website', () => {
    render(<App />)
    expect(
      screen.getByText('🗾 Tự học tiếng Nhật cùng Mạnh'),
    ).toBeInTheDocument()
  })
})
