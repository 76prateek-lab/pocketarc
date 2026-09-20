import { BrowserRouter, Navigate, Route, Routes, useParams } from 'react-router-dom'
import { LibraryPage } from '@/pages/LibraryPage/LibraryPage'
import { routes } from '@/routes/routes'
import { DesignSystemPreview } from '@/pages/DesignSystemPreview/DesignSystemPreview'
import { AppLayout } from '@/layouts/AppLayout'
import { GamePage } from '@/pages/GamePage/GamePage'
import { StoragePage } from '@/pages/StoragePage/StoragePage'
import { PlayPage } from '@/pages/PlayPage/PlayPage'
import { SavesPage } from '@/pages/SavesPage/SavesPage'
import { SettingsPage } from '@/pages/SettingsPage/SettingsPage'
import { HomePage } from '@/pages/HomePage/HomePage'
import { CopyrightPage, PrivacyPage, TermsPage } from '@/pages/LegalPage/LegalPage'
import { AboutPage } from '@/pages/AboutPage/AboutPage'
import { PlayLayout } from '@/layouts/PlayLayout'
import { LandingPage } from '@/pages/LandingPage/LandingPage'

function LegacyGameRedirect({ destination }: { destination: 'game' | 'play' }) {
  const { gameId = '' } = useParams()
  return <Navigate replace to={destination === 'game' ? routes.game(gameId) : routes.play(gameId)} />
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={routes.landing} element={<LandingPage />} />
        <Route element={<AppLayout />}>
          <Route path={routes.home} element={<HomePage />} />
          <Route path={routes.library} element={<LibraryPage />} />
          <Route path={routes.gamePattern} element={<GamePage />} />
          <Route path={routes.saves} element={<SavesPage />} />
          <Route path={routes.storage} element={<StoragePage />} />
          <Route path={routes.settings} element={<SettingsPage />} />
          <Route path={routes.about} element={<AboutPage />} />
          <Route path={routes.copyright} element={<CopyrightPage />} />
          <Route path={routes.terms} element={<TermsPage />} />
          <Route path={routes.privacy} element={<PrivacyPage />} />
        </Route>
        <Route element={<PlayLayout />}>
          <Route path={routes.playPattern} element={<PlayPage />} />
        </Route>
        <Route path="/library" element={<Navigate replace to={routes.library} />} />
        <Route path="/game/:gameId" element={<LegacyGameRedirect destination="game" />} />
        <Route path="/play/:gameId" element={<LegacyGameRedirect destination="play" />} />
        <Route path="/saves" element={<Navigate replace to={routes.saves} />} />
        <Route path="/storage" element={<Navigate replace to={routes.storage} />} />
        <Route path="/settings" element={<Navigate replace to={routes.settings} />} />
        {import.meta.env.DEV && <Route path={routes.designSystem} element={<DesignSystemPreview />} />}
      </Routes>
    </BrowserRouter>
  )
}
