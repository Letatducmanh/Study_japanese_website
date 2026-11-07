import { Outlet } from 'react-router-dom'
import { Container } from './Container'
import { BottomNav } from './BottomNav'
import { TopBar } from './TopBar'

/** Container căn giữa (SPEC mục 7) áp dụng cho mọi trang ở đây — các trang không tự đặt bề ngang nữa. */
export function AppShell() {
  return (
    <div className="flex min-h-screen flex-col bg-bg text-ink">
      <TopBar />
      <main className="flex flex-1 flex-col">
        <Container className="flex flex-1 flex-col">
          <Outlet />
        </Container>
      </main>
      <BottomNav />
    </div>
  )
}
