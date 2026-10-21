import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Ruby } from './Ruby'

describe('Ruby', () => {
  it('hiện <ruby>/<rt> khi có reading', () => {
    render(<Ruby base="外国" reading="がいこく" />)
    expect(screen.getByText('がいこく').tagName).toBe('RT')
    expect(screen.getByText((_, el) => el?.tagName === 'RUBY')).toBeTruthy()
  })

  it('không có reading thì chỉ hiện base', () => {
    render(<Ruby base="わたし" />)
    expect(screen.getByText('わたし').tagName).toBe('SPAN')
  })
})
