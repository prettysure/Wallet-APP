import { Outlet } from 'react-router-dom'
import { BottomTabs } from './BottomTabs'
import './AppLayout.css'

export function AppLayout() {
  return (
    <div className="app-layout">
      <main className="app-layout-main">
        <Outlet />
      </main>
      <div className="app-layout-tabs">
        <BottomTabs />
      </div>
    </div>
  )
}
