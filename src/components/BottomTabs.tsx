import { NavLink } from 'react-router-dom'
import './BottomTabs.css'

const tabs = [
  { path: '/', label: 'Dashboard' },
  { path: '/transactions', label: 'Transactions' },
  { path: '/account', label: 'My account' },
] as const

export function BottomTabs() {
  return (
    <nav className="bottom-tabs" role="navigation" aria-label="Main">
      {tabs.map(({ path, label }) => (
        <NavLink
          key={path}
          to={path}
          end={path === '/'}
          className={({ isActive }) => `bottom-tab ${isActive ? 'bottom-tab--active' : ''}`}
        >
          <span className="bottom-tab-label">{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
