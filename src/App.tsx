import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Layout } from '@/app/Layout'
import { ComingSoon } from '@/components/ComingSoon'
import { NotFound } from '@/components/NotFound'
import { AboutPage } from '@/features/about/AboutPage'
import { BookPage } from '@/features/browse/BookPage'
import { LessonPage } from '@/features/browse/LessonPage'
import { LevelPage } from '@/features/browse/LevelPage'
import { LevelsPage } from '@/features/browse/LevelsPage'
import { HomePage } from '@/features/home/HomePage'
import { KanjiDetailPage } from '@/features/kanji/KanjiDetailPage'
import { SearchPage } from '@/features/search/SearchPage'
import { SettingsPage } from '@/features/settings/SettingsPage'

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="n" element={<LevelsPage />} />
        <Route path="n/:level" element={<LevelPage />} />
        <Route path="b/:bookId" element={<BookPage />} />
        <Route path="b/:bookId/:lesson" element={<LessonPage />} />
        <Route path="practice/setup" element={<ComingSoon />} />
        <Route path="practice/run" element={<ComingSoon />} />
        <Route path="practice/result/:sessionId" element={<ComingSoon />} />
        <Route path="review" element={<ComingSoon />} />
        <Route path="weak" element={<ComingSoon />} />
        <Route path="mistakes" element={<ComingSoon />} />
        <Route path="kanji/:char" element={<KanjiDetailPage />} />
        <Route path="search" element={<SearchPage />} />
        <Route path="stats" element={<ComingSoon />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="login" element={<ComingSoon />} />
        <Route path="register" element={<ComingSoon />} />
        <Route path="forgot-password" element={<ComingSoon />} />
        <Route path="account" element={<ComingSoon />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}

export default App
