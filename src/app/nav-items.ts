import { BarChart3, BookOpen, Home, RotateCcw, Target } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { vi } from '@/i18n/vi'

export interface NavItem {
  to: string
  label: string
  Icon: LucideIcon
  end: boolean
}

/** Năm mục điều hướng chính — dùng chung cho BottomNav (mobile) và TopBar (desktop, SPEC mục 7). */
export const navItems: readonly NavItem[] = [
  { to: '/', label: vi.nav.home, Icon: Home, end: true },
  { to: '/n', label: vi.nav.learn, Icon: BookOpen, end: false },
  { to: '/review', label: vi.nav.review, Icon: RotateCcw, end: false },
  { to: '/weak', label: vi.nav.weak, Icon: Target, end: false },
  { to: '/stats', label: vi.nav.stats, Icon: BarChart3, end: false },
]
