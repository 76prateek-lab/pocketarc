import { Outlet } from 'react-router-dom'
import { PwaNotifications } from '@/components/pwa/PwaNotifications'
import { ThemeController } from '@/layouts/ThemeController'

export function PlayLayout() {
  return <><ThemeController/><Outlet/><PwaNotifications/></>
}
