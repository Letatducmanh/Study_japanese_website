import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi as vitestVi,
} from 'vitest'
import { AppRoutes } from './App'
import { vi } from '@/i18n/vi'

const VALID_MANIFEST = {
  schemaVersion: 1,
  levels: [
    {
      id: 'N5',
      title: 'JLPT N5 — Sơ cấp',
      order: 5,
      books: [
        {
          id: 'mnn1',
          title: 'Minna no Nihongo 1',
          type: 'textbook',
          lessonLabel: 'Bài',
          sources: { vocab: 'n5/mnn1/vocab.md' },
        },
      ],
    },
  ],
}

beforeEach(() => {
  vitestVi.stubGlobal(
    'fetch',
    vitestVi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve(VALID_MANIFEST),
    }),
  )
})

afterEach(() => {
  vitestVi.unstubAllGlobals()
})

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AppRoutes />
    </MemoryRouter>,
  )
}

describe('AppRoutes', () => {
  it('trang chủ hiển thị tên website', () => {
    renderAt('/')
    expect(screen.getAllByText(vi.home.heroTitle).length).toBeGreaterThan(0)
  })

  it('đường dẫn không tồn tại hiện trang 404', () => {
    renderAt('/duong-dan-khong-ton-tai')
    expect(screen.getByText(vi.notFound.title)).toBeInTheDocument()
  })

  it('/about hiển thị nội dung giới thiệu', () => {
    renderAt('/about')
    expect(screen.getByText(vi.about.pageTitle)).toBeInTheDocument()
  })

  it('/n đọc manifest và liệt kê cấp độ (không hard-code N5 trong component)', async () => {
    renderAt('/n')
    expect(await screen.findByText('JLPT N5 — Sơ cấp')).toBeInTheDocument()
  })

  it('đường dẫn chưa làm hiện "Sắp có"', () => {
    renderAt('/stats')
    expect(screen.getByText(vi.comingSoon.title)).toBeInTheDocument()
  })
})
