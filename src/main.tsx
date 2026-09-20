import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App'
import { installService } from '@/services/installService'
import { pwaService } from '@/services/pwaService'
import '@/styles/global.css'
import { initializeTheme } from '@/services/themeService'

initializeTheme()
installService.initialize()
pwaService.initialize()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode><App /></React.StrictMode>
)
