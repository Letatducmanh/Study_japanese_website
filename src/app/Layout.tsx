import { Outlet } from 'react-router-dom'
import { BottomNav } from './BottomNav'
import { TopBar } from './TopBar'

export function Layout() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100">
      <TopBar />
      <main className="flex flex-1 flex-col">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
